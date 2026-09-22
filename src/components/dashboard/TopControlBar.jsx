import React from 'react';
import { Search, ChevronDown, RefreshCw, Download } from 'lucide-react';

export default function TopControlBar({ globalSearch, onGlobalSearchChange, onRefresh }) {
  return (
    <div className="top-control-bar">
      <div className="control-left">
        <div className="search-input-group">
          <Search size={16} />
          <input
            type="text"
            placeholder="Cari nama file, atau cedant..."
            value={globalSearch}
            onChange={(e) => onGlobalSearchChange(e.target.value)}
          />
        </div>
        
        <div className="dropdown-select">
          <span>Semua Tipe COB</span>
          <ChevronDown size={14} />
        </div>

        <button className="icon-btn" onClick={onRefresh} title="Refresh Data">
          <RefreshCw size={16} />
        </button>
      </div>

      <div className="control-right">
        <button className="download-btn">
          <span>Download .xlsx</span>
          <Download size={16} />
        </button>
      </div>
    </div>
  );
}
