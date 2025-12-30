export type ProjectStatus = 'development' | 'production' | 'obsolete' | 'archived';

export type ProjectType = 'web-app' | 'ai-agent' | 'automation' | 'data-analysis' | 'library' | 'api' | 'tool';

export interface Technology {
  name: string;
  version?: string;
  category: 'frontend' | 'backend' | 'database' | 'deployment' | 'automation' | 'ai-ml';
}

export interface GitRepository {
  url?: string;
  branch: string;
  lastCommit: Date;
  commitCount: number;
  contributors: string[];
  isGitRepo: boolean;
}

export interface DeploymentInfo {
  platform: 'coolify' | 'vercel' | 'n8n' | 'other';
  url?: string;
  status: 'active' | 'inactive' | 'error';
  lastDeployed?: Date;
  environment: 'production' | 'staging' | 'development';
}

export interface Dependency {
  name: string;
  version: string;
  type: 'npm' | 'pip' | 'other';
  isDev: boolean;
}

export interface ProjectMetrics {
  users?: number;
  posts?: number;
  revenue?: number;
  uptime?: number;
  responseTime?: number;
}

export interface EvolutionEvent {
  id: string;
  timestamp: Date;
  type: 'created' | 'updated' | 'status_changed' | 'deployed' | 'archived';
  description: string;
  metadata?: Record<string, any>;
}

export interface EvolutionHistory {
  events: EvolutionEvent[];
  totalCommits: number;
  totalFiles: number;
  totalSize: number;
  growthRate: number; // percentage per month
  lastActivity: Date;
}

export interface Project {
  id: string;
  name: string;
  description?: string;
  status: ProjectStatus;
  type: ProjectType;
  path: string;
  technologies: Technology[];
  repository?: GitRepository;
  deployment?: DeploymentInfo;
  dependencies: Dependency[];
  metrics?: ProjectMetrics;
  evolution: EvolutionHistory;
  lastScanned: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface ScanResult {
  timestamp: Date;
  duration: number;
  projectsFound: number;
  projectsUpdated: number;
  errors: string[];
  newProjects: string[];
  statusChanges: Array<{
    projectId: string;
    oldStatus: ProjectStatus;
    newStatus: ProjectStatus;
  }>;
}

export interface ScanOptions {
  path: string;
  recursive: boolean;
  includeObsolete: boolean;
  forceRefresh: boolean;
  verbose: boolean;
}