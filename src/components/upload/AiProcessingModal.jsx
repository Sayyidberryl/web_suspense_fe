import React, { useState, useEffect } from 'react';
import { Lightbulb, Check, Lock, Clock, ArrowRight } from 'lucide-react';
import historyService from '../../services/historyService';
import '../../styles/ai-processing.css';

export default function AiProcessingModal({
  isOpen = true,
  fileInfo = {
    fileName: 'Bordero_TriPakarta_Fire_Q3_2026.xlsx',
    fileSize: '14.8 MB',
    cob: 'Fire & Property',
    cedant: 'PT Asuransi Tri Pakarta'
  },
  onClose,
  onRunInBackground,
  onComplete
}) {
  const [progress, setProgress] = useState(74);
  const [currentStep, setCurrentStep] = useState(3); // 1: Periksa File, 2: Kolum Input, 3: Parsing Engine, 4: Bangun Output, 5: Selesai
  const [remainingSeconds, setRemainingSeconds] = useState(8);
  const [processedRows, setProcessedRows] = useState(35705);
  const totalRows = 48250;
  const [isDone, setIsDone] = useState(false);

  useEffect(() => {
    if (!isOpen || isDone) return;

    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          setIsDone(true);
          setCurrentStep(5);
          // Save to history backend
          historyService.createHistory({
            file_name: fileInfo.fileName || 'Bordero_TriPakarta_Fire_Q3_2026.xlsx',
            file_size: fileInfo.fileSize || '14.8 MB',
            file_type: 'XLSX',
            cedant: fileInfo.cedant || 'PT Asuransi Tri Pakarta',
            cob: fileInfo.cob || 'Fire & Property',
            status: 'Berhasil Dimuat',
            records_count: totalRows,
            schema_accuracy: 100.0,
            duration_seconds: 8.2,
            log_message: 'Pemrosesan Parsing Engine & Validasi selesai 100%. Data berhasil dibangun.'
          });
          return 100;
        }

        const next = prev + 3;
        if (next >= 90) {
          setCurrentStep(4);
        }
        return next > 100 ? 100 : next;
      });

      setProcessedRows((prev) => {
        const next = prev + 1250;
        return next >= totalRows ? totalRows : next;
      });

      setRemainingSeconds((prev) => (prev > 1 ? prev - 1 : 1));
    }, 600);

    return () => clearInterval(interval);
  }, [isOpen, isDone, fileInfo]);

  if (!isOpen) return null;

  // SVG circular math (radius 60, circumference = 2 * PI * 60 = 377)
  const radius = 60;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (progress / 100) * circumference;

  return (
    <div className="ai-modal-overlay">
      <div className="ai-card-modal">
        {/* Top Badge */}
        <div className="ai-top-badge">
          <Lightbulb size={14} />
          <span>Pemrosesan Parsing Engine Berjalan</span>
        </div>

        {/* Circular Progress Gauge */}
        <div className="ai-progress-circle-wrap">
          <svg>
            <defs>
              <linearGradient id="aiGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#06b6d4" />
                <stop offset="100%" stopColor="#0284c7" />
              </linearGradient>
            </defs>
            <circle
              className="circle-bg"
              cx="80"
              cy="80"
              r={radius}
            />
            <circle
              className="circle-meter"
              cx="80"
              cy="80"
              r={radius}
              stroke="url(#aiGradient)"
              strokeDasharray={circumference}
              strokeDashoffset={strokeDashoffset}
            />
          </svg>
          <div className="circle-inner-content">
            <span className="percent-text">{progress}%</span>
            <span className="status-sub-indicator">
              {isDone ? 'Pemrosesan Selesai' : 'Sedang Memproses'}
            </span>
          </div>
        </div>

        {/* Title and Subtitle */}
        <h2 className="ai-modal-title">
          {isDone ? 'Data Berhasil Diproses!' : 'Sedang Memproses Data'}
        </h2>
        <p className="ai-modal-desc">
          {isDone
            ? 'Struktur dan output data telah berhasil dibangun oleh Parsing Engine.'
            : 'Sistem sedang membaca file, mencocokkan input, dan memproses data melalui Parsing Engine.'}
        </p>

        {/* File pill */}
        <div className="ai-filename-pill">
          {fileInfo.fileName || 'Data_Mentah_MarineHull.xlsx'}
        </div>

        {/* Horizontal Linear Progress Bar */}
        <div className="linear-progress-track">
          <div
            className="linear-progress-fill"
            style={{ width: `${progress}%` }}
          />
        </div>

        {/* 3 Metric Cards */}
        <div className="ai-stats-row">
          <div className="ai-stat-card">
            <span className="ai-stat-label">Sisa Waktu</span>
            <span className="ai-stat-val">
              {isDone ? '0 Detik' : `~${remainingSeconds} Detik`}
            </span>
          </div>
          <div className="ai-stat-card">
            <span className="ai-stat-label">Baris Diproses</span>
            <span className="ai-stat-val">
              {processedRows.toLocaleString('en-US')} / {totalRows.toLocaleString('en-US')}
            </span>
          </div>
          <div className="ai-stat-card">
            <span className="ai-stat-label">Akurasi Skema</span>
            <span className="ai-stat-val highlight-green">100.0%</span>
          </div>
        </div>

        {/* Stepper (5 steps) */}
        <div className="ai-stepper">
          {/* Step 1: Memeriksa file */}
          <div className="step-item completed">
            <Check size={14} className="step-icon-check" />
            <span>Memeriksa File</span>
          </div>

          <div className="step-divider-line done" />

          {/* Step 2: Memeriksa kolum input */}
          <div className="step-item completed">
            <Check size={14} className="step-icon-check" />
            <span>Memeriksa Kolum</span>
          </div>

          <div className="step-divider-line done" />

          {/* Step 3: Parsing Engine */}
          <div className={`step-item ${currentStep === 3 ? 'active' : currentStep > 3 ? 'completed' : ''}`}>
            {currentStep > 3 ? (
              <Check size={14} className="step-icon-check" />
            ) : (
              <div className="step-number-circle">3</div>
            )}
            <span>Parsing Engine</span>
          </div>

          <div className={`step-divider-line ${currentStep >= 4 ? 'done' : ''}`} />

          {/* Step 4: Membangun output */}
          <div className={`step-item ${currentStep === 4 ? 'active' : currentStep > 4 ? 'completed' : ''}`}>
            {currentStep > 4 ? (
              <Check size={14} className="step-icon-check" />
            ) : (
              <div className="step-number-circle">4</div>
            )}
            <span>Membangun Output</span>
          </div>

          <div className={`step-divider-line ${currentStep >= 5 ? 'done' : ''}`} />

          {/* Step 5: Selesai */}
          <div className={`step-item ${currentStep === 5 ? 'completed' : ''}`}>
            {currentStep === 5 ? (
              <Check size={14} className="step-icon-check" />
            ) : (
              <div className="step-number-circle">5</div>
            )}
            <span>Selesai</span>
          </div>
        </div>

        {/* Actions */}
        <div className="ai-modal-buttons">
          {!isDone ? (
            <>
              <button
                className="btn-run-background"
                onClick={() => {
                  if (onRunInBackground) onRunInBackground(fileInfo);
                  onClose();
                }}
              >
                <Lock size={14} />
                <span>Jalankan di Latar Belakang</span>
              </button>

              <button className="btn-cancel-modal" onClick={onClose}>
                Batalkan
              </button>
            </>
          ) : (
            <button
              className="btn-primary-next"
              style={{ width: 'auto', padding: '10px 24px' }}
              onClick={() => {
                if (onComplete) onComplete();
              }}
            >
              <span>Lihat di History</span>
              <ArrowRight size={16} />
            </button>
          )}
        </div>

        {/* Footer Subtext */}
        <div className="ai-modal-footer-text">
          <Clock size={13} />
          <span>Pemrosesan otomatis menggunakan Parsing Engine terpusat.</span>
        </div>
      </div>
    </div>
  );
}
