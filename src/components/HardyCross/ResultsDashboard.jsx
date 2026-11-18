import React from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
} from 'chart.js';
import { Bar, Line } from 'react-chartjs-2';
import { CheckCircle2, AlertTriangle, Download, Printer, Activity, Gauge, Droplet, ArrowRight } from 'lucide-react';
import { formatNum, formatFlow, formatHead } from '../../engine/unitConversions';
import { exportHardyCrossPipesCSV } from '../../engine/csvExport';

// Register Chart.js modules
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

export default function ResultsDashboard({
  solution,
  displayUnit = 'l_s',
  onSelectPipe,
  selectedPipeId
}) {
  if (!solution || !solution.finalPipes) return null;

  const {
    converged,
    iterationsCount,
    maxIterations,
    finalPipes,
    totalHeadLoss,
    maxVelocity,
    iterations = []
  } = solution;

  // Prepare Chart 1: Initial vs Final Balanced Flow Rates
  const pipeLabels = finalPipes.map(p => p.id);
  const flowFactor = displayUnit === 'l_s' ? 1000 : 1;
  const flowUnitLabel = displayUnit === 'l_s' ? 'L/s' : 'm³/s';

  const initialFlows = finalPipes.map(p => {
    const q = p.initialFlow !== undefined ? p.initialFlow : (p.previousFlow || p.flow);
    return Math.abs(parseFloat(q) || 0) * flowFactor;
  });

  const finalFlows = finalPipes.map(p => {
    return Math.abs(parseFloat(p.flow) || 0) * flowFactor;
  });

  const flowChartData = {
    labels: pipeLabels,
    datasets: [
      {
        label: `Initial Flow |Q₀| (${flowUnitLabel})`,
        data: initialFlows,
        backgroundColor: 'rgba(148, 163, 184, 0.65)',
        borderColor: '#94a3b8',
        borderWidth: 1.5,
        borderRadius: 4
      },
      {
        label: `Balanced Flow |Q*| (${flowUnitLabel})`,
        data: finalFlows,
        backgroundColor: 'rgba(2, 132, 199, 0.85)',
        borderColor: '#0284c7',
        borderWidth: 1.5,
        borderRadius: 4
      }
    ]
  };

  // Prepare Chart 2: Head Loss Distribution
  const headLosses = finalPipes.map(p => (p.headLoss || 0));
  const headLossChartData = {
    labels: pipeLabels,
    datasets: [
      {
        label: 'Pipe Head Loss h_f (m)',
        data: headLosses,
        backgroundColor: 'rgba(6, 182, 212, 0.75)',
        borderColor: '#0891b2',
        borderWidth: 1.5,
        borderRadius: 4
      }
    ]
  };

  // Prepare Chart 3: Convergence History (Max Residual Head vs Iteration)
  const iterLabels = iterations.map(it => `Iter ${it.iterationNumber}`);
  const maxResiduals = iterations.map(it => it.maxResidualHead);
  const maxDeltas = iterations.map(it => it.maxDeltaQ * flowFactor);

  const convergenceChartData = {
    labels: iterLabels,
    datasets: [
      {
        label: 'Max Loop Head Residual |Σh| (m)',
        data: maxResiduals,
        borderColor: '#ef4444',
        backgroundColor: 'rgba(239, 68, 68, 0.1)',
        tension: 0.3,
        fill: true,
        pointRadius: 4,
        yAxisID: 'y'
      },
      {
        label: `Max Flow Correction |ΔQ| (${flowUnitLabel})`,
        data: maxDeltas,
        borderColor: '#0284c7',
        backgroundColor: 'rgba(2, 132, 199, 0.1)',
        borderDash: [5, 5],
        tension: 0.3,
        pointRadius: 4,
        yAxisID: 'y1'
      }
    ]
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top',
        labels: { font: { family: 'Plus Jakarta Sans', size: 12 } }
      },
      tooltip: {
        bodyFont: { family: 'JetBrains Mono' }
      }
    },
    scales: {
      x: { grid: { display: false } },
      y: { grid: { color: '#f1f5f9' } }
    }
  };

  const dualAxisOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { position: 'top' }
    },
    scales: {
      y: {
        type: 'linear',
        position: 'left',
        title: { display: true, text: 'Residual Head (m)' },
        grid: { color: '#f1f5f9' }
      },
      y1: {
        type: 'linear',
        position: 'right',
        title: { display: true, text: `Correction ΔQ (${flowUnitLabel})` },
        grid: { drawOnChartArea: false }
      }
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      {/* Metric Summary Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1rem' }}>
        <div className="metric-card">
          <div className="metric-label">
            {converged ? <CheckCircle2 size={16} color="#10b981" /> : <AlertTriangle size={16} color="#f59e0b" />}
            Convergence Status
          </div>
          <div className="metric-val" style={{ color: converged ? '#047857' : '#b45309', fontSize: '1.4rem' }}>
            {converged ? 'CONVERGED' : 'ITERATING'}
          </div>
          <div className="metric-sub">
            {converged ? `Achieved in ${iterationsCount} iterations` : `Max ${maxIterations} reached`}
          </div>
        </div>

        <div className="metric-card">
          <div className="metric-label">
            <Activity size={16} color="#0284c7" />
            Max Loop Residual
          </div>
          <div className="metric-val">
            {iterations.length > 0 ? formatNum(iterations[iterations.length - 1].maxResidualHead, 5) : '0.000'} <span style={{ fontSize: '0.9rem' }}>m</span>
          </div>
          <div className="metric-sub">
            Tolerance threshold: ε = {solution.tolerance || '0.0001'}
          </div>
        </div>

        <div className="metric-card">
          <div className="metric-label">
            <Droplet size={16} color="#06b6d4" />
            Total Network Head Loss
          </div>
          <div className="metric-val">
            {formatNum(totalHeadLoss, 3)} <span style={{ fontSize: '0.9rem' }}>m</span>
          </div>
          <div className="metric-sub">
            Sum of individual pipe friction losses
          </div>
        </div>

        <div className="metric-card">
          <div className="metric-label">
            <Gauge size={16} color="#6366f1" />
            Max Flow Velocity
          </div>
          <div className="metric-val" style={{ color: maxVelocity > 2.5 ? '#b45309' : '#0369a1' }}>
            {maxVelocity.toFixed(2)} <span style={{ fontSize: '0.9rem' }}>m/s</span>
          </div>
          <div className="metric-sub">
            {maxVelocity > 2.5 ? '⚠️ Warning: Velocity > 2.5 m/s' : 'Optimal velocity range (0.6 - 2.5 m/s)'}
          </div>
        </div>
      </div>

      {/* Final Balanced Pipes Table */}
      <div className="card" style={{ padding: '1.25rem' }}>
        <div className="card-header">
          <div>
            <h3>Final Balanced Hydraulic Results</h3>
            <p style={{ fontSize: '0.825rem', marginTop: '2px' }}>
              Balanced flow rates, friction head losses, flow velocities, and Reynolds numbers for all pipes.
            </p>
          </div>
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <button
              type="button"
              className="btn btn-secondary btn-sm"
              onClick={() => exportHardyCrossPipesCSV(finalPipes, solution)}
            >
              <Download size={14} /> Export CSV
            </button>
            <button
              type="button"
              className="btn btn-secondary btn-sm no-print"
              onClick={() => window.print()}
            >
              <Printer size={14} /> Print Report
            </button>
          </div>
        </div>

        <div className="table-responsive">
          <table className="eng-table">
            <thead>
              <tr>
                <th>Pipe ID</th>
                <th>Length <span className="unit">m</span></th>
                <th>Diameter <span className="unit">mm</span></th>
                <th className="num-col">Resistance K</th>
                <th className="num-col">Initial Q₀ ({displayUnit === 'l_s' ? 'L/s' : 'm³/s'})</th>
                <th className="num-col">Balanced Flow Q* ({displayUnit === 'l_s' ? 'L/s' : 'm³/s'})</th>
                <th className="num-col">Head Loss h_f <span className="unit">m</span></th>
                <th className="num-col">Velocity v <span className="unit">m/s</span></th>
                <th className="num-col">Reynolds Re</th>
                <th style={{ textAlign: 'center' }}>Flow Direction</th>
              </tr>
            </thead>
            <tbody>
              {finalPipes.map((pipe) => {
                const isSelected = selectedPipeId === pipe.id;
                const flow = parseFloat(pipe.flow) || 0;
                const initFlow = parseFloat(pipe.initialFlow !== undefined ? pipe.initialFlow : 0);
                const isReversed = (initFlow > 0 && flow < 0) || (initFlow < 0 && flow > 0);

                return (
                  <tr
                    key={`res-pipe-${pipe.id}`}
                    className={isSelected ? 'active-row' : ''}
                    onClick={() => onSelectPipe && onSelectPipe(pipe.id)}
                    style={{ cursor: 'pointer' }}
                  >
                    <td style={{ fontWeight: '700', color: '#0369a1' }}>{pipe.id}</td>
                    <td>{pipe.length}</td>
                    <td>{((parseFloat(pipe.diameter) || 0) * 1000).toFixed(0)}</td>
                    <td className="num-col mono-num">{formatNum(pipe.K, 4)}</td>
                    <td className="num-col mono-num" style={{ color: '#64748b' }}>
                      {displayUnit === 'l_s' ? (initFlow * 1000).toFixed(2) : initFlow.toFixed(4)}
                    </td>
                    <td className="num-col mono-num" style={{ fontWeight: '700', color: '#0369a1' }}>
                      {displayUnit === 'l_s' ? (flow * 1000).toFixed(2) : flow.toFixed(4)}
                    </td>
                    <td className="num-col mono-num">{formatHead(pipe.headLoss)}</td>
                    <td className="num-col mono-num" style={{ color: pipe.velocity > 2.5 ? '#b45309' : '#0f172a' }}>
                      {(pipe.velocity || 0).toFixed(2)}
                    </td>
                    <td className="num-col mono-num">{Math.round(pipe.reynolds || 0).toLocaleString()}</td>
                    <td style={{ textAlign: 'center' }}>
                      {isReversed ? (
                        <span className="badge badge-warning" title="Direction reversed during convergence">
                          Reversed (↺)
                        </span>
                      ) : (
                        <span className="badge badge-success">
                          {flow >= 0 ? 'Forward (→)' : 'Reverse (←)'}
                        </span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Visual Charts Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(420px, 1fr))', gap: '1.5rem' }}>
        {/* Flow Distribution Chart */}
        <div className="card" style={{ padding: '1.25rem' }}>
          <div className="card-header">
            <h3>Flow Rate Balancing Comparison</h3>
          </div>
          <div style={{ height: '280px' }}>
            <Bar data={flowChartData} options={chartOptions} />
          </div>
        </div>

        {/* Head Loss Distribution Chart */}
        <div className="card" style={{ padding: '1.25rem' }}>
          <div className="card-header">
            <h3>Pipe Friction Head Loss (h_f)</h3>
          </div>
          <div style={{ height: '280px' }}>
            <Bar data={headLossChartData} options={chartOptions} />
          </div>
        </div>
      </div>

      {/* Convergence Curve Chart */}
      <div className="card" style={{ padding: '1.25rem' }}>
        <div className="card-header">
          <h3>Iterative Convergence Progression</h3>
          <span style={{ fontSize: '0.8rem', color: '#64748b' }}>
            Tracking how the algebraic sum of head losses Σh and flow correction ΔQ approach zero
          </span>
        </div>
        <div style={{ height: '280px' }}>
          <Line data={convergenceChartData} options={dualAxisOptions} />
        </div>
      </div>
    </div>
  );
}
