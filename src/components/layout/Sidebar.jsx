import React from 'react';
import { LayoutDashboard, Upload, History } from 'lucide-react';
import indoreLogo from '../../assets/indore_logo.webp';

export default function Sidebar({ activeTab, onTabChange }) {
  return (
    <aside className="sidebar">
      <div className="sidebar-header">
        <div className="sidebar-brand-row">
          <img
            src={indoreLogo}
            alt="IndonesiaRe Logo"
            className="brand-logo-img"
          />
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
