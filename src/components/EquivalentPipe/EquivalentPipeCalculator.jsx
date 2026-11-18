import React, { useState } from 'react';
import SeriesCalculator from './SeriesCalculator';
import ParallelCalculator from './ParallelCalculator';
import { GitCommit, GitFork, Info } from 'lucide-react';

export default function EquivalentPipeCalculator({ displayUnit = 'l_s' }) {
  const [mode, setMode] = useState('series'); // 'series' | 'parallel'

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      {/* Header and Mode Switcher */}
      <div className="card" style={{ padding: '1.25rem', background: 'linear-gradient(135deg, #f0f9ff 0%, #ffffff 100%)', border: '1px solid #bae6fd' }}>
        <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: '1rem' }}>
          <div>
            <h2 style={{ color: '#0369a1', fontSize: '1.5rem' }}>Equivalent Pipe Method Calculator</h2>
            <p style={{ fontSize: '0.875rem', marginTop: '4px' }}>
              Replace complex compound series pipelines or multi-branch parallel manifolds with a single hydraulically equivalent pipe.
            </p>
          </div>

          {/* Mode Pill Toggle */}
          <div style={{ display: 'flex', background: '#e2e8f0', padding: '4px', borderRadius: '10px' }}>
            <button
              type="button"
              className={`btn btn-sm ${mode === 'series' ? 'btn-primary' : ''}`}
              style={{
                background: mode === 'series' ? undefined : 'transparent',
                color: mode === 'series' ? undefined : '#475569',
                boxShadow: mode === 'series' ? undefined : 'none'
              }}
              onClick={() => setMode('series')}
            >
              <GitCommit size={15} /> Pipes in Series
            </button>
            <button
              type="button"
              className={`btn btn-sm ${mode === 'parallel' ? 'btn-primary' : ''}`}
              style={{
                background: mode === 'parallel' ? undefined : 'transparent',
                color: mode === 'parallel' ? undefined : '#475569',
                boxShadow: mode === 'parallel' ? undefined : 'none'
              }}
              onClick={() => setMode('parallel')}
            >
              <GitFork size={15} /> Pipes in Parallel
            </button>
          </div>
        </div>
      </div>

      {/* Render Selected Calculator */}
      {mode === 'series' ? (
        <SeriesCalculator displayUnit={displayUnit} />
      ) : (
        <ParallelCalculator displayUnit={displayUnit} />
      )}
    </div>
  );
}
