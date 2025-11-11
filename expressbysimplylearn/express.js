// server.js
const express = require("express");
const fs = require("fs");
const path = require("path");
const app = express();
const PORT = 3000;

// Middleware
app.use(express.json());
app.use(express.static("public"));

// Path to comments file
const dataPath = path.join(__dirname, "data.json");

// Read existing comments
const getComments = () => {
  if (!fs.existsSync(dataPath)) return [];
  const data = fs.readFileSync(dataPath);
  return JSON.parse(data);
};

// Save comments
const saveComments = (comments) => {
  fs.writeFileSync(dataPath, JSON.stringify(comments, null, 2));
};

// Routes
app.get("/comments", (req, res) => {
  res.json(getComments());
});

app.post("/comments", (req, res) => {
  const comments = getComments();
  const newComment = {
    id: Date.now(),
    name: req.body.name,
    message: req.body.message,
    date: new Date().toLocaleString(),
  };
  comments.push(newComment);
  saveComments(comments);
  res.json(newComment);
});

// Start server
app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));

//