import React from 'react';
import { Plus, Clock } from 'lucide-react';
import TopControlBar from './TopControlBar';
import FacLensBanner from './FacLensBanner';
import DataTable from './DataTable';
import RecentOutput from './RecentOutput';

export default function DashboardView({
  tableData,
  loading,
  filters,
  onFilterChange,
  onRefresh,
  onNavigateToUpload,
  onNavigateToHistory,
  onSelectDetail
}) {
  return (
    <div>
      {/* Welcome Section (Mockup 5) */}
      <div className="welcome-section">
        <h1 className="welcome-title">Selamat Datang di Portal ETL</h1>
        <p className="welcome-desc">
          Lorem ipsum dolor sit amet consectetur adipiscing elit sed do eiusmod tempor incididunt
        </p>
        <div className="welcome-actions">
          <button className="btn-welcome-upload" onClick={onNavigateToUpload}>
            <Plus size={16} />
            <span>Upload File</span>
          </button>
          <button className="btn-welcome-history" onClick={onNavigateToHistory}>
            <Clock size={16} />
            <span>Lihat History</span>
          </button>
        </div>
      </div>

      {/* Search & Top Controls */}
      <TopControlBar
        globalSearch={filters.globalSearch}
        onGlobalSearchChange={(val) => onFilterChange('globalSearch', val)}
        onRefresh={onRefresh}
      />

      {/* FAC LENS Banner */}
      <FacLensBanner
        filters={filters}
        onFilterChange={onFilterChange}
      />

      {/* Marine Hull Data Table with Pagination */}
      <DataTable
        data={tableData}
        loading={loading}
      />

      {/* Recent Output (Mockup 5) */}
      <RecentOutput
        onNavigateToHistory={onNavigateToHistory}
        onSelectDetail={onSelectDetail}
      />
    </div>
  );
}
