import React, { useState } from 'react';
import { X, Check, Server, Database, Code, ExternalLink } from 'lucide-react';
import facLensService from '../../services/facLensService';

export default function ApiConfigModal({
  isOpen,
  onClose,
  isMockMode,
  onToggleMockMode
}) {
  const [apiUrl, setApiUrl] = useState(
    import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api'
  );
  const [savedSuccess, setSavedSuccess] = useState(false);

  if (!isOpen) return null;

  const handleSave = () => {
    facLensService.setApiBaseUrl(apiUrl);
    setSavedSuccess(true);
    setTimeout(() => {
      setSavedSuccess(false);
      onClose();
    }, 900);
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Server size={20} color="#0052cc" />
            <h3 className="modal-title">Konfigurasi Integrasi API / Database</h3>
          </div>
          <button className="modal-close-btn" onClick={onClose}>
            <X size={18} />
          </button>
        </div>

        <div className="modal-body">
          {/* Mode Selector */}
          <div>
            <label style={{ display: 'block', fontWeight: 600, fontSize: '0.85rem', marginBottom: '8px' }}>
              Mode Sumber Data:
            </label>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
              <button
                type="button"
                className={`action-btn ${isMockMode ? 'primary' : ''}`}
                style={{ justifyContent: 'center', padding: '10px' }}
                onClick={() => onToggleMockMode(true)}
              >
                <Database size={15} />
                <span>Mock Data (Offline)</span>
              </button>
              <button
                type="button"
                className={`action-btn ${!isMockMode ? 'primary' : ''}`}
                style={{ justifyContent: 'center', padding: '10px' }}
                onClick={() => onToggleMockMode(false)}
              >
                <Server size={15} />
                <span>Live REST API</span>
              </button>
            </div>
          </div>

          {/* Endpoint Input */}
          <div>
            <label style={{ display: 'block', fontWeight: 600, fontSize: '0.85rem', marginBottom: '6px' }}>
              Backend API Base URL:
            </label>
            <input
              type="text"
              className="filter-input"
              value={apiUrl}
              onChange={(e) => setApiUrl(e.target.value)}
              placeholder="e.g. https://api.indonesiare.co.id/fac-lens/v1"
              style={{ width: '100%' }}
            />
            <small style={{ display: 'block', color: '#64748b', fontSize: '0.74rem', marginTop: '4px' }}>
              Konfigurasi ini juga dapat diatur melalui variabel lingkungan <code>.env</code> (<code>VITE_API_BASE_URL</code>).
            </small>
          </div>

          {/* Database Schema Guide */}
          <div style={{ background: '#f8fafc', padding: '12px', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '6px' }}>
              <Code size={15} color="#0284c7" />
              <strong style={{ fontSize: '0.82rem', color: '#1e293b' }}>
                Format Kolom Database yang Diterima Frontend:
              </strong>
            </div>
            <pre style={{
              fontSize: '0.72rem',
              background: '#0f172a',
              color: '#38bdf8',
              padding: '10px',
              borderRadius: '6px',
              overflowX: 'auto',
              fontFamily: 'var(--font-mono)'
            }}>
{`// JSON Response dari GET /marine-hull/records
{
  "total": 48,
  "page": 1,
  "limit": 10,
  "data": [
    {
      "id": 1,
      "fac_code": "201CA111",
      "reff_number": "PLA/2023/MH/0411",
      "direct": "PT. ASURANSI DAYIN MITRA",
      "broker": "DIRECT",
      "nama_tertanggung": "CITRA BORNEO INDAH GROUP...",
      "afiliasi_tertanggung": "CITRA BORNEO INDAH GROUP",
      "nama_tertanggung_loss": "PT PELAYARAN LINGGA...",
      "nama_kapal": "JEEMS RIDIANTO 01",
      "code_kapal": "V-JEEMS-01",
      "sum_insured": 45000000000,
      "loss_amount": 1250000000,
      "status": "In Review"
    }
  ]
}`}
            </pre>
          </div>
        </div>

        <div className="modal-footer">
          <button className="action-btn" onClick={onClose}>
            Batal
          </button>
          <button className="action-btn primary" onClick={handleSave}>
            {savedSuccess ? (
              <>
                <Check size={14} /> Tersimpan!
              </>
            ) : (
              'Simpan Pengaturan'
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
