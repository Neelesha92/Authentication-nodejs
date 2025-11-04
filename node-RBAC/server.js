const express = require("express");
const { users } = require("./data");
const postRouter = require("./routes/posts");

const app = express();
app.use(express.json());

// Middleware to attach user from request body
function setUser(req, res, next) {
  const userId = req.body.userId;
  if (userId) {
    req.user = users.find((user) => user.id === userId);
  }
  next();
}

app.use(setUser);
app.use("/posts", postRouter);

app.listen(3000, () => console.log("Server running on port 3000"));
