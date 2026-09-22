import React from 'react';
import { Info, X } from 'lucide-react';

export default function FilterBar({ filters, onFilterChange }) {
  const fields = [
    {
      id: 'facCode',
      label: 'FAC Code',
      placeholder: 'Enter fac_code...',
      tooltip: 'Kode identifikasi unik Polis Facultative Reinsurance'
    },
    {
      id: 'companyName',
      label: 'Company Name',
      placeholder: 'Enter direct...',
      tooltip: 'Nama Perusahaan Asuransi Ceding / Direct'
    },
    {
      id: 'insuredLossName',
      label: 'Insured Loss Name',
      placeholder: 'Enter nama_tertanggung_loss...',
      tooltip: 'Nama Tertanggung / Korban Klaim Kerugian'
    },
    {
      id: 'vesselName',
      label: 'Vessel Name',
      placeholder: 'Enter nama_kapal...',
      tooltip: 'Nama Kapal Marine Hull yang terdaftar'
    },
    {
      id: 'vesselCode',
      label: 'Vessel Code',
      placeholder: 'Enter code_kapal...',
      tooltip: 'Kode registrasi / IMO kapal'
    }
  ];

  return (
    <div className="filter-controls-card">
      {fields.map((field) => {
        const val = filters[field.id] || '';
        return (
          <div key={field.id} className="filter-field-group">
            <label className="filter-header-label">{field.label}</label>
            <div className="filter-input-wrapper">
              <input
                type="text"
                className="filter-input"
                placeholder={field.placeholder}
                value={val}
                onChange={(e) => onFilterChange(field.id, e.target.value)}
              />
              {val ? (
                <button
                  type="button"
                  className="filter-info-icon"
                  style={{ background: 'none', border: 'none', right: '6px' }}
                  onClick={() => onFilterChange(field.id, '')}
                  title="Clear"
                >
                  <X size={14} color="#94a3b8" />
                </button>
              ) : (
                <span className="filter-info-icon" title={field.tooltip}>
                  <Info size={14} />
                </span>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
