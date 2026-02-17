# CLAUDE.md - ImparLabs Dashboard

## Project Overview
**Knowledge Intelligence System** for IMPAR Labs workspace. Combines project portfolio management with a Neo4j knowledge graph to discover relationships, track evolution, and extract intelligence across all projects, research, sessions, and decisions.

**The Vision:** Create a unified knowledge graph linking ALL ImparLabs knowledge - projects, code, research, sessions, learnings, decisions, infrastructure - enabling intelligence extraction through relationship analysis.

## Technology Stack
- **Language**: TypeScript/Node.js
- **Database**: Neo4j Community Edition 5 (graph database, Docker-based)
- **CLI**: Commander.js for command-line interface
- **File Operations**: fs-extra for robust file system operations
- **Build**: TypeScript compiler with strict mode

## Neo4j Setup (Local Development)

### Quick Start
```bash
cd docker/neo4j
cp .env.example .env   # Edit .env with your credentials
docker compose up -d
```

### Access Points
- **Browser UI**: http://localhost:7474
- **Bolt Protocol**: bolt://localhost:7687
- **Credentials**: Set via `NEO4J_AUTH` environment variable (see `.env.example`)

### Key Cypher Queries
```cypher
# View full ecosystem for a project
MATCH (p:Project {name: 'HelloJune'})-[r]-(connected) RETURN p, r, connected

# Find Tier 1 sponsors and their zones
MATCH (s:Sponsor)-[r]-(connected) WHERE s.tier = 1 RETURN s, r, connected

# View strategic coalitions
MATCH (c:Coalition)-[r]-(connected) RETURN c, r, connected
```

## Architecture

### Core Components

#### 1. ProjectScanner (`src/scanner/index.ts`)
**Purpose**: Discovers and analyzes all projects in the IMPAR workspace

**Key Methods**:
- `scan()` - Main scanning orchestration
- `discoverProjects()` - Finds project directories
- `analyzeProject()` - Deep analysis of individual projects
- `detectTechnologies()` - Identifies tech stack
- `determineType()` - Classifies project type

**Discovery Logic**:
```typescript
// Scans these directories:
const directories = [
  '1 - PROJECTOS EM DEV',    // Development projects
  '2 - PROJECTOS EM PROD',   // Production projects
  '3 - OBSOLETE'            // Archived projects
];

// Identifies projects by:
const indicators = [
  'package.json', 'README.md', 'CLAUDE.md',
  '.git', 'requirements.txt', 'pyproject.toml',
  'Dockerfile', 'docker-compose.yml'
];
```

#### 2. DatabaseConnection (`src/database/connection.ts`)
**Purpose**: SQLite database operations with connection management

**Features**:
- Singleton pattern for connection management
- Automatic schema initialization
- Backup functionality
- Statistics reporting

#### 3. CLI Interface (`src/cli/index.ts`)
**Purpose**: Command-line interface for all operations

**Commands**:
- `scan` - Discover and catalog projects
- `list` - Display tracked projects
- `stats` - Database statistics
- `backup` - Create database backup

## Data Flow

### Scan Pipeline
```
User Command → CLI Parser → ProjectScanner.scan()
    ↓
File System Discovery → Project Analysis → Technology Detection
    ↓
Database Storage → Evolution Tracking → Result Reporting
```

### Project Analysis Process
1. **Path Analysis**: Determine status from directory structure
2. **File Inspection**: Check for project indicators
3. **Technology Detection**: Parse package.json, requirements.txt, etc.
4. **Metadata Extraction**: Pull info from README.md, CLAUDE.md
5. **Evolution Tracking**: Analyze git history and changes
6. **Database Storage**: Save/update project record

## Graph Schema (Neo4j)

### Core Node Types
```cypher
(:Project { id, name, path, status, type, description, created_at, last_scanned })
(:Sponsor { name, tier, category, reasoning, activation_concept })
(:Technology { name, category })
(:ActivationZone { name, description, vibe })
(:Coalition { name, pitch })
(:Research { id, title, topic, date, summary })
(:Decision { id, category, date, choice, reasoning })
(:Service { name, url, type, status })
```

### Key Relationships
```cypher
(:Project)-[:USES]->(:Technology)
(:Sponsor)-[:PROPOSED_FOR]->(:Project)
(:Sponsor)-[:SPONSORS_ZONE]->(:ActivationZone)
(:Coalition)-[:FOR]->(:Project)
(:Research)-[:INFORMED]->(:Decision)
(:Decision)-[:AFFECTS]->(:Project)
(:Project)-[:DEPLOYED_ON]->(:Service)
```

**Architecture Decision:** Neo4j-only (no SQLite). Single source of truth, no sync complexity.

## Status Determination Logic

```typescript
private determineStatus(projectPath: string): ProjectStatus {
  if (path.includes('EM PROD')) return 'production';
  if (path.includes('OBSOLETE')) return 'obsolete';
  return 'development'; // Default
}
```

## Technology Detection

### Node.js Projects
```typescript
// From package.json dependencies
if (deps['next']) technologies.push({ name: 'Next.js', category: 'frontend' });
if (deps['n8n']) technologies.push({ name: 'n8n', category: 'automation' });
```

### Python Projects
```typescript
// From requirements.txt or pyproject.toml
// Detect frameworks, ML libraries, etc.
```

## Error Handling

### Graceful Degradation
- Missing files don't break scans
- JSON parse errors are logged but don't stop processing
- Database connection issues trigger retries
- File permission errors are reported but don't halt scanning

### Logging Strategy
- Console output for CLI operations
- Error aggregation in scan results
- Database logging for audit trails

## Performance Considerations

### Scanning Optimization
- **Incremental Updates**: Only re-scan changed projects
- **File Caching**: Cache file contents during analysis
- **Batch Operations**: Database operations in batches
- **Memory Management**: Stream large file operations

### Database Optimization
- **Indexes**: Optimized for common queries
- **Connection Pooling**: Singleton pattern prevents connection leaks
- **Query Optimization**: Efficient SELECT statements

## Security & Safety

### Read-Only Operations
- **Never modifies** existing project files
- **Only reads** public project metadata
- **No execution** of project code
- **Safe file operations** with error boundaries

### Data Privacy
- **Local SQLite**: No external data transmission
- **File paths only**: No sensitive content extraction
- **Audit trail**: All operations logged locally

## Development Workflow

### Building
```bash
npm run build    # TypeScript compilation
npm run dev      # Development mode with ts-node
```

### Testing
```bash
npm run scan     # Test scanning functionality
npm run list     # Test listing functionality
npm run stats    # Test database operations
```

### Debugging
- Verbose mode: `imparlabs-dashboard scan --verbose`
- Error logging: All errors captured in scan results
- Database inspection: Direct SQLite queries for debugging

## Integration Points

### IMPAR Workspace Structure
```
IMPAR/
├── 1 - PROJECTOS/
│   ├── 1 - PROJECTOS EM DEV/     # Development projects
│   ├── 2 - PROJECTOS EM PROD/    # Production projects
│   └── 3 - OBSOLETE/             # Archived projects
```

## File Structure

```
imparlabs-dashboard/
├── docker/
│   └── neo4j/
│       ├── docker-compose.yml     # Neo4j local development
│       ├── .env.example           # Environment variable template
│       ├── sample-data.cypher     # Initial graph data (HelloJune)
│       └── example-queries.cypher # Reference queries
├── query-app/                     # Natural Language Query App (Vite + React)
│   ├── src/
│   │   ├── components/
│   │   │   ├── GraphViewer.tsx    # Neovis.js visualization
│   │   │   ├── NodeDetails.tsx    # Node/relationship details panel
│   │   │   ├── QueryInput.tsx     # Natural language input
│   │   │   └── QueryHistory.tsx   # Query history sidebar
│   │   ├── lib/
│   │   │   ├── groq.ts            # Groq API for NL → Cypher
│   │   │   └── neo4j.ts           # Neo4j connection
│   │   ├── App.tsx                # Main app layout
│   │   └── main.tsx               # Entry point
│   ├── .env.local                 # Environment variables (gitignored)
│   └── package.json
├── src/
│   ├── scanner/                   # Project discovery logic
│   ├── database/                  # Neo4j operations
│   ├── cli/                       # Command-line interface
│   └── types/                     # TypeScript definitions
├── CLAUDE.md                      # This file
├── README.md                      # User documentation
├── TODO.md                        # Task tracking
└── KNOWLEDGE-GRAPH-ARCHITECTURE.md # Architecture design
```

## Natural Language Query App (query-app/)

### Quick Start
```bash
cd query-app
cp .env.example .env.local   # Set your credentials
npm install
npm run dev  # Runs on localhost:5173 (or 5174 if 5173 in use)
```

### Technology Stack
- **Frontend**: Vite + React 18 + TypeScript
- **Visualization**: Neovis.js (vis.js network under the hood)
- **LLM**: Groq API with Llama 3.3 70B Versatile
- **Database**: Neo4j (bolt://localhost:7687)

### Environment Variables (.env.local)
```env
VITE_GROQ_API_KEY=your-groq-api-key
VITE_NEO4J_URI=bolt://localhost:7687
VITE_NEO4J_USER=neo4j
VITE_NEO4J_PASSWORD=your-neo4j-password
```

### Key Components

#### GraphViewer.tsx
- **Purpose**: Neovis.js wrapper for interactive graph visualization
- **Node Colors**: 13 distinct colors by label type (Project=green, Sponsor=blue, etc.)
- **Node Sizes**: Balanced range 28-40 for visibility
- **Physics Engine**: `repulsion` solver with optimized spacing
- **Dynamic Labels**: Checks name > title > content > topic > pitch

#### NodeDetails.tsx
- **Purpose**: Shows node/relationship properties on click
- **Features**: Visual node badge with color, property table, ID display

#### QueryInput.tsx
- **Purpose**: Natural language input with suggestions
- **Suggestions**: Pre-built queries for common patterns

#### groq.ts
- **Purpose**: Natural language > Cypher translation via Groq
- **Model**: `llama-3.3-70b-versatile` (temperature: 0.1)
- **System Prompt**: Contains full schema (19 node types, 21 relationship types) and example queries
- **Key Rules**:
  - Use `CONTAINS` for fuzzy name matching (handles partial/truncated names)
  - Return ALL relationships for single entity queries (not just one type)

### Neo4j UNION Query Gotcha
**Important**: Neo4j UNION queries require identical column names across all subqueries. Use `AS` aliases to match column names.

### Key Design Decisions

1. **Physics Solver Choice**:
   - `repulsion` solver with nodeDistance: 350, springLength: 400
   - Produces clean radial layout without overlapping nodes

2. **Node Label Resolution**:
   - Order of preference: name > title > content > topic > pitch
   - Fallback to "?" for unknown nodes

3. **Font Styling**:
   - White text with black stroke (2px) for visibility on colored nodes

## Data Quality & Maintenance

### Date Format Standard
All date fields must be stored as ISO strings (`"2025-12-29"`), NOT as Neo4j DateTime objects.

### Multi-Label Nodes
Some entities have multiple labels (e.g., `Venue:Competitor`). This is intentional.

### Duplicate Detection
```cypher
MATCH (n)
WITH labels(n) AS labels, n.name AS name, collect(n) AS nodes, count(*) AS cnt
WHERE cnt > 1
RETURN labels, name, cnt, [n IN nodes | id(n)] AS ids
```

### Neo4j Docker Access
```bash
# Execute Cypher queries (use your configured credentials)
docker exec -i imparlabs-neo4j-local cypher-shell -u neo4j -p "$NEO4J_PASSWORD"
```

## Critical: AuraDB 64-bit ID Bug

**DO NOT use AuraDB** for production. Edge rendering fails because AuraDB relationship IDs overflow JavaScript's `Number.MAX_SAFE_INTEGER`.

## Future Enhancements

### Phase 3 Features
- Automated graph enrichment via workflows
- Session/learning integration
- Real-time knowledge capture

### Phase 4 Features
- Cross-domain intelligence queries
- Pattern discovery algorithms
- Decision traceability dashboard
