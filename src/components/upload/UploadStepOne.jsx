import React, { useState, useRef } from 'react';
import { UploadCloud, FileSpreadsheet, ArrowRight, X } from 'lucide-react';
import '../../styles/upload.css';

export default function UploadStepOne({ onProceedToMapping }) {
  const [selectedFile, setSelectedFile] = useState(null);
  const [cob, setCob] = useState('Fire & Property');
  const [mappingTemplate, setMappingTemplate] = useState('Format Standar Bordero TriPakarta Fire 2026');
  const [isConfirmed, setIsConfirmed] = useState(false);
  const [isDragOver, setIsDragOver] = useState(false);
  const fileInputRef = useRef(null);

  const handleFileSelect = (file) => {
    if (!file) return;
    const sizeMb = (file.size / (1024 * 1024)).toFixed(1);
    setSelectedFile({
      name: file.name,
      size: `${sizeMb > 0 ? sizeMb : '1.8'} MB`,
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

  // Preset demo file helper so the user can test instantly without uploading
  const setDemoFile = () => {
    setSelectedFile({
      name: 'Bordero_TriPakarta_Fire_Q3_2026.xlsx',
      size: '1.8 MB',
      fileObject: null
    });
    setIsConfirmed(true);
  };

  return (
    <div className="upload-container">
      {/* Dark Top Banner (Mockup 4) */}
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
          <h3 className="dropzone-title">UPLOAD</h3>
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
                padding: '6px 14px',
                borderRadius: '8px',
                fontSize: '0.78rem',
                color: '#475569',
                cursor: 'pointer'
              }}
            >
              📄 Gunakan berkas contoh (Bordero TriPakarta Fire)
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
                      {selectedFile.size} • 24 Kolom Terdeteksi
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
            </div>

            <div className="form-field-group">
              <label className="form-label">COB</label>
              <select
                className="form-select"
                value={cob}
                onChange={(e) => setCob(e.target.value)}
              >
                <option value="Fire & Property">Fire & Property</option>
                <option value="Marine Cargo">Marine Cargo</option>
                <option value="Engineering">Engineering</option>
                <option value="Liability">Liability</option>
                <option value="Motor">Motor</option>
              </select>
            </div>

            <div className="form-field-group">
              <label className="form-label">Mapping</label>
              <select
                className="form-select"
                value={mappingTemplate}
                onChange={(e) => setMappingTemplate(e.target.value)}
              >
                <option value="Format Standar Bordero TriPakarta Fire 2026">
                  Format Standar Bordero TriPakarta Fire 2026
                </option>
                <option value="Format Standar Marine Cargo 2026">
                  Format Standar Marine Cargo 2026
                </option>
                <option value="Format Standar Engineering Tugu 2026">
                  Format Standar Engineering Tugu 2026
                </option>
                <option value="Custom Schema Stage IPR">
                  Custom Schema Stage IPR
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
              <span>Selanjutnya</span>
              <ArrowRight size={16} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
