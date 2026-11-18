import React, { useState, useEffect } from 'react';
import { solveSeriesPipes } from '../../engine/equivalentPipeSolver';
import { EQUIVALENT_PIPE_PRESETS } from '../../engine/presets';
import { exportEquivalentPipeCSV } from '../../engine/csvExport';
import { formatNum, formatFlow, formatHead, formatDiameter } from '../../engine/unitConversions';
import EquivalentDiagram from './EquivalentDiagram';
import { Plus, Trash2, Download, Printer, Calculator, BookOpen, Sparkles } from 'lucide-react';

export default function SeriesCalculator({ displayUnit = 'l_s' }) {
  const defaultPreset = EQUIVALENT_PIPE_PRESETS.series[0];

  const [pipes, setPipes] = useState(defaultPreset.pipes);
  const [totalDischarge, setTotalDischarge] = useState(defaultPreset.totalDischarge);
  const [solveFor, setSolveFor] = useState('diameter'); // 'diameter' | 'length'
  const [equivalentLength, setEquivalentLength] = useState(defaultPreset.equivalentLength);
  const [targetDiameter, setTargetDiameter] = useState(defaultPreset.targetDiameter);
  const [fe, setFe] = useState(0.02);
  const [result, setResult] = useState(null);

  useEffect(() => {
    recalculate(pipes, totalDischarge, solveFor, equivalentLength, targetDiameter, fe);
  }, []);

  const recalculate = (pList, qVal, sFor, leVal, deVal, feVal) => {
    const res = solveSeriesPipes(pList, {
      totalDischarge: qVal,
      solveFor: sFor,
      equivalentLength: leVal,
      targetDiameter: deVal,
      fe: feVal
    });
    setResult(res);
  };

  const handlePipeChange = (idx, field, value) => {
    const updated = [...pipes];
    updated[idx] = { ...updated[idx], [field]: value };
    setPipes(updated);
    recalculate(updated, totalDischarge, solveFor, equivalentLength, targetDiameter, fe);
  };

  const handleAddPipe = () => {
    const nextIdx = pipes.length + 1;
    const newPipe = {
      id: `S${nextIdx}`,
      name: `Segment ${nextIdx}`,
      length: 300,
      diameter: 0.25,
      frictionFactor: 0.02
    };
    const updated = [...pipes, newPipe];
    setPipes(updated);
    recalculate(updated, totalDischarge, solveFor, equivalentLength, targetDiameter, fe);
  };

  const handleRemovePipe = (idx) => {
    if (pipes.length <= 1) {
      alert('Series analysis requires at least one pipe segment.');
      return;
    }
    const updated = pipes.filter((_, i) => i !== idx);
    setPipes(updated);
    recalculate(updated, totalDischarge, solveFor, equivalentLength, targetDiameter, fe);
  };

  const handleLoadPreset = (preset) => {
    setPipes(preset.pipes.map(p => ({ ...p })));
    setTotalDischarge(preset.totalDischarge);
    setEquivalentLength(preset.equivalentLength);
    setTargetDiameter(preset.targetDiameter);
    setFe(preset.fe);
    recalculate(preset.pipes, preset.totalDischarge, solveFor, preset.equivalentLength, preset.targetDiameter, preset.fe);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      {/* Preset Banner */}
      <div className="card" style={{ background: '#f8fafc', padding: '1rem 1.25rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.75rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <span className="badge badge-info"><Sparkles size={12} /> Series Presets</span>
            <span style={{ fontSize: '0.85rem', color: '#475569' }}>Load verified textbook pipeline:</span>
          </div>
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            {EQUIVALENT_PIPE_PRESETS.series.map(p => (
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

      {/* Configuration Toolbar */}
      <div className="card" style={{ padding: '1.25rem' }}>
        <div className="card-header">
          <div>
            <h3>Series Pipe Boundary Conditions & Target</h3>
            <p style={{ fontSize: '0.825rem', marginTop: '2px' }}>
              Select target variable to calculate (Equivalent Diameter De or Length Le) and enter flow rate.
            </p>
          </div>
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <button
              type="button"
              className="btn btn-primary btn-sm"
              onClick={handleAddPipe}
            >
              <Plus size={16} /> Add Segment
            </button>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
          <div className="form-group">
            <label className="form-label">
              Total Flow Rate Q <span className="unit">{displayUnit === 'l_s' ? 'L/s' : 'm³/s'}</span>
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
                recalculate(pipes, inM3, solveFor, equivalentLength, targetDiameter, fe);
              }}
            />
          </div>

          <div className="form-group">
            <label className="form-label">Solve For</label>
            <select
              className="form-select"
              value={solveFor}
              onChange={(e) => {
                setSolveFor(e.target.value);
                recalculate(pipes, totalDischarge, e.target.value, equivalentLength, targetDiameter, fe);
              }}
            >
              <option value="diameter">Equivalent Diameter (De) for specified Length (Le)</option>
              <option value="length">Equivalent Length (Le) for specified Diameter (De)</option>
            </select>
          </div>

          {solveFor === 'diameter' ? (
            <div className="form-group">
              <label className="form-label">
                Target Equivalent Length Le <span className="unit">m</span>
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
                  recalculate(pipes, totalDischarge, solveFor, val, targetDiameter, fe);
                }}
              />
            </div>
          ) : (
            <div className="form-group">
              <label className="form-label">
                Target Equivalent Diameter De <span className="unit">m</span>
              </label>
              <input
                type="number"
                step="0.05"
                min="0.01"
                className="form-input mono"
                value={targetDiameter}
                onChange={(e) => {
                  const val = parseFloat(e.target.value) || 0;
                  setTargetDiameter(val);
                  recalculate(pipes, totalDischarge, solveFor, equivalentLength, val, fe);
                }}
              />
            </div>
          )}

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
                recalculate(pipes, totalDischarge, solveFor, equivalentLength, targetDiameter, val);
              }}
            />
          </div>
        </div>
      </div>

      {/* Series Pipe Segments Table */}
      <div className="card" style={{ padding: '1.25rem' }}>
        <div className="card-header">
          <div>
            <h3>Compound Series Pipe Segments</h3>
            <p style={{ fontSize: '0.825rem', marginTop: '2px' }}>
              Connected end-to-end carrying identical discharge Q = {formatFlow(totalDischarge, displayUnit)}.
            </p>
          </div>
        </div>

        <div className="table-responsive">
          <table className="eng-table">
            <thead>
              <tr>
                <th style={{ width: '40px' }}>#</th>
                <th>Segment Name</th>
                <th>Length L <span className="unit">m</span></th>
                <th>Diameter D <span className="unit">m (mm)</span></th>
                <th>Darcy f <span className="unit">—</span></th>
                <th className="num-col">Resistance K</th>
                <th className="num-col">L / D⁵</th>
                <th className="num-col">Velocity v <span className="unit">m/s</span></th>
                <th className="num-col">Head Loss h_f <span className="unit">m</span></th>
                <th style={{ width: '60px', textAlign: 'center' }}>Action</th>
              </tr>
            </thead>
            <tbody>
              {pipes.map((pipe, idx) => {
                const calcP = result && result.pipes && result.pipes[idx];
                return (
                  <tr key={`series-row-${idx}`}>
                    <td style={{ color: '#94a3b8', fontWeight: '600' }}>{idx + 1}</td>
                    <td>
                      <input
                        type="text"
                        className="form-input"
                        style={{ width: '140px', padding: '0.35rem 0.5rem', fontSize: '0.85rem' }}
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
                        style={{ width: '100px', padding: '0.35rem 0.5rem', fontSize: '0.85rem' }}
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
                          style={{ width: '90px', padding: '0.35rem 0.5rem', fontSize: '0.85rem' }}
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
                        style={{ width: '85px', padding: '0.35rem 0.5rem', fontSize: '0.85rem' }}
                        value={pipe.frictionFactor || 0.02}
                        onChange={(e) => handlePipeChange(idx, 'frictionFactor', e.target.value)}
                      />
                    </td>
                    <td className="num-col mono-num">{calcP ? formatNum(calcP.K, 4) : '—'}</td>
                    <td className="num-col mono-num">{calcP ? Math.round(calcP.termL_D5).toLocaleString() : '—'}</td>
                    <td className="num-col mono-num">{calcP ? calcP.velocity.toFixed(2) : '—'}</td>
                    <td className="num-col mono-num" style={{ fontWeight: '700', color: '#0369a1' }}>
                      {calcP ? formatHead(calcP.headLoss) : '—'}
                    </td>
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
                  <td colSpan="5" style={{ textAlign: 'right', fontWeight: '800' }}>
                    Total Series System Values (Σ):
                  </td>
                  <td className="num-col mono-num" style={{ fontWeight: '800', color: '#0369a1' }}>
                    Ke = {formatNum(result.Ke, 4)}
                  </td>
                  <td className="num-col mono-num" style={{ fontWeight: '800' }}>
                    Σ(L/D⁵) = {Math.round(result.sumL_over_D5).toLocaleString()}
                  </td>
                  <td className="num-col">—</td>
                  <td className="num-col mono-num" style={{ fontWeight: '800', color: '#047857', fontSize: '0.95rem' }}>
                    H = {formatHead(result.totalHeadLoss)}
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
        <EquivalentDiagram mode="series" result={result} displayUnit={displayUnit} />
      )}

      {/* Results Summary Cards */}
      {result && result.success && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1rem' }}>
          <div className="metric-card">
            <div className="metric-label">Equivalent Diameter (De)</div>
            <div className="metric-val" style={{ color: '#047857' }}>
              {(result.equivalentDiameter * 1000).toFixed(1)} <span style={{ fontSize: '0.85rem' }}>mm</span>
            </div>
            <div className="metric-sub">{result.equivalentDiameter.toFixed(4)} m</div>
          </div>

          <div className="metric-card">
            <div className="metric-label">Equivalent Length (Le)</div>
            <div className="metric-val">
              {result.equivalentLength.toFixed(1)} <span style={{ fontSize: '0.85rem' }}>m</span>
            </div>
            <div className="metric-sub">Friction factor fe = {result.equivalentFrictionFactor}</div>
          </div>

          <div className="metric-card">
            <div className="metric-label">Total System Head Loss (H)</div>
            <div className="metric-val" style={{ color: '#0284c7' }}>
              {formatNum(result.totalHeadLoss, 3)} <span style={{ fontSize: '0.85rem' }}>m</span>
            </div>
            <div className="metric-sub">H = Σ h_i = Ke · Q²</div>
          </div>

          <div className="metric-card">
            <div className="metric-label">Equivalent Resistance (Ke)</div>
            <div className="metric-val">
              {formatNum(result.Ke, 4)}
            </div>
            <div className="metric-sub">Ke = Σ K_i</div>
          </div>
        </div>
      )}

      {/* Step-by-Step Educational Substitution */}
      {result && result.success && (
        <div className="card" style={{ padding: '1.25rem' }}>
          <div className="card-header">
            <div>
              <h3>Step-by-Step Dupuit Formula Substitution</h3>
              <p style={{ fontSize: '0.825rem', marginTop: '2px' }}>
                Mathematical verification of equivalent diameter using Dupuit's equation for pipes in series.
              </p>
            </div>
            <button
              type="button"
              className="btn btn-secondary btn-sm"
              onClick={() => exportEquivalentPipeCSV(result)}
            >
              <Download size={14} /> Export Series CSV
            </button>
          </div>

          <div className="formula-block" style={{ marginBottom: '1rem' }}>
            <div style={{ color: '#38bdf8', fontWeight: '700', marginBottom: '0.4rem' }}>
              Dupuit's Series Pipeline Formulation:
            </div>
            <div>
              L_e / D_e⁵ = Σ (L_i / D_i⁵) = (L₁ / D₁⁵) + (L₂ / D₂⁵) + ... + (L_m / D_m⁵)
            </div>
          </div>

          <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '8px', padding: '1rem', fontFamily: 'var(--font-mono)', fontSize: '0.875rem' }}>
            <div style={{ color: '#475569', marginBottom: '0.5rem' }}>
              1. Evaluating individual geometric impedance terms (L_i / D_i⁵):
            </div>
            {result.pipes.map((p, i) => (
              <div key={`dupuit-step-${i}`} style={{ paddingLeft: '1rem', marginBottom: '0.35rem' }}>
                • {p.name}: {p.length} / ({p.diameter})⁵ = {p.length} / {Math.pow(p.diameter, 5).toExponential(4)} = <strong style={{ color: '#0369a1' }}>{Math.round(p.termL_D5).toLocaleString()}</strong>
              </div>
            ))}

            <div style={{ margin: '0.75rem 0', borderTop: '1px solid #cbd5e1', paddingTop: '0.5rem' }}>
              2. Sum of series terms:
              <div style={{ fontWeight: '700', color: '#0f172a', paddingLeft: '1rem' }}>
                Σ (L_i / D_i⁵) = {Math.round(result.sumL_over_D5).toLocaleString()}
              </div>
            </div>

            <div style={{ borderTop: '1px solid #cbd5e1', paddingTop: '0.5rem' }}>
              3. Solving for Equivalent Diameter D_e:
              <div style={{ fontWeight: '700', color: '#047857', paddingLeft: '1rem', fontSize: '0.95rem' }}>
                D_e = [ L_e / Σ(L_i / D_i⁵) ]^(1/5) = [ {result.equivalentLength} / {Math.round(result.sumL_over_D5).toLocaleString()} ]^(0.2) = {result.equivalentDiameter.toFixed(4)} m ({(result.equivalentDiameter * 1000).toFixed(1)} mm)
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
