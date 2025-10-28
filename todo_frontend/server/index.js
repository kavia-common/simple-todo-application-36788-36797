const express = require('express');
const cors = require('cors');
const path = require('path');
const sqlite3 = require('sqlite3').verbose();
const fs = require('fs');

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

  // Helper: consistent error response
  function sendError(res, status, code, message, details) {
    return res.status(status).json({
      error: {
        code,
        message,
        ...(details ? { details } : {}),
      },
    });
  }

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
  let dbDiscovery = { source: 'fallback', fileChecked: dbConnFile, parseNote: '' };

  try {
    if (fs.existsSync(dbConnFile)) {
      const content = fs.readFileSync(dbConnFile, 'utf8');

      // Parse a line that contains "File path:" (case-insensitive)
      const lines = content.split(/\r?\n/);
      const filePathLine = lines.find((l) => l.toLowerCase().includes('file path:'));
      if (filePathLine) {
        // Split on the first ':' only, to preserve absolute paths containing ':'
        const idx = filePathLine.indexOf(':');
        const potential = filePathLine.slice(idx + 1).trim();
        if (potential && !potential.startsWith('#')) {
          dbFilePath = potential;
          dbDiscovery.source = 'db_connection.txt';
          dbDiscovery.parseNote = 'Parsed from "File path:" line';
        } else {
          dbDiscovery.parseNote = 'File path line present but empty or commented';
        }
      } else {
        dbDiscovery.parseNote = 'No "File path:" line found';
      }

      // If not found, attempt to parse an absolute path-like token
      if (!dbFilePath) {
        const absMatch = content.match(/(?:[A-Za-z]:)?\/[^\s]+\.db/);
        if (absMatch) {
          dbFilePath = absMatch[0];
          dbDiscovery.source = 'db_connection.txt';
          dbDiscovery.parseNote = 'Fallback regex path parse';
        }
      }
    } else {
      dbDiscovery.parseNote = 'db_connection.txt not found';
    }
  } catch (e) {
    // Keep silent for runtime robustness; we will log at startup
    dbDiscovery.parseNote = `Error reading/parsing db_connection.txt: ${e.message}`;
  }

  if (!dbFilePath) {
    // Fallback under frontend container
    dbFilePath = path.resolve(__dirname, '../data/todos.db');
  }

  // Ensure directory for fallback or discovered path exists
  const dirForDb = path.dirname(dbFilePath);
  if (!fs.existsSync(dirForDb)) {
    try {
      fs.mkdirSync(dirForDb, { recursive: true });
    } catch (e) {
      // If directory creation fails, report a clear error on startup requests
      // We'll still attempt to open sqlite, which will surface errors on use.
    }
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

  // Middleware: validate numeric :id
  function requireNumericId(req, res, next) {
    const idStr = req.params.id;
    const idNum = Number(idStr);
    if (!Number.isFinite(idNum) || !Number.isInteger(idNum) || idNum <= 0) {
      return sendError(res, 400, 'INVALID_ID', 'The "id" parameter must be a positive integer.', {
        received: idStr,
      });
    }
    // Normalize id to number to avoid accidental string usage
    req.params.id = idNum;
    return next();
  }

  // Routes

  // PUBLIC_INTERFACE
  app.get('/api/todos', (req, res) => {
    /** List all todos ordered by created_at DESC */
    db.all(
      'SELECT id, text, completed, created_at FROM todos ORDER BY created_at DESC',
      [],
      (err, rows) => {
        if (err) {
          return sendError(res, 500, 'FETCH_FAILED', 'Failed to fetch todos.');
        }
        const todos = rows.map((r) => ({
          id: r.id,
          text: r.text,
          completed: r.completed === 1,
          createdAt: r.created_at,
        }));
        res.json(todos);
      }
    );
  });

  // PUBLIC_INTERFACE
  app.post('/api/todos', (req, res) => {
    /** Create todo with { text } */
    const { text } = req.body || {};
    if (!text || typeof text !== 'string' || text.trim().length === 0) {
      return sendError(res, 400, 'VALIDATION_ERROR', 'Text is required.');
    }
    const cleanText = text.trim();
    db.run('INSERT INTO todos (text) VALUES (?)', [cleanText], function (err) {
      if (err) return sendError(res, 500, 'CREATE_FAILED', 'Failed to create todo.');
      db.get(
        'SELECT id, text, completed, created_at FROM todos WHERE id = ?',
        [this.lastID],
        (gErr, row) => {
          if (gErr || !row)
            return sendError(res, 500, 'LOAD_AFTER_CREATE_FAILED', 'Failed to load created todo.');
          return res.status(201).json({
            id: row.id,
            text: row.text,
            completed: row.completed === 1,
            createdAt: row.created_at,
          });
        }
      );
    });
  });

  // PUBLIC_INTERFACE
  app.put('/api/todos/:id', requireNumericId, (req, res) => {
    /** Update todo fields: { text?, completed? } */
    const { id } = req.params;
    const { text, completed } = req.body || {};

    // Build dynamic query to only update provided fields
    const fields = [];
    const values = [];

    if (typeof text === 'string') {
      const clean = text.trim();
      if (clean.length === 0) {
        return sendError(res, 400, 'VALIDATION_ERROR', 'Text cannot be empty.');
      }
      fields.push('text = ?');
      values.push(clean);
    }

    if (typeof completed === 'boolean') {
      fields.push('completed = ?');
      values.push(completed ? 1 : 0);
    }

    if (fields.length === 0) {
      return sendError(res, 400, 'NO_FIELDS', 'No valid fields provided.');
    }

    values.push(id);

    db.run(`UPDATE todos SET ${fields.join(', ')} WHERE id = ?`, values, function (err) {
      if (err) return sendError(res, 500, 'UPDATE_FAILED', 'Failed to update todo.');
      if (this.changes === 0) return sendError(res, 404, 'NOT_FOUND', 'Todo not found.');

      db.get('SELECT id, text, completed, created_at FROM todos WHERE id = ?', [id], (gErr, row) => {
        if (gErr || !row)
          return sendError(res, 500, 'FETCH_AFTER_UPDATE_FAILED', 'Failed to fetch updated todo.');
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
  app.delete('/api/todos/:id', requireNumericId, (req, res) => {
    /** Delete a todo by id */
    const { id } = req.params;
    db.run('DELETE FROM todos WHERE id = ?', [id], function (err) {
      if (err) return sendError(res, 500, 'DELETE_FAILED', 'Failed to delete todo.');
      if (this.changes === 0) return sendError(res, 404, 'NOT_FOUND', 'Todo not found.');
      return res.status(204).send();
    });
  });

  // Health
  app.get('/api/health', (_req, res) => {
    res.json({
      status: 'ok',
      db: {
        file: dbFilePath,
        source: dbDiscovery.source,
        fileChecked: dbDiscovery.fileChecked,
        note: dbDiscovery.parseNote,
      },
    });
  });

  // Start server
  app.listen(PORT, () => {
    // eslint-disable-next-line no-console
    console.log(
      `[Todo API] Listening on http://localhost:${PORT}\n[Todo API] DB path: ${dbFilePath}\n[Todo API] DB discovery: ${dbDiscovery.source} (${dbDiscovery.parseNote || 'n/a'})`
    );
  });

  return app;
}

// Start if run directly
if (require.main === module) {
  createServer();
}

module.exports = { createServer };
