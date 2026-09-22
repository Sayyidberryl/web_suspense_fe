/**
 * FacLens Service Layer
 * Clean Architecture layer decoupling UI from Backend / Database API.
 */

import apiClient from './apiClient';
import { mockLossPlaData, mockAcceptanceData, mockLossSlaData } from '../data/mockData';

// Configurable flag (defaults to real API mode, falling back gracefully to mock)
let isMockMode = false;

export const facLensService = {
  isMockActive() {
    return isMockMode;
  },

  setMockActive(active) {
    isMockMode = active;
  },

  setApiBaseUrl(url) {
    apiClient.setBaseUrl(url);
  },

  /**
   * Fetch Marine Hull table data based on active tab and filters
   */
  async getTableData({
    tab = 'loss_pla',
    filters = {},
    page = 1,
    limit = 12,
    sortBy = 'id',
    sortOrder = 'asc'
  } = {}) {
    if (!isMockMode) {
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
          totalPages: res.totalPages || Math.ceil((res.total || 0) / limit),
        };
      } catch (err) {
        console.warn('Backend API request failed, falling back to client mock data:', err);
      }
    }

    // Mock Mode: simulate API response with delay
    await new Promise((resolve) => setTimeout(resolve, 220));

    let rawList = mockLossPlaData;
    if (tab === 'acceptance') {
      rawList = mockAcceptanceData;
    } else if (tab === 'loss_sla') {
      rawList = mockLossSlaData;
    }

    // 1. Filter logic
    let filtered = rawList.filter((item) => {
      if (filters.facCode && !item.fac_code.toLowerCase().includes(filters.facCode.toLowerCase().trim())) {
        return false;
      }
      if (filters.companyName && !item.direct.toLowerCase().includes(filters.companyName.toLowerCase().trim())) {
        return false;
      }
      if (
        filters.insuredLossName &&
        !item.nama_tertanggung_loss.toLowerCase().includes(filters.insuredLossName.toLowerCase().trim()) &&
        !item.nama_tertanggung.toLowerCase().includes(filters.insuredLossName.toLowerCase().trim())
      ) {
        return false;
      }
      if (filters.vesselName && !item.nama_kapal.toLowerCase().includes(filters.vesselName.toLowerCase().trim())) {
        return false;
      }
      if (filters.vesselCode && !item.code_kapal.toLowerCase().includes(filters.vesselCode.toLowerCase().trim())) {
        return false;
      }
      if (filters.globalSearch) {
        const query = filters.globalSearch.toLowerCase().trim();
        const matchesGlobal =
          item.fac_code?.toLowerCase().includes(query) ||
          item.reff_number?.toLowerCase().includes(query) ||
          item.direct?.toLowerCase().includes(query) ||
          item.broker?.toLowerCase().includes(query) ||
          item.nama_tertanggung?.toLowerCase().includes(query) ||
          item.nama_kapal?.toLowerCase().includes(query);
        if (!matchesGlobal) return false;
      }
      return true;
    });

    // 2. Sort logic
    if (sortBy) {
      filtered.sort((a, b) => {
        let valA = a[sortBy] ?? '';
        let valB = b[sortBy] ?? '';
        if (typeof valA === 'string') valA = valA.toLowerCase();
        if (typeof valB === 'string') valB = valB.toLowerCase();

        if (valA < valB) return sortOrder === 'asc' ? -1 : 1;
        if (valA > valB) return sortOrder === 'asc' ? 1 : -1;
        return 0;
      });
    }

    // 3. Pagination logic
    const total = filtered.length;
    const startIndex = (page - 1) * limit;
    const paginatedData = filtered.slice(startIndex, startIndex + limit);

    return {
      data: paginatedData,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit) || 1,
    };
  },

  /**
   * Fetch KPI summary statistics
   */
  async getDashboardStats() {
    if (!isMockMode) {
      return await apiClient.get('/api/stats');
    }

    await new Promise((resolve) => setTimeout(resolve, 150));
    const totalClaims = mockLossPlaData.length;
    const totalClaimValue = mockLossPlaData.reduce((acc, curr) => acc + (curr.loss_amount || 0), 0);
    const uniqueVessels = new Set(mockLossPlaData.map((d) => d.nama_kapal)).size;
    const uniqueCedants = new Set(mockLossPlaData.map((d) => d.direct)).size;

    return {
      totalRecords: totalClaims,
      totalClaimValue,
      uniqueVessels,
      uniqueCedants,
      slaResolvedRate: '94.2%',
    };
  },

  /**
   * Utility to export dataset to CSV
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
