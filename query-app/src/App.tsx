import { useState, useEffect, useCallback } from 'react';
import { GraphViewer } from './components/GraphViewer';
import type { NodeData, RelationshipData } from './components/GraphViewer';
import { QueryInput } from './components/QueryInput';
import {
  QueryHistory,
  loadHistory,
  addToHistory,
  clearHistory,
} from './components/QueryHistory';
import type { QueryHistoryItem } from './components/QueryHistory';
import { NodeDetails } from './components/NodeDetails';
import { generateCypher, isGroqConfigured } from './lib/groq';
import { testConnection, getGraphStats } from './lib/neo4j';
import './App.css';

function App() {
  // State
  const [cypher, setCypher] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [history, setHistory] = useState<QueryHistoryItem[]>([]);
  const [selectedNode, setSelectedNode] = useState<NodeData | null>(null);
  const [selectedRelationship, setSelectedRelationship] = useState<RelationshipData | null>(null);
  const [connectionStatus, setConnectionStatus] = useState<'checking' | 'connected' | 'failed'>(
    'checking'
  );
  const [graphStats, setGraphStats] = useState<{ nodeCount: number; relationshipCount: number } | null>(null);

  // Load history and check connection on mount
  useEffect(() => {
    setHistory(loadHistory());

    // Check Neo4j connection
    testConnection().then((connected) => {
      setConnectionStatus(connected ? 'connected' : 'failed');
      if (connected) {
        getGraphStats().then(setGraphStats);
      }
    });
  }, []);

  // Handle query submission
  const handleQuery = useCallback(async (naturalLanguage: string) => {
    setIsLoading(true);
    setError(null);
    setSelectedNode(null);
    setSelectedRelationship(null);

    try {
      // Generate Cypher from natural language
      const result = await generateCypher(naturalLanguage);

      // Update cypher state (triggers graph update)
      setCypher(result.cypher);

      // Add to history
      setHistory((prev) =>
        addToHistory(prev, {
          naturalLanguage,
          cypher: result.cypher,
        })
      );
    } catch (err) {
      console.error('Query error:', err);
      setError(err instanceof Error ? err.message : 'Failed to generate query');
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Handle history item selection
  const handleSelectHistory = useCallback((item: QueryHistoryItem) => {
    setCypher(item.cypher);
    setSelectedNode(null);
    setSelectedRelationship(null);
  }, []);

  // Handle clear history
  const handleClearHistory = useCallback(() => {
    setHistory(clearHistory());
  }, []);

  // Handle node click
  const handleNodeClick = useCallback((node: NodeData) => {
    setSelectedNode(node);
    setSelectedRelationship(null);
  }, []);

  // Handle relationship click
  const handleRelationshipClick = useCallback((rel: RelationshipData) => {
    setSelectedRelationship(rel);
    setSelectedNode(null);
  }, []);

  // Handle close details
  const handleCloseDetails = useCallback(() => {
    setSelectedNode(null);
    setSelectedRelationship(null);
  }, []);

  return (
    <div className="app">
      <header className="header">
        <div className="header-content">
          <h1>Knowledge Graph Explorer</h1>
          <p>Query your Neo4j knowledge graph with natural language</p>
        </div>
        <div className="status-indicators">
          <div className={`status-badge ${connectionStatus}`}>
            <span className="status-dot" />
            Neo4j: {connectionStatus === 'checking' ? 'Checking...' : connectionStatus}
          </div>
          {graphStats && (
            <div className="stats-badge">
              {graphStats.nodeCount} nodes | {graphStats.relationshipCount} relationships
            </div>
          )}
          <div className={`status-badge ${isGroqConfigured() ? 'connected' : 'failed'}`}>
            <span className="status-dot" />
            Groq API: {isGroqConfigured() ? 'Ready' : 'Not configured'}
          </div>
        </div>
      </header>

      <main className="main">
        <div className="query-section">
          <QueryInput onSubmit={handleQuery} isLoading={isLoading} error={error} />
        </div>

        <div className="content-grid">
          <div className="graph-section">
            <div style={{ position: 'relative' }}>
              <GraphViewer
                cypher={cypher}
                onNodeClick={handleNodeClick}
                onRelationshipClick={handleRelationshipClick}
              />
              <NodeDetails
                selectedNode={selectedNode}
                selectedRelationship={selectedRelationship}
                onClose={handleCloseDetails}
              />
            </div>

            {cypher && (
              <div className="cypher-display">
                <h4>Generated Cypher Query</h4>
                <pre>{cypher}</pre>
              </div>
            )}
          </div>

          <div className="history-section">
            <QueryHistory
              history={history}
              onSelectQuery={handleSelectHistory}
              onClearHistory={handleClearHistory}
            />
          </div>
        </div>
      </main>

      <footer className="footer">
        <p>
          ImparLabs Knowledge Graph Explorer | Powered by Neo4j, Groq AI, and Neovis.js
        </p>
      </footer>
    </div>
  );
}

export default App;
