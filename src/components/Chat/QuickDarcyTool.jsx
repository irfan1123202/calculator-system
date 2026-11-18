import React, { useState } from 'react';
import { calculateDarcyHeadLoss } from '../../engine/aiChatEngine';
import { Play, RotateCcw, Check, Sparkles } from 'lucide-react';

export default function QuickDarcyTool({ initialLength = 500, initialDiameter = 200, initialFlow = 40, initialF = 0.02, onInsertText }) {
  const [length, setLength] = useState(initialLength);
  const [diameterMm, setDiameterMm] = useState(initialDiameter);
  const [flowLps, setFlowLps] = useState(initialFlow);
  const [f, setF] = useState(initialF);

  let result = null;
  let error = null;

  try {
    const D_m = parseFloat(diameterMm) / 1000;
    const Q_m3s = parseFloat(flowLps) / 1000;
    result = calculateDarcyHeadLoss({
      length: parseFloat(length),
      diameter: D_m,
      discharge: Q_m3s,
      frictionFactor: parseFloat(f)
    });
  } catch (err) {
    error = err.message;
  }

  const handleInsert = () => {
    if (result && onInsertText) {
      const summary = `Calculated Darcy-Weisbach: L=${length}m, D=${diameterMm}mm, Q=${flowLps}L/s, f=${f} ➔ Head Loss = ${result.hf.toFixed(3)}m, Velocity = ${result.velocity.toFixed(2)}m/s (${result.flowRegime})`;
      onInsertText(summary);
    }
  };

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
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.6rem' }}>
        <span style={{ fontSize: '0.82rem', fontWeight: '700', color: '#0369a1', display: 'flex', alignItems: 'center', gap: '4px' }}>
          <Sparkles size={14} /> Quick Darcy-Weisbach Interactive Calculator
        </span>
        <button
          type="button"
          onClick={() => {
            setLength(500);
            setDiameterMm(200);
            setFlowLps(40);
            setF(0.02);
          }}
          title="Reset"
          style={{ background: 'none', border: 'none', color: '#64748b', cursor: 'pointer', padding: '2px' }}
        >
          <RotateCcw size={13} />
        </button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '0.5rem', marginBottom: '0.6rem' }}>
        <div>
          <label style={{ fontSize: '0.72rem', color: '#475569', fontWeight: '600', display: 'block', marginBottom: '2px' }}>
            Length L (m)
          </label>
          <input
            type="number"
            value={length}
            onChange={(e) => setLength(e.target.value)}
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

        <div>
          <label style={{ fontSize: '0.72rem', color: '#475569', fontWeight: '600', display: 'block', marginBottom: '2px' }}>
            Discharge Q (L/s)
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
            Friction factor f
          </label>
          <input
            type="number"
            step="0.005"
            value={f}
            onChange={(e) => setF(e.target.value)}
            style={{ width: '100%', padding: '4px 6px', fontSize: '0.8rem', borderRadius: '4px', border: '1px solid #cbd5e1' }}
          />
        </div>
      </div>

      {error ? (
        <div style={{ color: '#ef4444', fontSize: '0.75rem' }}>⚠️ {error}</div>
      ) : result ? (
        <div style={{ background: '#f0f9ff', border: '1px solid #bae6fd', borderRadius: '6px', padding: '0.5rem 0.65rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
            <span style={{ fontSize: '0.78rem', color: '#0369a1', fontWeight: '600' }}>Head Loss (hf):</span>
            <span style={{ fontSize: '0.95rem', fontWeight: '800', color: '#0284c7' }}>
              {result.hf.toFixed(3)} m
            </span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.75rem', color: '#475569' }}>
            <span>Velocity (v):</span>
            <span style={{ fontWeight: '600' }}>
              {result.velocity.toFixed(2)} m/s ({result.flowRegime})
            </span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.75rem', color: '#64748b', marginTop: '2px' }}>
            <span>Pressure Drop:</span>
            <span>{(result.hf * 9.807).toFixed(1)} kPa ({(result.hf * 0.09807).toFixed(2)} bar)</span>
          </div>
        </div>
      ) : null}

      {onInsertText && result && (
        <button
          type="button"
          onClick={handleInsert}
          style={{
            marginTop: '0.5rem',
            width: '100%',
            padding: '4px 8px',
            fontSize: '0.75rem',
            background: '#e0f2fe',
            color: '#0369a1',
            border: '1px solid #bae6fd',
            borderRadius: '4px',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '4px'
          }}
        >
          <Play size={11} /> Share in chat
        </button>
      )}
    </div>
  );
}
