import express from "express";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import dotenv from "dotenv";
import { users } from "./user.js";

dotenv.config();
const app = express();
app.use(express.json());

// LOGIN
app.post("/login", async (req, res) => {
  const { username, password } = req.body;

  const user = users.find((u) => u.username === username);
  if (!user) return res.status(400).json({ message: "User not found" });

  // Normally you'd hash & compare password
  if (password !== user.password)
    return res.status(401).json({ message: "Invalid password" });

  const token = jwt.sign(
    { username: user.username, role: user.role },
    process.env.ACCESS_TOKEN_SECRET,
    { expiresIn: "1h" }
  );

  res.json({ token });
});

// Middleware: Authenticate Token
function authenticateToken(req, res, next) {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];
  if (!token) return res.sendStatus(401);

  jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, user) => {
    if (err) return res.sendStatus(403);
    req.user = user;
    next();
  });
}

// Middleware: Authorize Roles
function authorizeRoles(...roles) {
  return (req, res, next) => {
    if (!roles.includes(req.user.role))
      return res.status(403).json({ message: "Access denied" });
    next();
  };
}

// Protected Routes
app.get(
  "/user-dashboard",
  authenticateToken,
  authorizeRoles("user", "admin"),
  (req, res) => {
    res.json({ message: `Welcome ${req.user.username} (${req.user.role})` });
  }
);

app.get(
  "/admin-dashboard",
  authenticateToken,
  authorizeRoles("admin"),
  (req, res) => {
    res.json({ message: `Welcome Admin ${req.user.username}` });
  }
);

app.listen(5000, () => console.log("Server running on port 5000"));
