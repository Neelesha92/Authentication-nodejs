// routes/posts.js
const express = require("express");
const router = express.Router();
const { posts } = require("../data");
const { canViewPost, canDeletePost } = require("../permissions/post");

router.get("/", (req, res) => {
  if (!req.user) return res.status(403).send("User not found");
  const visiblePosts = posts.filter((post) => canViewPost(req.user, post));
  res.json(visiblePosts);
});

router.delete("/:postId", setPost, authDeletePost, (req, res) => {
  res.send("Post deleted successfully");
});

function setPost(req, res, next) {
  const postId = parseInt(req.params.postId);
  req.post = posts.find((p) => p.id === postId);
  if (!req.post) return res.status(404).send("Post not found");
  next();
}

function authDeletePost(req, res, next) {
  if (!req.user) return res.status(403).send("User not found");
  if (!canDeletePost(req.user, req.post)) {
    return res.status(401).send("Not allowed");
  }
  next();
}

module.exports = router;
