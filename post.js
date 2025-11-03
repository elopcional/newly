// ===== LOGIN PAGE =====
const loginForm = document.getElementById('loginForm');
if (loginForm) {
  loginForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;

    const res = await fetch('/login', {
      method: 'POST',
      headers: {'Content-Type': 'application/json'},
      body: JSON.stringify({ username, password })
    });

    if (res.ok) {
      window.location.href = 'post.html';
    } else {
      alert('Invalid credentials');
    }
  });
}

// ===== POST PAGE =====
const postForm = document.getElementById('postForm');
if (postForm) {
  postForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const postContent = document.getElementById('postContent').value;

    const res = await fetch('/post', {
      method: 'POST',
      headers: {'Content-Type': 'application/json'},
      body: JSON.stringify({ content: postContent })
    });

    if (res.ok) {
      document.getElementById('postContent').value = '';
      loadPosts();
    } else {
      alert('You must be logged in to post');
    }
  });

  async function loadPosts() {
    const res = await fetch('/posts');
    const posts = await res.json();
    const container = document.getElementById('postsContainer');
    container.innerHTML = posts.map(p => `<p><b>${p.user}:</b> ${p.content}</p>`).join('');
  }

  loadPosts();
}

// ===== LOGOUT =====
const logoutBtn = document.getElementById('logoutBtn');
if (logoutBtn) {
  logoutBtn.addEventListener('click', async () => {
    await fetch('/logout');
    window.location.href = 'index.html';
  });
}



//backend code with express.js
const express = require('express');
const fs = require('fs');
const session = require('express-session');
const app = express();
const PORT = 3000;

app.use(express.static('public'));
app.use(express.json());
app.use(session({
  secret: 'secretKey',
  resave: false,
  saveUninitialized: false
}));

let data = JSON.parse(fs.readFileSync('data.json', 'utf-8'));

// Login
app.post('/login', (req, res) => {
  const { username, password } = req.body;
  const user = data.users.find(u => u.username === username && u.password === password);
  if (user) {
    req.session.user = username;
    res.sendStatus(200);
  } else {
    res.sendStatus(401);
  }
});

// Create post
app.post('/post', (req, res) => {
  if (!req.session.user) return res.sendStatus(403);
  data.posts.push({ user: req.session.user, content: req.body.content });
  fs.writeFileSync('data.json', JSON.stringify(data, null, 2));
  res.sendStatus(200);
});

// Get all posts
app.get('/posts', (req, res) => {
  res.json(data.posts);
});

// Logout
app.get('/logout', (req, res) => {
  req.session.destroy(() => res.sendStatus(200));
});

app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));
