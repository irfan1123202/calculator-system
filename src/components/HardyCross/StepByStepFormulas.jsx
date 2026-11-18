import React from 'react';
import { formatNum } from '../../engine/unitConversions';
import { BookOpen, HelpCircle } from 'lucide-react';
import { EQUATIONS } from '../../engine/hardyCrossSolver';

export default function StepByStepFormulas({ solution, equation = EQUATIONS.DARCY }) {
  if (!solution || !solution.iterations || solution.iterations.length === 0) return null;

  const firstIter = solution.iterations[0];
  const lastIter = solution.iterations[solution.iterations.length - 1];

  return (
    <div className="card" style={{ padding: '1.25rem' }}>
      <div className="card-header">
        <div>
          <h3>Step-by-Step Mathematical Derivation & Substitutions</h3>
          <p style={{ fontSize: '0.825rem', marginTop: '2px' }}>
            Detailed theoretical basis and numerical substitution of network parameters into the Hardy Cross correction formula.
          </p>
        </div>
        <span className="badge badge-info">
          <BookOpen size={13} /> Educational Breakdown
        </span>
      </div>

      {/* Theoretical Formula Box */}
      <div className="formula-block" style={{ marginBottom: '1.5rem' }}>
        <div style={{ color: '#38bdf8', fontWeight: '700', marginBottom: '0.5rem', fontSize: '0.95rem' }}>
          1. General Hardy Cross Correction Equation
        </div>
        <div>
          Applying Taylor's series expansion to head loss around a closed loop:
        </div>
        <div style={{ margin: '0.75rem 0', paddingLeft: '1rem', borderLeft: '2px solid #0284c7' }}>
          h(Q + ΔQ) = h(Q) + ΔQ · (dh/dQ) + O(ΔQ²) ≈ 0
        </div>
        <div>
          Summing over all pipes in Loop k with clockwise positive reference:
        </div>
        <div style={{ margin: '0.75rem 0', paddingLeft: '1rem', borderLeft: '2px solid #0284c7', color: '#67e8f9', fontWeight: '700' }}>
          ΔQ_k = - [ Σ h_i ] / [ Σ (n · K_i · |Q_i|^(n - 1)) ] = - [ Σ h_i ] / [ Σ (n · |h_i| / |Q_i|) ]
        </div>
        <div className="formula-sub">
          Where for Darcy-Weisbach: n = 2.0, h = K·Q², dh/dQ = 2·K·|Q| = 2·|h|/|Q|<br />
          For Hazen-Williams: n = 1.852, h = K·Q^1.852, dh/dQ = 1.852·K·|Q|^0.852
        </div>
      </div>

      {/* Numerical Substitutions for Iteration 1 */}
      <div style={{ marginBottom: '1.5rem' }}>
        <h4 style={{ color: '#0369a1', marginBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          2. Numerical Substitution: Iteration 1
        </h4>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {firstIter.loopDetails.map((loop) => (
            <div key={`step-loop-${loop.loopIndex}`} style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '8px', padding: '1rem' }}>
              <div style={{ fontWeight: '700', color: '#0f172a', marginBottom: '0.5rem' }}>
                {loop.loopLabel}:
              </div>

              {/* Head loss sum */}
              <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.85rem', marginBottom: '0.5rem' }}>
                <span style={{ color: '#64748b' }}>Σh = </span>
                {loop.pipesInLoop.map((p, idx) => (
                  <span key={`h-term-${idx}`}>
                    {idx > 0 && (p.h_loop >= 0 ? ' + ' : ' - ')}
                    {idx === 0 && p.h_loop < 0 ? '-' : ''}
                    ({formatNum(Math.abs(p.h_loop), 4)} m [{p.pipeId}])
                  </span>
                ))}
                <span style={{ fontWeight: '800', color: '#0369a1' }}> = {formatNum(loop.sumH, 4)} m</span>
              </div>

              {/* Derivative sum */}
              <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.85rem', marginBottom: '0.5rem' }}>
                <span style={{ color: '#64748b' }}>Σ(n·h/Q) = </span>
                {loop.pipesInLoop.map((p, idx) => (
                  <span key={`deriv-term-${idx}`}>
                    {idx > 0 ? ' + ' : ''}
                    {formatNum(p.deriv, 4)} [{p.pipeId}]
                  </span>
                ))}
                <span style={{ fontWeight: '800', color: '#0369a1' }}> = {formatNum(loop.sumDeriv, 4)}</span>
              </div>

              {/* Delta Q calculation */}
              <div style={{
                fontFamily: 'var(--font-mono)',
                fontSize: '0.9rem',
                fontWeight: '700',
                color: '#0284c7',
                background: '#e0f2fe',
                padding: '0.5rem 0.75rem',
                borderRadius: '6px',
                marginTop: '0.5rem'
              }}>
                ΔQ_{loop.loopIndex + 1} = - ({formatNum(loop.sumH, 4)}) / ({formatNum(loop.sumDeriv, 4)}) = {formatNum(loop.deltaQ, 6)} m³/s ({(loop.deltaQ * 1000).toFixed(3)} L/s)
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Common Branch Correction Rule */}
      <div style={{ background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: '8px', padding: '1rem' }}>
        <h4 style={{ color: '#166534', marginBottom: '0.5rem' }}>
          3. Shared (Common) Branch Correction Rule
        </h4>
        <p style={{ fontSize: '0.85rem', color: '#166534', lineHeight: '1.6' }}>
          When a pipe is common to two adjacent loops (e.g. Loop 1 and Loop 2), its flow is affected by both loop corrections.
          If the pipe is oriented <strong>clockwise (+1)</strong> in Loop 1 and <strong>counter-clockwise (-1)</strong> in Loop 2:
        </p>
        <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.9rem', fontWeight: '700', color: '#15803d', margin: '0.5rem 0' }}>
          Q_common^(new) = Q_common^(old) + ΔQ₁ · (+1) + ΔQ₂ · (-1) = Q_common^(old) + ΔQ₁ - ΔQ₂
        </div>
        <p style={{ fontSize: '0.85rem', color: '#166534' }}>
          This simultaneously satisfies continuity at adjacent junctions and drives the net energy residual around both loops toward zero.
        </p>
      </div>
    </div>
  );
}
