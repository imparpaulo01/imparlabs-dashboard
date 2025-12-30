const sqlite3 = require('sqlite3');
const path = require('path');

// Simulate the API route path logic
const dbPath = path.join(process.cwd(), '..', 'data', 'projects.db');
console.log('API route database path:', dbPath);
console.log('Current working directory:', process.cwd());

const db = new sqlite3.Database(dbPath, sqlite3.OPEN_READONLY, (err) => {
  if (err) {
    console.error('Database connection error:', err);
    return;
  }

  console.log('Database connected successfully from API path');

  db.get('SELECT COUNT(*) as count FROM projects', (err, row) => {
    if (err) {
      console.error('Query error:', err);
    } else {
      console.log('Projects count:', row.count);
    }
    db.close();
  });
});