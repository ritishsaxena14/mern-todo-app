import React from 'react';
import { Draggable } from '@hello-pangea/dnd';
import CategoryBadge from './CategoryBadge';

const formatDueDate = (isoString) => {
  if (!isoString) return null;
  const date = new Date(isoString);
  if (isNaN(date.getTime())) return null;

  return date.toLocaleString(undefined, {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  });
};

const isOverdue = (isoString, completed) => {
  if (!isoString || completed) return false;
  return new Date(isoString).getTime() < Date.now();
};

const TaskItem = ({ task, index, onToggleComplete, onEdit, onDelete }) => {
  const overdue = isOverdue(task.dueDate, task.completed);
  const formattedDate = formatDueDate(task.dueDate);

  // Priority color flags
  const priorityConfig = {
    high: { label: 'High', colorClass: 'priority-high' },
    medium: { label: 'Med', colorClass: 'priority-medium' },
    low: { label: 'Low', colorClass: 'priority-low' },
  };

  const priorityInfo = priorityConfig[task.priority] || priorityConfig.medium;

  return (
    <Draggable draggableId={String(task.id)} index={index}>
      {(provided, snapshot) => (
        <li
          ref={provided.innerRef}
          {...provided.draggableProps}
          className={`task-item ${task.completed ? 'completed' : ''} ${
            snapshot.isDragging ? 'is-dragging' : ''
          }`}
        >
          {/* Drag Handle */}
          <div
            {...provided.dragHandleProps}
            className="drag-handle"
            title="Drag to reorder"
          >
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <circle cx="9" cy="6" r="1.5" />
              <circle cx="15" cy="6" r="1.5" />
              <circle cx="9" cy="12" r="1.5" />
              <circle cx="15" cy="12" r="1.5" />
              <circle cx="9" cy="18" r="1.5" />
              <circle cx="15" cy="18" r="1.5" />
            </svg>
          </div>

          {/* Checkbox */}
          <label className="task-checkbox-container">
            <input
              type="checkbox"
              checked={Boolean(task.completed)}
              onChange={() => onToggleComplete(task)}
            />
            <span className="task-checkbox-custom"></span>
          </label>

          {/* Task Info & Title */}
          <div className="task-content">
            <span className={`task-title ${task.completed ? 'strikethrough' : ''}`}>
              {task.title}
            </span>

            <div className="task-meta-row">
              {/* Category Badge */}
              <CategoryBadge category={task.category} />

              {/* Priority Flag */}
              <span className={`priority-flag ${priorityInfo.colorClass}`}>
                <span className="priority-flag-icon">⚑</span>
                {priorityInfo.label}
              </span>

              {/* Due Date Indicator */}
              {formattedDate && (
                <span className={`task-duedate ${overdue ? 'overdue' : ''}`}>
                  <svg
                    width="13"
                    height="13"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                  >
                    <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                    <line x1="16" y1="2" x2="16" y2="6" />
                    <line x1="8" y1="2" x2="8" y2="6" />
                    <line x1="3" y1="10" x2="21" y2="10" />
                  </svg>
                  {overdue ? `Overdue: ${formattedDate}` : formattedDate}
                </span>
              )}
            </div>
          </div>

          {/* Action buttons */}
          <div className="task-actions">
            <button
              onClick={() => onEdit(task)}
              className="btn-icon btn-edit"
              title="Edit task"
            >
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
              </svg>
            </button>
            <button
              onClick={() => onDelete(task.id)}
              className="btn-icon btn-delete"
              title="Delete task"
            >
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <polyline points="3 6 5 6 21 6" />
                <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
              </svg>
            </button>
          </div>
        </li>
      )}
    </Draggable>
  );
};

export default TaskItem;
