/**
 * FacLens Service Layer
 * Directly connected to Supabase PostgreSQL via FastAPI Backend.
 */

import apiClient from './apiClient';

export const facLensService = {
  /**
   * Fetch all available DWH tables with runtime counts and metadata
   */
  async getTables() {
    try {
      const res = await apiClient.get('/api/tables');
      if (Array.isArray(res) && res.length > 0) {
        return res;
      }
    } catch (err) {
      console.warn('Failed to fetch tables from backend:', err);
    }
    return [
      { id: 'acceptance', tableName: 'FACUL_ETL_MH_AKSEPTASI', label: 'Marine Hull - Akseptasi & Underwriting', isAiParsed: false },
      { id: 'loss_pla', tableName: 'FACUL_ETL_MH_LOSS_PLA', label: 'Marine Hull - Loss Advice (PLA / Outstanding)', isAiParsed: false },
      { id: 'loss_sla', tableName: 'FACUL_ETL_MH_LOSS_SETTLE', label: 'Marine Hull - Settled Claims (SLA)', isAiParsed: false },
      { id: 'ai_parsed', tableName: 'FACUL_ETL_MH_PARSED_AI', label: 'Marine Hull - Hasil Normalisasi AI (Entitas Granular)', isAiParsed: true }
    ];
  },


  /**
   * Fetch Marine Hull table data dynamically based on active table and filters.
   * Dynamically returns runtime columns metadata!
   */
  async getTableData({
    tab = 'acceptance',
    filters = {},
    page = 1,
    limit = 12,
  } = {}) {
    try {
      const params = {
        table: tab,
        page,
        limit,
        fac_code: filters.facCode || '',
        reff_number: filters.reffNumber || '',
        company_name: filters.companyName || filters.direct || '',
        broker: filters.broker || '',
        insured_name: filters.insuredName || '',
        insured_loss_name: filters.insuredLossName || '',
        vessel_name: filters.vesselName || '',
        vessel_loss_name: filters.vesselLossName || '',
        vessel_code: filters.vesselCode || '',
        vessel_loss_code: filters.vesselLossCode || '',
        status: filters.status || '',
        loss_cause: filters.lossCause || '',
        currency: filters.currency || '',
        date_of_loss: filters.dateOfLoss || '',
        search: filters.globalSearch || '',
      };

      if (filters.selectedFile && filters.selectedFile.cedant && !params.company_name) {
        params.company_name = filters.selectedFile.cedant;
      }

      // Call generic dynamic table endpoint
      const res = await apiClient.get('/api/table-data', params);
      return {
        data: res.data || [],
        columns: res.columns || [],
        total: res.total || 0,
        page: res.page || page,
        limit: res.limit || limit,
        totalPages: res.totalPages || Math.max(1, Math.ceil((res.total || 0) / limit)),
        tableName: res.tableName || tab,
        error: null
      };
    } catch (err) {
      console.error('Failed to fetch dynamic table data from backend:', err);
      return {
        data: [],
        columns: [],
        total: 0,
        page: 1,
        limit,
        totalPages: 1,
        error: err.message || 'Gagal terhubung ke backend server (port 8000)'
      };
    }
  },

  /**
   * Inspect user-uploaded Excel or CSV file on server
   */
  async inspectFile(file) {
    try {
      const formData = new FormData();
      formData.append('file', file);
      const res = await fetch(`${apiClient.baseUrl}/inspect-file`, {
        method: 'POST',
        body: formData
      });
      if (res.ok) {
        return await res.json();
      }
    } catch (err) {
      console.warn('Server file inspection failed, will fallback to client parser:', err);
    }
    return null;
  },

  /**
   * Get curated unparsed raw Marine Hull records for AI entity extraction
   */
  async getDemoUnparsedData() {
    try {
      return await apiClient.get('/api/unparsed-batch');
    } catch (err) {
      // Fallback to /api/demo-unparsed if needed
      try {
        return await apiClient.get('/api/demo-unparsed');
      } catch (e) {
        console.warn('Failed to fetch unparsed batch data:', err);
        return null;
      }
    }
  },

  async getUnparsedBatchData() {
    return this.getDemoUnparsedData();
  },

  /**
   * Execute AI entity extraction & multi-vessel exploding
   */
  async runAiParse(payload) {
    try {
      return await apiClient.post('/api/ai-parse', payload);
    } catch (err) {
      console.error('Failed to execute AI parse:', err);
      throw err;
    }
  },

  /**
   * AI Prompt Templates Management
   */
  async getAiPromptTemplates() {
    try {
      return await apiClient.get('/api/ai-prompt-templates');
    } catch (err) {
      console.warn('Failed to fetch AI prompt templates:', err);
      return [];
    }
  },

  async saveAiPromptTemplate(template) {
    try {
      return await apiClient.post('/api/ai-prompt-templates', template);
    } catch (err) {
      console.error('Failed to save AI prompt template:', err);
      throw err;
    }
  },

  async deleteAiPromptTemplate(id) {
    try {
      return await apiClient.delete(`/api/ai-prompt-templates/${id}`);
    } catch (err) {
      console.error('Failed to delete AI prompt template:', err);
      throw err;
    }
  },


  /**
   * Fetch KPI summary statistics directly from database
   */
  async getDashboardStats() {
    try {
      const res = await apiClient.get('/api/stats');
      return res || {
        totalRecords: 0,
        totalClaimValue: 0,
        uniqueVessels: 0,
        uniqueCedants: 0,
        slaResolvedRate: '0%',
      };
    } catch (err) {
      console.error('Failed to fetch dashboard stats:', err);
      return {
        totalRecords: 0,
        totalClaimValue: 0,
        uniqueVessels: 0,
        uniqueCedants: 0,
        slaResolvedRate: '0%',
      };
    }
  },

  /**
   * Utility to export real dataset to CSV
   */
  exportToCsv(data, filename = 'fac_lens_export.csv') {
    if (!data || !data.length) return;

    // Detect columns from first item or use standard Excel 24 columns
    const keys = Object.keys(data[0]).filter((k) => k !== 'id');
    const headerLabels = keys.map((k) => k.replace(/_/g, ' ').toUpperCase());

    const rows = data.map((item) =>
      keys.map((k) => {
        const val = item[k];
        if (val === null || val === undefined) return '""';
        return `"${String(val).replace(/"/g, '""')}"`;
      })
    );

    const csvContent = 'data:text/csv;charset=utf-8,\uFEFF' + [headerLabels.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', filename);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }
};

export default facLensService;
