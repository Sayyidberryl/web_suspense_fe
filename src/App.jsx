import React, { useState, useEffect, useCallback, useTransition } from 'react';
import Sidebar from './components/layout/Sidebar';
import Header from './components/layout/Header';
import DashboardView from './components/dashboard/DashboardView';
import UploadStepOne from './components/upload/UploadStepOne';
import ColumnMappingView from './components/upload/ColumnMappingView';
import AiProcessingModal from './components/upload/AiProcessingModal';
import HistoryView from './components/history/HistoryView';
import facLensService, { TABLE_CONFIG } from './services/facLensService';
import historyService from './services/historyService';


import './styles/index.css';
import './styles/sidebar.css';
import './styles/dashboard.css';
import './styles/table.css';
import './styles/upload.css';
import './styles/mapping.css';
import './styles/ai-processing.css';
import './styles/history.css';

// Route detection helper for standalone URLs: /dashboard, /mapping, /upload, /history
const parseCurrentLocation = () => {
  if (typeof window === 'undefined') return { route: 'app', tab: 'dashboard' };
  const pathname = window.location.pathname.toLowerCase().replace(/\/+$/, '') || '/';
  
  if (pathname === '/dashboard') {
    return { route: 'embed-dashboard', tab: 'dashboard' };
  }
  if (pathname === '/mapping') {
    return { route: 'mapping', tab: 'mapping' };
  }
  if (pathname === '/upload') {
    return { route: 'app', tab: 'upload' };
  }
  if (pathname === '/history') {
    return { route: 'app', tab: 'history' };
  }
  return { route: 'app', tab: 'dashboard' };
};

export default function App() {
  const initialRoute = parseCurrentLocation();
  // 'app' (default with sidebar) | 'embed-dashboard' (SAS Viya embed: full screen, no sidebar) | 'mapping'
  const [currentRoute, setCurrentRoute] = useState(initialRoute.route);
  const [activeTab, setActiveTab] = useState(initialRoute.tab); // 'dashboard' | 'mapping' | 'upload' | 'upload-mapping' | 'history'
  
  // Tab switcher for the DWH tables:
  // 'acceptance' -> FACUL_ETL_MH_AKSEPTASI (MH - Data Akseptasi)
  // 'loss_pla'   -> FACUL_ETL_MH_LOSS_PLA (MH - Data Loss PLA)
  // 'loss_sla'   -> FACUL_ETL_MH_LOSS_SETTLE (MH - Data Loss SLA)
  const [selectedTableTab, setSelectedTableTab] = useState('acceptance');

  // Dynamic titles for sheet tabs (synced with table and file titles)
  const [tabTitles, setTabTitles] = useState({
    acceptance: 'MH - Data Akseptasi',
    loss_pla: 'MH - Data Loss PLA',
    loss_sla: 'MH - Data Loss SLA',
    ai_parsed: 'MH - Data Hasil Parsing'
  });

  const [isExporting, setIsExporting] = useState(false);

  // Dynamic Pagination
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 12,
    total: 0,
    totalPages: 1,
    isAll: false
  });

  // Filters for Dashboard FAC LENS (supports all table columns dynamically)
  const [filters, setFilters] = useState({
    facCode: '',
    reffNumber: '',
    companyName: '',
    broker: '',
    insuredName: '',
    insuredLossName: '',
    vesselName: '',
    vesselCode: '',
    status: '',
    lossCause: '',
    currency: '',
    dateOfLoss: ''
  });

  const [tableData, setTableData] = useState([]);
  const [tableColumns, setTableColumns] = useState([]);
  const [availableTables, setAvailableTables] = useState(TABLE_CONFIG);
  const [loading, setLoading] = useState(false);
  const [connectionError, setConnectionError] = useState(null);
  const [, startTransition] = useTransition();

  // Dashboard Dynamic Tabs State
  const [openTabs, setOpenTabs] = useState(['acceptance', 'loss_pla', 'loss_sla']);

  const handleAddTab = (tabId) => {
    if (!openTabs.includes(tabId)) {
      setOpenTabs((prev) => [...prev, tabId]);
    }
    setSelectedTableTab(tabId);
  };

  const handleCloseTab = (tabId) => {
    setOpenTabs((prev) => {
      const newTabs = prev.filter((id) => id !== tabId);
      if (tabId === selectedTableTab && newTabs.length > 0) {
        setSelectedTableTab(newTabs[newTabs.length - 1]);
      } else if (newTabs.length === 0) {
        setSelectedTableTab(null);
      }
      return newTabs;
    });
  };

  const handleRenameTab = (tabId, newTitle) => {
    if (!newTitle || !newTitle.trim()) return;
    setTabTitles((prev) => ({
      ...prev,
      [tabId]: newTitle.trim()
    }));
  };

  // Upload & Mapping Flow State
  const [currentUploadFile, setCurrentUploadFile] = useState({
    fileName: 'Data_Mentah_MarineHull.xlsx',
    outputTitle: 'MH - Data Akseptasi',
    fileSize: '14.2 KB',
    cob: 'Marine Hull',
    mappingTemplate: 'Template Akseptasi (Marine Hull)',
    detectedColumns: ['fac_code', 'fac_risk', 'fac_desc', 'fac_old_ref', 'fac_cedant', 'fac_broker', 'fac_insured', 'currency', 'fac_totsi', 'fac_our_amt']
  });

  // AI Modal State
  const [isAiModalOpen, setIsAiModalOpen] = useState(false);
  const [backgroundProcessing, setBackgroundProcessing] = useState(null);

  // Selected file for history detail modal from Dashboard RecentOutput
  const [selectedHistoryDetail, setSelectedHistoryDetail] = useState(null);

  // Load available DWH tables
  const loadAvailableTables = useCallback(async () => {
    try {
      const list = await facLensService.getTables();
      if (list && list.length > 0) {
        setAvailableTables(list);
      }
    } catch (err) {
      console.warn('Could not load tables:', err);
    }
  }, []);

  useEffect(() => {
    loadAvailableTables();
  }, [loadAvailableTables]);

  // Listen for browser navigation (back/forward)
  useEffect(() => {
    const handlePopState = () => {
      const loc = parseCurrentLocation();
      setCurrentRoute(loc.route);
      setActiveTab(loc.tab);
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  const handleTabChange = (tab, path) => {
    setSelectedHistoryDetail(null);
    setActiveTab(tab);

    const targetPath = path || (tab === 'dashboard' ? '/' : `/${tab}`);
    window.history.pushState(null, '', targetPath);

    if (targetPath === '/dashboard') {
      setCurrentRoute('embed-dashboard');
    } else if (targetPath === '/mapping' || tab === 'mapping') {
      setCurrentRoute('mapping');
    } else {
      setCurrentRoute('app');
    }
  };

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const response = await facLensService.getTableData({
        tab: selectedTableTab,
        filters,
        page: 1,
        limit: 'all'
      });

      startTransition(() => {
        setTableData(response.data || []);
        setTableColumns(response.columns || []);
        setPagination((prev) => ({
          ...prev,
          total: response.total || 0,
          totalPages: response.totalPages || 1
        }));
      });
    } catch (err) {
      console.error('Failed to load table data:', err);
    } finally {
      setLoading(false);
    }
  }, [selectedTableTab, filters, pagination.page, pagination.limit]);

  useEffect(() => {
    if (activeTab === 'dashboard') {
      loadData();
    }
  }, [activeTab, loadData]);

  const handleFilterChange = (field, value) => {
    setFilters((prev) => ({ ...prev, [field]: value }));
    setPagination((prev) => ({ ...prev, page: 1 }));
  };

  const handleClearFilters = () => {
    setFilters({
      facCode: '',
      reffNumber: '',
      companyName: '',
      broker: '',
      insuredName: '',
      insuredLossName: '',
      vesselName: '',
      vesselCode: '',
      status: '',
      lossCause: '',
      currency: '',
      dateOfLoss: ''
    });
    setPagination((prev) => ({ ...prev, page: 1 }));
  };

  const handleRemoveFilter = (key) => {
    setFilters((prev) => ({ ...prev, [key]: '' }));
    setPagination((prev) => ({ ...prev, page: 1 }));
  };

  const handleSelectTableTab = (newTab) => {
    setSelectedTableTab(newTab);
    setPagination((prev) => ({ ...prev, page: 1 }));
  };

  const handlePageChange = (newPage) => {
    setPagination((prev) => ({ ...prev, page: newPage }));
  };

  const handleLimitChange = (newLimit) => {
    if (newLimit === 'all') {
      setPagination((prev) => ({ ...prev, limit: 2000, isAll: true, page: 1 }));
    } else {
      setPagination((prev) => ({ ...prev, limit: Number(newLimit), isAll: false, page: 1 }));
    }
  };

  const handleExportData = async () => {
    const currentTitle =
      tabTitles[selectedTableTab] ||
      availableTables.find((t) => t.id === selectedTableTab)?.label ||
      'MH - Data Akseptasi';
    setIsExporting(true);
    try {
      await facLensService.exportToExcel({
        tableId: selectedTableTab,
        title: currentTitle,
        filters,
        inMemoryData: tableData
      });
    } finally {
      setIsExporting(false);
    }
  };

  // Upload -> Mapping Navigation
  const handleProceedToMapping = (fileData) => {
    setCurrentUploadFile(fileData);
    handleTabChange('upload-mapping', '/mapping');
  };

  // Mapping -> Start ETL Processing (dipanggil dari ColumnMappingView)
  const handleStartParsing = (mappingData) => {
    // Bypass the gimmick AI modal and directly execute the ETL lookup
    handleAiComplete(mappingData);
  };

  // AI Background processing trigger
  const handleRunInBackground = (fileInfo) => {
    setBackgroundProcessing({
      fileName: fileInfo.fileName,
      progress: 74
    });
    // Auto clear after 8 seconds
    setTimeout(() => {
      setBackgroundProcessing(null);
    }, 8000);
  const handleStartParsing = (mappingData, skipNavigation = false) => {
    // Execute the ETL lookup, returning the promise
    return handleAiComplete(mappingData, skipNavigation);
  };  // AI Complete -> ETL Lookup: extract fac_codes dari file -> call RPC to create table
  const handleAiComplete = async (mappingData, skipNavigation = false) => {
    setIsAiModalOpen(false);

    // Gunakan mappingData yang dipass dari handleStartParsing, fallback ke currentUploadFile
    const mData = mappingData || currentUploadFile || {};
    const fileInfo = mData.fileInfo || mData || {};
    
    const outputTitle = fileInfo.outputTitle ||
      fileInfo.fileName?.replace(/\.[^/.]+$/, '') || 'Hasil ETL';
    const template = mData.templateName || fileInfo.mappingTemplate || '';
    const fileRows = mData.fileRows || fileInfo.fileRows || [];
    const mappings = mData.mappings || fileInfo.mappings || [];
    const fileName = fileInfo.fileName || 'upload.xlsx';


    // Tentukan target base table
    let tableId = 'acceptance';
    if (template.includes('PLA') || outputTitle.toLowerCase().includes('pla')) {
      tableId = 'loss_pla';
    } else if (template.includes('SLA') || template.includes('Settle') || outputTitle.toLowerCase().includes('sla')) {
      tableId = 'loss_sla';
    }

    // Ekstrak fac_codes dari file rows
    let facCodeSourceCol = 'fac_code';
    if (mappings && mappings.length > 0) {
      const facMap = mappings.find(m => m.field_db === 'fac_code');
      if (facMap && facMap.excel_col && facMap.excel_col !== '-- Pilih Kolom Excel --') {
        facCodeSourceCol = facMap.excel_col;
      }
    }

    let facCodes = [];
    if (fileRows.length > 0) {
      facCodes = [...new Set(
        fileRows
          .map(row => row[facCodeSourceCol] || row['fac_code'] || '')
          .filter(Boolean)
          .map(v => v.trim())
      )];
    }

    // ── STEP 1: Buat Physical Table via RPC ──
    setLoading(true);
    let newTabKey = tableId; // fallback jika gagal
    try {
      if (facCodes.length > 0) {
        const result = await facLensService.createEtlTableRpc(facCodes, tableId, outputTitle, fileName);
        if (result.success && result.tableName) {
          newTabKey = result.tableName; // Pakai nama tabel yg baru dibuat
        }
      }
    } catch (err) {
      console.error('Failed to create ETL table:', err);
    }

    // Refresh daftar tabel (termasuk yang baru dibuat dari GENERATED_TABLES)
    await loadAvailableTables();

    // ── STEP 2: Register tab baru & navigasi ke dashboard ──
    const newTableConfig = {
      id: newTabKey,
      label: outputTitle,
      tableName: newTabKey,
      count: facCodes.length,
      columnsCount: 0
    };
    setAvailableTables(prev => {
      if (!prev.some(t => t.id === newTabKey)) {
        return [...prev, newTableConfig];
      }
      return prev;
    });

    setTabTitles(prev => ({ ...prev, [newTabKey]: outputTitle }));
    setOpenTabs(prev => prev.includes(newTabKey) ? prev : [...prev, newTabKey]);
    setSelectedTableTab(newTabKey);
    
    if (!skipNavigation) {
      handleTabChange('dashboard', '/');
    }
    
    setLoading(false);

    // Simpan ke history
    historyService?.createHistory?.({
      file_name: fileName,
      file_size: currentUploadFile.fileSize || '0 KB',
      file_type: 'XLSX',
      cedant: currentUploadFile.cedant || '-',
      cob: currentUploadFile.cob || 'Marine Hull',
      status: 'Berhasil Dimuat',
      records_count: facCodes.length,
      schema_accuracy: 100.0,
      duration_seconds: 3.5,
      log_message: `Tabel ETL fisik (${newTabKey}) berhasil dibuat dengan ${facCodes.length} fac_codes.`,
    }).catch(() => {});
    
    return { newTabKey, outputTitle, facCodesCount: facCodes.length };
  };

  // From Recent Output on Dashboard to History Detail
  const handleSelectRecentDetail = (file) => {
    setSelectedHistoryDetail(file);
    handleTabChange('history', '/history');
  };

  const isEmbedMode = currentRoute === 'embed-dashboard';

  // Header Titles
  let headerTitle = 'Dashboard';
  let headerSubtitle = '';
  if (isEmbedMode) {
    headerTitle = 'Dashboard';
    headerSubtitle = '';
  } else if (activeTab === 'mapping' || activeTab === 'upload-mapping') {
    headerTitle = 'Mapping';
    headerSubtitle = 'Konfigurasi Pemetaan Kolom COB Marine Hull (MR11 Raw)';
  } else if (activeTab === 'upload') {
    headerTitle = 'Upload';
  } else if (activeTab === 'history') {
    headerTitle = 'History';
    headerSubtitle = 'Log Eksekusi & Riwayat Berkas Reasuransi';
  }

  return (
    <div className={`app-layout ${isEmbedMode ? 'embed-dashboard' : ''}`}>
      {/* Sidebar navigation: Hidden completely in SAS Viya embed mode */}
      {!isEmbedMode && (
        <Sidebar
          activeTab={activeTab === 'upload-mapping' ? 'mapping' : activeTab}
          onTabChange={handleTabChange}
        />
      )}

      <div className={`main-content-wrapper ${isEmbedMode ? 'embed-mode' : ''}`}>
        <Header title={headerTitle} subtitle={headerSubtitle} />

        {/* Global background processing banner indicator if running in background */}
        {backgroundProcessing && (
          <div style={{
            background: 'linear-gradient(90deg, #eff6ff, #f0fdf4)',
            borderBottom: '1px solid #bfdbfe',
            padding: '10px 32px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            fontSize: '0.82rem',
            color: '#1e40af'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <span style={{
                width: 8,
                height: 8,
                borderRadius: '50%',
                background: '#10b981',
                boxShadow: '0 0 6px #10b981'
              }} />
              <span>
                <strong>Pemrosesan Latar Belakang:</strong> Sedang memvalidasi skema berkas <em>{backgroundProcessing.fileName}</em> (Parsing Engine aktif)
              </span>
            </div>
            <button
              onClick={() => setIsAiModalOpen(true)}
              style={{
                background: '#ffffff',
                border: '1px solid #bfdbfe',
                borderRadius: '6px',
                padding: '4px 10px',
                fontSize: '0.75rem',
                fontWeight: 600,
                color: '#1e40af',
                cursor: 'pointer'
              }}
            >
              Lihat Progress
            </button>
          </div>
        )}

        <main className={`page-container ${isEmbedMode ? 'embed-mode' : ''} ${activeTab === 'history' ? 'history-page' : ''}`}>
          {/* 1. Dashboard View (Standard or SAS Viya Embed Mode) */}
          {activeTab === 'dashboard' && (
            <DashboardView
              tableData={tableData}
              tableColumns={tableColumns}
              tables={availableTables}
              loading={loading}
              filters={filters}
              onFilterChange={handleFilterChange}
              onClearFilters={handleClearFilters}
              onRemoveFilter={handleRemoveFilter}
              selectedTableTab={selectedTableTab}
              onSelectTableTab={(newTab) => {
                handleSelectTableTab(newTab);
              }}
              openTabs={openTabs}
              onAddTab={handleAddTab}
              onCloseTab={handleCloseTab}
              pagination={pagination}
              onPageChange={handlePageChange}
              onLimitChange={handleLimitChange}
              onRefresh={() => {
                loadData();
                loadAvailableTables();
              }}
              onExport={handleExportData}
              tabTitles={tabTitles}
              onRenameTab={handleRenameTab}
              isExporting={isExporting}
            />
          )}

          {/* 2. Mapping View (Halaman /mapping) */}
          {(activeTab === 'mapping' || activeTab === 'upload-mapping') && (
            <ColumnMappingView
              fileInfo={currentUploadFile}
              onBack={() => handleTabChange('dashboard', '/')}
              onCancel={() => handleTabChange('dashboard', '/')}
              onStartParsing={handleStartParsing}
              onNavigateToDashboard={(tabKey, title) => {
                const targetKey = tabKey || 'ai_parsed';
                const resolvedTitle = title || currentUploadFile.outputTitle || 'MH - Data Hasil Parsing';
                setTabTitles((prev) => ({
                  ...prev,
                  [targetKey]: resolvedTitle
                }));
                handleAddTab(targetKey);
                setSelectedTableTab(targetKey);
                loadAvailableTables();
                handleTabChange('dashboard', '/');
              }}
            />
          )}

          {/* 3. Upload Step 1 (Halaman /upload) */}
          {activeTab === 'upload' && (
            <UploadStepOne
              onProceedToMapping={handleProceedToMapping}
            />
          )}

          {/* 4. History View (Halaman /history) */}
          {activeTab === 'history' && (
            <HistoryView
              initialFileDetail={selectedHistoryDetail}
            />
          )}
        </main>
      </div>
    </div>
  );
}
