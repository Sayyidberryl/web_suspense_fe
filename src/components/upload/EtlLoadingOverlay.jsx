import React, { useState, useEffect } from 'react';
import { Database, Check, Layers } from 'lucide-react';

export default function EtlLoadingOverlay({ fileInfo }) {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const totalDuration = 4000;
    const intervalMs = 80;
    const steps = totalDuration / intervalMs;
    let currentStep = 0;

    const timer = setInterval(() => {
      currentStep++;
      const rawProgress = (currentStep / steps) * 100;
      const smoothed = Math.min(99, Math.floor(rawProgress));
      setProgress(smoothed);

      if (currentStep >= steps) clearInterval(timer);
    }, intervalMs);

    return () => clearInterval(timer);
  }, []);

  const fileName = fileInfo?.fileName || 'Berkas ETL';

  const steps = [
    { label: 'Ekstraksi Berkas', done: progress >= 25, active: progress < 25 },
    { label: 'Pemetaan Kolom', done: progress >= 50, active: progress >= 25 && progress < 50 },
    { label: 'Pencocokan Data Warehouse', done: progress >= 80, active: progress >= 50 && progress < 80 },
    { label: 'Penyimpanan Tabel Output', done: progress >= 95, active: progress >= 80 },
  ];

  return (
    <div style={{
      position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
      backgroundColor: 'rgba(15,23,42,0.6)',
      zIndex: 9999,
      display: 'flex', flexDirection: 'column',
      alignItems: 'center', justifyContent: 'center',
      backdropFilter: 'blur(5px)',
      fontFamily: 'Inter, system-ui, sans-serif',
      padding: '24px'
    }}>
      <div style={{
        background: '#ffffff',
        borderRadius: '20px',
        width: '100%',
        maxWidth: '560px',
        boxShadow: '0 25px 50px -12px rgba(0,0,0,0.25)',
        padding: '36px 40px',
        display: 'flex', flexDirection: 'column',
        alignItems: 'center',
        textAlign: 'center',
        position: 'relative',
        overflow: 'hidden',
        border: '1px solid #e2e8f0'
      }}>
        {/* Top bar indicator */}
        <div style={{
          position: 'absolute', top: 0, left: 0, right: 0, height: '4px',
          background: '#0284c7'
        }} />

        {/* Top Badge */}
        <div style={{
          background: '#f0fdf4',
          color: '#15803d',
          border: '1px solid #bbf7d0',
          borderRadius: '999px',
          padding: '6px 16px',
          fontSize: '0.75rem',
          fontWeight: 700,
          display: 'flex', alignItems: 'center', gap: '6px',
          marginBottom: '24px',
          letterSpacing: '0.04em',
          textTransform: 'uppercase'
        }}>
          <Database size={13} />
          Eksekusi Pipeline ETL
        </div>

        {/* Circular Ring or Progress Bar */}
        <div style={{
          width: '100px', height: '100px',
          borderRadius: '50%',
          border: '4px solid #f1f5f9',
          borderTopColor: '#0284c7',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          marginBottom: '20px',
          animation: 'spin 1.2s linear infinite'
        }}>
          <span style={{ fontSize: '1.25rem', fontWeight: 800, color: '#0f172a' }}>
            {progress}%
          </span>
        </div>

        <h3 style={{ margin: '0 0 6px 0', fontSize: '1.2rem', fontWeight: 700, color: '#0f172a' }}>
          Memproses Berkas ETL
        </h3>
        <p style={{ margin: '0 0 24px 0', fontSize: '0.85rem', color: '#64748b' }}>
          Sedang mengekstrak kode fac dan mencocokkan baris dari <strong>{fileName}</strong>
        </p>

        {/* Steps List */}
        <div style={{
          width: '100%',
          display: 'flex',
          flexDirection: 'column',
          gap: '10px',
          textAlign: 'left'
        }}>
          {steps.map((st, idx) => (
            <div
              key={idx}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '10px 14px',
                borderRadius: '8px',
                background: st.done ? '#f0fdf4' : st.active ? '#f8fafc' : '#ffffff',
                border: `1px solid ${st.done ? '#bbf7d0' : st.active ? '#cbd5e1' : '#f1f5f9'}`
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <div style={{
                  width: 22, height: 22, borderRadius: '50%',
                  background: st.done ? '#16a34a' : st.active ? '#0284c7' : '#e2e8f0',
                  color: '#ffffff',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: '0.72rem', fontWeight: 700
                }}>
                  {st.done ? <Check size={13} strokeWidth={3} /> : idx + 1}
                </div>
                <span style={{
                  fontSize: '0.82rem',
                  fontWeight: st.active || st.done ? 600 : 400,
                  color: st.done ? '#166534' : st.active ? '#0f172a' : '#94a3b8'
                }}>
                  {st.label}
                </span>
              </div>

              <span style={{
                fontSize: '0.72rem',
                fontWeight: 600,
                color: st.done ? '#16a34a' : st.active ? '#0284c7' : '#cbd5e1'
              }}>
                {st.done ? 'Selesai' : st.active ? 'Memproses...' : 'Menunggu'}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
