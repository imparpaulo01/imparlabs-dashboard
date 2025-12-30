const sqlite3 = require('sqlite3');
const path = require('path');

const dbPath = path.join(__dirname, 'data', 'projects.db');

const db = new sqlite3.Database(dbPath, sqlite3.OPEN_READONLY, (err) => {
  if (err) {
    console.error('Database connection error:', err);
    return;
  }

  console.log('Database connected successfully');

  const query = 'SELECT * FROM projects ORDER BY updated_at DESC';

  db.all(query, [], (err, rows) => {
    if (err) {
      console.error('Database query error:', err);
      db.close();
      return;
    }

    console.log(`Found ${rows.length} projects`);

    try {
      // Parse JSON fields like the API does
      const processedProjects = rows.map((project) => ({
        ...project,
        technologies: JSON.parse(project.technologies || '[]'),
        repository: project.repository ? JSON.parse(project.repository) : null,
        deployment: project.deployment ? JSON.parse(project.deployment) : null,
        dependencies: JSON.parse(project.dependencies || '[]'),
        metrics: project.metrics ? JSON.parse(project.metrics) : null,
        evolution: JSON.parse(project.evolution || '{}'),
        last_scanned: new Date(project.last_scanned),
        created_at: new Date(project.created_at),
        updated_at: new Date(project.updated_at)
      }));

      console.log('Successfully processed projects');
      console.log('First project:', JSON.stringify(processedProjects[0], null, 2));

    } catch (error) {
      console.error('Error processing projects:', error);
    }

    db.close();
  });
});