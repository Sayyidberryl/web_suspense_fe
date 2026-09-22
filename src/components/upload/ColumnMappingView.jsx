import React, { useState, useEffect } from 'react';
import { ArrowRight, RotateCcw, Sparkles, CheckCircle2, ShieldCheck } from 'lucide-react';
import mappingService, {
  AVAILABLE_EXCEL_COLUMNS,
  SYSTEM_TEMPLATES
} from '../../services/mappingService';
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
  onStartParsing
}) {
  const [templates, setTemplates] = useState(SYSTEM_TEMPLATES);
  const [selectedTemplateName, setSelectedTemplateName] = useState(
    fileInfo.mappingTemplate || 'Template Akseptasi (Marine Hull)'
  );
  const [mappings, setMappings] = useState(() =>
    mappingService.getDefaultMappings(fileInfo.mappingTemplate || 'Template Akseptasi (Marine Hull)')
  );
  const [notification, setNotification] = useState('');

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
    showNotice(`Kolom berhasil dicocokkan otomatis (${mappings.length} kolom dari MR11 Raw)!`);
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
      cob: 'Marine Hull',
      target_schema: targetSchema,
      column_count: mappings.length,
      mappings
    });
    showNotice(`Template '${selectedTemplateName}' berhasil disimpan.`);
  };

  const handleAddTemplate = () => {
    const newName = prompt('Masukkan nama template konfigurasi pemetaan baru (Marine Hull):');
    if (newName && newName.trim()) {
      const trimmed = newName.trim();
      setSelectedTemplateName(trimmed);
      mappingService.saveTemplate({
        name: trimmed,
        cob: 'Marine Hull',
        target_schema: targetSchema,
        column_count: mappings.length,
        mappings
      });
      setTemplates((prev) => [
        ...prev,
        {
          id: Date.now(),
          name: trimmed,
          cob: 'Marine Hull',
          target_schema: targetSchema,
          column_count: mappings.length,
          mappings
        }
      ]);
      showNotice(`Template baru '${trimmed}' berhasil dibuat.`);
    }
  };

  const showNotice = (msg) => {
    setNotification(msg);
    setTimeout(() => setNotification(''), 3500);
  };

  const mappedCount = mappings.filter((m) => m.excel_col !== '-- Pilih Kolom Excel --').length;
  const optionalCount = mappings.filter((m) => m.is_optional).length;

  return (
    <div className="mapping-container">
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
          gap: '8px'
        }}>
          <CheckCircle2 size={16} color="#2563eb" />
          <span>{notification}</span>
        </div>
      )}

      {/* Top 2 Cards: Mapping Controls & File Input */}
      <div className="mapping-top-grid">
        {/* Dark Mapping Bar */}
        <div className="mapping-control-card">
          <div className="mapping-control-header">
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <h2 className="mapping-control-title">Mapping</h2>
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
                <span>COB: Marine Hull (Tersedia)</span>
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

            <button className="btn-ctrl-action" onClick={handleAddTemplate} title="Tambah template baru">
              Add
            </button>
            <button className="btn-ctrl-action" onClick={handleSaveTemplate} title="Simpan template saat ini">
              Save
            </button>
            <button
              className="btn-ctrl-action delete-btn"
              onClick={() => showNotice('Template default sistem dilindungi dan tidak dapat dihapus.')}
              title="Hapus template"
            >
              Delete
            </button>
          </div>
        </div>

        {/* File Input Card */}
        <div className="file-input-card">
          <div className="file-input-header">
            <span className="file-input-title">FILE INPUT CONTOH</span>
            <span className="badge-tag-ready">Siap Dipetakan</span>
          </div>

          <div className="file-badge-pill">
            <div className="file-badge-left">
              <span className="xls-icon-box">XLS</span>
              <div className="file-badge-texts">
                <h4>{fileInfo.fileName || 'mr11_raw_data_export.xlsx'}</h4>
                <p>{fileInfo.fileSize || '41.4 MB'} • 179 Kolom Terdeteksi (MR11 Raw)</p>
              </div>
            </div>

            <button className="btn-cancel-file" onClick={onCancel}>
              Batal
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
              Petakan 179 kolom sumber dari <code>mr11_raw_data_export.xlsx</code> ke atribut database <strong>{targetSchema}</strong> ({mappings.length} kolom).
            </p>
          </div>

          <div className="mapping-stats-badges">
            <span className="stat-pill mapped">{mappedCount} Terpetakan</span>
            <span className="stat-pill optional">{optionalCount} Opsional</span>
            <span style={{
              background: '#f8fafc',
              border: '1px solid #cbd5e1',
              color: '#475569',
              padding: '4px 10px',
              borderRadius: '6px',
              fontSize: '0.78rem',
              fontWeight: 600
            }}>
              Total: {mappings.length} Kolom
            </span>
          </div>
        </div>

        <table className="mapping-table">
          <thead>
            <tr>
              <th style={{ width: 45 }}>NO</th>
              <th style={{ width: 280 }}>FORMAT STANDAR IPR</th>
              <th style={{ width: 300 }}>KOLOM SUMBER (EXCEL MR11 RAW)</th>
              <th style={{ width: 220 }}>FIELD DATABASE</th>
              <th style={{ width: 110 }}>TIPE DATA</th>
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
                    <strong>{row.standard_name}</strong>
                    {isOptional && <span style={{ marginLeft: 6, fontSize: '0.7rem', color: '#94a3b8' }}>(Opsional)</span>}
                  </td>
                  <td>
                    <select
                      className={`excel-col-select ${!isMapped ? 'optional-select' : ''}`}
                      value={row.excel_col}
                      onChange={(e) => handleColumnChange(row.no, e.target.value)}
                    >
                      {AVAILABLE_EXCEL_COLUMNS.map((col) => (
                        <option key={col} value={col}>
                          {col}
                        </option>
                      ))}
                    </select>
                  </td>
                  <td>
                    <span className="db-field-pill">{row.field_db}</span>
                  </td>
                  <td>
                    <span className="data-type-label">{row.data_type}</span>
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
              Auto-Match Kolom MR11
            </button>
          </div>

          <div className="mapping-actions-right">
            <button className="btn-link-back" onClick={onBack}>
              Kembali
            </button>
            <button
              className="btn-primary-parse"
              onClick={() => onStartParsing({ fileInfo, mappings, templateName: selectedTemplateName, targetSchema })}
            >
              <span>Simpan & Lanjutkan Parsing</span>
              <ArrowRight size={16} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
