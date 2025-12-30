#!/usr/bin/env node

import { Command } from 'commander';
import { ProjectScanner } from '../scanner';
import { getDatabaseConnection, closeDatabaseConnection } from '../database/connection';

const program = new Command();

program
  .name('imparlabs-dashboard')
  .description('Project Portfolio Management System for IMPAR Labs')
  .version('1.0.0');

program
  .command('scan')
  .description('Scan and catalog all projects')
  .option('-p, --path <path>', 'Path to scan', '/var/home/paulo/Documentos/IMPAR/1 - PROJECTOS')
  .option('-r, --recursive', 'Scan recursively', true)
  .option('-o, --include-obsolete', 'Include obsolete projects', true)
  .option('-f, --force-refresh', 'Force refresh all projects', false)
  .option('-v, --verbose', 'Verbose output', false)
  .action(async (options) => {
    console.log('🔍 Starting project scan...');

    const scanner = new ProjectScanner(options.path);

    try {
      const result = await scanner.scan({
        path: options.path,
        recursive: options.recursive,
        includeObsolete: options.includeObsolete,
        forceRefresh: options.forceRefresh,
        verbose: options.verbose
      });

      console.log('✅ Scan completed successfully!');
      console.log(`📊 Found ${result.projectsFound} projects`);
      console.log(`🔄 Updated ${result.projectsUpdated} projects`);
      console.log(`⏱️  Duration: ${result.duration}ms`);

      if (result.newProjects.length > 0) {
        console.log(`🆕 New projects: ${result.newProjects.join(', ')}`);
      }

      if (result.statusChanges.length > 0) {
        console.log('📈 Status changes:');
        result.statusChanges.forEach(change => {
          console.log(`  ${change.projectId}: ${change.oldStatus} → ${change.newStatus}`);
        });
      }

      if (result.errors.length > 0) {
        console.log('⚠️  Errors encountered:');
        result.errors.forEach(error => console.log(`  ❌ ${error}`));
      }

    } catch (error) {
      console.error('❌ Scan failed:', error instanceof Error ? error.message : String(error));
      process.exit(1);
    } finally {
      await closeDatabaseConnection();
    }
  });

program
  .command('list')
  .description('List all tracked projects')
  .option('-s, --status <status>', 'Filter by status (development|production|obsolete)')
  .option('-t, --type <type>', 'Filter by type (web-app|ai-agent|automation|data-analysis)')
  .option('-v, --verbose', 'Show detailed information', false)
  .action(async (options) => {
    try {
      const db = await getDatabaseConnection();

      let query = 'SELECT * FROM projects';
      const params: any[] = [];
      const conditions: string[] = [];

      if (options.status) {
        conditions.push('status = ?');
        params.push(options.status);
      }

      if (options.type) {
        conditions.push('type = ?');
        params.push(options.type);
      }

      if (conditions.length > 0) {
        query += ' WHERE ' + conditions.join(' AND ');
      }

      query += ' ORDER BY updated_at DESC';

      const projects = await db.all(query, params);

      if (projects.length === 0) {
        console.log('No projects found.');
        return;
      }

      console.log(`📋 Found ${projects.length} projects:\n`);

      projects.forEach((project: any, index: number) => {
        console.log(`${index + 1}. ${project.name}`);
        console.log(`   Status: ${project.status}`);
        console.log(`   Type: ${project.type}`);
        console.log(`   Path: ${project.path}`);

        if (options.verbose) {
          console.log(`   Last scanned: ${new Date(project.last_scanned).toLocaleString()}`);
          console.log(`   Technologies: ${JSON.parse(project.technologies || '[]').map((t: any) => t.name).join(', ') || 'None detected'}`);
        }

        console.log('');
      });

    } catch (error) {
      console.error('❌ Failed to list projects:', error instanceof Error ? error.message : String(error));
      process.exit(1);
    } finally {
      await closeDatabaseConnection();
    }
  });

program
  .command('stats')
  .description('Show database statistics')
  .action(async () => {
    try {
      const db = await getDatabaseConnection();
      const stats = await db.getStats();

      console.log('📊 Database Statistics:');
      console.log(`   Projects: ${stats.projects}`);
      console.log(`   Technologies: ${stats.technologies}`);
      console.log(`   Evolution Events: ${stats.evolutionEvents}`);
      console.log(`   Scans: ${stats.scans}`);
      console.log(`   Database Size: ${(stats.databaseSize / 1024).toFixed(2)} KB`);

    } catch (error) {
      console.error('❌ Failed to get stats:', error instanceof Error ? error.message : String(error));
      process.exit(1);
    } finally {
      await closeDatabaseConnection();
    }
  });

program
  .command('backup')
  .description('Create database backup')
  .option('-o, --output <path>', 'Output path for backup')
  .action(async (options) => {
    try {
      const db = await getDatabaseConnection();
      const backupPath = await db.backup(options.output);

      console.log(`✅ Database backed up to: ${backupPath}`);

    } catch (error) {
      console.error('❌ Backup failed:', error instanceof Error ? error.message : String(error));
      process.exit(1);
    } finally {
      await closeDatabaseConnection();
    }
  });

// Error handling
program.on('command:*', (unknownCommand) => {
  console.error(`❌ Unknown command: ${unknownCommand[0]}`);
  console.log('Run with --help to see available commands');
  process.exit(1);
});

// If no command provided, show help
if (process.argv.length === 2) {
  program.help();
}

program.parse(process.argv);