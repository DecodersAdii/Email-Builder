import express from 'express';
import cors from 'cors';
import multer from 'multer';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import fs from 'fs/promises';
import Handlebars from 'handlebars';
import { open } from 'sqlite';
import sqlite3 from 'sqlite3';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();
const port = 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use('/uploads', express.static('uploads'));

// Configure multer for image uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/');
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + '-' + file.originalname);
  }
});

const upload = multer({ storage: storage });

// Database setup
let db;
async function setupDatabase() {
  // Ensure uploads directory exists
  await fs.mkdir('uploads', { recursive: true });
  
  db = await open({
    filename: 'database.sqlite',
    driver: sqlite3.Database
  });

  await db.exec(`
    CREATE TABLE IF NOT EXISTS templates (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT NOT NULL,
      content TEXT NOT NULL,
      footer TEXT,
      imageUrl TEXT,
      styles TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);
}

setupDatabase();

// Get email layout
app.get('/api/getEmailLayout', async (req, res) => {
  try {
    const templatePath = join(__dirname, '..', 'src', 'templates', 'default.html');
    const template = await fs.readFile(templatePath, 'utf-8');
    res.send(template);
  } catch (error) {
    res.status(500).send({ error: 'Failed to read template file' });
  }
});

// Upload image
app.post('/api/uploadImage', upload.single('image'), (req, res) => {
  if (!req.file) {
    return res.status(400).send({ error: 'No file uploaded' });
  }
  const imageUrl = `http://localhost:${port}/uploads/${req.file.filename}`;
  res.send({ imageUrl });
});

// Save email template
app.post('/api/uploadEmailConfig', async (req, res) => {
  try {
    const { title, content, footer, imageUrl, styles } = req.body;
    const result = await db.run(
      `INSERT INTO templates (title, content, footer, imageUrl, styles)
       VALUES (?, ?, ?, ?, ?)`,
      [title, content, footer, imageUrl, JSON.stringify(styles)]
    );
    res.send({ id: result.lastID });
  } catch (error) {
    res.status(500).send({ error: 'Failed to save template' });
  }
});

// Get all templates
app.get('/api/templates', async (req, res) => {
  try {
    const templates = await db.all('SELECT * FROM templates ORDER BY created_at DESC');
    res.send(templates);
  } catch (error) {
    res.status(500).send({ error: 'Failed to fetch templates' });
  }
});

// Render and download template
app.post('/api/renderAndDownloadTemplate', async (req, res) => {
  try {
    const templatePath = join(__dirname, '..', 'src', 'templates', 'default.html');
    const templateContent = await fs.readFile(templatePath, 'utf-8');
    const template = Handlebars.compile(templateContent);
    const html = template(req.body);
    
    res.setHeader('Content-Type', 'text/html');
    res.setHeader('Content-Disposition', 'attachment; filename=email-template.html');
    res.send(html);
  } catch (error) {
    res.status(500).send({ error: 'Failed to render template' });
  }
});

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});