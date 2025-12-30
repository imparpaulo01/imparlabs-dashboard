// ============================================
// ImparLabs Knowledge Graph - Example Queries
// Copy & paste these into Neo4j Browser to explore
// ============================================

// ============================================
// BASIC QUERIES (Test the basics)
// ============================================

// 1. List all projects
MATCH (p:Project)
RETURN p.name, p.status, p.type
ORDER BY p.name;

// 2. List all technologies
MATCH (t:Technology)
RETURN t.name, t.category
ORDER BY t.category, t.name;

// 3. Count nodes by type
MATCH (n)
RETURN labels(n)[0] AS type, count(n) AS count
ORDER BY count DESC;

// ============================================
// RELATIONSHIP QUERIES (The power of graphs!)
// ============================================

// 4. What technologies does each project use?
MATCH (p:Project)-[:USES]->(t:Technology)
RETURN p.name AS project, collect(t.name) AS technologies
ORDER BY p.name;

// 5. Which projects share technologies? (find similarities)
MATCH (p1:Project)-[:USES]->(t:Technology)<-[:USES]-(p2:Project)
WHERE p1.name < p2.name
WITH p1, p2, collect(t.name) AS shared
RETURN p1.name, p2.name, shared, size(shared) AS overlap
ORDER BY overlap DESC;

// 6. What's the most used technology?
MATCH (t:Technology)<-[:USES]-(p:Project)
RETURN t.name, count(p) AS usage
ORDER BY usage DESC;

// ============================================
// INTELLIGENCE QUERIES (Insights!)
// ============================================

// 7. Full decision traceability: Research → Decision → Project
MATCH path = (r:Research)-[:INFORMED]->(d:Decision)-[:AFFECTS]->(p:Project)
RETURN r.title AS research, d.choice AS decision, p.name AS affected_project;

// 8. Technology decision trail: What research led to choosing a technology?
MATCH (r:Research)-[:INFORMED]->(d:Decision)-[:CHOSE]->(t:Technology)
RETURN r.title, d.reasoning, t.name AS chosen_tech;

// 9. Where are projects deployed?
MATCH (p:Project)-[dep:DEPLOYED_ON]->(s:Service)
RETURN p.name, s.name AS service, s.url, dep.environment;

// ============================================
// VISUAL QUERIES (Pretty graphs!)
// ============================================

// 10. Show the entire graph (small datasets only!)
MATCH (n)
OPTIONAL MATCH (n)-[r]->(m)
RETURN n, r, m
LIMIT 100;

// 11. Show project-technology network
MATCH (p:Project)-[r:USES]->(t:Technology)
RETURN p, r, t;

// 12. Show decision flow
MATCH path = (r:Research)-[:INFORMED|CHOSE|AFFECTS*]->(end)
RETURN path;

// ============================================
// PATHFINDING (Multi-hop relationships)
// ============================================

// 13. How is PAI connected to Neo4j? (any path)
MATCH path = shortestPath((pai:Project {name: 'PAI'})-[*]-(neo:Technology {name: 'Neo4j'}))
RETURN path;

// 14. Find all paths between two projects
MATCH path = (p1:Project {name: 'PAI'})-[*1..3]-(p2:Project {name: 'imparlabs-dashboard'})
RETURN path;

// ============================================
// AGGREGATIONS
// ============================================

// 15. Projects by status
MATCH (p:Project)
RETURN p.status, count(p) AS count, collect(p.name) AS projects;

// 16. Technology categories breakdown
MATCH (t:Technology)
RETURN t.category, count(t) AS count, collect(t.name) AS technologies;
