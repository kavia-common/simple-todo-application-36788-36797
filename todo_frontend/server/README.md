# Minimal Todo API

- Runs on port 3001 by default (via `server/index.js`).
- Discovers SQLite DB path from sibling container:
  `simple-todo-application-36788-36798/todo_database/db_connection.txt` (parses `File path:` line).
- Falls back to local `todo_frontend/data/todos.db` if not found.

Endpoints:
- GET /api/todos
- POST /api/todos { text }
- PUT /api/todos/:id { text?, completed? }
- DELETE /api/todos/:id
