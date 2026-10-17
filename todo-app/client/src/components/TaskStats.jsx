import React from 'react';
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
} from 'recharts';

const TaskStats = ({ tasks }) => {
  const total = tasks.length;
  const completed = tasks.filter((t) => t.completed).length;
  const pending = total - completed;
  const overdue = tasks.filter(
    (t) => !t.completed && t.dueDate && new Date(t.dueDate).getTime() < Date.now()
  ).length;

  const highPriority = tasks.filter((t) => t.priority === 'high').length;
  const mediumPriority = tasks.filter((t) => t.priority === 'medium').length;
  const lowPriority = tasks.filter((t) => t.priority === 'low').length;

  const completionData = [
    { name: 'Completed', value: completed, color: '#10b981' },
    { name: 'Pending', value: pending, color: '#6366f1' },
  ];

  const priorityData = [
    { name: 'High', count: highPriority, fill: '#ef4444' },
    { name: 'Med', count: mediumPriority, fill: '#f59e0b' },
    { name: 'Low', count: lowPriority, fill: '#10b981' },
  ];

  const completionRate = total > 0 ? Math.round((completed / total) * 100) : 0;

  return (
    <div className="stats-container">
      {/* Metric Cards */}
      <div className="stat-cards-grid">
        <div className="stat-card">
          <div className="stat-card-label">Total Tasks</div>
          <div className="stat-card-value">{total}</div>
        </div>
        <div className="stat-card">
          <div className="stat-card-label">Completed</div>
          <div className="stat-card-value stat-completed">{completed}</div>
        </div>
        <div className="stat-card">
          <div className="stat-card-label">Pending</div>
          <div className="stat-card-value stat-pending">{pending}</div>
        </div>
        <div className="stat-card">
          <div className="stat-card-label">Overdue</div>
          <div className="stat-card-value stat-overdue">{overdue}</div>
        </div>
        <div className="stat-card">
          <div className="stat-card-label">Progress</div>
          <div className="stat-card-value">{completionRate}%</div>
        </div>
      </div>

      {/* Mini Charts Row (displayed when tasks exist) */}
      {total > 0 && (
        <div className="charts-grid">
          <div className="chart-box">
            <span className="chart-title">Status Breakdown</span>
            <div style={{ width: '100%', height: 110 }}>
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={completionData}
                    cx="50%"
                    cy="50%"
                    innerRadius={28}
                    outerRadius={45}
                    paddingAngle={4}
                    dataKey="value"
                  >
                    {completionData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#1e293b',
                      borderRadius: '8px',
                      color: '#f8fafc',
                      fontSize: '12px',
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="chart-legend">
              <span className="legend-item">
                <span className="dot dot-completed"></span> Done ({completed})
              </span>
              <span className="legend-item">
                <span className="dot dot-pending"></span> Pending ({pending})
              </span>
            </div>
          </div>

          <div className="chart-box">
            <span className="chart-title">Tasks by Priority</span>
            <div style={{ width: '100%', height: 110 }}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={priorityData} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
                  <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                  <YAxis allowDecimals={false} tick={{ fontSize: 10 }} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#1e293b',
                      borderRadius: '8px',
                      color: '#f8fafc',
                      fontSize: '12px',
                    }}
                  />
                  <Bar dataKey="count" radius={[4, 4, 0, 0]}>
                    {priorityData.map((entry, index) => (
                      <Cell key={`bar-${index}`} fill={entry.fill} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
            <div className="chart-legend">
              <span className="legend-item">
                <span className="dot dot-high"></span> High ({highPriority})
              </span>
              <span className="legend-item">
                <span className="dot dot-medium"></span> Med ({mediumPriority})
              </span>
              <span className="legend-item">
                <span className="dot dot-low"></span> Low ({lowPriority})
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TaskStats;
