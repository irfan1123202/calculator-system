import React, { useState, useEffect } from 'react';
import {
  solveHardyCross,
  executeHardyCrossIteration,
  validateNetwork,
  EQUATIONS
} from '../../engine/hardyCrossSolver';
import { HARDY_CROSS_PRESETS } from '../../engine/presets';
import NetworkDiagram from './NetworkDiagram';
import PipeInputTable from './PipeInputTable';
import IterationTable from './IterationTable';
import ResultsDashboard from './ResultsDashboard';
import StepByStepFormulas from './StepByStepFormulas';
import {
  Play,
  RotateCcw,
  StepForward,
  Settings,
  AlertTriangle,
  Sparkles,
  Layers,
  Table,
  BarChart3,
  BookOpen
} from 'lucide-react';

export default function HardyCrossCalculator() {
  // Active preset
  const defaultPreset = HARDY_CROSS_PRESETS[0];

  const [selectedPresetId, setSelectedPresetId] = useState(defaultPreset.id);
  const [numLoops, setNumLoops] = useState(defaultPreset.numLoops);
  const [equation, setEquation] = useState(defaultPreset.equation);
  const [useTextbook12_1, setUseTextbook12_1] = useState(defaultPreset.useTextbook12_1 || false);
  const [tolerance, setTolerance] = useState(0.0001);
  const [maxIterations, setMaxIterations] = useState(25);
  const [displayUnit, setDisplayUnit] = useState('l_s'); // 'l_s' | 'm3_s'

  // Network geometry and pipes
  const [nodes, setNodes] = useState(defaultPreset.nodes || []);
  const [pipes, setPipes] = useState(defaultPreset.pipes);

  // Solved state
  const [solution, setSolution] = useState(null);
  const [validationErrors, setValidationErrors] = useState([]);
  const [activeTab, setActiveTab] = useState('dashboard'); // 'dashboard' | 'iterations' | 'formulas'
  const [selectedPipeId, setSelectedPipeId] = useState(null);

  // Auto-solve on initial load of preset
  useEffect(() => {
    handleFullSolve(pipes, numLoops, equation, useTextbook12_1, tolerance, maxIterations);
  }, []);

  const handleSelectPreset = (presetId) => {
    const preset = HARDY_CROSS_PRESETS.find(p => p.id === presetId);
    if (!preset) return;

    setSelectedPresetId(preset.id);
    setNumLoops(preset.numLoops);
    setEquation(preset.equation);
    setUseTextbook12_1(preset.useTextbook12_1 || false);
    setTolerance(preset.tolerance || 0.0001);
    setMaxIterations(preset.maxIterations || 25);
    setNodes(preset.nodes || []);
    setPipes(preset.pipes.map(p => ({ ...p })));

    handleFullSolve(
      preset.pipes,
      preset.numLoops,
      preset.equation,
      preset.useTextbook12_1 || false,
      preset.tolerance || 0.0001,
      preset.maxIterations || 25
    );
  };

  const handleFullSolve = (
    currentPipes = pipes,
    currentLoops = numLoops,
    currEq = equation,
    curr12_1 = useTextbook12_1,
    currTol = tolerance,
    currMax = maxIterations
  ) => {
    const validation = validateNetwork(currentPipes, currentLoops);
    if (!validation.isValid) {
      setValidationErrors(validation.errors);
      setSolution(null);
      return;
    }

    setValidationErrors([]);
    const res = solveHardyCross(currentPipes, {
      numLoops: currentLoops,
      equation: currEq,
      useTextbook12_1: curr12_1,
      tolerance: currTol,
      maxIterations: currMax
    });

    setSolution(res);
  };

  const handleNextIteration = () => {
    // If not solved yet, start from pipes
    let basePipes = pipes;
    let existingIterations = [];

    if (solution && solution.iterations && solution.iterations.length > 0) {
      basePipes = solution.finalPipes;
      existingIterations = [...solution.iterations];
    }

    const iterResult = executeHardyCrossIteration(basePipes, {
      numLoops,
      equation,
      useTextbook12_1
    });

    const nextIterNumber = existingIterations.length + 1;
    const newIterationEntry = {
      iterationNumber: nextIterNumber,
      loopDetails: iterResult.loopDetails,
      pipesSnapshot: basePipes.map(p => ({ ...p })),
      updatedPipes: iterResult.updatedPipes.map(p => ({ ...p })),
      maxDeltaQ: iterResult.maxDeltaQ,
      maxResidualHead: iterResult.maxResidualHead
    };

    const newIterations = [...existingIterations, newIterationEntry];
    const isConverged = iterResult.maxDeltaQ < tolerance || iterResult.maxResidualHead < tolerance;
    const totalHeadLoss = iterResult.updatedPipes.reduce((acc, p) => acc + (p.headLoss || 0), 0);
    const maxVelocity = Math.max(...iterResult.updatedPipes.map(p => p.velocity || 0));

    setSolution({
      success: true,
      converged: isConverged,
      iterationsCount: nextIterNumber,
      maxIterations,
      tolerance,
      equation,
      iterations: newIterations,
      finalPipes: iterResult.updatedPipes,
      totalHeadLoss,
      maxVelocity,
      validation: { isValid: true, errors: [], warnings: [] }
    });
  };

  const handleReset = () => {
    const resetPipes = pipes.map(p => ({
      ...p,
      flow: parseFloat(p.initialFlow !== undefined ? p.initialFlow : p.flow) || 0
    }));
    setPipes(resetPipes);
    handleFullSolve(resetPipes);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.75rem' }}>
      {/* Preset Selector Banner */}
      <div className="card" style={{ background: 'linear-gradient(135deg, #f0f9ff 0%, #ffffff 100%)', border: '1px solid #bae6fd' }}>
        <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: '1rem' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '4px' }}>
              <span className="badge badge-info"><Sparkles size={12} /> Standard Benchmark Presets</span>
              <span style={{ fontSize: '0.8rem', color: '#64748b' }}>Select a textbook test case:</span>
            </div>
            <select
              className="form-select"
              style={{ fontSize: '0.95rem', fontWeight: '700', color: '#0369a1', minWidth: '320px', cursor: 'pointer' }}
              value={selectedPresetId}
              onChange={(e) => handleSelectPreset(e.target.value)}
            >
              {HARDY_CROSS_PRESETS.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name} ({p.category})
                </option>
              ))}
            </select>
          </div>

          <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
            <button
              type="button"
              className="btn btn-primary"
              onClick={() => handleFullSolve()}
            >
              <Play size={16} fill="white" /> Auto Solve Network
            </button>
            <button
              type="button"
              className="btn btn-secondary"
              onClick={handleNextIteration}
              title="Perform a single iteration step for educational observation"
            >
              <StepForward size={16} /> Next Iteration (Step)
            </button>
            <button
              type="button"
              className="btn btn-secondary"
              onClick={handleReset}
              title="Reset flows back to initial guesses"
            >
              <RotateCcw size={16} /> Reset
            </button>
          </div>
        </div>

        {/* Preset Description */}
        {selectedPresetId && (
          <div style={{ marginTop: '0.75rem', fontSize: '0.85rem', color: '#475569' }}>
            {HARDY_CROSS_PRESETS.find(p => p.id === selectedPresetId)?.description}
          </div>
        )}
      </div>

      {/* Network Configuration Toolbar */}
      <div className="card" style={{ padding: '1.25rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
          <Settings size={18} color="#0284c7" />
          <h4 style={{ color: '#0f172a' }}>Hydraulic Solver Settings & Equation Selection</h4>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '1rem' }}>
          <div className="form-group">
            <label className="form-label">Number of Closed Loops</label>
            <input
              type="number"
              min="1"
              max="5"
              className="form-input mono"
              value={numLoops}
              onChange={(e) => {
                const val = Math.max(1, parseInt(e.target.value, 10) || 1);
                setNumLoops(val);
              }}
            />
          </div>

          <div className="form-group">
            <label className="form-label">Head Loss Equation</label>
            <select
              className="form-select"
              value={equation}
              onChange={(e) => setEquation(e.target.value)}
            >
              <option value={EQUATIONS.DARCY}>Darcy-Weisbach (n = 2.0)</option>
              <option value={EQUATIONS.HAZEN_WILLIAMS}>Hazen-Williams (n = 1.852)</option>
            </select>
          </div>

          {equation === EQUATIONS.DARCY && (
            <div className="form-group">
              <label className="form-label">Darcy K Constant</label>
              <select
                className="form-select"
                value={useTextbook12_1 ? 'textbook' : 'exact'}
                onChange={(e) => setUseTextbook12_1(e.target.value === 'textbook')}
              >
                <option value="exact">Exact SI: 8fL / (π²gD⁵)</option>
                <option value="textbook">Textbook: fL / (12.1 D⁵)</option>
              </select>
            </div>
          )}

          <div className="form-group">
            <label className="form-label">Tolerance (ε)</label>
            <input
              type="number"
              step="0.0001"
              min="0.00001"
              className="form-input mono"
              value={tolerance}
              onChange={(e) => setTolerance(parseFloat(e.target.value) || 0.0001)}
            />
          </div>

          <div className="form-group">
            <label className="form-label">Max Iterations</label>
            <input
              type="number"
              min="5"
              max="100"
              className="form-input mono"
              value={maxIterations}
              onChange={(e) => setMaxIterations(parseInt(e.target.value, 10) || 30)}
            />
          </div>

          <div className="form-group">
            <label className="form-label">Flow Rate Display Unit</label>
            <div style={{ display: 'flex', gap: '0.25rem' }}>
              <button
                type="button"
                className={`btn btn-sm ${displayUnit === 'l_s' ? 'btn-primary' : 'btn-secondary'}`}
                style={{ flex: 1 }}
                onClick={() => setDisplayUnit('l_s')}
              >
                L/s
              </button>
              <button
                type="button"
                className={`btn btn-sm ${displayUnit === 'm3_s' ? 'btn-primary' : 'btn-secondary'}`}
                style={{ flex: 1 }}
                onClick={() => setDisplayUnit('m3_s')}
              >
                m³/s
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Validation Error Banner */}
      {validationErrors.length > 0 && (
        <div className="alert-box alert-danger">
          <AlertTriangle size={20} />
          <div>
            <strong>Network Validation Errors:</strong>
            <ul style={{ marginTop: '0.35rem', paddingLeft: '1.25rem' }}>
              {validationErrors.map((err, idx) => (
                <li key={`val-err-${idx}`}>{err}</li>
              ))}
            </ul>
          </div>
        </div>
      )}

      {/* Interactive Network Diagram */}
      <NetworkDiagram
        nodes={nodes}
        pipes={solution ? solution.finalPipes : pipes}
        numLoops={numLoops}
        selectedPipeId={selectedPipeId}
        onSelectPipe={setSelectedPipeId}
        displayUnit={displayUnit}
      />

      {/* Pipe Inventory & Input Table */}
      <PipeInputTable
        pipes={pipes}
        numLoops={numLoops}
        equation={equation}
        displayUnit={displayUnit}
        onChangePipes={(updated) => {
          setPipes(updated);
          handleFullSolve(updated);
        }}
        selectedPipeId={selectedPipeId}
        onSelectPipe={setSelectedPipeId}
      />

      {/* Results & Educational Analysis Section */}
      {solution && (
        <div>
          {/* Navigation Pill Tabs */}
          <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.25rem', borderBottom: '1px solid #e2e8f0', paddingBottom: '0.5rem' }}>
            <button
              type="button"
              className={`btn btn-sm ${activeTab === 'dashboard' ? 'btn-primary' : 'btn-secondary'}`}
              onClick={() => setActiveTab('dashboard')}
            >
              <BarChart3 size={15} /> Results Dashboard & Charts
            </button>
            <button
              type="button"
              className={`btn btn-sm ${activeTab === 'iterations' ? 'btn-primary' : 'btn-secondary'}`}
              onClick={() => setActiveTab('iterations')}
            >
              <Table size={15} /> Iteration History ({solution.iterations.length} steps)
            </button>
            <button
              type="button"
              className={`btn btn-sm ${activeTab === 'formulas' ? 'btn-primary' : 'btn-secondary'}`}
              onClick={() => setActiveTab('formulas')}
            >
              <BookOpen size={15} /> Formulas & Substitutions
            </button>
          </div>

          {activeTab === 'dashboard' && (
            <ResultsDashboard
              solution={solution}
              displayUnit={displayUnit}
              onSelectPipe={setSelectedPipeId}
              selectedPipeId={selectedPipeId}
            />
          )}

          {activeTab === 'iterations' && (
            <IterationTable
              iterations={solution.iterations}
              displayUnit={displayUnit}
            />
          )}

          {activeTab === 'formulas' && (
            <StepByStepFormulas
              solution={solution}
              equation={equation}
            />
          )}
        </div>
      )}
    </div>
  );
}
