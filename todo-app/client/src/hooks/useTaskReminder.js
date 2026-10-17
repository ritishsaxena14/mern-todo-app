import { useEffect, useRef, useState } from 'react';

/**
 * Custom hook to monitor task due dates:
 * - Requests browser Notification permission after login
 * - Checks every 30 seconds
 * - Sends browser notification when due time arrives (once per task)
 * - Emits in-app toast notification fallback if permission is denied/unsupported
 * - Strictly stores notified task IDs in memory (Set), zero browser storage used
 */
export const useTaskReminder = (tasks) => {
  const [toasts, setToasts] = useState([]);
  // In-memory set to ensure each task is notified at most once per session
  const notifiedTasksRef = useRef(new Set());

  // 1. Request notification permission after login / mount
  useEffect(() => {
    if (typeof window !== 'undefined' && 'Notification' in window) {
      if (Notification.permission === 'default') {
        Notification.requestPermission().catch((err) => {
          console.warn('Notification permission request error:', err);
        });
      }
    }
  }, []);

  // Helper to trigger in-app toast fallback
  const addToast = (toastData) => {
    const id = `${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
    const newToast = { id, ...toastData };
    setToasts((prev) => [...prev, newToast]);

    // Auto-dismiss toast after 6 seconds
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 6000);
  };

  const dismissToast = (id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  // 2. Check every 30 seconds for due tasks
  useEffect(() => {
    const checkDueTasks = () => {
      if (!tasks || tasks.length === 0) return;

      const now = Date.now();

      tasks.forEach((task) => {
        // Skip completed tasks or tasks without a due date
        if (task.completed || !task.dueDate) return;

        const dueTimestamp = new Date(task.dueDate).getTime();
        if (isNaN(dueTimestamp)) return;

        // Check if due time has arrived and not yet notified in this session
        if (dueTimestamp <= now && !notifiedTasksRef.current.has(task.id)) {
          // Record in-memory so we notify only once per task
          notifiedTasksRef.current.add(task.id);

          const title = `Task Due: ${task.title}`;
          const body = `Category: ${task.category || 'General'} | Priority: ${(task.priority || 'medium').toUpperCase()}`;

          // If browser notification is granted, trigger it
          if (
            typeof window !== 'undefined' &&
            'Notification' in window &&
            Notification.permission === 'granted'
          ) {
            try {
              new Notification(title, {
                body,
                tag: `task-${task.id}`,
              });
            } catch (err) {
              console.warn('Browser notification failed, falling back to toast:', err);
              // Fallback to in-app toast if Notification constructor errors
              addToast({
                title: 'Task Due Reminder',
                message: `"${task.title}" is due now! (${task.category || 'General'})`,
                priority: task.priority || 'medium',
              });
            }
          } else {
            // Permission denied or unsupported: use in-app toast fallback
            addToast({
              title: 'Task Due Reminder',
              message: `"${task.title}" is due now! (${task.category || 'General'})`,
              priority: task.priority || 'medium',
            });
          }
        }
      });
    };

    // Run check immediately on mount / task updates
    checkDueTasks();

    // Set up 30-second interval
    const intervalId = setInterval(checkDueTasks, 30000);

    return () => clearInterval(intervalId);
  }, [tasks]);

  return {
    toasts,
    dismissToast,
  };
};
