// public/script.js
const form = document.getElementById("commentForm");
const commentsDiv = document.getElementById("comments");

async function loadComments() {
  const res = await fetch("/comments");
  const comments = await res.json();
  commentsDiv.innerHTML = comments
    .map(
      (c) => `
      <div>
        <strong>${c.name}</strong> (${c.date}):<br>
        ${c.message}
      </div><hr>`
    )
    .join("");
}

form.addEventListener("submit", async (e) => {
  e.preventDefault();
  const name = document.getElementById("name").value;
  const message = document.getElementById("message").value;

  await fetch("/comments", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ name, message }),
  });

  form.reset();
  loadComments();
});

// Load comments on page load
loadComments();
