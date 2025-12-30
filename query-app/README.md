# Knowledge Graph Explorer

Query your Neo4j knowledge graph with natural language and visualize relationships interactively.

## Features

- **Natural Language Queries**: Ask questions in plain English, get Cypher queries automatically
- **Interactive Graph Visualization**: Powered by Neovis.js with optimized physics (no overlaps)
- **19 Node Types**: Each with distinct colors matching the legend (including Festival, Trend, Statistic)
- **Node Details Panel**: Click any node to see all its properties with smart formatting (K/M/B/T for large numbers)
- **Query History**: Your recent queries saved in localStorage
- **Real-time Status**: Connection indicators for Neo4j and Groq API

## Quick Start

### Prerequisites

1. **Neo4j** running locally:
   ```bash
   cd ../docker/neo4j
   docker compose up -d
   ```

2. **Groq API Key**: Get one free at [console.groq.com](https://console.groq.com)

### Installation

```bash
npm install
```

### Configuration

Create `.env.local` in this directory:

```env
VITE_GROQ_API_KEY=your-groq-api-key
VITE_NEO4J_URI=bolt://localhost:7687
VITE_NEO4J_USER=neo4j
VITE_NEO4J_PASSWORD=knowledge-graph
```

### Run

```bash
npm run dev
```

Opens at http://localhost:5173 (or 5174 if 5173 is in use)

## Architecture

### Tech Stack

| Component | Technology |
|-----------|------------|
| Frontend | Vite + React 18 + TypeScript |
| Visualization | Neovis.js (vis.js network) |
| LLM | Groq API (Llama 3.3 70B) |
| Database | Neo4j Community Edition 5 |

### Key Components

```
src/
├── components/
│   ├── GraphViewer.tsx    # Neovis.js wrapper with physics config
│   ├── NodeDetails.tsx    # Node/relationship properties panel
│   ├── QueryInput.tsx     # Natural language input + suggestions
│   └── QueryHistory.tsx   # Query history sidebar
├── lib/
│   ├── groq.ts            # NL → Cypher translation
│   └── neo4j.ts           # Neo4j connection & stats
└── App.tsx                # Main layout
```

### Node Types & Colors

| Label | Color | Size |
|-------|-------|------|
| Project | Green (#4CAF50) | 40 |
| Sponsor | Blue (#2196F3) | 35 |
| Strategy | Orange (#FF9800) | 32 |
| ActivationZone | Purple (#9C27B0) | 40 |
| Coalition | Red (#F44336) | 35 |
| Document | Gray (#607D8B) | 28 |
| Insight | Cyan (#00BCD4) | 28 |
| Research | Brown (#795548) | 32 |
| Venue | Pink (#E91E63) | 32 |
| Person | Yellow (#FFEB3B) | 28 |
| Organization | Indigo (#3F51B5) | 32 |
| Deliverable | Light Green (#8BC34A) | 28 |
| Technology | Teal (#009688) | 32 |
| Festival | Deep Orange (#FF5722) | 45 |
| Statistic | Deep Purple (#673AB7) | 30 |
| Trend | Lime (#CDDC39) | 32 |
| BrandActivation | Pink (#E91E63) | 35 |
| ActivationConcept | Bright Green (#00E676) | 35 |
| AudienceInterest | Light Blue (#29B6F6) | 28 |
| Competitor | Orange (#FF7043) | 30 |

### Edge/Relationship Color

All edges use red (#F44336) - consistent in graph and details panel.

### Physics Configuration

Uses `barnesHut` solver with `avoidOverlap` for optimal node spacing (no overlaps):

```typescript
physics: {
  solver: 'barnesHut',
  barnesHut: {
    gravitationalConstant: -30000,
    centralGravity: 0.3,
    springLength: 200,
    springConstant: 0.04,
    damping: 0.15,
    avoidOverlap: 1, // Prevents node overlap
  }
}
```

## Example Queries

Try these natural language queries:

- "Show me tier 1 sponsors"
- "Show all festivals"
- "What are the Gen Z statistics?"
- "Show market trends"
- "What brand activations happened at Coachella?"
- "Show Les Déferlantes festival"
- "What activation concepts exist?"
- "Show the HelloJune ecosystem"
- "What influences HelloJune strategy?"
- "Show me everything"

## Cypher Query Tips

### UNION Queries Must Have Matching Column Names

Neo4j requires identical column names across UNION subqueries. Use `AS` aliases:

```cypher
-- WRONG: different column names
MATCH (d:Document)-[r:ANALYZES]->(f:Festival) RETURN d, r, f
UNION ALL
MATCH (f:Festival)-[r2]-(other) RETURN f, r2, other  -- ERROR!

-- CORRECT: use aliases to align names
MATCH (d:Document)-[r:ANALYZES]->(f:Festival) RETURN d, r, f
UNION ALL
MATCH (f:Festival)-[r2]-(other) RETURN f as d, r2 as r, other as f
```

## Development

### Build

```bash
npm run build
```

### Preview Production Build

```bash
npm run preview
```

### Lint

```bash
npm run lint
```

## Deployment

### Recommended: Coolify (VPS Self-Hosted)

Deploy Neo4j + Query App on Coolify for full control and reliable edge rendering.

**Why Coolify over Vercel + AuraDB?**
See [Known Issues](#known-issues) below - AuraDB has 64-bit ID overflow issues with Neovis.js.

**Files needed:**

1. `nixpacks.toml` for the React app:
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

2. `docker-compose.yml` for Neo4j:
```yaml
version: '3'
services:
  neo4j:
    image: neo4j:5-community
    ports:
      - "7474:7474"
      - "7687:7687"
    environment:
      - NEO4J_AUTH=neo4j/your-password-here
    volumes:
      - neo4j-data:/data
volumes:
  neo4j-data:
```

**Environment variables in Coolify:**
- `VITE_GROQ_API_KEY` - Your Groq API key
- `VITE_NEO4J_URI` - `bolt://neo4j-service-name:7687` (internal) or public URL
- `VITE_NEO4J_USER` - `neo4j`
- `VITE_NEO4J_PASSWORD` - Your Neo4j password

### Alternative: Vercel (Frontend Only)

Vercel deployment works for the React app, but requires external Neo4j hosting.

**Status:** ⚠️ NOT RECOMMENDED - See [Known Issues](#known-issues)

## Known Issues

### AuraDB Edge Rendering Bug (Critical)

**Problem:** Neo4j AuraDB renders only 1 edge instead of all edges.

**Root Cause:** AuraDB uses 64-bit relationship IDs that overflow JavaScript's 53-bit safe integer limit.

**Technical Details:**
- AuraDB relationship IDs: ~100 quintillion (exceeds `Number.MAX_SAFE_INTEGER`)
- JavaScript converts these to `Infinity`
- vis.js DataSet deduplicates items by ID
- All edges get `id=Infinity` → only last one survives

**Evidence (from debug logging):**
```
// LOCAL Neo4j (works)
Edge IDs: [0,1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20,21...]
Result: 50 edges rendered ✅

// AuraDB (broken)
Edge IDs: [null]
Edge 0: id=Infinity, rawId=Infinity
Result: 1 edge rendered ❌
```

**Solution:** Use fresh Neo4j on Coolify. New databases start with small sequential IDs (0,1,2...) that work correctly.

**Alternatives that WON'T work:**
- Vercel + AuraDB → Same overflow issue
- Any cloud Neo4j with existing data → IDs already corrupted
- Client-side ID generation → Neovis.js doesn't support this

## Current Data

**Graph Status** (as of 2025-12-30):
- **184 nodes**, **405 relationships**
- HelloJune knowledge graph + Festival research data
- 10 major festivals: Coachella, Glastonbury, Tomorrowland, Primavera Sound, and more

---

*Part of the ImparLabs Knowledge Intelligence System*
