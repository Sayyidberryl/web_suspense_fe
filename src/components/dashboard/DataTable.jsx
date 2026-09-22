import React from 'react';
import { MoreVertical } from 'lucide-react';

export default function DataTable({ data, loading }) {
  if (loading) {
    return <div style={{ padding: 40, textAlign: 'center' }}>Loading data...</div>;
  }

  // Use a subset of headers for the visual mockup look
  const headers = ['Header', 'Header', 'Header', 'Header', 'Header', 'Header'];

  return (
    <div className="table-card-container">
      <div className="table-responsive-wrapper">
        <table className="fac-table">
          <thead>
            <tr>
              <th style={{ width: 40, textAlign: 'center' }}>
                <div className="row-checkbox" />
              </th>
              {headers.map((h, i) => (
                <th key={i}>{h}</th>
              ))}
              <th style={{ width: 40 }}></th>
            </tr>
          </thead>
          <tbody>
            {data.length > 0 ? (
              data.map((row, i) => (
                <tr key={i}>
                  <td style={{ textAlign: 'center' }}>
                    <div className="row-checkbox" />
                  </td>
                  {/* Just rendering 'Text' to match mockup, or we could render actual row data */}
                  {/* For the sake of the functional app, let's render real data if available, but truncated to 6 cols */}
                  <td>{row.fac_code || 'Text'}</td>
                  <td>{row.reff_number || 'Text'}</td>
                  <td>{row.direct || 'Text'}</td>
                  <td>{row.nama_kapal || 'Text'}</td>
                  <td>{row.currency || 'Text'}</td>
                  <td>{row.loss_amount || row.premium_amount || 'Text'}</td>
                  <td>
                    <MoreVertical size={16} />
                  </td>
                </tr>
              ))
            ) : (
              // Empty rows to match the mockup visually even if no data
              Array.from({ length: 12 }).map((_, i) => (
                <tr key={i}>
                  <td style={{ textAlign: 'center' }}>
                    <div className="row-checkbox" />
                  </td>
                  <td>Text</td>
                  <td>Text</td>
                  <td>Text</td>
                  <td>Text</td>
                  <td>Text</td>
                  <td>Text</td>
                  <td>
                    <MoreVertical size={16} />
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <div className="history-pagination-bar" style={{ marginTop: 16 }}>
        <div className="pagination-left">
          <span>Menampilkan <strong>1 - 50</strong> dari <strong>1500</strong> berkas</span>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <span>Tampilkan:</span>
            <select className="per-page-select" defaultValue="50">
              <option value="10">10 per halaman</option>
              <option value="25">25 per halaman</option>
              <option value="50">50 per halaman</option>
              <option value="100">100 per halaman</option>
            </select>
          </div>
        </div>

        <div className="pagination-numbers">
          <button className="page-btn" disabled>&lt;</button>
          <button className="page-btn active">1</button>
          <button className="page-btn">2</button>
          <button className="page-btn">3</button>
          <span style={{ padding: '0 4px', color: '#9ca3af' }}>...</span>
          <button className="page-btn">6</button>
          <button className="page-btn">&gt;</button>
        </div>
      </div>
    </div>
  );
}
