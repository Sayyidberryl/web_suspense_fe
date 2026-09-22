import React, { useState, useEffect, useRef } from 'react';
import { Database, AlertCircle, ChevronLeft, ChevronRight, CheckCircle2 } from 'lucide-react';

export default function DataTable({
  data = [],
  loading = false,
  activeTab = 'loss_pla',
  pagination = { page: 1, limit: 12, total: 0, totalPages: 1, isAll: false },
  onPageChange,
  onLimitChange
}) {
  const formatAmount = (val, curr = 'IDR') => {
    if (val === null || val === undefined || isNaN(val)) return '-';
    return `${curr} ${Number(val).toLocaleString('id-ID')}`;
  };

  const tableTitleMap = {
    acceptance: 'Data Akseptasi (FACUL_ETL_MH_AKSEPTASI)',
    loss_pla: 'Data Loss PLA (FACUL_ETL_MH_LOSS_PLA)',
    loss_sla: 'Data Loss SLA (FACUL_ETL_MH_LOSS_SETTLE)',
  };

  const isAllMode = pagination.isAll || pagination.limit >= 1000;
  const CHUNK_SIZE = 50;

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

  if (loading) {
    return (
      <div className="table-card-container">
        <div style={{ padding: '60px 20px', textAlign: 'center', color: '#64748b' }}>
          <div style={{ fontSize: '1.05rem', fontWeight: 600, color: '#1e293b', marginBottom: 6 }}>
            Memuat Data Real dari Supabase...
          </div>
          <span style={{ fontSize: '0.85rem' }}>Mengambil data PostgreSQL untuk tabel {tableTitleMap[activeTab] || activeTab}</span>
        </div>
      </div>
    );
  }

  const displayedRows = isAllMode ? data.slice(0, renderedCount) : data;
  const startRecord = pagination.total === 0 ? 0 : (pagination.page - 1) * pagination.limit + 1;
  const endRecord = Math.min(pagination.page * pagination.limit, pagination.total);

  return (
    <div className="table-card-container">
      <div className="table-responsive-wrapper">
        <table className="fac-table">
          <thead>
            <tr>
              <th style={{ width: 40, textAlign: 'center' }}>
                <div className="row-checkbox" />
              </th>
              <th>FAC Code</th>
              <th>Reff Number</th>
              <th>Direct / Cedant</th>
              <th>Tertanggung</th>
              <th>Nama Kapal</th>
              <th>Kode Kapal</th>
              <th>Nilai Pertanggungan</th>
              <th>Nilai Klaim</th>
              <th>Tgl Klaim</th>
              <th>Status</th>
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
                    <td style={{ fontWeight: 600, color: '#0f172a' }}>{row.fac_code || '-'}</td>
                    <td style={{ fontFamily: 'monospace', fontSize: '0.8rem', color: '#475569' }}>
                      {row.reff_number || '-'}
                    </td>
                    <td>{row.direct || '-'}</td>
                    <td>{row.nama_tertanggung_loss || row.nama_tertanggung || '-'}</td>
                    <td style={{ fontWeight: 600, color: '#1e3a8a' }}>{row.nama_kapal || '-'}</td>
                    <td>
                      <span style={{
                        background: '#f1f5f9',
                        padding: '2px 6px',
                        borderRadius: '4px',
                        fontSize: '0.75rem',
                        fontFamily: 'monospace'
                      }}>
                        {row.code_kapal || '-'}
                      </span>
                    </td>
                    <td>{formatAmount(row.sum_insured, row.currency)}</td>
                    <td style={{ fontWeight: 600, color: '#b91c1c' }}>
                      {formatAmount(row.loss_amount, row.currency)}
                    </td>
                    <td style={{ fontSize: '0.82rem', color: '#64748b' }}>{row.date_of_loss || '-'}</td>
                    <td>
                      <span style={{
                        display: 'inline-block',
                        padding: '3px 8px',
                        borderRadius: '12px',
                        fontSize: '0.72rem',
                        fontWeight: 600,
                        background: row.status === 'Settled' ? '#dcfce7' : row.status === 'In Review' ? '#fef3c7' : '#e0f2fe',
                        color: row.status === 'Settled' ? '#166534' : row.status === 'In Review' ? '#92400e' : '#0369a1'
                      }}>
                        {row.status || 'Active'}
                      </span>
                    </td>
                  </tr>
                ))}
                {isAllMode && renderedCount < data.length && (
                  <tr ref={bottomSentinelRef}>
                    <td colSpan={11} style={{ padding: '14px', textAlign: 'center', background: '#f8fafc' }}>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 12, fontSize: '0.82rem', color: '#2563eb' }}>
                        <span className="chunk-pulse-dot" />
                        <span>
                          Sedang merender bertahap per 50 data (<strong>{displayedRows.length}</strong> dari <strong>{data.length}</strong> baris siap)...
                        </span>
                        <button
                          type="button"
                          className="btn-render-chunk"
                          onClick={() => setRenderedCount((prev) => Math.min(prev + CHUNK_SIZE, data.length))}
                        >
                          + Render 50 Data Lagi
                        </button>
                      </div>
                    </td>
                  </tr>
                )}
              </>
            ) : (
              <tr>
                <td colSpan={11} style={{ padding: '48px 24px', textAlign: 'center' }}>
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10 }}>
                    <div style={{
                      width: 48,
                      height: 48,
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
                    <div style={{ fontSize: '0.95rem', fontWeight: 600, color: '#334155' }}>
                      Tidak Ada Data Pada Tabel Ini
                    </div>
                    <p style={{ fontSize: '0.82rem', color: '#64748b', maxWidth: 460 }}>
                      Tabel <strong>{tableTitleMap[activeTab] || activeTab}</strong> saat ini belum memiliki baris data di PostgreSQL Supabase. Anda dapat mengisi data melalui fitur <strong>Upload Berkas</strong>.
                    </p>
                  </div>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Real Dynamic Pagination & Progressive Row Render Bar */}
      <div className="history-pagination-bar" style={{ marginTop: 16 }}>
        <div className="pagination-left">
          {isAllMode ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
              <span>
                Menampilkan <strong>{Math.min(renderedCount, data.length)}</strong> dari <strong>{data.length}</strong> baris data
              </span>
              {renderedCount < data.length ? (
                <span className="progressive-render-badge">
                  <span className="chunk-pulse-dot" />
                  Merender per 50 data ({Math.min(renderedCount, data.length)}/{data.length})
                </span>
              ) : (
                <span className="progressive-render-badge complete">
                  <CheckCircle2 size={13} />
                  Semua ({data.length}) baris selesai dirender (per 50 data)
                </span>
              )}
            </div>
          ) : (
            <span>
              Menampilkan <strong>{startRecord} - {endRecord}</strong> dari <strong>{pagination.total}</strong> baris data real
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
              <option value="all">Tampilkan Semua (Render per 50)</option>
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
                title="Render 50 baris selanjutnya segera"
              >
                Render +50 Data
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
