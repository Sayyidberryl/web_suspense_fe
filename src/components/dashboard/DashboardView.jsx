import React from 'react';
import { Plus, Clock } from 'lucide-react';
import TopControlBar from './TopControlBar';
import FacLensBanner from './FacLensBanner';
import TabNavigation from './TabNavigation';
import DataTable from './DataTable';
import RecentOutput from './RecentOutput';

export default function DashboardView({
  tableData,
  loading,
  filters,
  onFilterChange,
  onClearFilters,
  onRemoveFilter,
  selectedTableTab = 'loss_pla',
  onSelectTableTab,
  pagination,
  onPageChange,
  onLimitChange,
  fileList = [],
  selectedFile = null,
  onFileSelect,
  onRefresh,
  onExport,
  onNavigateToUpload,
  onNavigateToHistory,
  onSelectDetail
}) {
  return (
    <div>
      {/* Welcome Section */}
      <div className="welcome-section">
        <h1 className="welcome-title">Portal ETL & Analitik Facultative</h1>
        <p className="welcome-desc">
          Sistem analitik berbasis database PostgreSQL Supabase untuk data Marine Hull & Facultative IndonesiaRe.
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

      {/* Search & Top Controls with Dropdown File Selector */}
      <TopControlBar
        globalSearch={filters.globalSearch || ''}
        onGlobalSearchChange={(val) => onFilterChange('globalSearch', val)}
        fileList={fileList}
        selectedFile={selectedFile}
        onFileSelect={onFileSelect}
        onRefresh={onRefresh}
        onExport={onExport}
      />

      {/* FAC LENS Filter Banner with Customizable Column Filters */}
      <FacLensBanner
        filters={filters}
        onFilterChange={onFilterChange}
        activeTab={selectedTableTab}
        selectedFile={selectedFile}
        onClearSelectedFile={() => onFileSelect(null)}
      />

      {/* 3 PostgreSQL Tables Switcher Navigation with Filter Chips */}
      <TabNavigation
        activeTab={selectedTableTab}
        onTabChange={onSelectTableTab}
        filters={filters}
        selectedFile={selectedFile}
        onClearSelectedFile={() => onFileSelect(null)}
        onClearFilters={onClearFilters}
        onRemoveFilter={onRemoveFilter}
      />

      {/* Real Marine Hull Data Table with Pagination */}
      <DataTable
        data={tableData}
        loading={loading}
        activeTab={selectedTableTab}
        pagination={pagination}
        onPageChange={onPageChange}
        onLimitChange={onLimitChange}
      />

      {/* Real Recent Output from Database History */}
      <RecentOutput
        onNavigateToHistory={onNavigateToHistory}
        onSelectDetail={onSelectDetail}
      />
    </div>
  );
}
