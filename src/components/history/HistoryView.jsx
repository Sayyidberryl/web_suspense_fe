import React, { useState, useEffect, useCallback } from 'react';
import {
  Search,
  Calendar,
  RefreshCw,
  LayoutGrid,
  List,
  Clock,
  ChevronRight,
  AlertCircle,
  CheckCircle2,
  X
} from 'lucide-react';
import historyService from '../../services/historyService';
import '../../styles/history.css';

export default function HistoryView({ initialFileDetail = null }) {
  const [viewMode, setViewMode] = useState('card'); // 'card' or 'list' (user requested feature!)
  const [historyList, setHistoryList] = useState([]);
  const [loading, setLoading] = useState(false);
  const [totalCount, setTotalCount] = useState(48);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(9);
  const [totalPages, setTotalPages] = useState(6);

  // Filters
  const [search, setSearch] = useState('');
  const [cobFilter, setCobFilter] = useState('Semua Tipe COB');
  const [statusFilter, setStatusFilter] = useState('Status: Semua');

  // Detail modal state
  const [selectedFile, setSelectedFile] = useState(initialFileDetail);

  const fetchHistory = useCallback(async () => {
    setLoading(true);
    try {
      const res = await historyService.getHistory({
        search,
        cob: cobFilter,
        status: statusFilter,
        page,
        limit
      });
      setHistoryList(res.data || []);
      setTotalCount(res.total || 48);
      setTotalPages(res.totalPages || Math.ceil((res.total || 48) / limit));
    } catch (err) {
      console.error('Failed to load history:', err);
    } finally {
      setLoading(false);
    }
  }, [search, cobFilter, statusFilter, page, limit]);

  useEffect(() => {
    fetchHistory();
  }, [fetchHistory]);

  const getCobClass = (cob) => {
    if (!cob) return 'fire-property';
    const c = cob.toLowerCase();
    if (c.includes('fire') || c.includes('property')) return 'fire-property';
    if (c.includes('cargo') || c.includes('marine')) return 'marine-cargo';
    if (c.includes('engineer')) return 'engineering';
    if (c.includes('liability')) return 'liability';
    return 'fire-property';
  };

  const getStatusClass = (status) => {
    if (status === 'Berhasil Dimuat') return 'success';
    if (status === 'Proses Validasi') return 'warning';
    if (status === 'Gagal Skema') return 'danger';
    return 'success';
  };

  return (
    <div className="history-container">
      {/* Top Filter & Control Bar */}
      <div className="history-filter-bar">
        <div className="history-filter-left">
          {/* Search Input */}
          <div className="history-search-wrap">
            <Search size={15} />
            <input
              type="text"
              className="history-search-input"
              placeholder="Cari nama file, atau cedant..."
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
            />
          </div>

          {/* COB Dropdown */}
          <select
            className="filter-select"
            value={cobFilter}
            onChange={(e) => {
              setCobFilter(e.target.value);
              setPage(1);
            }}
          >
            <option value="Semua Tipe COB">Semua Kategori (COB)</option>
            <option value="Fire & Property">Fire & Property</option>
            <option value="Marine Cargo">Marine Cargo</option>
            <option value="Engineering">Engineering</option>
            <option value="Liability">Liability</option>
          </select>

          {/* Status Dropdown */}
          <select
            className="filter-select"
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter(e.target.value);
              setPage(1);
            }}
          >
            <option value="Status: Semua">Status: Semua</option>
            <option value="Berhasil Dimuat">Berhasil Dimuat</option>
            <option value="Proses Validasi">Proses Validasi</option>
            <option value="Gagal Skema">Gagal Skema</option>
          </select>

          {/* Date Range Button */}
          <button className="btn-filter-icon" onClick={() => alert('Fitur rentang waktu tanggal')}>
            <Calendar size={14} />
            <span>Rentang Waktu</span>
          </button>

          {/* Refresh Button */}
          <button
            className="btn-refresh-history"
            onClick={fetchHistory}
            title="Muat Ulang Riwayat"
          >
            <RefreshCw size={15} />
          </button>
        </div>

        {/* User Request: View Toggle Button (Card or List) */}
        <div className="view-toggle-group">
          <button
            className={`btn-view-toggle ${viewMode === 'card' ? 'active' : ''}`}
            onClick={() => setViewMode('card')}
            title="Tampilan Kartu"
          >
            <LayoutGrid size={14} />
            <span>Card</span>
          </button>
          <button
            className={`btn-view-toggle ${viewMode === 'list' ? 'active' : ''}`}
            onClick={() => setViewMode('list')}
            title="Tampilan Tabel / List"
          >
            <List size={14} />
            <span>List</span>
          </button>
        </div>
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: '60px 0', color: '#64748b' }}>
          Memuat riwayat berkas...
        </div>
      ) : historyList.length === 0 ? (
        <div style={{
          textAlign: 'center',
          padding: '60px 20px',
          background: '#ffffff',
          borderRadius: '14px',
          border: '1px solid #e5e7eb',
          color: '#64748b'
        }}>
          Tidak ada berkas yang cocok dengan kriteria filter.
        </div>
      ) : viewMode === 'card' ? (
        /* GRID CARD VIEW */
        <div className="history-cards-grid">
          {historyList.map((item) => {
            const statusClass = getStatusClass(item.status);
            const cobClass = getCobClass(item.cob);
            const isError = item.status === 'Gagal Skema';

            return (
              <div key={item.id} className="history-card">
                <div className="history-card-header">
                  <div className="file-pill-tag-group">
                    <span className="badge-tag-xlsx">{item.file_type || 'XLSX'}</span>
                    <span className="file-size-text">{item.file_size}</span>
                  </div>
                  <span className={`status-pill-badge ${statusClass}`}>
                    {item.status}
                  </span>
                </div>

                <h4 className="history-card-title">{item.file_name}</h4>
                <p className="history-card-cedant">Cedant: {item.cedant}</p>

                <div className="history-card-date-box">
                  <Clock size={13} />
                  <span>{item.date_display}</span>
                </div>

                <div className="history-card-footer">
                  <div className="cob-tag-wrapper">
                    <span>Kategori:</span>
                    <span className={`badge-cob ${cobClass}`}>{item.cob}</span>
                  </div>

                  <button
                    className={`btn-card-detail ${isError ? 'log-error' : ''}`}
                    onClick={() => setSelectedFile(item)}
                  >
                    <span>{isError ? 'Log Galat' : 'Detail'}</span>
                    <ChevronRight size={14} />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* LIST VIEW (User Request Feature!) */
        <div className="history-list-card">
          <table className="history-table">
            <thead>
              <tr>
                <th>Nama Berkas</th>
                <th>Cedant</th>
                <th>Kategori (COB)</th>
                <th>Ukuran</th>
                <th>Status</th>
                <th>Waktu Eksekusi</th>
                <th style={{ textAlign: 'right' }}>Aksi</th>
              </tr>
            </thead>
            <tbody>
              {historyList.map((item) => {
                const statusClass = getStatusClass(item.status);
                const cobClass = getCobClass(item.cob);
                const isError = item.status === 'Gagal Skema';

                return (
                  <tr key={item.id}>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <span className="badge-tag-xlsx">{item.file_type || 'XLSX'}</span>
                        <span style={{ fontWeight: 700, color: '#0f172a' }}>{item.file_name}</span>
                      </div>
                    </td>
                    <td style={{ color: '#475569' }}>{item.cedant}</td>
                    <td>
                      <span className={`badge-cob ${cobClass}`}>{item.cob}</span>
                    </td>
                    <td style={{ color: '#64748b' }}>{item.file_size}</td>
                    <td>
                      <span className={`status-pill-badge ${statusClass}`}>
                        {item.status}
                      </span>
                    </td>
                    <td style={{ color: '#64748b' }}>{item.date_display}</td>
                    <td style={{ textAlign: 'right' }}>
                      <button
                        className={`btn-card-detail ${isError ? 'log-error' : ''}`}
                        onClick={() => setSelectedFile(item)}
                        style={{ display: 'inline-flex' }}
                      >
                        <span>{isError ? 'Log Galat' : 'Detail'}</span>
                        <ChevronRight size={14} />
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* Pagination Bar */}
      <div className="history-pagination-bar">
        <div className="pagination-left">
          <span>
            Menampilkan <strong>{historyList.length > 0 ? (page - 1) * limit + 1 : 0} - {Math.min(page * limit, totalCount)}</strong> dari <strong>{totalCount}</strong> berkas
          </span>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <span>Tampilkan:</span>
            <select
              className="per-page-select"
              value={limit}
              onChange={(e) => {
                setLimit(Number(e.target.value));
                setPage(1);
              }}
            >
              <option value="6">6 per halaman</option>
              <option value="9">9 per halaman</option>
              <option value="12">12 per halaman</option>
              <option value="24">24 per halaman</option>
            </select>
          </div>
        </div>

        <div className="pagination-numbers">
          <button
            className="page-btn"
            disabled={page <= 1}
            onClick={() => setPage((p) => p - 1)}
          >
            &lt;
          </button>
          {Array.from({ length: Math.min(totalPages, 5) }).map((_, i) => {
            const pNum = i + 1;
            return (
              <button
                key={pNum}
                className={`page-btn ${page === pNum ? 'active' : ''}`}
                onClick={() => setPage(pNum)}
              >
                {pNum}
              </button>
            );
          })}
          {totalPages > 5 && <span style={{ padding: '0 4px', color: '#9ca3af' }}>...</span>}
          {totalPages > 5 && (
            <button
              className={`page-btn ${page === totalPages ? 'active' : ''}`}
              onClick={() => setPage(totalPages)}
            >
              {totalPages}
            </button>
          )}
          <button
            className="page-btn"
            disabled={page >= totalPages}
            onClick={() => setPage((p) => p + 1)}
          >
            &gt;
          </button>
        </div>
      </div>

      {/* Detail Modal / Log Galat Viewer */}
      {selectedFile && (
        <div className="modal-overlay" onClick={() => setSelectedFile(null)}>
          <div className="modal-content-card" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header-row">
              <div>
                <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: '#0f172a', marginBottom: 4 }}>
                  {selectedFile.status === 'Gagal Skema' ? 'Log Galat Skema Berkas' : 'Detail Eksekusi ETL'}
                </h3>
                <p style={{ fontSize: '0.85rem', color: '#64748b' }}>
                  {selectedFile.file_name}
                </p>
              </div>
              <button className="btn-close-modal" onClick={() => setSelectedFile(null)}>
                <X size={20} />
              </button>
            </div>

            <div className="detail-meta-grid">
              <div className="meta-item">
                <label>Cedant / Perusahaan</label>
                <span>{selectedFile.cedant}</span>
              </div>
              <div className="meta-item">
                <label>Kategori (COB)</label>
                <span>{selectedFile.cob}</span>
              </div>
              <div className="meta-item">
                <label>Status Eksekusi</label>
                <span style={{
                  color: selectedFile.status === 'Berhasil Dimuat' ? '#059669' : selectedFile.status === 'Gagal Skema' ? '#dc2626' : '#d97706'
                }}>
                  {selectedFile.status}
                </span>
              </div>
              <div className="meta-item">
                <label>Ukuran & Tipe Berkas</label>
                <span>{selectedFile.file_size} ({selectedFile.file_type || 'XLSX'})</span>
              </div>
              <div className="meta-item">
                <label>Jumlah Baris Data</label>
                <span>{(selectedFile.records_count || 48250).toLocaleString()} Baris</span>
              </div>
              <div className="meta-item">
                <label>Akurasi Skema</label>
                <span>{selectedFile.schema_accuracy || 99.8}%</span>
              </div>
            </div>

            <h4 style={{ fontSize: '0.85rem', fontWeight: 700, color: '#334155', marginBottom: 8 }}>
              Log Catatan Sistem
            </h4>
            <div className="log-box">
              {selectedFile.log_message ||
                `[${selectedFile.date_display}] Berkas berhasil diproses melalui pipeline ETL Indore. Schema mapping valid.`}
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10 }}>
              <button
                className="btn-secondary-action"
                onClick={() => setSelectedFile(null)}
              >
                Tutup
              </button>
              <button
                className="btn-primary-next"
                style={{ width: 'auto', padding: '8px 18px' }}
                onClick={() => {
                  alert(`Mengunduh laporan audit untuk ${selectedFile.file_name}`);
                  setSelectedFile(null);
                }}
              >
                Unduh Log Audit
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
