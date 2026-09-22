import React, { useState, useRef } from 'react';
import { UploadCloud, FileSpreadsheet, ArrowRight, X, ShieldCheck } from 'lucide-react';
import '../../styles/upload.css';

export default function UploadStepOne({ onProceedToMapping }) {
  const [selectedFile, setSelectedFile] = useState(null);
  const [cob, setCob] = useState('Marine Hull');
  const [mappingTemplate, setMappingTemplate] = useState('Template Akseptasi (Marine Hull)');
  const [isConfirmed, setIsConfirmed] = useState(false);
  const [isDragOver, setIsDragOver] = useState(false);
  const fileInputRef = useRef(null);

  const handleFileSelect = (file) => {
    if (!file) return;
    const sizeMb = (file.size / (1024 * 1024)).toFixed(1);
    setSelectedFile({
      name: file.name,
      size: `${sizeMb > 0 ? sizeMb : '41.4'} MB`,
      fileObject: file
    });
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragOver(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFileSelect(e.dataTransfer.files[0]);
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setIsDragOver(false);
  };

  const handleContinue = () => {
    if (!selectedFile || !isConfirmed) return;
    onProceedToMapping({
      fileName: selectedFile.name,
      fileSize: selectedFile.size,
      cob,
      mappingTemplate,
      fileObject: selectedFile.fileObject
    });
  };

  // Preset demo file helper using mr11_raw_data_export.xlsx
  const setDemoFile = () => {
    setSelectedFile({
      name: 'mr11_raw_data_export.xlsx',
      size: '41.4 MB',
      fileObject: null
    });
    setIsConfirmed(true);
  };

  return (
    <div className="upload-container">
      {/* Dark Top Banner */}
      <div className="upload-banner-dark">
        <h2>Extract, Transform & Load</h2>
        <p>Unggah berkas mentah untuk divalidasi, distandarisasi, dan dimuat ke sistem analitik Indore.</p>
      </div>

      <div className="upload-grid">
        {/* Left Drag & Drop Box */}
        <div
          className={`dropzone-box ${isDragOver ? 'drag-over' : ''}`}
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onClick={() => fileInputRef.current && fileInputRef.current.click()}
        >
          <input
            type="file"
            ref={fileInputRef}
            style={{ display: 'none' }}
            accept=".xlsx,.xls,.csv"
            onChange={(e) => {
              if (e.target.files && e.target.files.length > 0) {
                handleFileSelect(e.target.files[0]);
              }
            }}
          />
          <div className="dropzone-icon-circle">
            <UploadCloud size={36} />
          </div>
          <h3 className="dropzone-title">UPLOAD BERKAS</h3>
          <p className="dropzone-hint">
            Tarik & letakkan berkas di sini atau <span className="dropzone-hint-link">klik untuk memilih file</span>
          </p>
          {!selectedFile && (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                setDemoFile();
              }}
              style={{
                marginTop: 18,
                background: '#f1f5f9',
                border: '1px solid #cbd5e1',
                padding: '7px 16px',
                borderRadius: '8px',
                fontSize: '0.8rem',
                color: '#334155',
                fontWeight: 600,
                cursor: 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px'
              }}
            >
              <span>📄 Gunakan berkas contoh (mr11_raw_data_export.xlsx)</span>
            </button>
          )}
        </div>

        {/* Right Info & Settings Sidebar */}
        <div className="upload-sidebar-cards">
          {/* Card 1: NAMA FILE */}
          <div className="info-card">
            <div className="info-card-header">
              <span className="info-card-title">Nama File</span>
              {selectedFile ? (
                <span className="badge-tag-ready">Siap Dipetakan</span>
              ) : (
                <span className="badge-tag-pending">Menunggu File</span>
              )}
            </div>

            <div className="file-preview-box">
              <div className="file-preview-icon">
                <FileSpreadsheet size={22} />
              </div>
              <div className="file-preview-details">
                {selectedFile ? (
                  <>
                    <div className="file-preview-name" title={selectedFile.name}>
                      {selectedFile.name}
                    </div>
                    <div className="file-preview-subtext">
                      {selectedFile.size} • 179 Kolom Terdeteksi (MR11 Raw)
                    </div>
                  </>
                ) : (
                  <>
                    <div className="file-preview-name">Belum ada file dipilih...</div>
                    <div className="file-preview-subtext">Silakan unggah dari area sebelah kiri</div>
                  </>
                )}
              </div>
              {selectedFile && (
                <button
                  type="button"
                  onClick={() => setSelectedFile(null)}
                  style={{ background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer' }}
                  title="Batalkan file"
                >
                  <X size={16} />
                </button>
              )}
            </div>
          </div>

          {/* Card 2: SETTING */}
          <div className="info-card">
            <div className="info-card-header">
              <span className="info-card-title">Setting</span>
              <span style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '4px',
                fontSize: '0.72rem',
                color: '#059669',
                fontWeight: 600
              }}>
                <ShieldCheck size={12} /> Marine Hull Aktif
              </span>
            </div>

            <div className="form-field-group">
              <label className="form-label">Class of Business (COB)</label>
              <select
                className="form-select"
                value={cob}
                onChange={(e) => setCob(e.target.value)}
              >
                <option value="Marine Hull">Marine Hull (Tersedia)</option>
                <option value="Fire & Property" disabled>Fire & Property (Segera Hadir)</option>
                <option value="Marine Cargo" disabled>Marine Cargo (Segera Hadir)</option>
                <option value="Engineering" disabled>Engineering (Segera Hadir)</option>
                <option value="Liability" disabled>Liability (Segera Hadir)</option>
                <option value="Motor" disabled>Motor (Segera Hadir)</option>
              </select>
            </div>

            <div className="form-field-group">
              <label className="form-label">Template Pemetaan</label>
              <select
                className="form-select"
                value={mappingTemplate}
                onChange={(e) => setMappingTemplate(e.target.value)}
              >
                <option value="Template Akseptasi (Marine Hull)">
                  Template Akseptasi (Marine Hull) - 29 Kolom
                </option>
                <option value="Template Loss PLA (Marine Hull)">
                  Template Loss PLA (Marine Hull) - 24 Kolom
                </option>
                <option value="Template Loss SLA (Marine Hull)">
                  Template Loss SLA (Marine Hull) - 24 Kolom
                </option>
              </select>
            </div>

            <label className="checkbox-confirm-row">
              <input
                type="checkbox"
                checked={isConfirmed}
                onChange={(e) => setIsConfirmed(e.target.checked)}
              />
              <span>Saya sudah yakin dengan settingan ini</span>
            </label>

            <button
              className="btn-primary-next"
              disabled={!selectedFile || !isConfirmed}
              onClick={handleContinue}
            >
              <span>Selanjutnya ke Pemetaan</span>
              <ArrowRight size={16} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
