import React, { useState } from 'react';

/**
 * TodoItem - individual todo row with edit and delete.
 * Props:
 *  - todo: {id, text, completed}
 *  - onToggle(id, completed)
 *  - onSave(id, newText)
 *  - onDelete(id)
 */
export default function TodoItem({ todo, onToggle, onSave, onDelete }) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(todo.text);
  const [pending, setPending] = useState(false);

  async function handleSave() {
    const t = draft.trim();
    if (!t || t === todo.text) {
      setEditing(false);
      setDraft(todo.text);
      return;
    }
    try {
      setPending(true);
      await onSave(todo.id, t);
      setEditing(false);
    } finally {
      setPending(false);
    }
  }

  return (
    <div className="item" role="listitem">
      <input
        className="checkbox"
        type="checkbox"
        checked={!!todo.completed}
        onChange={() => onToggle(todo.id, !todo.completed)}
        aria-label={`Mark ${todo.text} as ${todo.completed ? 'incomplete' : 'completed'}`}
      />
      {editing ? (
        <input
          className="edit-input"
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') handleSave();
            if (e.key === 'Escape') {
              setEditing(false);
              setDraft(todo.text);
            }
          }}
          autoFocus
        />
      ) : (
        <div className={`text ${todo.completed ? 'completed' : ''}`}>{todo.text}</div>
      )}
      <div className="actions">
        {editing ? (
          <>
            <button className="btn btn-small btn-edit" onClick={handleSave} disabled={pending}>
              Save
            </button>
            <button
              className="btn btn-small"
              onClick={() => {
                setEditing(false);
                setDraft(todo.text);
              }}
              disabled={pending}
            >
              Cancel
            </button>
          </>
        ) : (
          <>
            <button className="btn btn-small btn-edit" onClick={() => setEditing(true)}>
              Edit
            </button>
            <button className="btn btn-small btn-delete" onClick={() => onDelete(todo.id)}>
              Delete
            </button>
          </>
        )}
      </div>
    </div>
  );
}
