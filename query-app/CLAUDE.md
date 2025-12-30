# CLAUDE.md - Knowledge Graph Explorer

Technical implementation guide for Claude Code.

## Project Overview

React + TypeScript application for querying and visualizing Neo4j knowledge graphs using natural language. Converts plain English queries to Cypher using Groq LLM, renders results with Neovis.js.

## Package Manager

```bash
npm  # Uses package-lock.json
```

## Commands

```bash
npm run dev      # Start dev server (port 5173 or 5174)
npm run build    # Production build to dist/
npm run preview  # Preview production build
npm run lint     # ESLint check
```

## Architecture

### Tech Stack

| Component | Technology |
|-----------|------------|
| Frontend | Vite 7 + React 18 + TypeScript |
| Visualization | Neovis.js 2.1.0 (wraps vis.js) |
| LLM | Groq API (Llama 3.3 70B) |
| Database | Neo4j Community Edition 5.x |
| Styling | CSS (custom dark theme) |

### Directory Structure

```
src/
├── components/
│   ├── GraphViewer.tsx    # Neovis.js wrapper, physics config, node styling
│   ├── NodeDetails.tsx    # Property panel for selected nodes/edges
│   ├── QueryInput.tsx     # Natural language input with suggestions
│   └── QueryHistory.tsx   # Query history sidebar (localStorage)
├── lib/
│   ├── groq.ts            # NL → Cypher translation via Groq
│   └── neo4j.ts           # Neo4j driver, connection, stats
├── App.tsx                # Main layout, state management
└── main.tsx               # Entry point
```

### Key Components

**GraphViewer.tsx** (lines 76-476)
- Neovis.js initialization with custom node colors/sizes
- Physics engine: `barnesHut` with `avoidOverlap: 1`
- Auto-detects AuraDB URLs and handles encryption
- Debug logging for edge rendering issues (can be disabled)

**groq.ts** (lib/)
- Uses `dangerouslyAllowBrowser: true` for client-side API calls
- Converts natural language to Cypher queries
- Model: `llama-3.3-70b-versatile`

**neo4j.ts** (lib/)
- Connection management and health checks
- Graph statistics (node count, relationship count, labels)

## Environment Variables

```env
VITE_NEO4J_URI=bolt://localhost:7687
VITE_NEO4J_USER=neo4j
VITE_NEO4J_PASSWORD=knowledge-graph
VITE_GROQ_API_KEY=gsk_your_key_here
```

**Note:** VITE_ variables are baked in at build time. Redeploy after changing.

## Node Types (19 total)

Defined in `GraphViewer.tsx` lines 6-53:

| Label | Color | Size |
|-------|-------|------|
| Project | #4CAF50 | 40 |
| Sponsor | #2196F3 | 35 |
| Festival | #FF5722 | 45 |
| Statistic | #673AB7 | 30 |
| Trend | #CDDC39 | 32 |
| BrandActivation | #E91E63 | 35 |
| ActivationConcept | #00E676 | 35 |
| ... | ... | ... |

## Critical: AuraDB 64-bit ID Bug

**DO NOT use AuraDB** for production. Edge rendering fails.

**Root Cause:** AuraDB relationship IDs overflow JavaScript's `Number.MAX_SAFE_INTEGER`.

```javascript
// AuraDB returns IDs like: 4611968929185185793
// JavaScript converts to: Infinity
// vis.js deduplicates by ID → only 1 edge survives
```

**Solution:** Fresh Neo4j on Coolify with sequential IDs (0, 1, 2...).

## Deployment

### Coolify (Recommended)

1. Deploy Neo4j (Docker Compose):
```yaml
version: '3'
services:
  neo4j:
    image: neo4j:5-community
    ports:
      - "7474:7474"
      - "7687:7687"
    environment:
      - NEO4J_AUTH=neo4j/your-password
    volumes:
      - neo4j-data:/data
volumes:
  neo4j-data:
```

2. Deploy Query App (Nixpacks):
```toml
[phases.setup]
nixPkgs = ['nodejs_20']

[phases.install]
cmds = ['npm ci']

[phases.build]
cmds = ['npm run build']

[start]
cmd = 'npx serve dist -l 3000'
```

3. Set environment variables in Coolify dashboard.

### Vercel (NOT Recommended)

Works for frontend, but requires external Neo4j. AuraDB has ID overflow bug.

## Data Import

Export from local Neo4j:
```bash
docker exec neo4j cypher-shell -u neo4j -p knowledge-graph \
  "CALL apoc.export.cypher.all('/var/lib/neo4j/import/export.cypher', {format:'plain'})"
docker cp neo4j:/var/lib/neo4j/import/export.cypher ./export.cypher
```

Import to Coolify Neo4j:
```bash
cypher-shell -a bolt://your-neo4j:7687 -u neo4j -p password < export.cypher
```

## Debug Mode

`GraphViewer.tsx` has debug logging (lines ~195-240). To enable/disable:

```typescript
// Find the 'completed' event handler and toggle console.log statements
```

Current state: Enabled for troubleshooting.

## Current Data

- **184 nodes**, **405 relationships**
- HelloJune knowledge graph + Festival research data
- Labels: Project, Sponsor, Festival, Statistic, Trend, BrandActivation, etc.

---

*Last updated: 2025-12-30*
