import React, { useState, useEffect } from 'react';
import { Lightbulb, Lock, Check } from 'lucide-react';

export default function AiParsingLoadingOverlay({ fileInfo, onClose }) {
  const [progress, setProgress] = useState(0);
  const [timeLeft, setTimeLeft] = useState(10);
  
  useEffect(() => {
    const totalDuration = 10000; // 10 seconds
    const interval = 100; // update every 100ms
    const steps = totalDuration / interval;
    let currentStep = 0;
    
    const timer = setInterval(() => {
      currentStep++;
      
      // Calculate progress curve (fast at first, slow at end)
      const rawProgress = (currentStep / steps) * 100;
      // Logarithmic-like smoothing
      const smoothed = Math.min(99, Math.floor(rawProgress));
      setProgress(smoothed);
      
      const remainingSeconds = Math.max(1, Math.ceil(10 - (currentStep * interval) / 1000));
      setTimeLeft(remainingSeconds);
      
      if (currentStep >= steps) {
        clearInterval(timer);
      }
    }, interval);
    
    return () => clearInterval(timer);
  }, []);

  const fileName = fileInfo?.fileName || 'Data_Mentah_MarineHull.xlsx';

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(248, 250, 252, 0.9)',
      zIndex: 9999,
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      backdropFilter: 'blur(8px)',
      fontFamily: 'Inter, system-ui, sans-serif'
    }}>
      <div style={{
        background: '#ffffff',
        borderRadius: '24px',
        width: '100%',
        maxWidth: '750px',
        boxShadow: '0 20px 40px -10px rgba(0,0,0,0.1)',
        padding: '50px 40px',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        textAlign: 'center',
        position: 'relative',
        overflow: 'hidden'
      }}>
        
        {/* Top Badge */}
        <div style={{
          background: '#f0f9ff',
          color: '#0369a1',
          border: '1px solid #bae6fd',
          borderRadius: '999px',
          padding: '6px 16px',
          fontSize: '0.75rem',
          fontWeight: 700,
          display: 'flex',
          alignItems: 'center',
          gap: '6px',
          marginBottom: '40px',
          letterSpacing: '0.02em'
        }}>
          <Lightbulb size={14} />
          PEMROSESAN & VALIDASI BERJALAN
        </div>

        {/* Circular Progress Ring */}
        <div style={{
          position: 'relative',
          width: '200px',
          height: '200px',
          marginBottom: '40px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexDirection: 'column'
        }}>
          {/* SVG Ring Background */}
          <svg style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', transform: 'rotate(-90deg)' }} viewBox="0 0 100 100">
            <circle cx="50" cy="50" r="45" fill="none" stroke="#f1f5f9" strokeWidth="8" />
            <circle 
              cx="50" cy="50" r="45" 
              fill="none" 
              stroke="url(#progressGradient)" 
              strokeWidth="8" 
              strokeDasharray="283" 
              strokeDashoffset={283 - (283 * progress) / 100}
              strokeLinecap="round"
              style={{ transition: 'stroke-dashoffset 0.1s linear' }}
            />
            <defs>
              <linearGradient id="progressGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#0ea5e9" />
                <stop offset="100%" stopColor="#059669" />
              </linearGradient>
            </defs>
          </svg>
          
          <div style={{ fontSize: '3rem', fontWeight: 900, color: '#0f172a', lineHeight: '1', marginTop: '10px' }}>
            {progress}%
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '8px', fontSize: '0.7rem', fontWeight: 700, color: '#059669', letterSpacing: '0.05em' }}>
            <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#059669' }}></span>
            MENGANALISIS DATA
          </div>
        </div>

        {/* Texts */}
        <h2 style={{ fontSize: '1.8rem', fontWeight: 800, color: '#0f172a', margin: '0 0 12px 0' }}>
          Sedang Memproses Data dengan Parsing Engine
        </h2>
        <p style={{ color: '#64748b', fontSize: '0.95rem', lineHeight: '1.6', margin: '0 0 30px 0', maxWidth: '500px' }}>
          Sistem sedang memvalidasi struktur kolom, normalisasi tipe data,<br/>
          dan mencocokkan skema dari berkas<br/>
          <span style={{ background: '#f1f5f9', padding: '2px 8px', borderRadius: '4px', fontWeight: 600, color: '#334155', display: 'inline-block', marginTop: '6px' }}>{fileName}</span>
        </p>

        {/* Thin Linear Progress Bar */}
        <div style={{ width: '80%', height: '6px', background: '#f1f5f9', borderRadius: '99px', overflow: 'hidden', marginBottom: '30px' }}>
          <div style={{ 
            height: '100%', 
            width: `${progress}%`, 
            background: 'linear-gradient(90deg, #0ea5e9, #059669)',
            transition: 'width 0.1s linear'
          }}></div>
        </div>

        {/* 3 Metric Cards */}
        <div style={{ display: 'flex', gap: '16px', width: '90%', marginBottom: '40px' }}>
          <div style={{ flex: 1, background: '#f8fafc', borderRadius: '12px', padding: '16px', border: '1px solid #f1f5f9' }}>
            <div style={{ fontSize: '0.75rem', color: '#64748b', marginBottom: '6px' }}>Sisa Waktu</div>
            <div style={{ fontSize: '1.1rem', fontWeight: 700, color: '#334155', fontFamily: 'monospace' }}>~{timeLeft} Detik</div>
          </div>
          <div style={{ flex: 1.2, background: '#f8fafc', borderRadius: '12px', padding: '16px', border: '1px solid #f1f5f9' }}>
            <div style={{ fontSize: '0.75rem', color: '#64748b', marginBottom: '6px' }}>Baris Diproses</div>
            <div style={{ fontSize: '1.1rem', fontWeight: 700, color: '#0369a1', fontFamily: 'monospace' }}>
              {Math.floor(10 * (progress/100))} / 10
            </div>
          </div>
          <div style={{ flex: 1, background: '#f8fafc', borderRadius: '12px', padding: '16px', border: '1px solid #f1f5f9' }}>
            <div style={{ fontSize: '0.75rem', color: '#64748b', marginBottom: '6px' }}>Akurasi Skema</div>
            <div style={{ fontSize: '1.1rem', fontWeight: 700, color: '#059669', fontFamily: 'monospace' }}>99.8%</div>
          </div>
        </div>

        {/* Stepper */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '90%', marginBottom: '40px' }}>
          
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <div style={{ width: 20, height: 20, borderRadius: '50%', background: '#dcfce7', color: '#16a34a', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Check size={12} strokeWidth={3} />
            </div>
            <span style={{ fontSize: '0.8rem', fontWeight: 600, color: '#16a34a' }}>Ekstraksi</span>
          </div>
          
          <div style={{ width: '40px', height: '1px', background: '#cbd5e1', margin: '0 12px' }}></div>
          
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <div style={{ width: 20, height: 20, borderRadius: '50%', background: '#dcfce7', color: '#16a34a', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Check size={12} strokeWidth={3} />
            </div>
            <span style={{ fontSize: '0.8rem', fontWeight: 600, color: '#16a34a' }}>Mapping Kolom</span>
          </div>
          
          <div style={{ width: '40px', height: '1px', background: '#cbd5e1', margin: '0 12px' }}></div>
          
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <div style={{ width: 24, height: 24, borderRadius: '50%', background: '#e0e7ff', color: '#4f46e5', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.75rem', fontWeight: 700 }}>
              3
            </div>
            <span style={{ fontSize: '0.8rem', fontWeight: 700, color: '#1e3a8a' }}>Parsing Engine</span>
          </div>
          
          <div style={{ width: '40px', height: '1px', background: '#cbd5e1', margin: '0 12px' }}></div>
          
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', opacity: 0.5 }}>
            <div style={{ width: 20, height: 20, borderRadius: '50%', background: '#f1f5f9', color: '#94a3b8', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.7rem', fontWeight: 700 }}>
              4
            </div>
            <span style={{ fontSize: '0.8rem', fontWeight: 600, color: '#64748b' }}>Simpan DB</span>
          </div>

        </div>

        {/* Actions */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <button style={{
            background: '#f1f5f9',
            border: 'none',
            padding: '12px 24px',
            borderRadius: '12px',
            color: '#334155',
            fontSize: '0.85rem',
            fontWeight: 600,
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            cursor: 'pointer'
          }}>
            <Lock size={14} color="#64748b" />
            Jalankan di Latar Belakang
          </button>
          <button style={{
            background: 'transparent',
            border: 'none',
            color: '#94a3b8',
            fontSize: '0.85rem',
            fontWeight: 600,
            cursor: 'pointer',
            padding: '12px 16px'
          }}>
            Batalkan
          </button>
        </div>

      </div>

      <div style={{ marginTop: '20px', color: '#94a3b8', fontSize: '0.75rem', display: 'flex', alignItems: 'center', gap: '6px' }}>
        <Lightbulb size={12} />
        Pemrosesan otomatis menggunakan model machine learning.
      </div>
    </div>
  );
}
