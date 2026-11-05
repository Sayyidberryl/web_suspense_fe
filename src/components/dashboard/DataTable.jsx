import React, { useState, useEffect, useMemo, useRef } from 'react';
import { Database, ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from 'lucide-react';

/**
 * Dynamic DataTable Component
 * 100% Dynamic: Column definitions are read from data/metadata props at runtime.
 * Zero hardcoded columns.
 * Supports server-side pagination with configurable page size (default 50 rows).
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
  pagination = { page: 1, limit: 50, total: 0, totalPages: 1 },
  onPageChange,
  onLimitChange
}) {
  const tableTopRef = useRef(null);

  // Synchronize local page input with active page prop
  const currentPage = pagination.page || 1;
  const currentLimit = pagination.limit || 50;
  const totalRecords = pagination.total || 0;
  const totalPages = Math.max(1, pagination.totalPages || Math.ceil((totalRecords || 1) / currentLimit));

  const [pageInput, setPageInput] = useState(currentPage);

  useEffect(() => {
    setPageInput(currentPage);
  }, [currentPage]);

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

  const handlePageChangeInternal = (newPage) => {
    const target = Math.max(1, Math.min(newPage, totalPages));
    if (target !== currentPage && onPageChange) {
      onPageChange(target);
      if (tableTopRef.current) {
        tableTopRef.current.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
      }
    }
  };

  const handlePageInputSubmit = () => {
    const parsed = parseInt(pageInput, 10);
    if (!isNaN(parsed) && parsed >= 1 && parsed <= totalPages) {
      handlePageChangeInternal(parsed);
    } else {
      setPageInput(currentPage);
    }
  };

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

  const startRecord = totalRecords > 0 ? (currentPage - 1) * currentLimit + 1 : 0;
  const endRecord = totalRecords > 0 ? Math.min(currentPage * currentLimit, totalRecords) : data.length;

  return (
    <div className="table-card-container" ref={tableTopRef} style={{ display: 'flex', flexDirection: 'column' }}>
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
                    Mengambil {currentLimit} baris untuk tabel: <strong>{activeTab}</strong>
                  </span>
                </td>
              </tr>
            ) : data.length > 0 ? (
              data.map((row, i) => (
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
              ))
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

      {/* Corporate Server-side Pagination Footer */}
      <div className="table-pagination-footer" style={{ borderTop: '1px solid #e2e8f0', background: '#ffffff', padding: '10px 18px' }}>
        {/* Left: Rows per page selector and item range info */}
        <div className="pagination-left" style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
          <div className="pagination-limit-selector" style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <span style={{ fontSize: '0.82rem', color: '#64748b', fontWeight: 500 }}>Baris:</span>
            <select
              className="limit-select"
              value={currentLimit}
              onChange={(e) => onLimitChange && onLimitChange(Number(e.target.value))}
              disabled={loading}
              style={{
                border: '1px solid #cbd5e1',
                borderRadius: '5px',
                padding: '4px 8px',
                fontSize: '0.82rem',
                fontWeight: 600,
                color: '#1e293b',
                background: '#f8fafc',
                cursor: 'pointer'
              }}
            >
              <option value={25}>25 / hal</option>
              <option value={50}>50 / hal</option>
              <option value={100}>100 / hal</option>
              <option value={200}>200 / hal</option>
            </select>
          </div>

          <div className="pagination-info" style={{ fontSize: '0.82rem', color: '#64748b' }}>
            Menampilkan <strong style={{ color: '#0f172a' }}>{startRecord.toLocaleString('id-ID')}</strong> – <strong style={{ color: '#0f172a' }}>{endRecord.toLocaleString('id-ID')}</strong> dari <strong style={{ color: '#0f172a' }}>{totalRecords.toLocaleString('id-ID')}</strong> baris
          </div>
        </div>

        {/* Right: Page Navigation Buttons */}
        <div className="pagination-right" style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <button
            type="button"
            className="btn-page-nav"
            onClick={() => handlePageChangeInternal(1)}
            disabled={currentPage <= 1 || loading}
            title="Halaman Pertama"
            style={{ padding: '5px 8px', display: 'flex', alignItems: 'center' }}
          >
            <ChevronsLeft size={16} />
          </button>

          <button
            type="button"
            className="btn-page-nav"
            onClick={() => handlePageChangeInternal(currentPage - 1)}
            disabled={currentPage <= 1 || loading}
            title="Halaman Sebelumnya"
            style={{ padding: '5px 12px', display: 'flex', alignItems: 'center', gap: 4 }}
          >
            <ChevronLeft size={16} />
            <span>Prev</span>
          </button>

          {/* Quick Page Jump */}
          <div className="page-indicator" style={{ display: 'flex', alignItems: 'center', gap: 6, margin: '0 4px', fontSize: '0.82rem', color: '#475569' }}>
            <span>Hal.</span>
            <input
              type="number"
              min={1}
              max={totalPages}
              value={pageInput}
              onChange={(e) => setPageInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') handlePageInputSubmit();
              }}
              onBlur={handlePageInputSubmit}
              disabled={loading}
              style={{
                width: 58,
                textAlign: 'center',
                padding: '4px 6px',
                fontSize: '0.82rem',
                border: '1px solid #cbd5e1',
                borderRadius: '5px',
                fontWeight: 700,
                color: '#1e293b',
                background: '#ffffff'
              }}
            />
            <span>dari <strong>{totalPages.toLocaleString('id-ID')}</strong></span>
          </div>

          <button
            type="button"
            className="btn-page-nav"
            onClick={() => handlePageChangeInternal(currentPage + 1)}
            disabled={currentPage >= totalPages || loading}
            title="Halaman Berikutnya"
            style={{ padding: '5px 12px', display: 'flex', alignItems: 'center', gap: 4 }}
          >
            <span>Next</span>
            <ChevronRight size={16} />
          </button>

          <button
            type="button"
            className="btn-page-nav"
            onClick={() => handlePageChangeInternal(totalPages)}
            disabled={currentPage >= totalPages || loading}
            title="Halaman Terakhir"
            style={{ padding: '5px 8px', display: 'flex', alignItems: 'center' }}
          >
            <ChevronsRight size={16} />
          </button>
        </div>
      </div>
    </div>
  );
}
