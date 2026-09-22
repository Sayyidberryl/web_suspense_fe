import React from 'react';
import { RefreshCw, Download, Database } from 'lucide-react';

export default function TopControlBar({
  selectedTableTab = 'loss_pla',
  onSelectTableTab,
  onRefresh,
  onExport
}) {
  const dataOptions = [
    { id: 'acceptance', label: 'MH - Data Akseptasi' },
    { id: 'loss_pla', label: 'MH - Data Loss PLA' },
    { id: 'loss_sla', label: 'MH - Data Loss SLA' }
  ];

  return (
    <div className="top-control-bar">
      <div className="control-left">
        {/* Dropdown Pemilihan Data ("Pilih Data") */}
        <div className="file-dropdown-container">
          <div className="file-dropdown-icon-wrapper">
            <Database size={16} className="file-dropdown-icon" />
          </div>
          <div className="file-dropdown-select-wrapper">
            <label className="file-dropdown-label">Pilih Data:</label>
            <select
              id="dashboard-data-selector"
              className="file-select-dropdown"
              value={selectedTableTab}
              onChange={(e) => onSelectTableTab(e.target.value)}
              title="Pilih data yang akan ditampilkan di dashboard"
            >
              {dataOptions.map((opt) => (
                <option key={opt.id} value={opt.id}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Refresh Icon Button */}
        <button className="icon-btn" onClick={onRefresh} title="Muat Ulang Data Real">
          <RefreshCw size={16} />
        </button>
      </div>

      <div className="control-right">
        <button className="download-btn" onClick={onExport} title="Ekspor data saat ini ke CSV">
          <span>Unduh Data</span>
          <Download size={16} />
        </button>
      </div>
    </div>
  );
}

