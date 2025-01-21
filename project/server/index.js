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
app.use('/uploads', express.static(join(__dirname, 'uploads')));

// Configure multer for image uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const uploadsDir = join(__dirname, 'uploads');
    cb(null, uploadsDir);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + '-' + file.originalname);
  }
});

const upload = multer({ storage: storage });

// Add error handling middleware
app.use((err, req, res, next) => {
  console.error('Global error:', err);
  res.status(500).send({ error: 'Internal server error: ' + err.message });
});

// Database setup
let db;
async function setupDatabase() {
  try {
    // Ensure uploads directory exists with proper path
    const uploadsDir = join(__dirname, 'uploads');
    await fs.mkdir(uploadsDir, { recursive: true });
    console.log('Uploads directory created at:', uploadsDir);
    
    const dbPath = join(__dirname, 'database.sqlite');
    console.log('Setting up database at:', dbPath);
    
    db = await open({
      filename: dbPath,
      driver: sqlite3.Database
    });
    
    console.log('Database connection established');

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
    console.log('Database tables created successfully');
  } catch (error) {
    console.error('Database setup failed:', error);
    throw error; // Let the error propagate instead of exiting
  }
}

// Initialize the server
async function initializeServer() {
  try {
    await setupDatabase();
    
    app.listen(port, () => {
      console.log(`Server running at http://localhost:${port}`);
    });
  } catch (error) {
    console.error('Server initialization failed:', error);
    process.exit(1);
  }
}

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
  try {
    if (!req.file) {
      console.log('No file uploaded');
      return res.status(400).send({ error: 'No file uploaded' });
    }
    console.log('File uploaded successfully:', req.file);
    const imageUrl = `http://localhost:${port}/uploads/${req.file.filename}`;
    res.send({ imageUrl });
  } catch (error) {
    console.error('Error uploading image:', error);
    res.status(500).send({ error: 'Failed to upload image: ' + error.message });
  }
});

// Save email template
app.post('/api/uploadEmailConfig', async (req, res) => {
  try {
    console.log('Received template upload request:', req.body);
    const { title, content, footer, imageUrl, styles } = req.body;
    
    if (!title || !content) {
      console.log('Validation failed: missing title or content');
      return res.status(400).send({ error: 'Title and content are required' });
    }

    if (!db) {
      throw new Error('Database connection not established');
    }

    const result = await db.run(
      `INSERT INTO templates (title, content, footer, imageUrl, styles)
       VALUES (?, ?, ?, ?, ?)`,
      [title, content, footer, imageUrl, JSON.stringify(styles)]
    );
    
    console.log('Template saved successfully:', result);
    res.send({ id: result.lastID });
  } catch (error) {
    console.error('Error saving template:', error);
    res.status(500).send({ 
      error: 'Failed to save template',
      details: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
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

// Replace the direct server start with the initialization function
initializeServer();
