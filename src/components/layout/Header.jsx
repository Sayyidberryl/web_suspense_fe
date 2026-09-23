import React from 'react';

/**
 * Top Header — shows current page title and IndonesiaRe logo.
 * The "ETL" avatar circle has been removed per design update.
 */
export default function Header({ title = '', subtitle = '' }) {
  // Dashboard tab has no visible header title — clean viewport
  if (!title || title === 'Dashboard') return null;

  return (
    <header className="top-header">
      <div className="header-left">
        {subtitle ? (
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{ fontWeight: 700, color: '#111827' }}>{title}</span>
            <span style={{ color: '#9ca3af' }}>/</span>
            <span style={{ fontSize: '0.85rem', color: '#6b7280', fontWeight: 400 }}>
              {subtitle}
            </span>
          </div>
        ) : (
          <span>{title}</span>
        )}
      </div>
    </header>
  );
}
