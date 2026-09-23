import React, { useState, useEffect, useRef } from 'react';
import {
  ArrowRight,
  RotateCcw,
  Sparkles,
  CheckCircle2,
  ShieldCheck,
  Plus,
  Trash2,
  Upload,
  FileSpreadsheet,
  FilePlus,
  Info,
  Layers
} from 'lucide-react';
import mappingService, {
  AVAILABLE_EXCEL_COLUMNS,
  SYSTEM_TEMPLATES
} from '../../services/mappingService';
import facLensService from '../../services/facLensService';
import AiSettingCard from './AiSettingCard';
import AiResultPreviewModal from './AiResultPreviewModal';
import '../../styles/mapping.css';

export default function ColumnMappingView({
  fileInfo = {
    fileName: 'mr11_raw_data_export.xlsx',
    fileSize: '41.4 MB',
    cob: 'Marine Hull',
    mappingTemplate: 'Template Akseptasi (Marine Hull)'
  },
  onBack,
  onCancel,
  onStartParsing,
  onNavigateToDashboard
}) {
  const [templates, setTemplates] = useState(SYSTEM_TEMPLATES);
  const [selectedTemplateName, setSelectedTemplateName] = useState(
    fileInfo.mappingTemplate || 'Template Akseptasi (Marine Hull)'
  );
  const [mappings, setMappings] = useState(() =>
    mappingService.getDefaultMappings(fileInfo.mappingTemplate || 'Template Akseptasi (Marine Hull)')
  );
  const [notification, setNotification] = useState('');

  // Source columns detected from file
  const [detectedColumns, setDetectedColumns] = useState(() => {
    if (fileInfo.detectedColumns && fileInfo.detectedColumns.length > 0) {
      return fileInfo.detectedColumns;
    }
    return AVAILABLE_EXCEL_COLUMNS.filter((c) => c !== '-- Pilih Kolom Excel --');
  });

  // AI Engine State
  const [isAiEnabled, setIsAiEnabled] = useState(true); // AI Entity Resolution Engine Active
  const [isProcessingAi, setIsProcessingAi] = useState(false);
  const [aiParseResult, setAiParseResult] = useState(null);
  const [isPreviewModalOpen, setIsPreviewModalOpen] = useState(false);

  // Hidden file inputs for importing template from Excel
  const importExcelInputRef = useRef(null);

  useEffect(() => {
    async function loadTemplates() {
      const list = await mappingService.getTemplates();
      if (list && list.length > 0) {
        setTemplates(list);
      }
    }
    loadTemplates();
  }, []);

  const handleTemplateChange = (newName) => {
    setSelectedTemplateName(newName);
    const newMappings = mappingService.getDefaultMappings(newName);
    setMappings(newMappings);
    showNotice(`Template diubah ke: ${newName} (${newMappings.length} kolom)`);
  };

  const handleColumnChange = (no, newExcelCol) => {
    setMappings((prev) =>
      prev.map((row) => {
        if (row.no === no) {
          const isMapped = newExcelCol !== '-- Pilih Kolom Excel --';
          return {
            ...row,
            excel_col: newExcelCol,
            status: isMapped ? 'mapped' : row.is_optional ? 'optional' : 'unmapped'
          };
        }
        return row;
      })
    );
  };

  // Row field edit (standard_name, field_db, data_type)
  const handleRowFieldChange = (no, field, val) => {
    setMappings((prev) =>
      prev.map((row) => {
        if (row.no === no) {
          return { ...row, [field]: val };
        }
        return row;
      })
    );
  };

  // Add row freely
  const handleAddRow = () => {
    const nextNo = mappings.length + 1;
    const newRow = mappingService.createEmptyMappingRow(nextNo);
    setMappings((prev) => [...prev, newRow]);
    showNotice(`Baris pemetaan ke-${nextNo} berhasil ditambahkan.`);
  };

  // Delete row freely
  const handleDeleteRow = (no) => {
    if (mappings.length <= 1) {
      showNotice('Minimal harus ada 1 baris pemetaan.');
      return;
    }
    const filtered = mappings.filter((r) => r.no !== no);
    // Re-index row numbers
    const reindexed = filtered.map((r, i) => ({ ...r, no: i + 1 }));
    setMappings(reindexed);
    showNotice(`Baris pemetaan nomor ${no} berhasil dihapus.`);
  };

  // Create Blank Template
  const handleCreateBlankTemplate = () => {
    const templateName = prompt('Masukkan nama template kosong baru:');
    if (!templateName || !templateName.trim()) return;
    const trimmed = templateName.trim();
    const blank = mappingService.createBlankTemplate(trimmed);
    setSelectedTemplateName(trimmed);
    setMappings(blank.mappings);
    setTemplates((prev) => [...prev, blank]);
    showNotice(`Template kosong '${trimmed}' siap dikonfigurasi.`);
  };

  // Import Template from Excel file
  const handleImportExcelFile = async (e) => {
    const file = e.target.files && e.target.files[0];
    if (!file) return;

    let headers = await mappingService.parseFileHeaders(file);
    if (!headers || headers.length === 0) {
      // Fallback to server inspection
      const inspectRes = await facLensService.inspectFile(file);
      headers = inspectRes?.columns || [];
    }

    if (headers && headers.length > 0) {
      const templateName = `Template dari ${file.name.replace(/\.[^/.]+$/, '')}`;
      const newTemplate = mappingService.createTemplateFromColumns(headers, templateName);
      setSelectedTemplateName(templateName);
      setMappings(newTemplate.mappings);
      setDetectedColumns(headers);
      setTemplates((prev) => [...prev, newTemplate]);
      showNotice(`Template otomatis dibentuk dari ${headers.length} kolom berkas '${file.name}'!`);
    } else {
      alert('Tidak dapat mendeteksi header kolom dari berkas yang dipilih.');
    }
    e.target.value = '';
  };

  const handleAutoMatch = () => {
    setMappings((prev) =>
      prev.map((row) => {
        const bestMatch = mappingService.autoMatchRow(row, selectedTemplateName);
        const isMapped = bestMatch !== '-- Pilih Kolom Excel --';
        return {
          ...row,
          excel_col: bestMatch,
          status: isMapped ? 'mapped' : row.is_optional ? 'optional' : 'unmapped'
        };
      })
    );
    showNotice(`Kolom berhasil dicocokkan otomatis (${mappings.length} kolom)!`);
  };

  const handleReset = () => {
    setMappings((prev) =>
      prev.map((m) => ({
        ...m,
        excel_col: '-- Pilih Kolom Excel --',
        status: m.is_optional ? 'optional' : 'unmapped'
      }))
    );
    showNotice('Pemetaan kolom telah direset ke status kosong.');
  };

  const currentTemplate = mappingService.getTemplateByName(selectedTemplateName);
  const targetSchema = currentTemplate.target_schema || 'FACUL_ETL_MH_AKSEPTASI';

  const handleSaveTemplate = async () => {
    await mappingService.saveTemplate({
      name: selectedTemplateName,
      cob: fileInfo.cob || 'Marine Hull',
      target_schema: targetSchema,
      column_count: mappings.length,
      mappings
    });
    showNotice(`Template '${selectedTemplateName}' berhasil disimpan ke database.`);
  };

  const showNotice = (msg) => {
    setNotification(msg);
    setTimeout(() => setNotification(''), 3500);
  };

  // AI Parsing Process Trigger
  const handleProcessAiParsing = async (aiConfig) => {
    setIsProcessingAi(true);
    try {
      // Fetch 10 demo unparsed rows if demo is active
      const demoRes = await facLensService.getDemoUnparsedData();
      const rawRows = demoRes?.data || [];

      const payload = {
        rows: rawRows,
        prompt_template: aiConfig.promptTemplate,
        target_columns: aiConfig.targetColumns,
        source_mapping: aiConfig.sourceMapping,
        file_name: fileInfo.fileName || 'Bordero_MarineHull_Batch_Unparsed.xlsx',
        file_size: fileInfo.fileSize || '14.2 KB',
        cob: fileInfo.cob || 'Marine Hull',
        save_to_dwh: true,
        target_table: 'FACUL_ETL_MH_PARSED_AI'
      };

      const result = await facLensService.runAiParse(payload);
      setAiParseResult(result);
      setIsPreviewModalOpen(true);
    } catch (err) {
      alert('Gagal menjalankan proses AI Parsing: ' + err.message);
    } finally {
      setIsProcessingAi(false);
    }
  };

  const handleGoToDashboard = () => {
    setIsPreviewModalOpen(false);
    if (onNavigateToDashboard) {
      onNavigateToDashboard('ai_parsed');
    } else if (onBack) {
      onBack();
    }
  };

  const mappedCount = mappings.filter((m) => m.excel_col !== '-- Pilih Kolom Excel --').length;
  const optionalCount = mappings.filter((m) => m.is_optional).length;

  // Combine default with detected columns
  const availableSourceCols = [
    '-- Pilih Kolom Excel --',
    ...Array.from(new Set([...detectedColumns, ...AVAILABLE_EXCEL_COLUMNS.filter((c) => c !== '-- Pilih Kolom Excel --')]))
  ];

  return (
    <div className="mapping-container">
      {/* Hidden File Input for Excel Template Import */}
      <input
        type="file"
        ref={importExcelInputRef}
        style={{ display: 'none' }}
        accept=".xlsx,.xls,.csv"
        onChange={handleImportExcelFile}
      />

      {notification && (
        <div style={{
          background: '#eff6ff',
          border: '1px solid #bfdbfe',
          color: '#1e40af',
          padding: '10px 18px',
          borderRadius: '10px',
          fontSize: '0.85rem',
          fontWeight: 600,
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          marginBottom: '16px'
        }}>
          <CheckCircle2 size={16} color="#2563eb" />
          <span>{notification}</span>
        </div>
      )}

      {/* Prominent Architectural Clarification Notice (Requirement 4) */}
      <div style={{
        background: 'linear-gradient(135deg, #f8fafc 0%, #eff6ff 100%)',
        border: '1px solid #bfdbfe',
        borderRadius: '12px',
        padding: '12px 18px',
        marginBottom: '20px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: '12px'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '0.82rem', color: '#1e3a8a' }}>
          <Info size={18} color="#2563eb" style={{ flexShrink: 0 }} />
          <span>
            <strong>Fleksibilitas Skema DWH:</strong> Template pemetaan Marine Hull (Akseptasi/PLA/SLA) bersifat modular dan adaptif. Anda dapat menyesuaikan konfigurasi, menambah/menghapus baris pemetaan, atau mengimpor definisi skema kustom dari berkas Excel eksternal.
          </span>
        </div>
        <div style={{ display: 'flex', gap: '8px', flexShrink: 0 }}>
          <button
            type="button"
            onClick={() => importExcelInputRef.current && importExcelInputRef.current.click()}
            style={{
              background: '#ffffff',
              border: '1px solid #cbd5e1',
              padding: '5px 12px',
              borderRadius: '6px',
              fontSize: '0.78rem',
              fontWeight: 600,
              color: '#334155',
              cursor: 'pointer',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px'
            }}
          >
            <Upload size={13} />
            <span>Impor dari Excel</span>
          </button>
          <button
            type="button"
            onClick={handleCreateBlankTemplate}
            style={{
              background: '#ffffff',
              border: '1px solid #cbd5e1',
              padding: '5px 12px',
              borderRadius: '6px',
              fontSize: '0.78rem',
              fontWeight: 600,
              color: '#334155',
              cursor: 'pointer',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px'
            }}
          >
            <FilePlus size={13} />
            <span>Template Kosong</span>
          </button>
        </div>
      </div>

      {/* Top 2 Cards: Mapping Controls & File Input */}
      <div className="mapping-top-grid">
        {/* Dark Mapping Bar */}
        <div className="mapping-control-card">
          <div className="mapping-control-header">
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <h2 className="mapping-control-title">Mapping Skema</h2>
              <div style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                background: 'rgba(16, 185, 129, 0.15)',
                color: '#34d399',
                border: '1px solid rgba(16, 185, 129, 0.3)',
                padding: '3px 10px',
                borderRadius: '6px',
                fontSize: '0.75rem',
                fontWeight: 600
              }}>
                <ShieldCheck size={13} />
                <span>COB: {fileInfo.cob || 'Marine Hull'}</span>
              </div>
            </div>

            <div className="target-schema-tag">
              Target Schema: <strong>{targetSchema}</strong>
            </div>
          </div>

          <div className="mapping-control-actions">
            <select
              className="mapping-template-select"
              value={selectedTemplateName}
              onChange={(e) => handleTemplateChange(e.target.value)}
            >
              {templates.map((t) => (
                <option key={t.id || t.name} value={t.name}>
                  {t.name} ({t.mappings ? t.mappings.length : t.column_count || 24} Kolom)
                </option>
              ))}
            </select>

            <button className="btn-ctrl-action" onClick={handleSaveTemplate} title="Simpan template saat ini ke database">
              Simpan
            </button>
            <button
              className="btn-ctrl-action"
              onClick={() => importExcelInputRef.current && importExcelInputRef.current.click()}
              title="Impor template dari file Excel lain"
            >
              Impor
            </button>
          </div>
        </div>

        {/* File Input Card */}
        <div className="file-input-card">
          <div className="file-input-header">
            <span className="file-input-title">FILE INPUT SUMBER</span>
            <span className="badge-tag-ready">Siap Dipetakan</span>
          </div>

          <div className="file-badge-pill">
            <div className="file-badge-left">
              <span className="xls-icon-box">XLS</span>
              <div className="file-badge-texts">
                <h4>{fileInfo.fileName || 'mr11_raw_data_export.xlsx'}</h4>
                <p>
                  {fileInfo.fileSize || '41.4 MB'} • {detectedColumns.length} Kolom Sumber Terdeteksi
                </p>
              </div>
            </div>

            <button className="btn-cancel-file" onClick={onCancel}>
              Ganti File
            </button>
          </div>
        </div>
      </div>

      {/* Column Mapping Configuration Table */}
      <div className="mapping-table-card">
        <div className="mapping-table-header">
          <div>
            <h3 className="mapping-table-title">Tabel Konfigurasi Pemetaan Kolom</h3>
            <p className="mapping-table-subtitle">
              Petakan {detectedColumns.length} kolom sumber dari berkas <code>{fileInfo.fileName || 'file_input.xlsx'}</code> ke atribut database target <strong>{targetSchema}</strong> ({mappings.length} baris).
            </p>
          </div>

          <div className="mapping-stats-badges">
            <span className="stat-pill mapped">{mappedCount} Terpetakan</span>
            <span className="stat-pill optional">{optionalCount} Opsional</span>
            <button
              type="button"
              onClick={handleAddRow}
              style={{
                background: '#4f46e5',
                color: '#ffffff',
                border: 'none',
                padding: '5px 12px',
                borderRadius: '6px',
                fontSize: '0.78rem',
                fontWeight: 700,
                cursor: 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                gap: 5
              }}
            >
              <Plus size={14} />
              <span>Tambah Baris</span>
            </button>
          </div>
        </div>

        <table className="mapping-table">
          <thead>
            <tr>
              <th style={{ width: 45 }}>NO</th>
              <th style={{ width: 280 }}>FORMAT STANDAR TARGET</th>
              <th style={{ width: 300 }}>KOLOM SUMBER (EXCEL INPUT)</th>
              <th style={{ width: 220 }}>FIELD DATABASE</th>
              <th style={{ width: 110 }}>TIPE DATA</th>
              <th style={{ width: 60, textAlign: 'center' }}>AKSI</th>
            </tr>
          </thead>
          <tbody>
            {mappings.map((row) => {
              const isOptional = row.is_optional;
              const isMapped = row.excel_col !== '-- Pilih Kolom Excel --';
              const statusClass = isMapped ? 'status-mapped' : isOptional ? 'status-optional' : '';

              return (
                <tr key={row.no} className={`mapping-row ${statusClass}`}>
                  <td style={{ fontWeight: 700, color: '#334155', textAlign: 'center' }}>{row.no}</td>
                  <td className="standard-name-cell">
                    <input
                      type="text"
                      value={row.standard_name}
                      onChange={(e) => handleRowFieldChange(row.no, 'standard_name', e.target.value)}
                      style={{
                        background: 'transparent',
                        border: '1px solid transparent',
                        borderRadius: '4px',
                        fontWeight: 700,
                        color: '#0f172a',
                        fontSize: '0.85rem',
                        width: '90%',
                        padding: '2px 4px'
                      }}
                      onFocus={(e) => e.target.style.borderColor = '#93c5fd'}
                      onBlur={(e) => e.target.style.borderColor = 'transparent'}
                    />
                    {isOptional && <span style={{ marginLeft: 4, fontSize: '0.7rem', color: '#94a3b8' }}>(Opsional)</span>}
                  </td>
                  <td>
                    <select
                      className={`excel-col-select ${!isMapped ? 'optional-select' : ''}`}
                      value={row.excel_col}
                      onChange={(e) => handleColumnChange(row.no, e.target.value)}
                    >
                      {availableSourceCols.map((col) => (
                        <option key={col} value={col}>
                          {col}
                        </option>
                      ))}
                    </select>
                  </td>
                  <td>
                    <input
                      type="text"
                      value={row.field_db}
                      onChange={(e) => handleRowFieldChange(row.no, 'field_db', e.target.value)}
                      style={{
                        background: '#f8fafc',
                        border: '1px solid #e2e8f0',
                        borderRadius: '4px',
                        fontFamily: 'monospace',
                        color: '#475569',
                        fontSize: '0.78rem',
                        padding: '3px 8px',
                        width: '85%'
                      }}
                    />
                  </td>
                  <td>
                    <select
                      value={row.data_type}
                      onChange={(e) => handleRowFieldChange(row.no, 'data_type', e.target.value)}
                      style={{
                        background: '#f1f5f9',
                        border: '1px solid #cbd5e1',
                        borderRadius: '4px',
                        fontSize: '0.75rem',
                        fontWeight: 600,
                        padding: '2px 6px',
                        color: '#334155'
                      }}
                    >
                      <option value="VARCHAR">VARCHAR</option>
                      <option value="TEXT">TEXT</option>
                      <option value="NUMERIC">NUMERIC</option>
                      <option value="DATE">DATE</option>
                      <option value="INTEGER">INTEGER</option>
                    </select>
                  </td>
                  <td style={{ textAlign: 'center' }}>
                    <button
                      type="button"
                      onClick={() => handleDeleteRow(row.no)}
                      title="Hapus baris mapping ini"
                      style={{
                        background: 'transparent',
                        border: 'none',
                        color: '#94a3b8',
                        cursor: 'pointer',
                        padding: '4px'
                      }}
                      onMouseEnter={(e) => e.currentTarget.style.color = '#ef4444'}
                      onMouseLeave={(e) => e.currentTarget.style.color = '#94a3b8'}
                    >
                      <Trash2 size={15} />
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>

        {/* Bottom Actions Bar */}
        <div className="mapping-actions-bar">
          <div className="mapping-actions-left">
            <button className="btn-secondary-action" onClick={handleReset}>
              <RotateCcw size={14} style={{ display: 'inline', marginRight: 6 }} />
              Reset Pemetaan
            </button>
            <button className="btn-secondary-action" onClick={handleAutoMatch}>
              <Sparkles size={14} style={{ display: 'inline', marginRight: 6, color: '#059669' }} />
              Auto-Match Kolom
            </button>
            <button className="btn-secondary-action" onClick={handleAddRow}>
              <Plus size={14} style={{ display: 'inline', marginRight: 6, color: '#4f46e5' }} />
              Tambah Baris
            </button>
          </div>

          <div className="mapping-actions-right">
            <button className="btn-link-back" onClick={onBack}>
              Kembali
            </button>
            <button
              className="btn-primary-parse"
              onClick={() => {
                if (isAiEnabled) {
                  // Direct run AI parsing with current settings
                  handleProcessAiParsing({
                    targetColumns: ['Nama Kapal', 'Type of Vessel', 'Code Kapal', 'Size of Vessel', 'Year of Built', 'Type of Material', 'Classification'],
                    sourceMapping: { 'Type of Vessel': 'fac_risk + fac_desc' },
                    promptTemplate: 'Ekstrak entitas kapal multi-vessel exploding.'
                  });
                } else {
                  onStartParsing({ fileInfo, mappings, templateName: selectedTemplateName, targetSchema });
                }
              }}
            >
              <span>{isAiEnabled ? '⚡ Proses AI Parsing' : 'Simpan & Lanjutkan ETL'}</span>
              <ArrowRight size={16} />
            </button>
          </div>
        </div>
      </div>

      {/* AI SETTING CARD (Positioned Underneath Mapping Table) */}
      <AiSettingCard
        isAiEnabled={isAiEnabled}
        onToggleAi={() => setIsAiEnabled((prev) => !prev)}
        sourceColumns={detectedColumns}
        onProcessAi={handleProcessAiParsing}
        isProcessing={isProcessingAi}
      />

      {/* AI Result Preview Modal with Before vs After Comparison */}
      <AiResultPreviewModal
        isOpen={isPreviewModalOpen}
        onClose={() => setIsPreviewModalOpen(false)}
        onGoToDashboard={handleGoToDashboard}
        resultData={aiParseResult}
      />
    </div>
  );
}
