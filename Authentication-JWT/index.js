const express = require("express");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const dotenv = require("dotenv");

dotenv.config();

const app = express();
app.use(express.json());

const users = []; // simulate DB

// SIGNUP
app.post("/signup", async (req, res) => {
  const { email, password } = req.body;

  const hashedPassword = await bcrypt.hash(password, 10);
  users.push({ email, password: hashedPassword });

  res.json({ message: "User registered successfully!" });
});

// LOGIN
app.post("/login", async (req, res) => {
  const { email, password } = req.body;

  const user = users.find((u) => u.email === email);
  if (!user) return res.status(400).json({ message: "User not found" });

  const validPassword = await bcrypt.compare(password, user.password);
  if (!validPassword)
    return res.status(401).json({ message: "Invalid password" });

  // Generate JWT
  const token = jwt.sign(
    { email: user.email },
    process.env.ACCESS_TOKEN_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN } // e.g. "1h"
  );

  res.json({ message: "Login successful!", token });
});

// PROTECTED ROUTE
app.get("/profile", verifyToken, (req, res) => {
  res.json({ message: "Welcome to your profile!", user: req.user });
});

// Middleware to verify token
function verifyToken(req, res, next) {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];

  if (!token) return res.status(403).json({ message: "No token provided" });

  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) return res.status(401).json({ message: "Invalid token" });
    req.user = user; // attach user data to request
    next();
  });
}

app.listen(3000, () => console.log("Server running on port 3000"));
