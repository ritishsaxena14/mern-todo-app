import React from 'react';

// Generates consistent distinct pastel colors based on category name
const getCategoryStyle = (category = '') => {
  const normalized = category.toLowerCase().trim();

  const presets = {
    work: { bg: '#eff6ff', text: '#1d4ed8', border: '#bfdbfe' },
    personal: { bg: '#fdf4ff', text: '#a21caf', border: '#f5d0fe' },
    shopping: { bg: '#ecfdf5', text: '#047857', border: '#a7f3d0' },
    urgent: { bg: '#fff1f2', text: '#be123c', border: '#fecdd3' },
    finance: { bg: '#fefce8', text: '#a16207', border: '#fef08a' },
    health: { bg: '#f0fdf4', text: '#15803d', border: '#bbf7d0' },
    dev: { bg: '#f5f3ff', text: '#6d28d9', border: '#ddd6fe' },
    study: { bg: '#f0f9ff', text: '#0369a1', border: '#bae6fd' },
    general: { bg: '#f1f5f9', text: '#475569', border: '#cbd5e1' },
  };

  if (presets[normalized]) {
    return presets[normalized];
  }

  // Fallback hash-based color assignment
  const colors = [
    { bg: '#eff6ff', text: '#1d4ed8', border: '#bfdbfe' },
    { bg: '#fdf4ff', text: '#a21caf', border: '#f5d0fe' },
    { bg: '#ecfdf5', text: '#047857', border: '#a7f3d0' },
    { bg: '#fefce8', text: '#a16207', border: '#fef08a' },
    { bg: '#f5f3ff', text: '#6d28d9', border: '#ddd6fe' },
    { bg: '#fff7ed', text: '#c2410c', border: '#fed7aa' },
  ];

  let hash = 0;
  for (let i = 0; i < category.length; i++) {
    hash = category.charCodeAt(i) + ((hash << 5) - hash);
  }
  const index = Math.abs(hash) % colors.length;
  return colors[index];
};

const CategoryBadge = ({ category }) => {
  const displayCategory = category || 'General';
  const style = getCategoryStyle(displayCategory);

  return (
    <span
      className="category-badge"
      style={{
        backgroundColor: style.bg,
        color: style.text,
        borderColor: style.border,
      }}
    >
      #{displayCategory}
    </span>
  );
};

export default CategoryBadge;
