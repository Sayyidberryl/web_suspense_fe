import React, { useState, useEffect } from 'react';
import { Clock, ArrowRight, FileSpreadsheet } from 'lucide-react';
import historyService from '../../services/historyService';

export default function RecentOutput({ onNavigateToHistory, onSelectDetail }) {
  const [recentFiles, setRecentFiles] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    async function loadRecent() {
      try {
        setLoading(true);
        const res = await historyService.getHistory({ page: 1, limit: 3 });
        if (isMounted && res && Array.isArray(res.data)) {
          setRecentFiles(res.data);
        }
      } catch (err) {
        console.error('Failed to load recent files:', err);
      } finally {
        if (isMounted) setLoading(false);
      }
    }
    loadRecent();
    return () => {
      isMounted = false;
    };
  }, []);

  return (
    <div className="recent-output-section">
      <div className="recent-output-header">
        <h3 className="recent-output-title">
          <Clock size={18} />
          Output Terbaru
        </h3>
        <button 
          className="recent-output-view-all"
          onClick={onNavigateToHistory}
        >
          Lihat Semua <ArrowRight size={14} />
        </button>
      </div>

      {loading ? (
        <div style={{ padding: '24px', textAlign: 'center', color: '#64748b', fontSize: '0.88rem' }}>
          Memuat riwayat berkas terbaru...
        </div>
      ) : recentFiles.length === 0 ? (
        <div style={{
          background: '#ffffff',
          border: '1px dashed #cbd5e1',
          borderRadius: '12px',
          padding: '32px',
          textAlign: 'center',
          color: '#64748b',
          fontSize: '0.88rem'
        }}>
          Belum ada berkas yang diproses. Silakan unggah berkas di menu <strong>Upload</strong>.
        </div>
      ) : (
        <div className="recent-output-cards">
          {recentFiles.map((file) => (
            <div key={file.id} className="file-card">
              <div className="file-card-header">
                <div className="file-badges">
                  <span className="badge-green-outline">{file.file_type || 'XLSX'}</span>
                  <span className="file-size">{file.file_size || '1.8 MB'}</span>
                </div>
                <span className={`badge-status ${file.status === 'Gagal Skema' ? 'error' : ''}`}>
                  {file.status || 'Berhasil Dimuat'}
                </span>
              </div>

              <h4 className="file-name" title={file.file_name}>{file.file_name}</h4>
              <p className="file-cedant">Cedant: {file.cedant || '-'}</p>

              <div className="file-date">
                <Clock size={12} /> {file.date_display || '-'}
              </div>

              <div className="file-card-footer">
                <div className="cob-badge-group">
                  Kategori: <span className="badge-blue">{file.cob || 'General'}</span>
                </div>
                <button 
                  className="detail-link" 
                  style={{ background: 'none', border: 'none', cursor: 'pointer' }}
                  onClick={() => onSelectDetail && onSelectDetail(file)}
                >
                  Detail <ArrowRight size={14} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
