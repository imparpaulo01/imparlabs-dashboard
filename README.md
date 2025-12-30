# ImparLabs Dashboard

**Knowledge Intelligence System** - Automated discovery, relationship analysis, and intelligence extraction for IMPAR Labs projects.

## Overview

This system combines project portfolio management with a **Neo4j knowledge graph** to discover and visualize relationships between projects, research, decisions, technologies, and more. The value isn't in the data itself, but in the **CONNECTIONS** between data points.

**Current Status (2025-12-29):** Neo4j running locally with HelloJune knowledge graph (90+ nodes, 113+ relationships).

## Features

- 🔗 **Knowledge Graph** - Neo4j-powered relationship discovery
- 🔍 **Automatic Project Discovery** - Scans all project directories
- 📊 **Technology Detection** - Identifies frameworks, languages, and tools
- 📈 **Evolution Tracking** - Monitors project changes over time
- 🏷️ **Status Management** - Tracks dev/production/obsolete lifecycle
- 📋 **Intelligence Queries** - Extract insights from connections
- 🎯 **Visual Graph Explorer** - See relationships visually (in development)

## Quick Start

### 1. Start Neo4j Database

```bash
cd docker/neo4j
docker compose up -d
```

Access Neo4j Browser at: http://localhost:7474
Credentials: `neo4j` / `knowledge-graph`

### 2. Load Sample Data

In Neo4j Browser, copy and run the contents of:
- `docker/neo4j/sample-data.cypher` - Creates sample project graph

### 3. Explore the Graph

Try these queries in Neo4j Browser:
```cypher
// See all projects
MATCH (p:Project) RETURN p

// See project-technology network
MATCH (p:Project)-[r:USES]->(t:Technology) RETURN p, r, t

// Find shared technologies
MATCH (p1:Project)-[:USES]->(t:Technology)<-[:USES]-(p2:Project)
WHERE p1.name < p2.name
RETURN p1.name, p2.name, collect(t.name) AS shared
```

See `docker/neo4j/example-queries.cypher` for more query examples.

## Commands

### Scan Projects
```bash
imparlabs-dashboard scan [options]

Options:
  -p, --path <path>          Path to scan (default: IMPAR/PROJECTOS)
  -r, --recursive            Scan recursively (default: true)
  -o, --include-obsolete     Include obsolete projects (default: true)
  -f, --force-refresh        Force refresh all projects (default: false)
  -v, --verbose              Verbose output (default: false)
```

### List Projects
```bash
imparlabs-dashboard list [options]

Options:
  -s, --status <status>      Filter by status (development|production|obsolete)
  -t, --type <type>          Filter by type (web-app|ai-agent|automation|data-analysis)
  -v, --verbose              Show detailed information
```

### Database Operations
```bash
imparlabs-dashboard stats                    # Show database statistics
imparlabs-dashboard backup [-o <path>]      # Create database backup
```

## Project Status Types

- **development** - Active projects in `/PROJECTOS EM DEV/`
- **production** - Live projects in `/PROJECTOS EM PROD/`
- **obsolete** - Archived projects in `/OBSOLETE/`

## Project Types

- **web-app** - Web applications (Next.js, React, etc.)
- **ai-agent** - AI/ML projects and agents
- **automation** - Workflow automation (n8n, scripts)
- **data-analysis** - Data processing and analytics
- **library** - Reusable code libraries
- **api** - API services and backends
- **tool** - Development tools and utilities

## Technology Detection

The scanner automatically detects:

### Frontend
- Next.js, React, Vue.js
- TypeScript, JavaScript
- Tailwind CSS, shadcn/ui

### Backend
- Node.js, Python, Go
- Express, FastAPI, Django
- PostgreSQL, SQLite, MongoDB

### DevOps & Deployment
- Docker, Coolify
- n8n workflows
- CI/CD pipelines

### AI/ML
- OpenAI, Anthropic
- Hugging Face, TensorFlow
- Custom ML models

## Graph Schema (Neo4j)

The knowledge graph contains these node types:

**Core Entities:**
- `Project` - IMPAR Labs projects
- `Technology` - Frameworks, languages, tools
- `Research` - Research investigations
- `Decision` - Documented decisions

**HelloJune Domain (imported):**
- `Sponsor` - 33 potential sponsors with tiers
- `ActivationZone` - 5 festival activation zones
- `Coalition` - 4 strategic partnership coalitions
- `Insight`, `Strategy`, `Document`, `Venue`, `Person`, `Organization`

**Key Relationships:**
- `USES` - Project uses technology
- `PROPOSED_FOR` - Sponsor proposed for project
- `SPONSORS_ZONE` - Sponsor associated with activation zone
- `INFORMED` - Research informed decision
- `AFFECTS` - Decision affects project

## Architecture

```
📁 imparlabs-dashboard/
├── 📁 docker/
│   └── 📁 neo4j/
│       ├── 📄 docker-compose.yml      # Neo4j local dev setup
│       ├── 📄 sample-data.cypher      # Initial graph data
│       └── 📄 example-queries.cypher  # Query reference
├── 📁 src/
│   ├── 📁 scanner/             # Project discovery logic
│   ├── 📁 database/            # Neo4j operations
│   ├── 📁 cli/                 # Command-line interface
│   ├── 📁 types/               # TypeScript definitions
│   └── 📁 utils/               # Helper functions
├── 📄 IMPLEMENTATION-PLAN.md   # Detailed roadmap
├── 📄 README.md                # This file
├── 📄 CLAUDE.md                # Technical documentation
├── 📄 TODO.md                  # Current tasks
├── 📄 KNOWLEDGE-GRAPH-ARCHITECTURE.md  # Graph architecture
└── 📁 dist/                    # Compiled JavaScript
```

## Development

### Building
```bash
npm run build          # Compile TypeScript
npm run dev           # Run in development mode
```

### Testing
```bash
npm run scan          # Test scanning functionality
npm run list          # Test listing functionality
npm run stats         # Test database operations
```

## Data Safety

**Important**: This system only reads project files and never modifies them.

- ✅ Reads: `package.json`, `README.md`, `CLAUDE.md`, file structures
- ✅ Analyzes: Dependencies, technologies, git history
- ✅ Tracks: Changes over time, status transitions
- ❌ Never modifies: Any existing project files or code

## Roadmap

### Phase 1: Foundation ✅
- Project discovery and cataloging
- Basic CLI interface
- Neo4j graph database setup
- Sample data and example queries

### Phase 2: Knowledge Graph 🔄 (Current)
- HelloJune domain data imported ✅
- 90+ nodes, 113+ relationships ✅
- Graph visualizations via Playwright ✅
- **Next:** Natural language query interface

### Phase 3: Visual Intelligence 🚧
- Neovis.js graph visualization
- Interactive graph explorer
- Cross-domain intelligence queries
- Pattern discovery

### Phase 4: Automation 📋
- n8n workflow integration
- PAI session/learning capture
- Automated graph enrichment
- Real-time knowledge capture

## Contributing

This is an internal IMPAR Labs tool. For questions or improvements:

1. Check the `IMPLEMENTATION-PLAN.md` for roadmap details
2. Review `CLAUDE.md` for technical implementation
3. Update `TODO.md` with new tasks or progress

## License

Internal IMPAR Labs project - All rights reserved.