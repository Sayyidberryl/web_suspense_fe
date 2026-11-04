import React from 'react';
import { CheckCircle2, ArrowRight, X, Database, Table, Layers } from 'lucide-react';

export default function EtlResultPreviewModal({
  isOpen = false,
  onClose,
  onGoToDashboard,
  resultData = null,
}) {
  if (!isOpen || !resultData) return null;

  const totalInput = resultData.totalInput || 0;
  const totalOutput = resultData.totalOutput || totalInput;
  const targetTable = resultData.targetTable || resultData.newTable || 'ETL_OUTPUT_TABLE';

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      background: 'rgba(15, 23, 42, 0.65)',
      backdropFilter: 'blur(4px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 9999,
      padding: '20px'
    }}>
      <div style={{
        background: '#ffffff',
        borderRadius: '16px',
        width: '100%',
        maxWidth: '680px',
        display: 'flex',
        flexDirection: 'column',
        boxShadow: '0 20px 40px -8px rgba(0, 0, 0, 0.2)',
        overflow: 'hidden',
        border: '1px solid #e2e8f0'
      }}>
        {/* Modal Header */}
        <div style={{
          padding: '20px 24px',
          background: '#0f172a',
          color: '#ffffff',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexShrink: 0
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{
              width: 40,
              height: 40,
              borderRadius: '10px',
              background: '#059669',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <CheckCircle2 size={22} color="#ffffff" />
            </div>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <h3 style={{ margin: 0, fontSize: '1.15rem', fontWeight: 700, color: '#ffffff' }}>
                  Proses ETL Selesai
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
                  Sukses
                </span>
              </div>
              <p style={{ margin: '4px 0 0 0', fontSize: '0.82rem', color: '#94a3b8' }}>
                Data mentah berhasil diekstrak, dicocokkan, dan disimpan ke tabel Data Warehouse.
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

        {/* Metric Cards */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(3, 1fr)',
          gap: '14px',
          padding: '20px 24px',
          background: '#f8fafc',
          borderBottom: '1px solid #e2e8f0'
        }}>
          <div style={{ background: '#ffffff', padding: '14px 16px', borderRadius: '10px', border: '1px solid #e2e8f0' }}>
            <span style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: 600 }}>KODE FAC DIEKSTRAK</span>
            <div style={{ fontSize: '1.35rem', fontWeight: 700, color: '#0f172a', marginTop: 4 }}>{totalInput} Kode</div>
            <span style={{ fontSize: '0.72rem', color: '#64748b' }}>Dari berkas mentah</span>
          </div>

          <div style={{ background: '#ffffff', padding: '14px 16px', borderRadius: '10px', border: '1px solid #bbf7d0' }}>
            <span style={{ fontSize: '0.75rem', color: '#16a34a', fontWeight: 600 }}>BARIS DICOCOKKAN</span>
            <div style={{ fontSize: '1.35rem', fontWeight: 700, color: '#15803d', marginTop: 4 }}>{totalOutput} Baris</div>
            <span style={{ fontSize: '0.72rem', color: '#16a34a' }}>Tersimpan ke database</span>
          </div>

          <div style={{ background: '#ffffff', padding: '14px 16px', borderRadius: '10px', border: '1px solid #e2e8f0' }}>
            <span style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: 600 }}>STATUS INTEGRASI</span>
            <div style={{ fontSize: '1.35rem', fontWeight: 700, color: '#0369a1', marginTop: 4 }}>Tersimpan</div>
            <span style={{ fontSize: '0.72rem', color: '#64748b' }}>Tabel DWH Fisik</span>
          </div>
        </div>

        {/* Table Destination Info */}
        <div style={{ padding: '20px 24px', background: '#ffffff' }}>
          <div style={{
            background: '#f1f5f9',
            border: '1px solid #cbd5e1',
            borderRadius: '10px',
            padding: '14px 18px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <Database size={20} color="#0284c7" />
              <div>
                <span style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: 600, display: 'block' }}>
                  NAMA TABEL OUTPUT DWH
                </span>
                <code style={{ fontSize: '0.9rem', fontWeight: 700, color: '#0f172a' }}>
                  {targetTable}
                </code>
              </div>
            </div>
            <span style={{
              background: '#e0f2fe',
              color: '#0369a1',
              padding: '4px 10px',
              borderRadius: '6px',
              fontSize: '0.75rem',
              fontWeight: 700
            }}>
              Aktif
            </span>
          </div>
        </div>

        {/* Modal Footer Actions */}
        <div style={{
          padding: '16px 24px',
          background: '#f8fafc',
          borderTop: '1px solid #e2e8f0',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexShrink: 0
        }}>
          <span style={{ fontSize: '0.8rem', color: '#64748b' }}>
            Tabel siap diakses dan dianalisis di Dashboard.
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
                background: '#0f172a',
                border: 'none',
                borderRadius: '8px',
                padding: '8px 20px',
                fontSize: '0.85rem',
                fontWeight: 600,
                color: '#ffffff',
                cursor: 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                gap: 8
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
