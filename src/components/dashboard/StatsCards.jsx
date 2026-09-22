import React from 'react';
import { ShieldAlert, Ship, Building, TrendingDown } from 'lucide-react';

export default function StatsCards({ stats, totalFiltered }) {
  const formatCurrency = (val) => {
    if (!val) return 'Rp 0';
    if (val >= 1e9) {
      return `Rp ${(val / 1e9).toFixed(1)} Miliar`;
    }
    return `Rp ${val.toLocaleString('id-ID')}`;
  };

  return (
    <div className="stats-grid">
      <div className="stat-card">
        <div className="stat-icon-wrapper blue">
          <ShieldAlert size={22} />
        </div>
        <div className="stat-info">
          <span className="stat-label">Total Data Klaim PLA</span>
          <span className="stat-value">{totalFiltered} <small style={{ fontSize: '0.75rem', fontWeight: 500, color: '#64748b' }}>/ {stats.totalRecords || 0}</small></span>
          <span className="stat-sub">Record Facultative Terdata</span>
        </div>
      </div>

      <div className="stat-card">
        <div className="stat-icon-wrapper amber">
          <TrendingDown size={22} />
        </div>
        <div className="stat-info">
          <span className="stat-label">Estimasi Nilai Klaim</span>
          <span className="stat-value">{formatCurrency(stats.totalClaimValue)}</span>
          <span className="stat-sub">Portfolio Marine Hull</span>
        </div>
      </div>

      <div className="stat-card">
        <div className="stat-icon-wrapper teal">
          <Building size={22} />
        </div>
        <div className="stat-info">
          <span className="stat-label">Perusahaan Asuransi</span>
          <span className="stat-value">{stats.uniqueCedants || 0}</span>
          <span className="stat-sub">Direct Ceding Partners</span>
        </div>
      </div>

      <div className="stat-card">
        <div className="stat-icon-wrapper emerald">
          <Ship size={22} />
        </div>
        <div className="stat-info">
          <span className="stat-label">Jumlah Armada Kapal</span>
          <span className="stat-value">{stats.uniqueVessels || 0}</span>
          <span className="stat-sub">Kapal Terdaftar di Polis</span>
        </div>
      </div>
    </div>
  );
}
