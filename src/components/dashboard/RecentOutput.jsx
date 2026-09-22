import React from 'react';
import { Clock, ArrowRight } from 'lucide-react';

export default function RecentOutput({ onNavigateToHistory, onSelectDetail }) {
  const dummyFiles = [
    {
      id: 1,
      size: '18.4 MB',
      name: 'Engineering_CAR_Tol_TransSumatera.xlsx',
      cedant: 'PT Asuransi Tugu Pratama',
      date: '18 Sep 2026, 17:05 WIB',
      cob: 'Engineering',
      status: 'Berhasil Dimuat'
    },
    {
      id: 2,
      size: '18.4 MB',
      name: 'Engineering_CAR_Tol_TransSumatera.xlsx',
      cedant: 'PT Asuransi Tugu Pratama',
      date: '18 Sep 2026, 17:05 WIB',
      cob: 'Engineering',
      status: 'Berhasil Dimuat'
    },
    {
      id: 3,
      size: '18.4 MB',
      name: 'Engineering_CAR_Tol_TransSumatera.xlsx',
      cedant: 'PT Asuransi Tugu Pratama',
      date: '18 Sep 2026, 17:05 WIB',
      cob: 'Engineering',
      status: 'Berhasil Dimuat'
    }
  ];

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

      <div className="recent-output-cards">
        {dummyFiles.map((file) => (
          <div key={file.id} className="file-card">
            <div className="file-card-header">
              <div className="file-badges">
                <span className="badge-green-outline">XLSX</span>
                <span className="file-size">{file.size}</span>
              </div>
              <span className="badge-status">Berhasil Dimuat</span>
            </div>

            <h4 className="file-name">{file.name}</h4>
            <p className="file-cedant">Cedant: {file.cedant}</p>

            <div className="file-date">
              <Clock size={12} /> {file.date}
            </div>

            <div className="file-card-footer">
              <div className="cob-badge-group">
                COB: <span className="badge-blue">{file.cob}</span>
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
    </div>
  );
}
