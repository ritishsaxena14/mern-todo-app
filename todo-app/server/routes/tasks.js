const express = require('express');
const authMiddleware = require('../middleware/auth');
const store = require('../store');

const router = express.Router();

// Apply auth middleware to all task routes
router.use(authMiddleware);

// GET /api/tasks - Retrieve all tasks for the authenticated user
router.get('/', (req, res) => {
  const userId = req.user.userId;
  const userTasks = store.getTasksByUserId(userId);
  return res.status(200).json({
    tasks: userTasks,
    count: userTasks.length,
  });
});

// POST /api/tasks - Create a new task
router.post('/', (req, res) => {
  const userId = req.user.userId;
  const { title, completed, dueDate, category, priority } = req.body;

  // Title validation
  if (!title || typeof title !== 'string' || title.trim().length === 0) {
    return res.status(400).json({
      error: 'Validation Error',
      message: 'Task title is required and cannot be empty.',
    });
  }

  // Priority validation
  const validPriorities = ['high', 'medium', 'low'];
  if (priority && !validPriorities.includes(priority.toLowerCase())) {
    return res.status(400).json({
      error: 'Validation Error',
      message: `Priority must be one of: ${validPriorities.join(', ')}.`,
    });
  }

  // Due date validation (if provided)
  if (dueDate && isNaN(Date.parse(dueDate))) {
    return res.status(400).json({
      error: 'Validation Error',
      message: 'dueDate must be a valid ISO date string.',
    });
  }

  const newTask = store.createTask(userId, {
    title,
    completed: completed !== undefined ? completed : false,
    dueDate,
    category: category || 'General',
    priority: priority ? priority.toLowerCase() : 'medium',
  });

  return res.status(201).json({
    message: 'Task created successfully',
    task: newTask,
  });
});

// PUT /api/tasks/reorder - Save new order after drag-and-drop
// Placed BEFORE /:id to prevent Express from treating "reorder" as an ID
router.put('/reorder', (req, res) => {
  const userId = req.user.userId;
  const { taskIds } = req.body;

  if (!taskIds || !Array.isArray(taskIds)) {
    return res.status(400).json({
      error: 'Validation Error',
      message: 'taskIds must be an array of task ID strings in the intended order.',
    });
  }

  const reorderedTasks = store.reorderTasks(userId, taskIds);

  return res.status(200).json({
    message: 'Task order updated successfully',
    tasks: reorderedTasks,
  });
});

// PUT /api/tasks/:id - Update an existing task
router.put('/:id', (req, res) => {
  const userId = req.user.userId;
  const taskId = req.params.id;
  const { title, completed, dueDate, category, priority, order } = req.body;

  const existingTask = store.getTaskById(taskId, userId);
  if (!existingTask) {
    return res.status(404).json({
      error: 'Not Found',
      message: 'Task not found or does not belong to your account.',
    });
  }

  // Validate updates if provided
  if (title !== undefined && (typeof title !== 'string' || title.trim().length === 0)) {
    return res.status(400).json({
      error: 'Validation Error',
      message: 'Title cannot be empty.',
    });
  }

  const validPriorities = ['high', 'medium', 'low'];
  if (priority !== undefined && !validPriorities.includes(priority.toLowerCase())) {
    return res.status(400).json({
      error: 'Validation Error',
      message: `Priority must be one of: ${validPriorities.join(', ')}.`,
    });
  }

  if (dueDate !== undefined && dueDate !== null && isNaN(Date.parse(dueDate))) {
    return res.status(400).json({
      error: 'Validation Error',
      message: 'dueDate must be a valid ISO date string or null.',
    });
  }

  if (order !== undefined && typeof order !== 'number') {
    return res.status(400).json({
      error: 'Validation Error',
      message: 'order must be a number.',
    });
  }

  const updatedTask = store.updateTask(taskId, userId, {
    title,
    completed,
    dueDate,
    category,
    priority,
    order,
  });

  return res.status(200).json({
    message: 'Task updated successfully',
    task: updatedTask,
  });
});

// DELETE /api/tasks/:id - Delete a task
router.delete('/:id', (req, res) => {
  const userId = req.user.userId;
  const taskId = req.params.id;

  const existingTask = store.getTaskById(taskId, userId);
  if (!existingTask) {
    return res.status(404).json({
      error: 'Not Found',
      message: 'Task not found or does not belong to your account.',
    });
  }

  const deleted = store.deleteTask(taskId, userId);
  if (!deleted) {
    return res.status(500).json({
      error: 'Internal Server Error',
      message: 'Failed to delete task.',
    });
  }

  return res.status(200).json({
    message: 'Task deleted successfully',
    id: taskId,
  });
});

module.exports = router;
