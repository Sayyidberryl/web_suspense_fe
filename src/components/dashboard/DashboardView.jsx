import React from 'react';
import SheetTabBar from './SheetTabBar';
import FacLensBanner from './FacLensBanner';
import TabNavigation from './TabNavigation';
import DataTable from './DataTable';

/**
 * DashboardView — 3-layer frozen header design:
 *   [1] Sheet Tabs Bar      — always visible, no scroll
 *   [2] FAC LENS Filter     — always visible, no scroll
 *   [3] Table column header — sticky within the table scroll area
 *   [4] Data rows           — ONLY this part scrolls
 *   [5] Pagination footer   — always visible below scroll area
 */
export default function DashboardView({
  tableData,
  tableColumns = [],
  tables = [],
  loading,
  filters,
  onFilterChange,
  onClearFilters,
  onRemoveFilter,
  selectedTableTab = 'acceptance',
  onSelectTableTab,
  openTabs = [],
  onAddTab,
  onCloseTab,
  pagination,
  onPageChange,
  onLimitChange,
  onRefresh,
  onExport,
}) {
  const isAiParsedTab =
    selectedTableTab === 'ai_parsed' || selectedTableTab === 'FACUL_ETL_MH_PARSED_AI';

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', minHeight: 0 }}>
      {/* ① Sheet Tabs — STATIC, never moves */}
      <SheetTabBar
        tables={tables}
        selectedTab={selectedTableTab}
        onSelectTab={onSelectTableTab}
        openTabs={openTabs}
        onAddTab={onAddTab}
        onCloseTab={onCloseTab}
        onRefresh={onRefresh}
        onExport={onExport}
      />

      {openTabs.length === 0 ? (
        <div style={{
          flex: 1,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: '#64748b',
          fontSize: '1.1rem',
          fontWeight: 500,
          background: '#f8fafc',
          border: '1px dashed #cbd5e1',
          margin: '20px',
          borderRadius: '8px'
        }}>
          Tidak ada data yang ditampilkan
        </div>
      ) : (
        <>
          {/* ② FAC LENS Filter Banner — STATIC, never moves */}
          {!isAiParsedTab && (
            <FacLensBanner
              filters={filters}
              onFilterChange={onFilterChange}
              activeTab={selectedTableTab}
            />
          )}

          {/* Active filter chips (only when filters active) */}
          {!isAiParsedTab && (
            <TabNavigation
              filters={filters}
              onClearFilters={onClearFilters}
              onRemoveFilter={onRemoveFilter}
            />
          )}

          {/* ③④⑤ Data Table — column header sticky, rows scroll, pagination footer static */}
          <DataTable
            data={tableData}
            columns={tableColumns}
            loading={loading}
            activeTab={selectedTableTab}
            pagination={pagination}
            onPageChange={onPageChange}
            onLimitChange={onLimitChange}
          />
        </>
      )}
    </div>
  );
}
