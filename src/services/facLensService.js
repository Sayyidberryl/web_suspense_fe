/**
 * FacLens Service Layer
 * Directly connected to Supabase PostgreSQL via FastAPI Backend.
 */

import apiClient from './apiClient';

export const facLensService = {
  /**
   * Fetch Marine Hull table data based on active tab and filters
   * Sources:
   *  - loss_pla   -> /api/loss-pla   (public."FACUL_ETL_MH_LOSS_PLA")
   *  - acceptance -> /api/akseptasi  (public."FACUL_ETL_MH_AKSEPTASI")
   *  - loss_sla   -> /api/loss-settle (public."FACUL_ETL_MH_LOSS_SETTLE")
   */
  async getTableData({
    tab = 'loss_pla',
    filters = {},
    page = 1,
    limit = 12,
  } = {}) {
    try {
      const params = {
        page,
        limit,
        fac_code: filters.facCode || '',
        company_name: filters.companyName || '',
        insured_loss_name: filters.insuredLossName || '',
        vessel_name: filters.vesselName || '',
        vessel_code: filters.vesselCode || '',
        search: filters.globalSearch || '',
      };

      let endpoint = '/api/loss-pla';
      if (tab === 'acceptance') {
        endpoint = '/api/akseptasi';
      } else if (tab === 'loss_sla') {
        endpoint = '/api/loss-settle';
      }

      const res = await apiClient.get(endpoint, params);
      return {
        data: res.data || [],
        total: res.total || 0,
        page: res.page || page,
        limit: res.limit || limit,
        totalPages: res.totalPages || Math.max(1, Math.ceil((res.total || 0) / limit)),
      };
    } catch (err) {
      console.error('Failed to fetch table data from backend:', err);
      return {
        data: [],
        total: 0,
        page: 1,
        limit,
        totalPages: 1,
      };
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

    const headers = [
      'FAC Code',
      'Ref Number',
      'Direct (Company)',
      'Broker',
      'Nama Tertanggung',
      'Afiliasi Tertanggung',
      'Nama Tertanggung Loss',
      'Nama Kapal',
      'Vessel Code',
      'Sum Insured',
      'Loss Amount',
      'Currency',
      'Date of Loss',
      'Loss Cause',
      'Status'
    ];

    const rows = data.map((item) => [
      `"${item.fac_code || ''}"`,
      `"${item.reff_number || ''}"`,
      `"${item.direct || ''}"`,
      `"${item.broker || ''}"`,
      `"${(item.nama_tertanggung || '').replace(/"/g, '""')}"`,
      `"${(item.afiliasi_tertanggung || '').replace(/"/g, '""')}"`,
      `"${(item.nama_tertanggung_loss || '').replace(/"/g, '""')}"`,
      `"${(item.nama_kapal || '').replace(/"/g, '""')}"`,
      `"${item.code_kapal || ''}"`,
      item.sum_insured || 0,
      item.loss_amount || 0,
      `"${item.currency || 'IDR'}"`,
      `"${item.date_of_loss || ''}"`,
      `"${(item.loss_cause || '').replace(/"/g, '""')}"`,
      `"${item.status || ''}"`
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
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
