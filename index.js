const express = require("express");
const mysql = require("mysql2");
const cors = require("cors");
const bcrypt = require("bcrypt");
require('dotenv').config();  // Load environment variables

const app = express();
app.use(cors());
app.use(express.json());

// Use environment variables for port and database credentials
const port = process.env.PORT || 8001;
const db = mysql.createConnection({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_DATABASE,
});

// Root endpoint to check if the server is working
app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});

db.connect(err => {
  if (err) {
    console.error("Database connection failed: " + err.stack);
    return;
  }
  console.log("Connected to MySQL database");
});

// Get all users
app.get("/users", async (req, res) => {
  try {
    const [results] = await db.promise().query("SELECT * FROM users");
    res.json(results);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Add new user
app.post("/users", async (req, res) => {
  const { username, password, role } = req.body;
  try {
    const hashedPassword = await bcrypt.hash(password, 10);
    await db.promise().query("INSERT INTO users (username, password, role) VALUES (?, ?, ?)", [username, hashedPassword, role]);
    res.json({ message: "User added successfully!" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Update a user's information
app.put('/api/users/:id', async (req, res) => {
  const { id } = req.params;
  const { username, password } = req.body;

  try {
    if (password) {
      const hashedPassword = await bcrypt.hash(password, 10);
      await db.promise().query('UPDATE users SET username = ?, password = ? WHERE id = ?', [username, hashedPassword, id]);
    } else {
      await db.promise().query('UPDATE users SET username = ? WHERE id = ?', [username, id]);
    }
    res.send('User updated successfully!');
  } catch (err) {
    res.status(500).send('Error updating user: ' + err.message);
  }
});

// Delete a user
app.delete('/api/users/:id', async (req, res) => {
  const { id } = req.params;
  try {
    await db.promise().query('DELETE FROM users WHERE id = ?', [id]);
    res.send('User deleted successfully!');
  } catch (err) {
    res.status(500).send('Error deleting user: ' + err.message);
  }
});

// Get all products
app.get("/products", async (req, res) => {
  try {
    const [results] = await db.promise().query("SELECT * FROM products");
    res.json(results);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Add new product
app.post("/products", async (req, res) => {
  const { name, description, category, price, quantity } = req.body;
  try {
    const [results] = await db.promise().query("INSERT INTO products (name, description, category, price, quantity) VALUES (?, ?, ?, ?, ?)", [name, description, category, price, quantity]);
    res.json({ message: "Product added successfully!", insertId: results.insertId });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Update product
app.put("/products/:id", async (req, res) => {
  const { id } = req.params;
  const { name, description, category, price, quantity } = req.body;
  try {
    await db.promise().query("UPDATE products SET name = ?, description = ?, category = ?, price = ?, quantity = ? WHERE id = ?", [name, description, category, price, quantity, id]);
    res.json({ message: "Product updated successfully!" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Delete product
app.delete("/products/:id", async (req, res) => {
  const { id } = req.params;
  try {
    await db.promise().query("DELETE FROM products WHERE id = ?", [id]);
    res.json({ message: "Product deleted successfully!" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});