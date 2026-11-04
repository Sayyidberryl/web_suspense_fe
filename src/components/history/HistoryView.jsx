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
  X,
  Pencil,
  Trash2
} from 'lucide-react';
import historyService from '../../services/historyService';
import '../../styles/history.css';

export default function HistoryView({ initialFileDetail = null }) {
  const [viewMode, setViewMode] = useState('card'); // 'card' or 'list'
  const [historyList, setHistoryList] = useState([]);
  const [loading, setLoading] = useState(false);
  const [totalCount, setTotalCount] = useState(0);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(9);
  const [totalPages, setTotalPages] = useState(1);

  // Filters
  const [search, setSearch] = useState('');
  const [cobFilter, setCobFilter] = useState('Semua Tipe COB');
  const [statusFilter, setStatusFilter] = useState('Status: Semua');

  // Detail modal state
  const [selectedFile, setSelectedFile] = useState(initialFileDetail);

  // Rename modal state
  const [editingItem, setEditingItem] = useState(null);
  const [editTitle, setEditTitle] = useState('');
  const [isUpdating, setIsUpdating] = useState(false);

  // Delete modal state
  const [deletingItem, setDeletingItem] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

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
      setTotalCount(res.total || 0);
      setTotalPages(res.totalPages || Math.max(1, Math.ceil((res.total || 0) / limit)));
    } catch (err) {
      console.error('Failed to load history:', err);
    } finally {
      setLoading(false);
    }
  }, [search, cobFilter, statusFilter, page, limit]);

  useEffect(() => {
    fetchHistory();
  }, [fetchHistory]);

  const handleStartEdit = (e, item) => {
    e.stopPropagation();
    setEditingItem(item);
    setEditTitle(item.file_name);
  };

  const handleSaveEdit = async () => {
    if (!editingItem || !editTitle.trim()) return;
    setIsUpdating(true);
    try {
      await historyService.updateHistory(editingItem.id, { file_name: editTitle.trim() });
      if (selectedFile && selectedFile.id === editingItem.id) {
        setSelectedFile((prev) => ({ ...prev, file_name: editTitle.trim() }));
      }
      setEditingItem(null);
      await fetchHistory();
    } catch (err) {
      alert('Gagal mengubah nama berkas: ' + err.message);
    } finally {
      setIsUpdating(false);
    }
  };

  const handleStartDelete = (e, item) => {
    e.stopPropagation();
    setDeletingItem(item);
  };

  const handleConfirmDelete = async () => {
    if (!deletingItem) return;
    setIsDeleting(true);
    try {
      await historyService.deleteHistory(deletingItem.id);
      if (selectedFile && selectedFile.id === deletingItem.id) {
        setSelectedFile(null);
      }
      setDeletingItem(null);
      await fetchHistory();
    } catch (err) {
      alert('Gagal menghapus riwayat: ' + err.message);
    } finally {
      setIsDeleting(false);
    }
  };

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
              placeholder="Cari nama berkas, atau cedant..."
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
            <option value="Marine Hull">Marine Hull</option>
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

          {/* Refresh Button */}
          <button
            className="btn-refresh-history"
            onClick={fetchHistory}
            title="Muat Ulang Riwayat"
          >
            <RefreshCw size={15} />
          </button>
        </div>

        {/* View Toggle Button (Card or List) */}
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

      {/* Content Area: Card Grid vs List Table */}
      {loading ? (
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: '260px',
          color: '#64748b'
        }}>
          Memuat riwayat eksekusi ETL...
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
              <div key={item.id} className="history-card" onClick={() => setSelectedFile(item)} style={{ cursor: 'pointer' }}>
                <div className="history-card-header">
                  <div className="file-pill-tag-group">
                    <span className="badge-tag-xlsx">{item.file_type || 'XLSX'}</span>
                    <span className="file-size-text">{item.file_size}</span>
                  </div>
                  <span className={`status-pill-badge ${statusClass}`}>
                    {item.status}
                  </span>
                </div>

                <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 8 }}>
                  <h4 className="history-card-title" style={{ flex: 1 }}>{item.file_name}</h4>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                    <button
                      className="btn-action-icon"
                      title="Ubah Judul"
                      onClick={(e) => handleStartEdit(e, item)}
                      style={{
                        background: 'transparent',
                        border: 'none',
                        cursor: 'pointer',
                        padding: 4,
                        color: '#64748b',
                        borderRadius: 4
                      }}
                    >
                      <Pencil size={14} />
                    </button>
                    <button
                      className="btn-action-icon"
                      title="Hapus Riwayat"
                      onClick={(e) => handleStartDelete(e, item)}
                      style={{
                        background: 'transparent',
                        border: 'none',
                        cursor: 'pointer',
                        padding: 4,
                        color: '#ef4444',
                        borderRadius: 4
                      }}
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>

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
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedFile(item);
                    }}
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
        /* LIST VIEW */
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
                      <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
                        <button
                          title="Ubah Judul"
                          onClick={(e) => handleStartEdit(e, item)}
                          style={{
                            background: '#f1f5f9',
                            border: '1px solid #cbd5e1',
                            borderRadius: 6,
                            padding: '4px 8px',
                            cursor: 'pointer',
                            color: '#475569',
                            display: 'flex',
                            alignItems: 'center'
                          }}
                        >
                          <Pencil size={13} />
                        </button>
                        <button
                          title="Hapus"
                          onClick={(e) => handleStartDelete(e, item)}
                          style={{
                            background: '#fef2f2',
                            border: '1px solid #fecaca',
                            borderRadius: 6,
                            padding: '4px 8px',
                            cursor: 'pointer',
                            color: '#dc2626',
                            display: 'flex',
                            alignItems: 'center'
                          }}
                        >
                          <Trash2 size={13} />
                        </button>
                        <button
                          className={`btn-card-detail ${isError ? 'log-error' : ''}`}
                          onClick={() => setSelectedFile(item)}
                          style={{ display: 'inline-flex' }}
                        >
                          <span>{isError ? 'Log Galat' : 'Detail'}</span>
                          <ChevronRight size={14} />
                        </button>
                      </div>
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

      {/* Edit Title Modal */}
      {editingItem && (
        <div className="modal-overlay" onClick={() => setEditingItem(null)}>
          <div className="modal-content-card" style={{ maxWidth: '480px' }} onClick={(e) => e.stopPropagation()}>
            <div className="modal-header-row">
              <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#0f172a', margin: 0 }}>
                Ubah Judul / Nama Berkas
              </h3>
              <button className="btn-close-modal" onClick={() => setEditingItem(null)}>
                <X size={18} />
              </button>
            </div>
            <div style={{ margin: '18px 0' }}>
              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: '#475569', marginBottom: 6 }}>
                Nama Berkas / Judul Proses
              </label>
              <input
                type="text"
                value={editTitle}
                onChange={(e) => setEditTitle(e.target.value)}
                style={{
                  width: '100%',
                  padding: '9px 12px',
                  borderRadius: '6px',
                  border: '1px solid #cbd5e1',
                  fontSize: '0.9rem',
                  outline: 'none',
                  boxSizing: 'border-box'
                }}
                autoFocus
                onKeyDown={(e) => {
                  if (e.key === 'Enter') handleSaveEdit();
                  if (e.key === 'Escape') setEditingItem(null);
                }}
              />
            </div>
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10 }}>
              <button className="btn-secondary-action" onClick={() => setEditingItem(null)}>
                Batal
              </button>
              <button
                className="btn-primary-next"
                style={{ width: 'auto', padding: '8px 18px' }}
                onClick={handleSaveEdit}
                disabled={isUpdating}
              >
                {isUpdating ? 'Menyimpan...' : 'Simpan Perubahan'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deletingItem && (
        <div className="modal-overlay" onClick={() => setDeletingItem(null)}>
          <div className="modal-content-card" style={{ maxWidth: '440px' }} onClick={(e) => e.stopPropagation()}>
            <div className="modal-header-row">
              <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#dc2626', margin: 0 }}>
                Konfirmasi Hapus
              </h3>
              <button className="btn-close-modal" onClick={() => setDeletingItem(null)}>
                <X size={18} />
              </button>
            </div>
            <p style={{ fontSize: '0.88rem', color: '#475569', margin: '16px 0' }}>
              Apakah Anda yakin ingin menghapus catatan riwayat <strong>{deletingItem.file_name}</strong>? Tindakan ini tidak dapat dibatalkan.
            </p>
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10 }}>
              <button className="btn-secondary-action" onClick={() => setDeletingItem(null)}>
                Batal
              </button>
              <button
                style={{
                  background: '#dc2626',
                  color: '#ffffff',
                  border: 'none',
                  borderRadius: 6,
                  padding: '8px 18px',
                  fontWeight: 600,
                  fontSize: '0.85rem',
                  cursor: 'pointer'
                }}
                onClick={handleConfirmDelete}
                disabled={isDeleting}
              >
                {isDeleting ? 'Menghapus...' : 'Ya, Hapus'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Detail Modal / Log Viewer */}
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
                <span>{(selectedFile.records_count ?? 0).toLocaleString()} Baris</span>
              </div>
              <div className="meta-item">
                <label>Akurasi Skema</label>
                <span>{selectedFile.schema_accuracy ?? 100.0}%</span>
              </div>
            </div>

            <h4 style={{ fontSize: '0.85rem', fontWeight: 700, color: '#334155', marginBottom: 8 }}>
              Log Catatan Sistem
            </h4>
            <div className="log-box">
              {selectedFile.log_message ||
                `[${selectedFile.date_display}] Berkas berhasil diproses melalui pipeline ETL. Skema valid.`}
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 16 }}>
              <div style={{ display: 'flex', gap: 8 }}>
                <button
                  className="btn-secondary-action"
                  onClick={(e) => handleStartEdit(e, selectedFile)}
                  style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}
                >
                  <Pencil size={13} />
                  <span>Ubah Judul</span>
                </button>
                <button
                  style={{
                    background: '#fef2f2',
                    border: '1px solid #fecaca',
                    color: '#dc2626',
                    borderRadius: 6,
                    padding: '6px 12px',
                    fontSize: '0.82rem',
                    fontWeight: 600,
                    cursor: 'pointer',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: 6
                  }}
                  onClick={(e) => handleStartDelete(e, selectedFile)}
                >
                  <Trash2 size={13} />
                  <span>Hapus</span>
                </button>
              </div>

              <button
                className="btn-secondary-action"
                onClick={() => setSelectedFile(null)}
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
