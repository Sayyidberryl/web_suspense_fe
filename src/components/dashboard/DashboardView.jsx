import React from 'react';
import { Plus, Clock, Info, ShieldAlert, Sparkles, Layers } from 'lucide-react';
import TopControlBar from './TopControlBar';
import FacLensBanner from './FacLensBanner';
import TabNavigation from './TabNavigation';
import DataTable from './DataTable';
import RecentOutput from './RecentOutput';

export default function DashboardView({
  tableData,
  tableColumns = [],
  tables = [],
  loading,
  filters,
  onFilterChange,
  onClearFilters,
  onRemoveFilter,
  selectedTableTab = 'loss_pla',
  onSelectTableTab,
  pagination,
  onPageChange,
  onLimitChange,
  onRefresh,
  onExport,
  onNavigateToUpload,
  onNavigateToHistory,
  onSelectDetail
}) {
  const isAiParsedTab = selectedTableTab === 'ai_parsed' || selectedTableTab === 'FACUL_ETL_MH_PARSED_AI';

  return (
    <div>
      {/* Welcome Section */}
      <div className="welcome-section">
        <h1 className="welcome-title" style={{ marginBottom: 16 }}>
          FAC LENS | Facultative Intelligence Platform
        </h1>
        <div className="welcome-actions">
          <button className="btn-welcome-upload" onClick={onNavigateToUpload}>
            <Plus size={16} />
            <span>Unggah Berkas</span>
          </button>
          <button className="btn-welcome-history" onClick={onNavigateToHistory}>
            <Clock size={16} />
            <span>Riwayat Eksekusi</span>
          </button>
        </div>
      </div>

      {/* Prominent Architectural Clarification Notice (Requirement 4) */}
      <div style={{
        background: isAiParsedTab
          ? 'linear-gradient(135deg, rgba(238, 242, 255, 0.95), rgba(245, 243, 255, 0.95))'
          : 'linear-gradient(135deg, #f0fdf4 0%, #f8fafc 100%)',
        border: `1px solid ${isAiParsedTab ? '#c7d2fe' : '#bbf7d0'}`,
        borderRadius: '12px',
        padding: '14px 20px',
        marginBottom: '20px',
        display: 'flex',
        alignItems: 'flex-start',
        gap: '14px',
        boxShadow: '0 2px 6px rgba(0,0,0,0.02)'
      }}>
        <div style={{
          width: 34,
          height: 34,
          borderRadius: '8px',
          background: isAiParsedTab ? '#e0e7ff' : '#dcfce7',
          color: isAiParsedTab ? '#4f46e5' : '#15803d',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexShrink: 0,
          marginTop: 2
        }}>
          {isAiParsedTab ? <Sparkles size={18} /> : <Info size={18} />}
        </div>
        <div style={{ flex: 1, fontSize: '0.85rem', lineHeight: 1.55 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
            <strong style={{ color: isAiParsedTab ? '#3730a3' : '#14532d', fontSize: '0.9rem' }}>
              {isAiParsedTab
                ? 'Pipeline Normalisasi Entitas AI Aktif (Gemini 3.8 Flash Engine)'
                : 'Arsitektur Data Warehouse & Output Pemetaan Dinamis'}
            </strong>
            <span style={{
              background: isAiParsedTab ? '#6366f1' : '#0284c7',
              color: '#ffffff',
              fontSize: '0.68rem',
              fontWeight: 700,
              padding: '2px 8px',
              borderRadius: '999px',
              textTransform: 'uppercase',
              letterSpacing: '0.04em'
            }}>
              {isAiParsedTab ? 'AI Entity Resolution Active' : 'Enterprise DWH Layer'}
            </span>
          </div>
          <p style={{ margin: 0, color: '#334155' }}>
            {isAiParsedTab ? (
              <>
                Tabel di bawah ini merupakan luaran dari pipeline <strong>Normalisasi Entitas & Multi-Vessel Exploding</strong>. Dari data mentah bordero yang memuat spesifikasi kapal jamak dalam deskripsi gabungan (<code>fac_desc</code>), engine AI secara otomatis mengurai dan merekonstruksinya menjadi baris entitas individual terstruktur. Seluruh struktur kolom disajikan <strong>100% dinamis</strong> mengikuti skema metadata runtime.
              </>
            ) : (
              <>
                Arsitektur Data Warehouse FAC LENS mengadopsi prinsip Schema-on-Read adaptif. Seluruh tabel portofolio (Akseptasi, Loss PLA, Loss SLA, dan Normalisasi AI) merupakan entitas granular yang diproses otomatis melalui pipeline ETL dinamis. Sistem secara fleksibel mendukung penyesuaian skema dan pemetaan kolom kustom untuk seluruh lini bisnis (COB) asuransi & reasuransi.
              </>
            )}
          </p>
        </div>
      </div>

      {/* Top Controls with "Pilih Data" Dropdown */}
      <TopControlBar
        selectedTableTab={selectedTableTab}
        onSelectTableTab={onSelectTableTab}
        onRefresh={onRefresh}
        onExport={onExport}
        tables={tables}
      />

      {/* FAC LENS Filter Banner with Customizable Column Filters */}
      {!isAiParsedTab && (
        <FacLensBanner
          filters={filters}
          onFilterChange={onFilterChange}
          activeTab={selectedTableTab}
        />
      )}

      {/* Filter Summary Chips Bar — only visible when filters are active */}
      {!isAiParsedTab && (
        <TabNavigation
          filters={filters}
          onClearFilters={onClearFilters}
          onRemoveFilter={onRemoveFilter}
        />
      )}

      {/* Dynamic Data Table with Runtime Columns */}
      <DataTable
        data={tableData}
        columns={tableColumns}
        loading={loading}
        activeTab={selectedTableTab}
        pagination={pagination}
        onPageChange={onPageChange}
        onLimitChange={onLimitChange}
      />

      {/* Real Recent Output from Database History */}
      <RecentOutput
        onNavigateToHistory={onNavigateToHistory}
        onSelectDetail={onSelectDetail}
      />
    </div>
  );
}
