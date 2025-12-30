// ============================================
// ImparLabs Knowledge Graph - Sample Data
// Run this in Neo4j Browser to test the schema
// ============================================

// Clear existing data (optional - uncomment if needed)
// MATCH (n) DETACH DELETE n;

// ============================================
// CREATE SAMPLE PROJECTS
// ============================================

CREATE (pai:Project {
  id: 'pai-001',
  name: 'PAI',
  description: 'Personal AI Infrastructure - Claude Code based AI assistant',
  status: 'development',
  type: 'ai-agent',
  path: '/var/home/paulo/Documentos/IMPAR/PAI',
  created_at: datetime('2025-01-01'),
  last_scanned: datetime()
})

CREATE (dashboard:Project {
  id: 'dashboard-001',
  name: 'imparlabs-dashboard',
  description: 'Project Portfolio Management System with Knowledge Graph',
  status: 'development',
  type: 'tool',
  path: '/var/home/paulo/Documentos/IMPAR/1 - PROJECTOS/1 - PROJECTOS EM DEV/imparlabs-dashboard',
  created_at: datetime('2025-12-01'),
  last_scanned: datetime()
})

CREATE (landing:Project {
  id: 'landing-001',
  name: 'imparlabs-landing',
  description: 'ImparLabs company landing page',
  status: 'production',
  type: 'web-app',
  path: '/var/home/paulo/Documentos/IMPAR/1 - PROJECTOS/2 - PROJECTOS EM PROD/imparlabs-landing',
  created_at: datetime('2025-06-01'),
  last_scanned: datetime()
})

// ============================================
// CREATE TECHNOLOGIES
// ============================================

CREATE (ts:Technology {name: 'TypeScript', category: 'backend'})
CREATE (neo4j:Technology {name: 'Neo4j', category: 'database'})
CREATE (react:Technology {name: 'React', category: 'frontend'})
CREATE (nodejs:Technology {name: 'Node.js', category: 'backend'})
CREATE (docker:Technology {name: 'Docker', category: 'deployment'})
CREATE (claude:Technology {name: 'Claude Code', category: 'ai-ml'})

// ============================================
// CREATE RELATIONSHIPS: Projects use Technologies
// ============================================

CREATE (pai)-[:USES {is_primary: true}]->(ts)
CREATE (pai)-[:USES {is_primary: true}]->(claude)
CREATE (pai)-[:USES]->(docker)

CREATE (dashboard)-[:USES {is_primary: true}]->(ts)
CREATE (dashboard)-[:USES {is_primary: true}]->(neo4j)
CREATE (dashboard)-[:USES]->(nodejs)
CREATE (dashboard)-[:USES]->(docker)

CREATE (landing)-[:USES {is_primary: true}]->(react)
CREATE (landing)-[:USES {is_primary: true}]->(ts)
CREATE (landing)-[:USES]->(docker)

// ============================================
// CREATE SAMPLE RESEARCH
// ============================================

CREATE (research1:Research {
  id: 'research-001',
  title: 'Neo4j Knowledge Graph Investigation',
  topic: 'graph-databases',
  date: date('2025-12-29'),
  summary: 'Investigated Neo4j for building knowledge graph to link all ImparLabs knowledge'
})

// Research covers technologies
CREATE (research1)-[:COVERS]->(neo4j)

// ============================================
// CREATE SAMPLE DECISION
// ============================================

CREATE (decision1:Decision {
  id: 'decision-001',
  category: 'architecture',
  date: datetime('2025-12-29'),
  choice: 'Neo4j-only architecture',
  reasoning: 'Single database eliminates sync complexity, one query language, no data drift'
})

// Decision relationships
CREATE (decision1)-[:AFFECTS]->(dashboard)
CREATE (decision1)-[:CHOSE]->(neo4j)
CREATE (research1)-[:INFORMED]->(decision1)

// ============================================
// CREATE SAMPLE SERVICE (Infrastructure)
// ============================================

CREATE (coolify:Service {
  name: 'Coolify',
  url: 'https://coolify.imparlabs.com',
  type: 'deployment',
  status: 'active'
})

CREATE (n8n:Service {
  name: 'n8n',
  url: 'https://n8n.imparlabs.com',
  type: 'automation',
  status: 'active'
})

// Projects deploy on services
CREATE (landing)-[:DEPLOYED_ON {environment: 'production'}]->(coolify)
CREATE (dashboard)-[:DEPLOYED_ON {environment: 'development'}]->(coolify)

// ============================================
// RETURN SUMMARY
// ============================================

RETURN 'Sample data created successfully!' AS message;
