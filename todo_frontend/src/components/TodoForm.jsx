import React, { useState } from 'react';

/**
 * TodoForm - input form for creating a new todo.
 * Props:
 *  - onAdd(text: string): Promise<void> | void
 */
export default function TodoForm({ onAdd }) {
  const [text, setText] = useState('');
  const [pending, setPending] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    const t = text.trim();
    if (!t) return;
    try {
      setPending(true);
      await onAdd(t);
      setText('');
    } finally {
      setPending(false);
    }
  }

  return (
    <form className="form" onSubmit={handleSubmit} aria-label="Add Todo Form">
      <input
        className="input"
        type="text"
        placeholder="What needs doing?"
        value={text}
        onChange={(e) => setText(e.target.value)}
        disabled={pending}
        aria-label="Todo text"
      />
      <button className="btn" type="submit" disabled={pending}>
        {pending ? 'Adding…' : 'Add'}
      </button>
    </form>
  );
}
