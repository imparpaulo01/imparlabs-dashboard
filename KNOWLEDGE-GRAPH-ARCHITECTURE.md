# Knowledge Graph Architecture - ImparLabs Intelligence System

**Version:** 1.2.0
**Date:** 2025-12-29
**Status:** Phase 2 Active (HelloJune Graph Imported)

---

## Executive Summary

This document outlines the architectural evolution of ImparLabs Dashboard from a **simple project catalog** to a **Knowledge Intelligence System** powered by Neo4j graph database.

**The Vision:** Create a unified knowledge graph that links ALL ImparLabs knowledge - projects, code, research, sessions, learnings, decisions, infrastructure - enabling intelligence extraction through relationship analysis.

**Key Insight:** The value isn't in the data itself, but in the **CONNECTIONS** between data points.

**Architecture Decision:** **Neo4j-only** - Single source of truth, no SQLite, no sync complexity.

---

## Why Neo4j (and Why ONLY Neo4j)?

| Factor | Score | Reasoning |
|--------|-------|-----------|
| **TypeScript Integration** | ⭐⭐⭐⭐⭐ | Official driver v6.x with first-class TypeScript support |
| **Knowledge Graph Fit** | ⭐⭐⭐⭐⭐ | Native graph with index-free adjacency (constant-time traversals) |
| **Self-Hosting** | ⭐⭐⭐⭐⭐ | Community Edition free, Docker on Coolify |
| **Performance** | ⭐⭐⭐⭐⭐ | 10k nodes → <50ms complex queries |
| **Ecosystem** | ⭐⭐⭐⭐⭐ | Largest graph ecosystem, rich visualization tools |
| **Cost** | ⭐⭐⭐⭐⭐ | $0/month self-hosted on existing infrastructure |
| **Simplicity** | ⭐⭐⭐⭐⭐ | Single database = no sync, no data drift, less code |

**Why NOT dual-database (SQLite + Neo4j)?**
- ❌ Two databases to manage
- ❌ Sync logic needed between them
- ❌ Two query languages (SQL + Cypher)
- ❌ Potential data drift
- ❌ More code to maintain

**Neo4j handles simple operations efficiently:**
```cypher
// List all projects (replaces: SELECT * FROM projects)
MATCH (p:Project) RETURN p ORDER BY p.name

// Find by name (replaces: WHERE name = ?)
MATCH (p:Project {name: 'PAI'}) RETURN p

// Count by status (replaces: GROUP BY)
MATCH (p:Project) RETURN p.status, count(p)
```

**Verdict:** Neo4j Community Edition, self-hosted on Coolify. **No SQLite.**

---

## Architectural Evolution

```
BEFORE (Current):
┌─────────────────────────────────────────────┐
│         ImparLabs Dashboard                 │
│    (SQLite Project Catalog)                 │
│                                             │
│  Projects → Technologies                    │
│           → Status                          │
│           → Basic Metadata                  │
│                                             │
│  ❌ No relationships between knowledge      │
│  ❌ No session/learning tracking            │
│  ❌ No cross-project insights               │
│  ❌ No research integration                 │
└─────────────────────────────────────────────┘

AFTER (Target):
┌─────────────────────────────────────────────────────────────────┐
│              ImparLabs Knowledge Intelligence System            │
│                                                                 │
│  ┌──────────────┐    ┌──────────────┐    ┌──────────────┐      │
│  │   Projects   │◄──►│   Sessions   │◄──►│  Learnings   │      │
│  └──────┬───────┘    └──────┬───────┘    └──────┬───────┘      │
│         │                   │                    │              │
│         ▼                   ▼                    ▼              │
│  ┌──────────────┐    ┌──────────────┐    ┌──────────────┐      │
│  │    Code      │◄──►│  Research    │◄──►│  Decisions   │      │
│  │    Files     │    │              │    │              │      │
│  └──────┬───────┘    └──────┬───────┘    └──────┬───────┘      │
│         │                   │                    │              │
│         ▼                   ▼                    ▼              │
│  ┌──────────────┐    ┌──────────────┐    ┌──────────────┐      │
│  │ Technologies │◄──►│Infrastructure│◄──►│   People     │      │
│  └──────────────┘    └──────────────┘    └──────────────┘      │
│                                                                 │
│  ✅ Rich relationships between ALL knowledge                    │
│  ✅ Temporal tracking (evolution over time)                     │
│  ✅ Cross-project pattern discovery                             │
│  ✅ Research → Learning → Application pipeline                  │
│  ✅ Decision traceability                                       │
└─────────────────────────────────────────────────────────────────┘
```

---

## Knowledge Sources Inventory

### What We Have (Identified Data Sources)

| Source | Location | Type | Nodes | Est. Count |
|--------|----------|------|-------|------------|
| **Projects** | `1 - PROJECTOS/*/` | Scanner | Project | ~30 |
| **Sessions** | `PAI/history/sessions/` | Markdown | AgentSession | ~71+ |
| **Research** | `PAI/history/research/` | Markdown | Research | ~20+ |
| **Learnings** | `PAI/history/learnings/` | Markdown/JSON | Learning | ~15+ |
| **Skills** | `PAI/.claude/skills/` | Directories | Skill | 13 |
| **Agents** | `PAI/.claude/agents/` | Markdown | Agent | 8 |
| **Hooks** | `PAI/.claude/hooks/` | TypeScript | Hook | 15+ |
| **Workflows** | n8n.imparlabs.com | JSON | Workflow | 6 |
| **Services** | Coolify containers | API | Service | 31 |
| **Technologies** | package.json/etc | Detected | Technology | ~50+ |
| **Documentation** | Various *.md | Markdown | Documentation | ~100+ |
| **Commands** | `PAI/.claude/commands/` | Markdown | Command | 8 |
| **People** | linkedin_clients.json | JSON | Person | 3+ |

**Estimated Initial Graph Size:** ~500-1000 nodes, ~2000-5000 relationships

---

## Graph Schema Design

### Core Node Types

```cypher
// ═══════════════════════════════════════════
// CORE ENTITIES (Primary Knowledge Objects)
// ═══════════════════════════════════════════

// Projects (from dashboard scanner)
(:Project {
  id: string,            // UUID
  name: string,          // "imparlabs-dashboard"
  path: string,          // Full filesystem path
  status: string,        // development|production|obsolete
  type: string,          // web-app|ai-agent|automation|api|tool
  description: string,
  repository: string,    // Git URL
  created_at: datetime,
  last_scanned: datetime
})

// Code Files (from project scanning)
(:CodeFile {
  path: string,          // Unique: "/src/index.ts"
  name: string,          // "index.ts"
  language: string,      // TypeScript|Python|etc
  lines: integer,
  hash: string,          // Content hash for change detection
  last_modified: datetime
})

// Agent Sessions (from PAI history)
(:AgentSession {
  id: string,            // "2025-12-29-101943"
  timestamp: datetime,
  executor: string,      // "kai"|"PAI"
  duration_minutes: integer,
  tools_used: [string],  // ["Read", "Write", "Bash"]
  outcome: string        // Session result summary
})

// Research (from PAI research outputs)
(:Research {
  id: string,
  title: string,
  topic: string,
  date: datetime,
  summary: string,
  source_urls: [string],
  output_path: string    // Where findings were saved
})

// Learnings (from PAI learnings)
(:Learning {
  id: string,
  title: string,
  category: string,      // security|workflow|api|architecture
  problem: string,       // What was the issue
  solution: string,      // How it was solved
  date: datetime,
  source_session: string // Which session discovered this
})

// ═══════════════════════════════════════════
// SUPPORTING ENTITIES
// ═══════════════════════════════════════════

// Technologies (detected from projects)
(:Technology {
  name: string,          // "React", "Neo4j", "TypeScript"
  version: string,       // "18.2.0"
  category: string       // frontend|backend|database|ai-ml|automation
})

// Infrastructure Services
(:Service {
  name: string,          // "n8n", "Vikunja"
  url: string,           // "https://n8n.imparlabs.com"
  type: string,          // automation|database|app|proxy
  status: string,        // active|inactive|error
  container_id: string
})

// n8n Workflows
(:Workflow {
  id: string,            // n8n workflow ID
  name: string,
  purpose: string,
  active: boolean,
  last_run: datetime
})

// Skills (PAI capabilities)
(:Skill {
  name: string,          // "research", "fabric"
  description: string,
  auto_load: boolean,
  path: string
})

// Agents (PAI agent types)
(:Agent {
  name: string,          // "engineer", "researcher"
  role: string,
  capabilities: [string]
})

// Decisions (documented in TODOs.md)
(:Decision {
  id: string,
  category: string,      // technology|architecture|security
  date: datetime,
  choice: string,        // What was chosen
  alternatives: [string],// What was rejected
  reasoning: string      // Why this choice
})

// People
(:Person {
  name: string,
  email: string,
  role: string,          // owner|client|contributor
  company: string
})

// Documentation
(:Documentation {
  path: string,
  type: string,          // CLAUDE|README|TODO|ARCHITECTURE
  title: string,
  last_updated: datetime
})

// Insights (extracted intelligence)
(:Insight {
  id: string,
  content: string,
  confidence: float,     // 0.0-1.0
  source_type: string,   // research|session|learning
  tags: [string],
  timestamp: datetime
})
```

### Core Relationships

```cypher
// ═══════════════════════════════════════════
// PROJECT STRUCTURE RELATIONSHIPS
// ═══════════════════════════════════════════

// Code belongs to projects
(:CodeFile)-[:PART_OF {added: datetime}]->(:Project)

// Code dependencies (imports/requires)
(:CodeFile)-[:IMPORTS {
  import_type: string,   // default|named|namespace|dynamic
  usage_count: integer,
  first_used: datetime
}]->(:CodeFile)

// Projects use technologies
(:Project)-[:USES {
  is_primary: boolean,
  version: string
}]->(:Technology)

// Documentation documents projects
(:Documentation)-[:DOCUMENTS]->(:Project)

// ═══════════════════════════════════════════
// DEVELOPMENT ACTIVITY RELATIONSHIPS
// ═══════════════════════════════════════════

// Sessions work on projects
(:AgentSession)-[:WORKED_ON {
  files_modified: integer,
  lines_changed: integer
}]->(:Project)

// Sessions modify files
(:AgentSession)-[:MODIFIED {
  timestamp: datetime,
  lines_added: integer,
  lines_removed: integer,
  change_type: string    // feature|bugfix|refactor|docs
}]->(:CodeFile)

// Sessions use skills
(:AgentSession)-[:USED]->(:Skill)

// Sessions delegate to agents
(:AgentSession)-[:DELEGATED_TO {
  task: string
}]->(:Agent)

// ═══════════════════════════════════════════
// KNOWLEDGE FLOW RELATIONSHIPS
// ═══════════════════════════════════════════

// Research generates insights
(:Research)-[:GENERATED {
  confidence: float
}]->(:Insight)

// Insights apply to projects
(:Insight)-[:APPLIES_TO {
  relevance: float
}]->(:Project)

// Sessions discover learnings
(:AgentSession)-[:DISCOVERED]->(:Learning)

// Learnings reference technologies
(:Learning)-[:ABOUT]->(:Technology)

// Research covers topics (technologies, patterns)
(:Research)-[:COVERS]->(:Technology)

// ═══════════════════════════════════════════
// DECISION TRACEABILITY
// ═══════════════════════════════════════════

// Decisions affect projects
(:Decision)-[:AFFECTS]->(:Project)

// Decisions choose technologies
(:Decision)-[:CHOSE]->(:Technology)

// Decisions reject alternatives
(:Decision)-[:REJECTED {reason: string}]->(:Technology)

// Research informs decisions
(:Research)-[:INFORMED]->(:Decision)

// ═══════════════════════════════════════════
// INFRASTRUCTURE RELATIONSHIPS
// ═══════════════════════════════════════════

// Projects deploy on services
(:Project)-[:DEPLOYED_ON {
  url: string,
  environment: string   // production|staging|dev
}]->(:Service)

// Workflows integrate services
(:Workflow)-[:INTEGRATES]->(:Service)

// Workflows automate for projects
(:Workflow)-[:AUTOMATES]->(:Project)

// Skills use workflows
(:Skill)-[:IMPLEMENTS]->(:Workflow)

// ═══════════════════════════════════════════
// PEOPLE RELATIONSHIPS
// ═══════════════════════════════════════════

// People own projects
(:Person)-[:OWNS]->(:Project)

// People are clients of projects
(:Person)-[:CLIENT_OF]->(:Project)

// Workflows serve people
(:Workflow)-[:SERVES]->(:Person)

// ═══════════════════════════════════════════
// TEMPORAL RELATIONSHIPS
// ═══════════════════════════════════════════

// Session sequence (timeline)
(:AgentSession)-[:FOLLOWED_BY]->(:AgentSession)

// Learning evolution
(:Learning)-[:SUPERSEDES]->(:Learning)

// Research builds on prior research
(:Research)-[:BUILDS_ON]->(:Research)
```

---

## Intelligence Queries (What You'll Be Able To Ask)

### 1. Project Intelligence

```cypher
// Q: What's the dependency graph for a project?
MATCH path = (p:Project {name: 'PAI'})<-[:PART_OF]-(f:CodeFile)-[:IMPORTS*1..3]->(dep:CodeFile)
RETURN path

// Q: Find projects with similar technology stacks
MATCH (p1:Project)-[:USES]->(t:Technology)<-[:USES]-(p2:Project)
WHERE p1 <> p2
WITH p1, p2, collect(t.name) AS shared_tech
WHERE size(shared_tech) >= 3
RETURN p1.name, p2.name, shared_tech

// Q: Which projects are most connected (central hub projects)?
MATCH (p:Project)<-[:WORKED_ON|APPLIES_TO|AFFECTS]-(n)
RETURN p.name, count(n) AS connections
ORDER BY connections DESC
LIMIT 10
```

### 2. Code Intelligence

```cypher
// Q: Find circular dependencies
MATCH path = (f:CodeFile)-[:IMPORTS*2..6]->(f)
RETURN [n IN nodes(path) | n.path] AS circular_chain

// Q: Which files are most imported (refactor candidates)?
MATCH (f:CodeFile)<-[imp:IMPORTS]-()
WITH f, count(imp) AS import_count
WHERE import_count > 5
RETURN f.path, import_count
ORDER BY import_count DESC

// Q: Find orphan files (imported by nothing)
MATCH (f:CodeFile)
WHERE NOT (f)<-[:IMPORTS]-()
  AND NOT f.path CONTAINS 'test'
  AND NOT f.path CONTAINS 'index'
RETURN f.path
```

### 3. Research → Application Pipeline

```cypher
// Q: Trace research impact to projects
MATCH path = (r:Research)-[:GENERATED]->(i:Insight)-[:APPLIES_TO]->(p:Project)
RETURN r.title, i.content, p.name

// Q: What research informed which decisions?
MATCH (r:Research)-[:INFORMED]->(d:Decision)-[:AFFECTS]->(p:Project)
RETURN r.title, d.choice, p.name, d.reasoning

// Q: Find learnings that could apply to other projects
MATCH (l:Learning)-[:ABOUT]->(t:Technology)<-[:USES]-(p:Project)
WHERE NOT (l)-[:APPLIED_TO]->(p)
RETURN l.title, l.solution, collect(p.name) AS candidate_projects
```

### 4. Session Intelligence

```cypher
// Q: What's the activity pattern over the last 7 days?
MATCH (s:AgentSession)-[m:MODIFIED]->(f:CodeFile)
WHERE s.timestamp > datetime() - duration('P7D')
RETURN date(s.timestamp) AS day,
       count(DISTINCT s) AS sessions,
       sum(m.lines_changed) AS total_lines
ORDER BY day

// Q: Which agent types are most productive?
MATCH (s:AgentSession)-[:DELEGATED_TO]->(a:Agent)
MATCH (s)-[m:MODIFIED]->()
RETURN a.name, count(DISTINCT s) AS sessions, sum(m.lines_changed) AS lines_changed
ORDER BY lines_changed DESC

// Q: Find sessions with similar work patterns
MATCH (s1:AgentSession)-[:USED]->(sk:Skill)<-[:USED]-(s2:AgentSession)
WHERE s1 <> s2
WITH s1, s2, collect(sk.name) AS shared_skills
WHERE size(shared_skills) >= 2
RETURN s1.id, s2.id, shared_skills
```

### 5. Technology Intelligence

```cypher
// Q: Technology adoption timeline
MATCH (p:Project)-[u:USES]->(t:Technology)
WHERE u.is_primary = true
RETURN t.name, count(p) AS projects,
       min(p.created_at) AS first_adoption
ORDER BY first_adoption

// Q: Find technology expertise (most sessions using tech)
MATCH (s:AgentSession)-[:WORKED_ON]->(p:Project)-[:USES]->(t:Technology)
RETURN t.name, count(DISTINCT s) AS sessions_using
ORDER BY sessions_using DESC

// Q: Technology risk assessment (deprecated/abandoned tech)
MATCH (t:Technology)<-[:USES]-(p:Project)
WHERE NOT (t)<-[:COVERS]-(:Research {date: date() - duration('P6M')})
RETURN t.name, collect(p.name) AS affected_projects
```

### 6. Infrastructure Intelligence

```cypher
// Q: Service dependency map
MATCH path = (p:Project)-[:DEPLOYED_ON]->(s:Service)<-[:INTEGRATES]-(w:Workflow)
RETURN path

// Q: Find single points of failure (services many things depend on)
MATCH (s:Service)<-[:DEPLOYED_ON|INTEGRATES]-(n)
WITH s, count(n) AS dependencies
WHERE dependencies > 3
RETURN s.name, dependencies
ORDER BY dependencies DESC

// Q: Workflow coverage (which projects have automation)
MATCH (p:Project)
OPTIONAL MATCH (p)<-[:AUTOMATES]-(w:Workflow)
RETURN p.name,
       CASE WHEN w IS NULL THEN 'No automation' ELSE w.name END AS automation
```

### 7. Decision Traceability

```cypher
// Q: Why did we choose this technology?
MATCH (d:Decision)-[:CHOSE]->(t:Technology {name: 'Neo4j'})
OPTIONAL MATCH (d)-[r:REJECTED]->(alt:Technology)
RETURN d.choice, d.reasoning, d.date,
       collect({alt: alt.name, reason: r.reason}) AS rejected_alternatives

// Q: Track decision impact
MATCH (d:Decision)-[:AFFECTS]->(p:Project)<-[:WORKED_ON]-(s:AgentSession)
WHERE s.timestamp > d.date
RETURN d.choice, p.name, count(s) AS sessions_after_decision

// Q: Find decisions that may need revisiting
MATCH (d:Decision)-[:CHOSE]->(t:Technology)
WHERE d.date < datetime() - duration('P6M')
  AND NOT exists((d)-[:SUPERSEDED_BY]->())
RETURN d.choice, d.reasoning, d.date,
       duration.between(d.date, datetime()).months AS months_old
ORDER BY months_old DESC
```

### 8. Cross-Domain Intelligence (The Magic)

```cypher
// Q: Full knowledge chain: Research → Learning → Decision → Project → Code
MATCH path = (r:Research)-[:GENERATED]->(:Insight)
                        -[:APPLIES_TO]->(:Project)
                        <-[:AFFECTS]-(d:Decision)
                        -[:CHOSE]->(t:Technology)
                        <-[:USES]-(p2:Project)
                        <-[:PART_OF]-(f:CodeFile)
RETURN path

// Q: Find knowledge gaps (topics with no research)
MATCH (t:Technology)<-[:USES]-(p:Project)
WHERE NOT (t)<-[:COVERS]-(:Research)
RETURN t.name, collect(DISTINCT p.name) AS projects_using
ORDER BY size(projects_using) DESC

// Q: Productivity insights (what leads to successful sessions)
MATCH (s:AgentSession {outcome: 'success'})-[:USED]->(sk:Skill)
MATCH (s)-[:WORKED_ON]->(p:Project)-[:USES]->(t:Technology)
RETURN sk.name, t.name, count(s) AS successful_sessions
ORDER BY successful_sessions DESC
LIMIT 20
```

---

## Integration Architecture

### Neo4j-Only Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                  ImparLabs Dashboard                            │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│                    ┌─────────────────────┐                      │
│                    │       Neo4j         │                      │
│                    │  (Single Source)    │                      │
│                    │                     │                      │
│                    │  • Project CRUD     │                      │
│                    │  • Relationships    │                      │
│                    │  • Graph queries    │                      │
│                    │  • Insights         │                      │
│                    │  • Traversals       │                      │
│                    │  • Simple lookups   │                      │
│                    └──────────┬──────────┘                      │
│                               │                                 │
│                               ▼                                 │
│  ┌─────────────────────────────────────────────────────┐       │
│  │                   Service Layer                      │       │
│  │                                                      │       │
│  │  ProjectService  │  GraphService  │  InsightService  │       │
│  └─────────────────────────────────────────────────────┘       │
│                            │                                    │
│                            ▼                                    │
│  ┌─────────────────────────────────────────────────────┐       │
│  │                     CLI + Web UI                     │       │
│  │                                                      │       │
│  │  imparlabs-dashboard scan   │   Web Graph Explorer   │       │
│  │  imparlabs-dashboard query  │   Dashboard + Insights │       │
│  │  imparlabs-dashboard list   │   Visualization        │       │
│  └─────────────────────────────────────────────────────┘       │
└─────────────────────────────────────────────────────────────────┘
```

### Why Single Database?

| Neo4j Handles Everything |
|--------------------------|
| ✅ Fast project list lookups (Cypher `MATCH (p:Project) RETURN p`) |
| ✅ Simple CRUD operations (native property storage) |
| ✅ Complex relationship traversals |
| ✅ Pattern discovery and intelligence |
| ✅ Graph visualization |
| ✅ Cross-domain queries |
| ✅ Single query language (Cypher) |
| ✅ No sync logic needed |
| ✅ Single backup target |

**Architecture Principle:** One database, one truth, zero complexity.

---

## Implementation Phases

### Phase 1: Neo4j Foundation (Week 1) ✅ COMPLETE

**Objective:** Deploy Neo4j and establish connection from TypeScript project.

**Status:** COMPLETED 2025-12-29

**What Was Implemented:**
1. Neo4j Community Edition 5 deployed locally via Docker
   - `docker/neo4j/docker-compose.yml` - Local development configuration
   - Access: http://localhost:7474 (Browser), bolt://localhost:7687 (Bolt)
   - Credentials: `neo4j` / `knowledge-graph`

2. Sample data and query files created
   - `docker/neo4j/sample-data.cypher` - Initial graph data (Projects, Technologies, Decisions)
   - `docker/neo4j/example-queries.cypher` - 16+ reference queries for all common operations

**Deliverables:**
- [x] Neo4j running locally (Docker) - Coolify deployment deferred
- [x] Sample data with relationships
- [x] Example queries documented
- [ ] TypeScript connection module (pending)

### Phase 2: Core Graph Population (Week 2) 🔄 IN PROGRESS

**Objective:** Populate graph with existing project data.

**Status:** PARTIAL - HelloJune domain imported, general scanner pending

**What Was Implemented (2025-12-29):**

1. **HelloJune Knowledge Graph Imported**
   - **90+ nodes** across 12 node types
   - **113+ relationships** across 14 relationship types
   - Real business domain data (sponsors, zones, coalitions, strategies)

2. **Node Types in HelloJune Graph:**
   | Type | Count | Description |
   |------|-------|-------------|
   | Sponsor | 33 | Potential sponsors with tiers (1-4) |
   | Strategy | 15 | Strategic initiatives |
   | Document | 8 | Key reference documents |
   | Insight | 8 | Strategic insights |
   | ActivationZone | 5 | Festival activation zones |
   | Coalition | 4 | Strategic partnership groupings |
   | Venue | 4 | Event venues |
   | Research | 4 | Research investigations |
   | Person | 3 | Key people |
   | Organization | 3 | Organizations |
   | Deliverable | 2 | Project deliverables |
   | Project | 1 | HelloJune project |

3. **Key Relationships:**
   | Type | Count | Pattern |
   |------|-------|---------|
   | PROPOSED_FOR | 57 | Sponsor → Project |
   | ABOUT | 20 | Strategy/Insight → Topic |
   | SPONSORS_ZONE | 15 | Sponsor → ActivationZone |
   | FOR | 5 | Coalition → Project |

4. **Graph Visualizations Created (via Playwright):**
   - Full HelloJune ecosystem (90 nodes)
   - Tier 1 sponsors and their zones
   - Strategic coalitions network

**Deliverables:**
- [x] HelloJune domain data imported
- [x] Graph visualizations captured
- [ ] `imparlabs-dashboard scan` command (pending)
- [ ] Generic project scanner (pending)
- [ ] Code file graph (pending)

### Phase 3: PAI History Integration (Week 3)

**Objective:** Integrate PAI session history and learnings.

**Tasks:**
1. Build session parser
   - Parse session markdown files
   - Extract metadata (timestamp, tools, files)
   - Create AgentSession nodes

2. Build learning parser
   - Parse learning markdown/json
   - Extract problem/solution pairs
   - Create Learning nodes

3. Build research parser
   - Parse research outputs
   - Create Research nodes
   - Link to topics/technologies

4. Create relationships
   - Sessions → Files modified
   - Sessions → Skills used
   - Learnings → Technologies

**Deliverables:**
- [ ] Session import script
- [ ] Learning import script
- [ ] Research import script
- [ ] Temporal relationships established

### Phase 4: Query Layer & CLI (Week 4)

**Objective:** Expose graph intelligence through CLI commands.

**Tasks:**
1. Implement query service
   - `src/services/GraphService.ts`
   - Parameterized Cypher queries
   - Result formatting

2. Add CLI commands
   - `imparlabs-dashboard query dependencies <project>`
   - `imparlabs-dashboard query insights <topic>`
   - `imparlabs-dashboard query timeline`
   - `imparlabs-dashboard query central-files`

3. Add intelligence commands
   - `imparlabs-dashboard intel similar-projects`
   - `imparlabs-dashboard intel knowledge-gaps`
   - `imparlabs-dashboard intel decision-history`

**Deliverables:**
- [ ] GraphService with common queries
- [ ] CLI query commands
- [ ] CLI intel commands
- [ ] Query result formatting

### Phase 5: Web Visualization (Week 5-6)

**Objective:** Add interactive graph visualization to web UI.

**Tasks:**
1. Integrate Neovis.js
   - Add React component for graph viz
   - Configure node/relationship styling

2. Build visualization views
   - Project dependency graph
   - Knowledge flow (research → insights → projects)
   - Session timeline
   - Technology landscape

3. Add interactive features
   - Click to expand nodes
   - Filter by node type
   - Search and highlight
   - Export graph images

**Deliverables:**
- [ ] Neovis.js integration
- [ ] Multiple visualization views
- [ ] Interactive graph explorer
- [ ] Export functionality

### Phase 6: Continuous Intelligence (Ongoing)

**Objective:** Automate graph enrichment and insight generation.

**Tasks:**
1. Real-time session capture
   - Hook integration to push sessions to Neo4j
   - Automatic relationship creation

2. Scheduled enrichment
   - Daily graph analysis
   - Anomaly detection
   - Insight generation

3. n8n integration
   - Workflow to sync on project changes
   - Alert on interesting patterns

**Deliverables:**
- [ ] Session capture hook
- [ ] Enrichment scheduler
- [ ] n8n workflows
- [ ] Insight generation pipeline

---

## File Structure (After Implementation)

```
imparlabs-dashboard/
├── src/
│   ├── cli/
│   │   ├── index.ts
│   │   ├── commands/
│   │   │   ├── scan.ts           # Scan projects → Neo4j
│   │   │   ├── list.ts           # List from Neo4j
│   │   │   ├── query.ts          # Graph queries
│   │   │   ├── intel.ts          # Intelligence extraction
│   │   │   └── import.ts         # Import PAI history
│   │   └── ...
│   ├── db/                       # Neo4j (replaces SQLite)
│   │   ├── connection.ts         # Neo4j driver management
│   │   ├── schema.ts             # Constraints and indexes
│   │   └── migrations.ts         # Schema versioning
│   ├── models/                   # Graph node models
│   │   ├── Project.ts
│   │   ├── CodeFile.ts
│   │   ├── Session.ts
│   │   ├── Learning.ts
│   │   ├── Research.ts
│   │   └── index.ts
│   ├── queries/                  # Cypher query modules
│   │   ├── dependencies.ts
│   │   ├── insights.ts
│   │   ├── intelligence.ts
│   │   └── index.ts
│   ├── importers/                # Data import modules
│   │   ├── projects.ts           # Filesystem → Neo4j
│   │   ├── sessions.ts           # PAI history → Neo4j
│   │   ├── research.ts           # Research → Neo4j
│   │   └── index.ts
│   ├── services/
│   │   ├── GraphService.ts       # Graph intelligence API
│   │   ├── ScannerService.ts     # Project discovery
│   │   └── ...
│   ├── types/
│   │   ├── index.ts              # Core types
│   │   └── graph.ts              # Graph-specific types
│   └── ...
├── web/
│   ├── src/
│   │   ├── components/
│   │   │   ├── graph/            # Visualization components
│   │   │   │   ├── GraphExplorer.tsx
│   │   │   │   ├── DependencyGraph.tsx
│   │   │   │   ├── KnowledgeFlow.tsx
│   │   │   │   └── Timeline.tsx
│   │   │   └── ...
│   │   └── ...
│   └── ...
├── docker/
│   └── neo4j/                    # Neo4j config for Coolify
│       └── docker-compose.yml
├── CLAUDE.md
├── KNOWLEDGE-GRAPH-ARCHITECTURE.md  # This file
└── ...
```

---

## Infrastructure Requirements

### Neo4j Deployment (Coolify)

**Docker Compose:**
```yaml
version: '3'
services:
  neo4j-kb:
    image: neo4j:latest
    container_name: pai-knowledge-graph
    ports:
      - "7474:7474"
      - "7687:7687"
    environment:
      - NEO4J_AUTH=neo4j/${NEO4J_PASSWORD}
      - NEO4J_server_memory_heap_max__size=2G
      - NEO4J_server_memory_pagecache_size=1G
      - NEO4J_PLUGINS=["apoc"]
    volumes:
      - neo4j-data:/data
      - neo4j-logs:/logs
      - neo4j-plugins:/plugins
    restart: unless-stopped

volumes:
  neo4j-data:
  neo4j-logs:
  neo4j-plugins:
```

**Resource Allocation:**
- Memory: 2-4 GB (heap + page cache)
- CPU: 1-2 cores
- Storage: 10 GB (expandable)

**URLs:**
- Browser: `https://neo4j.imparlabs.com:7474`
- Bolt: `neo4j://neo4j.imparlabs.com:7687`

---

## Success Metrics

### Quantitative
- Graph size: 500+ nodes, 2000+ relationships within 30 days
- Query performance: <100ms for common queries
- Scan latency: <10 seconds for full project scan to Neo4j

### Qualitative
- Ability to answer "why did we choose X?" in <30 seconds
- Discover unexpected connections between projects
- Identify knowledge gaps automatically
- Track research → application pipeline

---

## Risk Mitigation

| Risk | Mitigation |
|------|------------|
| **Complexity creep** | Start with minimal schema, expand gradually |
| **Import failures** | Idempotent import operations, retry logic |
| **Performance issues** | Proper indexing, query profiling from start |
| **Data staleness** | Automated hooks, scheduled scans |
| **Learning curve** | Follow GraphAcademy TypeScript course first |
| **Migration from SQLite** | One-time import, then delete SQLite |

---

## Next Steps

1. ✅ **DONE:** Deploy Neo4j locally (Docker) - 2025-12-29
2. ✅ **DONE:** Import HelloJune knowledge graph - 2025-12-29
3. ✅ **DONE:** Visualize graph via Playwright - 2025-12-29
4. 🔄 **CURRENT:** Build Natural Language Query App
   - Goal: Query Neo4j with natural language
   - Show graph view of results
   - User insight: "Get insights by visually seeing relationships between elements"
5. **NEXT:** Add Neovis.js interactive visualization
6. **NEXT:** Build web dashboard with graph explorer
7. **FUTURE:** Integrate PAI session/learning data

---

**Document Status:** Active implementation - Phase 2 in progress.

**Author:** PAI (Claude Code)
**Last Updated:** 2025-12-29
