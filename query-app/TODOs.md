# TODOs - Knowledge Graph Explorer

## Current State (2025-12-30)

### Local Development: WORKING

- Neo4j running in Docker (localhost:7687)
- 184 nodes, 405 relationships rendering correctly
- 50 edges visible with proper colors and labels
- Natural language queries → Cypher working

### Vercel + AuraDB: BROKEN

- App deployed and loads
- AuraDB connected (48 nodes visible)
- **Critical Bug:** Only 1 edge renders instead of 405
- **Root Cause:** AuraDB 64-bit IDs overflow JavaScript → `Infinity`
- **Status:** ABANDONED - Not fixable without upstream changes

### Groq API: WORKING

- Client-side calls with `dangerouslyAllowBrowser: true`
- Llama 3.3 70B model
- NL → Cypher translation functional

---

## Next Steps: Coolify Deployment

### Phase 1: Deploy Neo4j on Coolify

- [ ] **Create Neo4j service** in Coolify
  - Use Docker Compose (see CLAUDE.md)
  - Image: `neo4j:5-community`
  - Expose ports: 7474 (browser), 7687 (bolt)
  - Configure persistent volume for `/data`

- [ ] **Set environment variables**
  - `NEO4J_AUTH=neo4j/secure-password-here`
  - Generate strong password (not the local dev one)

- [ ] **Import data** from local Neo4j
  - Export: `apoc.export.cypher.all()`
  - Import via cypher-shell or Neo4j Browser

- [ ] **Verify data**
  - Check node count: `MATCH (n) RETURN count(n)`
  - Check relationship count: `MATCH ()-[r]->() RETURN count(r)`
  - Expected: 184 nodes, 405 relationships

### Phase 2: Deploy Query App on Coolify

- [ ] **Create new Nixpacks service**
  - Point to GitHub repo
  - Base directory: `/query-app`

- [ ] **Configure environment variables**
  ```
  VITE_NEO4J_URI=bolt://neo4j-service:7687
  VITE_NEO4J_USER=neo4j
  VITE_NEO4J_PASSWORD=your-coolify-password
  VITE_GROQ_API_KEY=gsk_your_key
  ```

- [ ] **Configure domain**
  - Subdomain: `kg.imparlabs.com` or similar
  - SSL: Let's Encrypt (Coolify handles this)

- [ ] **Test deployment**
  - Verify all 50+ edges render
  - Test natural language queries
  - Check Groq API connectivity

### Phase 3: Polish & Production

- [ ] **Remove debug logging** from GraphViewer.tsx
- [ ] **Update Vercel deployment** to redirect to Coolify URL (optional)
- [ ] **Document Coolify URLs** in README.md

---

## Decisions Log

### 2025-12-30: AuraDB Abandoned

**Decision:** Do not use AuraDB for this project.

**Reason:** 64-bit relationship IDs cause JavaScript overflow, breaking edge rendering in vis.js. This is a fundamental incompatibility between AuraDB and Neovis.js.

**Evidence:**
- Local Neo4j: 50 edges with IDs `[0,1,2,3...]`
- AuraDB: 1 edge with ID `Infinity`

**Alternative:** Fresh Neo4j on Coolify starts with sequential IDs, avoiding the problem entirely.

### 2025-12-30: Coolify Over Vercel

**Decision:** Deploy on Coolify instead of Vercel.

**Reason:**
1. Can host Neo4j and app together (same network)
2. Avoids AuraDB ID overflow issue
3. Full control over database
4. No cold-start latency
5. Cost-effective for ImparLabs infrastructure

---

## Backlog (Future)

- [ ] Add user authentication
- [ ] Save queries to Neo4j
- [ ] Export graph as PNG/SVG
- [ ] Multiple graph layouts (hierarchical, radial)
- [ ] Query builder UI (visual Cypher)
- [ ] Mobile responsive design

---

*Last updated: 2025-12-30*
