// const express = require('express');
// const session = require('express-session');
// const mongoose = require('mongoose');
// const fs = require('fs');
// const User = require('./model');
// require('./db');

// const app = express();
// const port = 3000;

// app.use(express.static('public'));
// app.use(express.json());
// app.use(express.urlencoded({ extended: true }));
// app.use(session({
//   secret: 'secretKey',
//   resave: false,
//   saveUninitialized: true
// }));

// const suspiciousPatterns = ["$", "{", "}", "||", "1=1", "admin' ||", "$or"];
// const LOG_FILE = './server/logs.txt';

// function log(message) {
//   fs.appendFileSync(LOG_FILE, `${new Date().toISOString()} - ${message}\n`);
// }

// // 🔐 Login
// app.post('/login', async (req, res) => {
//   const { username, password } = req.body;
//   const user = await User.findOne({ username, password });
//   if (user) {
//     req.session.user = user;
//     log(`LOGIN: ${username} (${user.role})`);
//     res.json({ success: true, role: user.role, username });
//   } else {
//     log(`FAILED LOGIN: ${username}`);
//     res.status(401).json({ success: false, msg: "Invalid credentials" });
//   }
// });

// // 🔍 Search (vulnerable)
// app.get('/search', async (req, res) => {
//   const query = req.query.query;
//   const sessionUser = req.session.user;

//   if (!sessionUser) return res.status(401).json({ error: "Login required" });

//   if (suspiciousPatterns.some(p => query.includes(p))) {
//     log(`MALICIOUS SEARCH by ${sessionUser.username}: ${query}`);
//     const all = await User.find({});
//     return res.json({ results: all });
//   }

//   const results = await User.find({ username: { $regex: query, $options: 'i' } });
//   const filtered = results.map(user => {
//     if (sessionUser.role === 'admin') return user;
//     if (sessionUser.role === 'student') {
//       if (user.username === sessionUser.username) return user;
//       if (user.role === 'admin' || user.role === 'guest') return null;
//       return {
//         username: user.username,
//         branch: user.branch,
//         role: user.role
//       };
//     }
//     return null;
//   }).filter(Boolean);

//   res.json({ results: filtered });
// });

// // ➕ Add user (admin only)
// app.post('/add', async (req, res) => {
//   const sessionUser = req.session.user;
//   if (!sessionUser) return res.sendStatus(403);

//   const { username, password, role, branch, marks } = req.body;
//   const newUser = new User({ username, password, role, branch, marks });
//   await newUser.save();
//   log(`ADD: Admin ${sessionUser.username} added user ${username}`);
//   res.json({ success: true });
// });

// // ✏️ Update user (admin only)
// app.post('/update', async (req, res) => {
//   const sessionUser = req.session.user;
//   if (!sessionUser) return res.sendStatus(403);

//   const { username, branch, marks } = req.body;
//   const updated = await User.findOneAndUpdate({ username }, { branch, marks });
//   if (updated) {
//     log(`UPDATE: Admin ${sessionUser.username} updated ${username}`);
//     res.json({ success: true });
//   } else {
//     res.json({ success: false, msg: "User not found" });
//   }
// });

// // ❌ Delete user (admin only)
// app.post('/delete', async (req, res) => {
//   const sessionUser = req.session.user;
//   if (!sessionUser) return res.sendStatus(403);

//   const { username } = req.body;
//   const deleted = await User.deleteOne({ username });
//   if (deleted.deletedCount > 0) {
//     log(`DELETE: Admin ${sessionUser.username} deleted ${username}`);
//     res.json({ success: true });
//   } else {
//     res.json({ success: false, msg: "User not found" });
//   }
// });

// // 🔚 Logout
// app.get('/logout', (req, res) => {
//   log(`LOGOUT: ${req.session.user?.username}`);
//   req.session.destroy(() => res.json({ success: true }));
// });

// app.listen(port, () => console.log(`🚀 Running on http://localhost:${port}`));
const express = require('express');
const session = require('express-session');
const mongoose = require('mongoose');
const fs = require('fs');
const User = require('./model');
require('./db');
const { detectInjection } = require('./detection/ml');

const app = express();
const port = 3000;

app.use(express.static('public'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(session({
  secret: 'secretKey',
  resave: false,
  saveUninitialized: true
}));

const suspiciousPatterns = ["$", "{", "}", "||", "1=1", "admin' ||", "$or"];
const LOG_FILE = './server/logs.txt';

function log(message) {
  fs.appendFileSync(LOG_FILE, `${new Date().toISOString()} - ${message}\n`);
}

// 🔐 Login
app.post('/login', async (req, res) => {
  const { username, password } = req.body;
  const user = await User.findOne({ username, password });
  if (user) {
    req.session.user = user;
    log(`LOGIN: ${username} (${user.role})`);
    res.json({ success: true, role: user.role, username });
  } else {
    log(`FAILED LOGIN: ${username}`);
    res.status(401).json({ success: false, msg: "Invalid credentials" });
  }
});

// 🔍 Search (vulnerable)
app.get('/search', async (req, res) => {
  const query = req.query.query;
  const sessionUser = req.session.user;

  if (!sessionUser) return res.status(401).json({ error: "Login required" });

  const isMalicious = await detectInjection(query);

  if (isMalicious) {
    log(`BLOCKED MALICIOUS SEARCH by ${sessionUser.username}: ${query}`);
    return res.status(400).json({
      success: false,
      msg: "Suspicious input detected. Search blocked."
    });
  }

  const escapedQuery = query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const results = await User.find({ username: { $regex: escapedQuery, $options: 'i' } });
  const filtered = results.map(user => {
    if (sessionUser.role === 'admin') return user;
    if (sessionUser.role === 'student') {
      if (user.username === sessionUser.username) return user;
      if (user.role === 'admin' || user.role === 'guest') return null;
      return {
        username: user.username,
        branch: user.branch,
        role: user.role
      };
    }
    return null;
  }).filter(Boolean);

  res.json({ results: filtered });
});

// Admin: View all users
app.get('/all-users', async (req, res) => {
  const sessionUser = req.session.user;

  if (!sessionUser) {
    return res.status(403).json({ error: "Login required" });
  }

  if (sessionUser.role !== 'admin') {
    return res.status(403).json({
      error: "Only administrators can view all users"
    });
  }

  const users = await User.find({});
  res.json({ results: users });
});

// ➕ Add user (Admin + Student)
app.post('/add', async (req, res) => {
  const sessionUser = req.session.user;

  if (!sessionUser) {
    return res.status(403).json({ success: false, msg: "Login required" });
  }

  if (sessionUser.role !== 'admin') {
    log(`BLOCKED ADD: ${sessionUser.role} ${sessionUser.username}`);
    return res.status(403).json({
      success: false,
      msg: "Only administrators can add users"
    });
  }

  const { username, password, role, branch, marks } = req.body;

  if (
    typeof username !== 'string' ||
    typeof password !== 'string' ||
    typeof role !== 'string' ||
    typeof branch !== 'string' ||
    !Number.isFinite(Number(marks))
  ) {
    return res.status(400).json({
      success: false,
      msg: "Invalid user data"
    });
  }

  const newUser = new User({
    username,
    password,
    role,
    branch,
    marks: Number(marks)
  });

  await newUser.save();

  log(`ADD: ${sessionUser.role} ${sessionUser.username} added user ${username}`);
  res.json({ success: true });
});

// ✏️ Update user (Admin + Student → can only update themselves if student)
app.post('/update', async (req, res) => {
  const sessionUser = req.session.user;

  if (!sessionUser) {
    return res.status(403).json({ success: false, msg: "Login required" });
  }

  if (sessionUser.role !== 'admin') {
    log(`BLOCKED UPDATE: ${sessionUser.role} ${sessionUser.username}`);
    return res.status(403).json({
      success: false,
      msg: "Only administrators can update users"
    });
  }

  const { username, branch, marks } = req.body;

  if (
    typeof username !== 'string' ||
    typeof branch !== 'string' ||
    !Number.isFinite(Number(marks))
  ) {
    return res.status(400).json({
      success: false,
      msg: "Invalid update data"
    });
  }

  const updated = await User.findOneAndUpdate(
    { username },
    { $set: { branch, marks: Number(marks) } }
  );

  if (updated) {
    log(`UPDATE: ${sessionUser.role} ${sessionUser.username} updated ${username}`);
    res.json({ success: true });
  } else {
    res.json({ success: false, msg: "User not found" });
  }
});

// ❌ Delete user (Admin can delete anyone, Student can delete only themselves)
app.post('/delete', async (req, res) => {
  const sessionUser = req.session.user;

  if (!sessionUser) {
    return res.status(403).json({ success: false, msg: "Login required" });
  }

  if (sessionUser.role !== 'admin') {
    log(`BLOCKED DELETE: ${sessionUser.role} ${sessionUser.username}`);
    return res.status(403).json({
      success: false,
      msg: "Only administrators can delete users"
    });
  }

  const { username } = req.body;

  if (typeof username !== 'string') {
    return res.status(400).json({
      success: false,
      msg: "Invalid username"
    });
  }

  const deleted = await User.deleteOne({ username });

  if (deleted.deletedCount > 0) {
    log(`DELETE: ${sessionUser.role} ${sessionUser.username} deleted ${username}`);
    res.json({ success: true });
  } else {
    res.json({ success: false, msg: "User not found" });
  }
});

// 🔚 Logout
app.get('/logout', (req, res) => {
  log(`LOGOUT: ${req.session.user?.username}`);
  req.session.destroy(() => res.json({ success: true }));
});

app.listen(port, () => console.log(`🚀 Running on http://localhost:${port}`));
