import React, { useState, useRef, useEffect } from 'react';
import { Download, RefreshCw, Plus, X } from 'lucide-react';

/**
 * SheetTabBar — Excel-style sheet tabs for switching DWH tables.
 * Now supports dynamic tabs: opening, closing, and adding new tabs.
 */
export default function SheetTabBar({
  tables = [],
  selectedTab = 'acceptance',
  onSelectTab,
  openTabs = [],
  onAddTab,
  onCloseTab,
  onRefresh,
  onExport,
}) {
  const [isAddMenuOpen, setIsAddMenuOpen] = useState(false);
  const addMenuRef = useRef(null);

  // Close add menu when clicking outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (addMenuRef.current && !addMenuRef.current.contains(event.target)) {
        setIsAddMenuOpen(false);
      }
    }
    if (isAddMenuOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isAddMenuOpen]);

  // Derived state
  const displayedTables = openTabs.map(id => tables.find(t => t.id === id)).filter(Boolean);
  const availableToAdd = tables.filter(t => !openTabs.includes(t.id));

  return (
    <div className="sheet-tab-bar">
      {/* Left: sheet tabs */}
      <div className="sheet-tabs-container">
        {displayedTables.map((tbl) => {
          const isActive = tbl.id === selectedTab;
          return (
            <div
              key={tbl.id}
              className={`sheet-tab ${isActive ? 'active' : ''}`}
              onClick={() => onSelectTab(tbl.id)}
              title={tbl.fullLabel || tbl.label}
            >
              <span className="sheet-tab-label">{tbl.label}</span>
              <button 
                className="sheet-tab-close-btn"
                onClick={(e) => {
                  e.stopPropagation();
                  onCloseTab(tbl.id);
                }}
                title="Tutup Sheet"
              >
                <X size={14} />
              </button>
            </div>
          );
        })}

        {/* Add Tab Button & Menu */}
        <div className="add-sheet-container" ref={addMenuRef}>
          <button 
            className="add-sheet-btn" 
            onClick={() => setIsAddMenuOpen(!isAddMenuOpen)}
            title="Tambah Sheet"
          >
            <Plus size={16} />
          </button>
          
          {isAddMenuOpen && (
            <div className="add-sheet-menu">
              <div className="add-sheet-menu-header">Pilih Tabel</div>
              {availableToAdd.length === 0 ? (
                <div className="add-sheet-menu-empty">Semua tabel sudah ditampilkan</div>
              ) : (
                <ul className="add-sheet-menu-list">
                  {availableToAdd.map(tbl => (
                    <li 
                      key={tbl.id} 
                      onClick={() => {
                        onAddTab(tbl.id);
                        setIsAddMenuOpen(false);
                      }}
                    >
                      {tbl.fullLabel || tbl.label}
                    </li>
                  ))}
                </ul>
              )}
            </div>
          )}
        </div>
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
