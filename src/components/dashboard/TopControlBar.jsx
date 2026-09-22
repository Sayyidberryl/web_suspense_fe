import React from 'react';
import { Search, RefreshCw, Download } from 'lucide-react';

export default function TopControlBar({ globalSearch, onGlobalSearchChange, onRefresh, onExport }) {
  return (
    <div className="top-control-bar">
      <div className="control-left">
        <div className="search-input-group">
          <Search size={16} />
          <input
            type="text"
            placeholder="Cari FAC code, kapal, atau cedant..."
            value={globalSearch}
            onChange={(e) => onGlobalSearchChange(e.target.value)}
          />
        </div>

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
