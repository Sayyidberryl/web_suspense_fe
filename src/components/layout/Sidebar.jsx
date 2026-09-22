import React from 'react';
import { LayoutDashboard, Upload, History } from 'lucide-react';

export default function Sidebar({ activeTab, onTabChange }) {
  return (
    <aside className="sidebar">
      <div className="sidebar-header">
        <div className="sidebar-brand-row">
          {/* Authentic IndonesiaRe intertwined logo */}
          <svg width="36" height="28" viewBox="0 0 54 36" fill="none" xmlns="http://www.w3.org/2000/svg">
            <ellipse cx="14" cy="18" rx="11" ry="15" stroke="#e11d48" strokeWidth="3.5" fill="none" />
            <ellipse cx="27" cy="18" rx="11" ry="15" stroke="#2563eb" strokeWidth="3.5" fill="none" />
            <ellipse cx="40" cy="18" rx="11" ry="15" stroke="#16a34a" strokeWidth="3.5" fill="none" />
          </svg>
          <div className="brand-title-group">
            <span className="brand-title">Indore ETL RU</span>
            <span className="brand-subtitle">extract, transform and load</span>
          </div>
        </div>
      </div>

      <div className="sidebar-nav">
        <button
          className={`nav-item ${activeTab === 'dashboard' ? 'active' : ''}`}
          onClick={() => onTabChange('dashboard')}
        >
          <LayoutDashboard className="nav-icon" />
          <span>Dashboard</span>
        </button>

        <button
          className={`nav-item ${activeTab === 'upload' ? 'active' : ''}`}
          onClick={() => onTabChange('upload')}
        >
          <Upload className="nav-icon" />
          <span>Upload</span>
        </button>

        <button
          className={`nav-item ${activeTab === 'history' ? 'active' : ''}`}
          onClick={() => onTabChange('history')}
        >
          <History className="nav-icon" />
          <span>History</span>
        </button>
      </div>
    </aside>
  );
}
