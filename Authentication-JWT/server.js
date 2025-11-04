const express = require("express");
const app = express();
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

app.use(express.json());

const posts = [
  {
    username: "Kyle",
    title: "Post 1",
  },
  {
    username: "Jim",
    title: "Post 2",
  },
];

const users = [];

app.get("/posts", (req, res) => {
  res.json(posts);
});

app.get("/users", (req, res) => {
  res.json(users);
});

// signup

app.post("/signup", async (req, res) => {
  try {
    const salt = await bcrypt.genSalt();
    const hashedPassword = await bcrypt.hash(req.body.password, salt);
    const user = { name: req.body.name, password: hashedPassword };
    users.push(user);
    res.status(201).json({ message: "User created successfully", user });
  } catch {
    res.status(500).json({ message: "Error creating user" });
  }
});

app.post("/users/login", async (req, res) => {
  const user = users.find((user) => user.name === req.body.name);
  if (user == null) {
    return res.status(400).json({ message: "Cannot find user" });
  }
  try {
    if (await bcrypt.compare(req.body.password, user.password)) {
      res.json({ message: "Success" });
    } else {
      res.json({ message: "Not Allowed" });
    }
  } catch {
    res.status(500).json({ message: "Error logging in" });
  }
});

app.listen(4000, () => {
  console.log("Server is running on port 4000");
});
