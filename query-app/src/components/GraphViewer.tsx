import { useEffect, useRef, useCallback } from 'react';
import NeoVis from 'neovis.js';
import type { NeovisConfig } from 'neovis.js';

// Node colors by label
const NODE_COLORS: Record<string, string> = {
  Project: '#4CAF50', // Green
  Sponsor: '#2196F3', // Blue
  Strategy: '#FF9800', // Orange
  ActivationZone: '#9C27B0', // Purple
  Coalition: '#F44336', // Red
  Document: '#607D8B', // Gray
  Insight: '#00BCD4', // Cyan
  Research: '#795548', // Brown
  Venue: '#E91E63', // Pink
  Person: '#FFEB3B', // Yellow
  Organization: '#3F51B5', // Indigo
  Deliverable: '#8BC34A', // Light Green
  Technology: '#009688', // Teal
  // New node types from festival research data
  Festival: '#FF5722', // Deep Orange - festivals are major entities
  Statistic: '#673AB7', // Deep Purple - data points stand out
  Trend: '#CDDC39', // Lime - trends are dynamic/emerging
  BrandActivation: '#E91E63', // Pink - similar to Venue (event-related)
  ActivationConcept: '#00E676', // Bright Green - strategic concepts
  AudienceInterest: '#29B6F6', // Light Blue - audience segments
  Competitor: '#FF7043', // Deep Orange variant - competition
};

// Node sizes by label (balanced for visibility and spacing)
const NODE_SIZES: Record<string, number> = {
  Project: 40,
  Sponsor: 35,
  Strategy: 32,
  ActivationZone: 40,
  Coalition: 35,
  Document: 28,
  Insight: 28,
  Research: 32,
  Venue: 32,
  Person: 28,
  Organization: 32,
  Deliverable: 28,
  Technology: 32,
  // New node types from festival research data
  Festival: 45, // Large - major entities
  Statistic: 30, // Medium - data points
  Trend: 32, // Medium - market trends
  BrandActivation: 35, // Medium-large - case studies
  ActivationConcept: 35, // Medium-large - strategic concepts
  AudienceInterest: 28, // Small - audience categories
  Competitor: 30, // Medium
};

// Note: Node labels are now determined dynamically by getNodeLabel()
// which checks multiple properties: name > title > content > topic > pitch

interface GraphViewerProps {
  cypher?: string;
  onNodeClick?: (node: NodeData) => void;
  onRelationshipClick?: (relationship: RelationshipData) => void;
}

export interface NodeData {
  id: string;
  labels: string[];
  properties: Record<string, unknown>;
}

export interface RelationshipData {
  id: string;
  type: string;
  properties: Record<string, unknown>;
}

export function GraphViewer({ cypher, onNodeClick, onRelationshipClick }: GraphViewerProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const neovisRef = useRef<NeoVis | null>(null);

  // Initialize NeoVis
  const initNeoVis = useCallback(() => {
    if (!containerRef.current) return;

    // Get server URL and check if it's AuraDB (contains .databases.neo4j.io)
    let serverUrl = import.meta.env.VITE_NEO4J_URI || 'bolt://localhost:7687';
    const isAuraDB = serverUrl.includes('.databases.neo4j.io');

    // For AuraDB: Convert neo4j+s:// to neo4j:// and use config-based encryption
    // This avoids the "Encryption/trust can only be configured either through URL or config" error
    if (isAuraDB && serverUrl.includes('+s://')) {
      serverUrl = serverUrl.replace('neo4j+s://', 'neo4j://').replace('bolt+s://', 'bolt://');
    }

    const config: NeovisConfig = {
      containerId: containerRef.current.id,
      neo4j: {
        serverUrl,
        serverUser: import.meta.env.VITE_NEO4J_USER || 'neo4j',
        serverPassword: import.meta.env.VITE_NEO4J_PASSWORD || 'knowledge-graph',
        // For AuraDB: use config-based encryption instead of URL-based
        // For local: disable encryption
        driverConfig: isAuraDB
          ? { encrypted: 'ENCRYPTION_ON', trust: 'TRUST_SYSTEM_CA_SIGNED_CERTIFICATES' }
          : { encrypted: false },
      },
      visConfig: {
        nodes: {
          shape: 'circle',
          font: {
            size: 11,
            color: '#ffffff',
            strokeWidth: 2,
            strokeColor: '#000000',
            face: 'arial',
            // No bold - cleaner look
          },
          borderWidth: 2,
          borderWidthSelected: 4,
          scaling: {
            min: 30,
            max: 60,
          },
          shadow: {
            enabled: true,
            color: 'rgba(0,0,0,0.3)',
            size: 8,
            x: 2,
            y: 2,
          },
        },
        edges: {
          arrows: {
            to: { enabled: true, scaleFactor: 0.5 },
          },
          font: {
            size: 10,
            color: '#666666',
            align: 'middle',
          },
          smooth: {
            enabled: true,
            type: 'curvedCW',
            roundness: 0.2,
          },
        },
        physics: {
          enabled: true,
          solver: 'barnesHut',
          barnesHut: {
            gravitationalConstant: -30000,
            centralGravity: 0.3,
            springLength: 200,
            springConstant: 0.04,
            damping: 0.15,
            avoidOverlap: 1, // KEY: Prevents node overlap
          },
          stabilization: {
            enabled: true,
            iterations: 1000,
            updateInterval: 50,
            fit: true,
          },
          minVelocity: 0.5,
        },
        interaction: {
          hover: true,
          tooltipDelay: 200,
          hideEdgesOnDrag: true,
          navigationButtons: true,
          keyboard: true,
        },
      },
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      labels: createLabelConfig() as any,
      relationships: {
        // Default relationship styling
        [NeoVis.NEOVIS_DEFAULT_CONFIG]: {
          label: 'type',
          thickness: 2,
        },
      },
      initialCypher: cypher || 'MATCH (n)-[r]-(m) RETURN n, r, m LIMIT 100',
    };

    neovisRef.current = new NeoVis(config);

    // Track if we've set up physics disable for the current render
    let physicsDisabled = false;

    // Event handlers - use type assertion for Neovis event names
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (neovisRef.current as any).registerOnEvent('completed', () => {
      console.log('Graph rendering completed');

      // DEBUG MODE: Set to true to enable verbose edge/node logging
      // Useful for diagnosing AuraDB 64-bit ID overflow issues
      const DEBUG_NEOVIS = false;

      if (DEBUG_NEOVIS && neovisRef.current) {
        const nodes = neovisRef.current.nodes;
        const edges = neovisRef.current.edges;
        console.log('=== NEOVIS DEBUG START ===');
        console.log('Nodes count:', nodes?.length || 0);
        console.log('Edges count:', edges?.length || 0);

        if (nodes && nodes.length > 0) {
          const allNodeIds = nodes.getIds();
          console.log('ALL node IDs:', JSON.stringify(allNodeIds));
          console.log('Node IDs (first 10):', allNodeIds.slice(0, 10));
          const sampleNode = nodes.get(allNodeIds[0]);
          console.log('Sample node structure:', JSON.stringify(sampleNode, null, 2));
        }

        if (edges && edges.length > 0) {
          const allEdges = edges.get();
          console.log('ALL edges count:', allEdges.length);
          const edgeIds = allEdges.map((e: { id: unknown }) => e.id);
          console.log('Edge IDs:', JSON.stringify(edgeIds));
          const nullCount = edgeIds.filter((id: unknown) => id === null || id === undefined).length;
          console.log('Edges with null ID:', nullCount, 'out of', allEdges.length);
          console.log('First 3 edges FULL:', JSON.stringify(allEdges.slice(0, 3), null, 2));
          allEdges.forEach((edge: { id: unknown; from: string | number; to: string | number; raw?: { identity?: unknown } }, i: number) => {
            const fromExists = nodes?.get(edge.from);
            const toExists = nodes?.get(edge.to);
            console.log(`Edge ${i}: id=${edge.id}, rawId=${edge.raw?.identity}, from=${edge.from} (exists: ${!!fromExists}), to=${edge.to} (exists: ${!!toExists})`);
          });
        } else {
          console.log('NO EDGES FOUND!');
        }
        console.log('=== NEOVIS DEBUG END ===');
      }

      // Only set up physics disable once per query
      if (physicsDisabled) return;

      // Wait for network to be available, then disable physics after stabilization
      const checkNetwork = () => {
        if (neovisRef.current) {
          const network = neovisRef.current.network;
          if (network && !physicsDisabled) {
            physicsDisabled = true;
            console.log('✓ Network found, disabling physics after stabilization');

            // Listen for stabilization completion
            network.once('stabilizationIterationsDone', () => {
              network.setOptions({ physics: { enabled: false } });
              console.log('✓ Physics disabled after stabilization - graph is stable');
            });

            // Fallback: disable physics after timeout (for larger graphs that take longer)
            setTimeout(() => {
              network.setOptions({ physics: { enabled: false } });
              console.log('✓ Physics disabled via timeout - graph is stable');
            }, 3000);
          } else if (!network) {
            // Network not ready yet, check again
            setTimeout(checkNetwork, 200);
          }
        }
      };

      checkNetwork();
    });

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (neovisRef.current as any).registerOnEvent('clickNode', (event: { node: { id: string; raw: { labels: string[]; properties: Record<string, unknown> } } }) => {
      if (onNodeClick && event.node) {
        onNodeClick({
          id: event.node.id,
          labels: event.node.raw?.labels || [],
          properties: event.node.raw?.properties || {},
        });
      }
    });

    // Note: clickRelationship event not supported in all Neovis versions
    // Edge click handling can be done via vis.js network events if needed
    try {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (neovisRef.current as any).registerOnEvent('clickEdge', (event: { edge: { id: string; raw: { type: string; properties: Record<string, unknown> } } }) => {
        if (onRelationshipClick && event.edge) {
          onRelationshipClick({
            id: event.edge.id,
            type: event.edge.raw?.type || '',
            properties: event.edge.raw?.properties || {},
          });
        }
      });
    } catch {
      // Edge click not supported, silently ignore
      console.log('Edge click events not supported in this Neovis version');
    }

    neovisRef.current.render();
  }, [cypher, onNodeClick, onRelationshipClick]);

  // Helper function to get display label from node properties
  // Checks multiple possible property names
  function getNodeLabel(node: { properties: Record<string, unknown> }): string {
    const props = node.properties;
    // Priority order: name > title > content > topic > pitch
    const nameProps = ['name', 'title', 'content', 'topic', 'pitch'];

    for (const prop of nameProps) {
      const value = props[prop];
      if (value && typeof value === 'string' && value.trim()) {
        // Truncate long strings for display
        if (value.length > 30) {
          return value.substring(0, 27) + '...';
        }
        return value;
      }
    }

    // Fallback to id if available
    if (props.id && typeof props.id === 'string') {
      return props.id;
    }

    return '?'; // Single character for truly unknown nodes
  }

  // Create label configuration for all node types
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  function createLabelConfig(): Record<string | symbol, any> {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const config: Record<string | symbol, any> = {};

    for (const [label, color] of Object.entries(NODE_COLORS)) {
      config[label] = {
        [NeoVis.NEOVIS_ADVANCED_CONFIG]: {
          // Dynamic function to get label from multiple possible properties
          function: {
            label: getNodeLabel,
          },
          // Static vis.js node options for styling
          static: {
            size: NODE_SIZES[label] || 40,
            color: {
              background: color,
              border: color,
              highlight: {
                background: color,
                border: '#ffffff',
              },
              hover: {
                background: color,
                border: '#ffffff',
              },
            },
            shape: 'circle',
            font: {
              color: '#ffffff',
              size: 11,
              strokeWidth: 2,
              strokeColor: '#000000',
            },
          },
        },
      };
    }

    // Default config for unknown labels
    config[NeoVis.NEOVIS_DEFAULT_CONFIG] = {
      [NeoVis.NEOVIS_ADVANCED_CONFIG]: {
        function: {
          label: getNodeLabel,
        },
        static: {
          size: 35,
          color: {
            background: '#888888',
            border: '#666666',
            highlight: {
              background: '#999999',
              border: '#ffffff',
            },
            hover: {
              background: '#aaaaaa',
              border: '#ffffff',
            },
          },
          shape: 'circle',
          font: {
            color: '#ffffff',
            size: 11,
            strokeWidth: 2,
            strokeColor: '#000000',
          },
        },
      },
    };

    return config;
  }

  // Update query when cypher prop changes
  useEffect(() => {
    if (neovisRef.current && cypher) {
      neovisRef.current.renderWithCypher(cypher);
    } else if (!neovisRef.current && containerRef.current) {
      initNeoVis();
    }
  }, [cypher, initNeoVis]);

  // Initialize on mount
  useEffect(() => {
    // Generate unique ID for container
    if (containerRef.current && !containerRef.current.id) {
      containerRef.current.id = `neovis-${Date.now()}`;
    }

    initNeoVis();

    return () => {
      // Cleanup
      if (neovisRef.current) {
        neovisRef.current.clearNetwork();
        neovisRef.current = null;
      }
    };
  }, [initNeoVis]);

  return (
    <div className="graph-viewer">
      <div
        ref={containerRef}
        id="neovis-container"
        style={{
          width: '100%',
          height: '600px',
          border: '1px solid #333',
          borderRadius: '8px',
          backgroundColor: '#1a1a1a',
        }}
      />
      <div className="legend" style={{ marginTop: '16px' }}>
        <h4 style={{ margin: '0 0 8px 0', color: '#888' }}>Node Types</h4>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
          {Object.entries(NODE_COLORS).map(([label, color]) => (
            <div
              key={label}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '4px',
                padding: '4px 8px',
                backgroundColor: '#2a2a2a',
                borderRadius: '4px',
              }}
            >
              <span
                style={{
                  width: '12px',
                  height: '12px',
                  borderRadius: '50%',
                  backgroundColor: color,
                }}
              />
              <span style={{ fontSize: '12px', color: '#ccc' }}>{label}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
