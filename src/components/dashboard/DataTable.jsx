import React, { useState, useEffect, useRef, useMemo } from 'react';
import { Database, ChevronLeft, ChevronRight, CheckCircle2 } from 'lucide-react';

/**
 * Dynamic DataTable Component
 * 100% Dynamic: Column definitions are read from data/metadata props at runtime.
 * Zero hardcoded columns.
 */

// Helper to generate dynamic columns from a sample row if no metadata provided
const generateColumnsFromData = (sampleRow) => {
  if (!sampleRow || typeof sampleRow !== 'object') return [];
  return Object.keys(sampleRow)
    .filter((k) => k.toLowerCase() !== 'id')
    .map((k) => {
      const isAmt = /(amount|sum_insured|value|premium|totsi|our_amt)/i.test(k);
      const isDate = /(date|created_at)/i.test(k);
      const isCd = /(code|reff|id|no)/i.test(k);
      const isVes = /(vessel|kapal)/i.test(k);
      return {
        key: k,
        label: k.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase()),
        dataType: isAmt ? 'NUMERIC' : isDate ? 'DATE' : 'TEXT',
        isAmount: isAmt,
        isDate,
        isCode: isCd,
        isVessel: isVes,
        bold: k === 'fac_code' || k === 'nama_kapal'
      };
    });
};

export default function DataTable({
  data = [],
  columns: propColumns = [],
  loading = false,
  activeTab = 'acceptance',
  pagination = { page: 1, limit: 12, total: 0, totalPages: 1, isAll: false },
  onPageChange,
  onLimitChange
}) {
  const isAllMode = pagination.isAll || pagination.limit >= 1000;
  const CHUNK_SIZE = 50;

  // Resolve dynamic columns: priority to props from runtime API, fallback to auto-inferred
  const columns = useMemo(() => {
    if (propColumns && propColumns.length > 0) {
      return propColumns;
    }
    if (data && data.length > 0) {
      return generateColumnsFromData(data[0]);
    }
    return [];
  }, [propColumns, data]);

  // Progressive rendering state when "Tampilkan Semua" is selected
  const [renderedCount, setRenderedCount] = useState(CHUNK_SIZE);
  const bottomSentinelRef = useRef(null);

  // Reset rendered count when data or tab changes
  useEffect(() => {
    setRenderedCount(CHUNK_SIZE);
  }, [data, isAllMode, activeTab]);

  // Progressive timer: render chunks of 50 rows smoothly
  useEffect(() => {
    if (!isAllMode) return;
    if (renderedCount < data.length) {
      const timer = setTimeout(() => {
        setRenderedCount((prev) => Math.min(prev + CHUNK_SIZE, data.length));
      }, 50);
      return () => clearTimeout(timer);
    }
  }, [isAllMode, renderedCount, data.length]);

  // Infinite scroll trigger via IntersectionObserver
  useEffect(() => {
    if (!isAllMode || renderedCount >= data.length) return;
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          setRenderedCount((prev) => Math.min(prev + CHUNK_SIZE, data.length));
        }
      },
      { rootMargin: '250px' }
    );
    if (bottomSentinelRef.current) {
      observer.observe(bottomSentinelRef.current);
    }
    return () => observer.disconnect();
  }, [isAllMode, renderedCount, data.length]);

  const renderCellValue = (row, col) => {
    let val = row[col.key];

    // Fallbacks for equivalent DB column names if any
    if (val === undefined || val === null || val === '') {
      if (col.key === 'settled_or_os') val = row.status;
      else if (col.key === 'insured_value') val = row.sum_insured;
      else if (col.key === 'acceptance_status') val = row.status;
      else if (col.key === 'premium_amount') val = row.loss_amount;
    }

    if (val === undefined || val === null || val === '' || val === 'nan' || val === 'NaN' || val === 'None') {
      return <span style={{ color: '#94a3b8' }}>-</span>;
    }

    // Amount formatting
    if (col.isAmount || /(amount|sum_insured|value|premium|totsi|our_amt)/i.test(col.key)) {
      const num = Number(val);
      if (!isNaN(num) && num !== 0) {
        const curr = row.currency || 'IDR';
        return <span style={{ fontWeight: 600, color: '#0f172a' }}>{curr} {num.toLocaleString('id-ID')}</span>;
      }
    }

    // Code pill formatting
    if (col.isCode || col.key === 'code_kapal' || col.key === 'fac_code') {
      return (
        <span style={{
          background: '#f1f5f9',
          padding: '2px 8px',
          borderRadius: '4px',
          fontSize: '0.78rem',
          fontFamily: 'monospace',
          fontWeight: 600,
          color: '#2563eb',
          border: '1px solid #e2e8f0'
        }}>
          {val}
        </span>
      );
    }

    // Vessel Name formatting
    if (col.isVessel || col.key === 'nama_kapal') {
      return (
        <span style={{ fontWeight: 700, color: '#0369a1', display: 'inline-flex', alignItems: 'center', gap: 4 }}>
          <span>🚢</span>
          <span>{val}</span>
        </span>
      );
    }

    // Status pill
    if (col.key === 'status' || col.key === 'acceptance_status' || col.key === 'settled_or_os') {
      const isSettled = String(val).toLowerCase().includes('settled') || String(val).toLowerCase().includes('dimuat');
      return (
        <span style={{
          background: isSettled ? '#f0fdf4' : '#eff6ff',
          color: isSettled ? '#16a34a' : '#2563eb',
          border: `1px solid ${isSettled ? '#bbf7d0' : '#bfdbfe'}`,
          padding: '2px 8px',
          borderRadius: '12px',
          fontSize: '0.72rem',
          fontWeight: 600
        }}>
          {val}
        </span>
      );
    }

    if (col.bold) {
      return <span style={{ fontWeight: 600, color: '#0f172a' }}>{val}</span>;
    }

    return <span>{String(val)}</span>;
  };

  if (loading) {
    return (
      <div className="table-card-container">
        <div style={{ padding: '64px 20px', textAlign: 'center' }}>
          <div className="corporate-spinner" style={{ margin: '0 auto 16px' }} />
          <div style={{ fontSize: '1.05rem', fontWeight: 600, color: '#1e293b', marginBottom: 6 }}>
            Memuat Data...
          </div>
          <span style={{ fontSize: '0.85rem', color: '#64748b' }}>
            Menyiapkan struktur kolom dinamis runtime untuk tabel: <strong>{activeTab}</strong>
          </span>
        </div>
      </div>
    );
  }

  const displayedRows = isAllMode ? data.slice(0, renderedCount) : data;
  const startRecord = pagination.total === 0 ? 0 : (pagination.page - 1) * pagination.limit + 1;
  const endRecord = Math.min(pagination.page * pagination.limit, pagination.total);

  return (
    <div className="table-card-container">
      <div className="table-responsive-wrapper" style={{ overflowX: 'auto', width: '100%' }}>
        <table className="fac-table" style={{ minWidth: Math.max(900, columns.length * 140) }}>
          <thead>
            <tr>
              <th style={{ width: 40, textAlign: 'center' }}>
                <div className="row-checkbox" />
              </th>
              {columns.map((col) => (
                <th key={col.key} style={{ whiteSpace: 'nowrap' }}>
                  {col.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {displayedRows.length > 0 ? (
              <>
                {displayedRows.map((row, i) => (
                  <tr key={row.id || i}>
                    <td style={{ textAlign: 'center' }}>
                      <div className="row-checkbox" />
                    </td>
                    {columns.map((col) => (
                      <td key={col.key} style={{ whiteSpace: 'nowrap' }}>
                        {renderCellValue(row, col)}
                      </td>
                    ))}
                  </tr>
                ))}
                {isAllMode && renderedCount < data.length && (
                  <tr ref={bottomSentinelRef}>
                    <td colSpan={columns.length + 1} style={{ padding: '14px', textAlign: 'center', background: '#f8fafc' }}>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 12, fontSize: '0.82rem', color: '#2563eb' }}>
                        <span className="chunk-pulse-dot" />
                        <span>
                          Sedang memproses tampilan (<strong>{displayedRows.length.toLocaleString('id-ID')}</strong> dari <strong>{data.length.toLocaleString('id-ID')}</strong> baris siap)...
                        </span>
                        <button
                          type="button"
                          className="btn-render-chunk"
                          onClick={() => setRenderedCount((prev) => Math.min(prev + CHUNK_SIZE, data.length))}
                        >
                          + Tampilkan 50 Lagi
                        </button>
                      </div>
                    </td>
                  </tr>
                )}
              </>
            ) : (
              <tr>
                <td colSpan={Math.max(1, columns.length + 1)} style={{ padding: '56px 24px', textAlign: 'center' }}>
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12 }}>
                    <div style={{
                      width: 52,
                      height: 52,
                      borderRadius: '50%',
                      background: '#f8fafc',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      border: '1px solid #e2e8f0',
                      color: '#94a3b8'
                    }}>
                      <Database size={24} />
                    </div>
                    <div>
                      <h4 style={{ margin: 0, fontSize: '0.95rem', fontWeight: 600, color: '#334155' }}>
                        Tidak Ada Data Sesuai Filter
                      </h4>
                      <p style={{ margin: '4px 0 0 0', fontSize: '0.82rem', color: '#94a3b8' }}>
                        Tabel ini belum memiliki catatan data yang cocok atau belum di-load.
                      </p>
                    </div>
                  </div>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination Footer */}
      <div className="table-pagination-footer">
        <div className="pagination-left">
          <span className="pagination-info">
            Menampilkan <strong>{startRecord} - {endRecord}</strong> dari <strong>{pagination.total.toLocaleString('id-ID')}</strong> baris data
          </span>

          <div className="pagination-limit-selector" style={{ marginLeft: 16 }}>
            <span style={{ fontSize: '0.8rem', color: '#64748b' }}>Baris per halaman:</span>
            <select
              value={isAllMode ? 'all' : pagination.limit}
              onChange={(e) => onLimitChange(e.target.value)}
              className="limit-select"
            >
              <option value="12">12</option>
              <option value="25">25</option>
              <option value="50">50</option>
              <option value="all">Tampilkan Semua ({pagination.total})</option>
            </select>
          </div>
        </div>

        <div className="pagination-right">
          <button
            className="btn-page-nav"
            disabled={pagination.page <= 1}
            onClick={() => onPageChange(pagination.page - 1)}
            title="Halaman Sebelumnya"
          >
            <ChevronLeft size={16} />
            <span>Sebelumnya</span>
          </button>

          <span className="page-indicator">
            Halaman <strong>{pagination.page}</strong> dari <strong>{pagination.totalPages || 1}</strong>
          </span>

          <button
            className="btn-page-nav"
            disabled={pagination.page >= pagination.totalPages}
            onClick={() => onPageChange(pagination.page + 1)}
            title="Halaman Berikutnya"
          >
            <span>Berikutnya</span>
            <ChevronRight size={16} />
          </button>
        </div>
      </div>
    </div>
  );
}
