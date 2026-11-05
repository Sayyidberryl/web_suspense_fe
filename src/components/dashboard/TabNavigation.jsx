import React from 'react';
import { X } from 'lucide-react';

export default function TabNavigation({
  filters = {},
  onClearFilters,
  onRemoveFilter
}) {
  // Active filter keys (deduplicating equivalent pairs)
  const activeFilters = Object.entries(filters).filter(([key, val]) => {
    if (key === 'selectedFile') return false;
    if (!val || typeof val !== 'string' || !val.trim()) return false;
    // Don't show redundant duplicate chip for equivalent keys
    if (key === 'vesselLossName' && filters.vesselName && filters.vesselName.trim() === val.trim()) return false;
    if (key === 'vesselLossCode' && filters.vesselCode && filters.vesselCode.trim() === val.trim()) return false;
    if (key === 'insuredLossName' && filters.insuredName && filters.insuredName.trim() === val.trim()) return false;
    return true;
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
    vesselLossName: 'Nama Kapal (Loss)',
    vesselCode: 'Kode Kapal',
    vesselLossCode: 'Kode Kapal (Loss)',
    lossCause: 'Penyebab Klaim',
    dateOfLoss: 'Tgl Klaim',
    currency: 'Mata Uang',
    status: 'Status',
    globalSearch: 'Cari'
  };

  const hasAnyFilter = activeFilters.length > 0;

  if (!hasAnyFilter) return null;

  return (
    <div className="tab-navigation-container" style={{ marginTop: 0 }}>
      <div className="filters-summary-bar">
        <div className="filters-label">
          <span>Filters Aktif:</span>
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
        </div>

        <button className="clear-filters-btn" onClick={onClearFilters}>
          Reset Semua Filter
        </button>
      </div>
    </div>
  );
}
