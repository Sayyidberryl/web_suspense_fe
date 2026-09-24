import * as XLSX from 'xlsx';
import apiClient from './apiClient';
import mr11ColumnsRaw from './mr11_columns.json';

// Available source columns - defaults to empty selection until user uploads file or adds columns
export const AVAILABLE_EXCEL_COLUMNS = [
  '-- Pilih Kolom Excel --'
];

// 1. Template Akseptasi (Marine Hull) - 29 Columns (Schema: FACUL_ETL_MH_AKSEPTASI)
export const MAPPINGS_AKSEPTASI_MH = [
  { no: 1, standard_name: 'Fac Code', excel_col: 'fac_code', field_db: 'fac_code', data_type: 'VARCHAR', status: 'mapped', is_optional: false },
  { no: 2, standard_name: 'Reff Number', excel_col: 'fac_old_ref', field_db: 'reff_number', data_type: 'TEXT', status: 'mapped', is_optional: false },
  { no: 3, standard_name: 'Direct', excel_col: 'fac_cedant', field_db: 'direct', data_type: 'TEXT', status: 'mapped', is_optional: false },
  { no: 4, standard_name: 'Broker', excel_col: 'fac_broker', field_db: 'broker', data_type: 'TEXT', status: 'mapped', is_optional: false },
  { no: 5, standard_name: 'Nama Tertanggung', excel_col: 'fac_insured', field_db: 'nama_tertanggung', data_type: 'TEXT', status: 'mapped', is_optional: false },
  { no: 6, standard_name: 'Afiliasi Tertanggung', excel_col: 'fac_insured_code', field_db: 'afiliasi_tertanggung', data_type: 'TEXT', status: 'mapped', is_optional: true },
  { no: 7, standard_name: 'Coverage', excel_col: 'fac_cover', field_db: 'coverage', data_type: 'TEXT', status: 'mapped', is_optional: false },
  { no: 8, standard_name: 'Start Date', excel_col: 'fac_com_date', field_db: 'start_date', data_type: 'DATE', status: 'mapped', is_optional: false },
  { no: 9, standard_name: 'End Date', excel_col: 'fac_exp_date', field_db: 'end_date', data_type: 'DATE', status: 'mapped', is_optional: false },
  { no: 10, standard_name: 'Acceptance Status', excel_col: 'fac_acc_sts', field_db: 'acceptance_status', data_type: 'TEXT', status: 'mapped', is_optional: false },
  { no: 11, standard_name: 'Nama Kapal', excel_col: 'fac_vessel', field_db: 'nama_kapal', data_type: 'TEXT', status: 'mapped', is_optional: false },
  { no: 12, standard_name: 'Type of Vessel', excel_col: 'fac_c_hull', field_db: 'type_of_vessel', data_type: 'TEXT', status: 'mapped', is_optional: false },
  { no: 13, standard_name: 'Code Kapal', excel_col: 'fac_coycode', field_db: 'code_kapal', data_type: 'TEXT', status: 'mapped', is_optional: false },
  { no: 14, standard_name: 'Size of Vessel', excel_col: 'fac_tonage', field_db: 'size_of_vessel', data_type: 'TEXT', status: 'mapped', is_optional: false },
  { no: 15, standard_name: 'Year of Built', excel_col: 'fac_old', field_db: 'year_of_built', data_type: 'TEXT', status: 'mapped', is_optional: false },
  { no: 16, standard_name: 'Type of Material', excel_col: 'fac_constr', field_db: 'type_of_material', data_type: 'TEXT', status: 'mapped', is_optional: false },
  { no: 17, standard_name: 'Classification', excel_col: 'fac_classifi', field_db: 'classification', data_type: 'TEXT', status: 'mapped', is_optional: false },
  { no: 18, standard_name: 'Flag', excel_col: 'fac_sterr', field_db: 'flag', data_type: 'TEXT', status: 'mapped', is_optional: true },
  { no: 19, standard_name: 'Last Docking Date', excel_col: 'fac_doc_date', field_db: 'last_docking_date', data_type: 'DATE', status: 'mapped', is_optional: true },
  { no: 20, standard_name: 'Jenis Muatan', excel_col: 'fac_cargo', field_db: 'jenis_muatan', data_type: 'TEXT', status: 'mapped', is_optional: false },
  { no: 21, standard_name: 'Trading Area', excel_col: 'fac_territory', field_db: 'trading_area', data_type: 'TEXT', status: 'mapped', is_optional: false },
  { no: 22, standard_name: 'Currency', excel_col: 'fac_currency', field_db: 'currency', data_type: 'VARCHAR', status: 'mapped', is_optional: false },
  { no: 23, standard_name: 'Insured value', excel_col: 'fac_totsi', field_db: 'insured_value', data_type: 'NUMERIC', status: 'mapped', is_optional: false },
  { no: 24, standard_name: 'Premium Rate', excel_col: 'fac_prem_rate', field_db: 'premium_rate', data_type: 'NUMERIC', status: 'mapped', is_optional: false },
  { no: 25, standard_name: 'Premium Amount', excel_col: 'fac_gpremium', field_db: 'premium_amount', data_type: 'NUMERIC', status: 'mapped', is_optional: false },
  { no: 26, standard_name: 'RIC', excel_col: 'fac_mra_code', field_db: 'ric', data_type: 'TEXT', status: 'mapped', is_optional: true },
  { no: 27, standard_name: 'RIU Share', excel_col: 'fac_wrt_shr', field_db: 'riu_share', data_type: 'NUMERIC', status: 'mapped', is_optional: false },
  { no: 28, standard_name: 'RIU Gross Premium', excel_col: 'fac_gpremium', field_db: 'riu_gross_premium', data_type: 'NUMERIC', status: 'mapped', is_optional: false },
  { no: 29, standard_name: 'RIU Net Premium', excel_col: 'fac_npremium', field_db: 'riu_net_premium', data_type: 'NUMERIC', status: 'mapped', is_optional: false }
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

export const DEFAULT_MAPPINGS = clearSourceColumns(MAPPINGS_AKSEPTASI_MH);

// 3 Default System Templates for Marine Hull
export const SYSTEM_TEMPLATES = [
  {
    id: 1,
    name: 'Template Akseptasi (Marine Hull)',
    cob: 'Marine Hull',
    target_schema: 'FACUL_ETL_MH_AKSEPTASI',
    column_count: 29,
    description: 'Pemetaan skema MH - Data Akseptasi Marine Hull',
    mappings: clearSourceColumns(MAPPINGS_AKSEPTASI_MH)
  },
  {
    id: 2,
    name: 'Template Loss PLA (Marine Hull)',
    cob: 'Marine Hull',
    target_schema: 'FACUL_ETL_MH_LOSS_PLA',
    column_count: 24,
    description: 'Pemetaan klaim awal / Preliminary Loss Advice (OS)',
    mappings: clearSourceColumns(MAPPINGS_LOSS_PLA_MH)
  },
  {
    id: 3,
    name: 'Template Loss SLA (Marine Hull)',
    cob: 'Marine Hull',
    target_schema: 'FACUL_ETL_MH_LOSS_SETTLE',
    column_count: 24,
    description: 'Pemetaan klaim lunas / Settled Loss Advice',
    mappings: clearSourceColumns(MAPPINGS_LOSS_SLA_MH)
  }
];

let localTemplates = [...SYSTEM_TEMPLATES];

export const mappingService = {
  async getTemplates() {
    try {
      const res = await apiClient.get('/api/mapping-templates');
      if (res && Array.isArray(res) && res.length > 0) {
        return res;
      }
    } catch (err) {
      console.warn('Could not fetch mapping templates from API, using fallback:', err);
    }
    return localTemplates;
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
    const rows = JSON.parse(JSON.stringify(template.mappings || MAPPINGS_AKSEPTASI_MH));
    return clearSourceColumns(rows);
  },

  getAvailableExcelColumns() {
    return [...AVAILABLE_EXCEL_COLUMNS];
  },

  // Auto match standard attributes with MR11 raw columns
  autoMatchRow(row, templateName) {
    const isAkseptasi = templateName ? templateName.includes('Akseptasi') : true;
    const isLoss = templateName ? (templateName.includes('PLA') || templateName.includes('SLA') || templateName.includes('Loss')) : false;

    let match = '-- Pilih Kolom Excel --';

    switch (row.field_db) {
      case 'fac_code':
        match = 'fac_code';
        break;
      case 'reff_number':
        match = '-- Pilih Kolom Excel --';
        break;
      case 'direct':
        match = 'fac_cedant';
        break;
      case 'broker':
        match = 'fac_broker';
        break;
      case 'nama_tertanggung':
        match = 'fac_insured';
        break;
      case 'afiliasi_tertanggung':
        match = 'fac_insured';
        break;
      case 'nama_tertanngung_loss':
        match = 'fac_insured';
        break;
      case 'coverage':
        match = 'fac_cover';
        break;
      case 'start_date':
        match = 'fac_com_date';
        break;
      case 'end_date':
        match = 'fac_exp_date';
        break;
      case 'acceptance_status':
        match = 'fac_acc_sts';
        break;
      case 'nama_kapal':
        match = 'fac_desc';
        break;
      case 'type_of_vessel':
        match = 'fac_risk + fac_desc';
        break;
      case 'code_kapal':
        match = 'fac_desc';
        break;
      case 'size_of_vessel':
        match = 'fac_desc';
        break;
      case 'year_of_built':
        match = 'fac_desc';
        break;
      case 'type_of_material':
        match = 'fac_desc';
        break;
      case 'classification':
        match = 'fac_desc';
        break;
      case 'flag':
        match = '-- Pilih Kolom Excel --';
        break;
      case 'last_docking_date':
        match = '-- Pilih Kolom Excel --';
        break;
      case 'jenis_muatan':
        match = '-- Pilih Kolom Excel --';
        break;
      case 'trading_area':
        match = '-- Pilih Kolom Excel --';
        break;
      case 'currency':
        match = 'fac_currency';
        break;
      case 'insured_value':
        match = 'fac_totsi';
        break;
      case 'premium_rate':
        match = 'fac_prem_rate';
        break;
      case 'premium_amount':
        match = '-- Pilih Kolom Excel --';
        break;
      case 'ric':
        match = '-- Pilih Kolom Excel --';
        break;
      case 'riu_share':
        match = 'fac_snd_shr';
        break;
      case 'riu_gross_premium':
        match = 'fac_gpremium';
        break;
      case 'riu_net_premium':
        match = '-- Pilih Kolom Excel --';
        break;
      case 'date_of_loss':
        match = 'fac_doc_date';
        break;
      case 'loss_amount':
        match = 'fac_our_amt';
        break;
      case 'loss_cause':
        match = 'fac_risk';
        break;
      case 'loss_detail':
        match = 'fac_desc';
        break;
      case 'settled_or_os':
        match = 'fac_acc_sts';
        break;
      default:
        match = row.excel_col || '-- Pilih Kolom Excel --';
    }

    return match;
  }
};

export default mappingService;
