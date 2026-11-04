import React, { useState, useEffect } from 'react';
import { RefreshCw, Download, Database } from 'lucide-react';
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
    { id: 'acceptance_merge_okt', label: 'FACUL_ETL_MH_AKSEPTASI_MERGE_OKT' },
    { id: 'loss_pla', label: 'MH - Data Loss PLA' },
    { id: 'loss_sla', label: 'MH - Data Loss SLA' }
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

  return (
    <div className="top-control-bar">
      <div className="control-left">
        {/* Dropdown Pemilihan Data ("Pilih Data") */}
        <div className="file-dropdown-container">
          <div className="file-dropdown-icon-wrapper">
            <Database size={16} className="file-dropdown-icon" />
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
                  {opt.label} {opt.count !== undefined ? `(${opt.count} baris)` : ''}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Refresh Icon Button */}
        <button className="icon-btn" onClick={onRefresh} title="Perbarui Data">
          <RefreshCw size={16} />
        </button>
      </div>

      <div className="control-right">
        <button className="download-btn" onClick={onExport} title="Unduh Data ke Excel (.xlsx)">
          <span>Unduh Data</span>
          <Download size={16} />
        </button>
      </div>
    </div>
  );
}
