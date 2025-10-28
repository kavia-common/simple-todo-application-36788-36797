import React, { useEffect, useState } from 'react';
import './App.css';
import './styles/retro.css';
import TodoForm from './components/TodoForm';
import TodoItem from './components/TodoItem';
import { fetchTodos, createTodo, updateTodo, deleteTodo } from './services/api';

// PUBLIC_INTERFACE
function App() {
  /**
   * Retro-themed Todo App
   * - Single column layout with header, add form, and todo list.
   * - Optimistic updates for add, toggle, edit, and delete.
   */
  const [todos, setTodos] = useState([]);
  const [loading, setLoading] = useState(true);

  // Initial load
  useEffect(() => {
    let active = true;
    (async () => {
      try {
        const data = await fetchTodos();
        if (active) setTodos(data);
      } catch {
        // If API is not ready, show empty state without crashing
        if (active) setTodos([]);
      } finally {
        if (active) setLoading(false);
      }
    })();
    return () => {
      active = false;
    };
  }, []);

  // Add
  async function handleAdd(text) {
    // optimistic item with temp id
    const tempId = Date.now();
    const optimistic = { id: tempId, text, completed: false, createdAt: new Date().toISOString() };
    setTodos((prev) => [optimistic, ...prev]);
    try {
      const created = await createTodo(text);
      setTodos((prev) => prev.map((t) => (t.id === tempId ? created : t)));
    } catch (e) {
      // rollback
      setTodos((prev) => prev.filter((t) => t.id !== tempId));
      throw e;
    }
  }

  // Toggle complete
  async function handleToggle(id, completed) {
    const prev = todos;
    setTodos((cur) => cur.map((t) => (t.id === id ? { ...t, completed } : t)));
    try {
      await updateTodo(id, { completed });
    } catch {
      // rollback
      setTodos(prev);
    }
  }

  // Edit text
  async function handleSave(id, text) {
    const prev = todos;
    setTodos((cur) => cur.map((t) => (t.id === id ? { ...t, text } : t)));
    try {
      await updateTodo(id, { text });
    } catch {
      setTodos(prev);
    }
  }

  // Delete
  async function handleDelete(id) {
    const prev = todos;
    setTodos((cur) => cur.filter((t) => t.id !== id));
    try {
      await deleteTodo(id);
    } catch {
      setTodos(prev);
    }
  }

  return (
    <div className="container" role="main" aria-label="Retro Todo App">
      <div className="header">
        <h1 className="title">
          <span className="accent">Retro</span> Todos
        </h1>
      </div>

      <TodoForm onAdd={handleAdd} />

      {loading ? (
        <p>Loading…</p>
      ) : todos.length === 0 ? (
        <p>No todos yet — add your first one!</p>
      ) : (
        <div className="list" role="list" aria-label="Todo List">
          {todos.map((t) => (
            <TodoItem
              key={t.id}
              todo={t}
              onToggle={handleToggle}
              onSave={handleSave}
              onDelete={handleDelete}
            />
          ))}
        </div>
      )}
    </div>
  );
}

export default App;
