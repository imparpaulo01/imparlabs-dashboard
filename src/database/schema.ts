import { Project, ScanResult, EvolutionEvent } from '../types';

export const DATABASE_SCHEMA = `
-- Projects table
CREATE TABLE IF NOT EXISTS projects (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  status TEXT NOT NULL CHECK (status IN ('development', 'production', 'obsolete', 'archived')),
  type TEXT NOT NULL CHECK (type IN ('web-app', 'ai-agent', 'automation', 'data-analysis', 'library', 'api', 'tool')),
  path TEXT NOT NULL,
  technologies TEXT, -- JSON array
  repository TEXT, -- JSON object
  deployment TEXT, -- JSON object
  dependencies TEXT, -- JSON array
  metrics TEXT, -- JSON object
  evolution TEXT NOT NULL, -- JSON object
  last_scanned DATETIME NOT NULL,
  created_at DATETIME NOT NULL,
  updated_at DATETIME NOT NULL
);

-- Technologies catalog
CREATE TABLE IF NOT EXISTS technologies (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL UNIQUE,
  category TEXT NOT NULL CHECK (category IN ('frontend', 'backend', 'database', 'deployment', 'automation', 'ai-ml')),
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Project technologies junction table
CREATE TABLE IF NOT EXISTS project_technologies (
  project_id TEXT NOT NULL,
  technology_id INTEGER NOT NULL,
  version TEXT,
  FOREIGN KEY (project_id) REFERENCES projects (id) ON DELETE CASCADE,
  FOREIGN KEY (technology_id) REFERENCES technologies (id) ON DELETE CASCADE,
  PRIMARY KEY (project_id, technology_id)
);

-- Evolution events
CREATE TABLE IF NOT EXISTS evolution_events (
  id TEXT PRIMARY KEY,
  project_id TEXT NOT NULL,
  timestamp DATETIME NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('created', 'updated', 'status_changed', 'deployed', 'archived')),
  description TEXT NOT NULL,
  metadata TEXT, -- JSON object
  FOREIGN KEY (project_id) REFERENCES projects (id) ON DELETE CASCADE
);

-- Scan history
CREATE TABLE IF NOT EXISTS scans (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  timestamp DATETIME NOT NULL,
  duration INTEGER NOT NULL, -- milliseconds
  projects_found INTEGER NOT NULL,
  projects_updated INTEGER NOT NULL,
  errors TEXT, -- JSON array
  new_projects TEXT, -- JSON array
  status_changes TEXT -- JSON array
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_projects_status ON projects(status);
CREATE INDEX IF NOT EXISTS idx_projects_type ON projects(type);
CREATE INDEX IF NOT EXISTS idx_projects_last_scanned ON projects(last_scanned);
CREATE INDEX IF NOT EXISTS idx_evolution_events_project_id ON evolution_events(project_id);
CREATE INDEX IF NOT EXISTS idx_evolution_events_timestamp ON evolution_events(timestamp);
CREATE INDEX IF NOT EXISTS idx_scans_timestamp ON scans(timestamp);
`;

export const MIGRATIONS = [
  // Future migrations can be added here
  // Each migration should be a SQL string that can be executed safely multiple times
];

export interface DatabaseRow {
  // Projects table
  id: string;
  name: string;
  description?: string;
  status: string;
  type: string;
  path: string;
  technologies: string; // JSON
  repository?: string; // JSON
  deployment?: string; // JSON
  dependencies: string; // JSON
  metrics?: string; // JSON
  evolution: string; // JSON
  last_scanned: string;
  created_at: string;
  updated_at: string;
}

export interface TechnologyRow {
  id: number;
  name: string;
  category: string;
  created_at: string;
}

export interface EvolutionEventRow {
  id: string;
  project_id: string;
  timestamp: string;
  type: string;
  description: string;
  metadata?: string;
}

export interface ScanRow {
  id: number;
  timestamp: string;
  duration: number;
  projects_found: number;
  projects_updated: number;
  errors: string;
  new_projects: string;
  status_changes: string;
}