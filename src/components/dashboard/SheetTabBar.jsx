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
  tabTitles = {},
  onRenameTab,
  isExporting = false,
}) {
  const [isAddMenuOpen, setIsAddMenuOpen] = useState(false);
  const [editingTabId, setEditingTabId] = useState(null);
  const [editInput, setEditInput] = useState('');
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

  const handleStartRename = (e, tabId, initialVal) => {
    e.stopPropagation();
    setEditingTabId(tabId);
    setEditInput(initialVal);
  };

  const handleSaveRename = (tabId) => {
    if (editInput && editInput.trim() && onRenameTab) {
      onRenameTab(tabId, editInput.trim());
    }
    setEditingTabId(null);
  };

  // Derived state
  const displayedTables = openTabs.map((id) => tables.find((t) => t.id === id)).filter(Boolean);
  const availableToAdd = tables.filter((t) => !openTabs.includes(t.id));

  return (
    <div className="sheet-tab-bar">
      {/* Left: sheet tabs */}
      <div className="sheet-tabs-container">
        {displayedTables.map((tbl) => {
          const isActive = tbl.id === selectedTab;
          const currentLabel = (tabTitles && tabTitles[tbl.id]) || tbl.label || tbl.name || tbl.id;
          const isEditing = editingTabId === tbl.id;

          return (
            <div
              key={tbl.id}
              className={`sheet-tab ${isActive ? 'active' : ''}`}
              onClick={() => onSelectTab(tbl.id)}
              title={isEditing ? '' : `${currentLabel} (Klik dua kali untuk mengubah nama)`}
            >
              {isEditing ? (
                <input
                  type="text"
                  className="sheet-tab-rename-input"
                  autoFocus
                  value={editInput}
                  onChange={(e) => setEditInput(e.target.value)}
                  onBlur={() => handleSaveRename(tbl.id)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') handleSaveRename(tbl.id);
                    if (e.key === 'Escape') setEditingTabId(null);
                  }}
                  onClick={(e) => e.stopPropagation()}
                />
              ) : (
                <span
                  className="sheet-tab-label"
                  onDoubleClick={(e) => handleStartRename(e, tbl.id, currentLabel)}
                >
                  {currentLabel}
                </span>
              )}

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
                  {availableToAdd.map((tbl) => {
                    const tabTitle = (tabTitles && tabTitles[tbl.id]) || tbl.fullLabel || tbl.label;
                    return (
                      <li
                        key={tbl.id}
                        onClick={() => {
                          onAddTab(tbl.id);
                          setIsAddMenuOpen(false);
                        }}
                      >
                        {tabTitle}
                      </li>
                    );
                  })}
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
          title="Unduh Data ke Excel (.xlsx)"
          id="btn-download-data"
          disabled={isExporting}
        >
          <span>{isExporting ? 'Mengunduh...' : 'Unduh Data (.xlsx)'}</span>
          <Download size={15} />
        </button>
      </div>
    </div>
  );
}
