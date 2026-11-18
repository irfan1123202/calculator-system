import React, { useState } from 'react';
import { BookCheck, Play, ArrowRight, CheckCircle2 } from 'lucide-react';

export default function WorkedExamples({ onNavigateToCalculator }) {
  const [activeExample, setActiveExample] = useState('hardy_cross');

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.75rem', maxWidth: '1000px', margin: '0 auto' }}>
      {/* Header Banner */}
      <div className="card" style={{ background: 'linear-gradient(135deg, #0369a1 0%, #0284c7 100%)', color: 'white', padding: '1.75rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
          <span className="badge" style={{ background: 'rgba(255,255,255,0.2)', color: 'white' }}>
            <BookCheck size={13} /> Verified Hand-Worked Problems
          </span>
        </div>
        <h1 style={{ color: 'white', fontSize: '1.85rem' }}>
          Hydraulic Engineering Worked Examples & Hand Solutions
        </h1>
        <p style={{ color: '#e0f2fe', marginTop: '0.5rem', fontSize: '0.95rem' }}>
          Step-by-step hand calculations verified against civil engineering examination standards. Compare manual solutions with WaterFlow’s live computer simulation.
        </p>
      </div>

      {/* Example Selector Tabs */}
      <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
        <button
          type="button"
          className={`btn ${activeExample === 'hardy_cross' ? 'btn-primary' : 'btn-secondary'}`}
          onClick={() => setActiveExample('hardy_cross')}
        >
          Example 1: Hardy Cross Two-Loop Network
        </button>
        <button
          type="button"
          className={`btn ${activeExample === 'series' ? 'btn-primary' : 'btn-secondary'}`}
          onClick={() => setActiveExample('series')}
        >
          Example 2: Equivalent Pipe in Series (Dupuit)
        </button>
        <button
          type="button"
          className={`btn ${activeExample === 'parallel' ? 'btn-primary' : 'btn-secondary'}`}
          onClick={() => setActiveExample('parallel')}
        >
          Example 3: Equivalent Pipe in Parallel
        </button>
      </div>

      {/* ================= EXAMPLE 1: HARDY CROSS ================= */}
      {activeExample === 'hardy_cross' && (
        <div className="card" style={{ padding: '1.5rem' }}>
          <div className="card-header">
            <div>
              <h3>Example 1: Hand-Worked Two-Loop Hardy Cross Network</h3>
              <p style={{ fontSize: '0.85rem', marginTop: '4px' }}>
                Determine the balanced flow rates for a 2-loop 7-pipe water network using Darcy-Weisbach head loss (K = fL / 12.1 D⁵).
              </p>
            </div>
            {onNavigateToCalculator && (
              <button
                type="button"
                className="btn btn-primary btn-sm"
                onClick={() => onNavigateToCalculator('hardy_cross')}
              >
                <Play size={14} fill="white" /> Open in Calculator
              </button>
            )}
          </div>

          <div style={{ marginBottom: '1.25rem' }}>
            <h4 style={{ color: '#0369a1', marginBottom: '0.5rem' }}>Step 1: Check Inflow / Outflow Continuity at All Nodes</h4>
            <p style={{ fontSize: '0.9rem', marginBottom: '0.5rem' }}>
              Inflow at Node A = 100 L/s (0.100 m³/s). Outflows: B = 20 L/s, C = 40 L/s, D = 10 L/s, E = 15 L/s, F = 15 L/s.
            </p>
            <div className="formula-block" style={{ fontSize: '0.85rem' }}>
              Σ Inflows = 100 L/s<br />
              Σ Outflows = 20 + 40 + 10 + 15 + 15 = 100 L/s  (Mass is conserved globally: ΣQ = 0)
            </div>
          </div>

          <div style={{ marginBottom: '1.25rem' }}>
            <h4 style={{ color: '#0369a1', marginBottom: '0.5rem' }}>Step 2: Calculate Resistance Coefficient K for each Pipe</h4>
            <p style={{ fontSize: '0.9rem', marginBottom: '0.5rem' }}>
              Using K = (f · L) / (12.1 · D⁵) with f = 0.02:
            </p>
            <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '8px', padding: '0.75rem 1rem', fontFamily: 'var(--font-mono)', fontSize: '0.85rem' }}>
              • Pipe AB (L=600m, D=0.25m): K = (0.02 × 600) / (12.1 × 0.25⁵) = 12 / 0.011816 = <strong>1,015.54</strong><br />
              • Pipe BC (L=500m, D=0.20m): K = (0.02 × 500) / (12.1 × 0.20⁵) = 10 / 0.003872 = <strong>2,582.64</strong><br />
              • Pipe BE (L=400m, D=0.25m, Shared): K = (0.02 × 400) / (12.1 × 0.25⁵) = 8 / 0.011816 = <strong>677.03</strong>
            </div>
          </div>

          <div style={{ marginBottom: '1.25rem' }}>
            <h4 style={{ color: '#0369a1', marginBottom: '0.5rem' }}>Step 3: Hand Calculation Table (Iteration 1)</h4>
            <div className="table-responsive">
              <table className="eng-table">
                <thead>
                  <tr>
                    <th>Loop</th>
                    <th>Pipe</th>
                    <th className="num-col">K</th>
                    <th className="num-col">Q₀ (m³/s)</th>
                    <th className="num-col">Head Loss h = K Q² (m)</th>
                    <th className="num-col">2 · |h| / |Q|</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td rowSpan="4" style={{ fontWeight: '800', background: '#f0f9ff', color: '#0369a1' }}>Loop I</td>
                    <td>AB (+)</td>
                    <td className="num-col mono-num">1015.54</td>
                    <td className="num-col mono-num">+0.060</td>
                    <td className="num-col mono-num" style={{ color: '#047857' }}>+3.656</td>
                    <td className="num-col mono-num">121.87</td>
                  </tr>
                  <tr>
                    <td>BE (+) (Shared)</td>
                    <td className="num-col mono-num">677.03</td>
                    <td className="num-col mono-num">+0.010</td>
                    <td className="num-col mono-num" style={{ color: '#047857' }}>+0.068</td>
                    <td className="num-col mono-num">13.54</td>
                  </tr>
                  <tr>
                    <td>EF (-)</td>
                    <td className="num-col mono-num">3099.17</td>
                    <td className="num-col mono-num">-0.025</td>
                    <td className="num-col mono-num" style={{ color: '#b91c1c' }}>-1.937</td>
                    <td className="num-col mono-num">154.96</td>
                  </tr>
                  <tr>
                    <td>FA (-)</td>
                    <td className="num-col mono-num">677.03</td>
                    <td className="num-col mono-num">-0.040</td>
                    <td className="num-col mono-num" style={{ color: '#b91c1c' }}>-1.083</td>
                    <td className="num-col mono-num">54.16</td>
                  </tr>
                  <tr style={{ background: '#f8fafc', fontWeight: '800' }}>
                    <td colSpan="4" style={{ textAlign: 'right' }}>Loop I Totals:</td>
                    <td className="num-col mono-num" style={{ color: '#0369a1' }}>Σh₁ = +0.704 m</td>
                    <td className="num-col mono-num">Σ(2h/Q) = 344.53</td>
                  </tr>
                  <tr style={{ background: '#e0f2fe' }}>
                    <td colSpan="6" style={{ fontFamily: 'var(--font-mono)', fontWeight: '700', color: '#0369a1' }}>
                      Loop I Correction: ΔQ₁ = - (+0.704) / 344.53 = -0.00204 m³/s (-2.04 L/s)
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          <div style={{ background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: '8px', padding: '1rem' }}>
            <h4 style={{ color: '#166534', marginBottom: '0.35rem' }}>Step 4: Update Shared Pipe BE</h4>
            <p style={{ fontSize: '0.875rem', color: '#166534' }}>
              For shared pipe BE (clockwise in Loop I, counter-clockwise in Loop II):<br />
              <strong>Q_BE^(new) = Q_BE^(old) + ΔQ₁ - ΔQ₂</strong><br />
              With ΔQ₁ = -0.00204 m³/s and ΔQ₂ = -0.00185 m³/s:<br />
              Q_BE^(new) = 0.010 + (-0.00204) - (-0.00185) = <strong>0.00981 m³/s (9.81 L/s)</strong>.
            </p>
          </div>
        </div>
      )}

      {/* ================= EXAMPLE 2: SERIES ================= */}
      {activeExample === 'series' && (
        <div className="card" style={{ padding: '1.5rem' }}>
          <div className="card-header">
            <div>
              <h3>Example 2: Equivalent Pipe in Series (Dupuit's Formulation)</h3>
              <p style={{ fontSize: '0.85rem', marginTop: '4px' }}>
                A compound water main consists of 3 pipes connected end-to-end. Find equivalent diameter De for Le = 900 m.
              </p>
            </div>
            {onNavigateToCalculator && (
              <button
                type="button"
                className="btn btn-primary btn-sm"
                onClick={() => onNavigateToCalculator('equivalent')}
              >
                <Play size={14} fill="white" /> Open in Calculator
              </button>
            )}
          </div>

          <div style={{ marginBottom: '1.25rem' }}>
            <h4 style={{ color: '#0369a1', marginBottom: '0.5rem' }}>Pipe Segments Data:</h4>
            <ul style={{ paddingLeft: '1.5rem', fontSize: '0.9rem', lineHeight: '1.6', color: '#334155' }}>
              <li>Pipe 1: L₁ = 400 m, D₁ = 0.30 m (300 mm), f = 0.02</li>
              <li>Pipe 2: L₂ = 200 m, D₂ = 0.20 m (200 mm), f = 0.02</li>
              <li>Pipe 3: L₃ = 300 m, D₃ = 0.25 m (250 mm), f = 0.02</li>
              <li>Total length = 400 + 200 + 300 = 900 m. Target Le = 900 m.</li>
            </ul>
          </div>

          <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '8px', padding: '1rem', fontFamily: 'var(--font-mono)', fontSize: '0.875rem', marginBottom: '1.25rem' }}>
            <div style={{ fontWeight: '700', color: '#0369a1', marginBottom: '0.5rem' }}>Hand Calculation of Terms:</div>
            • Term 1: L₁ / D₁⁵ = 400 / (0.30)⁵ = 400 / 0.00243 = <strong>164,609</strong><br />
            • Term 2: L₂ / D₂⁵ = 200 / (0.20)⁵ = 200 / 0.00032 = <strong>625,000</strong><br />
            • Term 3: L₃ / D₃⁵ = 300 / (0.25)⁵ = 300 / 0.00097656 = <strong>307,200</strong><br />
            <br />
            <strong>Σ (L_i / D_i⁵) = 164,609 + 625,000 + 307,200 = 1,096,809</strong>
          </div>

          <div style={{ background: '#ecfdf5', border: '1px solid #a7f3d0', borderRadius: '8px', padding: '1rem', fontFamily: 'var(--font-mono)' }}>
            <div style={{ color: '#047857', fontWeight: '700', fontSize: '0.95rem' }}>
              Equivalent Diameter Solution:
            </div>
            <div style={{ marginTop: '0.5rem', color: '#065f46' }}>
              D_e = [ L_e / Σ(L_i / D_i⁵) ]^(1/5)<br />
              D_e = [ 900 / 1,096,809 ]^(0.2) = [ 0.00082056 ]^(0.2) = <strong>0.2415 m (241.5 mm)</strong>
            </div>
            <div style={{ marginTop: '0.5rem', fontSize: '0.85rem', color: '#047857' }}>
              ✓ Physical interpretation: A uniform pipe of diameter 241.5 mm and length 900 m produces identical friction loss.
            </div>
          </div>
        </div>
      )}

      {/* ================= EXAMPLE 3: PARALLEL ================= */}
      {activeExample === 'parallel' && (
        <div className="card" style={{ padding: '1.5rem' }}>
          <div className="card-header">
            <div>
              <h3>Example 3: Equivalent Pipe in Parallel</h3>
              <p style={{ fontSize: '0.85rem', marginTop: '4px' }}>
                Two parallel feeder lines connect an upstream reservoir to an industrial estate. Total flow Q_total = 80 L/s (0.08 m³/s).
              </p>
            </div>
            {onNavigateToCalculator && (
              <button
                type="button"
                className="btn btn-primary btn-sm"
                onClick={() => onNavigateToCalculator('equivalent')}
              >
                <Play size={14} fill="white" /> Open in Calculator
              </button>
            )}
          </div>

          <div style={{ marginBottom: '1.25rem' }}>
            <h4 style={{ color: '#0369a1', marginBottom: '0.5rem' }}>Parallel Branches:</h4>
            <ul style={{ paddingLeft: '1.5rem', fontSize: '0.9rem', lineHeight: '1.6', color: '#334155' }}>
              <li>Branch 1: L₁ = 600 m, D₁ = 0.25 m, f₁ = 0.02 ⟹ K₁ = (0.02 × 600) / (12.1 × 0.25⁵) = <strong>1,015.54</strong></li>
              <li>Branch 2: L₂ = 800 m, D₂ = 0.30 m, f₂ = 0.02 ⟹ K₂ = (0.02 × 800) / (12.1 × 0.30⁵) = <strong>544.15</strong></li>
            </ul>
          </div>

          <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '8px', padding: '1rem', fontFamily: 'var(--font-mono)', fontSize: '0.875rem', marginBottom: '1.25rem' }}>
            <div style={{ fontWeight: '700', color: '#0369a1', marginBottom: '0.5rem' }}>Conductance Terms (1 / √K):</div>
            • 1 / √K₁ = 1 / √(1,015.54) = 1 / 31.868 = <strong>0.03138</strong><br />
            • 1 / √K₂ = 1 / √(544.15) = 1 / 23.327 = <strong>0.04287</strong><br />
            <br />
            <strong>Σ (1 / √K) = 0.03138 + 0.04287 = 0.07425</strong>
          </div>

          <div style={{ background: '#ecfdf5', border: '1px solid #a7f3d0', borderRadius: '8px', padding: '1rem', fontFamily: 'var(--font-mono)' }}>
            <div style={{ color: '#047857', fontWeight: '700', fontSize: '0.95rem' }}>
              Flow Apportionment Results:
            </div>
            <div style={{ marginTop: '0.5rem', color: '#065f46' }}>
              • Branch 1 Flow: Q₁ = 0.08 × (0.03138 / 0.07425) = <strong>0.0338 m³/s (33.8 L/s, 42.3%)</strong><br />
              • Branch 2 Flow: Q₂ = 0.08 × (0.04287 / 0.07425) = <strong>0.0462 m³/s (46.2 L/s, 57.7%)</strong><br />
              <br />
              Check Head Loss equality:<br />
              h₁ = 1015.54 × (0.0338)² = <strong>1.160 m</strong><br />
              h₂ = 544.15 × (0.0462)² = <strong>1.161 m</strong>  (Identical within roundoff error!)
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
