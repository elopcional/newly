//Backend – server.js
const express = require('express');
const fs = require('fs');
const cors = require('cors');
const bodyParser = require('body-parser');
const app = express();
const PORT = 3000;
const DATA_FILE = './data/posts.json';

app.use(cors());
app.use(bodyParser.json());
app.use(express.static('public'));

// Read posts
app.get('/posts', (req, res) => {
  fs.readFile(DATA_FILE, (err, data) => {
    if (err) return res.status(500).send('Server error');
    res.json(JSON.parse(data || '[]'));
  });
});

// Create post
app.post('/posts', (req, res) => {
  const { title, content } = req.body;
  fs.readFile(DATA_FILE, (err, data) => {
    const posts = data.length ? JSON.parse(data) : [];
    const newPost = { id: Date.now(), title, content };
    posts.push(newPost);
    fs.writeFile(DATA_FILE, JSON.stringify(posts, null, 2), err => {
      if (err) return res.status(500).send('Error saving');
      res.json(newPost);
    });
  });
});

// Update post
app.put('/posts/:id', (req, res) => {
  const id = parseInt(req.params.id);
  const { title, content } = req.body;

  fs.readFile(DATA_FILE, (err, data) => {
    let posts = JSON.parse(data);
    const index = posts.findIndex(p => p.id === id);
    if (index === -1) return res.status(404).send('Post not found');
    posts[index] = { id, title, content };
    fs.writeFile(DATA_FILE, JSON.stringify(posts, null, 2), err => {
      if (err) return res.status(500).send('Error updating');
      res.json(posts[index]);
    });
  });
});

// Delete post
app.delete('/posts/:id', (req, res) => {
  const id = parseInt(req.params.id);
  fs.readFile(DATA_FILE, (err, data) => {
    let posts = JSON.parse(data);
    posts = posts.filter(p => p.id !== id);
    fs.writeFile(DATA_FILE, JSON.stringify(posts, null, 2), err => {
      if (err) return res.status(500).send('Error deleting');
      res.sendStatus(200);
    });
  });
});

app.listen(PORT, () => console.log(`Server running at http://localhost:${PORT}`));

//Frontend Logic – public/script.js
const postsDiv = document.getElementById('posts');
const titleInput = document.getElementById('title');
const contentInput = document.getElementById('content');
const saveBtn = document.getElementById('saveBtn');
let editId = null;

async function loadPosts() {
  const res = await fetch('/posts');
  const posts = await res.json();
  postsDiv.innerHTML = '';
  posts.forEach(p => {
    const postEl = document.createElement('div');
    postEl.classList.add('post');
    postEl.innerHTML = `
      <h3>${p.title}</h3>
      <p>${p.content}</p>
      <button onclick="editPost(${p.id})">Edit</button>
      <button onclick="deletePost(${p.id})">Delete</button>
    `;
    postsDiv.appendChild(postEl);
  });
}

async function savePost() {
  const post = {
    title: titleInput.value,
    content: contentInput.value,
  };
  if (!post.title || !post.content) return alert('Please fill out both fields.');

  if (editId) {
    await fetch(`/posts/${editId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(post),
    });
    editId = null;
    saveBtn.textContent = 'Save Post';
  } else {
    await fetch('/posts', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(post),
    });
  }

  titleInput.value = '';
  contentInput.value = '';
  loadPosts();
}

async function deletePost(id) {
  if (!confirm('Are you sure?')) return;
  await fetch(`/posts/${id}`, { method: 'DELETE' });
  loadPosts();
}

async function editPost(id) {
  const res = await fetch('/posts');
  const posts = await res.json();
  const post = posts.find(p => p.id === id);
  if (!post) return;
  titleInput.value = post.title;
  contentInput.value = post.content;
  editId = id;
  saveBtn.textContent = 'Update Post';
}

saveBtn.addEventListener('click', savePost);
loadPosts();
