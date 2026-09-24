import React, { useState, useEffect } from 'react';
import { RefreshCw, Download, Database, Sparkles } from 'lucide-react';
import facLensService from '../../services/facLensService';

export default function TopControlBar({
  selectedTableTab = 'acceptance',
  onSelectTableTab,
  onRefresh,
  onExport,
  tables: propTables = null
}) {
  const [tables, setTables] = useState([
    { id: 'acceptance', label: 'MH - Data Akseptasi' },
    { id: 'loss_pla', label: 'MH - Data Loss PLA' },
    { id: 'loss_sla', label: 'MH - Data Loss SLA' },
    { id: 'ai_parsed', label: 'MH - Data Hasil Parsing', isAiParsed: true }
  ]);

  useEffect(() => {
    if (propTables && propTables.length > 0) {
      setTables(propTables);
      return;
    }

    async function fetchTables() {
      const list = await facLensService.getTables();
      if (list && list.length > 0) {
        setTables(list);
      }
    }
    fetchTables();
  }, [propTables]);

  const currentTable = tables.find((t) => t.id === selectedTableTab || t.tableName === selectedTableTab);

  return (
    <div className="top-control-bar">
      <div className="control-left">
        {/* Dropdown Pemilihan Data ("Pilih Data") */}
        <div className="file-dropdown-container">
          <div className="file-dropdown-icon-wrapper" style={{ background: currentTable?.isAiParsed ? '#4f46e5' : undefined }}>
            {currentTable?.isAiParsed ? (
              <Sparkles size={16} className="file-dropdown-icon" style={{ color: '#ffffff' }} />
            ) : (
              <Database size={16} className="file-dropdown-icon" />
            )}
          </div>
          <div className="file-dropdown-select-wrapper">
            <label className="file-dropdown-label">Pilih Tabel DWH:</label>
            <select
              id="dashboard-data-selector"
              className="file-select-dropdown"
              value={selectedTableTab}
              onChange={(e) => onSelectTableTab(e.target.value)}
              title="Pilih tabel data warehouse yang akan ditampilkan di dashboard"
              style={{ fontWeight: 600 }}
            >
              {tables.map((opt) => (
                <option key={opt.id} value={opt.id}>
                  {opt.isAiParsed ? '⚡ ' : ''}{opt.label} {opt.count !== undefined ? `(${opt.count} baris)` : ''}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Refresh Icon Button */}
        <button className="icon-btn" onClick={onRefresh} title="Perbarui Data">
          <RefreshCw size={16} />
        </button>

        {currentTable?.isAiParsed && (
          <span style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 6,
            background: 'rgba(79, 70, 229, 0.1)',
            color: '#4338ca',
            border: '1px solid rgba(79, 70, 229, 0.3)',
            padding: '4px 10px',
            borderRadius: '6px',
            fontSize: '0.75rem',
            fontWeight: 700
          }}>
            <Sparkles size={13} />
            <span>Normalisasi Entitas Granular (Parsing Engine)</span>
          </span>
        )}
      </div>


      <div className="control-right">
        <button className="download-btn" onClick={onExport} title="Unduh Data ke CSV">
          <span>Unduh Data</span>
          <Download size={16} />
        </button>
      </div>
    </div>
  );
}
