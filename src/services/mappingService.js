import apiClient from './apiClient';

export const DEFAULT_MAPPINGS = [
  { no: 1, standard_name: "NO", excel_col: "No", field_db: "no", data_type: "BIGINT", status: "mapped", is_optional: false },
  { no: 2, standard_name: "COB", excel_col: "COB", field_db: "cob", data_type: "TEXT", status: "mapped", is_optional: false },
  { no: 3, standard_name: "CLAIM REFFERENCE NUMBER", excel_col: "REGISTER NO.", field_db: "claim_ref_number", data_type: "TEXT", status: "mapped", is_optional: false },
  { no: 4, standard_name: "POLICY NUMBER", excel_col: "POLICY NUMBER", field_db: "policy_number", data_type: "TEXT", status: "mapped", is_optional: false },
  { no: 5, standard_name: "CERTIFICATE NUMBER", excel_col: "-- Pilih Kolom Excel --", field_db: "certificate_number", data_type: "TEXT", status: "optional", is_optional: true },
  { no: 6, standard_name: "Reff No of Bordereaux\n(premium cession)", excel_col: "-- Pilih Kolom Excel --", field_db: "reff_bordereaux_premium", data_type: "TEXT", status: "optional", is_optional: true },
  { no: 7, standard_name: "INSURED NAME", excel_col: "NAMA TERTANGGUNG", field_db: "insured_name", data_type: "TEXT", status: "mapped", is_optional: false },
  { no: 8, standard_name: "SUM INSURED (ORIGINAL CURRENCY)", excel_col: "TSI ORIGINAL", field_db: "tsi_original", data_type: "NUMERIC", status: "mapped", is_optional: false }
];

export const AVAILABLE_EXCEL_COLUMNS = [
  "-- Pilih Kolom Excel --",
  "No",
  "COB",
  "REGISTER NO.",
  "POLICY NUMBER",
  "CERTIFICATE NO",
  "REFF BORDEREAUX",
  "NAMA TERTANGGUNG",
  "TSI ORIGINAL",
  "SUM INSURED SHARE",
  "PREMIUM AMOUNT",
  "BROKER NAME",
  "VESSEL CODE",
  "VESSEL NAME",
  "LOSS CAUSE",
  "DATE OF LOSS"
];

let localTemplates = [
  {
    id: 1,
    name: "Format Standar Bordero TriPakarta Fire 2026",
    target_schema: "ipr_stage_db",
    mappings: DEFAULT_MAPPINGS
  }
];

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

  getDefaultMappings() {
    return JSON.parse(JSON.stringify(DEFAULT_MAPPINGS));
  },

  getAvailableExcelColumns() {
    return [...AVAILABLE_EXCEL_COLUMNS];
  }
};

export default mappingService;
