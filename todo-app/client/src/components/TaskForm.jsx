import React, { useState } from 'react';

const TaskForm = ({ onAddTask, loading }) => {
  const [title, setTitle] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [category, setCategory] = useState('');
  const [priority, setPriority] = useState('medium');
  const [error, setError] = useState('');
  const [isExpanded, setIsExpanded] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title.trim()) {
      setError('Task title is required');
      return;
    }

    setError('');
    const success = await onAddTask({
      title: title.trim(),
      dueDate: dueDate ? new Date(dueDate).toISOString() : null,
      category: category.trim() || 'General',
      priority,
    });

    if (success) {
      setTitle('');
      setDueDate('');
      setCategory('');
      setPriority('medium');
      setIsExpanded(false);
    }
  };

  return (
    <div className="task-form-card">
      <form onSubmit={handleSubmit} className="task-form">
        <div className="form-primary-row">
          <input
            type="text"
            className="input-title"
            placeholder="What needs to be done?..."
            value={title}
            onChange={(e) => {
              setTitle(e.target.value);
              if (error) setError('');
            }}
            onFocus={() => setIsExpanded(true)}
          />
          <button
            type="submit"
            className="btn-primary"
            disabled={loading || !title.trim()}
          >
            {loading ? 'Adding...' : 'Add Task'}
          </button>
        </div>

        {error && <div className="form-error-msg">{error}</div>}

        {isExpanded && (
          <div className="form-expanded-controls">
            {/* Due Date & Time Picker */}
            <div className="form-field">
              <label>Due Date & Time</label>
              <input
                type="datetime-local"
                className="input-datetime"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
              />
            </div>

            {/* Category */}
            <div className="form-field">
              <label>Category / Tag</label>
              <input
                type="text"
                className="input-category"
                placeholder="e.g. Work, Personal, Dev"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                list="category-suggestions"
              />
              <datalist id="category-suggestions">
                <option value="Work" />
                <option value="Personal" />
                <option value="Dev" />
                <option value="Urgent" />
                <option value="Shopping" />
                <option value="Health" />
              </datalist>
            </div>

            {/* Priority Selector */}
            <div className="form-field">
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
          </div>
        )}
      </form>
    </div>
  );
};

export default TaskForm;
