const mongoose = require('mongoose');
const User = require('./model');
require('./db');

const users = [
  { username: "admin", password: "admin123", role: "admin", branch: "na", marks: 0 },
  { username: "alice", password: "alice123", role: "student", branch: "cse", marks: 85 },
  { username: "bob", password: "bob123", role: "student", branch: "ece", marks: 90 },
  { username: "cara", password: "cara123", role: "student", branch: "eee", marks: 89 },
  { username: "dave", password: "dave123", role: "student", branch: "mech", marks: 97 },
  { username: "guest", password: "guest123", role: "guest", branch: "na", marks: 0 },
];

async function seed() {
  await User.deleteMany({});
  await User.insertMany(users);
  console.log("✅ Users seeded");
  process.exit(0);
}
seed();
