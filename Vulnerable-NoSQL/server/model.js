const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
  username: String,
  password: String,
  role: String,
  branch: String,
  marks: Number
});

module.exports = mongoose.model('User', UserSchema);
