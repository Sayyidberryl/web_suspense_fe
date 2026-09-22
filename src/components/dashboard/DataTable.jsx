import React, { useState, useEffect, useRef } from 'react';
import { Database, ChevronLeft, ChevronRight, CheckCircle2 } from 'lucide-react';

// Exact 24 columns for MH - Data Loss PLA and MH - Data Loss SLA (from data_mh_loss_os_pla.xlsx & data_mh_loss_settled.xlsx)
export const LOSS_PLA_COLUMNS = [
  { key: 'fac_code', label: 'Fac Code', bold: true },
  { key: 'reff_number', label: 'Reff Number' },
  { key: 'direct', label: 'Direct' },
  { key: 'broker', label: 'Broker' },
  { key: 'nama_tertanggung', label: 'Nama Tertanggung' },
  { key: 'afiliasi_tertanggung', label: 'Afiliasi Tertanggung' },
  { key: 'nama_tertanngung_loss', label: 'Nama Tertanngung yang Loss' },
  { key: 'nama_kapal', label: 'Nama Kapal', isVessel: true },
  { key: 'type_of_vessel', label: 'Type of Vessel' },
  { key: 'code_kapal', label: 'Code Kapal', isCode: true },
  { key: 'size_of_vessel', label: 'Size of Vessel' },
  { key: 'year_of_built', label: 'Year of Built' },
  { key: 'type_of_material', label: 'Type of Material' },
  { key: 'classification', label: 'Classification' },
  { key: 'flag', label: 'Flag' },
  { key: 'last_docking_date', label: 'Last Docking Date' },
  { key: 'jenis_muatan', label: 'Jenis Muatan' },
  { key: 'riu_share', label: 'RIU Share' },
  { key: 'date_of_loss', label: 'Date of Loss or UW Year' },
  { key: 'currency', label: 'Currency' },
  { key: 'loss_amount', label: 'OUR LOSS Amount', isAmount: true },
  { key: 'loss_cause', label: 'Cause of Loss' },
  { key: 'loss_detail', label: 'LOSS DETAIL' },
  { key: 'settled_or_os', label: 'Settled or OS' }
];

// Exact 29 columns for MH - Data Akseptasi (from data_mh_akseptasi.xlsx)
export const AKSEPTASI_COLUMNS = [
  { key: 'fac_code', label: 'Fac Code', bold: true },
  { key: 'reff_number', label: 'Reff Number' },
  { key: 'direct', label: 'Direct' },
  { key: 'broker', label: 'Broker' },
  { key: 'nama_tertanggung', label: 'Nama Tertanggung' },
  { key: 'afiliasi_tertanggung', label: 'Afiliasi Tertanggung' },
  { key: 'coverage', label: 'Coverage' },
  { key: 'start_date', label: 'Start Date' },
  { key: 'end_date', label: 'End Date' },
  { key: 'acceptance_status', label: 'Acceptance Status' },
  { key: 'nama_kapal', label: 'Nama Kapal', isVessel: true },
  { key: 'type_of_vessel', label: 'Type of Vessel' },
  { key: 'code_kapal', label: 'Code Kapal', isCode: true },
  { key: 'size_of_vessel', label: 'Size of Vessel' },
  { key: 'year_of_built', label: 'Year of Built' },
  { key: 'type_of_material', label: 'Type of Material' },
  { key: 'classification', label: 'Classification' },
  { key: 'flag', label: 'Flag' },
  { key: 'last_docking_date', label: 'Last Docking Date' },
  { key: 'jenis_muatan', label: 'Jenis Muatan' },
  { key: 'trading_area', label: 'Trading Area' },
  { key: 'currency', label: 'Currency' },
  { key: 'insured_value', label: 'Insured value', isAmount: true },
  { key: 'premium_rate', label: 'Premium Rate' },
  { key: 'premium_amount', label: 'Premium Amount', isAmount: true },
  { key: 'ric', label: 'RIC' },
  { key: 'riu_share', label: 'RIU Share' },
  { key: 'riu_gross_premium', label: 'RIU Gross Premium', isAmount: true },
  { key: 'riu_net_premium', label: 'RIU Net Premium', isAmount: true }
];

export default function DataTable({
  data = [],
  loading = false,
  activeTab = 'loss_pla',
  pagination = { page: 1, limit: 12, total: 0, totalPages: 1, isAll: false },
  onPageChange,
  onLimitChange
}) {
  const isAllMode = pagination.isAll || pagination.limit >= 1000;
  const CHUNK_SIZE = 50;

  // Choose the column set matching the active tab
  const columns = activeTab === 'acceptance' ? AKSEPTASI_COLUMNS : LOSS_PLA_COLUMNS;

  // Progressive rendering state when "Tampilkan Semua" is selected
  const [renderedCount, setRenderedCount] = useState(CHUNK_SIZE);
  const bottomSentinelRef = useRef(null);

  // Reset rendered count when data, tab, or limit changes
  useEffect(() => {
    setRenderedCount(CHUNK_SIZE);
  }, [data, isAllMode, activeTab]);

  // Progressive timer: systematically render chunks of 50 data without UI thread blocking
  useEffect(() => {
    if (!isAllMode) return;
    if (renderedCount < data.length) {
      const timer = setTimeout(() => {
        setRenderedCount((prev) => Math.min(prev + CHUNK_SIZE, data.length));
      }, 50);
      return () => clearTimeout(timer);
    }
  }, [isAllMode, renderedCount, data.length]);

  // Infinite scroll trigger via IntersectionObserver for instant chunk loading on scroll
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

    if (col.isAmount) {
      const num = Number(val);
      if (!isNaN(num) && num !== 0) {
        const curr = row.currency || 'IDR';
        return <span style={{ fontWeight: 600, color: '#0f172a' }}>{curr} {num.toLocaleString('id-ID')}</span>;
      }
    }

    if (col.isCode) {
      return (
        <span style={{
          background: '#f1f5f9',
          padding: '2px 6px',
          borderRadius: '4px',
          fontSize: '0.75rem',
          fontFamily: 'monospace',
          color: '#334155'
        }}>
          {val}
        </span>
      );
    }

    if (col.isVessel) {
      return <span style={{ fontWeight: 600, color: '#1e3a8a' }}>{val}</span>;
    }

    if (col.bold) {
      return <span style={{ fontWeight: 600, color: '#0f172a' }}>{val}</span>;
    }

    return <span>{String(val)}</span>;
  };

  const tableTitleMap = {
    acceptance: 'Data Akseptasi',
    loss_pla: 'Data Loss PLA',
    loss_sla: 'Data Loss SLA',
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
            Menyiapkan tampilan {tableTitleMap[activeTab] || activeTab}
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
        <table className="fac-table" style={{ minWidth: columns.length * 140 }}>
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
                <td colSpan={columns.length + 1} style={{ padding: '56px 24px', textAlign: 'center' }}>
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12 }}>
                    <div style={{
                      width: 52,
                      height: 52,
                      borderRadius: '50%',
                      background: '#f8fafc',
                      border: '1px solid #e2e8f0',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: '#94a3b8'
                    }}>
                      <Database size={24} />
                    </div>
                    <div style={{ fontSize: '0.98rem', fontWeight: 600, color: '#334155' }}>
                      Tidak Ada Data yang Tersedia
                    </div>
                    <p style={{ fontSize: '0.85rem', color: '#64748b', maxWidth: 460, lineHeight: 1.5 }}>
                      Saat ini belum terdapat catatan data pada tabel <strong>{tableTitleMap[activeTab] || activeTab}</strong> yang sesuai dengan kriteria filter.
                    </p>
                  </div>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Dynamic Pagination & Progressive Row Render Bar */}
      <div className="history-pagination-bar" style={{ marginTop: 16 }}>
        <div className="pagination-left">
          {isAllMode ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
              <span>
                Menampilkan <strong>{Math.min(renderedCount, data.length).toLocaleString('id-ID')}</strong> dari <strong>{data.length.toLocaleString('id-ID')}</strong> data
              </span>
              {renderedCount < data.length ? (
                <span className="progressive-render-badge">
                  <span className="chunk-pulse-dot" />
                  Memuat ({Math.min(renderedCount, data.length).toLocaleString('id-ID')} / {data.length.toLocaleString('id-ID')})
                </span>
              ) : (
                <span className="progressive-render-badge complete">
                  <CheckCircle2 size={13} />
                  Seluruh {data.length.toLocaleString('id-ID')} data siap ditampilkan
                </span>
              )}
            </div>
          ) : (
            <span>
              Menampilkan <strong>{startRecord.toLocaleString('id-ID')} - {endRecord.toLocaleString('id-ID')}</strong> dari <strong>{pagination.total.toLocaleString('id-ID')}</strong> data
            </span>
          )}

          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <span>Tampilkan:</span>
            <select
              className="per-page-select"
              value={isAllMode ? 'all' : pagination.limit}
              onChange={(e) => onLimitChange && onLimitChange(e.target.value)}
            >
              <option value="10">10 per halaman</option>
              <option value="12">12 per halaman</option>
              <option value="25">25 per halaman</option>
              <option value="50">50 per halaman</option>
              <option value="100">100 per halaman</option>
              <option value="all">Tampilkan Semua</option>
            </select>
          </div>
        </div>

        {isAllMode ? (
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            {renderedCount < data.length && (
              <button
                type="button"
                className="btn-render-chunk"
                onClick={() => setRenderedCount((prev) => Math.min(prev + CHUNK_SIZE, data.length))}
                title="Tampilkan 50 baris selanjutnya"
              >
                + Tampilkan 50 Lagi
              </button>
            )}
          </div>
        ) : (
          <div className="pagination-numbers">
            <button
              className="page-btn"
              disabled={pagination.page <= 1}
              onClick={() => onPageChange && onPageChange(pagination.page - 1)}
            >
              <ChevronLeft size={14} />
            </button>
            
            <span style={{ fontSize: '0.85rem', fontWeight: 600, padding: '0 8px', color: '#334155' }}>
              Halaman {pagination.page} dari {pagination.totalPages || 1}
            </span>

            <button
              className="page-btn"
              disabled={pagination.page >= pagination.totalPages}
              onClick={() => onPageChange && onPageChange(pagination.page + 1)}
            >
              <ChevronRight size={14} />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
