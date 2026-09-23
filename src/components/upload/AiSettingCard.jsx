import React, { useState, useEffect } from 'react';
import { Sparkles, Brain, Check, Plus, Trash2, Save, Play, Settings2, HelpCircle, X, RotateCcw } from 'lucide-react';
import facLensService from '../../services/facLensService';

const DEFAULT_TARGET_COLUMNS = [
  'Nama Kapal',
  'Type of Vessel',
  'Code Kapal',
  'Size of Vessel',
  'Year of Built',
  'Type of Material',
  'Classification'
];

export default function AiSettingCard({
  isAiEnabled = false,
  onToggleAi,
  sourceColumns = [],
  onProcessAi,
  isProcessing = false
}) {
  const [selectedTargetColumns, setSelectedTargetColumns] = useState(DEFAULT_TARGET_COLUMNS);
  const [customTargetInput, setCustomTargetInput] = useState('');
  
  // Source column assignment per target column
  const [columnSourceMap, setColumnSourceMap] = useState({
    'Nama Kapal': 'fac_desc',
    'Type of Vessel': 'fac_risk + fac_desc',
    'Code Kapal': 'fac_desc',
    'Size of Vessel': 'fac_desc',
    'Year of Built': 'fac_desc',
    'Type of Material': 'fac_desc',
    'Classification': 'fac_desc'
  });

  const [promptTemplates, setPromptTemplates] = useState([]);
  const [selectedTemplateName, setSelectedTemplateName] = useState(
    'Ekstraksi & Explode Entitas Kapal Marine Hull (Multi-Vessel to Rows)'
  );
  const [promptText, setPromptText] = useState(
    'Anda adalah Senior Data Warehouse Engineer & Marine Insurance Specialist. Ekstrak entitas kapal individual dari deskripsi mentah. Jika 1 baris mengandung >1 kapal, explode menjadi baris terpisah (1 kapal = 1 baris). Ekstrak: Nama Kapal, Type of Vessel, Code Kapal, Size of Vessel, Year of Built, Type of Material, Classification.'
  );

  const [isSavingNewTemplate, setIsSavingNewTemplate] = useState(false);
  const [newTemplateName, setNewTemplateName] = useState('');
  const [notice, setNotice] = useState('');

  // Load saved prompt templates
  useEffect(() => {
    async function loadTemplates() {
      const templates = await facLensService.getAiPromptTemplates();
      if (templates && templates.length > 0) {
        setPromptTemplates(templates);
      }
    }
    loadTemplates();
  }, []);

  // Remove a target column (can remove any column)
  const handleRemoveTargetColumn = (colToRemove) => {
    setSelectedTargetColumns((prev) => prev.filter((c) => c !== colToRemove));
    setColumnSourceMap((prev) => {
      const copy = { ...prev };
      delete copy[colToRemove];
      return copy;
    });
  };

  // Add a new target column (custom or restored)
  const handleAddCustomTarget = () => {
    if (!customTargetInput || !customTargetInput.trim()) return;
    const trimmed = customTargetInput.trim();
    if (!selectedTargetColumns.includes(trimmed)) {
      setSelectedTargetColumns((prev) => [...prev, trimmed]);
      setColumnSourceMap((prev) => ({
        ...prev,
        [trimmed]: trimmed === 'Type of Vessel' ? 'fac_risk + fac_desc' : 'fac_desc'
      }));
    }
    setCustomTargetInput('');
  };

  // Reset target columns to standard defaults
  const handleResetToDefaultTargets = () => {
    setSelectedTargetColumns(DEFAULT_TARGET_COLUMNS);
    setColumnSourceMap({
      'Nama Kapal': 'fac_desc',
      'Type of Vessel': 'fac_risk + fac_desc',
      'Code Kapal': 'fac_desc',
      'Size of Vessel': 'fac_desc',
      'Year of Built': 'fac_desc',
      'Type of Material': 'fac_desc',
      'Classification': 'fac_desc'
    });
  };

  const handleSourceChange = (targetCol, sourceCol) => {
    setColumnSourceMap((prev) => ({
      ...prev,
      [targetCol]: sourceCol
    }));
  };

  const handleTemplateSelect = (name) => {
    setSelectedTemplateName(name);
    const found = promptTemplates.find((t) => t.name === name);
    if (found) {
      setPromptText(found.prompt_text);
      if (found.target_columns && found.target_columns.length > 0) {
        setSelectedTargetColumns(found.target_columns);
      }
      if (found.source_columns && Object.keys(found.source_columns).length > 0) {
        setColumnSourceMap(found.source_columns);
      }
    }
  };

  const handleSavePromptTemplate = async () => {
    if (!newTemplateName.trim()) return;
    try {
      await facLensService.saveAiPromptTemplate({
        name: newTemplateName.trim(),
        description: `Template prompt kustom disimpan pada ${new Date().toLocaleDateString('id-ID')}`,
        prompt_text: promptText,
        target_columns: selectedTargetColumns,
        source_columns: columnSourceMap
      });
      setNotice(`Template prompt '${newTemplateName}' berhasil disimpan.`);
      setIsSavingNewTemplate(false);
      setNewTemplateName('');
      const templates = await facLensService.getAiPromptTemplates();
      setPromptTemplates(templates);
      setTimeout(() => setNotice(''), 3000);
    } catch (err) {
      alert('Gagal menyimpan template prompt: ' + err.message);
    }
  };

  const handleTriggerProcess = () => {
    onProcessAi({
      targetColumns: selectedTargetColumns,
      sourceMapping: columnSourceMap,
      promptTemplate: promptText,
      templateName: selectedTemplateName
    });
  };

  // Curated list of available sources from file & known fields
  const availableSourceOptions = Array.from(new Set([
    'fac_desc',
    'fac_risk + fac_desc',
    'fac_risk',
    'fac_code',
    'fac_cedant',
    'fac_broker',
    'fac_insured',
    'currency',
    'fac_totsi',
    'fac_our_amt',
    ...sourceColumns.filter(Boolean)
  ]));

  return (
    <div style={{
      background: '#ffffff',
      border: '1px solid #e2e8f0',
      borderRadius: '16px',
      padding: '24px',
      marginTop: '20px',
      marginBottom: '24px',
      color: '#1e293b',
      boxShadow: '0 2px 8px rgba(0, 0, 0, 0.04)',
      transition: 'all 0.25s ease'
    }}>
      {/* Header with ON/OFF Toggle */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '16px',
        borderBottom: '1px solid #f1f5f9',
        paddingBottom: '16px',
        marginBottom: '20px'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
          <div style={{
            width: 42,
            height: 42,
            borderRadius: '10px',
            background: isAiEnabled ? '#eef2ff' : '#f1f5f9',
            color: isAiEnabled ? '#4f46e5' : '#64748b',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            border: isAiEnabled ? '1px solid #c7d2fe' : '1px solid #e2e8f0'
          }}>
            <Brain size={22} />
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 700, color: '#0f172a' }}>
                AI Setting & Entity Extraction
              </h3>
              <span style={{
                background: isAiEnabled ? '#f5f3ff' : '#f8fafc',
                color: isAiEnabled ? '#6366f1' : '#64748b',
                border: isAiEnabled ? '1px solid #ddd6fe' : '1px solid #e2e8f0',
                padding: '2px 8px',
                borderRadius: '6px',
                fontSize: '0.72rem',
                fontWeight: 700
              }}>
                AI Entity Resolution Engine
              </span>
            </div>
            <p style={{
              margin: '3px 0 0 0',
              fontSize: '0.82rem',
              color: '#64748b'
            }}>
              {isAiEnabled
                ? 'Model AI aktif untuk memecah data teks jamak menjadi baris individual terstruktur (Multi-Vessel Exploding)'
                : 'Nonaktif: Pemetaan berjalan kolom-ke-kolom standar tanpa pemrosesan bahasa alami (NLP)'}
            </p>
          </div>
        </div>

        {/* Toggle Switch */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <span style={{
            fontSize: '0.82rem',
            fontWeight: 700,
            color: isAiEnabled ? '#4f46e5' : '#64748b'
          }}>
            AI PARSING {isAiEnabled ? 'ON' : 'OFF'}
          </span>
          <button
            type="button"
            onClick={onToggleAi}
            style={{
              width: 52,
              height: 28,
              borderRadius: '999px',
              background: isAiEnabled ? '#4f46e5' : '#cbd5e1',
              border: 'none',
              cursor: 'pointer',
              position: 'relative',
              padding: 2,
              transition: 'background 0.25s ease'
            }}
            title={isAiEnabled ? 'Nonaktifkan AI Setting' : 'Aktifkan AI Setting'}
          >
            <div style={{
              width: 24,
              height: 24,
              borderRadius: '50%',
              background: '#ffffff',
              transform: isAiEnabled ? 'translateX(24px)' : 'translateX(0px)',
              transition: 'transform 0.25s ease',
              boxShadow: '0 2px 4px rgba(0,0,0,0.15)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              {isAiEnabled && <Sparkles size={13} color="#4f46e5" />}
            </div>
          </button>
        </div>
      </div>

      {notice && (
        <div style={{
          background: '#f0fdf4',
          border: '1px solid #bbf7d0',
          color: '#15803d',
          padding: '8px 14px',
          borderRadius: '8px',
          fontSize: '0.8rem',
          fontWeight: 600,
          marginBottom: '16px'
        }}>
          ✓ {notice}
        </div>
      )}

      {/* Main Content when AI is ON */}
      {isAiEnabled && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '22px' }}>
          {/* Section 1: Target Columns (Bisa dikurangi & ditambah) */}
          <div style={{
            background: '#f8fafc',
            border: '1px solid #e2e8f0',
            borderRadius: '12px',
            padding: '16px 18px'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '10px', flexWrap: 'wrap', gap: '8px' }}>
              <div>
                <label style={{ fontSize: '0.86rem', fontWeight: 700, color: '#0f172a' }}>
                  1. Kolom Target Ekstraksi (Dapat Ditambah / Dihapus):
                </label>
                <div style={{ fontSize: '0.75rem', color: '#64748b', marginTop: 2 }}>
                  Klik tombol <strong>×</strong> pada tag untuk menghapus, atau gunakan input di bawah untuk menambah kolom tujuan kustom.
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <span style={{
                  background: '#eef2ff',
                  color: '#4f46e5',
                  padding: '3px 8px',
                  borderRadius: '6px',
                  fontSize: '0.74rem',
                  fontWeight: 700
                }}>
                  {selectedTargetColumns.length} Kolom Aktif
                </span>
                {selectedTargetColumns.length < DEFAULT_TARGET_COLUMNS.length && (
                  <button
                    type="button"
                    onClick={handleResetToDefaultTargets}
                    style={{
                      background: '#ffffff',
                      border: '1px solid #cbd5e1',
                      borderRadius: '6px',
                      padding: '3px 10px',
                      fontSize: '0.74rem',
                      fontWeight: 600,
                      color: '#475569',
                      cursor: 'pointer',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: 4
                    }}
                    title="Pulihkan kolom standar awal"
                  >
                    <RotateCcw size={12} />
                    <span>Reset Standar</span>
                  </button>
                )}
              </div>
            </div>

            {/* Active Target Column Tags with Clear (X) delete button */}
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginBottom: '12px' }}>
              {selectedTargetColumns.map((col) => (
                <div
                  key={col}
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '6px',
                    padding: '5px 10px',
                    borderRadius: '8px',
                    fontSize: '0.8rem',
                    fontWeight: 600,
                    border: '1px solid #c7d2fe',
                    background: '#eef2ff',
                    color: '#3730a3',
                    boxShadow: '0 1px 2px rgba(99, 102, 241, 0.05)'
                  }}
                >
                  <span>{col}</span>
                  <button
                    type="button"
                    onClick={() => handleRemoveTargetColumn(col)}
                    style={{
                      background: 'rgba(79, 70, 229, 0.12)',
                      border: 'none',
                      borderRadius: '50%',
                      width: 18,
                      height: 18,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: '#4338ca',
                      cursor: 'pointer',
                      padding: 0,
                      transition: 'background 0.15s ease'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.background = '#ef4444';
                      e.currentTarget.style.color = '#ffffff';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.background = 'rgba(79, 70, 229, 0.12)';
                      e.currentTarget.style.color = '#4338ca';
                    }}
                    title={`Hapus kolom target '${col}'`}
                  >
                    <X size={12} />
                  </button>
                </div>
              ))}

              {selectedTargetColumns.length === 0 && (
                <div style={{ fontSize: '0.8rem', color: '#94a3b8', fontStyle: 'italic', padding: '6px 0' }}>
                  Belum ada kolom target yang dipilih. Silakan ketik nama kolom di bawah untuk menambahkannya.
                </div>
              )}
            </div>

            {/* Add Custom Column Input */}
            <div style={{ display: 'flex', gap: '8px', maxWidth: 440 }}>
              <input
                type="text"
                placeholder="+ Tambah kolom tujuan (misal: Nomor IMO, Kapasitas Muat)..."
                value={customTargetInput}
                onChange={(e) => setCustomTargetInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleAddCustomTarget()}
                style={{
                  flex: 1,
                  background: '#ffffff',
                  border: '1px solid #cbd5e1',
                  borderRadius: '8px',
                  padding: '7px 12px',
                  fontSize: '0.82rem',
                  color: '#0f172a',
                  outline: 'none'
                }}
              />
              <button
                type="button"
                onClick={handleAddCustomTarget}
                disabled={!customTargetInput.trim()}
                style={{
                  background: customTargetInput.trim() ? '#4f46e5' : '#94a3b8',
                  border: 'none',
                  borderRadius: '8px',
                  padding: '7px 16px',
                  color: '#ffffff',
                  fontSize: '0.82rem',
                  fontWeight: 600,
                  cursor: customTargetInput.trim() ? 'pointer' : 'not-allowed',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '4px'
                }}
              >
                <Plus size={14} />
                <span>Tambah</span>
              </button>
            </div>
          </div>

          {/* Section 2: Source Column Mapping per Target Column */}
          <div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '10px' }}>
              <label style={{ fontSize: '0.86rem', fontWeight: 700, color: '#0f172a' }}>
                2. Pemetaan Kolom Sumber (Source Column per Target):
              </label>
              <span style={{ fontSize: '0.74rem', color: '#64748b' }}>
                💡 Mendukung kombinasi sumber multi-kolom (misal: fac_risk + fac_desc)
              </span>
            </div>

            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
              gap: '10px'
            }}>
              {selectedTargetColumns.map((targetCol) => {
                const isVesselType = targetCol === 'Type of Vessel';
                const currentVal = columnSourceMap[targetCol] || (isVesselType ? 'fac_risk + fac_desc' : 'fac_desc');

                return (
                  <div
                    key={targetCol}
                    style={{
                      background: '#f8fafc',
                      border: '1px solid #e2e8f0',
                      borderRadius: '8px',
                      padding: '10px 14px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      gap: '10px'
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span style={{ fontSize: '0.82rem', fontWeight: 600, color: '#1e293b' }}>
                        {targetCol}
                      </span>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <span style={{ fontSize: '0.7rem', color: '#94a3b8' }}>←</span>
                      <select
                        value={currentVal}
                        onChange={(e) => handleSourceChange(targetCol, e.target.value)}
                        style={{
                          background: '#ffffff',
                          border: isVesselType ? '1px solid #818cf8' : '1px solid #cbd5e1',
                          borderRadius: '6px',
                          color: '#0f172a',
                          padding: '5px 8px',
                          fontSize: '0.78rem',
                          outline: 'none',
                          fontWeight: 500,
                          cursor: 'pointer'
                        }}
                      >
                        {availableSourceOptions.map((opt) => (
                          <option key={opt} value={opt}>
                            {opt === 'fac_risk + fac_desc' ? '⭐ fac_risk + fac_desc (Kombinasi)' : opt}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Section 3: Prompt Template & Instruction Editor */}
          <div style={{
            background: '#f8fafc',
            border: '1px solid #e2e8f0',
            borderRadius: '12px',
            padding: '16px 18px'
          }}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginBottom: '10px',
              flexWrap: 'wrap',
              gap: '10px'
            }}>
              <label style={{ fontSize: '0.86rem', fontWeight: 700, color: '#0f172a' }}>
                3. Instruksi Prompt AI Engine:
              </label>

              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <select
                  value={selectedTemplateName}
                  onChange={(e) => handleTemplateSelect(e.target.value)}
                  style={{
                    background: '#ffffff',
                    border: '1px solid #cbd5e1',
                    borderRadius: '6px',
                    color: '#0f172a',
                    padding: '5px 10px',
                    fontSize: '0.78rem',
                    fontWeight: 600,
                    outline: 'none',
                    cursor: 'pointer',
                    maxWidth: 320
                  }}
                >
                  <option value="Ekstraksi & Explode Entitas Kapal Marine Hull (Multi-Vessel to Rows)">
                    📋 Template Kapal Marine Hull (Explode Multi-Vessel)
                  </option>
                  {promptTemplates
                    .filter((t) => !t.name.includes('Marine Hull'))
                    .map((t) => (
                      <option key={t.id} value={t.name}>
                        {t.name}
                      </option>
                    ))}
                </select>

                <button
                  type="button"
                  onClick={() => setIsSavingNewTemplate((prev) => !prev)}
                  style={{
                    background: '#ffffff',
                    border: '1px solid #cbd5e1',
                    borderRadius: '6px',
                    padding: '5px 10px',
                    fontSize: '0.78rem',
                    color: '#334155',
                    cursor: 'pointer',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '4px',
                    fontWeight: 600
                  }}
                  title="Simpan konfigurasi prompt saat ini"
                >
                  <Save size={12} />
                  <span>Simpan Prompt</span>
                </button>
              </div>
            </div>

            {/* Save Template Prompt Modal / Drawer */}
            {isSavingNewTemplate && (
              <div style={{
                background: '#ffffff',
                border: '1px solid #c7d2fe',
                borderRadius: '8px',
                padding: '12px',
                marginBottom: '10px',
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
              }}>
                <input
                  type="text"
                  placeholder="Nama template prompt baru..."
                  value={newTemplateName}
                  onChange={(e) => setNewTemplateName(e.target.value)}
                  style={{
                    flex: 1,
                    background: '#f8fafc',
                    border: '1px solid #cbd5e1',
                    borderRadius: '6px',
                    padding: '6px 10px',
                    fontSize: '0.8rem',
                    color: '#0f172a'
                  }}
                />
                <button
                  type="button"
                  onClick={handleSavePromptTemplate}
                  disabled={!newTemplateName.trim()}
                  style={{
                    background: '#4f46e5',
                    border: 'none',
                    borderRadius: '6px',
                    padding: '6px 14px',
                    color: '#ffffff',
                    fontSize: '0.8rem',
                    fontWeight: 600,
                    cursor: newTemplateName.trim() ? 'pointer' : 'not-allowed'
                  }}
                >
                  Simpan
                </button>
                <button
                  type="button"
                  onClick={() => setIsSavingNewTemplate(false)}
                  style={{
                    background: '#f1f5f9',
                    border: 'none',
                    borderRadius: '6px',
                    padding: '6px 10px',
                    color: '#64748b',
                    fontSize: '0.8rem',
                    cursor: 'pointer'
                  }}
                >
                  Batal
                </button>
              </div>
            )}

            <textarea
              value={promptText}
              onChange={(e) => setPromptText(e.target.value)}
              rows={3}
              style={{
                width: '100%',
                background: '#ffffff',
                border: '1px solid #cbd5e1',
                borderRadius: '8px',
                padding: '10px 12px',
                fontSize: '0.82rem',
                color: '#0f172a',
                lineHeight: 1.5,
                outline: 'none',
                fontFamily: 'inherit',
                resize: 'vertical'
              }}
            />
          </div>

          {/* Section 4: Action Button */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            borderTop: '1px solid #f1f5f9',
            paddingTop: '16px',
            flexWrap: 'wrap',
            gap: '12px'
          }}>
            <div style={{ fontSize: '0.8rem', color: '#64748b', display: 'flex', alignItems: 'center', gap: 6 }}>
              <span>⚡</span>
              <span>Menjalankan ekstraksi & normalisasi otomatis menggunakan AI Parsing Engine untuk memetakan entitas kapal ke tabel granular DWH.</span>
            </div>

            <button
              type="button"
              onClick={handleTriggerProcess}
              disabled={isProcessing || selectedTargetColumns.length === 0}
              style={{
                background: isProcessing
                  ? '#94a3b8'
                  : 'linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%)',
                border: 'none',
                borderRadius: '10px',
                padding: '10px 22px',
                color: '#ffffff',
                fontSize: '0.88rem',
                fontWeight: 700,
                cursor: (isProcessing || selectedTargetColumns.length === 0) ? 'not-allowed' : 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                boxShadow: '0 2px 8px rgba(79, 70, 229, 0.3)',
                transition: 'all 0.2s ease'
              }}
            >
              {isProcessing ? (
                <>
                  <span className="corporate-spinner" style={{ width: 16, height: 16, borderTopColor: '#ffffff' }} />
                  <span>Sedang Memproses AI...</span>
                </>
              ) : (
                <>
                  <Sparkles size={16} />
                  <span>Proses AI Parsing Engine</span>
                </>
              )}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
