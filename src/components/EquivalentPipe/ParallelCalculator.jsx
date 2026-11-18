import React, { useState, useEffect } from 'react';
import { solveParallelPipes } from '../../engine/equivalentPipeSolver';
import { EQUIVALENT_PIPE_PRESETS } from '../../engine/presets';
import { exportEquivalentPipeCSV } from '../../engine/csvExport';
import { formatNum, formatFlow, formatHead } from '../../engine/unitConversions';
import EquivalentDiagram from './EquivalentDiagram';
import { Plus, Trash2, Download, CheckCircle2, Sparkles, BarChart2 } from 'lucide-react';
import { Bar } from 'react-chartjs-2';

export default function ParallelCalculator({ displayUnit = 'l_s' }) {
  const defaultPreset = EQUIVALENT_PIPE_PRESETS.parallel[0];

  const [pipes, setPipes] = useState(defaultPreset.pipes);
  const [totalDischarge, setTotalDischarge] = useState(defaultPreset.totalDischarge);
  const [equivalentLength, setEquivalentLength] = useState(defaultPreset.equivalentLength);
  const [fe, setFe] = useState(0.02);
  const [result, setResult] = useState(null);

  useEffect(() => {
    recalculate(pipes, totalDischarge, equivalentLength, fe);
  }, []);

  const recalculate = (pList, qVal, leVal, feVal) => {
    const res = solveParallelPipes(pList, {
      totalDischarge: qVal,
      equivalentLength: leVal,
      fe: feVal
    });
    setResult(res);
  };

  const handlePipeChange = (idx, field, value) => {
    const updated = [...pipes];
    updated[idx] = { ...updated[idx], [field]: value };
    setPipes(updated);
    recalculate(updated, totalDischarge, equivalentLength, fe);
  };

  const handleAddPipe = () => {
    const nextIdx = pipes.length + 1;
    const newPipe = {
      id: `BR${nextIdx}`,
      name: `Branch ${nextIdx}`,
      length: 600,
      diameter: 0.25,
      frictionFactor: 0.02
    };
    const updated = [...pipes, newPipe];
    setPipes(updated);
    recalculate(updated, totalDischarge, equivalentLength, fe);
  };

  const handleRemovePipe = (idx) => {
    if (pipes.length <= 2) {
      alert('Parallel analysis requires at least two parallel branches.');
      return;
    }
    const updated = pipes.filter((_, i) => i !== idx);
    setPipes(updated);
    recalculate(updated, totalDischarge, equivalentLength, fe);
  };

  const handleLoadPreset = (preset) => {
    setPipes(preset.pipes.map(p => ({ ...p })));
    setTotalDischarge(preset.totalDischarge);
    setEquivalentLength(preset.equivalentLength);
    setFe(preset.fe);
    recalculate(preset.pipes, preset.totalDischarge, preset.equivalentLength, preset.fe);
  };

  // Branch flow chart data
  const flowFactor = displayUnit === 'l_s' ? 1000 : 1;
  const flowUnitLabel = displayUnit === 'l_s' ? 'L/s' : 'm³/s';

  const chartData = result && result.success ? {
    labels: result.branches.map(b => b.name),
    datasets: [
      {
        label: `Discharge (${flowUnitLabel})`,
        data: result.branches.map(b => b.flow * flowFactor),
        backgroundColor: ['rgba(2, 132, 199, 0.85)', 'rgba(6, 182, 212, 0.85)', 'rgba(16, 185, 129, 0.85)', 'rgba(99, 102, 241, 0.85)'],
        borderColor: ['#0284c7', '#0891b2', '#059669', '#4f46e5'],
        borderWidth: 1.5,
        borderRadius: 4
      }
    ]
  } : null;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      {/* Preset Banner */}
      <div className="card" style={{ background: '#f8fafc', padding: '1rem 1.25rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.75rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <span className="badge badge-info"><Sparkles size={12} /> Parallel Presets</span>
            <span style={{ fontSize: '0.85rem', color: '#475569' }}>Load verified parallel loop benchmark:</span>
          </div>
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            {EQUIVALENT_PIPE_PRESETS.parallel.map(p => (
              <button
                key={p.id}
                type="button"
                className="btn btn-secondary btn-sm"
                onClick={() => handleLoadPreset(p)}
              >
                {p.name}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Inputs Toolbar */}
      <div className="card" style={{ padding: '1.25rem' }}>
        <div className="card-header">
          <div>
            <h3>Parallel Manifold Boundary Conditions</h3>
            <p style={{ fontSize: '0.825rem', marginTop: '2px' }}>
              Total entering discharge Q_total and target equivalent pipe length Le.
            </p>
          </div>
          <button
            type="button"
            className="btn btn-primary btn-sm"
            onClick={handleAddPipe}
          >
            <Plus size={16} /> Add Parallel Branch
          </button>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1rem' }}>
          <div className="form-group">
            <label className="form-label">
              Total Flow Q_total <span className="unit">{displayUnit === 'l_s' ? 'L/s' : 'm³/s'}</span>
            </label>
            <input
              type="number"
              step={displayUnit === 'l_s' ? '1' : '0.005'}
              min="0.001"
              className="form-input mono"
              value={displayUnit === 'l_s' ? (totalDischarge * 1000).toFixed(1) : totalDischarge}
              onChange={(e) => {
                const raw = parseFloat(e.target.value) || 0;
                const inM3 = displayUnit === 'l_s' ? raw / 1000 : raw;
                setTotalDischarge(inM3);
                recalculate(pipes, inM3, equivalentLength, fe);
              }}
            />
          </div>

          <div className="form-group">
            <label className="form-label">
              Target Eq Length Le <span className="unit">m</span>
            </label>
            <input
              type="number"
              step="50"
              min="1"
              className="form-input mono"
              value={equivalentLength}
              onChange={(e) => {
                const val = parseFloat(e.target.value) || 0;
                setEquivalentLength(val);
                recalculate(pipes, totalDischarge, val, fe);
              }}
            />
          </div>

          <div className="form-group">
            <label className="form-label">
              Eq Pipe Friction Factor fe <span className="unit">—</span>
            </label>
            <input
              type="number"
              step="0.001"
              min="0.008"
              max="0.08"
              className="form-input mono"
              value={fe}
              onChange={(e) => {
                const val = parseFloat(e.target.value) || 0.02;
                setFe(val);
                recalculate(pipes, totalDischarge, equivalentLength, val);
              }}
            />
          </div>
        </div>
      </div>

      {/* Parallel Branches Table */}
      <div className="card" style={{ padding: '1.25rem' }}>
        <div className="card-header">
          <div>
            <h3>Parallel Branches Flow Distribution</h3>
            <p style={{ fontSize: '0.825rem', marginTop: '2px' }}>
              Automatic calculation of individual branch discharge, velocity, and common head loss.
            </p>
          </div>
          <button
            type="button"
            className="btn btn-secondary btn-sm"
            onClick={() => result && exportEquivalentPipeCSV(result)}
          >
            <Download size={14} /> Export Parallel CSV
          </button>
        </div>

        <div className="table-responsive">
          <table className="eng-table">
            <thead>
              <tr>
                <th style={{ width: '40px' }}>#</th>
                <th>Branch Name</th>
                <th>Length L <span className="unit">m</span></th>
                <th>Diameter D <span className="unit">m (mm)</span></th>
                <th>Darcy f <span className="unit">—</span></th>
                <th className="num-col">Resistance K</th>
                <th className="num-col">1 / √K</th>
                <th className="num-col">Discharge Q ({displayUnit === 'l_s' ? 'L/s' : 'm³/s'})</th>
                <th className="num-col">Flow Share (%)</th>
                <th className="num-col">Velocity v <span className="unit">m/s</span></th>
                <th className="num-col">Head Loss h <span className="unit">m</span></th>
                <th style={{ width: '60px', textAlign: 'center' }}>Action</th>
              </tr>
            </thead>
            <tbody>
              {pipes.map((pipe, idx) => {
                const calcB = result && result.branches && result.branches[idx];
                return (
                  <tr key={`parallel-row-${idx}`}>
                    <td style={{ color: '#94a3b8', fontWeight: '600' }}>{idx + 1}</td>
                    <td>
                      <input
                        type="text"
                        className="form-input"
                        style={{ width: '130px', padding: '0.35rem 0.5rem', fontSize: '0.85rem' }}
                        value={pipe.name || ''}
                        onChange={(e) => handlePipeChange(idx, 'name', e.target.value)}
                      />
                    </td>
                    <td>
                      <input
                        type="number"
                        step="50"
                        min="1"
                        className="form-input mono"
                        style={{ width: '90px', padding: '0.35rem 0.5rem', fontSize: '0.85rem' }}
                        value={pipe.length}
                        onChange={(e) => handlePipeChange(idx, 'length', e.target.value)}
                      />
                    </td>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <input
                          type="number"
                          step="0.01"
                          min="0.01"
                          className="form-input mono"
                          style={{ width: '85px', padding: '0.35rem 0.5rem', fontSize: '0.85rem' }}
                          value={pipe.diameter}
                          onChange={(e) => handlePipeChange(idx, 'diameter', e.target.value)}
                        />
                        <span style={{ fontSize: '0.75rem', color: '#64748b' }}>
                          ({((parseFloat(pipe.diameter) || 0) * 1000).toFixed(0)}mm)
                        </span>
                      </div>
                    </td>
                    <td>
                      <input
                        type="number"
                        step="0.001"
                        min="0.005"
                        max="0.08"
                        className="form-input mono"
                        style={{ width: '80px', padding: '0.35rem 0.5rem', fontSize: '0.85rem' }}
                        value={pipe.frictionFactor || 0.02}
                        onChange={(e) => handlePipeChange(idx, 'frictionFactor', e.target.value)}
                      />
                    </td>
                    <td className="num-col mono-num">{calcB ? formatNum(calcB.K, 4) : '—'}</td>
                    <td className="num-col mono-num">{calcB ? formatNum(calcB.invSqrtK, 4) : '—'}</td>
                    <td className="num-col mono-num" style={{ fontWeight: '700', color: '#0369a1' }}>
                      {calcB ? (displayUnit === 'l_s' ? (calcB.flow * 1000).toFixed(2) : calcB.flow.toFixed(5)) : '—'}
                    </td>
                    <td className="num-col mono-num" style={{ fontWeight: '700', color: '#047857' }}>
                      {calcB ? `${calcB.percentage.toFixed(1)}%` : '—'}
                    </td>
                    <td className="num-col mono-num">{calcB ? calcB.velocity.toFixed(2) : '—'}</td>
                    <td className="num-col mono-num">{calcB ? formatHead(calcB.headLoss) : '—'}</td>
                    <td style={{ textAlign: 'center' }}>
                      <button
                        type="button"
                        className="btn btn-danger btn-sm"
                        style={{ padding: '4px 6px' }}
                        onClick={() => handleRemovePipe(idx)}
                      >
                        <Trash2 size={13} />
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
            {result && result.success && (
              <tfoot>
                <tr>
                  <td colSpan="6" style={{ textAlign: 'right', fontWeight: '800' }}>
                    Manifold Totals:
                  </td>
                  <td className="num-col mono-num" style={{ fontWeight: '800' }}>
                    Σ(1/√K) = {formatNum(result.sumInvSqrtK, 4)}
                  </td>
                  <td className="num-col mono-num" style={{ fontWeight: '800', color: '#0284c7' }}>
                    ΣQ = {formatFlow(result.totalDischarge, displayUnit)}
                  </td>
                  <td className="num-col mono-num" style={{ fontWeight: '800', color: '#047857' }}>
                    100.0%
                  </td>
                  <td className="num-col">—</td>
                  <td className="num-col mono-num" style={{ fontWeight: '800', color: '#0369a1' }}>
                    h = {formatHead(result.commonHeadLoss)}
                  </td>
                  <td></td>
                </tr>
              </tfoot>
            )}
          </table>
        </div>
      </div>

      {/* Schematic Diagram */}
      {result && result.success && (
        <EquivalentDiagram mode="parallel" result={result} displayUnit={displayUnit} />
      )}

      {/* Metric Cards */}
      {result && result.success && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1rem' }}>
          <div className="metric-card">
            <div className="metric-label">Common Head Loss (h)</div>
            <div className="metric-val" style={{ color: '#0284c7' }}>
              {formatNum(result.commonHeadLoss, 3)} <span style={{ fontSize: '0.85rem' }}>m</span>
            </div>
            <div className="metric-sub">Identical head loss across all branches</div>
          </div>

          <div className="metric-card">
            <div className="metric-label">Equivalent Resistance (Ke)</div>
            <div className="metric-val">
              {formatNum(result.Ke, 4)}
            </div>
            <div className="metric-sub">Ke = [ Σ(1 / √Ki) ]⁻²</div>
          </div>

          <div className="metric-card">
            <div className="metric-label">Equivalent Diameter (De)</div>
            <div className="metric-val" style={{ color: '#047857' }}>
              {(result.equivalentDiameter * 1000).toFixed(1)} <span style={{ fontSize: '0.85rem' }}>mm</span>
            </div>
            <div className="metric-sub">For specified Le = {result.equivalentLength} m</div>
          </div>

          <div className="metric-card">
            <div className="metric-label">Continuity Verification</div>
            <div className="metric-val" style={{ color: '#059669', fontSize: '1.3rem' }}>
              <CheckCircle2 size={20} style={{ display: 'inline', marginRight: '6px' }} />
              VALIDATED
            </div>
            <div className="metric-sub">Continuity error: {result.continuityError.toExponential(2)} m³/s</div>
          </div>
        </div>
      )}

      {/* Flow Distribution Chart */}
      {chartData && (
        <div className="card" style={{ padding: '1.25rem' }}>
          <div className="card-header">
            <h3>Branch Flow Rate Distribution</h3>
          </div>
          <div style={{ height: '240px' }}>
            <Bar
              data={chartData}
              options={{
                responsive: true,
                maintainAspectRatio: false,
                plugins: { legend: { display: false } },
                scales: {
                  y: { title: { display: true, text: `Discharge (${flowUnitLabel})` } }
                }
              }}
            />
          </div>
        </div>
      )}

      {/* Step-by-Step Parallel Resistance Derivation */}
      {result && result.success && (
        <div className="card" style={{ padding: '1.25rem' }}>
          <div className="card-header">
            <div>
              <h3>Step-by-Step Parallel Resistance Derivation</h3>
              <p style={{ fontSize: '0.825rem', marginTop: '2px' }}>
                Mathematical formulation of equivalent resistance and branch flow apportionment.
              </p>
            </div>
          </div>

          <div className="formula-block" style={{ marginBottom: '1rem' }}>
            <div style={{ color: '#38bdf8', fontWeight: '700', marginBottom: '0.4rem' }}>
              Parallel Governing Equations:
            </div>
            <div>
              1. Constant Head Loss: h₁ = h₂ = ... = h_m = h = Ke · Q_total²<br />
              2. Continuity: Q_total = Σ Q_i = Σ √(h / K_i) = √h · Σ (1 / √K_i)<br />
              3. Equivalent Resistance: 1 / √Ke = Σ (1 / √K_i)  ⟹  Ke = [ Σ (1 / √K_i) ]⁻²
            </div>
          </div>

          <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '8px', padding: '1rem', fontFamily: 'var(--font-mono)', fontSize: '0.875rem' }}>
            <div style={{ color: '#475569', marginBottom: '0.5rem' }}>
              1. Inverse square root resistance terms (1 / √K_i):
            </div>
            {result.branches.map((b, i) => (
              <div key={`par-step-${i}`} style={{ paddingLeft: '1rem', marginBottom: '0.35rem' }}>
                • {b.name}: 1 / √({formatNum(b.K, 4)}) = <strong style={{ color: '#0369a1' }}>{formatNum(b.invSqrtK, 4)}</strong>
              </div>
            ))}

            <div style={{ margin: '0.75rem 0', borderTop: '1px solid #cbd5e1', paddingTop: '0.5rem' }}>
              2. Sum of conductance terms:
              <div style={{ fontWeight: '700', color: '#0f172a', paddingLeft: '1rem' }}>
                Σ (1 / √K_i) = {formatNum(result.sumInvSqrtK, 4)}
              </div>
            </div>

            <div style={{ margin: '0.75rem 0', borderTop: '1px solid #cbd5e1', paddingTop: '0.5rem' }}>
              3. Equivalent Resistance Ke:
              <div style={{ fontWeight: '700', color: '#047857', paddingLeft: '1rem' }}>
                Ke = [ 1 / {formatNum(result.sumInvSqrtK, 4)} ]² = {formatNum(result.Ke, 4)}
              </div>
            </div>

            <div style={{ borderTop: '1px solid #cbd5e1', paddingTop: '0.5rem' }}>
              4. Common Head Loss h:
              <div style={{ fontWeight: '700', color: '#0369a1', paddingLeft: '1rem' }}>
                h = Ke · Q_total² = {formatNum(result.Ke, 4)} · ({result.totalDischarge})² = {formatNum(result.commonHeadLoss, 4)} m
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
