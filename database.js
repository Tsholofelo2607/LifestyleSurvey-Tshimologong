const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('survey.db');

db.serialize(() => {
  db.run(`
    CREATE TABLE IF NOT EXISTS survey (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT,
  email TEXT,
  age INTEGER,
  date TEXT,
  foods TEXT,
  watchMovies TEXT,
  listenRadio TEXT,
  eatOut TEXT,
  watchTV TEXT
)

  `);
});

module.exports = db;
