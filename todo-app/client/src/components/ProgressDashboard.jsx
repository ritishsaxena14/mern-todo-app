import React, { useState } from 'react';
import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
} from 'recharts';

const ProgressDashboard = ({ tasks }) => {
  const [chartType, setChartType] = useState('both'); // 'priority' | 'category' | 'both'

  const total = tasks.length;
  const completed = tasks.filter((t) => t.completed).length;
  const pending = total - completed;
  const overdue = tasks.filter(
    (t) => !t.completed && t.dueDate && new Date(t.dueDate).getTime() < Date.now()
  ).length;

  const completionPercentage = total > 0 ? Math.round((completed / total) * 100) : 0;

  // Priority Data for Recharts
  const highPriority = tasks.filter((t) => t.priority === 'high').length;
  const mediumPriority = tasks.filter((t) => t.priority === 'medium').length;
  const lowPriority = tasks.filter((t) => t.priority === 'low').length;

  const priorityPieData = [
    { name: 'High', value: highPriority, color: '#ef4444' },
    { name: 'Medium', value: mediumPriority, color: '#f59e0b' },
    { name: 'Low', value: lowPriority, color: '#10b981' },
  ].filter((item) => item.value > 0);

  // Category Data for Recharts
  const categoryCountMap = {};
  tasks.forEach((t) => {
    const cat = t.category || 'General';
    if (!categoryCountMap[cat]) {
      categoryCountMap[cat] = { total: 0, completed: 0 };
    }
    categoryCountMap[cat].total += 1;
    if (t.completed) categoryCountMap[cat].completed += 1;
  });

  const categoryBarData = Object.keys(categoryCountMap).map((cat) => ({
    category: cat,
    Total: categoryCountMap[cat].total,
    Completed: categoryCountMap[cat].completed,
    Pending: categoryCountMap[cat].total - categoryCountMap[cat].completed,
  }));

  return (
    <div className="progress-dashboard-panel">
      {/* Overview Stat Cards */}
      <div className="progress-metrics-grid">
        <div className="metric-box">
          <div className="metric-icon metric-total-icon">📋</div>
          <div className="metric-details">
            <span className="metric-title">Total Tasks</span>
            <span className="metric-number">{total}</span>
          </div>
        </div>

        <div className="metric-box">
          <div className="metric-icon metric-percent-icon">📈</div>
          <div className="metric-details">
            <span className="metric-title">Completion Rate</span>
            <span className="metric-number">{completionPercentage}%</span>
          </div>
        </div>

        <div className="metric-box">
          <div className="metric-icon metric-pending-icon">⏳</div>
          <div className="metric-details">
            <span className="metric-title">Pending Tasks</span>
            <span className="metric-number text-pending">{pending}</span>
          </div>
        </div>

        <div className="metric-box">
          <div className="metric-icon metric-overdue-icon">⚠️</div>
          <div className="metric-details">
            <span className="metric-title">Overdue</span>
            <span className="metric-number text-overdue">{overdue}</span>
          </div>
        </div>
      </div>

      {/* Modern Visual Progress Bar */}
      <div className="progress-bar-card">
        <div className="progress-bar-header">
          <div className="progress-bar-title-group">
            <span className="progress-bar-title">Overall Task Completion</span>
            <span className="progress-bar-subtitle">
              {completed} of {total} tasks completed
            </span>
          </div>
          <span className="progress-bar-percentage-badge">
            {completionPercentage}%
          </span>
        </div>

        <div className="progress-track">
          <div
            className="progress-fill"
            style={{ width: `${completionPercentage}%` }}
          ></div>
        </div>
      </div>

      {/* Chart Section Header with View Filters */}
      <div className="chart-view-controls">
        <span className="chart-section-title">Visual Analytics</span>
        <div className="chart-toggle-group">
          <button
            type="button"
            className={`chart-toggle-btn ${chartType === 'both' ? 'active' : ''}`}
            onClick={() => setChartType('both')}
          >
            All Charts
          </button>
          <button
            type="button"
            className={`chart-toggle-btn ${chartType === 'priority' ? 'active' : ''}`}
            onClick={() => setChartType('priority')}
          >
            By Priority
          </button>
          <button
            type="button"
            className={`chart-toggle-btn ${chartType === 'category' ? 'active' : ''}`}
            onClick={() => setChartType('category')}
          >
            By Category
          </button>
        </div>
      </div>

      {/* Charts Grid */}
      <div className="progress-charts-grid">
        {/* Priority Chart (Pie Chart) */}
        {(chartType === 'both' || chartType === 'priority') && (
          <div className="analytics-card">
            <h4 className="analytics-card-title">Tasks by Priority</h4>
            {priorityPieData.length === 0 ? (
              <div className="chart-empty-placeholder">No tasks available</div>
            ) : (
              <div style={{ width: '100%', height: 240 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={priorityPieData}
                      cx="50%"
                      cy="50%"
                      innerRadius={55}
                      outerRadius={85}
                      paddingAngle={5}
                      dataKey="value"
                      label={({ name, percent }) =>
                        `${name}: ${(percent * 100).toFixed(0)}%`
                      }
                      labelLine={false}
                    >
                      {priorityPieData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip
                      contentStyle={{
                        backgroundColor: '#0f172a',
                        border: 'none',
                        borderRadius: '8px',
                        color: '#f8fafc',
                        fontSize: '13px',
                      }}
                    />
                    <Legend
                      verticalAlign="bottom"
                      height={36}
                      formatter={(value) => (
                        <span style={{ color: '#475569', fontSize: '13px' }}>
                          {value}
                        </span>
                      )}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            )}
          </div>
        )}

        {/* Category Chart (Stacked Bar Chart) */}
        {(chartType === 'both' || chartType === 'category') && (
          <div className="analytics-card">
            <h4 className="analytics-card-title">Tasks by Category</h4>
            {categoryBarData.length === 0 ? (
              <div className="chart-empty-placeholder">No categories available</div>
            ) : (
              <div style={{ width: '100%', height: 240 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={categoryBarData}
                    margin={{ top: 15, right: 20, left: -20, bottom: 5 }}
                  >
                    <XAxis
                      dataKey="category"
                      tick={{ fill: '#64748b', fontSize: 12 }}
                    />
                    <YAxis
                      allowDecimals={false}
                      tick={{ fill: '#64748b', fontSize: 12 }}
                    />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: '#0f172a',
                        border: 'none',
                        borderRadius: '8px',
                        color: '#f8fafc',
                        fontSize: '13px',
                      }}
                    />
                    <Legend
                      verticalAlign="bottom"
                      height={36}
                      formatter={(value) => (
                        <span style={{ color: '#475569', fontSize: '13px' }}>
                          {value}
                        </span>
                      )}
                    />
                    <Bar dataKey="Completed" fill="#10b981" radius={[4, 4, 0, 0]} />
                    <Bar dataKey="Pending" fill="#6366f1" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default ProgressDashboard;
