import React, { useState } from 'react';
import { Layers, Check, Play, Plus, X } from 'lucide-react';

const DEFAULT_TARGET_COLUMNS = [
  'Nama Kapal',
  'Type of Vessel',
  'Code Kapal',
  'Size of Vessel',
  'Year of Built',
  'Type of Material',
  'Classification'
];

export default function ParsingEngineCard({
  isEnabled = true,
  onToggle,
  sourceColumns = [],
  onProcess,
  isProcessing = false
}) {
  const [selectedTargetColumns, setSelectedTargetColumns] = useState(DEFAULT_TARGET_COLUMNS);
  const [customTargetInput, setCustomTargetInput] = useState('');
  
  // Source column assignment per target column
  // Special combo for 'Type of Vessel': allows composite sources (e.g. fac_risk + fac_desc)
  const [columnSourceMap, setColumnSourceMap] = useState({
    'Nama Kapal': 'fac_desc',
    'Type of Vessel': 'fac_risk + fac_desc',
    'Code Kapal': 'fac_desc',
    'Size of Vessel': 'fac_desc',
    'Year of Built': 'fac_desc',
    'Type of Material': 'fac_desc',
    'Classification': 'fac_desc'
  });

  const [notice, setNotice] = useState('');

  const handleToggleTargetColumn = (col) => {
    setSelectedTargetColumns((prev) => {
      if (prev.includes(col)) {
        if (prev.length === 1) return prev; // Keep at least one
        return prev.filter((c) => c !== col);
      } else {
        return [...prev, col];
      }
    });
  };

  const handleAddCustomTarget = () => {
    if (!customTargetInput || !customTargetInput.trim()) return;
    const trimmed = customTargetInput.trim();
    if (!selectedTargetColumns.includes(trimmed)) {
      setSelectedTargetColumns((prev) => [...prev, trimmed]);
      setColumnSourceMap((prev) => ({ ...prev, [trimmed]: 'fac_desc' }));
    }
    setCustomTargetInput('');
  };

  const handleSourceChange = (targetCol, sourceCol) => {
    setColumnSourceMap((prev) => ({
      ...prev,
      [targetCol]: sourceCol
    }));
  };

  const handleTriggerProcess = () => {
    if (onProcess) {
      onProcess({
        targetColumns: selectedTargetColumns,
        sourceMapping: columnSourceMap
      });
    }
  };

  return (
    <div style={{
      background: '#ffffff',
      border: '1px solid #e2e8f0',
      borderRadius: '16px',
      padding: '24px',
      marginBottom: '24px',
      color: '#0f172a',
      boxShadow: '0 2px 8px rgba(0, 0, 0, 0.04)',
      transition: 'all 0.3s ease'
    }}>
      {/* Header with ON/OFF Toggle */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '16px',
        borderBottom: '1px solid #f1f5f9',
        paddingBottom: '18px',
        marginBottom: isEnabled ? '20px' : 0
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
          <div style={{
            width: 44,
            height: 44,
            borderRadius: '12px',
            background: isEnabled ? '#eff6ff' : '#f1f5f9',
            border: isEnabled ? '1px solid #bfdbfe' : '1px solid #e2e8f0',
            color: isEnabled ? '#2563eb' : '#64748b',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            <Layers size={22} />
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <h3 style={{ margin: 0, fontSize: '1.15rem', fontWeight: 700, color: '#0f172a', letterSpacing: '-0.02em' }}>
                Parsing Engine
              </h3>
              <span style={{
                background: isEnabled ? '#eff6ff' : '#f1f5f9',
                color: isEnabled ? '#1d4ed8' : '#64748b',
                border: isEnabled ? '1px solid #bfdbfe' : '1px solid #e2e8f0',
                padding: '2px 8px',
                borderRadius: '6px',
                fontSize: '0.72rem',
                fontWeight: 700
              }}>
                Entity Extraction & Multi-Row Exploding
              </span>
            </div>
            <p style={{
              margin: '4px 0 0 0',
              fontSize: '0.82rem',
              color: '#64748b'
            }}>
              {isEnabled
                ? 'Parsing Engine aktif untuk memecah data teks jamak menjadi baris individual (Multi-Vessel Exploding)'
                : 'Nonaktif: Pemetaan berjalan column-to-column standar tanpa pemrosesan teks jamak'}
            </p>
          </div>
        </div>

        {/* Toggle Switch */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <span style={{
            fontSize: '0.85rem',
            fontWeight: 700,
            color: isEnabled ? '#2563eb' : '#64748b'
          }}>
            PARSING ENGINE {isEnabled ? 'ON' : 'OFF'}
          </span>
          <button
            type="button"
            onClick={onToggle}
            style={{
              width: 56,
              height: 30,
              borderRadius: '999px',
              background: isEnabled ? '#2563eb' : '#cbd5e1',
              border: 'none',
              cursor: 'pointer',
              position: 'relative',
              padding: 3,
              transition: 'background 0.25s ease'
            }}
            title={isEnabled ? 'Nonaktifkan Parsing Engine' : 'Aktifkan Parsing Engine'}
          >
            <div style={{
              width: 24,
              height: 24,
              borderRadius: '50%',
              background: '#ffffff',
              transform: isEnabled ? 'translateX(26px)' : 'translateX(0px)',
              transition: 'transform 0.25s ease',
              boxShadow: '0 2px 4px rgba(0,0,0,0.15)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              {isEnabled && <Check size={13} color="#2563eb" />}
            </div>
          </button>
        </div>
      </div>

      {notice && (
        <div style={{
          background: '#f0fdf4',
          border: '1px solid #bbf7d0',
          color: '#166534',
          padding: '8px 14px',
          borderRadius: '8px',
          fontSize: '0.8rem',
          fontWeight: 600,
          marginBottom: '16px',
          display: 'flex',
          alignItems: 'center',
          gap: '8px'
        }}>
          <Check size={14} color="#16a34a" />
          <span>{notice}</span>
        </div>
      )}

      {/* Main Content when Parsing Engine is ON */}
      {isEnabled && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '22px' }}>
          {/* Section 1: Multi-Select Target Columns */}
          <div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
              <label style={{ fontSize: '0.85rem', fontWeight: 600, color: '#1e293b' }}>
                1. Pilih Kolom Tujuan (Multi-Select Entity Target):
              </label>
              <span style={{ fontSize: '0.75rem', color: '#64748b' }}>
                {selectedTargetColumns.length} kolom terpilih untuk diekstrak
              </span>
            </div>

            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginBottom: '10px' }}>
              {DEFAULT_TARGET_COLUMNS.map((col) => {
                const isSelected = selectedTargetColumns.includes(col);
                return (
                  <button
                    key={col}
                    type="button"
                    onClick={() => handleToggleTargetColumn(col)}
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '8px',
                      padding: '6px 14px',
                      borderRadius: '8px',
                      fontSize: '0.8rem',
                      fontWeight: 600,
                      cursor: 'pointer',
                      border: isSelected ? '1px solid #3b82f6' : '1px solid #e2e8f0',
                      background: isSelected ? '#eff6ff' : '#f8fafc',
                      color: isSelected ? '#1d4ed8' : '#64748b',
                      transition: 'all 0.15s ease'
                    }}
                  >
                    <span style={{
                      width: 16,
                      height: 16,
                      borderRadius: '4px',
                      border: isSelected ? '1px solid #2563eb' : '1px solid #cbd5e1',
                      background: isSelected ? '#2563eb' : '#ffffff',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: '#ffffff',
                      flexShrink: 0
                    }}>
                      {isSelected && <Check size={11} color="#ffffff" />}
                    </span>
                    <span>{col}</span>
                  </button>
                );
              })}

              {/* Any added custom targets */}
              {selectedTargetColumns
                .filter((col) => !DEFAULT_TARGET_COLUMNS.includes(col))
                .map((col) => (
                  <div
                    key={col}
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '6px',
                      padding: '6px 12px',
                      borderRadius: '8px',
                      fontSize: '0.8rem',
                      fontWeight: 600,
                      border: '1px solid #bfdbfe',
                      background: '#eff6ff',
                      color: '#1d4ed8'
                    }}
                  >
                    <span>{col}</span>
                    <button
                      type="button"
                      onClick={() => handleToggleTargetColumn(col)}
                      style={{ background: 'none', border: 'none', color: '#1d4ed8', cursor: 'pointer', padding: 0, display: 'flex' }}
                    >
                      <X size={13} />
                    </button>
                  </div>
                ))}
            </div>

            {/* Add custom column target input */}
            <div style={{ display: 'flex', gap: '8px', maxWidth: 360 }}>
              <input
                type="text"
                placeholder="+ Tambah kolom tujuan kustom..."
                value={customTargetInput}
                onChange={(e) => setCustomTargetInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleAddCustomTarget()}
                style={{
                  flex: 1,
                  background: '#ffffff',
                  border: '1px solid #cbd5e1',
                  borderRadius: '6px',
                  padding: '6px 12px',
                  fontSize: '0.8rem',
                  color: '#0f172a'
                }}
              />
              <button
                type="button"
                onClick={handleAddCustomTarget}
                style={{
                  background: '#2563eb',
                  border: '1px solid #1d4ed8',
                  borderRadius: '6px',
                  padding: '6px 14px',
                  fontSize: '0.8rem',
                  color: '#ffffff',
                  fontWeight: 600,
                  cursor: 'pointer'
                }}
              >
                Tambah
              </button>
            </div>
          </div>

          {/* Section 2: Source Column Mapping per Target Column */}
          <div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '10px' }}>
              <label style={{ fontSize: '0.85rem', fontWeight: 600, color: '#1e293b' }}>
                2. Pemetaan Kolom Sumber (Source Column per Target):
              </label>
              <span style={{ fontSize: '0.74rem', color: '#64748b' }}>
                Mendukung kombinasi sumber multi-kolom (contoh: fac_risk + fac_desc)
              </span>
            </div>

            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
              gap: '10px'
            }}>
              {selectedTargetColumns.map((targetCol) => {
                const isVesselType = targetCol === 'Type of Vessel';
                const currentVal = columnSourceMap[targetCol] || (isVesselType ? 'fac_risk + fac_desc' : 'fac_desc');

                return (
                  <div
                    key={targetCol}
                    style={{
                      background: '#f8fafc',
                      border: '1px solid #e2e8f0',
                      borderRadius: '8px',
                      padding: '10px 14px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      gap: '12px'
                    }}
                  >
                    <span style={{ fontSize: '0.82rem', fontWeight: 600, color: '#1e293b' }}>
                      {targetCol}
                    </span>

                    <select
                      value={currentVal}
                      onChange={(e) => handleSourceChange(targetCol, e.target.value)}
                      style={{
                        background: '#ffffff',
                        border: '1px solid #cbd5e1',
                        borderRadius: '6px',
                        padding: '6px 10px',
                        fontSize: '0.78rem',
                        color: '#0f172a',
                        fontWeight: 600,
                        maxWidth: '65%'
                      }}
                    >
                      {isVesselType && (
                        <option value="fac_risk + fac_desc">
                          fac_risk + fac_desc (Kombinasi)
                        </option>
                      )}
                      <option value="fac_desc">fac_desc (Deskripsi Teks)</option>
                      <option value="fac_risk">fac_risk (Risk Type)</option>
                      <option value="fac_code">fac_code</option>
                      <option value="fac_insured">fac_insured</option>
                      {sourceColumns
                        .filter((c) => !['fac_desc', 'fac_risk', 'fac_code', 'fac_insured', '-- Pilih Kolom Excel --'].includes(c))
                        .map((c) => (
                          <option key={c} value={c}>
                            {c}
                          </option>
                        ))}
                    </select>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Section 3: Action Button */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            borderTop: '1px solid #f1f5f9',
            paddingTop: '16px',
            flexWrap: 'wrap',
            gap: '12px'
          }}>
            <div style={{ fontSize: '0.78rem', color: '#64748b' }}>
              Menjalankan parsing entitas pada berkas mentah untuk pembuktian multi-vessel exploding.
            </div>

            <button
              type="button"
              onClick={handleTriggerProcess}
              disabled={isProcessing}
              style={{
                background: isProcessing
                  ? '#94a3b8'
                  : 'linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)',
                border: 'none',
                borderRadius: '8px',
                padding: '10px 22px',
                color: '#ffffff',
                fontSize: '0.88rem',
                fontWeight: 700,
                cursor: isProcessing ? 'not-allowed' : 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                boxShadow: '0 2px 8px rgba(37, 99, 235, 0.25)',
                transition: 'all 0.2s ease'
              }}
            >
              {isProcessing ? (
                <>
                  <span className="corporate-spinner" style={{ width: 16, height: 16, borderTopColor: '#ffffff' }} />
                  <span>Sedang Memproses Parsing Engine...</span>
                </>
              ) : (
                <>
                  <Play size={15} />
                  <span>Proses Parsing Engine</span>
                </>
              )}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
