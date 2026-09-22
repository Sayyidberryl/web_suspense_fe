import React from 'react';
import { Search, RefreshCw, Download, FileSpreadsheet } from 'lucide-react';

export default function TopControlBar({
  globalSearch = '',
  onGlobalSearchChange,
  fileList = [],
  selectedFile = null,
  onFileSelect,
  onRefresh,
  onExport
}) {
  return (
    <div className="top-control-bar">
      <div className="control-left">
        {/* Dropdown Pemilihan Berkas (File Selector) */}
        <div className="file-dropdown-container">
          <div className="file-dropdown-icon-wrapper">
            <FileSpreadsheet size={16} className="file-dropdown-icon" />
          </div>
          <div className="file-dropdown-select-wrapper">
            <label className="file-dropdown-label">Pilih Berkas:</label>
            <select
              id="dashboard-file-selector"
              className="file-select-dropdown"
              value={selectedFile ? selectedFile.id : 'all'}
              onChange={(e) => {
                const val = e.target.value;
                if (val === 'all') {
                  onFileSelect(null);
                } else {
                  const found = fileList.find((f) => String(f.id) === String(val));
                  onFileSelect(found || null);
                }
              }}
              title="Pilih berkas hasil ETL untuk ditampilkan di dashboard"
            >
              <option value="all">📂 Semua Berkas (Semua Data)</option>
              {fileList.map((file) => (
                <option key={file.id} value={file.id}>
                  📄 {file.file_name} {file.cedant ? `• ${file.cedant}` : ''}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Quick Search Group */}
        <div className="search-input-group">
          <Search size={16} />
          <input
            type="text"
            placeholder="Cari FAC code, kapal, atau cedant..."
            value={globalSearch}
            onChange={(e) => onGlobalSearchChange(e.target.value)}
          />
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
