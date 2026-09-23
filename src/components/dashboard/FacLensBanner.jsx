import React, { useState, useEffect, useRef } from 'react';
import { SlidersHorizontal, Check, RotateCcw } from 'lucide-react';

// Definitions of all available filterable columns for each table tab
// Requirements: PLA & SLA: fac code, cedant name, insured loss name, vessel loss name, vessel loss code
// Acceptance: fac code, cedant name, insured name, vessel name, vessel code
export const TABLE_COLUMN_DEFINITIONS = {
  loss_pla: [
    { key: 'facCode', label: 'FAC Code', placeholder: 'Cari fac_code...' },
    { key: 'companyName', label: 'Cedant Name', placeholder: 'Nama cedant (Direct)...' },
    { key: 'insuredLossName', label: 'Insured Loss Name', placeholder: 'Nama tertanggung loss...' },
    { key: 'vesselLossName', label: 'Vessel Loss Name', placeholder: 'Nama kapal loss...' },
    { key: 'vesselLossCode', label: 'Vessel Loss Code', placeholder: 'Kode kapal loss...' }
  ],
  acceptance: [
    { key: 'facCode', label: 'FAC Code', placeholder: 'Cari fac_code...' },
    { key: 'companyName', label: 'Cedant Name', placeholder: 'Nama cedant (Direct)...' },
    { key: 'insuredName', label: 'Insured Name', placeholder: 'Nama tertanggung...' },
    { key: 'vesselName', label: 'Vessel Name', placeholder: 'Nama kapal...' },
    { key: 'vesselCode', label: 'Vessel Code', placeholder: 'Kode kapal...' }
  ],
  loss_sla: [
    { key: 'facCode', label: 'FAC Code', placeholder: 'Cari fac_code...' },
    { key: 'companyName', label: 'Cedant Name', placeholder: 'Nama cedant (Direct)...' },
    { key: 'insuredLossName', label: 'Insured Loss Name', placeholder: 'Nama tertanggung loss...' },
    { key: 'vesselLossName', label: 'Vessel Loss Name', placeholder: 'Nama kapal loss...' },
    { key: 'vesselLossCode', label: 'Vessel Loss Code', placeholder: 'Kode kapal loss...' }
  ],
  ai_parsed: [
    { key: 'facCode', label: 'FAC Code', placeholder: 'Cari fac_code...' },
    { key: 'vesselName', label: 'Nama Kapal', placeholder: 'Nama kapal...' },
    { key: 'vesselCode', label: 'Kode Kapal', placeholder: 'Kode kapal...' },
    { key: 'typeOfVessel', label: 'Type of Vessel', placeholder: 'Tipe kapal...' },
    { key: 'classification', label: 'Classification', placeholder: 'Klasifikasi...' }
  ]
};

const DEFAULT_COLUMNS = {
  loss_pla: ['facCode', 'companyName', 'insuredLossName', 'vesselLossName', 'vesselLossCode'],
  acceptance: ['facCode', 'companyName', 'insuredName', 'vesselName', 'vesselCode'],
  loss_sla: ['facCode', 'companyName', 'insuredLossName', 'vesselLossName', 'vesselLossCode'],
  ai_parsed: ['facCode', 'vesselName', 'vesselCode', 'typeOfVessel', 'classification']
};

export default function FacLensBanner({
  filters = {},
  onFilterChange,
  activeTab = 'acceptance'
}) {
  const availableColumns = TABLE_COLUMN_DEFINITIONS[activeTab] || TABLE_COLUMN_DEFINITIONS.acceptance;

  const [visibleColumns, setVisibleColumns] = useState(() => {
    return DEFAULT_COLUMNS[activeTab] || availableColumns.slice(0, 5).map((c) => c.key);
  });

  const [isCustomizeOpen, setIsCustomizeOpen] = useState(false);
  const dropdownRef = useRef(null);

  // Sync visible columns when tab changes — load exact columns for active tab
  useEffect(() => {
    const cols = DEFAULT_COLUMNS[activeTab] || availableColumns.map((c) => c.key);
    setVisibleColumns(cols);
  }, [activeTab]);

  // Close popup on outside click
  useEffect(() => {
    function handleClickOutside(e) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setIsCustomizeOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const toggleColumn = (key) => {
    setVisibleColumns((prev) => {
      if (prev.includes(key)) {
        onFilterChange(key, '');
        return prev.filter((k) => k !== key);
      } else {
        return [...prev, key];
      }
    });
  };

  const handleSelectAll = () => setVisibleColumns(availableColumns.map((c) => c.key));

  const handleResetDefault = () => {
    const defaults = DEFAULT_COLUMNS[activeTab] || availableColumns.slice(0, 5).map((c) => c.key);
    setVisibleColumns(defaults);
  };

  const activeTabLabel =
    activeTab === 'acceptance'
      ? 'MH - Data Akseptasi'
      : activeTab === 'loss_sla'
      ? 'MH - Data Loss SLA'
      : activeTab === 'loss_pla'
      ? 'MH - Data Loss PLA'
      : 'MH - Data AI';

  return (
    <div className="fac-lens-banner">
      {/* Banner Header — centered title */}
      <div className="banner-header-row">
        <div className="banner-title-group" style={{ flex: 1, textAlign: 'center' }}>
          <h2 className="banner-title">FAC LENS</h2>
          <p className="banner-subtitle">
            Facultative Data Intelligence &amp; Analytics Dashboard
          </p>
        </div>
      </div>

      {/* Filter Inputs Grid — fixed 5 columns, NO X button on each field */}
      <div
        className="banner-filters-dynamic"
        style={{
          gridTemplateColumns: `repeat(${Math.min(Math.max(visibleColumns.length, 1), 6)}, minmax(160px, 1fr))`
        }}
      >
        {visibleColumns.map((colKey) => {
          const colDef = availableColumns.find((c) => c.key === colKey) || {
            key: colKey,
            label: colKey,
            placeholder: `Filter ${colKey}...`
          };
          const val = filters[colKey] || '';
          const hasVal = Boolean(val && val.trim());

          return (
            <div key={colKey} className={`banner-filter-group ${hasVal ? 'has-value' : ''}`}>
              <span className="banner-filter-label">{colDef.label}</span>
              <input
                type="text"
                className="banner-filter-input"
                placeholder={colDef.placeholder}
                value={val}
                onChange={(e) => onFilterChange(colKey, e.target.value)}
              />
            </div>
          );
        })}
      </div>

      {/* Setting Filter section commented out per request */}
      {/*
      <div className="banner-footer-actions" ref={dropdownRef}>
        <button
          type="button"
          className={`btn-customize-compact ${isCustomizeOpen ? 'active' : ''}`}
          onClick={() => setIsCustomizeOpen(!isCustomizeOpen)}
          title="Kustomisasi kolom filter yang ditampilkan"
        >
          <SlidersHorizontal size={14} />
          <span className="btn-customize-compact-label">Setting Filter</span>
          <span className="badge-count">{visibleColumns.length} kolom</span>
        </button>

        {isCustomizeOpen && (
          <div className="customize-columns-popover popover-above">
            <div className="popover-header">
              <span className="popover-title">Pilih Kolom Filter</span>
              <span className="popover-tab-badge">{activeTabLabel}</span>
            </div>
            <p className="popover-hint">
              Centang kolom yang ingin ditampilkan sebagai input filter:
            </p>

            <div className="popover-column-list">
              {availableColumns.map((col) => {
                const isChecked = visibleColumns.includes(col.key);
                return (
                  <label key={col.key} className="column-checkbox-item">
                    <input
                      type="checkbox"
                      checked={isChecked}
                      onChange={() => toggleColumn(col.key)}
                    />
                    <span className="column-checkbox-custom">
                      {isChecked && <Check size={11} />}
                    </span>
                    <span className="column-checkbox-label">{col.label}</span>
                  </label>
                );
              })}
            </div>

            <div className="popover-footer">
              <button type="button" className="popover-btn-link" onClick={handleSelectAll}>
                Pilih Semua
              </button>
              <button type="button" className="popover-btn-link" onClick={handleResetDefault}>
                <RotateCcw size={12} style={{ marginRight: 4 }} />
                Reset Default
              </button>
            </div>
          </div>
        )}
      </div>
      */}
    </div>
  );
}
