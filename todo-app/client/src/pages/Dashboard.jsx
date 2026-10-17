import React, { useState, useEffect, useMemo } from 'react';
import { DragDropContext, Droppable } from '@hello-pangea/dnd';
import Navbar from '../components/Navbar';
import TaskForm from '../components/TaskForm';
import TaskItem from '../components/TaskItem';
import TaskEditModal from '../components/TaskEditModal';
import ProgressDashboard from '../components/ProgressDashboard';
import { ToastContainer } from '../components/Toast';
import { useTaskReminder } from '../hooks/useTaskReminder';
import api from '../api/axiosInstance';

const Dashboard = () => {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [addingTask, setAddingTask] = useState(false);
  const [error, setError] = useState('');
  const [reorderSuccessMsg, setReorderSuccessMsg] = useState('');
  const [editingTask, setEditingTask] = useState(null);

  // View state: 'board' (tasks list) or 'progress' (full progress dashboard)
  const [activeView, setActiveView] = useState('board');

  // Filters & Live Search
  const [searchTitle, setSearchTitle] = useState(''); // Live search by title text
  const [statusFilter, setStatusFilter] = useState('all'); // all | active | completed
  const [categoryFilter, setCategoryFilter] = useState('all'); // all | categoryName
  const [priorityFilter, setPriorityFilter] = useState('all'); // all | high | medium | low

  // Task Due Reminder Hook: checks every 30s, browser notifications + in-app toast fallback
  const { toasts, dismissToast } = useTaskReminder(tasks);

  // Fetch tasks for current authenticated user
  const fetchTasks = async () => {
    try {
      setLoading(true);
      setError('');
      const response = await api.get('/tasks');
      setTasks(response.data.tasks || []);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load tasks.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTasks();
  }, []);

  // Compute unique categories from existing tasks
  const uniqueCategories = useMemo(() => {
    const cats = new Set(tasks.map((t) => t.category).filter(Boolean));
    return ['all', ...Array.from(cats)];
  }, [tasks]);

  // Add Task
  const handleAddTask = async (taskData) => {
    try {
      setAddingTask(true);
      const response = await api.post('/tasks', taskData);
      setTasks((prev) => [...prev, response.data.task]);
      return true;
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to add task.');
      return false;
    } finally {
      setAddingTask(false);
    }
  };

  // Toggle Complete / Pending
  const handleToggleComplete = async (task) => {
    const updatedStatus = !task.completed;

    // Optimistic UI update
    setTasks((prev) =>
      prev.map((t) => (t.id === task.id ? { ...t, completed: updatedStatus } : t))
    );

    try {
      await api.put(`/tasks/${task.id}`, {
        completed: updatedStatus,
      });
    } catch (err) {
      // Revert if error
      setTasks((prev) =>
        prev.map((t) => (t.id === task.id ? { ...t, completed: !updatedStatus } : t))
      );
      setError('Failed to update task status.');
    }
  };

  // Save edited task
  const handleSaveEdit = async (taskId, updates) => {
    try {
      const response = await api.put(`/tasks/${taskId}`, updates);
      setTasks((prev) =>
        prev.map((t) => (t.id === taskId ? response.data.task : t))
      );
      return true;
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to save task updates.');
      return false;
    }
  };

  // Delete task
  const handleDeleteTask = async (taskId) => {
    if (!window.confirm('Are you sure you want to delete this task?')) return;

    // Optimistic delete
    const previousTasks = [...tasks];
    setTasks((prev) => prev.filter((t) => t.id !== taskId));

    try {
      await api.delete(`/tasks/${taskId}`);
    } catch (err) {
      setTasks(previousTasks);
      setError('Failed to delete task.');
    }
  };

  // Filter tasks based on Live Search (title text), Status, Category, and Priority
  const filteredTasks = useMemo(() => {
    return tasks.filter((task) => {
      // 1. Live search filter strictly by title text
      if (searchTitle.trim()) {
        const titleMatch = task.title
          .toLowerCase()
          .includes(searchTitle.trim().toLowerCase());
        if (!titleMatch) return false;
      }

      // 2. Status filter: All, Active, Completed
      if (statusFilter === 'active' && task.completed) return false;
      if (statusFilter === 'completed' && !task.completed) return false;

      // 3. Category filter
      if (categoryFilter !== 'all' && task.category.toLowerCase() !== categoryFilter.toLowerCase()) {
        return false;
      }

      // 4. Priority filter
      if (priorityFilter !== 'all' && task.priority !== priorityFilter) {
        return false;
      }

      return true;
    });
  }, [tasks, searchTitle, statusFilter, categoryFilter, priorityFilter]);

  // Drag and Drop reordering using @hello-pangea/dnd and saving order via PUT /api/tasks/reorder
  const handleDragEnd = async (result) => {
    if (!result.destination) return;
    const { source, destination } = result;
    if (source.index === destination.index) return;

    const sourceTask = filteredTasks[source.index];
    const destinationTask = filteredTasks[destination.index];
    if (!sourceTask || !destinationTask) return;

    let newTasksList = [...tasks];

    // Find indices in full list
    const sourceFullIndex = newTasksList.findIndex((t) => t.id === sourceTask.id);
    const destFullIndex = newTasksList.findIndex((t) => t.id === destinationTask.id);

    if (sourceFullIndex === -1 || destFullIndex === -1) return;

    // Move task in array
    const [movedTask] = newTasksList.splice(sourceFullIndex, 1);
    newTasksList.splice(destFullIndex, 0, movedTask);

    // Update order numbers sequentially
    const updatedTasks = newTasksList.map((task, idx) => ({
      ...task,
      order: idx,
    }));

    // Update local state immediately for snappy feel
    setTasks(updatedTasks);
    setReorderSuccessMsg('Order updated');
    setTimeout(() => setReorderSuccessMsg(''), 2500);

    // Save new order to backend API: PUT /api/tasks/reorder
    try {
      const taskIds = updatedTasks.map((t) => t.id);
      await api.put('/tasks/reorder', { taskIds });
    } catch (err) {
      console.error('Failed to save reordered tasks:', err);
      setError('Failed to persist reordered tasks on server.');
    }
  };

  return (
    <div className="dashboard-layout">
      <Navbar />

      {/* In-app Toast Container for Reminders & Alerts */}
      <ToastContainer toasts={toasts} onDismiss={dismissToast} />

      <main className="dashboard-main">
        <div className="dashboard-container">
          {/* Main View Mode Selector */}
          <div className="view-mode-bar">
            <button
              type="button"
              className={`view-mode-btn ${activeView === 'board' ? 'active' : ''}`}
              onClick={() => setActiveView('board')}
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
                <line x1="9" y1="3" x2="9" y2="21" />
              </svg>
              <span>Task Board</span>
            </button>
            <button
              type="button"
              className={`view-mode-btn ${activeView === 'progress' ? 'active' : ''}`}
              onClick={() => setActiveView('progress')}
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <line x1="18" y1="20" x2="18" y2="10" />
                <line x1="12" y1="20" x2="12" y2="4" />
                <line x1="6" y1="20" x2="6" y2="14" />
              </svg>
              <span>Progress Dashboard</span>
            </button>
          </div>

          {/* Conditional View: Progress Dashboard Section vs Task Board */}
          {activeView === 'progress' ? (
            <ProgressDashboard tasks={tasks} />
          ) : (
            <>
              {/* Progress Summary Section on Main Board */}
              <ProgressDashboard tasks={tasks} />

              {/* Add Task Form */}
              <TaskForm onAddTask={handleAddTask} loading={addingTask} />

              {/* Error / Notification Banners */}
              {error && (
                <div className="dashboard-error-banner">
                  <span>{error}</span>
                  <button onClick={() => setError('')}>&times;</button>
                </div>
              )}

              {reorderSuccessMsg && (
                <div className="dashboard-success-banner">
                  <span>✓ {reorderSuccessMsg}</span>
                </div>
              )}

              {/* Controls Bar: Live Search & Filters */}
              <div className="controls-card">
                {/* Live Search Bar for Task Titles */}
                <div className="search-bar-row">
                  <div className="search-bar-container">
                    <svg
                      className="search-icon"
                      width="18"
                      height="18"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                    >
                      <circle cx="11" cy="11" r="8" />
                      <line x1="21" y1="21" x2="16.65" y2="16.65" />
                    </svg>
                    <input
                      type="text"
                      placeholder="Live search tasks by title..."
                      value={searchTitle}
                      onChange={(e) => setSearchTitle(e.target.value)}
                      className="search-input-field"
                    />
                    {searchTitle && (
                      <button
                        type="button"
                        className="btn-clear-search"
                        onClick={() => setSearchTitle('')}
                        title="Clear search"
                      >
                        &times;
                      </button>
                    )}
                  </div>

                  {/* Priority Dropdown */}
                  <div className="priority-filter-box">
                    <select
                      value={priorityFilter}
                      onChange={(e) => setPriorityFilter(e.target.value)}
                      className="select-filter"
                    >
                      <option value="all">All Priorities</option>
                      <option value="high">High Priority</option>
                      <option value="medium">Medium Priority</option>
                      <option value="low">Low Priority</option>
                    </select>
                  </div>
                </div>

                {/* Filter Buttons: All, Active, Completed */}
                <div className="filter-buttons-row">
                  <div className="status-buttons-group">
                    <button
                      type="button"
                      className={`btn-filter ${statusFilter === 'all' ? 'active' : ''}`}
                      onClick={() => setStatusFilter('all')}
                    >
                      All
                      <span className="count-pill">{tasks.length}</span>
                    </button>
                    <button
                      type="button"
                      className={`btn-filter ${statusFilter === 'active' ? 'active' : ''}`}
                      onClick={() => setStatusFilter('active')}
                    >
                      Active
                      <span className="count-pill">
                        {tasks.filter((t) => !t.completed).length}
                      </span>
                    </button>
                    <button
                      type="button"
                      className={`btn-filter ${statusFilter === 'completed' ? 'active' : ''}`}
                      onClick={() => setStatusFilter('completed')}
                    >
                      Completed
                      <span className="count-pill">
                        {tasks.filter((t) => t.completed).length}
                      </span>
                    </button>
                  </div>

                  {/* Optional Category Filter Buttons / Pills */}
                  {uniqueCategories.length > 1 && (
                    <div className="category-filters-group">
                      <span className="category-filter-label">Category:</span>
                      <div className="category-pills-list">
                        {uniqueCategories.map((cat) => (
                          <button
                            key={cat}
                            type="button"
                            className={`category-filter-pill ${
                              categoryFilter.toLowerCase() === cat.toLowerCase()
                                ? 'active'
                                : ''
                            }`}
                            onClick={() => setCategoryFilter(cat)}
                          >
                            {cat === 'all' ? 'All Categories' : `#${cat}`}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Task List Section with Drag-and-Drop */}
              <div className="tasks-list-card">
                {loading ? (
                  <div className="tasks-loading">
                    <div className="spinner"></div>
                    <p>Loading your tasks...</p>
                  </div>
                ) : filteredTasks.length === 0 ? (
                  <div className="tasks-empty-state">
                    <div className="empty-icon">✓</div>
                    <h3>No tasks found</h3>
                    <p>
                      {searchTitle || statusFilter !== 'all' || categoryFilter !== 'all' || priorityFilter !== 'all'
                        ? 'No tasks match your search or filter criteria.'
                        : 'Your task list is empty. Add a new task above to get started!'}
                    </p>
                    {(searchTitle || statusFilter !== 'all' || categoryFilter !== 'all' || priorityFilter !== 'all') && (
                      <button
                        className="btn-reset-filters"
                        onClick={() => {
                          setSearchTitle('');
                          setStatusFilter('all');
                          setCategoryFilter('all');
                          setPriorityFilter('all');
                        }}
                      >
                        Reset all filters
                      </button>
                    )}
                  </div>
                ) : (
                  <DragDropContext onDragEnd={handleDragEnd}>
                    <Droppable droppableId="tasks-droppable-list">
                      {(provided, snapshot) => (
                        <ul
                          className={`tasks-ul ${snapshot.isDraggingOver ? 'dragging-over' : ''}`}
                          {...provided.droppableProps}
                          ref={provided.innerRef}
                        >
                          {filteredTasks.map((task, index) => (
                            <TaskItem
                              key={task.id}
                              task={task}
                              index={index}
                              onToggleComplete={handleToggleComplete}
                              onEdit={(t) => setEditingTask(t)}
                              onDelete={handleDeleteTask}
                            />
                          ))}
                          {provided.placeholder}
                        </ul>
                      )}
                    </Droppable>
                  </DragDropContext>
                )}
              </div>
            </>
          )}
        </div>
      </main>

      {/* Task Edit Modal */}
      <TaskEditModal
        task={editingTask}
        isOpen={Boolean(editingTask)}
        onClose={() => setEditingTask(null)}
        onSave={handleSaveEdit}
      />
    </div>
  );
};

export default Dashboard;
