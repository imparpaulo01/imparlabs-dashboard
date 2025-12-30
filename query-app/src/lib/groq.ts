import Groq from 'groq-sdk';

const GROQ_API_KEY = import.meta.env.VITE_GROQ_API_KEY;

// Initialize Groq client
const groq = new Groq({
  apiKey: GROQ_API_KEY,
  dangerouslyAllowBrowser: true, // Required for browser usage
});

// System prompt for Cypher generation
const SYSTEM_PROMPT = `You are a Neo4j Cypher query generator. Convert natural language questions to Cypher queries.

IMPORTANT: Return ONLY the Cypher query. No markdown, no explanation, no code blocks - just raw Cypher.

## SCHEMA

### Node Types (labels):
- Project: name, status, type, description
- Sponsor: name, tier (1-4), category, reasoning, activation_concept
- Strategy: name, description
- ActivationZone: name, description, vibe
- Coalition: name, pitch
- Document: name, type, date
- Insight: name, description (key learnings and strategic insights)
- Research: title, topic, date, summary
- Venue: name, location, capacity
- Person: name, role
- Organization: name, type, description, mission
- Deliverable: name, description
- Festival: name, country, location, attendees, gender_split, founded, description
- Statistic: name, value, metric, source (numerical data points like "Gen Z purchasing power $360B")
- Trend: name, description (market trends like "Sober Curious Movement", "Radical Sustainability")
- BrandActivation: name, description, value_generated, festival (case studies like "Rhode x 818 Beauty Booth")
- ActivationConcept: name, description, price (strategic concepts like "Espace Sororité", "White Label Lounge")
- AudienceInterest: name (audience interest categories like "Wellness", "Sustainability")
- Competitor: name, position

### Relationship Types:
- PROPOSED_FOR - Sponsor proposed for a project/zone/festival
- SPONSORS_ZONE - Sponsor activates in a zone
- ABOUT - Document/Insight about something
- FOR - Strategy/Coalition for a project
- FOUNDED - Person founded organization
- COMPETES_WITH - Sponsor competes with another
- PART_OF - Entity is part of another
- INFORMED - Research informed a decision
- AFFECTS - Decision affects something
- USES - Project uses technology
- HAS_INSIGHT - Entity has related insight
- PRESENTS - Document presents information
- TARGETS - Sponsor targets a festival
- PARTNERS_WITH - Organization partners with another
- ACTIVATED_AT - BrandActivation happened at a festival
- REFLECTS - Trend reflects a statistic or insight
- INFORMS_STRATEGY_OF - Trend/Statistic informs strategy of organization
- FOR_FESTIVAL - ActivationConcept designed for a festival
- INTEREST_OF_AUDIENCE_AT - AudienceInterest observed at a festival
- INFLUENCES - Various entities influence each other
- ANALYZES - Document analyzes festivals/entities (e.g., Top 10 Festivals Report ANALYZES festivals)

## RULES

1. Always return nodes AND relationships when possible (for graph visualization)
2. Use OPTIONAL MATCH for exploratory queries
3. Limit results to 50 nodes max unless user asks for more
4. For "show everything" or "all" queries, use: MATCH (n)-[r]-(m) RETURN n, r, m LIMIT 100
5. Return only valid Cypher - no markdown, no explanation
6. Use WHERE for filtering, ORDER BY for sorting
7. For count queries, use count() but also return sample nodes
8. CRITICAL: When user mentions a specific name, use CONTAINS for fuzzy matching:
   - WRONG: WHERE s.name = 'AI Infrastructure'
   - CORRECT: WHERE toLower(s.name) CONTAINS toLower('ai infrastructure')
9. CRITICAL: When querying a single entity by name, return ALL its relationships:
   - Use pattern: MATCH (n:Label)-[r]-(connected) WHERE toLower(n.name) CONTAINS toLower('search term')
   - This ensures all connections are shown, not just one relationship type

## EXAMPLES

Q: "Show me tier 1 sponsors"
A: MATCH (s:Sponsor) WHERE s.tier = 1 RETURN s

Q: "What zones do sponsors activate?"
A: MATCH (s:Sponsor)-[r:SPONSORS_ZONE]->(z:ActivationZone) RETURN s, r, z

Q: "Show the HelloJune ecosystem"
A: MATCH (o:Organization)-[r]-(connected) WHERE toLower(o.name) CONTAINS toLower('hellojune') RETURN o, r, connected LIMIT 50

Q: "Find strategic coalitions"
A: MATCH (c:Coalition)-[r]-(connected) RETURN c, r, connected

Q: "Which sponsors compete with each other?"
A: MATCH (s1:Sponsor)-[r:COMPETES_WITH]->(s2:Sponsor) RETURN s1, r, s2

Q: "Show all strategies"
A: MATCH (s:Strategy)-[r]-(connected) RETURN s, r, connected LIMIT 50

Q: "Show all festivals"
A: MATCH (d:Document)-[r:ANALYZES]->(f:Festival) RETURN d, r, f UNION ALL MATCH (f:Festival)-[r2]-(other) WHERE NOT other:Document RETURN f as d, r2 as r, other as f LIMIT 150

Q: "What are the Gen Z statistics?"
A: MATCH (s:Statistic) WHERE toLower(s.name) CONTAINS toLower('gen z') RETURN s

Q: "Show market trends"
A: MATCH (t:Trend)-[r]-(connected) RETURN t, r, connected LIMIT 50

Q: "What brand activations happened at Coachella?"
A: MATCH (b:BrandActivation)-[r]-(connected) WHERE toLower(b.festival) CONTAINS toLower('coachella') RETURN b, r, connected LIMIT 50

Q: "Show Les Déferlantes festival"
A: MATCH (f:Festival)-[r]-(connected) WHERE toLower(f.name) CONTAINS toLower('déferlantes') RETURN f, r, connected LIMIT 50

Q: "What activation concepts exist?"
A: MATCH (a:ActivationConcept)-[r]-(connected) RETURN a, r, connected LIMIT 50

Q: "Count sponsors by tier"
A: MATCH (s:Sponsor) RETURN s.tier AS tier, count(s) AS count, collect(s.name)[0..3] AS examples ORDER BY tier

Q: "Show insights about festivals"
A: MATCH (i:Insight)-[r]-(connected) RETURN i, r, connected LIMIT 50

Q: "What influences HelloJune strategy?"
A: MATCH (n)-[r:INFORMS_STRATEGY_OF|INFLUENCES]->(o:Organization) WHERE toLower(o.name) CONTAINS toLower('hellojune') RETURN n, r, o LIMIT 50

Q: "Show me everything"
A: MATCH (n)-[r]-(m) RETURN n, r, m LIMIT 100`;

/**
 * Generate Cypher query from natural language using Groq
 */
export async function generateCypher(naturalLanguage: string): Promise<CypherResult> {
  if (!GROQ_API_KEY) {
    throw new Error('GROQ_API_KEY is not configured. Please set VITE_GROQ_API_KEY in .env.local');
  }

  try {
    const completion = await groq.chat.completions.create({
      messages: [
        {
          role: 'system',
          content: SYSTEM_PROMPT,
        },
        {
          role: 'user',
          content: naturalLanguage,
        },
      ],
      model: 'llama-3.3-70b-versatile',
      temperature: 0.1, // Low temperature for consistent Cypher output
      max_tokens: 500,
    });

    const cypher = completion.choices[0]?.message?.content?.trim() || '';

    // Basic validation
    if (!cypher) {
      throw new Error('Empty response from Groq');
    }

    // Clean up any markdown formatting that might slip through
    const cleanCypher = cleanCypherQuery(cypher);

    return {
      cypher: cleanCypher,
      originalQuery: naturalLanguage,
      model: 'llama-3.3-70b-versatile',
    };
  } catch (error) {
    console.error('Groq API error:', error);
    throw new Error(`Failed to generate Cypher: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Clean up Cypher query (remove markdown, code blocks, etc.)
 */
function cleanCypherQuery(cypher: string): string {
  let cleaned = cypher;

  // Remove markdown code blocks
  cleaned = cleaned.replace(/```cypher\n?/gi, '');
  cleaned = cleaned.replace(/```\n?/g, '');

  // Remove leading/trailing whitespace
  cleaned = cleaned.trim();

  // Remove any explanation after the query (common pattern: query followed by newline and text)
  const lines = cleaned.split('\n');
  const cypherLines: string[] = [];
  for (const line of lines) {
    const trimmed = line.trim();
    // Stop at explanatory text (usually starts with lowercase or is empty after RETURN)
    if (cypherLines.length > 0 && !trimmed && !line.startsWith(' ')) {
      break;
    }
    if (
      trimmed &&
      !trimmed.startsWith('//') &&
      !trimmed.startsWith('#') &&
      !trimmed.toLowerCase().startsWith('this ')
    ) {
      cypherLines.push(trimmed);
    }
  }

  return cypherLines.join('\n');
}

export interface CypherResult {
  cypher: string;
  originalQuery: string;
  model: string;
}

/**
 * Check if Groq API is configured
 */
export function isGroqConfigured(): boolean {
  return !!GROQ_API_KEY;
}

/**
 * Get available suggestion queries
 */
export function getSuggestions(): string[] {
  return [
    'Show me tier 1 sponsors',
    'Show all festivals',
    'What are the Gen Z statistics?',
    'Show market trends',
    'What brand activations happened at Coachella?',
    'Show Les Déferlantes festival',
    'What activation concepts exist?',
    'Show the HelloJune ecosystem',
    'What influences HelloJune strategy?',
    'Show me everything',
  ];
}
