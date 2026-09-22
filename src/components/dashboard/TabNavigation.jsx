import React from 'react';
import { MoreVertical, X } from 'lucide-react';

export default function TabNavigation({
  activeTab,
  onTabChange,
  filters,
  onClearFilters,
  onRemoveFilter
}) {
  const tabs = [
    { id: 'acceptance', label: 'MH - Data Akseptasi' },
    { id: 'loss_pla', label: 'MH - Data Loss PLA', hasOptions: true },
    { id: 'loss_sla', label: 'MH - Data Loss SLA' },
  ];

  // Active filter keys
  const activeFilters = Object.entries(filters).filter(([_, val]) => Boolean(val && val.trim()));

  const filterLabels = {
    facCode: 'FAC Code',
    companyName: 'Company',
    insuredLossName: 'Insured Loss',
    vesselName: 'Vessel',
    vesselCode: 'Vessel Code',
    globalSearch: 'Search'
  };

  return (
    <div className="tab-navigation-container">
      {/* Top Tabs */}
      <div className="tabs-navigation">
        {tabs.map((tab) => {
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              className={`tab-btn ${isActive ? 'active' : ''}`}
              onClick={() => onTabChange(tab.id)}
            >
              <span>{tab.label}</span>
              {tab.hasOptions && <MoreVertical size={14} className="tab-more-icon" />}
            </button>
          );
        })}
      </div>

      {/* Filter Status Line */}
      <div className="filters-summary-bar">
        <div className="filters-label">
          <span>Filters:</span>
          {activeFilters.length === 0 ? (
            <span>No selections</span>
          ) : (
            <div className="filter-chip-list">
              {activeFilters.map(([key, val]) => (
                <span key={key} className="filter-chip">
                  <span>{filterLabels[key] || key}: <strong>{val}</strong></span>
                  <span
                    className="filter-chip-remove"
                    onClick={() => onRemoveFilter(key)}
                    title="Hapus filter ini"
                  >
                    <X size={11} />
                  </span>
                </span>
              ))}
            </div>
          )}
        </div>

        {activeFilters.length > 0 && (
          <button className="clear-filters-btn" onClick={onClearFilters}>
            Reset Semua Filter
          </button>
        )}
      </div>
    </div>
  );
}
