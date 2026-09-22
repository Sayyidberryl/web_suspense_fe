import apiClient from './apiClient';

export const historyService = {
  /**
   * Fetch ETL processing history from database
   */
  async getHistory({ search = '', cob = '', status = '', page = 1, limit = 9 } = {}) {
    try {
      const params = { page, limit };
      if (search) params.search = search;
      if (cob && cob !== 'Semua Tipe COB' && cob !== 'Semua') params.cob = cob;
      if (status && status !== 'Status: Semua' && status !== 'Semua') params.status = status;

      const res = await apiClient.get('/api/history', params);
      if (res && Array.isArray(res.data)) {
        return {
          data: res.data,
          total: res.total || res.data.length,
          page: res.page || page,
          limit: res.limit || limit,
          totalPages: res.totalPages || Math.max(1, Math.ceil((res.total || res.data.length) / limit))
        };
      }
      return { data: [], total: 0, page: 1, limit, totalPages: 1 };
    } catch (err) {
      console.error('Failed to fetch history from backend:', err);
      return { data: [], total: 0, page: 1, limit, totalPages: 1 };
    }
  },

  /**
   * Create new history log entry in database
   */
  async createHistory(item) {
    try {
      const res = await apiClient.post('/api/history', item);
      return res;
    } catch (err) {
      console.error('Failed to post history to backend:', err);
      return { success: false, error: err.message };
    }
  },

  /**
   * Fetch specific history detail by ID
   */
  async getHistoryDetail(id) {
    try {
      return await apiClient.get(`/api/history/${id}`);
    } catch (err) {
      console.error(`Failed to fetch history detail for id ${id}:`, err);
      return null;
    }
  }
};

export default historyService;
