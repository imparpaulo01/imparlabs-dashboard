const sqlite3 = require('sqlite3');
const path = require('path');

const dbPath = path.join(__dirname, 'data', 'projects.db');

const db = new sqlite3.Database(dbPath, sqlite3.OPEN_READONLY, (err) => {
  if (err) {
    console.error('Database connection error:', err);
    return;
  }

  db.get('SELECT * FROM projects LIMIT 1', (err, row) => {
    if (err) {
      console.error('Query error:', err);
    } else {
      console.log('Sample project record:');
      console.log(JSON.stringify(row, null, 2));
    }
    db.close();
  });
});