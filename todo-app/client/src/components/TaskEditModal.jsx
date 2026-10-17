import React, { useState, useEffect } from 'react';

// Format ISO string to datetime-local input string YYYY-MM-DDTHH:mm
const toLocalDatetimeInput = (isoString) => {
  if (!isoString) return '';
  const date = new Date(isoString);
  if (isNaN(date.getTime())) return '';
  const pad = (n) => String(n).padStart(2, '0');
  const year = date.getFullYear();
  const month = pad(date.getMonth() + 1);
  const day = pad(date.getDate());
  const hours = pad(date.getHours());
  const minutes = pad(date.getMinutes());
  return `${year}-${month}-${day}T${hours}:${minutes}`;
};

const TaskEditModal = ({ task, isOpen, onClose, onSave }) => {
  const [title, setTitle] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [category, setCategory] = useState('');
  const [priority, setPriority] = useState('medium');
  const [completed, setCompleted] = useState(false);
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (task) {
      setTitle(task.title || '');
      setDueDate(toLocalDatetimeInput(task.dueDate));
      setCategory(task.category || 'General');
      setPriority(task.priority || 'medium');
      setCompleted(Boolean(task.completed));
      setError('');
    }
  }, [task]);

  if (!isOpen || !task) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title.trim()) {
      setError('Task title cannot be empty.');
      return;
    }

    setSaving(true);
    const updates = {
      title: title.trim(),
      dueDate: dueDate ? new Date(dueDate).toISOString() : null,
      category: category.trim() || 'General',
      priority,
      completed,
    };

    const success = await onSave(task.id, updates);
    setSaving(false);
    if (success) {
      onClose();
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h3>Edit Task</h3>
          <button className="btn-modal-close" onClick={onClose}>
            &times;
          </button>
        </div>

        <form onSubmit={handleSubmit} className="modal-form">
          {error && <div className="form-error-msg">{error}</div>}

          <div className="modal-field">
            <label>Task Title *</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Task title"
              required
            />
          </div>

          <div className="modal-row">
            <div className="modal-field">
              <label>Due Date & Time</label>
              <input
                type="datetime-local"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
              />
            </div>

            <div className="modal-field">
              <label>Category / Tag</label>
              <input
                type="text"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                placeholder="e.g. Work, Personal"
              />
            </div>
          </div>

          <div className="modal-field">
            <label>Priority</label>
            <div className="priority-button-group">
              <button
                type="button"
                className={`priority-chip chip-high ${priority === 'high' ? 'active' : ''}`}
                onClick={() => setPriority('high')}
              >
                <span className="dot dot-high"></span>
                High
              </button>
              <button
                type="button"
                className={`priority-chip chip-medium ${priority === 'medium' ? 'active' : ''}`}
                onClick={() => setPriority('medium')}
              >
                <span className="dot dot-medium"></span>
                Medium
              </button>
              <button
                type="button"
                className={`priority-chip chip-low ${priority === 'low' ? 'active' : ''}`}
                onClick={() => setPriority('low')}
              >
                <span className="dot dot-low"></span>
                Low
              </button>
            </div>
          </div>

          <div className="modal-field checkbox-field">
            <label className="checkbox-container">
              <input
                type="checkbox"
                checked={completed}
                onChange={(e) => setCompleted(e.target.checked)}
              />
              <span className="checkbox-custom"></span>
              <span className="checkbox-label-text">Mark as Completed</span>
            </label>
          </div>

          <div className="modal-actions">
            <button
              type="button"
              className="btn-secondary"
              onClick={onClose}
              disabled={saving}
            >
              Cancel
            </button>
            <button type="submit" className="btn-primary" disabled={saving}>
              {saving ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default TaskEditModal;
