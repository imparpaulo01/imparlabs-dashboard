import fs from 'fs-extra';
import path from 'path';
import glob from 'glob';
import { Project, ScanOptions, ScanResult, ProjectStatus, ProjectType } from '../types';
import { getDatabaseConnection } from '../database/connection';

export class ProjectScanner {
  private basePath: string;
  private dbConnection: any;

  constructor(basePath: string = '/var/home/paulo/Documentos/IMPAR/1 - PROJECTOS') {
    this.basePath = path.resolve(basePath);
  }

  async scan(options: ScanOptions = {
    path: this.basePath,
    recursive: true,
    includeObsolete: true,
    forceRefresh: false,
    verbose: false
  }): Promise<ScanResult> {
    const startTime = Date.now();
    this.dbConnection = await getDatabaseConnection();

    if (options.verbose) {
      console.log(`Starting project scan at ${options.path}`);
    }

    try {
      // Discover all projects
      const projects = await this.discoverProjects(options);

      if (options.verbose) {
        console.log(`Found ${projects.length} projects`);
      }

      // Process each project
      const results = await this.processProjects(projects, options);

      // Save scan results
      const scanResult: ScanResult = {
        timestamp: new Date(),
        duration: Date.now() - startTime,
        projectsFound: projects.length,
        projectsUpdated: results.updated,
        errors: results.errors,
        newProjects: results.newProjects,
        statusChanges: results.statusChanges
      };

      await this.saveScanResult(scanResult);

      if (options.verbose) {
        console.log(`Scan completed in ${scanResult.duration}ms`);
        console.log(`Updated ${results.updated} projects`);
        if (results.errors.length > 0) {
          console.log(`Encountered ${results.errors.length} errors`);
        }
      }

      return scanResult;

    } catch (error) {
      console.error('Scan failed:', error);
      throw error;
    }
  }

  private async discoverProjects(options: ScanOptions): Promise<string[]> {
    const projectPaths: string[] = [];

    // Scan main directories
    const directories = [
      '1 - PROJECTOS EM DEV',
      '2 - PROJECTOS EM PROD',
      ...(options.includeObsolete ? ['3 - OBSOLETE'] : [])
    ];

    for (const dir of directories) {
      const dirPath = path.join(this.basePath, dir);
      if (await fs.pathExists(dirPath)) {
        const items = await fs.readdir(dirPath);
        for (const item of items) {
          const itemPath = path.join(dirPath, item);
          const stat = await fs.stat(itemPath);

          if (stat.isDirectory()) {
            // Check if this looks like a project directory
            if (await this.isProjectDirectory(itemPath)) {
              projectPaths.push(itemPath);
            }
          }
        }
      }
    }

    return projectPaths;
  }

  private async isProjectDirectory(dirPath: string): Promise<boolean> {
    // Check for common project indicators
    const indicators = [
      'package.json',
      'README.md',
      'CLAUDE.md',
      '.git',
      'requirements.txt',
      'pyproject.toml',
      'Dockerfile',
      'docker-compose.yml'
    ];

    for (const indicator of indicators) {
      if (await fs.pathExists(path.join(dirPath, indicator))) {
        return true;
      }
    }

    // Check if directory has subdirectories (might be a project group)
    const items = await fs.readdir(dirPath);
    const subdirs = items.filter(async item => {
      const itemPath = path.join(dirPath, item);
      return (await fs.stat(itemPath)).isDirectory();
    });

    return subdirs.length > 0;
  }

  private async processProjects(projectPaths: string[], options: ScanOptions): Promise<{
    updated: number;
    errors: string[];
    newProjects: string[];
    statusChanges: Array<{projectId: string, oldStatus: ProjectStatus, newStatus: ProjectStatus}>;
  }> {
    let updated = 0;
    const errors: string[] = [];
    const newProjects: string[] = [];
    const statusChanges: Array<{projectId: string, oldStatus: ProjectStatus, newStatus: ProjectStatus}> = [];

    for (const projectPath of projectPaths) {
      try {
        const project = await this.analyzeProject(projectPath);

        if (project) {
          const isNew = await this.isNewProject(project.id);
          const statusChanged = await this.checkStatusChange(project);

          if (isNew) {
            newProjects.push(project.id);
          }

          if (statusChanged) {
            statusChanges.push(statusChanged);
          }

          await this.saveProject(project);
          updated++;

          if (options.verbose) {
            console.log(`Processed: ${project.name} (${project.status})`);
          }
        }
      } catch (error) {
        const errorMsg = `Failed to process ${projectPath}: ${error instanceof Error ? error.message : String(error)}`;
        errors.push(errorMsg);
        console.error(errorMsg);
      }
    }

    return { updated, errors, newProjects, statusChanges };
  }

  private async analyzeProject(projectPath: string): Promise<Project | null> {
    const projectName = path.basename(projectPath);
    const projectId = this.generateProjectId(projectPath);

    // Determine status based on path
    const status = this.determineStatus(projectPath);

    // Determine type based on contents
    const type = await this.determineType(projectPath);

    // Extract technologies
    const technologies = await this.detectTechnologies(projectPath);

    // Extract repository info
    const repository = await this.analyzeRepository(projectPath);

    // Extract deployment info
    const deployment = await this.extractDeploymentInfo(projectPath);

    // Extract dependencies
    const dependencies = await this.extractDependencies(projectPath);

    // Create evolution history
    const evolution = await this.buildEvolutionHistory(projectPath);

    const project: Project = {
      id: projectId,
      name: projectName,
      path: projectPath,
      status,
      type,
      technologies,
      repository,
      deployment,
      dependencies,
      evolution,
      lastScanned: new Date(),
      createdAt: new Date(), // Will be updated from DB if exists
      updatedAt: new Date()
    };

    return project;
  }

  private generateProjectId(projectPath: string): string {
    // Create a stable ID from the path
    const relativePath = path.relative(this.basePath, projectPath);
    return relativePath.toLowerCase().replace(/[^a-z0-9]/g, '-');
  }

  private determineStatus(projectPath: string): ProjectStatus {
    const relativePath = path.relative(this.basePath, projectPath);

    if (relativePath.includes('PROD') || relativePath.includes('EM PROD')) {
      return 'production';
    } else if (relativePath.includes('OBSOLETE')) {
      return 'obsolete';
    } else {
      return 'development';
    }
  }

  private async determineType(projectPath: string): Promise<ProjectType> {
    const projectName = path.basename(projectPath).toLowerCase();

    // Check for web applications
    if (await fs.pathExists(path.join(projectPath, 'package.json'))) {
      try {
        const packageJson = await fs.readJson(path.join(projectPath, 'package.json'));
        const deps = { ...packageJson.dependencies, ...packageJson.devDependencies };

        // Web frameworks indicate web apps
        if (deps['next'] || deps['react'] || deps['vue'] || deps['svelte'] || deps['angular']) {
          return 'web-app';
        }

        // Express/FastAPI indicate APIs
        if (deps['express'] || deps['fastify'] || deps['@nestjs/core']) {
          return 'api';
        }

        // n8n indicates automation
        if (deps['n8n']) {
          return 'automation';
        }
      } catch (error) {
        // Ignore JSON parse errors
      }
    }

    // Python projects
    if (await fs.pathExists(path.join(projectPath, 'requirements.txt')) ||
        await fs.pathExists(path.join(projectPath, 'pyproject.toml'))) {

      // Check for AI/ML indicators in project name or content
      if (projectName.includes('ai') || projectName.includes('ml') || projectName.includes('agent') ||
          projectName.includes('análise') || projectName.includes('analysis') ||
          projectName.includes('leadgen') || projectName.includes('seo')) {
        return 'ai-agent';
      }

      // Check for web frameworks
      try {
        let content = '';
        if (await fs.pathExists(path.join(projectPath, 'requirements.txt'))) {
          content = await fs.readFile(path.join(projectPath, 'requirements.txt'), 'utf-8');
        } else if (await fs.pathExists(path.join(projectPath, 'pyproject.toml'))) {
          content = await fs.readFile(path.join(projectPath, 'pyproject.toml'), 'utf-8');
        }

        if (content.includes('fastapi') || content.includes('flask') || content.includes('django')) {
          return 'api';
        }

        // Data science libraries suggest data analysis
        if (content.includes('pandas') || content.includes('numpy') || content.includes('scikit-learn')) {
          return 'data-analysis';
        }

      } catch (error) {
        // Ignore file read errors
      }

      // Check for AI-related project names or n8n integration
      if (projectName.includes('ai') || projectName.includes('ml') || projectName.includes('agent') ||
          projectName.includes('análise') || projectName.includes('analysis') ||
          projectName.includes('leadgen') || projectName.includes('seo') ||
          await fs.pathExists(path.join(projectPath, 'n8n')) ||
          await fs.pathExists(path.join(projectPath, 'prompts'))) {
        return 'ai-agent';
      }

      // Default Python projects as tools
      return 'tool';
    }

    // Check for data analysis projects
    if (await fs.pathExists(path.join(projectPath, '.csv')) ||
        await fs.pathExists(path.join(projectPath, '.xlsx')) ||
        projectName.includes('dataset') || projectName.includes('data')) {
      return 'data-analysis';
    }

    // Check for automation projects
    if (await fs.pathExists(path.join(projectPath, 'n8n'))) {
      return 'automation';
    }

    // Check for library projects
    if (await fs.pathExists(path.join(projectPath, 'lib')) ||
        await fs.pathExists(path.join(projectPath, 'src')) &&
        await fs.pathExists(path.join(projectPath, 'package.json'))) {
      try {
        const packageJson = await fs.readJson(path.join(projectPath, 'package.json'));
        if (packageJson.main || packageJson.module || packageJson.exports) {
          return 'library';
        }
      } catch (error) {
        // Ignore
      }
    }

    // Default fallback
    return 'tool';
  }

  private async detectTechnologies(projectPath: string): Promise<any[]> {
    const technologies: any[] = [];

    // Check package.json for Node.js/JavaScript projects
    if (await fs.pathExists(path.join(projectPath, 'package.json'))) {
      try {
        const packageJson = await fs.readJson(path.join(projectPath, 'package.json'));
        const deps = { ...packageJson.dependencies, ...packageJson.devDependencies };

        // Frontend frameworks
        if (deps['next']) technologies.push({ name: 'Next.js', category: 'frontend' });
        if (deps['react']) technologies.push({ name: 'React', category: 'frontend' });
        if (deps['vue']) technologies.push({ name: 'Vue.js', category: 'frontend' });
        if (deps['svelte']) technologies.push({ name: 'Svelte', category: 'frontend' });
        if (deps['angular']) technologies.push({ name: 'Angular', category: 'frontend' });

        // Build tools
        if (deps['vite']) technologies.push({ name: 'Vite', category: 'frontend' });
        if (deps['webpack']) technologies.push({ name: 'Webpack', category: 'frontend' });

        // UI libraries
        if (deps['tailwindcss']) technologies.push({ name: 'Tailwind CSS', category: 'frontend' });
        if (deps['@shadcn/ui']) technologies.push({ name: 'shadcn/ui', category: 'frontend' });
        if (deps['@mui/material']) technologies.push({ name: 'Material-UI', category: 'frontend' });

        // Languages
        if (deps['typescript']) technologies.push({ name: 'TypeScript', category: 'frontend' });
        if (packageJson.type === 'module' || deps['esm']) technologies.push({ name: 'ES Modules', category: 'frontend' });

        // Backend/Node.js
        if (deps['express']) technologies.push({ name: 'Express.js', category: 'backend' });
        if (deps['fastify']) technologies.push({ name: 'Fastify', category: 'backend' });
        if (deps['@nestjs/core']) technologies.push({ name: 'NestJS', category: 'backend' });

        // Databases
        if (deps['mongoose']) technologies.push({ name: 'MongoDB', category: 'database' });
        if (deps['pg']) technologies.push({ name: 'PostgreSQL', category: 'database' });
        if (deps['mysql']) technologies.push({ name: 'MySQL', category: 'database' });
        if (deps['sqlite3']) technologies.push({ name: 'SQLite', category: 'database' });

        // AI/ML
        if (deps['openai']) technologies.push({ name: 'OpenAI', category: 'ai-ml' });
        if (deps['@anthropic-ai/sdk']) technologies.push({ name: 'Anthropic Claude', category: 'ai-ml' });
        if (deps['@google/generative-ai']) technologies.push({ name: 'Google Gemini', category: 'ai-ml' });
        if (deps['mistralai']) technologies.push({ name: 'Mistral AI', category: 'ai-ml' });
        if (deps['groq-sdk']) technologies.push({ name: 'Groq', category: 'ai-ml' });

        // Automation & Integration
        if (deps['n8n']) technologies.push({ name: 'n8n', category: 'automation' });
        if (deps['puppeteer']) technologies.push({ name: 'Puppeteer', category: 'automation' });
        if (deps['playwright']) technologies.push({ name: 'Playwright', category: 'automation' });

        // Deployment & DevOps
        if (deps['vercel']) technologies.push({ name: 'Vercel', category: 'deployment' });
        if (deps['coolify']) technologies.push({ name: 'Coolify', category: 'deployment' });

      } catch (error) {
        // Ignore JSON parse errors
      }
    }

    // Check for Python projects (in root or scripts directory)
    const pythonIndicators = [
      path.join(projectPath, 'requirements.txt'),
      path.join(projectPath, 'pyproject.toml'),
      path.join(projectPath, 'scripts', 'requirements.txt'),
      path.join(projectPath, 'Pipfile')
    ];

    let pythonProject = false;
    let requirementsPath = '';

    for (const indicator of pythonIndicators) {
      if (await fs.pathExists(indicator)) {
        pythonProject = true;
        requirementsPath = indicator;
        break;
      }
    }

    if (pythonProject) {
      try {
        const requirements = await fs.readFile(requirementsPath, 'utf-8');
        const deps = requirements.split('\n').map(line => line.trim()).filter(line => line && !line.startsWith('#'));

        // AI/ML Python libraries
        if (deps.some(dep => dep.includes('openai'))) technologies.push({ name: 'OpenAI Python', category: 'ai-ml' });
        if (deps.some(dep => dep.includes('anthropic'))) technologies.push({ name: 'Anthropic Python', category: 'ai-ml' });
        if (deps.some(dep => dep.includes('google-generativeai'))) technologies.push({ name: 'Google Gemini Python', category: 'ai-ml' });
        if (deps.some(dep => dep.includes('mistral'))) technologies.push({ name: 'Mistral AI Python', category: 'ai-ml' });
        if (deps.some(dep => dep.includes('groq'))) technologies.push({ name: 'Groq Python', category: 'ai-ml' });

        // Web frameworks
        if (deps.some(dep => dep.includes('fastapi'))) technologies.push({ name: 'FastAPI', category: 'backend' });
        if (deps.some(dep => dep.includes('flask'))) technologies.push({ name: 'Flask', category: 'backend' });
        if (deps.some(dep => dep.includes('django'))) technologies.push({ name: 'Django', category: 'backend' });

        // Data science
        if (deps.some(dep => dep.includes('pandas'))) technologies.push({ name: 'Pandas', category: 'ai-ml' });
        if (deps.some(dep => dep.includes('numpy'))) technologies.push({ name: 'NumPy', category: 'ai-ml' });
        if (deps.some(dep => dep.includes('scikit-learn'))) technologies.push({ name: 'Scikit-learn', category: 'ai-ml' });
        if (deps.some(dep => dep.includes('tensorflow'))) technologies.push({ name: 'TensorFlow', category: 'ai-ml' });
        if (deps.some(dep => dep.includes('pytorch'))) technologies.push({ name: 'PyTorch', category: 'ai-ml' });

      } catch (error) {
        // Ignore file read errors
      }
    }

    // pyproject.toml detection is now handled above in the unified Python detection

    // Check for Docker
    if (await fs.pathExists(path.join(projectPath, 'Dockerfile'))) {
      technologies.push({ name: 'Docker', category: 'deployment' });
    }

    if (await fs.pathExists(path.join(projectPath, 'docker-compose.yml'))) {
      technologies.push({ name: 'Docker Compose', category: 'deployment' });
    }

    // Check for Git
    if (await fs.pathExists(path.join(projectPath, '.git'))) {
      technologies.push({ name: 'Git', category: 'deployment' });
    }

    // Check for n8n workflows (JSON files in n8n directory or root)
    if (await fs.pathExists(path.join(projectPath, 'n8n'))) {
      technologies.push({ name: 'n8n', category: 'automation' });
    }

    // Check for workflow JSON files
    try {
      const files = await fs.readdir(projectPath);
      if (files.some(file => file.endsWith('.json') && (file.includes('workflow') || file.includes('n8n')))) {
        if (!technologies.some(t => t.name === 'n8n')) {
          technologies.push({ name: 'n8n', category: 'automation' });
        }
      }
    } catch (error) {
      // Ignore directory read errors
    }

    // Check for AI prompts directory
    if (await fs.pathExists(path.join(projectPath, 'prompts'))) {
      technologies.push({ name: 'AI Prompts', category: 'ai-ml' });
    }

    // Check for database schemas (indicates data processing)
    if (await fs.pathExists(path.join(projectPath, 'database')) ||
        await fs.pathExists(path.join(projectPath, 'schema'))) {
      technologies.push({ name: 'Database Integration', category: 'backend' });
    }

    // Check for image processing (LinkedIn posts, etc.)
    const projectName = path.basename(projectPath).toLowerCase();
    if (await fs.pathExists(path.join(projectPath, 'templates')) ||
        projectName.includes('image') || projectName.includes('linkedin')) {
      technologies.push({ name: 'Image Processing', category: 'automation' });
    }

    // Remove duplicates
    const uniqueTechnologies = technologies.filter((tech, index, self) =>
      index === self.findIndex(t => t.name === tech.name && t.category === tech.category)
    );

    return uniqueTechnologies;
  }

  private async analyzeRepository(projectPath: string): Promise<any> {
    const gitPath = path.join(projectPath, '.git');

    if (!(await fs.pathExists(gitPath))) {
      return { isGitRepo: false };
    }

    try {
      // Get current branch
      let branch = 'main';
      try {
        const headPath = path.join(gitPath, 'HEAD');
        if (await fs.pathExists(headPath)) {
          const headContent = await fs.readFile(headPath, 'utf-8');
          if (headContent.startsWith('ref: refs/heads/')) {
            branch = headContent.split('/').pop()?.trim() || 'main';
          }
        }
      } catch (error) {
        // Keep default branch
      }

      // Get last commit date and info
      let lastCommit = new Date();
      let commitCount = 0;
      let contributors: string[] = [];

      try {
        const logsPath = path.join(gitPath, 'logs', 'HEAD');
        if (await fs.pathExists(logsPath)) {
          const logContent = await fs.readFile(logsPath, 'utf-8');
          const lines = logContent.split('\n').filter(line => line.trim());

          commitCount = lines.length;

          if (lines.length > 0) {
            // Parse the last commit line to get date
            const lastLine = lines[lines.length - 1];
            const parts = lastLine.split(' ');
            if (parts.length >= 6) {
              // Git log format: timestamp is at index 4 for older format, 5 for newer
              const timestamp = parseInt(parts[4]) || parseInt(parts[5]);
              if (timestamp) {
                lastCommit = new Date(timestamp * 1000);
              }
            }

            // Extract unique contributors from all log lines
            const contributorSet = new Set<string>();
            lines.forEach(line => {
              const emailMatch = line.match(/<([^>]+)>/);
              if (emailMatch) {
                contributorSet.add(emailMatch[1]);
              }
            });
            contributors = Array.from(contributorSet);
          }
        }
      } catch (error) {
        // Git log parsing failed, use basic info
        commitCount = 1; // At least has commits if .git exists
        contributors = ['unknown'];
      }

      return {
        isGitRepo: true,
        branch,
        lastCommit,
        commitCount,
        contributors
      };

    } catch (error) {
      // If git analysis fails, return basic info
      return {
        isGitRepo: true,
        branch: 'main',
        lastCommit: new Date(),
        commitCount: 1,
        contributors: ['unknown']
      };
    }
  }

  private async extractDeploymentInfo(projectPath: string): Promise<any> {
    // Check for deployment indicators
    if (await fs.pathExists(path.join(projectPath, 'coolify'))) {
      return {
        platform: 'coolify',
        status: 'active',
        environment: 'production'
      };
    }

    return undefined;
  }

  private async extractDependencies(projectPath: string): Promise<any[]> {
    const dependencies: any[] = [];

    // Check package.json
    if (await fs.pathExists(path.join(projectPath, 'package.json'))) {
      try {
        const packageJson = await fs.readJson(path.join(projectPath, 'package.json'));
        const deps = packageJson.dependencies || {};

        for (const [name, version] of Object.entries(deps)) {
          dependencies.push({
            name,
            version: version as string,
            type: 'npm',
            isDev: false
          });
        }
      } catch (error) {
        // Ignore
      }
    }

    return dependencies;
  }

  private async buildEvolutionHistory(projectPath: string): Promise<any> {
    try {
      // Get repository info first
      const repoInfo = await this.analyzeRepository(projectPath);

      // Calculate file statistics
      let totalFiles = 0;
      let totalSize = 0;

      try {
        const calculateStats = async (dirPath: string): Promise<void> => {
          const items = await fs.readdir(dirPath);

          for (const item of items) {
            const itemPath = path.join(dirPath, item);
            const stat = await fs.stat(itemPath);

            if (stat.isFile()) {
              totalFiles++;
              totalSize += stat.size;
            } else if (stat.isDirectory() && !item.startsWith('.') && item !== 'node_modules') {
              await calculateStats(itemPath);
            }
          }
        };

        await calculateStats(projectPath);
      } catch (error) {
        // If file counting fails, use basic stats
        totalFiles = 1;
        totalSize = 0;
      }

      // Calculate growth rate (simplified - based on commits per month)
      const now = new Date();
      const repoAgeMonths = repoInfo.isGitRepo ?
        Math.max(1, (now.getTime() - repoInfo.lastCommit.getTime()) / (1000 * 60 * 60 * 24 * 30)) : 1;

      const growthRate = repoInfo.isGitRepo ? repoInfo.commitCount / repoAgeMonths : 0;

      // Create evolution events (simplified)
      const events = [];

      if (repoInfo.isGitRepo) {
        events.push({
          id: `init-${Date.now()}`,
          timestamp: repoInfo.lastCommit,
          type: 'updated',
          description: `Repository has ${repoInfo.commitCount} commits by ${repoInfo.contributors.length} contributors`,
          metadata: {
            branch: repoInfo.branch,
            contributors: repoInfo.contributors.length
          }
        });
      }

      return {
        events,
        totalCommits: repoInfo.commitCount,
        totalFiles,
        totalSize,
        growthRate: Math.round(growthRate * 100) / 100, // Round to 2 decimal places
        lastActivity: repoInfo.lastCommit
      };

    } catch (error) {
      // Return basic evolution info if analysis fails
      return {
        events: [],
        totalCommits: 0,
        totalFiles: 1,
        totalSize: 0,
        growthRate: 0,
        lastActivity: new Date()
      };
    }
  }

  private async isNewProject(projectId: string): Promise<boolean> {
    const db = this.dbConnection.getDatabase();
    const result = await db.get('SELECT id FROM projects WHERE id = ?', projectId);
    return !result;
  }

  private async checkStatusChange(project: Project): Promise<any> {
    const db = this.dbConnection.getDatabase();
    const existing = await db.get('SELECT status FROM projects WHERE id = ?', project.id);

    if (existing && existing.status !== project.status) {
      return {
        projectId: project.id,
        oldStatus: existing.status,
        newStatus: project.status
      };
    }

    return null;
  }

  private async saveProject(project: Project): Promise<void> {
    const db = this.dbConnection.getDatabase();

    const data = {
      id: project.id,
      name: project.name,
      description: project.description,
      status: project.status,
      type: project.type,
      path: project.path,
      technologies: JSON.stringify(project.technologies),
      repository: project.repository ? JSON.stringify(project.repository) : null,
      deployment: project.deployment ? JSON.stringify(project.deployment) : null,
      dependencies: JSON.stringify(project.dependencies),
      metrics: project.metrics ? JSON.stringify(project.metrics) : null,
      evolution: JSON.stringify(project.evolution),
      last_scanned: project.lastScanned.toISOString(),
      created_at: project.createdAt.toISOString(),
      updated_at: project.updatedAt.toISOString()
    };

    await db.run(`
      INSERT OR REPLACE INTO projects
      (id, name, description, status, type, path, technologies, repository, deployment,
       dependencies, metrics, evolution, last_scanned, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `, Object.values(data));

    // Save evolution events
    if (project.evolution.events && project.evolution.events.length > 0) {
      for (const event of project.evolution.events) {
        try {
          await db.run(`
            INSERT OR REPLACE INTO evolution_events
            (id, project_id, timestamp, type, description, metadata)
            VALUES (?, ?, ?, ?, ?, ?)
          `, [
            event.id,
            project.id,
            event.timestamp.toISOString(),
            event.type,
            event.description,
            event.metadata ? JSON.stringify(event.metadata) : null
          ]);
        } catch (error) {
          console.warn(`Failed to save evolution event ${event.id}:`, error);
        }
      }
    }
  }

  private async saveScanResult(result: ScanResult): Promise<void> {
    const db = this.dbConnection.getDatabase();

    await db.run(`
      INSERT INTO scans (timestamp, duration, projects_found, projects_updated, errors, new_projects, status_changes)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `, [
      result.timestamp.toISOString(),
      result.duration,
      result.projectsFound,
      result.projectsUpdated,
      JSON.stringify(result.errors),
      JSON.stringify(result.newProjects),
      JSON.stringify(result.statusChanges)
    ]);
  }
}