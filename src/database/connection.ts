import sqlite3 from 'sqlite3';
import path from 'path';
import fs from 'fs-extra';
import { DATABASE_SCHEMA } from './schema';

export class DatabaseConnection {
  private db: sqlite3.Database | null = null;
  private dbPath: string;

  constructor(dbPath: string = './data/projects.db') {
    this.dbPath = path.resolve(dbPath);
  }

  async initialize(): Promise<void> {
    // Ensure data directory exists
    const dataDir = path.dirname(this.dbPath);
    await fs.ensureDir(dataDir);

    // Open database
    this.db = new sqlite3.Database(this.dbPath);

    // Enable foreign keys and WAL mode for better performance
    await this.run('PRAGMA foreign_keys = ON;');
    await this.run('PRAGMA journal_mode = WAL;');

    // Create tables - execute each statement individually
    const statements = DATABASE_SCHEMA.split(';').filter(stmt => stmt.trim().length > 0);
    for (const statement of statements) {
      if (statement.trim()) {
        await this.run(statement.trim() + ';');
      }
    }

    console.log(`Database initialized at ${this.dbPath}`);
  }

  async close(): Promise<void> {
    if (this.db) {
      return new Promise((resolve, reject) => {
        this.db!.close((err) => {
          if (err) reject(err);
          else {
            this.db = null;
            resolve();
          }
        });
      });
    }
  }

  getDatabase(): sqlite3.Database {
    if (!this.db) {
      throw new Error('Database not initialized. Call initialize() first.');
    }
    return this.db;
  }

  async get(sql: string, params: any[] = []): Promise<any> {
    return new Promise((resolve, reject) => {
      this.db!.get(sql, params, (err, row) => {
        if (err) reject(err);
        else resolve(row);
      });
    });
  }

  async all(sql: string, params: any[] = []): Promise<any[]> {
    return new Promise((resolve, reject) => {
      this.db!.all(sql, params, (err, rows) => {
        if (err) reject(err);
        else resolve(rows);
      });
    });
  }

  async run(sql: string, params: any[] = []): Promise<void> {
    return new Promise((resolve, reject) => {
      this.db!.run(sql, params, function(err) {
        if (err) reject(err);
        else resolve();
      });
    });
  }

  async backup(backupPath?: string): Promise<string> {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const backupFile = backupPath || `./data/backup-${timestamp}.db`;

    const backupDir = path.dirname(backupFile);
    await fs.ensureDir(backupDir);

    await fs.copy(this.dbPath, backupFile);
    console.log(`Database backed up to ${backupFile}`);

    return backupFile;
  }

  async getStats(): Promise<{
    projects: number;
    technologies: number;
    evolutionEvents: number;
    scans: number;
    databaseSize: number;
  }> {
    const projects = await this.get('SELECT COUNT(*) as count FROM projects');
    const technologies = await this.get('SELECT COUNT(*) as count FROM technologies');
    const evolutionEvents = await this.get('SELECT COUNT(*) as count FROM evolution_events');
    const scans = await this.get('SELECT COUNT(*) as count FROM scans');

    let databaseSize = 0;
    try {
      const stats = await fs.stat(this.dbPath);
      databaseSize = stats.size;
    } catch (error) {
      console.warn('Could not get database file size:', error);
    }

    return {
      projects: (projects as any)?.count || 0,
      technologies: (technologies as any)?.count || 0,
      evolutionEvents: (evolutionEvents as any)?.count || 0,
      scans: (scans as any)?.count || 0,
      databaseSize
    };
  }
}

// Singleton instance
let dbConnection: DatabaseConnection | null = null;

export async function getDatabaseConnection(dbPath?: string): Promise<DatabaseConnection> {
  if (!dbConnection) {
    dbConnection = new DatabaseConnection(dbPath);
    await dbConnection.initialize();
  }
  return dbConnection;
}

export async function closeDatabaseConnection(): Promise<void> {
  if (dbConnection) {
    await dbConnection.close();
    dbConnection = null;
  }
}