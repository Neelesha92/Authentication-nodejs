const express = require("express");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const dotenv = require("dotenv");

dotenv.config();

const app = express();

app.use(express.json());

const ACCESS_TOKEN_SECRET = process.env.ACCESS_TOKEN_SECRET || "access_secret";
const REFRESH_TOKEN_SECRET =
  process.env.REFRESH_TOKEN_SECRET || "refresh_secret";

// Temporary in-memory store

let users = [];
let refreshTokens = [];

// Register user

app.post("/register", async (req, res) => {
  try {
    const { username, password } = req.body;
    const hashedPassword = await bcrypt.hash(password, 10);
    users.push({ username, password: hashedPassword });
    res.status(201).send("User registered successfully");
  } catch (error) {
    res.status(500).send("Error registering user");
  }
});

// login user
app.post("/login", async (req, res) => {
  const { username, password } = req.body;
  const user = users.find((u) => u.username === username);

  if (!user) {
    return res.status(400).send("Cannot find user");
  }

  const valid = await bcrypt.compare(password, user.password);
  if (!valid) {
    return res.status(400).send("Invalid password");
  }

  // generate tokens
  const accessToken = jwt.sign({ username }, ACCESS_TOKEN_SECRET, {
    expiresIn: "30s",
  });
  const refreshToken = jwt.sign({ username }, REFRESH_TOKEN_SECRET);

  refreshTokens.push(refreshToken);
  res.json({ accessToken, refreshToken });
});

app.get("/protected", authenticateToken, (req, res) => {
  res.json({ message: "Protected route accessed successfully" });
});

// refreshtoken

app.post("/token", (req, res) => {
  const { token } = req.body;
  if (!token) return res.sendStatus(401);
  if (!refreshTokens.includes(token)) return res.sendStatus(403);

  jwt.verify(token, REFRESH_TOKEN_SECRET, (err, user) => {
    if (err) return res.sendStatus(403);
    const accessToken = jwt.sign(
      { username: user.username },
      ACCESS_TOKEN_SECRET,
      { expiresIn: "30s" }
    );
    res.json({ accessToken });
  });
});

// logout

app.post("/logout", (req, res) => {
  const { token } = req.body;
  refreshTokens = refreshTokens.filter((t) => t !== token);
  res.sendStatus(204);
});

// middleware

function authenticateToken(req, res, next) {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];
  if (token == null) return res.sendStatus(401);

  jwt.verify(token, ACCESS_TOKEN_SECRET, (err, user) => {
    if (err) return res.sendStatus(403);
    req.user = user;
    next();
  });
}

app.listen(3000, () => {
  console.log("Server is running on port 3000");
});
