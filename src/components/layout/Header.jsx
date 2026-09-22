import React from 'react';

export default function Header({ title = 'Dashboard', subtitle = '' }) {
  return (
    <header className="top-header">
      <div className="header-left">
        {subtitle ? (
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{ fontWeight: 700, color: '#111827' }}>{title}</span>
            <span style={{ color: '#9ca3af' }}>/</span>
            <span style={{ fontSize: '0.85rem', color: '#6b7280', fontWeight: 400 }}>{subtitle}</span>
          </div>
        ) : (
          <span>{title}</span>
        )}
      </div>

      <div className="header-right">
        <div className="user-profile-circle">
          ETL
        </div>
      </div>
    </header>
  );
}
