# Todo Database (SQLite)

This container provides SQLite storage for the Todo application.

Ports:
- This is a file-based database; it does not expose a TCP port.

Startup and Integration:
- On initialization, this container creates/maintains the SQLite `.db` file that the frontend API will use.
- It must run before the frontend so the API can discover the DB path via `db_connection.txt`.

db_connection.txt:
- The frontend API (running at port 3001 in the frontend container) looks for:
  simple-todo-application-36788-36798/todo_database/db_connection.txt
- The file should contain a line starting with:
  File path: /absolute/path/to/todos.db
- The API parses that line and uses the path for SQLite access.
- If the file is missing or does not contain a `File path:` line, the frontend API falls back to a local DB file at:
  simple-todo-application-36788-36797/todo_frontend/data/todos.db

Recommended startup sequence:
1) Start this database container (todo_database) to ensure the `.db` file exists and `db_connection.txt` is present with a valid path.
2) Start the frontend container (todo_frontend) and run `npm start`. This will:
   - Start the API on port 3001
   - Start the React dev server on port 3000 with proxy to the API

Notes:
- No port or framework changes are required; the frontend `package.json` retains the `"proxy": "http://localhost:3001"`.
- If running locally with a custom DB location, update `db_connection.txt` accordingly to point to the absolute file path.
