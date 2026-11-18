import React, { useState } from 'react';
import { ArrowRightLeft } from 'lucide-react';

export default function QuickUnitTool() {
  const [val, setVal] = useState(50);
  const [conversionType, setConversionType] = useState('flow'); // 'flow' | 'diameter' | 'pressure'

  let outputText = '';

  const num = parseFloat(val) || 0;

  if (conversionType === 'flow') {
    const inM3s = num / 1000;
    const inM3h = inM3s * 3600;
    outputText = `${num} L/s = ${inM3s.toFixed(5)} m³/s = ${inM3h.toFixed(2)} m³/h`;
  } else if (conversionType === 'diameter') {
    const inM = num / 1000;
    const inInches = inM / 0.0254;
    outputText = `${num} mm = ${inM.toFixed(4)} m = ${inInches.toFixed(2)} inches`;
  } else if (conversionType === 'pressure') {
    const inKpa = num * 9.807;
    const inBar = num * 0.09807;
    outputText = `${num} m water head = ${inKpa.toFixed(2)} kPa = ${inBar.toFixed(3)} bar`;
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
        <ArrowRightLeft size={14} /> Quick Hydraulic Unit Converter
      </div>

      <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.6rem' }}>
        <button
          type="button"
          onClick={() => { setConversionType('flow'); setVal(50); }}
          style={{
            flex: 1,
            padding: '4px',
            fontSize: '0.72rem',
            borderRadius: '4px',
            border: '1px solid',
            borderColor: conversionType === 'flow' ? '#0284c7' : '#cbd5e1',
            background: conversionType === 'flow' ? '#e0f2fe' : '#ffffff',
            color: conversionType === 'flow' ? '#0369a1' : '#475569',
            cursor: 'pointer',
            fontWeight: '600'
          }}
        >
          Flow (L/s)
        </button>
        <button
          type="button"
          onClick={() => { setConversionType('diameter'); setVal(200); }}
          style={{
            flex: 1,
            padding: '4px',
            fontSize: '0.72rem',
            borderRadius: '4px',
            border: '1px solid',
            borderColor: conversionType === 'diameter' ? '#0284c7' : '#cbd5e1',
            background: conversionType === 'diameter' ? '#e0f2fe' : '#ffffff',
            color: conversionType === 'diameter' ? '#0369a1' : '#475569',
            cursor: 'pointer',
            fontWeight: '600'
          }}
        >
          Diameter (mm)
        </button>
        <button
          type="button"
          onClick={() => { setConversionType('pressure'); setVal(10); }}
          style={{
            flex: 1,
            padding: '4px',
            fontSize: '0.72rem',
            borderRadius: '4px',
            border: '1px solid',
            borderColor: conversionType === 'pressure' ? '#0284c7' : '#cbd5e1',
            background: conversionType === 'pressure' ? '#e0f2fe' : '#ffffff',
            color: conversionType === 'pressure' ? '#0369a1' : '#475569',
            cursor: 'pointer',
            fontWeight: '600'
          }}
        >
          Head (m)
        </button>
      </div>

      <div style={{ marginBottom: '0.5rem' }}>
        <input
          type="number"
          value={val}
          onChange={(e) => setVal(e.target.value)}
          placeholder="Enter value"
          style={{ width: '100%', padding: '4px 6px', fontSize: '0.8rem', borderRadius: '4px', border: '1px solid #cbd5e1' }}
        />
      </div>

      <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '6px', padding: '0.5rem 0.65rem', fontSize: '0.82rem', color: '#0f172a', fontWeight: '600' }}>
        {outputText}
      </div>
    </div>
  );
}
