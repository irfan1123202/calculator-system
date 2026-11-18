import React from 'react';
import { X, Droplet, CheckCircle, Code, GraduationCap, Cpu } from 'lucide-react';

export default function AboutModal({ isOpen, onClose }) {
  if (!isOpen) return null;

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(15, 23, 42, 0.65)',
      backdropFilter: 'blur(6px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 1000,
      padding: '1.5rem'
    }} onClick={onClose}>
      <div
        className="card"
        style={{
          width: '100%',
          maxWidth: '620px',
          maxHeight: '90vh',
          overflowY: 'auto',
          padding: '2rem',
          position: 'relative',
          background: 'white',
          boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.2), 0 10px 10px -5px rgba(0, 0, 0, 0.1)'
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <button
          type="button"
          onClick={onClose}
          style={{
            position: 'absolute',
            top: '1.25rem',
            right: '1.25rem',
            background: 'none',
            border: 'none',
            color: '#64748b',
            cursor: 'pointer',
            padding: '4px'
          }}
        >
          <X size={20} />
        </button>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem' }}>
          <div style={{
            width: '42px',
            height: '42px',
            borderRadius: '10px',
            background: 'linear-gradient(135deg, #0284c7, #06b6d4)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'white'
          }}>
            <Droplet size={22} fill="currentColor" />
          </div>
          <div>
            <h2 style={{ fontSize: '1.35rem', color: '#0c4a6e' }}>WaterFlow Calculator</h2>
            <div style={{ fontSize: '0.8rem', color: '#0284c7', fontWeight: '700' }}>v1.0.0 • Hydraulic Engineering Suite</div>
          </div>
        </div>

        <p style={{ fontSize: '0.925rem', color: '#334155', lineHeight: '1.6', marginBottom: '1.25rem' }}>
          <strong>WaterFlow</strong> is an educational full-stack web application designed for civil engineering students, professors, and hydraulic practitioners learning water distribution system analysis and pipeline design.
        </p>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem', marginBottom: '1.5rem' }}>
          <div style={{ display: 'flex', gap: '0.75rem', background: '#f8fafc', padding: '0.75rem 1rem', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
            <Cpu size={18} color="#0284c7" style={{ flexShrink: 0, marginTop: '2px' }} />
            <div style={{ fontSize: '0.85rem', color: '#334155' }}>
              <strong>Hardy Cross Looped Solver:</strong> Supports both Darcy-Weisbach and Hazen-Williams equations, signed head losses, safe zero-flow divergence handling, and convergence graphs.
            </div>
          </div>

          <div style={{ display: 'flex', gap: '0.75rem', background: '#f8fafc', padding: '0.75rem 1rem', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
            <GraduationCap size={18} color="#0d9488" style={{ flexShrink: 0, marginTop: '2px' }} />
            <div style={{ fontSize: '0.85rem', color: '#334155' }}>
              <strong>Equivalent Pipe Engine:</strong> Implements Dupuit’s formula for compound series pipelines and conductance summation for parallel pipe branch distribution.
            </div>
          </div>

          <div style={{ display: 'flex', gap: '0.75rem', background: '#f8fafc', padding: '0.75rem 1rem', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
            <Code size={18} color="#6366f1" style={{ flexShrink: 0, marginTop: '2px' }} />
            <div style={{ fontSize: '0.85rem', color: '#334155' }}>
              <strong>Architecture:</strong> 100% Client-Side React 19 + Vite with Chart.js visualization, interactive SVG network diagrams, and RFC 4180 CSV exports.
            </div>
          </div>
        </div>

        <div style={{ borderTop: '1px solid #e2e8f0', paddingTop: '1rem', display: 'flex', justifyContent: 'flex-end' }}>
          <button
            type="button"
            className="btn btn-primary btn-sm"
            onClick={onClose}
          >
            Got It
          </button>
        </div>
      </div>
    </div>
  );
}
