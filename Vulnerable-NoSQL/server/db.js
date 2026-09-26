const mongoose = require('mongoose');
mongoose.connect('mongodb://localhost:27017/project_vulnerable', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
}).then(() => console.log("✅ Connected to MongoDB"))
  .catch(err => console.error("❌ DB Error:", err));