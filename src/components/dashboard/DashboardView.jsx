import React from 'react';
import { Plus, Clock } from 'lucide-react';
import TopControlBar from './TopControlBar';
import FacLensBanner from './FacLensBanner';
import TabNavigation from './TabNavigation';
import DataTable from './DataTable';
import RecentOutput from './RecentOutput';

export default function DashboardView({
  tableData,
  tableColumns = [],
  tables = [],
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
  onRefresh,
  onExport,
  onNavigateToUpload,
  onNavigateToHistory,
  onSelectDetail
}) {
  const isAiParsedTab = selectedTableTab === 'ai_parsed' || selectedTableTab === 'FACUL_ETL_MH_PARSED_AI';

  return (
    <div>
      {/* Welcome Section */}
      <div className="welcome-section">
        <h1 className="welcome-title" style={{ marginBottom: 16 }}>
          FAC LENS | Facultative Intelligence Platform
        </h1>
        <div className="welcome-actions">
          <button className="btn-welcome-upload" onClick={onNavigateToUpload}>
            <Plus size={16} />
            <span>Unggah Berkas</span>
          </button>
          <button className="btn-welcome-history" onClick={onNavigateToHistory}>
            <Clock size={16} />
            <span>Riwayat Eksekusi</span>
          </button>
        </div>
      </div>


      {/* Top Controls with "Pilih Data" Dropdown */}
      <TopControlBar
        selectedTableTab={selectedTableTab}
        onSelectTableTab={onSelectTableTab}
        onRefresh={onRefresh}
        onExport={onExport}
        tables={tables}
      />

      {/* FAC LENS Filter Banner with Customizable Column Filters */}
      {!isAiParsedTab && (
        <FacLensBanner
          filters={filters}
          onFilterChange={onFilterChange}
          activeTab={selectedTableTab}
        />
      )}

      {/* Filter Summary Chips Bar — only visible when filters are active */}
      {!isAiParsedTab && (
        <TabNavigation
          filters={filters}
          onClearFilters={onClearFilters}
          onRemoveFilter={onRemoveFilter}
        />
      )}

      {/* Dynamic Data Table with Runtime Columns */}
      <DataTable
        data={tableData}
        columns={tableColumns}
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
