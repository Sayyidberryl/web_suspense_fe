import React, { useState, useEffect, useCallback, useTransition } from 'react';
import Sidebar from './components/layout/Sidebar';
import Header from './components/layout/Header';
import DashboardView from './components/dashboard/DashboardView';
import UploadStepOne from './components/upload/UploadStepOne';
import ColumnMappingView from './components/upload/ColumnMappingView';
import AiProcessingModal from './components/upload/AiProcessingModal';
import HistoryView from './components/history/HistoryView';
import facLensService from './services/facLensService';


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
  // 'acceptance' -> FACUL_ETL_MH_AKSEPTASI (Marine Hull - Akseptasi & Underwriting)
  // 'loss_pla'   -> FACUL_ETL_MH_LOSS_PLA
  // 'loss_sla'   -> FACUL_ETL_MH_LOSS_SETTLE
  const [selectedTableTab, setSelectedTableTab] = useState('acceptance');

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
  const [availableTables, setAvailableTables] = useState([]);
  const [loading, setLoading] = useState(false);
  const [connectionError, setConnectionError] = useState(null);
  const [, startTransition] = useTransition();

  // Upload & Mapping Flow State
  const [currentUploadFile, setCurrentUploadFile] = useState({
    fileName: 'Bordero_MarineHull_Batch_Unparsed.xlsx',
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
        page: pagination.page,
        limit: pagination.limit
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

  const handleExportData = () => {
    facLensService.exportToCsv(selectedTableTab, `export_${selectedTableTab}_data.csv`, filters);
  };

  // Upload -> Mapping Navigation
  const handleProceedToMapping = (fileData) => {
    setCurrentUploadFile(fileData);
    handleTabChange('upload-mapping', '/mapping');
  };

  // Mapping -> Start AI Parsing
  const handleStartParsing = ({ fileInfo }) => {
    setCurrentUploadFile((prev) => ({ ...prev, ...fileInfo }));
    setIsAiModalOpen(true);
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
  };

  // AI Complete -> Go to History
  const handleAiComplete = () => {
    setIsAiModalOpen(false);
    handleTabChange('history', '/history');
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
                <strong>Pemrosesan Latar Belakang:</strong> Sedang memvalidasi skema berkas <em>{backgroundProcessing.fileName}</em> (Model AI aktif)
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
              Buka Layar AI
            </button>
          </div>
        )}

        <main className={`page-container ${isEmbedMode ? 'embed-mode' : ''}`}>
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
              pagination={pagination}
              onPageChange={handlePageChange}
              onLimitChange={handleLimitChange}
              onRefresh={() => {
                loadData();
                loadAvailableTables();
              }}
              onExport={handleExportData}
            />
          )}

          {/* 2. Mapping View (Halaman /mapping) */}
          {(activeTab === 'mapping' || activeTab === 'upload-mapping') && (
            <ColumnMappingView
              fileInfo={currentUploadFile}
              onBack={() => handleTabChange('dashboard', '/')}
              onCancel={() => handleTabChange('dashboard', '/')}
              onStartParsing={handleStartParsing}
              onNavigateToDashboard={(tabKey) => {
                setSelectedTableTab(tabKey || 'ai_parsed');
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

      {/* AI Processing Modal */}
      <AiProcessingModal
        isOpen={isAiModalOpen}
        fileInfo={{
          fileName: currentUploadFile.fileName || 'Bordero_TriPakarta_Fire_Q3_2026.xlsx',
          fileSize: currentUploadFile.fileSize || '14.8 MB',
          cob: currentUploadFile.cob || 'Fire & Property',
          cedant: 'PT Asuransi Tri Pakarta'
        }}
        onClose={() => setIsAiModalOpen(false)}
        onRunInBackground={handleRunInBackground}
        onComplete={handleAiComplete}
      />
    </div>
  );
}
