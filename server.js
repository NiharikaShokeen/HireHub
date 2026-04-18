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

// Start Server
app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});