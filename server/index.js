import express from 'express';
import cors from 'cors';
import { v4 as uuidv4 } from 'uuid';
import multer from 'multer';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import fs from 'fs';
import 'dotenv/config';

process.on('uncaughtException', (error) => {
  console.error('Uncaught Exception:', error);
  process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
});

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();
const PORT = process.env.PORT || 5000;

// Create uploads directory if it doesn't exist
const uploadsDir = process.env.UPLOAD_DIR || join(__dirname, 'public', 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadsDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    const ext = file.originalname.split('.').pop();
    cb(null, `${uniqueSuffix}.${ext}`);
  },
});

const upload = multer({
  storage: storage,
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed!'), false);
    }
  },
  limits: { fileSize: parseInt(process.env.MAX_FILE_SIZE) || 5 * 1024 * 1024 },
});

// Middleware
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true,
  optionsSuccessStatus: 200
}));

// Enhanced user agent logging middleware
app.use((req, res, next) => {
  try {
    const userAgent = req.headers['user-agent'] || '';
    const isBot = /bot|facebookexternalhit|Twitterbot|WhatsApp|LinkedInBot|Pinterest|Slackbot|TelegramBot|Discordbot|Googlebot|Bingbot|Slurp|DuckDuckBot|Baiduspider|YandexBot|facebot|ia_archiver/i.test(userAgent);
    
    // Enhanced logging with timestamp and request details
    const logEntry = {
      timestamp: new Date().toISOString(),
      method: req.method,
      url: req.originalUrl,
      userAgent: userAgent,
      isBot: isBot,
      ip: req.ip || req.connection.remoteAddress,
      headers: {
        'accept': req.headers['accept'],
        'x-forwarded-for': req.headers['x-forwarded-for']
      }
    };
    
    // Log to console (will appear in Vercel logs)
    console.log('--- Request Log ---');
    console.log(JSON.stringify(logEntry, null, 2));
    console.log('-------------------');
    
    // Add bot info to request object
    req.isBot = isBot;
    
    next();
  } catch (error) {
    console.error('Error in request logging middleware:', error);
    next(error);
  }
});

// Parse JSON bodies
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static files with proper headers
app.use('/uploads', express.static('public/uploads', {
  setHeaders: (res, path) => {
    // Set CORS headers for all static files
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods', 'GET, OPTIONS');
    
    // Set content type based on file extension
    if (path.endsWith('.jpg') || path.endsWith('.jpeg')) {
      res.set('Content-Type', 'image/jpeg');
    } else if (path.endsWith('.png')) {
      res.set('Content-Type', 'image/png');
    } else if (path.endsWith('.gif')) {
      res.set('Content-Type', 'image/gif');
    } else if (path.endsWith('.webp')) {
      res.set('Content-Type', 'image/webp');
    }
    
    // Cache control for images
    if (path.match(/\.(jpg|jpeg|png|gif|webp)$/)) {
      res.set('Cache-Control', 'public, max-age=31536000, immutable');
    } else {
      res.set('Cache-Control', 'no-cache, no-store, must-revalidate');
    }
  }
}));

// Mock database
let posts = [
  {
    id: '1',
    username: 'johndoe',
    content: 'Just set up my new React app with Express backend! #coding #react',
    imageUrl: null,
    likes: 10,
    comments: [],
    createdAt: new Date().toISOString()
  },
  {
    id: '2',
    username: 'janedoe',
    content: 'Learning full-stack development is exciting!',
    imageUrl: null,
    likes: 5,
    comments: [
      { id: '1', username: 'johndoe', text: 'Keep it up!', createdAt: new Date().toISOString() }
    ],
    createdAt: new Date(Date.now() - 3600000).toISOString()
  }
];

// Get all posts
app.get('/api/posts', (req, res) => {
  res.json(posts);
});

// Create a new post with image
app.post('/api/posts', upload.single('image'), (req, res) => {
  try {
    const { username, content } = req.body;
    
    if (!username || !content) {
      return res.status(400).json({ error: 'Username and content are required' });
    }

    const imageUrl = req.file ? `/uploads/${req.file.filename}` : null;

    const newPost = {
      id: uuidv4(),
      username,
      content,
      imageUrl,
      likes: 0,
      comments: [],
      createdAt: new Date().toISOString()
    };

    posts = [newPost, ...posts];
    res.status(201).json(newPost);
  } catch (error) {
    console.error('Error creating post:', error);
    res.status(500).json({ error: 'Failed to create post' });
  }
});

// Add a comment to a post
app.post('/api/posts/:id/comments', (req, res) => {
  const { id } = req.params;
  const { username, text } = req.body;

  if (!username || !text) {
    return res.status(400).json({ error: 'Username and text are required' });
  }

  const post = posts.find(p => p.id === id);
  if (!post) {
    return res.status(404).json({ error: 'Post not found' });
  }

  const newComment = {
    id: uuidv4(),
    username,
    text,
    createdAt: new Date().toISOString()
  };

  post.comments.push(newComment);
  res.status(201).json(newComment);
});

// Like a post
app.post('/api/posts/:id/like', (req, res) => {
  const { id } = req.params;
  const post = posts.find(p => p.id === id);
  
  if (!post) {
    return res.status(404).json({ error: 'Post not found' });
  }

  post.likes += 1;
  res.json({ likes: post.likes });
});

// Add this route before the 404 handler
app.get('/post/:id', async (req, res) => {
  try {
    console.log('Bot detection - Is Bot:', req.isBot);
    console.log('Request Headers:', req.headers);
    
    const postId = req.params.id;
    const post = posts.find(p => p.id === postId);
    
    if (!post) {
      return res.status(404).send('Post not found');
    }

    const imageUrl = post.imageUrl 
      ? `https://testing-j9ds6pdvz-yoyomaster12s-projects.vercel.app${
          post.imageUrl.startsWith('/') ? '' : '/'
        }${post.imageUrl}`
      : '';

    const html = `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Post by ${post.username}</title>
      <meta name="description" content="${post.content.substring(0, 155)}...">
      
      <!-- Open Graph / Facebook -->
      <meta property="og:type" content="website">
      <meta property="og:url" content="https://testing-j9ds6pdvz-yoyomaster12s-projects.vercel.app/post/${post.id}">
      <meta property="og:title" content="Post by ${post.username}">
      <meta property="og:description" content="${post.content.substring(0, 155)}...">
      ${imageUrl ? `
      <meta property="og:image" content="${imageUrl}">
      <meta property="og:image:width" content="1200">
      <meta property="og:image:height" content="630">
      ` : ''}
      
      <!-- Twitter -->
      <meta name="twitter:card" content="summary_large_image">
      <meta name="twitter:title" content="Post by ${post.username}">
      <meta name="twitter:description" content="${post.content.substring(0, 200)}...">
      ${imageUrl ? `<meta name="twitter:image" content="${imageUrl}">` : ''}
      
      <!-- Redirect to the actual post in the SPA -->
      <meta http-equiv="refresh" content="0;url=/?postId=${post.id}">
    </head>
    <body>
      <p>Redirecting to post...</p>
      <script>
        window.location.href = "/?postId=${post.id}";
      </script>
    </body>
    </html>
    `;

    res.send(html);
  } catch (error) {
    console.error('Error generating post page:', error);
    res.status(500).send('Internal Server Error');
  }
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Error:', err.stack);
  res.status(500).send('Something broke! Please check the server logs.');
});

// Handle 404
app.use((req, res) => {
  res.status(404).json({ error: 'Not found' });
});

// Start server only when not in Vercel environment
if (process.env.NODE_ENV !== 'production') {
  app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

export default app;
