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
  },

  /**
   * Update existing history record (e.g. edit title/filename)
   */
  async updateHistory(id, { file_name, status, log_message }) {
    try {
      const res = await apiClient.patch(`/api/history/${id}`, { file_name, status, log_message });
      return res;
    } catch (err) {
      console.warn('Backend updateHistory failed, attempting direct Supabase update:', err);
      try {
        const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL || 'https://uaoysegountarjanafbb.supabase.co';
        const SUPABASE_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVhb3lzZWdvdW50YXJqYW5hZmJiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTAwNDQzNzUsImV4cCI6MjEwNTYyMDM3NX0.j6y0DQ1RflMJsiUiGSyADnvjkGDQttTH4Vq5HIM2xJo';
        const patchData = {};
        if (file_name !== undefined) patchData.file_name = file_name;
        if (status !== undefined) patchData.status = status;
        if (log_message !== undefined) patchData.log_message = log_message;
        const res = await fetch(`${SUPABASE_URL}/rest/v1/etl_history?id=eq.${id}`, {
          method: 'PATCH',
          headers: {
            apikey: SUPABASE_KEY,
            Authorization: `Bearer ${SUPABASE_KEY}`,
            'Content-Type': 'application/json',
            Prefer: 'return=representation'
          },
          body: JSON.stringify(patchData)
        });
        if (!res.ok) throw new Error(await res.text());
        return { success: true };
      } catch (sbErr) {
        console.error('Supabase direct update error:', sbErr);
        throw sbErr;
      }
    }
  },

  /**
   * Delete history record
   */
  async deleteHistory(id) {
    try {
      const res = await apiClient.delete(`/api/history/${id}`);
      return res;
    } catch (err) {
      console.warn('Backend deleteHistory failed, attempting direct Supabase delete:', err);
      try {
        const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL || 'https://uaoysegountarjanafbb.supabase.co';
        const SUPABASE_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVhb3lzZWdvdW50YXJqYW5hZmJiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTAwNDQzNzUsImV4cCI6MjEwNTYyMDM3NX0.j6y0DQ1RflMJsiUiGSyADnvjkGDQttTH4Vq5HIM2xJo';
        const res = await fetch(`${SUPABASE_URL}/rest/v1/etl_history?id=eq.${id}`, {
          method: 'DELETE',
          headers: {
            apikey: SUPABASE_KEY,
            Authorization: `Bearer ${SUPABASE_KEY}`,
          }
        });
        if (!res.ok) throw new Error(await res.text());
        return { success: true };
      } catch (sbErr) {
        console.error('Supabase direct delete error:', sbErr);
        throw sbErr;
      }
    }
  }
};

export default historyService;
