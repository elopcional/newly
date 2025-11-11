//Backend – server.js
import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import Post from "./models/Post.js";

const app = express();
app.use(cors());
app.use(express.json());

// ✅ Connect to MongoDB
mongoose.connect("mongodb://localhost:27017/myPostsDB")
  .then(() => console.log("✅ MongoDB connected"))
  .catch(err => console.error(err));

// ✅ Routes

// Get all posts
app.get("/posts", async (req, res) => {
  const posts = await Post.find().sort({ createdAt: -1 });
  res.json(posts);
});

// Create new post
app.post("/posts", async (req, res) => {
  const { title, content } = req.body;
  const newPost = new Post({ title, content });
  await newPost.save();
  res.json({ message: "Post added successfully!" });
});

// Update post
app.put("/posts/:id", async (req, res) => {
  const { id } = req.params;
  const { title, content } = req.body;
  await Post.findByIdAndUpdate(id, { title, content });
  res.json({ message: "Post updated successfully!" });
});

// Delete post
app.delete("/posts/:id", async (req, res) => {
  const { id } = req.params;
  await Post.findByIdAndDelete(id);
  res.json({ message: "Post deleted successfully!" });
});

app.listen(5000, () => console.log("🚀 Server running on http://localhost:5000"));


import mongoose from "mongoose";

const postSchema = new mongoose.Schema({
  title: String,
  content: String
}, { timestamps: true });

export default mongoose.model("Post", postSchema);