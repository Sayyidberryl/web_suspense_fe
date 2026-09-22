import React, { useState, useEffect, useRef } from 'react';
import { SlidersHorizontal, Check, Plus, X, RotateCcw } from 'lucide-react';

// Definitions of all available filterable columns for each table tab
export const TABLE_COLUMN_DEFINITIONS = {
  loss_pla: [
    { key: 'facCode', label: 'FAC Code', placeholder: 'Cari fac_code...' },
    { key: 'reffNumber', label: 'Reff Number', placeholder: 'PLA/2023/MH/...' },
    { key: 'companyName', label: 'Cedant / Direct', placeholder: 'Nama ceding...' },
    { key: 'broker', label: 'Broker', placeholder: 'Direct / Broker...' },
    { key: 'insuredLossName', label: 'Tertanggung Loss', placeholder: 'Nama tertanggung loss...' },
    { key: 'insuredName', label: 'Nama Tertanggung', placeholder: 'Nama tertanggung...' },
    { key: 'vesselName', label: 'Nama Kapal', placeholder: 'Nama kapal...' },
    { key: 'vesselCode', label: 'Kode Kapal', placeholder: 'V-XXXX...' },
    { key: 'lossCause', label: 'Penyebab Klaim', placeholder: 'Machinery / Weather...' },
    { key: 'dateOfLoss', label: 'Tanggal Klaim', placeholder: 'YYYY-MM-DD...' },
    { key: 'currency', label: 'Mata Uang', placeholder: 'IDR / USD...' },
    { key: 'status', label: 'Status Klaim', placeholder: 'Settled / In Review...' }
  ],
  acceptance: [
    { key: 'facCode', label: 'FAC Code', placeholder: 'Cari fac_code...' },
    { key: 'reffNumber', label: 'Reff Number', placeholder: 'No. registrasi akseptasi...' },
    { key: 'companyName', label: 'Cedant / Direct', placeholder: 'Nama ceding...' },
    { key: 'broker', label: 'Broker', placeholder: 'Direct / Broker...' },
    { key: 'insuredName', label: 'Nama Tertanggung', placeholder: 'Nama tertanggung...' },
    { key: 'vesselName', label: 'Nama Kapal', placeholder: 'Nama kapal...' },
    { key: 'vesselCode', label: 'Kode Kapal', placeholder: 'V-XXXX...' },
    { key: 'currency', label: 'Mata Uang', placeholder: 'IDR / USD...' },
    { key: 'status', label: 'Status Akseptasi', placeholder: 'Active / Pending...' }
  ],
  loss_sla: [
    { key: 'facCode', label: 'FAC Code', placeholder: 'Cari fac_code...' },
    { key: 'reffNumber', label: 'Reff Number', placeholder: 'SLA/2023/MH/...' },
    { key: 'companyName', label: 'Cedant / Direct', placeholder: 'Nama ceding...' },
    { key: 'broker', label: 'Broker', placeholder: 'Direct / Broker...' },
    { key: 'insuredName', label: 'Nama Tertanggung', placeholder: 'Nama tertanggung...' },
    { key: 'vesselName', label: 'Nama Kapal', placeholder: 'Nama kapal...' },
    { key: 'vesselCode', label: 'Kode Kapal', placeholder: 'V-XXXX...' },
    { key: 'dateOfLoss', label: 'Tanggal Settlement', placeholder: 'YYYY-MM-DD...' },
    { key: 'currency', label: 'Mata Uang', placeholder: 'IDR / USD...' },
    { key: 'status', label: 'Status Settle', placeholder: 'Settled...' }
  ]
};

const DEFAULT_COLUMNS = {
  loss_pla: ['facCode', 'companyName', 'insuredLossName', 'vesselName', 'lossCause'],
  acceptance: ['facCode', 'reffNumber', 'companyName', 'insuredName', 'vesselName'],
  loss_sla: ['facCode', 'reffNumber', 'companyName', 'vesselName', 'status']
};

export default function FacLensBanner({
  filters = {},
  onFilterChange,
  activeTab = 'loss_pla'
}) {
  const availableColumns = TABLE_COLUMN_DEFINITIONS[activeTab] || TABLE_COLUMN_DEFINITIONS.loss_pla;

  // Active visible filter columns for this table
  const [visibleColumns, setVisibleColumns] = useState(() => {
    return DEFAULT_COLUMNS[activeTab] || availableColumns.slice(0, 5).map((c) => c.key);
  });

  const [isCustomizeOpen, setIsCustomizeOpen] = useState(false);
  const dropdownRef = useRef(null);

  // Update visible columns when tab changes
  useEffect(() => {
    const validKeys = new Set(availableColumns.map((c) => c.key));
    setVisibleColumns((prev) => {
      const filtered = prev.filter((k) => validKeys.has(k));
      if (filtered.length === 0) {
        return DEFAULT_COLUMNS[activeTab] || availableColumns.slice(0, 5).map((c) => c.key);
      }
      return filtered;
    });
  }, [activeTab, availableColumns]);

  // Close dropdown on click outside
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

  const handleSelectAll = () => {
    setVisibleColumns(availableColumns.map((c) => c.key));
  };

  const handleResetDefault = () => {
    const defaults = DEFAULT_COLUMNS[activeTab] || availableColumns.slice(0, 5).map((c) => c.key);
    setVisibleColumns(defaults);
  };

  const handleRemoveField = (key) => {
    onFilterChange(key, '');
    setVisibleColumns((prev) => prev.filter((k) => k !== key));
  };

  const activeTabLabel =
    activeTab === 'acceptance'
      ? 'Akseptasi'
      : activeTab === 'loss_sla'
      ? 'Loss SLA'
      : 'Loss PLA';

  return (
    <div className="fac-lens-banner">
      {/* Banner Header Row */}
      <div className="banner-header-row">
        <div className="banner-title-group">
          <h2 className="banner-title">FAC LENS</h2>
          <p className="banner-subtitle">
            Facultative Data Intelligence &amp; Analytics Dashboard
          </p>
        </div>

        {/* Compact Customize Button — icon only, opens popup */}
        <div className="banner-actions" ref={dropdownRef}>
          <button
            type="button"
            className={`btn-customize-compact ${isCustomizeOpen ? 'active' : ''}`}
            onClick={() => setIsCustomizeOpen(!isCustomizeOpen)}
            title="Kustomisasi kolom filter"
          >
            <SlidersHorizontal size={15} />
            <span className="btn-customize-compact-label">Setting Filter</span>
            <span className="badge-count">{visibleColumns.length}</span>
          </button>

          {/* Customize Popover */}
          {isCustomizeOpen && (
            <div className="customize-columns-popover">
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
      </div>

      {/* Dynamic Customizable Filters Grid */}
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
            <div
              key={colKey}
              className={`banner-filter-group ${hasVal ? 'has-value' : ''}`}
            >
              <div className="filter-group-header">
                <span className="banner-filter-label">{colDef.label}</span>
                <button
                  type="button"
                  className="btn-remove-filter-field"
                  onClick={() => handleRemoveField(colKey)}
                  title={`Sembunyikan filter ${colDef.label}`}
                >
                  <X size={11} />
                </button>
              </div>
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

        {/* Quick Add Column Button */}
        <button
          type="button"
          className="btn-quick-add-column"
          onClick={() => setIsCustomizeOpen(true)}
          title="Tambah kolom filter lainnya"
        >
          <Plus size={15} />
          <span>Tambah Kolom</span>
        </button>
      </div>
    </div>
  );
}
