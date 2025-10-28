const BASE = '/api';

// PUBLIC_INTERFACE
/**
 * Fetch all todos from the API.
 * @returns {Promise<Array<{id:number, text:string, completed:boolean, createdAt:string}>>}
 */
export async function fetchTodos() {
  const res = await fetch(`${BASE}/todos`);
  if (!res.ok) throw new Error('Failed to fetch todos');
  return res.json();
}

// PUBLIC_INTERFACE
/**
 * Create a new todo with provided text.
 * @param {string} text
 * @returns {Promise<object>}
 */
export async function createTodo(text) {
  const res = await fetch(`${BASE}/todos`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ text }),
  });
  if (!res.ok) throw new Error('Failed to create todo');
  return res.json();
}

// PUBLIC_INTERFACE
/**
 * Update a todo by id with partial body.
 * @param {number} id
 * @param {{text?:string, completed?:boolean}} body
 * @returns {Promise<object>}
 */
export async function updateTodo(id, body) {
  const res = await fetch(`${BASE}/todos/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  if (!res.ok) throw new Error('Failed to update todo');
  return res.json();
}

// PUBLIC_INTERFACE
/**
 * Delete a todo by id.
 * @param {number} id
 * @returns {Promise<void>}
 */
export async function deleteTodo(id) {
  const res = await fetch(`${BASE}/todos/${id}`, { method: 'DELETE' });
  if (!res.ok) throw new Error('Failed to delete todo');
}
