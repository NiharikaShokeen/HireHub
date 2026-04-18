const express = require("express");
const path = require("path");
const mysql = require("mysql2");
const bodyParser = require("body-parser");

const app = express();
const PORT = 3000;

// Middleware
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static(__dirname));

// MySQL Connection
const db = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "",
  database: "hirehub"
});

db.connect((err) => {
  if (err) {
    console.log("Database Error");
  } else {
    console.log("Connected to MySQL");
  }
});

// Home Page
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "index.html"));
});

// Register Route
app.post("/register", (req, res) => {
  const { name, email, password, role } = req.body;

  const sql = "INSERT INTO users (name,email,password,role) VALUES (?, ?, ?, ?)";

  db.query(sql, [name, email, password, role], (err, result) => {
    if (err) {
      res.send("Registration Failed");
    } else {
      res.send("Registered Successfully ✅");
    }
  });
});

// Login Route
app.post("/login", (req, res) => {
  const { email, password } = req.body;

  const sql = "SELECT * FROM users WHERE email = ? AND password = ?";

  db.query(sql, [email, password], (err, result) => {
    if (err) {
      res.send("Login Error");
    } 
    else if (result.length > 0) {
      res.send("Login Successful ✅");
    } 
    else {
      res.send("Invalid Email or Password ❌");
    }
  });
});

// Jobs Route
app.get("/jobs", (req, res) => {

  const sql = "SELECT * FROM jobs";

  db.query(sql, (err, result) => {

    if (err) {
      res.send("Error loading jobs");
    } else {

      let output = `
      <html>
      <head>
      <title>Jobs</title>
      <link rel="stylesheet" href="/style.css">
      </head>
      <body>
      <section class="jobs">
      <h2>Available Jobs</h2>
      <div class="job-container">
      `;

      result.forEach(job => {
        output += `
        <div class="card">
          <h3>${job.title}</h3>
          <p>${job.company}</p>
          <p>${job.location}</p>
          <p>${job.salary}</p>
          <button>Apply</button>
        </div>
        `;
      });

      output += `
      </div>
      </section>
      </body>
      </html>
      `;

      res.send(output);
    }

  });

});

// Start Server
app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});