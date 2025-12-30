const sqlite3 = require('sqlite3');
const path = require('path');

const dbPath = path.join(__dirname, 'data', 'projects.db');
console.log('Database path:', dbPath);

const db = new sqlite3.Database(dbPath, sqlite3.OPEN_READONLY, (err) => {
  if (err) {
    console.error('Database connection error:', err);
    return;
  }

  console.log('Database connected successfully');

  db.get('SELECT COUNT(*) as count FROM projects', (err, row) => {
    if (err) {
      console.error('Query error:', err);
    } else {
      console.log('Projects count:', row.count);
    }
    db.close();
  });
});