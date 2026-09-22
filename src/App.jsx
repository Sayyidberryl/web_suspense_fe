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

export default function App() {
  const [activeTab, setActiveTab] = useState('dashboard'); // 'dashboard' | 'upload' | 'upload-mapping' | 'history'
  
  // Filters for Dashboard FAC LENS
  const [filters, setFilters] = useState({
    facCode: '',
    companyName: '',
    insuredLossName: '',
    vesselName: '',
    vesselCode: '',
    globalSearch: ''
  });

  const [tableData, setTableData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [, startTransition] = useTransition();

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
        tab: 'loss_pla',
        filters,
        page: 1,
        limit: 12
      });

      startTransition(() => {
        setTableData(response.data || []);
      });
    } catch (err) {
      console.error('Failed to load table data:', err);
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    if (activeTab === 'dashboard') {
      loadData();
    }
  }, [activeTab, loadData]);

  const handleFilterChange = (field, value) => {
    setFilters((prev) => ({ ...prev, [field]: value }));
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
          {/* 1. Dashboard View (Mockup 5) */}
          {activeTab === 'dashboard' && (
            <DashboardView
              tableData={tableData}
              loading={loading}
              filters={filters}
              onFilterChange={handleFilterChange}
              onRefresh={loadData}
              onNavigateToUpload={() => setActiveTab('upload')}
              onNavigateToHistory={() => setActiveTab('history')}
              onSelectDetail={handleSelectRecentDetail}
            />
          )}

          {/* 2. Upload Step 1 (Mockup 4) */}
          {activeTab === 'upload' && (
            <UploadStepOne
              onProceedToMapping={handleProceedToMapping}
            />
          )}

          {/* 3. Upload Step 2: Mapping View (Mockup 3) */}
          {activeTab === 'upload-mapping' && (
            <ColumnMappingView
              fileInfo={currentUploadFile}
              onBack={() => setActiveTab('upload')}
              onCancel={() => setActiveTab('upload')}
              onStartParsing={handleStartParsing}
            />
          )}

          {/* 4. History View (Mockup 2 with Card vs List Toggle) */}
          {activeTab === 'history' && (
            <HistoryView
              initialFileDetail={selectedHistoryDetail}
            />
          )}
        </main>
      </div>

      {/* AI Processing Modal (Mockup 1) */}
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
