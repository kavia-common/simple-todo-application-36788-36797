const BASE = '/api';

// Helper: extract server error message if present without breaking proxy usage
async function parseError(res) {
  try {
    const data = await res.json();
    if (data && data.error) return data.error;
  } catch {
    // ignore JSON parse failure
  }
  return `${res.status} ${res.statusText}`.trim();
}

// PUBLIC_INTERFACE
/**
 * Fetch all todos from the API.
 * @returns {Promise<Array<{id:number, text:string, completed:boolean, createdAt:string}>>}
 */
export async function fetchTodos() {
  try {
    const res = await fetch(`${BASE}/todos`);
    if (!res.ok) {
      const msg = await parseError(res);
      throw new Error(msg || 'Failed to fetch todos');
    }
    return await res.json();
  } catch (e) {
    // Network or parsing errors
    throw new Error(e?.message || 'Failed to fetch todos');
  }
}

// PUBLIC_INTERFACE
/**
 * Create a new todo with provided text.
 * @param {string} text
 * @returns {Promise<object>}
 */
export async function createTodo(text) {
  try {
    const res = await fetch(`${BASE}/todos`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text }),
    });
    if (!res.ok) {
      const msg = await parseError(res);
      throw new Error(msg || 'Failed to create todo');
    }
    return await res.json();
  } catch (e) {
    throw new Error(e?.message || 'Failed to create todo');
  }
}

// PUBLIC_INTERFACE
/**
 * Update a todo by id with partial body.
 * @param {number} id
 * @param {{text?:string, completed?:boolean}} body
 * @returns {Promise<object>}
 */
export async function updateTodo(id, body) {
  try {
    const res = await fetch(`${BASE}/todos/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });
    if (!res.ok) {
      const msg = await parseError(res);
      throw new Error(msg || 'Failed to update todo');
    }
    return await res.json();
  } catch (e) {
    throw new Error(e?.message || 'Failed to update todo');
  }
}

// PUBLIC_INTERFACE
/**
 * Delete a todo by id.
 * @param {number} id
 * @returns {Promise<void>}
 */
export async function deleteTodo(id) {
  try {
    const res = await fetch(`${BASE}/todos/${id}`, { method: 'DELETE' });
    if (!res.ok) {
      const msg = await parseError(res);
      throw new Error(msg || 'Failed to delete todo');
    }
  } catch (e) {
    throw new Error(e?.message || 'Failed to delete todo');
  }
}
