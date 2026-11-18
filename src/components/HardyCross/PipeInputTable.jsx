import React from 'react';
import { Plus, Trash2, Copy, AlertCircle, HelpCircle } from 'lucide-react';
import { EQUATIONS } from '../../engine/hardyCrossSolver';

export default function PipeInputTable({
  pipes = [],
  numLoops = 2,
  equation = EQUATIONS.DARCY,
  displayUnit = 'l_s',
  onChangePipes,
  selectedPipeId,
  onSelectPipe
}) {
  const isDarcy = equation === EQUATIONS.DARCY;
  const isHazen = equation === EQUATIONS.HAZEN_WILLIAMS;

  const handleFieldChange = (index, field, value) => {
    const updated = [...pipes];
    updated[index] = { ...updated[index], [field]: value };

    // If changing initial flow, also update flow if not solved
    if (field === 'initialFlow') {
      updated[index].flow = parseFloat(value) || 0;
    }

    onChangePipes(updated);
  };

  const handleLoopDirChange = (pipeIndex, loopIndex, dir) => {
    const updated = [...pipes];
    const currentLoops = [...(updated[pipeIndex].loops || Array(numLoops).fill(0))];
    while (currentLoops.length < numLoops) currentLoops.push(0);
    currentLoops[loopIndex] = parseInt(dir, 10);
    updated[pipeIndex] = { ...updated[pipeIndex], loops: currentLoops };
    onChangePipes(updated);
  };

  const handleAddPipe = () => {
    const nextIdx = pipes.length + 1;
    const newPipe = {
      id: `P${nextIdx}`,
      name: `Pipe ${nextIdx}`,
      length: 500,
      diameter: 0.20,
      frictionFactor: 0.02,
      hwC: 120,
      initialFlow: 0.020,
      flow: 0.020,
      loops: Array(numLoops).fill(0)
    };
    if (numLoops > 0) newPipe.loops[0] = 1; // Default to clockwise in Loop 1
    onChangePipes([...pipes, newPipe]);
  };

  const handleDuplicatePipe = (idx) => {
    const source = pipes[idx];
    const copy = {
      ...source,
      id: `${source.id}_copy`,
      name: `${source.name || source.id} (Copy)`,
      loops: [...(source.loops || Array(numLoops).fill(0))]
    };
    const updated = [...pipes];
    updated.splice(idx + 1, 0, copy);
    onChangePipes(updated);
  };

  const handleRemovePipe = (idx) => {
    if (pipes.length <= 2) {
      alert('A network must have at least 2 pipes.');
      return;
    }
    const updated = pipes.filter((_, i) => i !== idx);
    onChangePipes(updated);
  };

  return (
    <div className="card" style={{ padding: '1.25rem' }}>
      <div className="card-header">
        <div>
          <h3>Pipe Network Inventory & Initial Flow Guesses</h3>
          <p style={{ fontSize: '0.825rem', marginTop: '2px' }}>
            Specify geometry, friction parameters, initial guessed flow rates, and loop directions.
          </p>
        </div>
        <button
          type="button"
          className="btn btn-primary btn-sm"
          onClick={handleAddPipe}
        >
          <Plus size={16} /> Add Pipe
        </button>
      </div>

      <div className="table-responsive">
        <table className="eng-table">
          <thead>
            <tr>
              <th style={{ width: '40px' }}>#</th>
              <th>Pipe ID</th>
              <th>Length <span className="unit">m</span></th>
              <th>Diameter <span className="unit">m (mm)</span></th>
              {isDarcy && <th>Darcy f <span className="unit">—</span></th>}
              {isHazen && <th>Hazen C <span className="unit">—</span></th>}
              <th>
                Initial Flow Q₀ <span className="unit">{displayUnit === 'l_s' ? 'L/s' : 'm³/s'}</span>
              </th>
              {Array.from({ length: numLoops }, (_, lIdx) => (
                <th key={`th-loop-${lIdx}`} style={{ textAlign: 'center', minWidth: '120px' }}>
                  Loop {lIdx + 1} Direction
                </th>
              ))}
              <th style={{ width: '80px', textAlign: 'center' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {pipes.map((pipe, idx) => {
              const isSelected = selectedPipeId === pipe.id;
              const len = parseFloat(pipe.length);
              const dia = parseFloat(pipe.diameter);
              const hasLenError = isNaN(len) || len <= 0;
              const hasDiaError = isNaN(dia) || dia <= 0;

              // Display initial flow in current unit
              const initQ = pipe.initialFlow !== undefined ? pipe.initialFlow : pipe.flow;
              const displayFlow = displayUnit === 'l_s' ? ((parseFloat(initQ) || 0) * 1000).toFixed(2) : initQ;

              return (
                <tr
                  key={`pipe-row-${pipe.id || idx}`}
                  className={isSelected ? 'active-row' : ''}
                  onClick={() => onSelectPipe && onSelectPipe(pipe.id)}
                >
                  <td style={{ color: '#94a3b8', fontWeight: '600' }}>{idx + 1}</td>
                  <td>
                    <input
                      type="text"
                      className="form-input mono"
                      style={{ width: '90px', padding: '0.35rem 0.5rem', fontSize: '0.85rem' }}
                      value={pipe.id || ''}
                      onChange={(e) => handleFieldChange(idx, 'id', e.target.value)}
                    />
                  </td>
                  <td>
                    <input
                      type="number"
                      step="10"
                      min="1"
                      className={`form-input mono ${hasLenError ? 'error' : ''}`}
                      style={{ width: '95px', padding: '0.35rem 0.5rem', fontSize: '0.85rem' }}
                      value={pipe.length}
                      onChange={(e) => handleFieldChange(idx, 'length', e.target.value)}
                    />
                  </td>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <input
                        type="number"
                        step="0.01"
                        min="0.01"
                        className={`form-input mono ${hasDiaError ? 'error' : ''}`}
                        style={{ width: '90px', padding: '0.35rem 0.5rem', fontSize: '0.85rem' }}
                        value={pipe.diameter}
                        onChange={(e) => handleFieldChange(idx, 'diameter', e.target.value)}
                      />
                      <span style={{ fontSize: '0.75rem', color: '#64748b' }}>
                        ({((parseFloat(pipe.diameter) || 0) * 1000).toFixed(0)}mm)
                      </span>
                    </div>
                  </td>

                  {isDarcy && (
                    <td>
                      <input
                        type="number"
                        step="0.001"
                        min="0.005"
                        max="0.1"
                        className="form-input mono"
                        style={{ width: '85px', padding: '0.35rem 0.5rem', fontSize: '0.85rem' }}
                        value={pipe.frictionFactor || 0.02}
                        onChange={(e) => handleFieldChange(idx, 'frictionFactor', e.target.value)}
                      />
                    </td>
                  )}

                  {isHazen && (
                    <td>
                      <input
                        type="number"
                        step="5"
                        min="50"
                        max="160"
                        className="form-input mono"
                        style={{ width: '85px', padding: '0.35rem 0.5rem', fontSize: '0.85rem' }}
                        value={pipe.hwC || 120}
                        onChange={(e) => handleFieldChange(idx, 'hwC', e.target.value)}
                      />
                    </td>
                  )}

                  <td>
                    <input
                      type="number"
                      step={displayUnit === 'l_s' ? '1' : '0.001'}
                      className="form-input mono"
                      style={{ width: '100px', padding: '0.35rem 0.5rem', fontSize: '0.85rem' }}
                      value={displayFlow}
                      onChange={(e) => {
                        const raw = parseFloat(e.target.value) || 0;
                        const inM3 = displayUnit === 'l_s' ? raw / 1000 : raw;
                        handleFieldChange(idx, 'initialFlow', inM3);
                      }}
                    />
                  </td>

                  {/* Loop direction selectors */}
                  {Array.from({ length: numLoops }, (_, lIdx) => {
                    const currentDir = (pipe.loops && pipe.loops[lIdx]) !== undefined ? pipe.loops[lIdx] : 0;
                    return (
                      <td key={`dir-select-${idx}-${lIdx}`} style={{ textAlign: 'center' }}>
                        <select
                          className="form-select"
                          style={{
                            fontSize: '0.8rem',
                            padding: '0.35rem 0.5rem',
                            width: '125px',
                            fontWeight: '600',
                            color: currentDir === 1 ? '#047857' : currentDir === -1 ? '#b91c1c' : '#64748b',
                            background: currentDir === 1 ? '#ecfdf5' : currentDir === -1 ? '#fef2f2' : 'white'
                          }}
                          value={currentDir}
                          onChange={(e) => handleLoopDirChange(idx, lIdx, e.target.value)}
                        >
                          <option value="0">0 (Not in Loop)</option>
                          <option value="1">+1 Clockwise (↻)</option>
                          <option value="-1">-1 Anti-Clock (↺)</option>
                        </select>
                      </td>
                    );
                  })}

                  <td style={{ textAlign: 'center' }}>
                    <div style={{ display: 'inline-flex', gap: '4px' }}>
                      <button
                        type="button"
                        className="btn btn-secondary btn-sm"
                        style={{ padding: '4px 6px' }}
                        title="Duplicate Pipe"
                        onClick={(e) => { e.stopPropagation(); handleDuplicatePipe(idx); }}
                      >
                        <Copy size={13} />
                      </button>
                      <button
                        type="button"
                        className="btn btn-danger btn-sm"
                        style={{ padding: '4px 6px' }}
                        title="Remove Pipe"
                        onClick={(e) => { e.stopPropagation(); handleRemovePipe(idx); }}
                      >
                        <Trash2 size={13} />
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <div style={{ marginTop: '0.85rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '0.8rem', color: '#64748b' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <HelpCircle size={14} color="#0284c7" />
          <span>
            <strong>Sign Rule:</strong> Set direction to <strong>+1 (CW)</strong> if the pipe’s primary flow direction is clockwise around the loop, or <strong>-1 (CCW)</strong> if counter-clockwise.
          </span>
        </div>
        <div>
          Total Pipes: <strong>{pipes.length}</strong>
        </div>
      </div>
    </div>
  );
}
