import React, { useEffect, useRef, useState } from 'react';
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
   * - Lightweight error banner/toast with aria-live for accessibility.
   */
  const [todos, setTodos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState('');
  const errorTimeoutRef = useRef(null);

  // Non-intrusive error setter with auto-clear
  function showError(message) {
    if (!message) return;
    setErrorMsg(message);
    if (errorTimeoutRef.current) {
      clearTimeout(errorTimeoutRef.current);
    }
    errorTimeoutRef.current = setTimeout(() => {
      setErrorMsg('');
    }, 4000);
  }

  useEffect(() => {
    return () => {
      if (errorTimeoutRef.current) clearTimeout(errorTimeoutRef.current);
    };
  }, []);

  // Initial load
  useEffect(() => {
    let active = true;
    (async () => {
      try {
        const data = await fetchTodos();
        if (active) setTodos(data);
      } catch (e) {
        if (active) {
          setTodos([]);
          showError(e?.message || 'Failed to load todos');
        }
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
      showError(e?.message || 'Could not add todo');
      // keep error non-blocking
    }
  }

  // Toggle complete
  async function handleToggle(id, completed) {
    const prev = todos;
    setTodos((cur) => cur.map((t) => (t.id === id ? { ...t, completed } : t)));
    try {
      await updateTodo(id, { completed });
    } catch (e) {
      // rollback
      setTodos(prev);
      showError(e?.message || 'Could not update todo');
    }
  }

  // Edit text
  async function handleSave(id, text) {
    const prev = todos;
    setTodos((cur) => cur.map((t) => (t.id === id ? { ...t, text } : t)));
    try {
      await updateTodo(id, { text });
    } catch (e) {
      setTodos(prev);
      showError(e?.message || 'Could not save changes');
    }
  }

  // Delete
  async function handleDelete(id) {
    const prev = todos;
    setTodos((cur) => cur.filter((t) => t.id !== id));
    try {
      await deleteTodo(id);
    } catch (e) {
      setTodos(prev);
      showError(e?.message || 'Could not delete todo');
    }
  }

  return (
    <div className="container" role="main" aria-label="Retro Todo App">
      <div className="header">
        <h1 className="title">
          <span className="accent">Retro</span> Todos
        </h1>
      </div>

      {/* Error banner/toast - polite so it won't interrupt screen readers */}
      <div
        className={`toast ${errorMsg ? 'toast-visible' : ''}`}
        role="status"
        aria-live="polite"
        aria-atomic="true"
      >
        {errorMsg}
        {errorMsg && (
          <button
            className="toast-close"
            aria-label="Dismiss error message"
            onClick={() => setErrorMsg('')}
          >
            ×
          </button>
        )}
      </div>

      <TodoForm onAdd={handleAdd} />

      {loading ? (
        <p aria-live="polite">Loading…</p>
      ) : todos.length === 0 ? (
        <p aria-live="polite">No todos yet — add your first one!</p>
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
