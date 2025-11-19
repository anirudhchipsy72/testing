import express from 'express';
import cors from 'cors';
import { v4 as uuidv4 } from 'uuid';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import 'dotenv/config';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();
const PORT = process.env.PORT || 5000;

// =========================
// GLOBAL MIDDLEWARES
// =========================
app.use(cors({ origin: "*", methods: "GET,POST" }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// =========================
// BOT DETECTION LOGGER
// =========================
app.use((req, res, next) => {
  const userAgent = req.headers["user-agent"] || "";

  const isBot = /bot|facebookexternalhit|twitterbot|whatsapp|linkedinbot|pinterest|slackbot|telegrambot|discordbot|googlebot|bingbot|duckduckbot|baiduspider|yandexbot|facebot/i.test(
    userAgent
  );

  const logEntry = {
    url: req.originalUrl,
    method: req.method,
    userAgent,
    isBot,
    ip: req.ip,
  };

  console.info("REQUEST:", JSON.stringify(logEntry, null, 2));

  req.isBot = isBot;
  next();
});

// =========================
// MOCK DATABASE
// =========================
let posts = [
  {
    id: "1",
    username: "johndoe",
    content: "My first post!",
    likes: 10,
    comments: [],
    createdAt: new Date().toISOString()
  }
];

// =========================
// GET ALL POSTS
// =========================
app.get("/api/posts", (req, res) => res.json(posts));

// =========================
// ADD POST
// =========================
app.post("/api/posts", (req, res) => {
  const { username, content } = req.body;

  const newPost = {
    id: uuidv4(),
    username,
    content,
    likes: 0,
    comments: [],
    createdAt: new Date().toISOString()
  };

  posts = [newPost, ...posts];
  res.status(201).json(newPost);
});


app.post("/api/posts/:id/comments", (req, res) => {
  const { id } = req.params;
  const { username, text } = req.body;

  const post = posts.find(p => p.id === id);
  if (!post) return res.status(404).json({ error: "Post not found" });

  const newComment = {
    id: uuidv4(),
    username,
    text,
    createdAt: new Date().toISOString()
  };

  post.comments.push(newComment);
  res.status(201).json(newComment);
});

// =========================
// LIKE POST
// =========================
app.post("/api/posts/:id/like", (req, res) => {
  const post = posts.find(p => p.id === req.params.id);
  if (!post) return res.status(404).json({ error: "Post not found" });

  post.likes += 1;
  res.json({ likes: post.likes });
});

// =========================
// OG META SHARE PAGE
// =========================
app.get("/post/:id", (req, res) => {
  const post = posts.find(p => p.id === req.params.id);
  if (!post) return res.status(404).send("Post not found");

  const html = `
    <!DOCTYPE html>
    <html>
      <head>
        <title>Post by ${post.username}</title>

        <meta property="og:title" content="Post by ${post.username}">
        <meta property="og:description" content="${post.content}">
        <meta property="og:type" content="website">

        <meta name="twitter:card" content="summary_large_image">
      </head>
      <body>Loading...</body>
    </html>
  `;

  if (req.isBot) {
    console.info("BOT detected → Sending meta tags");
    return res.send(html);
  }

  console.info("Human → Redirecting to SPA");
  return res.redirect(`/?postId=${post.id}`);
});

// =========================
// 404 HANDLER
// =========================
app.use((req, res) => res.status(404).json({ error: "Not found" }));

// =========================
// START SERVER
// =========================
if (process.env.NODE_ENV !== "production") {
  app.listen(PORT, () => console.log("Server running on port", PORT));
}

export default app;
