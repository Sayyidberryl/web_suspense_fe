import React, { useState, useEffect } from 'react';
import { Sparkles, Brain, Check, Plus, Trash2, Save, Play, Settings2, HelpCircle } from 'lucide-react';
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
  // Special combo for 'Type of Vessel': allows composite sources (e.g. fac_risk + fac_desc)
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

  const handleToggleTargetColumn = (col) => {
    setSelectedTargetColumns((prev) => {
      if (prev.includes(col)) {
        if (prev.length === 1) return prev; // Keep at least one
        return prev.filter((c) => c !== col);
      } else {
        return [...prev, col];
      }
    });
  };

  const handleAddCustomTarget = () => {
    if (!customTargetInput || !customTargetInput.trim()) return;
    const trimmed = customTargetInput.trim();
    if (!selectedTargetColumns.includes(trimmed)) {
      setSelectedTargetColumns((prev) => [...prev, trimmed]);
      setColumnSourceMap((prev) => ({ ...prev, [trimmed]: 'fac_desc' }));
    }
    setCustomTargetInput('');
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

  return (
    <div style={{
      background: isAiEnabled
        ? 'linear-gradient(145deg, #0f172a 0%, #1e1b4b 60%, #1e293b 100%)'
        : '#ffffff',
      border: isAiEnabled ? '1px solid #4338ca' : '1px solid #e2e8f0',
      borderRadius: '16px',
      padding: '24px',
      marginBottom: '24px',
      color: isAiEnabled ? '#f8fafc' : '#1e293b',
      boxShadow: isAiEnabled ? '0 10px 25px -5px rgba(67, 56, 202, 0.25)' : '0 2px 6px rgba(0,0,0,0.03)',
      transition: 'all 0.3s ease'
    }}>
      {/* Header with ON/OFF Toggle */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '16px',
        borderBottom: isAiEnabled ? '1px solid rgba(255,255,255,0.1)' : '1px solid #f1f5f9',
        paddingBottom: '18px',
        marginBottom: '20px'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
          <div style={{
            width: 44,
            height: 44,
            borderRadius: '12px',
            background: isAiEnabled
              ? 'linear-gradient(135deg, #6366f1, #a855f7)'
              : '#f1f5f9',
            color: isAiEnabled ? '#ffffff' : '#64748b',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: isAiEnabled ? '0 0 15px rgba(168, 85, 247, 0.5)' : 'none'
          }}>
            <Brain size={22} />
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <h3 style={{ margin: 0, fontSize: '1.15rem', fontWeight: 700, letterSpacing: '-0.02em' }}>
                AI Setting & Entity Extraction
              </h3>
              <span style={{
                background: isAiEnabled ? 'rgba(168, 85, 247, 0.25)' : '#f1f5f9',
                color: isAiEnabled ? '#d8b4fe' : '#64748b',
                border: isAiEnabled ? '1px solid rgba(168, 85, 247, 0.4)' : '1px solid #e2e8f0',
                padding: '2px 8px',
                borderRadius: '6px',
                fontSize: '0.72rem',
                fontWeight: 700
              }}>
                Gemini 3.8 Flash
              </span>
            </div>
            <p style={{
              margin: '4px 0 0 0',
              fontSize: '0.82rem',
              color: isAiEnabled ? '#94a3b8' : '#64748b'
            }}>
              {isAiEnabled
                ? 'Model AI aktif untuk memecah data teks jamak menjadi baris individual (Multi-Vessel Exploding)'
                : 'Nonaktif: Pemetaan berjalan column-to-column standar tanpa pemrosesan bahasa alami (NLP)'}
            </p>
          </div>
        </div>

        {/* Toggle Switch */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <span style={{
            fontSize: '0.85rem',
            fontWeight: 700,
            color: isAiEnabled ? '#a5b4fc' : '#64748b'
          }}>
            AI PARSING {isAiEnabled ? 'ON' : 'OFF'}
          </span>
          <button
            type="button"
            onClick={onToggleAi}
            style={{
              width: 56,
              height: 30,
              borderRadius: '999px',
              background: isAiEnabled ? '#6366f1' : '#cbd5e1',
              border: 'none',
              cursor: 'pointer',
              position: 'relative',
              padding: 3,
              transition: 'background 0.25s ease'
            }}
            title={isAiEnabled ? 'Nonaktifkan AI Setting' : 'Aktifkan AI Setting'}
          >
            <div style={{
              width: 24,
              height: 24,
              borderRadius: '50%',
              background: '#ffffff',
              transform: isAiEnabled ? 'translateX(26px)' : 'translateX(0px)',
              transition: 'transform 0.25s ease',
              boxShadow: '0 2px 4px rgba(0,0,0,0.2)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              {isAiEnabled && <Sparkles size={13} color="#6366f1" />}
            </div>
          </button>
        </div>
      </div>

      {notice && (
        <div style={{
          background: 'rgba(16, 185, 129, 0.15)',
          border: '1px solid rgba(16, 185, 129, 0.4)',
          color: '#34d399',
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
          {/* Section 1: Multi-Select Target Columns */}
          <div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
              <label style={{ fontSize: '0.85rem', fontWeight: 600, color: '#e2e8f0' }}>
                1. Pilih Kolom Tujuan (Multi-Select Entity Target):
              </label>
              <span style={{ fontSize: '0.75rem', color: '#94a3b8' }}>
                {selectedTargetColumns.length} kolom terpilih untuk diekstrak
              </span>
            </div>

            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginBottom: '10px' }}>
              {DEFAULT_TARGET_COLUMNS.map((col) => {
                const isSelected = selectedTargetColumns.includes(col);
                return (
                  <button
                    key={col}
                    type="button"
                    onClick={() => handleToggleTargetColumn(col)}
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '6px',
                      padding: '6px 14px',
                      borderRadius: '8px',
                      fontSize: '0.8rem',
                      fontWeight: 600,
                      cursor: 'pointer',
                      border: isSelected ? '1px solid #818cf8' : '1px solid rgba(255,255,255,0.15)',
                      background: isSelected ? 'rgba(99, 102, 241, 0.25)' : 'rgba(255,255,255,0.05)',
                      color: isSelected ? '#ffffff' : '#94a3b8',
                      transition: 'all 0.15s ease'
                    }}
                  >
                    <span style={{
                      width: 14,
                      height: 14,
                      borderRadius: '4px',
                      border: isSelected ? '1px solid #818cf8' : '1px solid #64748b',
                      background: isSelected ? '#6366f1' : 'transparent',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '0.65rem',
                      color: '#ffffff'
                    }}>
                      {isSelected ? '✓' : ''}
                    </span>
                    <span>{col}</span>
                  </button>
                );
              })}

              {/* Any added custom targets */}
              {selectedTargetColumns
                .filter((col) => !DEFAULT_TARGET_COLUMNS.includes(col))
                .map((col) => (
                  <div
                    key={col}
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '6px',
                      padding: '6px 12px',
                      borderRadius: '8px',
                      fontSize: '0.8rem',
                      fontWeight: 600,
                      border: '1px solid #c084fc',
                      background: 'rgba(192, 132, 252, 0.2)',
                      color: '#f3e8ff'
                    }}
                  >
                    <span>{col}</span>
                    <button
                      type="button"
                      onClick={() => handleToggleTargetColumn(col)}
                      style={{ background: 'none', border: 'none', color: '#f3e8ff', cursor: 'pointer', padding: 0 }}
                    >
                      ×
                    </button>
                  </div>
                ))}
            </div>

            {/* Add custom column target input */}
            <div style={{ display: 'flex', gap: '8px', maxWidth: 360 }}>
              <input
                type="text"
                placeholder="+ Tambah kolom tujuan kustom..."
                value={customTargetInput}
                onChange={(e) => setCustomTargetInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleAddCustomTarget()}
                style={{
                  flex: 1,
                  background: 'rgba(255,255,255,0.08)',
                  border: '1px solid rgba(255,255,255,0.2)',
                  borderRadius: '6px',
                  padding: '6px 12px',
                  fontSize: '0.8rem',
                  color: '#ffffff'
                }}
              />
              <button
                type="button"
                onClick={handleAddCustomTarget}
                style={{
                  background: 'rgba(99, 102, 241, 0.4)',
                  border: '1px solid #818cf8',
                  borderRadius: '6px',
                  padding: '6px 12px',
                  fontSize: '0.8rem',
                  color: '#ffffff',
                  fontWeight: 600,
                  cursor: 'pointer'
                }}
              >
                Tambah
              </button>
            </div>
          </div>

          {/* Section 2: Source Column Mapping per Target Column */}
          <div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '10px' }}>
              <label style={{ fontSize: '0.85rem', fontWeight: 600, color: '#e2e8f0' }}>
                2. Pemetaan Kolom Sumber (Source Column per Target):
              </label>
              <span style={{ fontSize: '0.74rem', color: '#a5b4fc' }}>
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
                      background: 'rgba(255,255,255,0.04)',
                      border: '1px solid rgba(255,255,255,0.1)',
                      borderRadius: '8px',
                      padding: '10px 14px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      gap: '12px'
                    }}
                  >
                    <span style={{ fontSize: '0.82rem', fontWeight: 600, color: '#f1f5f9' }}>
                      {targetCol}
                    </span>

                    <select
                      value={currentVal}
                      onChange={(e) => handleSourceChange(targetCol, e.target.value)}
                      style={{
                        background: '#1e293b',
                        border: '1px solid #475569',
                        borderRadius: '6px',
                        padding: '5px 10px',
                        fontSize: '0.78rem',
                        color: '#38bdf8',
                        fontWeight: 600,
                        maxWidth: '65%'
                      }}
                    >
                      {isVesselType && (
                        <option value="fac_risk + fac_desc">
                          ⭐ fac_risk + fac_desc (Kombinasi)
                        </option>
                      )}
                      <option value="fac_desc">fac_desc (Deskripsi Teks)</option>
                      <option value="fac_risk">fac_risk (Risk Type)</option>
                      <option value="fac_code">fac_code</option>
                      <option value="fac_insured">fac_insured</option>
                      {sourceColumns
                        .filter((c) => !['fac_desc', 'fac_risk', 'fac_code', 'fac_insured'].includes(c))
                        .map((c) => (
                          <option key={c} value={c}>
                            {c}
                          </option>
                        ))}
                    </select>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Section 3: AI Prompt Input & Template Management */}
          <div>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginBottom: '8px',
              flexWrap: 'wrap',
              gap: '8px'
            }}>
              <label style={{ fontSize: '0.85rem', fontWeight: 600, color: '#e2e8f0' }}>
                3. Instruksi Prompt AI (Gemini 3.8 Flash):
              </label>

              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <select
                  value={selectedTemplateName}
                  onChange={(e) => handleTemplateSelect(e.target.value)}
                  style={{
                    background: '#1e293b',
                    border: '1px solid #4338ca',
                    borderRadius: '6px',
                    padding: '4px 10px',
                    fontSize: '0.78rem',
                    color: '#c7d2fe',
                    fontWeight: 600
                  }}
                >
                  <option value="Ekstraksi & Explode Entitas Kapal Marine Hull (Multi-Vessel to Rows)">
                    📋 Template Kapal Marine Hull (Explode Multi-Vessel)
                  </option>
                  {promptTemplates.map((t) => (
                    <option key={t.id || t.name} value={t.name}>
                      📋 {t.name}
                    </option>
                  ))}
                </select>

                <button
                  type="button"
                  onClick={() => setIsSavingNewTemplate(true)}
                  style={{
                    background: 'rgba(99, 102, 241, 0.25)',
                    border: '1px solid #818cf8',
                    borderRadius: '6px',
                    padding: '4px 10px',
                    fontSize: '0.75rem',
                    color: '#e0e7ff',
                    fontWeight: 600,
                    cursor: 'pointer',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: 4
                  }}
                >
                  <Save size={13} />
                  <span>Simpan Prompt Baru</span>
                </button>
              </div>
            </div>

            {/* Modal / Dialog for new prompt name */}
            {isSavingNewTemplate && (
              <div style={{
                background: 'rgba(30, 41, 59, 0.95)',
                border: '1px solid #6366f1',
                borderRadius: '8px',
                padding: '12px',
                marginBottom: '12px',
                display: 'flex',
                alignItems: 'center',
                gap: '10px'
              }}>
                <input
                  type="text"
                  placeholder="Masukkan nama template prompt baru..."
                  value={newTemplateName}
                  onChange={(e) => setNewTemplateName(e.target.value)}
                  style={{
                    flex: 1,
                    background: '#0f172a',
                    border: '1px solid #475569',
                    borderRadius: '6px',
                    padding: '6px 12px',
                    color: '#ffffff',
                    fontSize: '0.8rem'
                  }}
                />
                <button
                  type="button"
                  onClick={handleSavePromptTemplate}
                  style={{
                    background: '#6366f1',
                    border: 'none',
                    borderRadius: '6px',
                    padding: '6px 14px',
                    color: '#ffffff',
                    fontWeight: 600,
                    fontSize: '0.8rem',
                    cursor: 'pointer'
                  }}
                >
                  Simpan
                </button>
                <button
                  type="button"
                  onClick={() => setIsSavingNewTemplate(false)}
                  style={{
                    background: 'transparent',
                    border: '1px solid #64748b',
                    borderRadius: '6px',
                    padding: '6px 12px',
                    color: '#94a3b8',
                    fontSize: '0.8rem',
                    cursor: 'pointer'
                  }}
                >
                  Batal
                </button>
              </div>
            )}

            <textarea
              rows={4}
              value={promptText}
              onChange={(e) => setPromptText(e.target.value)}
              placeholder="Tuliskan prompt AI untuk parsing entitas..."
              style={{
                width: '100%',
                background: 'rgba(15, 23, 42, 0.8)',
                border: '1px solid rgba(255,255,255,0.15)',
                borderRadius: '8px',
                padding: '10px 14px',
                fontSize: '0.82rem',
                color: '#f8fafc',
                lineHeight: 1.5,
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
            borderTop: '1px solid rgba(255,255,255,0.1)',
            paddingTop: '16px',
            flexWrap: 'wrap',
            gap: '12px'
          }}>
            <div style={{ fontSize: '0.78rem', color: '#94a3b8' }}>
              ⚡ Menjalankan ekstraksi & normalisasi otomatis menggunakan Gemini AI Engine untuk memetakan entitas kapal ke tabel granular DWH.
            </div>

            <button
              type="button"
              onClick={handleTriggerProcess}
              disabled={isProcessing}
              style={{
                background: isProcessing
                  ? '#475569'
                  : 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 50%, #d946ef 100%)',
                border: 'none',
                borderRadius: '10px',
                padding: '10px 24px',
                color: '#ffffff',
                fontSize: '0.9rem',
                fontWeight: 700,
                cursor: isProcessing ? 'not-allowed' : 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                boxShadow: '0 4px 14px rgba(99, 102, 241, 0.4)',
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
                  <span>Proses AI Parsing (Gemini 3.8 Flash)</span>
                </>
              )}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
