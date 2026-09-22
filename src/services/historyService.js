import apiClient from './apiClient';

const FALLBACK_HISTORY = [
  {
    id: 1,
    file_name: "Bordero_TriPakarta_Fire_Q3_2026.xlsx",
    file_size: "14.8 MB",
    file_type: "XLSX",
    cedant: "PT Asuransi Tri Pakarta",
    cob: "Fire & Property",
    status: "Berhasil Dimuat",
    date_display: "19 Sep 2026, 14:30 WIB",
    records_count: 48250,
    schema_accuracy: 99.8,
    duration_seconds: 8.2,
    log_message: "Parsing skema sukses. Sebanyak 48,250 baris data berhasil divalidasi dan dimuat ke ipr_stage_db."
  },
  {
    id: 2,
    file_name: "Bordero_TriPakarta_Fire_Q3_2026.xlsx",
    file_size: "14.8 MB",
    file_type: "XLSX",
    cedant: "PT Asuransi Tri Pakarta",
    cob: "Fire & Property",
    status: "Berhasil Dimuat",
    date_display: "19 Sep 2026, 14:30 WIB",
    records_count: 48250,
    schema_accuracy: 99.8,
    duration_seconds: 8.2,
    log_message: "Duplikasi batch validasi berhasil diverifikasi."
  },
  {
    id: 3,
    file_name: "Cargo_Domestik_Container_Agustus.xlsx",
    file_size: "22.1 MB",
    file_type: "XLSX",
    cedant: "PT Asuransi Astra Buana",
    cob: "Marine Cargo",
    status: "Proses Validasi",
    date_display: "19 Sep 2026, 11:45 WIB",
    records_count: 31400,
    schema_accuracy: 95.4,
    duration_seconds: 12.0,
    log_message: "Validasi integritas checksum sedang berjalan di background server worker."
  },
  {
    id: 4,
    file_name: "Engineering_CAR_Tol_TransSumatera.xlsx",
    file_size: "18.4 MB",
    file_type: "XLSX",
    cedant: "PT Asuransi Tugu Pratama",
    cob: "Engineering",
    status: "Berhasil Dimuat",
    date_display: "18 Sep 2026, 17:05 WIB",
    records_count: 62100,
    schema_accuracy: 100.0,
    duration_seconds: 9.5,
    log_message: "Ekstraksi borderaux konstruksi jalan tol selesai tanpa anomali data."
  },
  {
    id: 5,
    file_name: "Bordero_TriPakarta_Fire_Q3_2026.xlsx",
    file_size: "14.8 MB",
    file_type: "XLSX",
    cedant: "PT Asuransi Tri Pakarta",
    cob: "Fire & Property",
    status: "Berhasil Dimuat",
    date_display: "19 Sep 2026, 14:30 WIB",
    records_count: 48250,
    schema_accuracy: 99.8,
    duration_seconds: 8.2,
    log_message: "Parsing skema sukses."
  },
  {
    id: 6,
    file_name: "General_Liability_Umum_Smstr2.xlsx",
    file_size: "5.9 MB",
    file_type: "XLSX",
    cedant: "PT Asuransi Wahana Tata",
    cob: "Liability",
    status: "Gagal Skema",
    date_display: "18 Sep 2026, 11:20 WIB",
    records_count: 12400,
    schema_accuracy: 78.2,
    duration_seconds: 4.1,
    log_message: "Kolom 'TSI_ORIGINAL' tidak cocok dengan tipe NUMERIC standar IPR (terdeteksi nilai String bermasalah pada baris 410)."
  },
  {
    id: 7,
    file_name: "Marine_Cargo_Import_Batam_Sep2026.xlsx",
    file_size: "11.2 MB",
    file_type: "XLSX",
    cedant: "PT Asuransi Central Asia",
    cob: "Marine Cargo",
    status: "Berhasil Dimuat",
    date_display: "17 Sep 2026, 15:10 WIB",
    records_count: 38900,
    schema_accuracy: 99.4,
    duration_seconds: 7.8,
    log_message: "Validasi polis kapal dan muatan berhasil dipetakan ke fsi_db."
  },
  {
    id: 8,
    file_name: "Property_Industrial_Cikarang_Q2.xlsx",
    file_size: "16.7 MB",
    file_type: "XLSX",
    cedant: "PT Asuransi Dayin Mitra",
    cob: "Fire & Property",
    status: "Berhasil Dimuat",
    date_display: "16 Sep 2026, 09:40 WIB",
    records_count: 54300,
    schema_accuracy: 99.9,
    duration_seconds: 10.1,
    log_message: "Borderaux industri manufaktur berhasil tersimpan di sistem analitik."
  },
  {
    id: 9,
    file_name: "Heavy_Machinery_Mining_Kalimantan.xlsx",
    file_size: "20.3 MB",
    file_type: "XLSX",
    cedant: "PT Asuransi Tugu Pratama",
    cob: "Engineering",
    status: "Berhasil Dimuat",
    date_display: "15 Sep 2026, 16:20 WIB",
    records_count: 41200,
    schema_accuracy: 99.6,
    duration_seconds: 8.7,
    log_message: "Pemetaan alat berat tambang batu bara selesai terintegrasi."
  }
];

let localCache = [...FALLBACK_HISTORY];

export const historyService = {
  async getHistory({ search = '', cob = '', status = '', page = 1, limit = 9 } = {}) {
    try {
      const params = { page, limit };
      if (search) params.search = search;
      if (cob && cob !== 'Semua Tipe COB') params.cob = cob;
      if (status && status !== 'Status: Semua') params.status = status;

      const res = await apiClient.get('/api/history', params);
      if (res && Array.isArray(res.data)) {
        return {
          data: res.data,
          total: res.total || res.data.length,
          page: res.page || page,
          limit: res.limit || limit,
          totalPages: res.totalPages || Math.ceil((res.total || res.data.length) / limit)
        };
      }
    } catch (err) {
      console.warn('Could not reach /api/history, using local fallback:', err);
    }

    // Local fallback filtering
    let filtered = localCache.filter((item) => {
      if (search) {
        const q = search.toLowerCase().trim();
        const matchName = item.file_name.toLowerCase().includes(q);
        const matchCedant = item.cedant.toLowerCase().includes(q);
        if (!matchName && !matchCedant) return false;
      }
      if (cob && cob !== 'Semua Tipe COB' && cob !== 'Semua') {
        if (item.cob.toLowerCase() !== cob.toLowerCase()) return false;
      }
      if (status && status !== 'Status: Semua' && status !== 'Semua') {
        if (item.status !== status) return false;
      }
      return true;
    });

    const total = filtered.length;
    const offset = (page - 1) * limit;
    const paginated = filtered.slice(offset, offset + limit);

    return {
      data: paginated,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit) || 1
    };
  },

  async createHistory(item) {
    try {
      const res = await apiClient.post('/api/history', item);
      return res;
    } catch (err) {
      console.warn('Could not post to /api/history, adding to local cache:', err);
      const newItem = {
        id: Date.now(),
        ...item,
        date_display: item.date_display || new Date().toLocaleString('id-ID')
      };
      localCache.unshift(newItem);
      return { success: true, id: newItem.id };
    }
  },

  async getHistoryDetail(id) {
    try {
      return await apiClient.get(`/api/history/${id}`);
    } catch {
      return localCache.find((i) => i.id === Number(id)) || null;
    }
  }
};

export default historyService;
