import React, { useState } from 'react';
import { calculateVelocityAndReynolds } from '../../engine/aiChatEngine';
import { Activity, Play } from 'lucide-react';

export default function QuickVelocityTool({ onInsertText }) {
  const [flowLps, setFlowLps] = useState(30);
  const [diameterMm, setDiameterMm] = useState(150);

  let result = null;
  let error = null;

  try {
    const D_m = parseFloat(diameterMm) / 1000;
    const Q_m3s = parseFloat(flowLps) / 1000;
    result = calculateVelocityAndReynolds({ discharge: Q_m3s, diameter: D_m });
  } catch (err) {
    error = err.message;
  }

  return (
    <div
      style={{
        marginTop: '0.75rem',
        padding: '0.85rem',
        background: '#f8fafc',
        borderRadius: '8px',
        border: '1px solid #cbd5e1'
      }}
    >
      <div style={{ fontSize: '0.82rem', fontWeight: '700', color: '#0369a1', marginBottom: '0.6rem', display: 'flex', alignItems: 'center', gap: '4px' }}>
        <Activity size={14} /> Quick Velocity & Reynolds Calculator
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem', marginBottom: '0.6rem' }}>
        <div>
          <label style={{ fontSize: '0.72rem', color: '#475569', fontWeight: '600', display: 'block', marginBottom: '2px' }}>
            Flow Q (L/s)
          </label>
          <input
            type="number"
            value={flowLps}
            onChange={(e) => setFlowLps(e.target.value)}
            style={{ width: '100%', padding: '4px 6px', fontSize: '0.8rem', borderRadius: '4px', border: '1px solid #cbd5e1' }}
          />
        </div>
        <div>
          <label style={{ fontSize: '0.72rem', color: '#475569', fontWeight: '600', display: 'block', marginBottom: '2px' }}>
            Diameter D (mm)
          </label>
          <input
            type="number"
            value={diameterMm}
            onChange={(e) => setDiameterMm(e.target.value)}
            style={{ width: '100%', padding: '4px 6px', fontSize: '0.8rem', borderRadius: '4px', border: '1px solid #cbd5e1' }}
          />
        </div>
      </div>

      {error ? (
        <div style={{ color: '#ef4444', fontSize: '0.75rem' }}>⚠️ {error}</div>
      ) : result ? (
        <div style={{ background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: '6px', padding: '0.5rem 0.65rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '0.78rem', color: '#166534', fontWeight: '600' }}>Velocity (v):</span>
            <span style={{ fontSize: '0.95rem', fontWeight: '800', color: '#15803d' }}>
              {result.velocity.toFixed(3)} m/s
            </span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.75rem', color: '#475569', marginTop: '2px' }}>
            <span>Flow Area (A):</span>
            <span>{result.area.toFixed(4)} m²</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.75rem', color: '#475569', marginTop: '2px' }}>
            <span>Reynolds (Re):</span>
            <span style={{ fontWeight: '600' }}>{Math.round(result.reynolds).toLocaleString()} ({result.flowRegime})</span>
          </div>
        </div>
      ) : null}
    </div>
  );
}
