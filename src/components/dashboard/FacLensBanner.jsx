import React from 'react';

export default function FacLensBanner({ filters, onFilterChange }) {
  return (
    <div className="fac-lens-banner">
      <h2 className="banner-title">FAC LENS</h2>
      <p className="banner-subtitle">Facultative Data Intelligence and Analytics Dashboard</p>

      <div className="banner-filters">
        <div className="banner-filter-group">
          <span className="banner-filter-label">FAC Code</span>
          <input
            type="text"
            className="banner-filter-input"
            placeholder="Enter fac_code ..."
            value={filters.facCode || ''}
            onChange={(e) => onFilterChange('facCode', e.target.value)}
          />
        </div>
        <div className="banner-filter-group">
          <span className="banner-filter-label">Cedant Name</span>
          <input
            type="text"
            className="banner-filter-input"
            placeholder="Enter direct/ceding ..."
            value={filters.companyName || ''}
            onChange={(e) => onFilterChange('companyName', e.target.value)}
          />
        </div>
        <div className="banner-filter-group">
          <span className="banner-filter-label">Insured Loss Name</span>
          <input
            type="text"
            className="banner-filter-input"
            placeholder="Enter nama tertanggung / loss ..."
            value={filters.insuredLossName || ''}
            onChange={(e) => onFilterChange('insuredLossName', e.target.value)}
          />
        </div>
        <div className="banner-filter-group">
          <span className="banner-filter-label">Vessel Loss Name</span>
          <input
            type="text"
            className="banner-filter-input"
            placeholder="Enter nama kapal ..."
            value={filters.vesselName || ''}
            onChange={(e) => onFilterChange('vesselName', e.target.value)}
          />
        </div>
        <div className="banner-filter-group">
          <span className="banner-filter-label">Vessel Loss Code</span>
          <input
            type="text"
            className="banner-filter-input"
            placeholder="Enter kode kapal ..."
            value={filters.vesselCode || ''}
            onChange={(e) => onFilterChange('vesselCode', e.target.value)}
          />
        </div>
      </div>
    </div>
  );
}
