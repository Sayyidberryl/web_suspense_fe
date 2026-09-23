import React, { useState, useRef } from 'react';
import { UploadCloud, FileSpreadsheet, ArrowRight, X, ShieldCheck, Sparkles, CheckCircle2 } from 'lucide-react';
import mappingService from '../../services/mappingService';
import '../../styles/upload.css';

const UNPARSED_10_COLUMNS = [
  'fac_code', 'fac_risk', 'fac_desc', 'fac_old_ref', 'fac_cedant',
  'fac_broker', 'fac_insured', 'currency', 'fac_totsi', 'fac_our_amt'
];

export default function UploadStepOne({ onProceedToMapping }) {
  const [selectedFile, setSelectedFile] = useState(null);
  const [outputTitle, setOutputTitle] = useState('');
  const [cob, setCob] = useState('Marine Hull');
  const [mappingTemplate, setMappingTemplate] = useState('Template Akseptasi (Marine Hull)');
  const [isConfirmed, setIsConfirmed] = useState(false);
  const [isDragOver, setIsDragOver] = useState(false);
  const [detectedColumns, setDetectedColumns] = useState([]);
  const fileInputRef = useRef(null);

  const handleFileSelect = async (file) => {
    if (!file) return;
    const sizeMb = (file.size / (1024 * 1024)).toFixed(1);

    // Parse headers in browser via SheetJS
    const cols = await mappingService.parseFileHeaders(file);
    const finalCols = cols && cols.length > 0 ? cols : UNPARSED_10_COLUMNS;
    setDetectedColumns(finalCols);

    const baseName = file.name.replace(/\.[^/.]+$/, '');
    if (!outputTitle || outputTitle.startsWith('MH - Data')) {
      setOutputTitle(baseName);
    }

    setSelectedFile({
      name: file.name,
      size: `${sizeMb > 0 ? sizeMb : '14.2'} KB`,
      fileObject: file,
      columnsCount: finalCols.length
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
    const resolvedTitle = outputTitle.trim() || selectedFile.name.replace(/\.[^/.]+$/, '');
    onProceedToMapping({
      fileName: selectedFile.name,
      outputTitle: resolvedTitle,
      fileSize: selectedFile.size,
      cob,
      mappingTemplate,
      fileObject: selectedFile.fileObject,
      detectedColumns: detectedColumns.length > 0 ? detectedColumns : UNPARSED_10_COLUMNS
    });
  };

  // Preset 1: Curated Raw Marine Hull Batch for AI Entity Normalization
  const loadUnparsedBatchFile = () => {
    setSelectedFile({
      name: 'Bordero_MarineHull_Batch_Unparsed.xlsx',
      size: '14.2 KB',
      fileObject: null,
      columnsCount: UNPARSED_10_COLUMNS.length,
      isAiDemo: true
    });
    setDetectedColumns(UNPARSED_10_COLUMNS);
    setOutputTitle('MH - Data Akseptasi');
    setIsConfirmed(true);
  };

  // Preset 2: Comprehensive Facultative Export File (179 Columns)
  const loadMasterExportFile = () => {
    setSelectedFile({
      name: 'MR11_Facultative_Export.xlsx',
      size: '41.4 MB',
      fileObject: null,
      columnsCount: 179
    });
    setDetectedColumns([]);
    setOutputTitle('MH - Data Master Ekspor');
    setIsConfirmed(true);
  };

  return (
    <div className="upload-container">
      {/* Dark Top Banner */}
      <div className="upload-banner-dark">
        <h2>Extract, Transform & Load (ETL)</h2>
        <p>Unggah berkas mentah untuk divalidasi, diekstrak entitasnya menggunakan Parsing Engine, dan dimuat ke sistem analitik Indore.</p>
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
          <h3 className="dropzone-title">UPLOAD BERKAS MENTAH</h3>
          <p className="dropzone-hint">
            Tarik & letakkan berkas di sini atau <span className="dropzone-hint-link">klik untuk memilih file Excel/CSV</span>
          </p>


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
                <h4>{selectedFile ? selectedFile.name : 'Belum ada file dipilih'}</h4>
                <p>
                  {selectedFile
                    ? `${selectedFile.size} • ${selectedFile.columnsCount || detectedColumns.length || 10} Kolom Terdeteksi`
                    : 'Format yang didukung: .xlsx, .xls, .csv'}
                </p>
              </div>
              {selectedFile && (
                <button
                  type="button"
                  className="btn-clear-selection"
                  onClick={() => {
                    setSelectedFile(null);
                    setOutputTitle('');
                    setIsConfirmed(false);
                    setDetectedColumns([]);
                  }}
                  title="Batalkan pilihan berkas"
                >
                  <X size={16} />
                </button>
              )}
            </div>
          </div>

          {/* Card 2: JUDUL OUTPUT, KATEGORI (COB) & TEMPLATE SELECTION */}
          <div className="info-card">
            <div className="info-card-header">
              <span className="info-card-title">Pengaturan Pemetaan</span>
            </div>

            {/* Field Input Baru: Judul Output */}
            <div className="form-field-group">
              <label className="form-label">
                Judul Output <span className="required-star">*</span>
              </label>
              <input
                type="text"
                className="form-input"
                placeholder="Contoh: MH - Data Akseptasi"
                value={outputTitle}
                onChange={(e) => setOutputTitle(e.target.value)}
              />
              <span className="form-helper-text">
                Nama tabel / sheet tab yang akan tampil di Dashboard dan file ekspor Excel.
              </span>
            </div>

            {/* COB adalah Kategori */}
            <div className="form-field-group">
              <label className="form-label">Kategori (COB)</label>
              <select
                value={cob}
                onChange={(e) => setCob(e.target.value)}
                className="form-select select-custom-field"
              >
                <option value="Marine Hull">Marine Hull</option>
                <option value="Fire & Property">Fire & Property</option>
                <option value="Motor Vehicle">Motor Vehicle</option>
                <option value="Casualty & Liability">Casualty & Liability</option>
              </select>
            </div>

            <div className="form-field-group">
              <label className="form-label">Template Pemetaan Awal</label>
              <select
                value={mappingTemplate}
                onChange={(e) => {
                  const val = e.target.value;
                  setMappingTemplate(val);
                  if (!outputTitle || outputTitle.startsWith('MH - Data')) {
                    if (val.includes('Akseptasi')) setOutputTitle('MH - Data Akseptasi');
                    else if (val.includes('PLA')) setOutputTitle('MH - Data Loss PLA');
                    else if (val.includes('SLA')) setOutputTitle('MH - Data Loss SLA');
                  }
                }}
                className="form-select select-custom-field"
              >
                <option value="Template Akseptasi (Marine Hull)">
                  Template Standar Akseptasi (Marine Hull)
                </option>
                <option value="Template Loss PLA (Marine Hull)">
                  Template Standar Loss PLA (Marine Hull)
                </option>
                <option value="Template Loss SLA (Marine Hull)">
                  Template Standar Loss SLA (Marine Hull)
                </option>
              </select>
            </div>
          </div>

          {/* Confirmation Checkbox */}
          <div className="checkbox-confirmation-box">
            <label className="checkbox-label">
              <input
                type="checkbox"
                checked={isConfirmed}
                onChange={(e) => setIsConfirmed(e.target.checked)}
                disabled={!selectedFile}
              />
              <span className="checkbox-custom-ui" />
              <span className="checkbox-text">
                Saya mengonfirmasi bahwa berkas di atas siap dipetakan dan distandarisasi skemanya.
              </span>
            </label>
          </div>

          {/* Continue Button */}
          <button
            className={`btn-continue-upload ${selectedFile && isConfirmed ? 'active' : ''}`}
            disabled={!selectedFile || !isConfirmed}
            onClick={handleContinue}
          >
            <span>Lanjutkan ke Pemetaan Kolom</span>
            <ArrowRight size={18} />
          </button>
        </div>
      </div>
    </div>
  );
}
