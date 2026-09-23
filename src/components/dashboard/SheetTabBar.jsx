import React from 'react';
import { Download, RefreshCw } from 'lucide-react';

/**
 * SheetTabBar — Excel-style sheet tabs for switching DWH tables.
 * Keeps the Download button on the right side.
 */
export default function SheetTabBar({
  tables = [],
  selectedTab = 'acceptance',
  onSelectTab,
  onRefresh,
  onExport,
}) {
  return (
    <div className="sheet-tab-bar">
      {/* Left: sheet tabs */}
      <div className="sheet-tabs-container">
        {tables.map((tbl) => {
          const isActive = tbl.id === selectedTab;
          return (
            <button
              key={tbl.id}
              id={`tab-${tbl.id}`}
              className={`sheet-tab ${isActive ? 'active' : ''}`}
              onClick={() => onSelectTab(tbl.id)}
              title={tbl.fullLabel || tbl.label}
            >
              <span className="sheet-tab-label">{tbl.label}</span>
              {tbl.count !== undefined && (
                <span className="sheet-tab-count">
                  {tbl.count.toLocaleString('id-ID')}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Right: action buttons */}
      <div className="sheet-tab-actions">
        <button
          className="icon-btn"
          onClick={onRefresh}
          title="Perbarui Data"
          id="btn-refresh-data"
        >
          <RefreshCw size={15} />
        </button>
        <button
          className="download-btn"
          onClick={onExport}
          title="Unduh Data ke CSV"
          id="btn-download-data"
        >
          <span>Unduh Data</span>
          <Download size={15} />
        </button>
      </div>
    </div>
  );
}
