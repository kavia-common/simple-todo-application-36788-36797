# Minimal Todo API

- Port: 3001 (via `server/index.js`)
- Proxy: The React dev server (port 3000) proxies `/api/*` to this API because `package.json` has `"proxy": "http://localhost:3001"`.

Database discovery:
- The server discovers the SQLite DB path from sibling container:
  `simple-todo-application-36788-36798/todo_database/db_connection.txt`
- It reads the line beginning with `File path:` and uses the remainder as the absolute DB path.
- If the file is missing or unparsable, it falls back to local `todo_frontend/data/todos.db` (and creates directories if needed).

Recommended startup sequence:
1) Start the database container (todo_database) so it can generate `db_connection.txt`.
2) Start this frontend container with `npm start` (which runs both API and client).

Endpoints:
- GET /api/todos
- POST /api/todos { text }
- PUT /api/todos/:id { text?, completed? }
- DELETE /api/todos/:id

Health:
- GET /api/health
  - Returns status and the resolved DB file path along with discovery notes.
