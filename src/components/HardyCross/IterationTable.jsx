import React, { useState } from 'react';
import { formatNum, formatFlow } from '../../engine/unitConversions';
import { Download, ChevronRight, CheckCircle2 } from 'lucide-react';
import { exportHardyCrossIterationsCSV } from '../../engine/csvExport';

export default function IterationTable({ iterations = [], displayUnit = 'l_s' }) {
  const [selectedIterIdx, setSelectedIterIdx] = useState(0); // 0 = Iteration 1

  if (!iterations || iterations.length === 0) {
    return (
      <div className="card" style={{ textAlign: 'center', padding: '2rem', color: '#64748b' }}>
        Click <strong>"Solve Hardy Cross"</strong> or <strong>"Next Iteration"</strong> to generate step-by-step calculation tables.
      </div>
    );
  }

  const currentIter = iterations[selectedIterIdx] || iterations[0];

  return (
    <div className="card" style={{ padding: '1.25rem' }}>
      <div className="card-header">
        <div>
          <h3>Step-by-Step Hardy Cross Iteration Tables</h3>
          <p style={{ fontSize: '0.825rem', marginTop: '2px' }}>
            Detailed breakdown of algebraic head losses (Σh), derivatives Σ(n·h/Q), and flow corrections (ΔQ) per loop.
          </p>
        </div>
        <button
          type="button"
          className="btn btn-secondary btn-sm"
          onClick={() => exportHardyCrossIterationsCSV(iterations)}
        >
          <Download size={14} /> Export Iterations CSV
        </button>
      </div>

      {/* Iteration Selector Pill Tabs */}
      <div style={{ display: 'flex', gap: '0.5rem', overflowX: 'auto', paddingBottom: '0.75rem', marginBottom: '1rem' }}>
        {iterations.map((iter, idx) => {
          const isSelected = selectedIterIdx === idx;
          const isLast = idx === iterations.length - 1;
          return (
            <button
              key={`iter-tab-${idx}`}
              type="button"
              className={`btn btn-sm ${isSelected ? 'btn-primary' : 'btn-secondary'}`}
              style={{ padding: '0.4rem 0.85rem' }}
              onClick={() => setSelectedIterIdx(idx)}
            >
              Iteration {iter.iterationNumber}
              {isLast && (
                <span style={{ fontSize: '0.65rem', background: isSelected ? 'rgba(255,255,255,0.3)' : '#e2e8f0', padding: '1px 5px', borderRadius: '4px', marginLeft: '4px' }}>
                  Latest
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Iteration Metrics Banner */}
      <div style={{
        display: 'flex',
        flexWrap: 'wrap',
        gap: '1.5rem',
        background: '#f8fafc',
        border: '1px solid #e2e8f0',
        borderRadius: '8px',
        padding: '0.85rem 1.25rem',
        marginBottom: '1.25rem'
      }}>
        <div>
          <span style={{ fontSize: '0.75rem', color: '#64748b', textTransform: 'uppercase', fontWeight: '600' }}>Iteration</span>
          <div style={{ fontSize: '1.1rem', fontWeight: '800', color: '#0369a1' }}>#{currentIter.iterationNumber}</div>
        </div>
        <div>
          <span style={{ fontSize: '0.75rem', color: '#64748b', textTransform: 'uppercase', fontWeight: '600' }}>Max Head Residual</span>
          <div style={{ fontSize: '1.1rem', fontWeight: '800', color: currentIter.maxResidualHead < 0.001 ? '#059669' : '#0f172a' }}>
            {formatNum(currentIter.maxResidualHead, 5)} m
          </div>
        </div>
        <div>
          <span style={{ fontSize: '0.75rem', color: '#64748b', textTransform: 'uppercase', fontWeight: '600' }}>Max Loop ΔQ</span>
          <div style={{ fontSize: '1.1rem', fontWeight: '800', color: currentIter.maxDeltaQ < 0.0001 ? '#059669' : '#0f172a' }}>
            {displayUnit === 'l_s' ? (currentIter.maxDeltaQ * 1000).toFixed(4) + ' L/s' : formatNum(currentIter.maxDeltaQ, 6) + ' m³/s'}
          </div>
        </div>
      </div>

      {/* Tables for Each Loop */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
        {currentIter.loopDetails.map((loop) => {
          return (
            <div key={`loop-table-${loop.loopIndex}`} style={{ border: '1px solid #e2e8f0', borderRadius: '8px', overflow: 'hidden' }}>
              <div style={{
                background: '#f0f9ff',
                padding: '0.65rem 1rem',
                borderBottom: '1px solid #bae6fd',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center'
              }}>
                <span style={{ fontWeight: '800', color: '#0369a1', fontSize: '0.95rem' }}>
                  {loop.loopLabel} Calculations
                </span>
                <span className="badge badge-info">
                  ΔQ = {formatNum(loop.deltaQ, 6)} m³/s ({formatNum(loop.deltaQ * 1000, 3)} L/s)
                </span>
              </div>

              <div className="table-responsive" style={{ border: 'none', borderRadius: 0 }}>
                <table className="eng-table">
                  <thead>
                    <tr>
                      <th>Pipe</th>
                      <th style={{ textAlign: 'center' }}>Dir in Loop</th>
                      <th className="num-col">K</th>
                      <th className="num-col">Flow Q ({displayUnit === 'l_s' ? 'L/s' : 'm³/s'})</th>
                      <th className="num-col">Loop Head Loss h (m)</th>
                      <th className="num-col">n · |h| / |Q|</th>
                    </tr>
                  </thead>
                  <tbody>
                    {loop.pipesInLoop.map((p, pIdx) => {
                      const displayQ = displayUnit === 'l_s' ? (p.Q_loop * 1000).toFixed(3) : p.Q_loop.toFixed(5);
                      return (
                        <tr key={`loop-pipe-${p.pipeId}-${pIdx}`}>
                          <td style={{ fontWeight: '700', color: '#0369a1' }}>{p.pipeId}</td>
                          <td style={{ textAlign: 'center' }}>
                            <span style={{
                              fontWeight: '700',
                              color: p.direction === 1 ? '#059669' : '#dc2626',
                              background: p.direction === 1 ? '#ecfdf5' : '#fef2f2',
                              padding: '2px 8px',
                              borderRadius: '4px',
                              fontSize: '0.8rem'
                            }}>
                              {p.direction === 1 ? '+1 (Clockwise)' : '-1 (Anti-Clockwise)'}
                            </span>
                          </td>
                          <td className="num-col mono-num">{formatNum(p.K, 4)}</td>
                          <td className="num-col mono-num" style={{ fontWeight: '600' }}>{displayQ}</td>
                          <td className="num-col mono-num" style={{ color: p.h_loop >= 0 ? '#047857' : '#b91c1c' }}>
                            {p.h_loop >= 0 ? `+${formatNum(p.h_loop, 4)}` : formatNum(p.h_loop, 4)}
                          </td>
                          <td className="num-col mono-num">{formatNum(p.deriv, 4)}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                  <tfoot>
                    <tr>
                      <td colSpan="4" style={{ textAlign: 'right', fontWeight: '800', color: '#0f172a' }}>
                        Algebraic Sums around {loop.loopLabel}:
                      </td>
                      <td className="num-col mono-num" style={{ fontWeight: '800', color: Math.abs(loop.sumH) < 0.001 ? '#059669' : '#0369a1' }}>
                        Σh = {formatNum(loop.sumH, 4)} m
                      </td>
                      <td className="num-col mono-num" style={{ fontWeight: '800', color: '#0369a1' }}>
                        Σ(n·h/Q) = {formatNum(loop.sumDeriv, 4)}
                      </td>
                    </tr>
                    <tr style={{ background: '#f8fafc' }}>
                      <td colSpan="6" style={{ padding: '0.75rem 1rem' }}>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.5rem' }}>
                          <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.85rem' }}>
                            <strong>Correction Formula:</strong> ΔQ = - (Σh) / [Σ(n·h/Q)] = - ({formatNum(loop.sumH, 4)}) / ({formatNum(loop.sumDeriv, 4)})
                          </div>
                          <div style={{ fontFamily: 'var(--font-mono)', fontWeight: '800', color: '#0284c7' }}>
                            = {formatNum(loop.deltaQ, 6)} m³/s ({formatNum(loop.deltaQ * 1000, 3)} L/s)
                          </div>
                        </div>
                      </td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
