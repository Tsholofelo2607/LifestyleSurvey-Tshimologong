const express = require('express');
const bodyParser = require('body-parser');
const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const app = express();
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
  `, (err) => {
    if (err) {
      console.error("Table creation error:", err.message);
    } else {
      console.log("Survey table ready");
    }
  });
});



app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static('public'));

app.get('/', (req, res) => {
  res.sendFile(__dirname + '/public/index.html');
});

// POST route to save survey
app.post('/submit', (req, res) => {
  const { name, email, age, date, food, eatOut, watchMovies, listenRadio, watchTV } = req.body;
  const foods = Array.isArray(food) ? food.join(',') : food;

  db.run(
    `INSERT INTO survey (name, email, age, date, foods, eatOut, watchMovies, listenRadio, watchTV)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [name, email, age, date, foods, eatOut, watchMovies, listenRadio, watchTV],
    (err) => {
      if (err) {
        console.error(err);
        return res.send("Error saving survey");
      }

      // Show confirmation message to user
      res.send('<h2>Thank you for your submission!</h2><a href="/">Back to form</a>');
    }
  );
});



// GET route to show survey results
app.get('/results', (req, res) => {
  db.all('SELECT * FROM survey', (err, rows) => {
    if (err) {
      console.error("Results query error:", err.message);
      return res.send("Database error.");
    }
     //Log rows for debugging
    console.log("Survey Rows:", rows);

    if (rows.length === 0) return res.send("No Surveys Available");

    const total = rows.length;
    const ages = rows.map(r => r.age);
    const avgAge = (ages.reduce((a, b) => a + b, 0) / total).toFixed(1);
    const oldest = Math.max(...ages);
    const youngest = Math.min(...ages);

    const pizzaCount = rows.filter(r => r.foods.includes('Pizza')).length;
    const pastaCount = rows.filter(r => r.foods.includes('Pasta')).length;
    const papCount = rows.filter(r => r.foods.includes('Pap and Wors')).length;

    const pizzaPercent = ((pizzaCount / total) * 100).toFixed(1);
    const pastaPercent = ((pastaCount / total) * 100).toFixed(1);
    const papPercent = ((papCount / total) * 100).toFixed(1);

//This avoids crashing when any input is missing or invalid.
   function safeInt(val) {
  const n = parseInt(val);
  return isNaN(n) ? 0 : n;
}

const avgEatOut = (rows.map(r => safeInt(r.eatOut)).reduce((a, b) => a + b, 0) / total).toFixed(1);
const avgMovies = (rows.map(r => safeInt(r.watchMovies)).reduce((a, b) => a + b, 0) / total).toFixed(1);
const avgRadio = (rows.map(r => safeInt(r.listenRadio)).reduce((a, b) => a + b, 0) / total).toFixed(1);
const avgTV = (rows.map(r => safeInt(r.watchTV)).reduce((a, b) => a + b, 0) / total).toFixed(1);


    res.send(`
      <h1>Survey Results</h1>
      <p>Total number of surveys: ${total}</p>
      <p>Average Age: ${avgAge}</p>
      <p>Oldest person who participated: ${oldest}</p>
      <p>Youngest person who participated: ${youngest}</p>
      <p>Percentage who like Pizza: ${pizzaPercent}%</p>
      <p>Percentage who like Pasta: ${pastaPercent}%</p>
      <p>Percentage who like Pap and Wors: ${papPercent}%</p>
      <p>Average rating - Watching Movies: ${avgMovies}</p>
      <p>Average rating - Listening to Radio: ${avgRadio}</p>
      <p>Average rating - Eating Out: ${avgEatOut}</p>
      <p>Average rating - Watching TV: ${avgTV}</p>
      <a href="/">Back to Form</a>
    `);
  });
});


app.get('/test-insert', (req, res) => {
  db.run(
    `INSERT INTO survey (name, email, age, date, foods, eatOut, watchMovies, listenRadio, watchTV)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    ['Test', 'test@example.com', 30, '1994-01-01', 'Pizza,Pasta', 3, 4, 2, 5],
    (err) => {
      if (err) {
        console.error("Insert error:", err.message);
        return res.send("Insert failed");
      }
      res.send("Insert successful");
    }
  );
});



// Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});