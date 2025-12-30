import neo4j, { Driver, Session, Record as Neo4jRecord } from 'neo4j-driver';

// Neo4j connection configuration
const NEO4J_URI = import.meta.env.VITE_NEO4J_URI || 'bolt://localhost:7687';
const NEO4J_USER = import.meta.env.VITE_NEO4J_USER || 'neo4j';
const NEO4J_PASSWORD = import.meta.env.VITE_NEO4J_PASSWORD || 'knowledge-graph';

let driver: Driver | null = null;

/**
 * Get or create Neo4j driver instance (singleton)
 */
export function getDriver(): Driver {
  if (!driver) {
    driver = neo4j.driver(NEO4J_URI, neo4j.auth.basic(NEO4J_USER, NEO4J_PASSWORD));
  }
  return driver;
}

/**
 * Close the Neo4j driver connection
 */
export async function closeDriver(): Promise<void> {
  if (driver) {
    await driver.close();
    driver = null;
  }
}

/**
 * Execute a Cypher query and return results
 */
export async function executeQuery(cypher: string): Promise<QueryResult> {
  const driver = getDriver();
  const session: Session = driver.session();

  try {
    const result = await session.run(cypher);
    return formatResult(result.records);
  } finally {
    await session.close();
  }
}

/**
 * Result structure for graph visualization
 */
export interface QueryResult {
  nodes: GraphNode[];
  relationships: GraphRelationship[];
  raw: Neo4jRecord[];
}

export interface GraphNode {
  id: string;
  labels: string[];
  properties: Record<string, unknown>;
}

export interface GraphRelationship {
  id: string;
  type: string;
  startNodeId: string;
  endNodeId: string;
  properties: Record<string, unknown>;
}

/**
 * Format Neo4j records into nodes and relationships for visualization
 */
function formatResult(records: Neo4jRecord[]): QueryResult {
  const nodesMap = new Map<string, GraphNode>();
  const relationshipsMap = new Map<string, GraphRelationship>();

  for (const record of records) {
    for (const value of record.values()) {
      processValue(value, nodesMap, relationshipsMap);
    }
  }

  return {
    nodes: Array.from(nodesMap.values()),
    relationships: Array.from(relationshipsMap.values()),
    raw: records,
  };
}

/**
 * Process a value from a Neo4j record
 */
function processValue(
  value: unknown,
  nodesMap: Map<string, GraphNode>,
  relationshipsMap: Map<string, GraphRelationship>
): void {
  if (!value || typeof value !== 'object') return;

  // Check if it's a Node
  if ('labels' in value && 'properties' in value && 'identity' in value) {
    const node = value as {
      identity: { toString(): string };
      labels: string[];
      properties: Record<string, unknown>;
    };
    const id = node.identity.toString();
    if (!nodesMap.has(id)) {
      nodesMap.set(id, {
        id,
        labels: node.labels,
        properties: node.properties,
      });
    }
  }

  // Check if it's a Relationship
  if ('type' in value && 'start' in value && 'end' in value && 'identity' in value) {
    const rel = value as {
      identity: { toString(): string };
      type: string;
      start: { toString(): string };
      end: { toString(): string };
      properties: Record<string, unknown>;
    };
    const id = rel.identity.toString();
    if (!relationshipsMap.has(id)) {
      relationshipsMap.set(id, {
        id,
        type: rel.type,
        startNodeId: rel.start.toString(),
        endNodeId: rel.end.toString(),
        properties: rel.properties,
      });
    }
  }

  // Check if it's a Path
  if ('segments' in value) {
    const path = value as {
      segments: Array<{
        start: unknown;
        relationship: unknown;
        end: unknown;
      }>;
    };
    for (const segment of path.segments) {
      processValue(segment.start, nodesMap, relationshipsMap);
      processValue(segment.relationship, nodesMap, relationshipsMap);
      processValue(segment.end, nodesMap, relationshipsMap);
    }
  }

  // Handle arrays
  if (Array.isArray(value)) {
    for (const item of value) {
      processValue(item, nodesMap, relationshipsMap);
    }
  }
}

/**
 * Test the Neo4j connection
 */
export async function testConnection(): Promise<boolean> {
  try {
    const driver = getDriver();
    const session = driver.session();
    await session.run('RETURN 1');
    await session.close();
    return true;
  } catch (error) {
    console.error('Neo4j connection test failed:', error);
    return false;
  }
}

/**
 * Get graph statistics
 */
export async function getGraphStats(): Promise<{ nodeCount: number; relationshipCount: number }> {
  const result = await executeQuery(`
    MATCH (n)
    WITH count(n) AS nodes
    MATCH ()-[r]->()
    RETURN nodes, count(r) AS relationships
  `);

  if (result.raw.length > 0) {
    const record = result.raw[0];
    return {
      nodeCount: record.get('nodes').toNumber(),
      relationshipCount: record.get('relationships').toNumber(),
    };
  }
  return { nodeCount: 0, relationshipCount: 0 };
}
