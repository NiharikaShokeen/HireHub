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
          <a href="/apply/${job.id}">
          <button>Apply</button>
          </a>
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

// Apply Route
app.get("/apply/:id", (req, res) => {

  const jobId = req.params.id;
  const userId = 1; // temporary demo user

  const sql = "INSERT INTO applications (user_id, job_id, status) VALUES (?, ?, ?)";

  db.query(sql, [userId, jobId, "Applied"], (err, result) => {

    if (err) {
      res.send("Application Failed ❌");
    } else {
      res.send("Applied Successfully ✅ <br><a href='/jobs'>Back to Jobs</a>");
    }

  });

});

// Dashboard Route
app.get("/dashboard", (req, res) => {

  const userId = 1; // temporary demo user

  const sql = `
  SELECT jobs.title, jobs.company, jobs.location, applications.status
  FROM applications
  JOIN jobs ON applications.job_id = jobs.id
  WHERE applications.user_id = ?
  `;

  db.query(sql, [userId], (err, result) => {

    if (err) {
      res.send("Error loading dashboard");
    } else {

      let output = `
      <html>
      <head>
      <title>Dashboard</title>
      <link rel="stylesheet" href="/style.css">
      </head>
      <body>
      <section class="jobs">
      <h2>My Applied Jobs</h2>
      <div class="job-container">
      `;

      result.forEach(job => {
        output += `
        <div class="card">
          <h3>${job.title}</h3>
          <p>${job.company}</p>
          <p>${job.location}</p>
          <p>Status: ${job.status}</p>
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