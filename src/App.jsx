import React, { useState, useEffect, useCallback, useTransition } from 'react';
import Sidebar from './components/layout/Sidebar';
import Header from './components/layout/Header';
import DashboardView from './components/dashboard/DashboardView';
import UploadStepOne from './components/upload/UploadStepOne';
import ColumnMappingView from './components/upload/ColumnMappingView';
import AiProcessingModal from './components/upload/AiProcessingModal';
import HistoryView from './components/history/HistoryView';
import facLensService from './services/facLensService';
import historyService from './services/historyService';

import './styles/index.css';
import './styles/sidebar.css';
import './styles/dashboard.css';
import './styles/table.css';
import './styles/upload.css';
import './styles/mapping.css';
import './styles/ai-processing.css';
import './styles/history.css';

export default function App() {
  const [activeTab, setActiveTab] = useState('dashboard'); // 'dashboard' | 'upload' | 'upload-mapping' | 'history'
  
  // Tab switcher for the 3 PostgreSQL tables:
  // 'loss_pla'   -> FACUL_ETL_MH_LOSS_PLA
  // 'acceptance' -> FACUL_ETL_MH_AKSEPTASI
  // 'loss_sla'   -> FACUL_ETL_MH_LOSS_SETTLE
  const [selectedTableTab, setSelectedTableTab] = useState('loss_pla');

  // Dynamic Pagination
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 12,
    total: 0,
    totalPages: 1
  });

  // Dropdown File Selection State
  const [fileList, setFileList] = useState([]);
  const [selectedFile, setSelectedFile] = useState(null);

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
    dateOfLoss: '',
    globalSearch: ''
  });

  const [tableData, setTableData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [, startTransition] = useTransition();

  // Fetch available files from history on mount
  const refreshFileList = useCallback(async () => {
    try {
      const res = await historyService.getHistory({ limit: 50 });
      if (res && Array.isArray(res.data) && res.data.length > 0) {
        setFileList(res.data);
      }
    } catch (err) {
      console.warn('Could not fetch file list from history:', err);
    }
  }, []);

  useEffect(() => {
    refreshFileList();
  }, [refreshFileList]);

  // Upload & Mapping Flow State
  const [currentUploadFile, setCurrentUploadFile] = useState({
    fileName: 'Bordero_TriPakarta_Fire_Q3_2026.xlsx',
    fileSize: '1.8 MB',
    cob: 'Fire & Property',
    mappingTemplate: 'Format Standar Bordero TriPakarta Fire 2026'
  });

  // AI Modal State
  const [isAiModalOpen, setIsAiModalOpen] = useState(false);
  const [backgroundProcessing, setBackgroundProcessing] = useState(null);

  // Selected file for history detail modal from Dashboard RecentOutput
  const [selectedHistoryDetail, setSelectedHistoryDetail] = useState(null);

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const response = await facLensService.getTableData({
        tab: selectedTableTab,
        filters: {
          ...filters,
          selectedFile
        },
        page: pagination.page,
        limit: pagination.limit
      });

      startTransition(() => {
        let finalData = response.data || [];
        // If a file is selected with a cedant, ensure data is scoped to that file
        if (selectedFile && selectedFile.cedant) {
          const cedantQuery = selectedFile.cedant.toLowerCase();
          const filtered = finalData.filter((r) => {
            const d = (r.direct || '').toLowerCase();
            return d.includes(cedantQuery) || cedantQuery.includes(d);
          });
          if (filtered.length > 0) {
            finalData = filtered;
          }
        }

        setTableData(finalData);
        setPagination((prev) => ({
          ...prev,
          total: response.total || finalData.length,
          totalPages: response.totalPages || Math.max(1, Math.ceil((response.total || finalData.length) / pagination.limit))
        }));
      });
    } catch (err) {
      console.error('Failed to load table data:', err);
    } finally {
      setLoading(false);
    }
  }, [selectedTableTab, filters, selectedFile, pagination.page, pagination.limit]);

  useEffect(() => {
    if (activeTab === 'dashboard') {
      loadData();
    }
  }, [activeTab, loadData]);

  const handleFilterChange = (field, value) => {
    setFilters((prev) => ({ ...prev, [field]: value }));
    setPagination((prev) => ({ ...prev, page: 1 }));
  };

  const handleFileSelect = (file) => {
    setSelectedFile(file);
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
      dateOfLoss: '',
      globalSearch: ''
    });
    setSelectedFile(null);
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
    setPagination((prev) => ({ ...prev, limit: newLimit, page: 1 }));
  };

  const handleExportData = () => {
    facLensService.exportToCsv(tableData, `export_${selectedTableTab}_data.csv`);
  };

  // Upload -> Mapping Navigation
  const handleProceedToMapping = (fileData) => {
    setCurrentUploadFile(fileData);
    setActiveTab('upload-mapping');
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
    setActiveTab('history');
  };

  // From Recent Output on Dashboard to History Detail
  const handleSelectRecentDetail = (file) => {
    setSelectedHistoryDetail(file);
    setActiveTab('history');
  };

  // Header Titles
  let headerTitle = 'Dashboard';
  let headerSubtitle = '';
  if (activeTab === 'upload') {
    headerTitle = 'Upload';
  } else if (activeTab === 'upload-mapping') {
    headerTitle = 'Upload';
    headerSubtitle = 'Mapping';
  } else if (activeTab === 'history') {
    headerTitle = 'History';
    headerSubtitle = 'Log Eksekusi & Riwayat Berkas Reasuransi';
  }

  return (
    <div className="app-layout">
      {/* Sidebar navigation */}
      <Sidebar
        activeTab={activeTab.startsWith('upload') ? 'upload' : activeTab}
        onTabChange={(tab) => {
          setSelectedHistoryDetail(null);
          setActiveTab(tab);
        }}
      />

      <div className="main-content-wrapper">
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

        <main className="page-container">
          {/* 1. Dashboard View (Real Data from 3 PostgreSQL Tables) */}
          {activeTab === 'dashboard' && (
            <DashboardView
              tableData={tableData}
              loading={loading}
              filters={filters}
              onFilterChange={handleFilterChange}
              onClearFilters={handleClearFilters}
              onRemoveFilter={handleRemoveFilter}
              selectedTableTab={selectedTableTab}
              onSelectTableTab={handleSelectTableTab}
              pagination={pagination}
              onPageChange={handlePageChange}
              onLimitChange={handleLimitChange}
              fileList={fileList}
              selectedFile={selectedFile}
              onFileSelect={handleFileSelect}
              onRefresh={loadData}
              onExport={handleExportData}
              onNavigateToUpload={() => setActiveTab('upload')}
              onNavigateToHistory={() => setActiveTab('history')}
              onSelectDetail={handleSelectRecentDetail}
            />
          )}

          {/* 2. Upload Step 1 */}
          {activeTab === 'upload' && (
            <UploadStepOne
              onProceedToMapping={handleProceedToMapping}
            />
          )}

          {/* 3. Upload Step 2: Mapping View */}
          {activeTab === 'upload-mapping' && (
            <ColumnMappingView
              fileInfo={currentUploadFile}
              onBack={() => setActiveTab('upload')}
              onCancel={() => setActiveTab('upload')}
              onStartParsing={handleStartParsing}
            />
          )}

          {/* 4. History View (Real database logs) */}
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
