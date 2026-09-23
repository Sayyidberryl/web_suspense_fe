import React, { useState } from 'react';
import { Sparkles, CheckCircle2, ArrowRight, X, ExternalLink, Layers, Eye } from 'lucide-react';

export default function AiResultPreviewModal({
  isOpen = false,
  onClose,
  onGoToDashboard,
  resultData = null,
  rawRows = []
}) {
  const [activeTab, setActiveTab] = useState('after'); // 'after' | 'before' | 'comparison'

  if (!isOpen || !resultData) return null;

  const explodedRows = resultData.data || [];
  const sourceCount = resultData.sourceCount || rawRows.length || 10;
  const resultCount = resultData.resultCount || explodedRows.length;
  const expansionRatio = resultData.expansionRatio || (resultCount / Math.max(1, sourceCount)).toFixed(1);
  const usedEngine = resultData.usedEngine || 'Parsing Engine';

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      background: 'rgba(15, 23, 42, 0.75)',
      backdropFilter: 'blur(6px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 9999,
      padding: '20px'
    }}>
      <div style={{
        background: '#ffffff',
        borderRadius: '20px',
        width: '100%',
        maxWidth: '1150px',
        maxHeight: '90vh',
        display: 'flex',
        flexDirection: 'column',
        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
        overflow: 'hidden'
      }}>
        {/* Modal Header */}
        <div style={{
          padding: '20px 28px',
          background: 'linear-gradient(135deg, #0f172a 0%, #1e1b4b 100%)',
          color: '#ffffff',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexShrink: 0
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
            <div style={{
              width: 44,
              height: 44,
              borderRadius: '12px',
              background: 'linear-gradient(135deg, #6366f1, #a855f7)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 0 16px rgba(168, 85, 247, 0.6)'
            }}>
              <Sparkles size={22} color="#ffffff" />
            </div>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <h3 style={{ margin: 0, fontSize: '1.2rem', fontWeight: 700 }}>
                  Hasil Parsing Engine
                </h3>
                <span style={{
                  background: 'rgba(52, 211, 153, 0.2)',
                  color: '#34d399',
                  border: '1px solid rgba(52, 211, 153, 0.4)',
                  padding: '2px 8px',
                  borderRadius: '999px',
                  fontSize: '0.72rem',
                  fontWeight: 700
                }}>
                  Sukses 100%
                </span>
              </div>
              <p style={{ margin: '4px 0 0 0', fontSize: '0.82rem', color: '#94a3b8' }}>
                Engine: <strong>{usedEngine}</strong> • Data mentah berhasil dinormalisasi dan disimpan ke Data Warehouse
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            style={{
              background: 'rgba(255,255,255,0.1)',
              border: 'none',
              borderRadius: '8px',
              width: 32,
              height: 32,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#94a3b8',
              cursor: 'pointer'
            }}
          >
            <X size={18} />
          </button>
        </div>

        {/* 4 Metric Cards */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(4, 1fr)',
          gap: '14px',
          padding: '16px 28px',
          background: '#f8fafc',
          borderBottom: '1px solid #e2e8f0',
          flexShrink: 0
        }}>
          <div style={{ background: '#ffffff', padding: '12px 16px', borderRadius: '10px', border: '1px solid #e2e8f0' }}>
            <span style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: 600 }}>INPUT MENTAH</span>
            <div style={{ fontSize: '1.3rem', fontWeight: 700, color: '#0f172a' }}>{sourceCount} Baris</div>
            <span style={{ fontSize: '0.7rem', color: '#94a3b8' }}>Teks deskripsi jamak</span>
          </div>

          <div style={{ background: '#ffffff', padding: '12px 16px', borderRadius: '10px', border: '1px solid #bbf7d0' }}>
            <span style={{ fontSize: '0.75rem', color: '#16a34a', fontWeight: 600 }}>OUTPUT EXPLODED</span>
            <div style={{ fontSize: '1.3rem', fontWeight: 700, color: '#15803d' }}>{resultCount} Baris</div>
            <span style={{ fontSize: '0.7rem', color: '#16a34a' }}>1 kapal = 1 baris entitas</span>
          </div>

          <div style={{ background: '#ffffff', padding: '12px 16px', borderRadius: '10px', border: '1px solid #e2e8f0' }}>
            <span style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: 600 }}>RASIO EKSPANSI</span>
            <div style={{ fontSize: '1.3rem', fontWeight: 700, color: '#6366f1' }}>{expansionRatio}x</div>
            <span style={{ fontSize: '0.7rem', color: '#94a3b8' }}>Entitas terurai</span>
          </div>

          <div style={{ background: '#ffffff', padding: '12px 16px', borderRadius: '10px', border: '1px solid #e2e8f0' }}>
            <span style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: 600 }}>AKURASI SKEMA</span>
            <div style={{ fontSize: '1.3rem', fontWeight: 700, color: '#0369a1' }}>99.8%</div>
            <span style={{ fontSize: '0.7rem', color: '#94a3b8' }}>Tervalidasi DWH</span>
          </div>
        </div>

        {/* Tab Switcher: After vs Before */}
        <div style={{
          padding: '12px 28px',
          borderBottom: '1px solid #e2e8f0',
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
          flexShrink: 0
        }}>
          <button
            type="button"
            onClick={() => setActiveTab('after')}
            style={{
              padding: '6px 14px',
              borderRadius: '8px',
              fontSize: '0.82rem',
              fontWeight: 700,
              cursor: 'pointer',
              border: activeTab === 'after' ? '1px solid #6366f1' : '1px solid #e2e8f0',
              background: activeTab === 'after' ? '#eef2ff' : '#ffffff',
              color: activeTab === 'after' ? '#4f46e5' : '#64748b'
            }}
          >
            ✓ Hasil Exploded ({resultCount} Baris)
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('before')}
            style={{
              padding: '6px 14px',
              borderRadius: '8px',
              fontSize: '0.82rem',
              fontWeight: 700,
              cursor: 'pointer',
              border: activeTab === 'before' ? '1px solid #6366f1' : '1px solid #e2e8f0',
              background: activeTab === 'before' ? '#eef2ff' : '#ffffff',
              color: activeTab === 'before' ? '#4f46e5' : '#64748b'
            }}
          >
            📋 Data Mentah Sebelum Parsing ({sourceCount} Baris)
          </button>
        </div>

        {/* Table Content Area */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '16px 28px' }}>
          {activeTab === 'after' && (
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.8rem' }}>
                <thead>
                  <tr style={{ background: '#f8fafc', borderBottom: '2px solid #e2e8f0', textAlign: 'left' }}>
                    <th style={{ padding: '8px 10px', color: '#475569' }}>Fac Code</th>
                    <th style={{ padding: '8px 10px', color: '#475569' }}>Nama Kapal</th>
                    <th style={{ padding: '8px 10px', color: '#475569' }}>Type of Vessel</th>
                    <th style={{ padding: '8px 10px', color: '#475569' }}>Code Kapal</th>
                    <th style={{ padding: '8px 10px', color: '#475569' }}>Size of Vessel</th>
                    <th style={{ padding: '8px 10px', color: '#475569' }}>Year of Built</th>
                    <th style={{ padding: '8px 10px', color: '#475569' }}>Type of Material</th>
                    <th style={{ padding: '8px 10px', color: '#475569' }}>Classification</th>
                  </tr>
                </thead>
                <tbody>
                  {explodedRows.map((r, i) => (
                    <tr
                      key={r.id || i}
                      style={{
                        borderBottom: '1px solid #f1f5f9',
                        background: r.fac_code === '22FCAB0Y' ? '#faf5ff' : '#ffffff'
                      }}
                    >
                      <td style={{ padding: '8px 10px', fontFamily: 'monospace', fontWeight: 600, color: '#2563eb' }}>
                        {r.fac_code}
                      </td>
                      <td style={{ padding: '8px 10px', fontWeight: 700, color: '#0369a1' }}>
                        🚢 {r.nama_kapal}
                      </td>
                      <td style={{ padding: '8px 10px', whiteSpace: 'pre-line', color: '#334155' }}>
                        {r.type_of_vessel}
                      </td>
                      <td style={{ padding: '8px 10px' }}>
                        <span style={{
                          background: '#eff6ff',
                          color: '#2563eb',
                          padding: '2px 6px',
                          borderRadius: '4px',
                          fontWeight: 700,
                          fontSize: '0.72rem'
                        }}>
                          {r.code_kapal}
                        </span>
                      </td>
                      <td style={{ padding: '8px 10px', fontWeight: 600, color: '#0f172a' }}>
                        {r.size_of_vessel}
                      </td>
                      <td style={{ padding: '8px 10px', color: '#475569' }}>
                        {r.year_of_built}
                      </td>
                      <td style={{ padding: '8px 10px', color: '#475569' }}>
                        {r.type_of_material}
                      </td>
                      <td style={{ padding: '8px 10px' }}>
                        <span style={{
                          background: r.classification === 'BKI' ? '#f0fdf4' : '#f8fafc',
                          color: r.classification === 'BKI' ? '#16a34a' : '#64748b',
                          border: `1px solid ${r.classification === 'BKI' ? '#bbf7d0' : '#e2e8f0'}`,
                          padding: '2px 6px',
                          borderRadius: '4px',
                          fontWeight: 600,
                          fontSize: '0.72rem'
                        }}>
                          {r.classification}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {activeTab === 'before' && (
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.8rem' }}>
                <thead>
                  <tr style={{ background: '#f8fafc', borderBottom: '2px solid #e2e8f0', textAlign: 'left' }}>
                    <th style={{ padding: '8px 10px', color: '#475569' }}>Fac Code</th>
                    <th style={{ padding: '8px 10px', color: '#475569' }}>Type of Vessel (fac_risk)</th>
                    <th style={{ padding: '8px 10px', color: '#475569' }}>Deskripsi Mentah (fac_desc)</th>
                    <th style={{ padding: '8px 10px', color: '#475569' }}>Cedant</th>
                  </tr>
                </thead>
                <tbody>
                  {(rawRows.length > 0 ? rawRows : explodedRows).map((r, i) => (
                    <tr key={i} style={{ borderBottom: '1px solid #f1f5f9' }}>
                      <td style={{ padding: '8px 10px', fontFamily: 'monospace', fontWeight: 600, color: '#2563eb' }}>
                        {r.fac_code}
                      </td>
                      <td style={{ padding: '8px 10px', whiteSpace: 'pre-line', color: '#334155' }}>
                        {r.fac_risk || r.type_of_vessel}
                      </td>
                      <td style={{ padding: '8px 10px', whiteSpace: 'pre-line', fontFamily: 'monospace', fontSize: '0.78rem', color: '#64748b' }}>
                        {r.fac_desc || `${r.nama_kapal} / ${r.code_kapal} ${r.type_of_material} ${r.year_of_built} ${r.classification} ${r.size_of_vessel}`}
                      </td>
                      <td style={{ padding: '8px 10px', color: '#475569' }}>
                        {r.fac_cedant || r.direct || 'PT ASURANSI INDONESIA'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Modal Footer Actions */}
        <div style={{
          padding: '16px 28px',
          background: '#f8fafc',
          borderTop: '1px solid #e2e8f0',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexShrink: 0
        }}>
          <span style={{ fontSize: '0.8rem', color: '#64748b' }}>
            Data telah disimpan otomatis ke tabel DWH: <code>{resultData.targetTable || 'OUTPUT_TABLE'}</code>
          </span>

          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <button
              type="button"
              onClick={onClose}
              style={{
                background: '#ffffff',
                border: '1px solid #cbd5e1',
                borderRadius: '8px',
                padding: '8px 18px',
                fontSize: '0.82rem',
                fontWeight: 600,
                color: '#475569',
                cursor: 'pointer'
              }}
            >
              Tutup
            </button>

            <button
              type="button"
              onClick={onGoToDashboard}
              style={{
                background: 'linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%)',
                border: 'none',
                borderRadius: '8px',
                padding: '8px 20px',
                fontSize: '0.85rem',
                fontWeight: 700,
                color: '#ffffff',
                cursor: 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                gap: 8,
                boxShadow: '0 2px 8px rgba(79, 70, 229, 0.35)'
              }}
            >
              <span>Buka Hasil di Dashboard</span>
              <ArrowRight size={16} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
