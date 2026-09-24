import * as XLSX from 'xlsx';

/**
 * Supabase Direct Service Layer
 * Fetches data directly from Supabase PostgREST API — no backend required.
 */

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL || 'https://uaoysegountarjanafbb.supabase.co';
const SUPABASE_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVhb3lzZWdvdW50YXJqYW5hZmJiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTAwNDQzNzUsImV4cCI6MjEwNTYyMDM3NX0.j6y0DQ1RflMJsiUiGSyADnvjkGDQttTH4Vq5HIM2xJo';

const SUPABASE_HEADERS = {
  apikey: SUPABASE_KEY,
  Authorization: `Bearer ${SUPABASE_KEY}`,
  'Content-Type': 'application/json',
  Prefer: 'count=exact',
};

/** Table configuration registry */
export const TABLE_CONFIG = [
  {
    id: 'acceptance',
    tableName: 'FACUL_ETL_MH_AKSEPTASI',
    label: 'MH - Data Akseptasi',
    fullLabel: 'MH - Data Akseptasi',
    description: 'Tabel DWH akseptasi polis, slip penutupan, dan portofolio risiko kapal',
    isAiParsed: false,
  },
  {
    id: 'loss_pla',
    tableName: 'FACUL_ETL_MH_LOSS_PLA',
    label: 'MH - Data Loss PLA',
    fullLabel: 'MH - Data Loss PLA',
    description: 'Tabel klaim loss yang masih outstanding / belum diselesaikan',
    isAiParsed: false,
  },
  {
    id: 'loss_sla',
    tableName: 'FACUL_ETL_MH_LOSS_SETTLE',
    label: 'MH - Data Loss SLA',
    fullLabel: 'MH - Data Loss SLA',
    description: 'Tabel klaim loss yang telah diselesaikan (settled)',
    isAiParsed: false,
  },
];

/** Map column key → human-readable label */
const COL_LABEL_MAP = {
  fac_code: 'FAC Code',
  reff_number: 'Ref No.',
  direct: 'Cedant (Direct)',
  broker: 'Broker',
  nama_tertanggung: 'Tertanggung',
  afiliasi_tertanggung: 'Afiliasi',
  nama_tertanggung_loss: 'Tertanggung Loss',
  nama_kapal: 'Nama Kapal',
  code_kapal: 'Kode Kapal',
  sum_insured: 'Sum Insured',
  loss_amount: 'Loss Amount',
  currency: 'Currency',
  date_of_loss: 'Tgl Loss',
  loss_cause: 'Penyebab Loss',
  status: 'Status',
  coverage: 'Coverage',
  start_date: 'Start Date',
  end_date: 'End Date',
  acceptance_status: 'Acceptance Status',
  type_of_vessel: 'Tipe Kapal',
  size_of_vessel: 'Ukuran Kapal',
  year_of_built: 'Thn Bangun',
  type_of_material: 'Material',
  classification: 'Klasifikasi',
  flag: 'Bendera',
  last_docking_date: 'Last Docking',
  jenis_muatan: 'Jenis Muatan',
  trading_area: 'Area Trading',
  insured_value: 'Nilai Pertanggungan',
  premium_rate: 'Premium Rate',
  premium_amount: 'Premium Amount',
  ric: 'RIC',
  riu_share: 'RIU Share',
  riu_gross_premium: 'Gross Premium',
  riu_net_premium: 'Net Premium',
  loss_detail: 'Detail Loss',
  settled_or_os: 'Settled/OS',
};

/** Auto-generate column metadata from a sample row */
function inferColumns(sampleRow, tableId) {
  if (!sampleRow) return [];
  const isAcceptance = tableId === 'acceptance';
  return Object.keys(sampleRow)
    .filter((k) => {
      if (k === 'id') return false;
      // Remove legacy `status` for acceptance (use acceptance_status instead)
      if (isAcceptance && k === 'status') return false;
      return true;
    })
    .map((k) => {
      const isAmt = /(amount|sum_insured|value|premium|insured_value|riu)/i.test(k);
      const isDate = /(date|created_at)/i.test(k);
      const isCode = /(fac_code|reff_number|code_kapal|ric)/i.test(k);
      const isVessel = /nama_kapal/i.test(k);
      return {
        key: k,
        label: COL_LABEL_MAP[k] || k.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase()),
        dataType: isAmt ? 'NUMERIC' : isDate ? 'DATE' : 'TEXT',
        isAmount: isAmt,
        isDate,
        isCode,
        isVessel,
        bold: k === 'fac_code' || k === 'nama_kapal',
      };
    });
}

/** Build PostgREST filter query string from filter object */
function buildFilterParams(tableId, filters = {}) {
  const parts = [];

  const addIlike = (col, val) => {
    if (val && val.trim()) {
      parts.push(`${col}=ilike.%25${encodeURIComponent(val.trim())}%25`);
    }
  };

  // Common filters
  addIlike('fac_code', filters.facCode);
  addIlike('broker', filters.broker);
  addIlike('currency', filters.currency);
  addIlike('loss_cause', filters.lossCause);
  if (filters.dateOfLoss && filters.dateOfLoss.trim()) {
    parts.push(`date_of_loss=eq.${encodeURIComponent(filters.dateOfLoss.trim())}`);
  }

  if (tableId === 'acceptance') {
    addIlike('direct', filters.companyName);
    addIlike('nama_tertanggung', filters.insuredName);
    addIlike('nama_kapal', filters.vesselName);
    addIlike('code_kapal', filters.vesselCode);
    addIlike('acceptance_status', filters.status);
    // global search across key columns
    if (filters.globalSearch && filters.globalSearch.trim()) {
      addIlike('fac_code', filters.globalSearch);
    }
  } else {
    // loss_pla / loss_sla
    addIlike('direct', filters.companyName);
    addIlike('nama_tertanggung_loss', filters.insuredLossName);
    addIlike('nama_kapal', filters.vesselLossName);
    addIlike('code_kapal', filters.vesselLossCode);
    addIlike('settled_or_os', filters.status);
    if (filters.globalSearch && filters.globalSearch.trim()) {
      addIlike('fac_code', filters.globalSearch);
    }
  }

  return parts.join('&');
}

export const facLensService = {
  /**
   * Get list of available DWH tables with live row counts
   */
  async getTables() {
    const results = await Promise.all(
      TABLE_CONFIG.map(async (cfg) => {
        try {
          const res = await fetch(
            `${SUPABASE_URL}/rest/v1/${cfg.tableName}?select=id&limit=1`,
            { headers: SUPABASE_HEADERS }
          );
          const cr = res.headers.get('content-range') || '';
          const total = cr.includes('/') ? parseInt(cr.split('/')[1], 10) : 0;
          return { ...cfg, count: total, columnsCount: 0 };
        } catch {
          return { ...cfg, count: 0, columnsCount: 0 };
        }
      })
    );
    return results;
  },

  /**
   * Fetch paginated data from a given DWH table directly via Supabase.
   * Returns full columns (no hardcoding), inferred from the first row.
   */
  async getTableData({ tab = 'acceptance', filters = {}, page = 1, limit = 25 } = {}) {
    const cfg = TABLE_CONFIG.find((t) => t.id === tab) || TABLE_CONFIG[0];
    const tableName = cfg.tableName;
    const offset = (page - 1) * limit;

    const filterQuery = buildFilterParams(tab, filters);
    const orderClause = 'order=id.asc';
    const paginationClause = limit === 'all' ? '' : `limit=${limit}&offset=${offset}`;

    const queryParts = [
      'select=*',
      paginationClause,
      orderClause,
      filterQuery,
    ].filter(Boolean);

    const url = `${SUPABASE_URL}/rest/v1/${tableName}?${queryParts.join('&')}`;

    try {
      const res = await fetch(url, { headers: SUPABASE_HEADERS });

      if (!res.ok) {
        const errText = await res.text();
        throw new Error(`Supabase error ${res.status}: ${errText}`);
      }

      const contentRange = res.headers.get('content-range') || '';
      const total = contentRange.includes('/')
        ? parseInt(contentRange.split('/')[1], 10)
        : 0;

      const data = await res.json();
      const columns = inferColumns(data[0] || null, tab);

      return {
        data,
        columns,
        total,
        page,
        limit,
        totalPages: Math.max(1, Math.ceil(total / limit)),
        tableName,
        tableId: tab,
        error: null,
      };
    } catch (err) {
      console.error('Failed to fetch from Supabase:', err);
      return {
        data: [],
        columns: [],
        total: 0,
        page,
        limit,
        totalPages: 1,
        tableName,
        tableId: tab,
        error: err.message || 'Gagal terhubung ke Supabase',
      };
    }
  },

  /**
   * Export current data to CSV — fetches ALL rows for the active table (up to 5000).
   */
  async exportToCsv(tableId = 'acceptance', filename, filters = {}) {
    const cfg = TABLE_CONFIG.find((t) => t.id === tableId) || TABLE_CONFIG[0];
    const csvFilename = filename || `export_${tableId}_${new Date().toISOString().slice(0, 10)}.csv`;

    try {
      const filterQuery = buildFilterParams(tableId, filters);
      const queryParts = ['select=*', 'limit=5000', 'order=id.asc', filterQuery].filter(Boolean);
      const url = `${SUPABASE_URL}/rest/v1/${cfg.tableName}?${queryParts.join('&')}`;
      const res = await fetch(url, { headers: SUPABASE_HEADERS });
      const data = await res.json();

      if (!data || !data.length) return;

      const isAcceptance = tableId === 'acceptance';
      const keys = Object.keys(data[0]).filter(
        (k) => k !== 'id' && !(isAcceptance && k === 'status')
      );
      const headerLabels = keys.map(
        (k) => COL_LABEL_MAP[k] || k.replace(/_/g, ' ').toUpperCase()
      );

      const rows = data.map((item) =>
        keys.map((k) => {
          const val = item[k];
          if (val === null || val === undefined) return '""';
          return `"${String(val).replace(/"/g, '""')}"`;
        })
      );

      const csvContent =
        'data:text/csv;charset=utf-8,\uFEFF' +
        [headerLabels.join(','), ...rows.map((r) => r.join(','))].join('\n');

      const link = document.createElement('a');
      link.setAttribute('href', encodeURI(csvContent));
      link.setAttribute('download', csvFilename);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (err) {
      console.error('Export failed:', err);
    }
  },

  /**
   * Export current data to Excel (.xlsx)
   * Fetches all filtered rows from Supabase (or uses in-memory data), formats columns, and downloads .xlsx
   */
  async exportToExcel({
    tableId = 'acceptance',
    title = 'MH - Data Akseptasi',
    filters = {},
    inMemoryData = null,
  } = {}) {
    const cfg = TABLE_CONFIG.find((t) => t.id === tableId) || TABLE_CONFIG[0];
    let rowsToExport = [];

    try {
      if (inMemoryData && inMemoryData.length > 0) {
        rowsToExport = inMemoryData;
      } else {
        const filterQuery = buildFilterParams(tableId, filters);
        const queryParts = ['select=*', 'limit=5000', 'order=id.asc', filterQuery].filter(Boolean);
        const url = `${SUPABASE_URL}/rest/v1/${cfg.tableName}?${queryParts.join('&')}`;
        const res = await fetch(url, { headers: SUPABASE_HEADERS });
        if (res.ok) {
          rowsToExport = await res.json();
        }
      }

      if (!rowsToExport || rowsToExport.length === 0) {
        alert('Tidak ada data yang dapat diunduh.');
        return false;
      }

      const isAcceptance = tableId === 'acceptance';
      const keys = Object.keys(rowsToExport[0]).filter(
        (k) => k !== 'id' && !(isAcceptance && k === 'status')
      );

      // Clean formatted data with proper business header labels
      const formattedData = rowsToExport.map((row) => {
        const rowObj = {};
        keys.forEach((k) => {
          const colHeader =
            COL_LABEL_MAP[k] ||
            k.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());
          rowObj[colHeader] =
            row[k] !== null && row[k] !== undefined ? row[k] : '';
        });
        return rowObj;
      });

      // Build worksheet
      const worksheet = XLSX.utils.json_to_sheet(formattedData);

      // Column widths auto-sizing
      const colWidths = keys.map((k) => {
        const headerLabel =
          COL_LABEL_MAP[k] ||
          k.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());
        const maxDataLen = Math.max(
          headerLabel.length,
          ...rowsToExport
            .slice(0, 50)
            .map((r) => (r[k] !== null && r[k] !== undefined ? String(r[k]).length : 0))
        );
        return { wch: Math.min(Math.max(maxDataLen + 4, 12), 45) };
      });
      worksheet['!cols'] = colWidths;

      // Build workbook
      const workbook = XLSX.utils.book_new();
      // Excel sheet name max 31 characters, no invalid chars : \ / ? * [ ]
      const cleanSheetName = (title || cfg.label || 'Data')
        .replace(/[\\/?*[\]:]/g, '_')
        .slice(0, 31);
      XLSX.utils.book_append_sheet(workbook, worksheet, cleanSheetName);

      // Save as .xlsx file
      const dateStr = new Date().toISOString().slice(0, 10);
      const filename = `${cleanSheetName}_${dateStr}.xlsx`;
      XLSX.writeFile(workbook, filename);
      return true;
    } catch (err) {
      console.error('Export to Excel failed:', err);
      alert('Gagal mengunduh berkas Excel: ' + (err.message || 'Kesalahan jaringan'));
      return false;
    }
  },

  /**
   * Mock functions for Parsing Engine Demo
   */
  async getAiPromptTemplates() {
    return [
      {
        id: '1',
        name: 'Ekstraksi & Explode Entitas Kapal Marine Hull (Multi-Vessel to Rows)',
        prompt_text: 'Anda adalah Senior Data Warehouse Engineer & Marine Insurance Specialist. Ekstrak entitas kapal individual dari deskripsi mentah. Jika 1 baris mengandung >1 kapal, explode menjadi baris terpisah (1 kapal = 1 baris). Ekstrak: Nama Kapal, Type of Vessel, Code Kapal, Size of Vessel, Year of Built, Type of Material, Classification.'
      }
    ];
  },

  async saveAiPromptTemplate(template) {
    return { success: true, data: template };
  },

  async getDemoUnparsedData() {
    return {
      data: [
        {
          fac_code: 'FAC-MH-001',
          fac_desc: 'MV Bintang Laut (General Cargo, 5000GT, 2010, Steel, BKI), MT Harapan (Oil Tanker, 8000GT, 2012, Steel, LR)'
        },
        {
          fac_code: 'FAC-MH-002',
          fac_desc: 'Tugboat Perkasa (Tug, 500GT, 2015, Steel, BKI)'
        }
      ]
    };
  },

  async runAiParse(payload, { skipDelay = false } = {}) {
    // 10 detik loading simulasi hanya untuk ColumnMappingView yang punya overlay sendiri
    if (!skipDelay) {
      await new Promise(resolve => setTimeout(resolve, 10000));
    }
    
    // Memanggil API backend (Python) agar membuat table history & generated_table baru
    const { apiClient } = await import('./apiClient.js');
    
    try {
      // Timeout 60s untuk Parsing Engine (deterministic, tidak perlu lama, tapi aman)
      const response = await apiClient.post('/api/ai-parse', payload, { timeout: 60000 });
      return response;
    } catch (err) {
      console.error('Error in Parsing Engine backend call:', err);
      throw err;
    }
  },

  /**
   * Panggil RPC Supabase untuk membuat tabel fisik baru dan insert data.
   */
  async createEtlTableRpc(facCodes, baseTableId, outputTitle, fileName) {
    const cfg = TABLE_CONFIG.find(t => t.id === baseTableId) || TABLE_CONFIG[0];
    const safeTitle = outputTitle.replace(/[^a-zA-Z0-9_]/g, '_').toUpperCase().substring(0, 30);
    const timestampSuffix = Math.floor(Date.now() / 1000);
    const newTableName = `etl_out_${safeTitle}_${timestampSuffix}`.toLowerCase();

    const payload = {
      p_new_table_name: newTableName,
      p_base_table_name: cfg.tableName,
      p_fac_codes: facCodes,
      p_label: outputTitle || cfg.label,
      p_description: `Hasil ETL Lookup dari ${fileName}`
    };

    const url = `${SUPABASE_URL}/rest/v1/rpc/create_etl_table`;
    
    try {
      const res = await fetch(url, { 
        method: 'POST',
        headers: {
          ...SUPABASE_HEADERS,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
      });
      
      if (!res.ok) {
        const errText = await res.text();
        throw new Error(`RPC failed: ${res.status} - ${errText}`);
      }
      
      return { success: true, tableName: newTableName };
    } catch (err) {
      console.error('createEtlTableRpc error:', err);
      throw err;
    }
  },
};

export default facLensService;

