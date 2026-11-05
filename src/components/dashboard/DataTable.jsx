import React, { useMemo, useRef, useEffect } from 'react';
import { Database } from 'lucide-react';

/**
 * Dynamic DataTable Component
 * 100% Dynamic: Column definitions are read from data/metadata props at runtime.
 * Zero hardcoded columns.
 * Clean minimalist design: Pure data rows with automatic background pagination (infinite scroll).
 * Zero pagination control bars or buttons cluttering the view.
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
  onLoadMore,
  hasMore = false,
  isLoadingMore = false,
}) {
  const sentinelRef = useRef(null);

  // Automatic infinite scroll in background: loads next 50 rows seamlessly 300px before reaching the end
  useEffect(() => {
    if (!hasMore || loading || isLoadingMore) return;
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && onLoadMore) {
          onLoadMore();
        }
      },
      { rootMargin: '300px' }
    );
    if (sentinelRef.current) {
      observer.observe(sentinelRef.current);
    }
    return () => observer.disconnect();
  }, [hasMore, loading, isLoadingMore, onLoadMore]);

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
      return <span style={{ fontWeight: 600, color: '#0369a1' }}>{val}</span>;
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

  return (
    <div className="table-card-container" style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      <div className="table-responsive-wrapper" style={{ overflowX: 'auto', width: '100%', flex: 1 }}>
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
            {loading ? (
              <tr>
                <td colSpan={Math.max(1, columns.length + 1)} style={{ padding: '56px 20px', textAlign: 'center' }}>
                  <div className="corporate-spinner" style={{ margin: '0 auto 16px' }} />
                  <div style={{ fontSize: '1.02rem', fontWeight: 600, color: '#1e293b', marginBottom: 4 }}>
                    Memuat Data...
                  </div>
                  <span style={{ fontSize: '0.82rem', color: '#64748b' }}>
                    Menyiapkan data tabel: <strong>{activeTab}</strong>
                  </span>
                </td>
              </tr>
            ) : data.length > 0 ? (
              <>
                {data.map((row, i) => (
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
                {/* Invisible sentinel for automatic background pagination */}
                {hasMore && (
                  <tr ref={sentinelRef} style={{ height: 1 }}>
                    <td colSpan={columns.length + 1} style={{ padding: 0, border: 'none', height: 1 }} />
                  </tr>
                )}
                {/* Subtle bottom indicator when fetching next batch */}
                {isLoadingMore && (
                  <tr>
                    <td colSpan={columns.length + 1} style={{ padding: '10px 16px', textAlign: 'center', background: '#f8fafc', color: '#64748b', fontSize: '0.78rem' }}>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
                        <span className="chunk-pulse-dot" />
                        <span>Memuat baris selanjutnya...</span>
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
                        Tabel ini belum memiliki catatan data yang cocok dengan kriteria filter.
                      </p>
                    </div>
                  </div>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
