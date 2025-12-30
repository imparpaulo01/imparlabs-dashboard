export interface QueryHistoryItem {
  id: string;
  naturalLanguage: string;
  cypher: string;
  timestamp: number;
  nodeCount?: number;
  relationshipCount?: number;
}

interface QueryHistoryProps {
  history: QueryHistoryItem[];
  onSelectQuery: (item: QueryHistoryItem) => void;
  onClearHistory: () => void;
}

export function QueryHistory({ history, onSelectQuery, onClearHistory }: QueryHistoryProps) {
  if (history.length === 0) {
    return (
      <div
        style={{
          padding: '16px',
          backgroundColor: '#1a1a1a',
          borderRadius: '8px',
          color: '#666',
          textAlign: 'center',
        }}
      >
        No queries yet. Try asking a question above!
      </div>
    );
  }

  return (
    <div className="query-history">
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '12px',
        }}
      >
        <h3 style={{ margin: 0, color: '#888', fontSize: '14px' }}>Recent Queries</h3>
        <button
          onClick={onClearHistory}
          style={{
            padding: '4px 8px',
            fontSize: '12px',
            border: '1px solid #333',
            borderRadius: '4px',
            backgroundColor: 'transparent',
            color: '#666',
            cursor: 'pointer',
            transition: 'all 0.2s',
          }}
          onMouseOver={(e) => {
            e.currentTarget.style.borderColor = '#F44336';
            e.currentTarget.style.color = '#F44336';
          }}
          onMouseOut={(e) => {
            e.currentTarget.style.borderColor = '#333';
            e.currentTarget.style.color = '#666';
          }}
        >
          Clear All
        </button>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
        {history.map((item) => (
          <div
            key={item.id}
            onClick={() => onSelectQuery(item)}
            style={{
              padding: '12px',
              backgroundColor: '#1a1a1a',
              border: '1px solid #333',
              borderRadius: '8px',
              cursor: 'pointer',
              transition: 'all 0.2s',
            }}
            onMouseOver={(e) => {
              e.currentTarget.style.backgroundColor = '#2a2a2a';
              e.currentTarget.style.borderColor = '#4CAF50';
            }}
            onMouseOut={(e) => {
              e.currentTarget.style.backgroundColor = '#1a1a1a';
              e.currentTarget.style.borderColor = '#333';
            }}
          >
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'flex-start',
                marginBottom: '8px',
              }}
            >
              <span style={{ color: '#fff', fontWeight: 500 }}>{item.naturalLanguage}</span>
              <span style={{ color: '#666', fontSize: '12px' }}>
                {formatTimestamp(item.timestamp)}
              </span>
            </div>

            <div
              style={{
                fontFamily: 'monospace',
                fontSize: '12px',
                color: '#4CAF50',
                backgroundColor: '#0a0a0a',
                padding: '8px',
                borderRadius: '4px',
                overflow: 'auto',
                whiteSpace: 'pre-wrap',
                wordBreak: 'break-all',
              }}
            >
              {item.cypher}
            </div>

            {(item.nodeCount !== undefined || item.relationshipCount !== undefined) && (
              <div
                style={{
                  marginTop: '8px',
                  display: 'flex',
                  gap: '16px',
                  fontSize: '12px',
                  color: '#666',
                }}
              >
                {item.nodeCount !== undefined && <span>Nodes: {item.nodeCount}</span>}
                {item.relationshipCount !== undefined && (
                  <span>Relationships: {item.relationshipCount}</span>
                )}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

/**
 * Format timestamp to relative time
 */
function formatTimestamp(timestamp: number): string {
  const diff = Date.now() - timestamp;
  const seconds = Math.floor(diff / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);

  if (seconds < 60) {
    return 'Just now';
  } else if (minutes < 60) {
    return `${minutes}m ago`;
  } else if (hours < 24) {
    return `${hours}h ago`;
  } else {
    return new Date(timestamp).toLocaleDateString();
  }
}

// Storage utilities
const STORAGE_KEY = 'neo4j-query-history';
const MAX_HISTORY_ITEMS = 10;

export function loadHistory(): QueryHistoryItem[] {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      return JSON.parse(stored);
    }
  } catch (error) {
    console.error('Failed to load query history:', error);
  }
  return [];
}

export function saveHistory(history: QueryHistoryItem[]): void {
  try {
    // Keep only the most recent items
    const trimmed = history.slice(0, MAX_HISTORY_ITEMS);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(trimmed));
  } catch (error) {
    console.error('Failed to save query history:', error);
  }
}

export function addToHistory(
  history: QueryHistoryItem[],
  item: Omit<QueryHistoryItem, 'id' | 'timestamp'>
): QueryHistoryItem[] {
  const newItem: QueryHistoryItem = {
    ...item,
    id: `query-${Date.now()}`,
    timestamp: Date.now(),
  };

  // Remove duplicates (same natural language query)
  const filtered = history.filter((h) => h.naturalLanguage !== item.naturalLanguage);

  // Add new item at the beginning
  const updated = [newItem, ...filtered].slice(0, MAX_HISTORY_ITEMS);

  saveHistory(updated);
  return updated;
}

export function clearHistory(): QueryHistoryItem[] {
  localStorage.removeItem(STORAGE_KEY);
  return [];
}
