// In-memory data store using plain JavaScript arrays and objects
// Strictly adheres to rule: NO database, all data in server memory

const users = [];
const tasks = [];

// Helper to generate unique IDs in memory
const generateId = () => {
  return `${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
};

module.exports = {
  users,
  tasks,

  // User operations
  findUserByEmail(email) {
    if (!email) return null;
    return users.find((u) => u.email.toLowerCase() === email.trim().toLowerCase()) || null;
  },

  findUserById(id) {
    return users.find((u) => u.id === id) || null;
  },

  createUser({ email, password, name }) {
    const newUser = {
      id: generateId(),
      email: email.trim().toLowerCase(),
      password,
      name: name ? name.trim() : email.split('@')[0],
      createdAt: new Date().toISOString(),
    };
    users.push(newUser);
    return { id: newUser.id, email: newUser.email, name: newUser.name, createdAt: newUser.createdAt };
  },

  // Task operations scoped to a user
  getTasksByUserId(userId) {
    return tasks
      .filter((t) => t.userId === userId)
      .sort((a, b) => a.order - b.order);
  },

  getTaskById(taskId, userId) {
    return tasks.find((t) => t.id === taskId && t.userId === userId) || null;
  },

  createTask(userId, { title, completed = false, dueDate = null, category = 'General', priority = 'medium' }) {
    // Determine the next order index for this user's tasks
    const userTasks = tasks.filter((t) => t.userId === userId);
    const maxOrder = userTasks.length > 0 ? Math.max(...userTasks.map((t) => t.order)) : -1;

    const newTask = {
      id: generateId(),
      userId,
      title: title.trim(),
      completed: Boolean(completed),
      dueDate: dueDate ? new Date(dueDate).toISOString() : null,
      category: category ? category.trim() : 'General',
      priority: ['high', 'medium', 'low'].includes(priority?.toLowerCase()) ? priority.toLowerCase() : 'medium',
      order: maxOrder + 1,
      createdAt: new Date().toISOString(),
    };

    tasks.push(newTask);
    return newTask;
  },

  updateTask(taskId, userId, updates) {
    const taskIndex = tasks.findIndex((t) => t.id === taskId && t.userId === userId);
    if (taskIndex === -1) return null;

    const existing = tasks[taskIndex];

    const updatedTask = {
      ...existing,
      ...(updates.title !== undefined && { title: updates.title.trim() }),
      ...(updates.completed !== undefined && { completed: Boolean(updates.completed) }),
      ...(updates.dueDate !== undefined && {
        dueDate: updates.dueDate ? new Date(updates.dueDate).toISOString() : null,
      }),
      ...(updates.category !== undefined && { category: updates.category.trim() }),
      ...(updates.priority !== undefined && ['high', 'medium', 'low'].includes(updates.priority?.toLowerCase()) && {
        priority: updates.priority.toLowerCase(),
      }),
      ...(updates.order !== undefined && typeof updates.order === 'number' && {
        order: updates.order,
      }),
    };

    tasks[taskIndex] = updatedTask;
    return updatedTask;
  },

  deleteTask(taskId, userId) {
    const taskIndex = tasks.findIndex((t) => t.id === taskId && t.userId === userId);
    if (taskIndex === -1) return false;
    tasks.splice(taskIndex, 1);
    return true;
  },

  reorderTasks(userId, taskIds) {
    // taskIds is an ordered array of task IDs
    if (!Array.isArray(taskIds)) return [];

    taskIds.forEach((id, index) => {
      const task = tasks.find((t) => t.id === id && t.userId === userId);
      if (task) {
        task.order = index;
      }
    });

    return this.getTasksByUserId(userId);
  },
};
