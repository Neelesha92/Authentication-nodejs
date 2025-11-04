// data.js
const users = [
  { id: 1, name: "Kyle", role: "admin" },
  { id: 2, name: "Sally", role: "basic" },
];

const posts = [
  { id: 1, title: "Kyle's Post", userId: 1 },
  { id: 2, title: "Sally's Post", userId: 2 },
  { id: 3, title: "Another Post", userId: 1 },
];

module.exports = { users, posts };
