import * as XLSX from 'xlsx';
import apiClient from './apiClient';
import mr11ColumnsRaw from './mr11_columns.json';

// Available source columns - includes standard MR11 source columns and user detected columns
export const AVAILABLE_EXCEL_COLUMNS = [
  '-- Pilih Kolom Excel --',
  'fac_code',
  'fac_cedant',
  'fac_broker',
  'fac_insured',
  'fac_insured_2',
  'fac_insured_code',
  'fac_cover',
  'fac_com_date',
  'fac_exp_date',
  'fac_acc_sts',
  'fac_desc',
  'fac_risk',
  'fac_currency',
  'fac_totsi',
  'fac_prem_rate',
  'Fac_snd_shr',
  'fac_snd_shr',
  'fac_wrt_shr',
  'fac_gpremium',
  'fac_our_amt',
  'fac_doc_date'
];

// 1. Template Akseptasi (Marine Hull) - 29 Columns (Schema: FACUL_ETL_MH_AKSEPTASI)
export const MAPPINGS_AKSEPTASI_MH = [
  { no: 1, standard_name: 'Fac Code', excel_col: 'fac_code', field_db: 'fac_code', data_type: 'VARCHAR', status: 'mapped', is_optional: false },
  { no: 2, standard_name: 'Reff Number', excel_col: '-- Pilih Kolom Excel --', field_db: 'reff_number', data_type: 'TEXT', status: 'unmapped', is_optional: true },
  { no: 3, standard_name: 'Direct', excel_col: 'fac_cedant', field_db: 'direct', data_type: 'TEXT', status: 'mapped', is_optional: false },
  { no: 4, standard_name: 'Broker', excel_col: 'fac_broker', field_db: 'broker', data_type: 'TEXT', status: 'mapped', is_optional: false },
  { no: 5, standard_name: 'Nama Tertanggung', excel_col: 'fac_insured', field_db: 'nama_tertanggung', data_type: 'TEXT', status: 'mapped', is_optional: false },
  { no: 6, standard_name: 'Afiliasi Tertanggung', excel_col: 'fac_insured', field_db: 'afiliasi_tertanggung', data_type: 'TEXT', status: 'mapped', is_optional: true },
  { no: 7, standard_name: 'Coverage', excel_col: 'fac_cover', field_db: 'coverage', data_type: 'TEXT', status: 'mapped', is_optional: false },
  { no: 8, standard_name: 'Start Date', excel_col: 'fac_com_date', field_db: 'start_date', data_type: 'DATE', status: 'mapped', is_optional: false },
  { no: 9, standard_name: 'End Date', excel_col: 'fac_exp_date', field_db: 'end_date', data_type: 'DATE', status: 'mapped', is_optional: false },
  { no: 10, standard_name: 'Acceptance Status', excel_col: 'fac_acc_sts', field_db: 'acceptance_status', data_type: 'TEXT', status: 'mapped', is_optional: false },
  { no: 11, standard_name: 'Nama Kapal', excel_col: 'fac_desc', field_db: 'nama_kapal', data_type: 'TEXT', status: 'mapped', is_optional: false },
  { no: 12, standard_name: 'Type of Vessel', excel_col: 'fac_desc', field_db: 'type_of_vessel', data_type: 'TEXT', status: 'mapped', is_optional: false },
  { no: 13, standard_name: 'Code Kapal', excel_col: 'fac_desc', field_db: 'code_kapal', data_type: 'TEXT', status: 'mapped', is_optional: false },
  { no: 14, standard_name: 'Size of Vessel', excel_col: 'fac_desc', field_db: 'size_of_vessel', data_type: 'TEXT', status: 'mapped', is_optional: false },
  { no: 15, standard_name: 'Year of Built', excel_col: 'fac_desc', field_db: 'year_of_built', data_type: 'TEXT', status: 'mapped', is_optional: false },
  { no: 16, standard_name: 'Type of Material', excel_col: 'fac_desc', field_db: 'type_of_material', data_type: 'TEXT', status: 'mapped', is_optional: false },
  { no: 17, standard_name: 'Classification', excel_col: 'fac_desc', field_db: 'classification', data_type: 'TEXT', status: 'mapped', is_optional: false },
  { no: 18, standard_name: 'Flag', excel_col: '-- Pilih Kolom Excel --', field_db: 'flag', data_type: 'TEXT', status: 'unmapped', is_optional: true },
  { no: 19, standard_name: 'Last Docking Date', excel_col: '-- Pilih Kolom Excel --', field_db: 'last_docking_date', data_type: 'DATE', status: 'unmapped', is_optional: true },
  { no: 20, standard_name: 'Jenis Muatan', excel_col: '-- Pilih Kolom Excel --', field_db: 'jenis_muatan', data_type: 'TEXT', status: 'unmapped', is_optional: true },
  { no: 21, standard_name: 'Trading Area', excel_col: '-- Pilih Kolom Excel --', field_db: 'trading_area', data_type: 'TEXT', status: 'unmapped', is_optional: true },
  { no: 22, standard_name: 'Currency', excel_col: 'fac_currency', field_db: 'currency', data_type: 'VARCHAR', status: 'mapped', is_optional: false },
  { no: 23, standard_name: 'Insured value', excel_col: 'fac_totsi', field_db: 'insured_value', data_type: 'NUMERIC', status: 'mapped', is_optional: false },
  { no: 24, standard_name: 'Premium Rate', excel_col: 'fac_prem_rate', field_db: 'premium_rate', data_type: 'NUMERIC', status: 'mapped', is_optional: false },
  { no: 25, standard_name: 'Premium Amount', excel_col: '-- Pilih Kolom Excel --', field_db: 'premium_amount', data_type: 'NUMERIC', status: 'unmapped', is_optional: true },
  { no: 26, standard_name: 'RIC', excel_col: '-- Pilih Kolom Excel --', field_db: 'ric', data_type: 'TEXT', status: 'unmapped', is_optional: true },
  { no: 27, standard_name: 'RIU Share', excel_col: 'Fac_snd_shr', field_db: 'riu_share', data_type: 'NUMERIC', status: 'mapped', is_optional: false },
  { no: 28, standard_name: 'RIU Gross Premium', excel_col: 'fac_gpremium', field_db: 'riu_gross_premium', data_type: 'NUMERIC', status: 'mapped', is_optional: false },
  { no: 29, standard_name: 'RIU Net Premium', excel_col: '-- Pilih Kolom Excel --', field_db: 'riu_net_premium', data_type: 'NUMERIC', status: 'unmapped', is_optional: true }
];

// 2. Template Loss PLA (Marine Hull) - 24 Columns (Schema: FACUL_ETL_MH_LOSS_PLA)
export const MAPPINGS_LOSS_PLA_MH = [
  { no: 1, standard_name: 'Fac Code', excel_col: 'fac_code', field_db: 'fac_code', data_type: 'VARCHAR', status: 'mapped', is_optional: false },
  { no: 2, standard_name: 'Reff Number', excel_col: 'fac_old_ref', field_db: 'reff_number', data_type: 'TEXT', status: 'mapped', is_optional: false },
  { no: 3, standard_name: 'Direct', excel_col: 'fac_cedant', field_db: 'direct', data_type: 'TEXT', status: 'mapped', is_optional: false },
  { no: 4, standard_name: 'Broker', excel_col: 'fac_broker', field_db: 'broker', data_type: 'TEXT', status: 'mapped', is_optional: false },
  { no: 5, standard_name: 'Nama Tertanggung', excel_col: 'fac_insured', field_db: 'nama_tertanggung', data_type: 'TEXT', status: 'mapped', is_optional: false },
  { no: 6, standard_name: 'Afiliasi Tertanggung', excel_col: 'fac_insured_code', field_db: 'afiliasi_tertanggung', data_type: 'TEXT', status: 'mapped', is_optional: true },
  { no: 7, standard_name: 'Nama Tertanngung yang Loss', excel_col: 'fac_insured', field_db: 'nama_tertanggung_loss', data_type: 'TEXT', status: 'mapped', is_optional: true },
  { no: 8, standard_name: 'Nama Kapal', excel_col: 'fac_vessel', field_db: 'nama_kapal', data_type: 'TEXT', status: 'mapped', is_optional: false },
  { no: 9, standard_name: 'Type of Vessel', excel_col: 'fac_c_hull', field_db: 'type_of_vessel', data_type: 'TEXT', status: 'mapped', is_optional: false },
  { no: 10, standard_name: 'Code Kapal', excel_col: 'fac_coycode', field_db: 'code_kapal', data_type: 'TEXT', status: 'mapped', is_optional: false },
  { no: 11, standard_name: 'Size of Vessel', excel_col: 'fac_tonage', field_db: 'size_of_vessel', data_type: 'TEXT', status: 'mapped', is_optional: false },
  { no: 12, standard_name: 'Year of Built', excel_col: 'fac_old', field_db: 'year_of_built', data_type: 'TEXT', status: 'mapped', is_optional: false },
  { no: 13, standard_name: 'Type of Material', excel_col: 'fac_constr', field_db: 'type_of_material', data_type: 'TEXT', status: 'mapped', is_optional: false },
  { no: 14, standard_name: 'Classification', excel_col: 'fac_classifi', field_db: 'classification', data_type: 'TEXT', status: 'mapped', is_optional: false },
  { no: 15, standard_name: 'Flag', excel_col: 'fac_sterr', field_db: 'flag', data_type: 'TEXT', status: 'mapped', is_optional: true },
  { no: 16, standard_name: 'Last Docking Date', excel_col: 'fac_doc_date', field_db: 'last_docking_date', data_type: 'DATE', status: 'mapped', is_optional: true },
  { no: 17, standard_name: 'Jenis Muatan', excel_col: 'fac_cargo', field_db: 'jenis_muatan', data_type: 'TEXT', status: 'mapped', is_optional: false },
  { no: 18, standard_name: 'RIU Share', excel_col: 'fac_wrt_shr', field_db: 'riu_share', data_type: 'NUMERIC', status: 'mapped', is_optional: false },
  { no: 19, standard_name: 'Date of Loss or UW Year', excel_col: 'fac_doc_date', field_db: 'date_of_loss', data_type: 'DATE', status: 'mapped', is_optional: false },
  { no: 20, standard_name: 'Currency', excel_col: 'fac_currency', field_db: 'currency', data_type: 'VARCHAR', status: 'mapped', is_optional: false },
  { no: 21, standard_name: 'OUR LOSS Amount', excel_col: 'fac_our_amt', field_db: 'loss_amount', data_type: 'NUMERIC', status: 'mapped', is_optional: false },
  { no: 22, standard_name: 'Cause of Loss', excel_col: 'fac_risk', field_db: 'loss_cause', data_type: 'TEXT', status: 'mapped', is_optional: false },
  { no: 23, standard_name: 'LOSS DETAIL', excel_col: 'fac_desc', field_db: 'loss_detail', data_type: 'TEXT', status: 'mapped', is_optional: true },
  { no: 24, standard_name: 'Settled or OS', excel_col: 'fac_acc_sts', field_db: 'settled_or_os', data_type: 'TEXT', status: 'mapped', is_optional: false }
];

// 3. Template Loss SLA (Marine Hull) - 24 Columns (Schema: FACUL_ETL_MH_LOSS_SETTLE)
export const MAPPINGS_LOSS_SLA_MH = [
  { no: 1, standard_name: 'Fac Code', excel_col: 'fac_code', field_db: 'fac_code', data_type: 'VARCHAR', status: 'mapped', is_optional: false },
  { no: 2, standard_name: 'Reff Number', excel_col: 'fac_old_ref', field_db: 'reff_number', data_type: 'TEXT', status: 'mapped', is_optional: false },
  { no: 3, standard_name: 'Direct', excel_col: 'fac_cedant', field_db: 'direct', data_type: 'TEXT', status: 'mapped', is_optional: false },
  { no: 4, standard_name: 'Broker', excel_col: 'fac_broker', field_db: 'broker', data_type: 'TEXT', status: 'mapped', is_optional: false },
  { no: 5, standard_name: 'Nama Tertanggung', excel_col: 'fac_insured', field_db: 'nama_tertanggung', data_type: 'TEXT', status: 'mapped', is_optional: false },
  { no: 6, standard_name: 'Afiliasi Tertanggung', excel_col: 'fac_insured_code', field_db: 'afiliasi_tertanggung', data_type: 'TEXT', status: 'mapped', is_optional: true },
  { no: 7, standard_name: 'Nama Tertanngung yang Loss', excel_col: 'fac_insured', field_db: 'nama_tertanggung_loss', data_type: 'TEXT', status: 'mapped', is_optional: true },
  { no: 8, standard_name: 'Nama Kapal', excel_col: 'fac_vessel', field_db: 'nama_kapal', data_type: 'TEXT', status: 'mapped', is_optional: false },
  { no: 9, standard_name: 'Type of Vessel', excel_col: 'fac_c_hull', field_db: 'type_of_vessel', data_type: 'TEXT', status: 'mapped', is_optional: false },
  { no: 10, standard_name: 'Code Kapal', excel_col: 'fac_coycode', field_db: 'code_kapal', data_type: 'TEXT', status: 'mapped', is_optional: false },
  { no: 11, standard_name: 'Size of Vessel', excel_col: 'fac_tonage', field_db: 'size_of_vessel', data_type: 'TEXT', status: 'mapped', is_optional: false },
  { no: 12, standard_name: 'Year of Built', excel_col: 'fac_old', field_db: 'year_of_built', data_type: 'TEXT', status: 'mapped', is_optional: false },
  { no: 13, standard_name: 'Type of Material', excel_col: 'fac_constr', field_db: 'type_of_material', data_type: 'TEXT', status: 'mapped', is_optional: false },
  { no: 14, standard_name: 'Classification', excel_col: 'fac_classifi', field_db: 'classification', data_type: 'TEXT', status: 'mapped', is_optional: false },
  { no: 15, standard_name: 'Flag', excel_col: 'fac_sterr', field_db: 'flag', data_type: 'TEXT', status: 'mapped', is_optional: true },
  { no: 16, standard_name: 'Last Docking Date', excel_col: 'fac_doc_date', field_db: 'last_docking_date', data_type: 'DATE', status: 'mapped', is_optional: true },
  { no: 17, standard_name: 'Jenis Muatan', excel_col: 'fac_cargo', field_db: 'jenis_muatan', data_type: 'TEXT', status: 'mapped', is_optional: false },
  { no: 18, standard_name: 'RIU Share', excel_col: 'fac_wrt_shr', field_db: 'riu_share', data_type: 'NUMERIC', status: 'mapped', is_optional: false },
  { no: 19, standard_name: 'Date of Loss or UW Year', excel_col: 'fac_doc_date', field_db: 'date_of_loss', data_type: 'DATE', status: 'mapped', is_optional: false },
  { no: 20, standard_name: 'Currency', excel_col: 'fac_currency', field_db: 'currency', data_type: 'VARCHAR', status: 'mapped', is_optional: false },
  { no: 21, standard_name: 'OUR LOSS Amount', excel_col: 'fac_our_amt', field_db: 'loss_amount', data_type: 'NUMERIC', status: 'mapped', is_optional: false },
  { no: 22, standard_name: 'Cause of Loss', excel_col: 'fac_risk', field_db: 'loss_cause', data_type: 'TEXT', status: 'mapped', is_optional: false },
  { no: 23, standard_name: 'LOSS DETAIL', excel_col: 'fac_desc', field_db: 'loss_detail', data_type: 'TEXT', status: 'mapped', is_optional: true },
  { no: 24, standard_name: 'Settled or OS', excel_col: 'fac_acc_sts', field_db: 'settled_or_os', data_type: 'TEXT', status: 'mapped', is_optional: false }
];

// Clear any pre-mapped source columns so user configures from uploaded file
const clearSourceColumns = (mappings) =>
  mappings.map((m) => ({
    ...m,
    excel_col: '-- Pilih Kolom Excel --',
    status: 'unmapped'
  }));

export const DEFAULT_MAPPINGS = MAPPINGS_AKSEPTASI_MH.map((m) => ({ ...m }));

// 3 Default System Templates for Marine Hull
export const SYSTEM_TEMPLATES = [
  {
    id: 1,
    name: 'Template Akseptasi (Marine Hull)',
    cob: 'Marine Hull',
    target_schema: 'FACUL_ETL_MH_AKSEPTASI',
    column_count: 29,
    description: 'Pemetaan skema MH - Data Akseptasi Marine Hull',
    mappings: MAPPINGS_AKSEPTASI_MH.map((m) => ({ ...m }))
  },
  {
    id: 2,
    name: 'Template Loss PLA (Marine Hull)',
    cob: 'Marine Hull',
    target_schema: 'FACUL_ETL_MH_LOSS_PLA',
    column_count: 24,
    description: 'Pemetaan klaim awal / Preliminary Loss Advice (OS)',
    mappings: MAPPINGS_LOSS_PLA_MH.map((m) => ({ ...m }))
  },
  {
    id: 3,
    name: 'Template Loss SLA (Marine Hull)',
    cob: 'Marine Hull',
    target_schema: 'FACUL_ETL_MH_LOSS_SETTLE',
    column_count: 24,
    description: 'Pemetaan klaim lunas / Settled Loss Advice',
    mappings: MAPPINGS_LOSS_SLA_MH.map((m) => ({ ...m }))
  }
];

let localTemplates = [...SYSTEM_TEMPLATES];

export const mappingService = {
  async getTemplates() {
    try {
      const res = await apiClient.get('/api/mapping-templates');
      if (res && Array.isArray(res) && res.length > 0) {
        // Filter out any legacy templates (Tripakarta, Bordero Fire)
        const validCustom = res.filter(t => 
          !t.name?.toLowerCase().includes('tripakarta') && 
          !t.name?.toLowerCase().includes('bordero') &&
          !SYSTEM_TEMPLATES.some(st => st.name === t.name)
        );
        return [...SYSTEM_TEMPLATES, ...validCustom];
      }
    } catch (err) {
      console.warn('Could not fetch mapping templates from API, using fallback:', err);
    }
    return SYSTEM_TEMPLATES;
  },

  async saveTemplate(template) {
    try {
      return await apiClient.post('/api/mapping-templates', template);
    } catch (err) {
      console.warn('Could not save template to API, updating local cache:', err);
      const existingIdx = localTemplates.findIndex((t) => t.name === template.name);
      if (existingIdx >= 0) {
        localTemplates[existingIdx] = { ...localTemplates[existingIdx], ...template };
      } else {
        localTemplates.push({ id: Date.now(), ...template });
      }
      return { success: true };
    }
  },

  async deleteTemplate(id) {
    try {
      return await apiClient.delete(`/api/mapping-templates/${id}`);
    } catch {
      localTemplates = localTemplates.filter((t) => t.id !== id);
      return { success: true };
    }
  },

  /**
   * Reads column headers directly from user-uploaded Excel or CSV file in browser using SheetJS
   */
  async parseFileHeaders(file) {
    if (!file) return [];
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const data = new Uint8Array(e.target.result);
          const workbook = XLSX.read(data, { type: 'array' });
          const firstSheetName = workbook.SheetNames[0];
          const worksheet = workbook.Sheets[firstSheetName];
          const json = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
          if (json && json.length > 0) {
            const headerRow = json[0];
            const cleanCols = headerRow
              .map((c) => (c ? String(c).trim() : ''))
              .filter(Boolean);
            resolve(cleanCols);
            return;
          }
        } catch (err) {
          console.error('Error parsing file headers with SheetJS:', err);
        }
        resolve([]);
      };
      reader.onerror = () => resolve([]);
      reader.readAsArrayBuffer(file);
    });
  },

  /**
   * Reads ALL rows (header + data) from an uploaded Excel/CSV file.
   * Returns: { headers: string[], rows: object[] }
   */
  async parseFileData(file) {
    if (!file) return { headers: [], rows: [] };
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const data = new Uint8Array(e.target.result);
          const workbook = XLSX.read(data, { type: 'array' });
          const firstSheetName = workbook.SheetNames[0];
          const worksheet = workbook.Sheets[firstSheetName];
          // header:1 → returns array-of-arrays; first row is header
          const rawRows = XLSX.utils.sheet_to_json(worksheet, { header: 1, defval: '' });
          if (!rawRows || rawRows.length < 2) {
            resolve({ headers: [], rows: [] });
            return;
          }
          const headers = rawRows[0].map((c) => (c ? String(c).trim() : '')).filter(Boolean);
          const dataRows = rawRows.slice(1).map((row) => {
            const obj = {};
            headers.forEach((h, i) => {
              obj[h] = row[i] !== undefined && row[i] !== null ? String(row[i]).trim() : '';
            });
            return obj;
          }).filter(row => Object.values(row).some(v => v !== ''));
          resolve({ headers, rows: dataRows });
        } catch (err) {
          console.error('Error parsing file data with SheetJS:', err);
          resolve({ headers: [], rows: [] });
        }
      };
      reader.onerror = () => resolve({ headers: [], rows: [] });
      reader.readAsArrayBuffer(file);
    });
  },

  /**
   * Generates a flexible mapping template directly from an array of detected column names
   */
  createTemplateFromColumns(columns, templateName = 'Template Impor Excel') {
    const mappings = columns.map((col, index) => {
      const fieldDb = col.toLowerCase().replace(/[^a-z0-9_]/g, '_').replace(/^_+|_+$/g, '') || `col_${index + 1}`;
      return {
        no: index + 1,
        standard_name: col.replace(/_/g, ' ').toUpperCase(),
        excel_col: col,
        field_db: fieldDb,
        data_type: 'VARCHAR',
        status: 'mapped',
        is_optional: false
      };
    });
    return {
      id: Date.now(),
      name: templateName,
      cob: 'Custom COB',
      target_schema: 'CUSTOM_STAGE_DB',
      column_count: mappings.length,
      description: `Template otomatis dibuat dari ${columns.length} kolom file Excel`,
      mappings
    };
  },

  /**
   * Creates a blank template with 1 initial editable row
   */
  createBlankTemplate(templateName = 'Template Baru (Kosong)') {
    const defaultRow = {
      no: 1,
      standard_name: 'Kolom Target 1',
      excel_col: '-- Pilih Kolom Excel --',
      field_db: 'kolom_target_1',
      data_type: 'VARCHAR',
      status: 'unmapped',
      is_optional: false
    };
    return {
      id: Date.now(),
      name: templateName,
      cob: 'Custom COB',
      target_schema: 'CUSTOM_STAGE_DB',
      column_count: 1,
      description: 'Template kosong manual yang dikonfigurasi pengguna',
      mappings: [defaultRow]
    };
  },

  /**
   * Creates an empty mapping row for manual addition
   */
  createEmptyMappingRow(no = 1) {
    return {
      no,
      standard_name: `Kolom Target ${no}`,
      excel_col: '-- Pilih Kolom Excel --',
      field_db: `kolom_${no}`,
      data_type: 'VARCHAR',
      status: 'unmapped',
      is_optional: false
    };
  },

  getTemplateByName(templateName) {
    const found = localTemplates.find((t) => t.name === templateName);
    return found || SYSTEM_TEMPLATES[0];
  },

  getDefaultMappings(templateName) {
    const template = this.getTemplateByName(templateName);
    const rows = template?.mappings || MAPPINGS_AKSEPTASI_MH;
    return JSON.parse(JSON.stringify(rows));
  },

  getAvailableExcelColumns() {
    return [...AVAILABLE_EXCEL_COLUMNS];
  },

  // Auto match standard attributes with detected columns or MR11 raw columns
  autoMatchRow(row, templateName, detectedCols = []) {
    // Helper to find column in detectedCols case-insensitively
    const findCol = (candidates) => {
      if (!detectedCols || detectedCols.length === 0) return null;
      const list = Array.isArray(candidates) ? candidates : [candidates];
      for (const cand of list) {
        const candNorm = String(cand).toLowerCase().replace(/[\s_-]/g, '');
        for (const col of detectedCols) {
          const colNorm = String(col).toLowerCase().replace(/[\s_-]/g, '');
          if (colNorm === candNorm) return col;
        }
      }
      return null;
    };

    const fieldDb = (row.field_db || '').toLowerCase();
    const stdName = (row.standard_name || '').toLowerCase().trim();

    // Specific rules as requested by user (tujuan -> sumber):
    // 1. Fac Code -> fac_code
    if (fieldDb === 'fac_code' || stdName === 'fac code') {
      return findCol(['fac_code', 'faccode', 'kode_fac', 'ccos_ref_code_1']) || 'fac_code';
    }

    // 2. Reff Number -> kosongkan
    if (fieldDb === 'reff_number' || stdName === 'reff number') {
      return '-- Pilih Kolom Excel --';
    }

    // 3. Direct -> fac_cedant (FK ke COMPANY)
    if (fieldDb === 'direct' || stdName === 'direct' || stdName.includes('cedant')) {
      return findCol(['fac_cedant', 'cedant', 'direct', 'cbg']) || 'fac_cedant';
    }

    // 4. Broker -> fac_broker (FK ke COMPANY)
    if (fieldDb === 'broker' || stdName === 'broker') {
      return findCol(['fac_broker', 'broker']) || 'fac_broker';
    }

    // 5. Nama Tertanggung -> fac_insured
    if (fieldDb === 'nama_tertanggung' || stdName === 'nama tertanggung') {
      return findCol(['fac_insured', 'insured', 'nama_tertanggung']) || 'fac_insured';
    }

    // 6. Afiliasi Tertanggung -> insured kedua di column insured
    if (fieldDb === 'afiliasi_tertanggung' || stdName === 'afiliasi tertanggung') {
      return findCol(['fac_insured_2', 'insured_2', 'fac_insured_code', 'afiliasi_tertanggung', 'fac_insured']) || 'fac_insured';
    }

    // 7. Coverage -> fac_cover
    if (fieldDb === 'coverage' || stdName === 'coverage') {
      return findCol(['fac_cover', 'coverage']) || 'fac_cover';
    }

    // 8. Start Date -> fac_com_date
    if (fieldDb === 'start_date' || stdName === 'start date') {
      return findCol(['fac_com_date', 'start_date', 'com_date']) || 'fac_com_date';
    }

    // 9. End Date -> fac_exp_date
    if (fieldDb === 'end_date' || stdName === 'end date') {
      return findCol(['fac_exp_date', 'end_date', 'exp_date']) || 'fac_exp_date';
    }

    // 10. Acceptance Status -> fac_acc_sts
    if (fieldDb === 'acceptance_status' || stdName === 'acceptance status') {
      return findCol(['fac_acc_sts', 'acceptance_status', 'acc_sts']) || 'fac_acc_sts';
    }

    // 11. Nama Kapal -> fac_desc
    if (fieldDb === 'nama_kapal' || stdName === 'nama kapal') {
      return findCol(['fac_desc', 'nama_kapal', 'fac_vessel']) || 'fac_desc';
    }

    // 12. Type of Vessel -> fac_desc, fac_risk
    if (fieldDb === 'type_of_vessel' || stdName === 'type of vessel') {
      return findCol(['fac_desc', 'fac_risk', 'type_of_vessel']) || 'fac_desc';
    }

    // 13. Code Kapal -> fac_desc
    if (fieldDb === 'code_kapal' || stdName === 'code kapal') {
      return findCol(['fac_desc', 'code_kapal', 'fac_coycode']) || 'fac_desc';
    }

    // 14. Size of Vessel -> fac_desc
    if (fieldDb === 'size_of_vessel' || stdName === 'size of vessel') {
      return findCol(['fac_desc', 'size_of_vessel', 'fac_tonage']) || 'fac_desc';
    }

    // 15. Year of Built -> fac_desc
    if (fieldDb === 'year_of_built' || stdName === 'year of built') {
      return findCol(['fac_desc', 'year_of_built', 'fac_old']) || 'fac_desc';
    }

    // 16. Type of Material -> fac_desc
    if (fieldDb === 'type_of_material' || stdName === 'type of material') {
      return findCol(['fac_desc', 'type_of_material', 'fac_constr']) || 'fac_desc';
    }

    // 17. Classification -> fac_desc
    if (fieldDb === 'classification' || stdName === 'classification') {
      return findCol(['fac_desc', 'classification', 'fac_classifi']) || 'fac_desc';
    }

    // 18. Flag -> kosongkan saja (karena tanpa referensi column)
    if (fieldDb === 'flag' || stdName === 'flag') {
      return '-- Pilih Kolom Excel --';
    }

    // 19. Last Docking Date -> kosongkan saja (karena tanpa referensi column)
    if (fieldDb === 'last_docking_date' || stdName === 'last docking date') {
      return '-- Pilih Kolom Excel --';
    }

    // 20. Jenis Muatan -> kosongkan saja (karena tanpa referensi column)
    if (fieldDb === 'jenis_muatan' || stdName === 'jenis muatan') {
      return '-- Pilih Kolom Excel --';
    }

    // 21. Trading Area -> kosongkan saja (karena tanpa referensi column)
    if (fieldDb === 'trading_area' || stdName === 'trading area') {
      return '-- Pilih Kolom Excel --';
    }

    // 22. Currency -> fac_currency (FK ke CURRENCY)
    if (fieldDb === 'currency' || stdName === 'currency') {
      return findCol(['fac_currency', 'currency', 'curr']) || 'fac_currency';
    }

    // 23. Insured value -> fac_totsi
    if (fieldDb === 'insured_value' || stdName === 'insured value') {
      return findCol(['fac_totsi', 'insured_value', 'totsi']) || 'fac_totsi';
    }

    // 24. Premium Rate -> fac_prem_rate
    if (fieldDb === 'premium_rate' || stdName === 'premium rate') {
      return findCol(['fac_prem_rate', 'premium_rate', 'prem_rate']) || 'fac_prem_rate';
    }

    // 25. Premium Amount -> kosongkan
    if (fieldDb === 'premium_amount' || stdName === 'premium amount') {
      return '-- Pilih Kolom Excel --';
    }

    // 26. RIC -> kosongkan
    if (fieldDb === 'ric' || stdName === 'ric') {
      return '-- Pilih Kolom Excel --';
    }

    // 27. RIU Share -> Fac_snd_shr
    if (fieldDb === 'riu_share' || stdName === 'riu share') {
      return findCol(['Fac_snd_shr', 'fac_snd_shr', 'fac_wrt_shr', 'riu_share', 'snd_shr']) || 'Fac_snd_shr';
    }

    // 28. RIU Gross Premium -> fac_gpremium
    if (fieldDb === 'riu_gross_premium' || stdName === 'riu gross premium') {
      return findCol(['fac_gpremium', 'riu_gross_premium', 'gpremium']) || 'fac_gpremium';
    }

    // 29. RIU Net Premium -> kosongkan
    if (fieldDb === 'riu_net_premium' || stdName === 'riu net premium') {
      return '-- Pilih Kolom Excel --';
    }

    // Loss PLA & SLA specifics:
    if (fieldDb === 'nama_tertanggung_loss' || stdName.includes('tertanngung') || stdName.includes('loss')) {
      return findCol(['fac_insured', 'nama_tertanggung_loss', 'insured']) || 'fac_insured';
    }
    if (fieldDb === 'date_of_loss' || stdName.includes('date of loss')) {
      return findCol(['fac_doc_date', 'date_of_loss', 'doc_date']) || 'fac_doc_date';
    }
    if (fieldDb === 'loss_amount' || stdName.includes('loss amount')) {
      return findCol(['fac_our_amt', 'loss_amount', 'our_amt']) || 'fac_our_amt';
    }
    if (fieldDb === 'loss_cause' || stdName.includes('cause of loss')) {
      return findCol(['fac_risk', 'loss_cause', 'risk']) || 'fac_risk';
    }
    if (fieldDb === 'loss_detail' || stdName.includes('loss detail')) {
      return findCol(['fac_desc', 'loss_detail', 'desc']) || 'fac_desc';
    }
    if (fieldDb === 'settled_or_os' || stdName.includes('settled')) {
      return findCol(['fac_acc_sts', 'settled_or_os', 'acc_sts']) || 'fac_acc_sts';
    }

    return row.excel_col || '-- Pilih Kolom Excel --';
  }
};

export default mappingService;
