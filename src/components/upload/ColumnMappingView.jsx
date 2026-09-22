import React, { useState, useEffect } from 'react';
import { ArrowRight, RotateCcw, Sparkles } from 'lucide-react';
import mappingService, { DEFAULT_MAPPINGS, AVAILABLE_EXCEL_COLUMNS } from '../../services/mappingService';
import '../../styles/mapping.css';

export default function ColumnMappingView({
  fileInfo = {
    fileName: 'Bordero_TriPakarta_Fire_Q3_2026.xlsx',
    fileSize: '1.8 MB',
    cob: 'Fire & Property',
    mappingTemplate: 'Format Standar Bordero TriPakarta Fire 2026'
  },
  onBack,
  onCancel,
  onStartParsing
}) {
  const [templates, setTemplates] = useState([]);
  const [selectedTemplateName, setSelectedTemplateName] = useState(
    fileInfo.mappingTemplate || 'Format Standar Bordero TriPakarta Fire 2026'
  );
  const [mappings, setMappings] = useState(DEFAULT_MAPPINGS);
  const [notification, setNotification] = useState('');

  useEffect(() => {
    async function loadTemplates() {
      const list = await mappingService.getTemplates();
      setTemplates(list);
    }
    loadTemplates();
  }, []);

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
        let bestMatch = row.excel_col;
        if (row.standard_name === 'NO') bestMatch = 'No';
        else if (row.standard_name === 'COB') bestMatch = 'COB';
        else if (row.standard_name.includes('CLAIM')) bestMatch = 'REGISTER NO.';
        else if (row.standard_name.includes('POLICY')) bestMatch = 'POLICY NUMBER';
        else if (row.standard_name.includes('CERTIFICATE')) bestMatch = 'CERTIFICATE NO';
        else if (row.standard_name.includes('Reff No')) bestMatch = 'REFF BORDEREAUX';
        else if (row.standard_name.includes('INSURED NAME')) bestMatch = 'NAMA TERTANGGUNG';
        else if (row.standard_name.includes('SUM INSURED')) bestMatch = 'TSI ORIGINAL';

        return {
          ...row,
          excel_col: bestMatch,
          status: bestMatch !== '-- Pilih Kolom Excel --' ? 'mapped' : row.is_optional ? 'optional' : 'unmapped'
        };
      })
    );
    showNotice('Kolom berhasil dicocokkan otomatis (Auto-Matched 8 kolom)!');
  };

  const handleReset = () => {
    setMappings(
      DEFAULT_MAPPINGS.map((m) => ({
        ...m,
        excel_col: '-- Pilih Kolom Excel --',
        status: m.is_optional ? 'optional' : 'unmapped'
      }))
    );
    showNotice('Pemetaan kolom telah direset.');
  };

  const handleSaveTemplate = async () => {
    await mappingService.saveTemplate({
      name: selectedTemplateName,
      target_schema: 'ipr_stage_db',
      mappings
    });
    showNotice(`Template '${selectedTemplateName}' berhasil disimpan.`);
  };

  const handleAddTemplate = () => {
    const newName = prompt('Masukkan nama template konfigurasi pemetaan baru:');
    if (newName && newName.trim()) {
      setSelectedTemplateName(newName.trim());
      handleSaveTemplate();
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
          fontWeight: 600
        }}>
          {notification}
        </div>
      )}

      {/* Top 2 Cards: Mapping Controls & File Input (Mockup 3) */}
      <div className="mapping-top-grid">
        {/* Dark Mapping Bar */}
        <div className="mapping-control-card">
          <div className="mapping-control-header">
            <h2 className="mapping-control-title">Mapping</h2>
            <div className="target-schema-tag">
              Target Schema: <strong>ipr_stage_db</strong>
            </div>
          </div>

          <div className="mapping-control-actions">
            <select
              className="mapping-template-select"
              value={selectedTemplateName}
              onChange={(e) => setSelectedTemplateName(e.target.value)}
            >
              <option value="Format Standar Bordero TriPakarta Fire 2026">
                Format Standar Bordero TriPakarta Fire 2026
              </option>
              {templates
                .filter((t) => t.name !== 'Format Standar Bordero TriPakarta Fire 2026')
                .map((t) => (
                  <option key={t.id || t.name} value={t.name}>
                    {t.name}
                  </option>
                ))}
            </select>

            <button className="btn-ctrl-action" onClick={handleAddTemplate}>
              Add
            </button>
            <button className="btn-ctrl-action" onClick={handleSaveTemplate}>
              Save
            </button>
            <button
              className="btn-ctrl-action delete-btn"
              onClick={() => showNotice('Template default sistem dilindungi.')}
            >
              Delete
            </button>
          </div>
        </div>

        {/* File Input Card */}
        <div className="file-input-card">
          <div className="file-input-header">
            <span className="file-input-title">FILE INPUT</span>
            <span className="badge-tag-ready">Siap Dipetakan</span>
          </div>

          <div className="file-badge-pill">
            <div className="file-badge-left">
              <span className="xls-icon-box">XLS</span>
              <div className="file-badge-texts">
                <h4>{fileInfo.fileName || 'Bordero_TriPakarta_Fire_Q3_2026.xlsx'}</h4>
                <p>{fileInfo.fileSize || '1.8 MB'} • 24 Kolom Terdeteksi</p>
              </div>
            </div>

            <button className="btn-cancel-file" onClick={onCancel}>
              Batal
            </button>
          </div>
        </div>
      </div>

      {/* Column Mapping Configuration Table (Mockup 3) */}
      <div className="mapping-table-card">
        <div className="mapping-table-header">
          <div>
            <h3 className="mapping-table-title">Tabel Konfigurasi Pemetaan Kolom</h3>
            <p className="mapping-table-subtitle">
              Petakan kolom sumber excel ke format atribut standar database IPR
            </p>
          </div>

          <div className="mapping-stats-badges">
            <span className="stat-pill mapped">{mappedCount} Terpetakan</span>
            <span className="stat-pill optional">{optionalCount} Opsional</span>
          </div>
        </div>

        <table className="mapping-table">
          <thead>
            <tr>
              <th style={{ width: 40 }}>NO</th>
              <th style={{ width: 280 }}>FORMAT STANDAR IPR</th>
              <th style={{ width: 280 }}>KOLOM SUMBER (EXCEL)</th>
              <th style={{ width: 220 }}>FIELD DATABASE</th>
              <th style={{ width: 120 }}>TIPE DATA</th>
            </tr>
          </thead>
          <tbody>
            {mappings.map((row) => {
              const isOptional = row.is_optional;
              const isMapped = row.excel_col !== '-- Pilih Kolom Excel --';
              const statusClass = isMapped ? 'status-mapped' : isOptional ? 'status-optional' : '';

              return (
                <tr key={row.no} className={`mapping-row ${statusClass}`}>
                  <td style={{ fontWeight: 700, color: '#334155' }}>{row.no}</td>
                  <td className="standard-name-cell">{row.standard_name}</td>
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
              Auto-Match Kolom
            </button>
          </div>

          <div className="mapping-actions-right">
            <button className="btn-link-back" onClick={onBack}>
              Kembali
            </button>
            <button
              className="btn-primary-parse"
              onClick={() => onStartParsing({ fileInfo, mappings })}
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
