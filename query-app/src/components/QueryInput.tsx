import { useState } from 'react';
import type { FormEvent } from 'react';
import { getSuggestions } from '../lib/groq';

interface QueryInputProps {
  onSubmit: (query: string) => void;
  isLoading: boolean;
  error?: string | null;
}

export function QueryInput({ onSubmit, isLoading, error }: QueryInputProps) {
  const [query, setQuery] = useState('');
  const suggestions = getSuggestions();

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (query.trim() && !isLoading) {
      onSubmit(query.trim());
    }
  };

  const handleSuggestionClick = (suggestion: string) => {
    setQuery(suggestion);
    onSubmit(suggestion);
  };

  return (
    <div className="query-input">
      <form onSubmit={handleSubmit} style={{ marginBottom: '16px' }}>
        <div style={{ display: 'flex', gap: '8px' }}>
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Ask a question about your knowledge graph..."
            disabled={isLoading}
            style={{
              flex: 1,
              padding: '12px 16px',
              fontSize: '16px',
              border: '2px solid #333',
              borderRadius: '8px',
              backgroundColor: '#1a1a1a',
              color: '#fff',
              outline: 'none',
              transition: 'border-color 0.2s',
            }}
            onFocus={(e) => (e.target.style.borderColor = '#4CAF50')}
            onBlur={(e) => (e.target.style.borderColor = '#333')}
          />
          <button
            type="submit"
            disabled={isLoading || !query.trim()}
            style={{
              padding: '12px 24px',
              fontSize: '16px',
              fontWeight: 'bold',
              border: 'none',
              borderRadius: '8px',
              backgroundColor: isLoading ? '#333' : '#4CAF50',
              color: '#fff',
              cursor: isLoading ? 'wait' : 'pointer',
              transition: 'background-color 0.2s',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
            }}
          >
            {isLoading ? (
              <>
                <span
                  style={{
                    display: 'inline-block',
                    width: '16px',
                    height: '16px',
                    border: '2px solid #666',
                    borderTopColor: '#fff',
                    borderRadius: '50%',
                    animation: 'spin 1s linear infinite',
                  }}
                />
                Processing...
              </>
            ) : (
              'Query'
            )}
          </button>
        </div>
      </form>

      {error && (
        <div
          style={{
            padding: '12px 16px',
            marginBottom: '16px',
            backgroundColor: 'rgba(244, 67, 54, 0.1)',
            border: '1px solid #F44336',
            borderRadius: '8px',
            color: '#F44336',
          }}
        >
          <strong>Error:</strong> {error}
        </div>
      )}

      <div style={{ marginBottom: '16px' }}>
        <h4 style={{ margin: '0 0 8px 0', color: '#888', fontSize: '14px' }}>
          Try these queries:
        </h4>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
          {suggestions.map((suggestion) => (
            <button
              key={suggestion}
              onClick={() => handleSuggestionClick(suggestion)}
              disabled={isLoading}
              style={{
                padding: '8px 12px',
                fontSize: '13px',
                border: '1px solid #333',
                borderRadius: '16px',
                backgroundColor: '#2a2a2a',
                color: '#ccc',
                cursor: isLoading ? 'not-allowed' : 'pointer',
                transition: 'all 0.2s',
              }}
              onMouseOver={(e) => {
                if (!isLoading) {
                  e.currentTarget.style.backgroundColor = '#3a3a3a';
                  e.currentTarget.style.borderColor = '#4CAF50';
                }
              }}
              onMouseOut={(e) => {
                e.currentTarget.style.backgroundColor = '#2a2a2a';
                e.currentTarget.style.borderColor = '#333';
              }}
            >
              {suggestion}
            </button>
          ))}
        </div>
      </div>

      <style>
        {`
          @keyframes spin {
            from { transform: rotate(0deg); }
            to { transform: rotate(360deg); }
          }
        `}
      </style>
    </div>
  );
}
