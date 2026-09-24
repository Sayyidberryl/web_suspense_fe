import React, { useState, useEffect } from 'react';
import { Lightbulb, Lock, Check, Zap } from 'lucide-react';

export default function AiParsingLoadingOverlay({ fileInfo, onClose }) {
  const [progress, setProgress] = useState(0);
  const [timeLeft, setTimeLeft] = useState(10);
  const [phase, setPhase] = useState(0); // 0=extract, 1=mapping, 2=parsing, 3=save

  useEffect(() => {
    const totalDuration = 10000;
    const intervalMs = 120;
    const steps = totalDuration / intervalMs;
    let currentStep = 0;

    const timer = setInterval(() => {
      currentStep++;
      const rawProgress = (currentStep / steps) * 100;
      const smoothed = Math.min(99, Math.floor(rawProgress));
      setProgress(smoothed);
      setTimeLeft(Math.max(1, Math.ceil(10 - (currentStep * intervalMs) / 1000)));

      if (smoothed < 30) setPhase(0);
      else if (smoothed < 60) setPhase(1);
      else if (smoothed < 85) setPhase(2);
      else setPhase(3);

      if (currentStep >= steps) clearInterval(timer);
    }, intervalMs);

    return () => clearInterval(timer);
  }, []);

  const fileName = fileInfo?.fileName || 'Data_Mentah_MarineHull.xlsx';
  const rows = Math.floor(10 * (progress / 100));

  const steps = [
    { label: 'Ekstraksi', done: progress >= 30 },
    { label: 'Mapping Kolom', done: progress >= 60 },
    { label: 'Parsing Engine', done: progress >= 85, active: progress >= 60 && progress < 85 },
    { label: 'Simpan DB', done: false, active: progress >= 85 },
  ];

  // SVG circle math
  const R = 54;
  const circ = 2 * Math.PI * R;
  const offset = circ - (circ * progress) / 100;

  return (
    <div style={{
      position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
      backgroundColor: 'rgba(15,23,42,0.55)',
      zIndex: 9999,
      display: 'flex', flexDirection: 'column',
      alignItems: 'center', justifyContent: 'center',
      backdropFilter: 'blur(10px)',
      fontFamily: 'Inter, system-ui, sans-serif',
      padding: '24px'
    }}>
      <div style={{
        background: '#ffffff',
        borderRadius: '28px',
        width: '100%',
        maxWidth: '680px',
        boxShadow: '0 32px 64px -16px rgba(0,0,0,0.25)',
        padding: '44px 48px',
        display: 'flex', flexDirection: 'column',
        alignItems: 'center',
        textAlign: 'center',
        position: 'relative',
        overflow: 'hidden',
        animation: 'overlayIn 0.3s cubic-bezier(0.16,1,0.3,1)'
      }}>
        {/* Decorative background gradient */}
        <div style={{
          position: 'absolute', top: 0, left: 0, right: 0, height: '4px',
          background: 'linear-gradient(90deg, #0ea5e9, #6366f1, #059669)'
        }} />

        {/* Top Badge */}
        <div style={{
          background: 'linear-gradient(135deg, #f0f9ff, #e0f2fe)',
          color: '#0369a1',
          border: '1px solid #bae6fd',
          borderRadius: '999px',
          padding: '7px 18px',
          fontSize: '0.72rem',
          fontWeight: 700,
          display: 'flex', alignItems: 'center', gap: '7px',
          marginBottom: '32px',
          letterSpacing: '0.06em',
          textTransform: 'uppercase'
        }}>
          <Zap size={13} />
          Parsing Engine · AI Processing
        </div>

        {/* ─── Circular Progress Ring ─── */}
        <div style={{
          position: 'relative',
          width: '160px', height: '160px',
          marginBottom: '28px',
          flexShrink: 0
        }}>
          {/* SVG ring */}
          <svg
            viewBox="0 0 120 120"
            width="160" height="160"
            style={{ transform: 'rotate(-90deg)', display: 'block' }}
          >
            <defs>
              <linearGradient id="pgGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#0ea5e9" />
                <stop offset="50%" stopColor="#6366f1" />
                <stop offset="100%" stopColor="#059669" />
              </linearGradient>
            </defs>
            {/* Track */}
            <circle cx="60" cy="60" r={R} fill="none" stroke="#f1f5f9" strokeWidth="10" />
            {/* Progress */}
            <circle
              cx="60" cy="60" r={R}
              fill="none"
              stroke="url(#pgGrad)"
              strokeWidth="10"
              strokeLinecap="round"
              strokeDasharray={circ}
              strokeDashoffset={offset}
              style={{ transition: 'stroke-dashoffset 0.12s linear' }}
            />
          </svg>

          {/* Center text — absolutely positioned over SVG */}
          <div style={{
            position: 'absolute', inset: 0,
            display: 'flex', flexDirection: 'column',
            alignItems: 'center', justifyContent: 'center',
            pointerEvents: 'none'
          }}>
            <span style={{
              fontSize: '2rem', fontWeight: 900,
              color: '#0f172a', lineHeight: 1,
              letterSpacing: '-0.03em'
            }}>
              {progress}%
            </span>
            <span style={{
              fontSize: '0.55rem', fontWeight: 700,
              color: '#059669', letterSpacing: '0.06em',
              marginTop: '5px', textTransform: 'uppercase',
              display: 'flex', alignItems: 'center', gap: '4px'
            }}>
              <span style={{
                width: 5, height: 5,
                borderRadius: '50%', background: '#10b981',
                boxShadow: '0 0 4px #10b981', display: 'inline-block'
              }} />
              Aktif
            </span>
          </div>
        </div>

        {/* Title */}
        <h2 style={{
          fontSize: '1.5rem', fontWeight: 800,
          color: '#0f172a', margin: '0 0 10px 0',
          letterSpacing: '-0.02em', lineHeight: 1.3
        }}>
          Sedang Memproses Data
        </h2>
        <p style={{
          color: '#64748b', fontSize: '0.88rem',
          lineHeight: 1.6, margin: '0 0 8px 0', maxWidth: '460px'
        }}>
          Sistem memvalidasi struktur kolom, normalisasi tipe data,
          dan mencocokkan skema dari berkas
        </p>

        {/* File pill */}
        <div style={{
          background: '#f8fafc', border: '1px solid #e2e8f0',
          borderRadius: '8px', padding: '5px 14px',
          fontSize: '0.78rem', fontWeight: 600, color: '#334155',
          marginBottom: '24px', display: 'inline-flex', alignItems: 'center', gap: '6px'
        }}>
          📄 {fileName}
        </div>

        {/* Linear Progress Bar */}
        <div style={{
          width: '85%', height: '5px',
          background: '#f1f5f9', borderRadius: '99px',
          overflow: 'hidden', marginBottom: '24px'
        }}>
          <div style={{
            height: '100%', width: `${progress}%`,
            background: 'linear-gradient(90deg, #0ea5e9, #6366f1, #059669)',
            borderRadius: '99px',
            transition: 'width 0.12s linear'
          }} />
        </div>

        {/* 3 Metric Cards */}
        <div style={{
          display: 'grid', gridTemplateColumns: '1fr 1.3fr 1fr',
          gap: '12px', width: '100%', marginBottom: '28px'
        }}>
          {[
            { label: 'Sisa Waktu', val: `~${timeLeft} Dtk`, mono: true },
            { label: 'Baris Diproses', val: `${rows} / 10`, mono: true, accent: '#0369a1' },
            { label: 'Akurasi Skema', val: '99.8%', accent: '#059669', mono: true },
          ].map((m, i) => (
            <div key={i} style={{
              background: '#f8fafc', border: '1px solid #f1f5f9',
              borderRadius: '12px', padding: '14px 12px',
              display: 'flex', flexDirection: 'column', gap: '4px', alignItems: 'center'
            }}>
              <span style={{ fontSize: '0.72rem', color: '#94a3b8', fontWeight: 500 }}>{m.label}</span>
              <span style={{
                fontSize: '1rem', fontWeight: 800,
                color: m.accent || '#0f172a',
                fontFamily: m.mono ? 'monospace' : 'inherit'
              }}>{m.val}</span>
            </div>
          ))}
        </div>

        {/* Stepper */}
        <div style={{
          display: 'flex', alignItems: 'center',
          justifyContent: 'center', gap: 0,
          width: '100%', marginBottom: '32px'
        }}>
          {steps.map((s, i) => (
            <React.Fragment key={i}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <div style={{
                  width: 22, height: 22, borderRadius: '50%', flexShrink: 0,
                  background: s.done ? '#dcfce7' : s.active ? '#e0e7ff' : '#f1f5f9',
                  color: s.done ? '#16a34a' : s.active ? '#4f46e5' : '#94a3b8',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: '0.7rem', fontWeight: 700,
                  border: s.active ? '1.5px solid #a5b4fc' : 'none',
                  transition: 'all 0.3s ease'
                }}>
                  {s.done ? <Check size={11} strokeWidth={3} /> : i + 1}
                </div>
                <span style={{
                  fontSize: '0.75rem', fontWeight: s.active ? 700 : 600,
                  color: s.done ? '#16a34a' : s.active ? '#4f46e5' : '#94a3b8',
                  whiteSpace: 'nowrap'
                }}>{s.label}</span>
              </div>
              {i < steps.length - 1 && (
                <div style={{
                  width: '28px', height: '1.5px',
                  background: steps[i + 1]?.done || s.done ? '#86efac' : '#e2e8f0',
                  margin: '0 8px', flexShrink: 0,
                  transition: 'background 0.3s ease'
                }} />
              )}
            </React.Fragment>
          ))}
        </div>

        {/* Actions */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <button
            onClick={onClose}
            style={{
              background: '#f8fafc', border: '1px solid #e2e8f0',
              padding: '10px 22px', borderRadius: '10px',
              color: '#334155', fontSize: '0.85rem', fontWeight: 600,
              display: 'flex', alignItems: 'center', gap: '7px', cursor: 'pointer',
              transition: 'all 0.15s'
            }}
            onMouseOver={e => e.currentTarget.style.background = '#f1f5f9'}
            onMouseOut={e => e.currentTarget.style.background = '#f8fafc'}
          >
            <Lock size={13} color="#64748b" />
            Jalankan di Latar Belakang
          </button>
          <button
            onClick={onClose}
            style={{
              background: 'none', border: 'none',
              color: '#94a3b8', fontSize: '0.85rem', fontWeight: 500,
              cursor: 'pointer', padding: '10px 14px'
            }}
          >
            Batalkan
          </button>
        </div>

        <style>{`
          @keyframes overlayIn {
            from { opacity:0; transform:scale(0.96) translateY(8px); }
            to   { opacity:1; transform:scale(1) translateY(0); }
          }
        `}</style>
      </div>

      <div style={{
        marginTop: '16px', color: '#94a3b8',
        fontSize: '0.73rem', display: 'flex', alignItems: 'center', gap: '5px'
      }}>
        <Lightbulb size={11} />
        Pemrosesan otomatis menggunakan Parsing Engine terpusat.
      </div>
    </div>
  );
}
