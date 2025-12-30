import type { NodeData, RelationshipData } from './GraphViewer';

// Node colors by label (same as GraphViewer for consistency)
const NODE_COLORS: Record<string, string> = {
  Project: '#4CAF50',
  Sponsor: '#2196F3',
  Strategy: '#FF9800',
  ActivationZone: '#9C27B0',
  Coalition: '#F44336',
  Document: '#607D8B',
  Insight: '#00BCD4',
  Research: '#795548',
  Venue: '#E91E63',
  Person: '#FFEB3B',
  Organization: '#3F51B5',
  Deliverable: '#8BC34A',
  Technology: '#009688',
  // New node types from festival research data
  Festival: '#FF5722',
  Statistic: '#673AB7',
  Trend: '#CDDC39',
  BrandActivation: '#E91E63',
  ActivationConcept: '#00E676',
  AudienceInterest: '#29B6F6',
  Competitor: '#FF7043',
};

/**
 * Get the display name for a node by checking multiple possible properties.
 * Different node types use different property names for their display name:
 * - Most nodes: 'name'
 * - Insight/Research: 'title' or 'content'
 * - Some Strategy: 'title'
 */
function getNodeDisplayName(properties: Record<string, unknown>): string {
  // Priority order: name > title > content > id
  const nameProps = ['name', 'title', 'content', 'topic', 'pitch'];

  for (const prop of nameProps) {
    const value = properties[prop];
    if (value && typeof value === 'string' && value.trim()) {
      // Truncate long content strings
      if (prop === 'content' && value.length > 50) {
        return value.substring(0, 50) + '...';
      }
      return value;
    }
  }

  // Fallback to id if available
  if (properties.id && typeof properties.id === 'string') {
    return properties.id;
  }

  return 'Unnamed';
}

/**
 * Sort properties in a logical order for display.
 * Groups related properties together (e.g., unit before value).
 */
function sortProperties(entries: [string, unknown][]): [string, unknown][] {
  // Define priority order - lower number = higher priority (appears first)
  const priorityOrder: Record<string, number> = {
    name: 1,
    title: 2,
    description: 3,
    unit: 10,      // unit right before value
    value: 11,     // value right after unit
    metric: 12,    // metric after value
    year: 15,
    category: 20,
    source: 25,
    tier: 30,
    country: 35,
    location: 36,
    attendees: 37,
    gender_split: 38,
    founded: 39,
    model: 40,
    sponsor_cost: 41,
    pr_value: 42,
    price: 43,
    reasoning: 50,
    activation_concept: 51,
    type: 60,
    status: 70,
  };

  return entries.sort(([keyA], [keyB]) => {
    const priorityA = priorityOrder[keyA] ?? 100; // Unknown keys get low priority
    const priorityB = priorityOrder[keyB] ?? 100;
    if (priorityA !== priorityB) {
      return priorityA - priorityB;
    }
    // If same priority, sort alphabetically
    return keyA.localeCompare(keyB);
  });
}

interface NodeDetailsProps {
  selectedNode?: NodeData | null;
  selectedRelationship?: RelationshipData | null;
  onClose: () => void;
}

export function NodeDetails({ selectedNode, selectedRelationship, onClose }: NodeDetailsProps) {
  if (!selectedNode && !selectedRelationship) {
    return null;
  }

  const getLabelColor = (labels: string[]): string => {
    for (const label of labels) {
      if (NODE_COLORS[label]) {
        return NODE_COLORS[label];
      }
    }
    return '#888888';
  };

  return (
    <div
      style={{
        position: 'absolute',
        top: '16px',
        right: '16px',
        width: '350px',
        maxHeight: '500px',
        overflow: 'auto',
        backgroundColor: '#1e1e1e',
        border: '1px solid #444',
        borderRadius: '8px',
        zIndex: 1000,
        boxShadow: '0 8px 16px rgba(0, 0, 0, 0.4)',
      }}
    >
      {/* Header */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          padding: '12px 16px',
          borderBottom: '1px solid #333',
          backgroundColor: '#252525',
          borderRadius: '8px 8px 0 0',
        }}
      >
        <h3 style={{ margin: 0, color: '#fff', fontSize: '14px', fontWeight: 600 }}>
          {selectedNode ? 'Node Details' : 'Relationship Details'}
        </h3>
        <button
          onClick={onClose}
          style={{
            width: '28px',
            height: '28px',
            border: 'none',
            borderRadius: '6px',
            backgroundColor: '#333',
            color: '#aaa',
            cursor: 'pointer',
            fontSize: '18px',
            lineHeight: '1',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            transition: 'all 0.2s',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = '#444';
            e.currentTarget.style.color = '#fff';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = '#333';
            e.currentTarget.style.color = '#aaa';
          }}
        >
          ×
        </button>
      </div>

      {selectedNode && (
        <div style={{ padding: '16px' }}>
          {/* Node visual representation */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              marginBottom: '16px',
            }}
          >
            <div
              style={{
                width: '48px',
                height: '48px',
                minWidth: '48px',
                minHeight: '48px',
                flexShrink: 0,
                borderRadius: '50%',
                backgroundColor: getLabelColor(selectedNode.labels),
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 2px 8px rgba(0, 0, 0, 0.3)',
                border: '3px solid rgba(255, 255, 255, 0.2)',
              }}
            >
              <span style={{ color: '#fff', fontSize: '14px', fontWeight: 600 }}>
                {getNodeDisplayName(selectedNode.properties).charAt(0).toUpperCase()}
              </span>
            </div>
            <div>
              <div style={{ color: '#fff', fontSize: '16px', fontWeight: 600 }}>
                {getNodeDisplayName(selectedNode.properties)}
              </div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px', marginTop: '4px' }}>
                {selectedNode.labels.map((label) => (
                  <span
                    key={label}
                    style={{
                      padding: '2px 8px',
                      backgroundColor: getLabelColor([label]),
                      color: '#fff',
                      borderRadius: '12px',
                      fontSize: '11px',
                      fontWeight: 500,
                    }}
                  >
                    {label}
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* ID badge */}
          <div
            style={{
              display: 'inline-block',
              padding: '4px 10px',
              backgroundColor: '#333',
              borderRadius: '4px',
              marginBottom: '16px',
            }}
          >
            <span style={{ color: '#888', fontSize: '11px' }}>ID: </span>
            <span style={{ color: '#aaa', fontSize: '11px', fontFamily: 'monospace' }}>
              {selectedNode.id}
            </span>
          </div>

          {/* Properties Table */}
          <div>
            <h4 style={{ margin: '0 0 12px 0', color: '#888', fontSize: '12px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
              Properties
            </h4>
            {Object.entries(selectedNode.properties).length === 0 ? (
              <div style={{ color: '#666', fontSize: '13px', fontStyle: 'italic' }}>
                No properties
              </div>
            ) : (
              <table
                style={{
                  width: '100%',
                  borderCollapse: 'collapse',
                  fontSize: '13px',
                }}
              >
                <tbody>
                  {sortProperties(Object.entries(selectedNode.properties)).map(([key, value], index) => (
                    <tr
                      key={key}
                      style={{
                        backgroundColor: index % 2 === 0 ? '#252525' : '#1e1e1e',
                      }}
                    >
                      <td
                        style={{
                          padding: '8px 12px',
                          color: getLabelColor(selectedNode.labels),
                          fontWeight: 500,
                          width: '35%',
                          verticalAlign: 'top',
                          borderBottom: '1px solid #333',
                        }}
                      >
                        {key}
                      </td>
                      <td
                        style={{
                          padding: '8px 12px',
                          color: '#ddd',
                          wordBreak: 'break-word',
                          borderBottom: '1px solid #333',
                        }}
                      >
                        {formatValue(value)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      )}

      {selectedRelationship && (
        <div style={{ padding: '16px' }}>
          {/* Relationship type badge */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              marginBottom: '16px',
            }}
          >
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
              }}
            >
              <div
                style={{
                  width: '24px',
                  height: '3px',
                  backgroundColor: '#F44336',
                  borderRadius: '2px',
                }}
              />
              <div
                style={{
                  width: '0',
                  height: '0',
                  borderTop: '6px solid transparent',
                  borderBottom: '6px solid transparent',
                  borderLeft: '10px solid #F44336',
                }}
              />
            </div>
            <span
              style={{
                padding: '6px 14px',
                backgroundColor: '#F44336',
                color: '#fff',
                borderRadius: '4px',
                fontSize: '13px',
                fontWeight: 600,
                letterSpacing: '0.5px',
              }}
            >
              {selectedRelationship.type}
            </span>
          </div>

          {/* ID badge */}
          <div
            style={{
              display: 'inline-block',
              padding: '4px 10px',
              backgroundColor: '#333',
              borderRadius: '4px',
              marginBottom: '16px',
            }}
          >
            <span style={{ color: '#888', fontSize: '11px' }}>ID: </span>
            <span style={{ color: '#aaa', fontSize: '11px', fontFamily: 'monospace' }}>
              {selectedRelationship.id}
            </span>
          </div>

          {/* Properties Table */}
          {Object.entries(selectedRelationship.properties).length > 0 && (
            <div>
              <h4 style={{ margin: '0 0 12px 0', color: '#888', fontSize: '12px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                Properties
              </h4>
              <table
                style={{
                  width: '100%',
                  borderCollapse: 'collapse',
                  fontSize: '13px',
                }}
              >
                <tbody>
                  {Object.entries(selectedRelationship.properties).map(([key, value], index) => (
                    <tr
                      key={key}
                      style={{
                        backgroundColor: index % 2 === 0 ? '#252525' : '#1e1e1e',
                      }}
                    >
                      <td
                        style={{
                          padding: '8px 12px',
                          color: '#F44336',
                          fontWeight: 500,
                          width: '35%',
                          verticalAlign: 'top',
                          borderBottom: '1px solid #333',
                        }}
                      >
                        {key}
                      </td>
                      <td
                        style={{
                          padding: '8px 12px',
                          color: '#ddd',
                          wordBreak: 'break-word',
                          borderBottom: '1px solid #333',
                        }}
                      >
                        {formatValue(value)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {Object.entries(selectedRelationship.properties).length === 0 && (
            <div style={{ color: '#666', fontSize: '13px', fontStyle: 'italic' }}>
              No properties
            </div>
          )}
        </div>
      )}
    </div>
  );
}

/**
 * Format large numbers with readable suffixes
 */
function formatLargeNumber(num: number): string {
  if (num >= 1_000_000_000_000) {
    return (num / 1_000_000_000_000).toFixed(1).replace(/\.0$/, '') + 'T';
  }
  if (num >= 1_000_000_000) {
    return (num / 1_000_000_000).toFixed(1).replace(/\.0$/, '') + 'B';
  }
  if (num >= 1_000_000) {
    return (num / 1_000_000).toFixed(1).replace(/\.0$/, '') + 'M';
  }
  if (num >= 1_000) {
    return (num / 1_000).toFixed(1).replace(/\.0$/, '') + 'K';
  }
  return num.toLocaleString();
}

/**
 * Format a property value for display
 */
function formatValue(value: unknown): string {
  if (value === null || value === undefined) {
    return 'null';
  }

  if (typeof value === 'object') {
    // Handle Neo4j Integer
    if ('low' in (value as object) && 'high' in (value as object)) {
      const neo4jInt = value as { low: number; high: number };
      const num = neo4jInt.low;
      // Format large numbers with suffix
      if (num >= 1000) {
        return formatLargeNumber(num);
      }
      return String(num);
    }

    // Handle arrays
    if (Array.isArray(value)) {
      return value.map((v) => formatValue(v)).join(', ');
    }

    // Handle other objects
    return JSON.stringify(value, null, 2);
  }

  // Format large numbers
  if (typeof value === 'number' && value >= 1000) {
    return formatLargeNumber(value);
  }

  return String(value);
}
