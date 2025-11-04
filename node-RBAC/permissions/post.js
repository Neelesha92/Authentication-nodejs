// permissions/post.js
const { ROLE } = require("./basic");

function canViewPost(user, post) {
  return user.role === ROLE.ADMIN || post.userId === user.id;
}

function canDeletePost(user, post) {
  return user.role === ROLE.ADMIN || post.userId === user.id;
}

module.exports = { canViewPost, canDeletePost };
