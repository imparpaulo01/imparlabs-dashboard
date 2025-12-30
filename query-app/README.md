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

For Coolify deployment, create `nixpacks.toml`:

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

Configure environment variables in Coolify:
- `VITE_GROQ_API_KEY`
- `VITE_NEO4J_URI`
- `VITE_NEO4J_USER`
- `VITE_NEO4J_PASSWORD`

## Current Data

**Graph Status** (as of 2025-12-30):
- **184 nodes**, **405 relationships**
- HelloJune knowledge graph + Festival research data
- 10 major festivals: Coachella, Glastonbury, Tomorrowland, Primavera Sound, and more

---

*Part of the ImparLabs Knowledge Intelligence System*
