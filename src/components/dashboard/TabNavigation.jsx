import React from 'react';
import { MoreVertical, X, FileSpreadsheet } from 'lucide-react';

export default function TabNavigation({
  activeTab,
  onTabChange,
  filters = {},
  selectedFile = null,
  onClearSelectedFile,
  onClearFilters,
  onRemoveFilter
}) {
  const tabs = [
    { id: 'acceptance', label: 'MH - Data Akseptasi' },
    { id: 'loss_pla', label: 'MH - Data Loss PLA', hasOptions: true },
    { id: 'loss_sla', label: 'MH - Data Loss SLA' },
  ];

  // Active filter keys (exclude selectedFile which is an object)
  const activeFilters = Object.entries(filters).filter(([key, val]) => {
    if (key === 'selectedFile') return false;
    return Boolean(val && typeof val === 'string' && val.trim());
  });

  const filterLabels = {
    facCode: 'FAC Code',
    reffNumber: 'Reff No.',
    companyName: 'Cedant / Direct',
    direct: 'Direct',
    broker: 'Broker',
    insuredName: 'Tertanggung',
    insuredLossName: 'Tertanggung Loss',
    vesselName: 'Nama Kapal',
    vesselCode: 'Kode Kapal',
    lossCause: 'Penyebab Klaim',
    dateOfLoss: 'Tgl Klaim',
    currency: 'Mata Uang',
    status: 'Status',
    globalSearch: 'Cari'
  };

  const hasAnyFilter = activeFilters.length > 0 || Boolean(selectedFile);

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
          <span>Filters Aktif:</span>
          {!hasAnyFilter ? (
            <span style={{ color: '#94a3b8', fontStyle: 'italic', fontSize: '0.8rem' }}>
              Semua data ditampilkan (tanpa filter)
            </span>
          ) : (
            <div className="filter-chip-list">
              {/* Selected File Chip */}
              {selectedFile && (
                <span className="filter-chip file-chip">
                  <FileSpreadsheet size={11} style={{ marginRight: 4, color: '#166534' }} />
                  <span>Berkas: <strong>{selectedFile.file_name}</strong></span>
                  <span
                    className="filter-chip-remove"
                    onClick={onClearSelectedFile}
                    title="Hapus filter berkas ini"
                  >
                    <X size={11} />
                  </span>
                </span>
              )}

              {/* Column Filter Chips */}
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

        {hasAnyFilter && (
          <button className="clear-filters-btn" onClick={onClearFilters}>
            Reset Semua Filter
          </button>
        )}
      </div>
    </div>
  );
}
