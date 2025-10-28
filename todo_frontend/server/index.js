const express = require('express');
const cors = require('cors');
const path = require('path');
const sqlite3 = require('sqlite3').verbose();

// PUBLIC_INTERFACE
/**
 * Minimal Todo API Server
 * Exposes CRUD endpoints for todos backed by SQLite database.
 * Endpoints:
 *  - GET /api/todos: List all todos
 *  - POST /api/todos: Create todo { text }
 *  - PUT /api/todos/:id: Update todo { text?, completed? }
 *  - DELETE /api/todos/:id: Delete todo by id
 *
 * This server discovers the SQLite DB path from the database container's
 * db_connection.txt if available; otherwise falls back to a local db file.
 */
function createServer() {
  const app = express();
  const PORT = process.env.PORT || 3001;

  app.use(cors());
  app.use(express.json());

  // Attempt to read db path from sibling database container
  // Expected file: simple-todo-application-36788-36798/todo_database/db_connection.txt
  // Fallback: local ./data/todos.db within this container
  const dbConnFile = path.resolve(
    __dirname,
    '../../..',
    'simple-todo-application-36788-36798',
    'todo_database',
    'db_connection.txt'
  );

  let dbFilePath;
  try {
    const fs = require('fs');
    if (fs.existsSync(dbConnFile)) {
      const content = fs.readFileSync(dbConnFile, 'utf8');
      // Parse file path line: "# File path: /abs/path/to/myapp.db"
      const filePathLine = content
        .split('\n')
        .find((l) => l.toLowerCase().includes('file path:'));
      if (filePathLine) {
        dbFilePath = filePathLine.split(':').slice(1).join(':').trim();
      }
    }
  } catch (e) {
    // ignore and use fallback
  }

  if (!dbFilePath) {
    // Fallback under frontend container
    dbFilePath = path.resolve(__dirname, '../data/todos.db');
  }

  // Ensure directory for fallback exists
  const fs = require('fs');
  const dirForDb = path.dirname(dbFilePath);
  if (!fs.existsSync(dirForDb)) {
    fs.mkdirSync(dirForDb, { recursive: true });
  }

  // Connect to SQLite DB
  const db = new sqlite3.Database(dbFilePath);

  // Initialize todos table if not exists
  db.serialize(() => {
    db.run(
      `CREATE TABLE IF NOT EXISTS todos (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        text TEXT NOT NULL,
        completed INTEGER DEFAULT 0,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )`
    );
  });

  // Routes

  // PUBLIC_INTERFACE
  app.get('/api/todos', (req, res) => {
    /** List all todos ordered by created_at DESC */
    db.all('SELECT id, text, completed, created_at FROM todos ORDER BY created_at DESC', [], (err, rows) => {
      if (err) {
        return res.status(500).json({ error: 'Failed to fetch todos' });
      }
      const todos = rows.map((r) => ({
        id: r.id,
        text: r.text,
        completed: r.completed === 1,
        createdAt: r.created_at,
      }));
      res.json(todos);
    });
  });

  // PUBLIC_INTERFACE
  app.post('/api/todos', (req, res) => {
    /** Create todo with { text } */
    const { text } = req.body || {};
    if (!text || typeof text !== 'string' || text.trim().length === 0) {
      return res.status(400).json({ error: 'Text is required' });
    }
    const cleanText = text.trim();
    db.run('INSERT INTO todos (text) VALUES (?)', [cleanText], function (err) {
      if (err) return res.status(500).json({ error: 'Failed to create todo' });
      db.get('SELECT id, text, completed, created_at FROM todos WHERE id = ?', [this.lastID], (gErr, row) => {
        if (gErr || !row) return res.status(500).json({ error: 'Failed to load created todo' });
        return res.status(201).json({
          id: row.id,
          text: row.text,
          completed: row.completed === 1,
          createdAt: row.created_at,
        });
      });
    });
  });

  // PUBLIC_INTERFACE
  app.put('/api/todos/:id', (req, res) => {
    /** Update todo fields: { text?, completed? } */
    const { id } = req.params;
    const { text, completed } = req.body || {};

    // Build dynamic query to only update provided fields
    const fields = [];
    const values = [];

    if (typeof text === 'string') {
      const clean = text.trim();
      if (clean.length === 0) {
        return res.status(400).json({ error: 'Text cannot be empty' });
      }
      fields.push('text = ?');
      values.push(clean);
    }

    if (typeof completed === 'boolean') {
      fields.push('completed = ?');
      values.push(completed ? 1 : 0);
    }

    if (fields.length === 0) {
      return res.status(400).json({ error: 'No valid fields provided' });
    }

    values.push(id);

    db.run(`UPDATE todos SET ${fields.join(', ')} WHERE id = ?`, values, function (err) {
      if (err) return res.status(500).json({ error: 'Failed to update todo' });
      if (this.changes === 0) return res.status(404).json({ error: 'Todo not found' });

      db.get('SELECT id, text, completed, created_at FROM todos WHERE id = ?', [id], (gErr, row) => {
        if (gErr || !row) return res.status(500).json({ error: 'Failed to fetch updated todo' });
        return res.json({
          id: row.id,
          text: row.text,
          completed: row.completed === 1,
          createdAt: row.created_at,
        });
      });
    });
  });

  // PUBLIC_INTERFACE
  app.delete('/api/todos/:id', (req, res) => {
    /** Delete a todo by id */
    const { id } = req.params;
    db.run('DELETE FROM todos WHERE id = ?', [id], function (err) {
      if (err) return res.status(500).json({ error: 'Failed to delete todo' });
      if (this.changes === 0) return res.status(404).json({ error: 'Todo not found' });
      return res.status(204).send();
    });
  });

  // Health
  app.get('/api/health', (_req, res) => {
    res.json({ status: 'ok', dbFile: dbFilePath });
  });

  // Start server
  app.listen(PORT, () => {
    // eslint-disable-next-line no-console
    console.log(`Todo API listening on http://localhost:${PORT} using DB: ${dbFilePath}`);
  });

  return app;
}

// Start if run directly
if (require.main === module) {
  createServer();
}

module.exports = { createServer };
