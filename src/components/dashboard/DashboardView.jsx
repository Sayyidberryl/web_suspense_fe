import React from 'react';
import SheetTabBar from './SheetTabBar';
import FacLensBanner from './FacLensBanner';
import TabNavigation from './TabNavigation';
import DataTable from './DataTable';

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
  pagination,
  onPageChange,
  onLimitChange,
  onRefresh,
  onExport,
}) {
  const isAiParsedTab =
    selectedTableTab === 'ai_parsed' || selectedTableTab === 'FACUL_ETL_MH_PARSED_AI';

  return (
    <div>
      {/* Sheet Tabs — Excel-style table switcher at the top */}
      <SheetTabBar
        tables={tables}
        selectedTab={selectedTableTab}
        onSelectTab={onSelectTableTab}
        onRefresh={onRefresh}
        onExport={onExport}
      />

      {/* FAC LENS Filter Banner */}
      {!isAiParsedTab && (
        <FacLensBanner
          filters={filters}
          onFilterChange={onFilterChange}
          activeTab={selectedTableTab}
        />
      )}

      {/* Active filter chips */}
      {!isAiParsedTab && (
        <TabNavigation
          filters={filters}
          onClearFilters={onClearFilters}
          onRemoveFilter={onRemoveFilter}
        />
      )}

      {/* Data Table */}
      <DataTable
        data={tableData}
        columns={tableColumns}
        loading={loading}
        activeTab={selectedTableTab}
        pagination={pagination}
        onPageChange={onPageChange}
        onLimitChange={onLimitChange}
      />
    </div>
  );
}
