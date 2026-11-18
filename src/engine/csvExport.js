/**
 * WaterFlow – CSV Export Engine
 * Generates downloadable RFC 4180 compliant CSV files for hydraulic calculations
 */

function downloadCSV(csvContent, filename) {
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);
  link.setAttribute('href', url);
  link.setAttribute('download', filename);
  link.style.visibility = 'hidden';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

/**
 * Export Hardy Cross Final Pipe Results
 */
export function exportHardyCrossPipesCSV(pipes, summaryInfo = {}) {
  const headers = [
    'Pipe ID',
    'Pipe Name',
    'Length (m)',
    'Diameter (m)',
    'Diameter (mm)',
    'Friction Factor f / HW C',
    'K Coefficient',
    'Initial Flow (m3/s)',
    'Initial Flow (L/s)',
    'Final Balanced Flow (m3/s)',
    'Final Balanced Flow (L/s)',
    'Head Loss (m)',
    'Velocity (m/s)',
    'Reynolds Number'
  ];

  const rows = pipes.map(p => {
    const D = parseFloat(p.diameter) || 0;
    const initQ = parseFloat(p.initialFlow !== undefined ? p.initialFlow : 0);
    const finalQ = parseFloat(p.flow) || 0;
    const f_or_c = p.hwC !== undefined ? p.hwC : (p.frictionFactor || '—');

    return [
      `"${p.id || ''}"`,
      `"${p.name || p.id || ''}"`,
      p.length,
      D,
      (D * 1000).toFixed(1),
      f_or_c,
      (p.K || 0).toFixed(4),
      initQ.toFixed(5),
      (initQ * 1000).toFixed(2),
      finalQ.toFixed(5),
      (finalQ * 1000).toFixed(2),
      (p.headLoss || 0).toFixed(4),
      (p.velocity || 0).toFixed(3),
      Math.round(p.reynolds || 0)
    ];
  });

  const meta = [
    ['# WaterFlow - Hardy Cross Calculation Results'],
    [`# Date: ${new Date().toISOString()}`],
    [`# Converged: ${summaryInfo.converged ? 'YES' : 'NO'}`],
    [`# Total Iterations: ${summaryInfo.iterationsCount || 'N/A'}`],
    [`# Total System Head Loss: ${(summaryInfo.totalHeadLoss || 0).toFixed(4)} m`],
    []
  ];

  const csv = meta.map(e => e.join(',')).join('\n') +
              headers.join(',') + '\n' +
              rows.map(r => r.join(',')).join('\n');

  downloadCSV(csv, `waterflow_hardy_cross_results_${Date.now()}.csv`);
}

/**
 * Export Full Hardy Cross Iteration History Table
 */
export function exportHardyCrossIterationsCSV(iterations) {
  const headers = [
    'Iteration',
    'Loop',
    'Pipe ID',
    'Direction (+1 / -1)',
    'K',
    'Q in Loop (m3/s)',
    'Head Loss h (m)',
    'n*h/|Q| (Derivative)',
    'Loop Sum h (m)',
    'Loop Sum Deriv',
    'Delta Q (m3/s)'
  ];

  const rows = [];
  iterations.forEach(iter => {
    iter.loopDetails.forEach(loop => {
      loop.pipesInLoop.forEach(pipe => {
        rows.push([
          iter.iterationNumber,
          `"${loop.loopLabel}"`,
          `"${pipe.pipeId}"`,
          pipe.direction,
          pipe.K.toFixed(4),
          pipe.Q_loop.toFixed(5),
          pipe.h_loop.toFixed(5),
          pipe.deriv.toFixed(4),
          loop.sumH.toFixed(5),
          loop.sumDeriv.toFixed(4),
          loop.deltaQ.toFixed(6)
        ]);
      });
    });
  });

  const headerMeta = [
    '# WaterFlow - Hardy Cross Full Iteration History Table',
    `# Date: ${new Date().toISOString()}`,
    ''
  ].join('\n');

  const csv = headerMeta + headers.join(',') + '\n' + rows.map(r => r.join(',')).join('\n');
  downloadCSV(csv, `waterflow_hardy_cross_iterations_${Date.now()}.csv`);
}

/**
 * Export Equivalent Pipe Results (Series or Parallel)
 */
export function exportEquivalentPipeCSV(result) {
  let csv = '';
  if (result.mode === 'series') {
    csv = [
      '# WaterFlow - Equivalent Pipe Method (Series Pipeline)',
      `# Date: ${new Date().toISOString()}`,
      `# Total Discharge Q: ${result.totalDischarge} m3/s (${(result.totalDischarge * 1000).toFixed(2)} L/s)`,
      `# Equivalent Length Le: ${result.equivalentLength} m`,
      `# Equivalent Diameter De: ${result.equivalentDiameter.toFixed(4)} m (${(result.equivalentDiameter * 1000).toFixed(1)} mm)`,
      `# Equivalent Resistance Ke: ${result.Ke.toFixed(4)}`,
      `# Total Head Loss H: ${result.totalHeadLoss.toFixed(4)} m`,
      '',
      'Pipe Name,Length (m),Diameter (m),Diameter (mm),Friction Factor f,Resistance K,Flow (m3/s),Velocity (m/s),Head Loss (m),Gradient (m/m)'
    ].join('\n') + '\n';

    const rows = result.pipes.map(p => [
      `"${p.name}"`,
      p.length,
      p.diameter,
      (p.diameter * 1000).toFixed(1),
      p.frictionFactor,
      p.K.toFixed(4),
      p.flow.toFixed(4),
      p.velocity.toFixed(3),
      p.headLoss.toFixed(4),
      p.gradient.toFixed(5)
    ].join(','));

    csv += rows.join('\n');
    downloadCSV(csv, `waterflow_equivalent_series_${Date.now()}.csv`);
  } else {
    csv = [
      '# WaterFlow - Equivalent Pipe Method (Parallel Branches)',
      `# Date: ${new Date().toISOString()}`,
      `# Total Discharge Q: ${result.totalDischarge} m3/s (${(result.totalDischarge * 1000).toFixed(2)} L/s)`,
      `# Equivalent Length Le: ${result.equivalentLength} m`,
      `# Equivalent Diameter De: ${result.equivalentDiameter.toFixed(4)} m (${(result.equivalentDiameter * 1000).toFixed(1)} mm)`,
      `# Equivalent Resistance Ke: ${result.Ke.toFixed(4)}`,
      `# Common Head Loss Across Branches h: ${result.commonHeadLoss.toFixed(4)} m`,
      '',
      'Branch Name,Length (m),Diameter (m),Diameter (mm),Friction Factor f,Resistance K,Discharge Q (m3/s),Discharge Q (L/s),Share (%),Velocity (m/s),Branch Head Loss (m)'
    ].join('\n') + '\n';

    const rows = result.branches.map(b => [
      `"${b.name}"`,
      b.length,
      b.diameter,
      (b.diameter * 1000).toFixed(1),
      b.frictionFactor,
      b.K.toFixed(4),
      b.flow.toFixed(5),
      (b.flow * 1000).toFixed(2),
      b.percentage.toFixed(2),
      b.velocity.toFixed(3),
      b.headLoss.toFixed(4)
    ].join(','));

    csv += rows.join('\n');
    downloadCSV(csv, `waterflow_equivalent_parallel_${Date.now()}.csv`);
  }
}
