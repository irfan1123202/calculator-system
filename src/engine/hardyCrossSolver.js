/**
 * WaterFlow – Hardy Cross Hydraulic Solver Engine
 *
 * Implements the iterative Hardy Cross method for pipe network loop analysis.
 * Supports:
 * - Darcy-Weisbach equation (n = 2)
 * - Hazen-Williams equation (n = 1.852)
 * - Direct resistance coefficient K input
 *
 * Formula:
 *   ΔQ = - Σh / Σ(n * |h| / |Q|)
 *   Where:
 *     h = sign(Q) * K * |Q|^n
 *     n * |h| / |Q| = n * K * |Q|^(n-1)  (safe for zero flow)
 */

export const EQUATIONS = {
  DARCY: 'darcy',
  HAZEN_WILLIAMS: 'hazen_williams',
  DIRECT_K: 'direct_k'
};

const G_CONST = 9.80665; // Standard acceleration due to gravity, m/s²
const WATER_VISCOSITY_20C = 1.004e-6; // Kinematic viscosity of water at 20°C, m²/s

/**
 * Calculates hydraulic resistance coefficient K based on pipe properties and equation
 * @param {Object} pipe - Pipe properties { length, diameter, frictionFactor, hwC, customK }
 * @param {string} equation - Equation type ('darcy', 'hazen_williams', 'direct_k')
 * @param {boolean} useTextbook12_1 - If true, uses f*L/(12.1*D^5), else exact (8*f*L)/(pi^2*g*D^5)
 * @returns {number} K
 */
export function calculateK(pipe, equation = EQUATIONS.DARCY, useTextbook12_1 = false) {
  if (equation === EQUATIONS.DIRECT_K) {
    return parseFloat(pipe.customK) || 1.0;
  }

  const L = parseFloat(pipe.length);
  const D = parseFloat(pipe.diameter);

  if (!L || L <= 0 || !D || D <= 0) return 0;

  if (equation === EQUATIONS.DARCY) {
    const f = parseFloat(pipe.frictionFactor) || 0.02;
    if (useTextbook12_1) {
      // Textbook approximation: h = (f * L * Q^2) / (12.1 * D^5)
      return (f * L) / (12.1 * Math.pow(D, 5));
    } else {
      // Exact analytical SI formula: K = (8 * f * L) / (π² * g * D⁵)
      const numerator = 8 * f * L;
      const denominator = Math.PI * Math.PI * G_CONST * Math.pow(D, 5);
      return numerator / denominator;
    }
  }

  if (equation === EQUATIONS.HAZEN_WILLIAMS) {
    const C = parseFloat(pipe.hwC) || 100;
    // SI formula: h = (10.67 * L * Q^1.852) / (C^1.852 * D^4.87)
    const numerator = 10.67 * L;
    const denominator = Math.pow(C, 1.852) * Math.pow(D, 4.87);
    return numerator / denominator;
  }

  return 1.0;
}

/**
 * Get exponent n for the selected equation
 */
export function getExponent(equation = EQUATIONS.DARCY) {
  if (equation === EQUATIONS.HAZEN_WILLIAMS) return 1.852;
  return 2.0; // Darcy-Weisbach or standard quadratic
}

/**
 * Validates pipe network data before solving
 * @param {Array} pipes
 * @param {number} numLoops
 * @returns {Object} { isValid, errors, warnings }
 */
export function validateNetwork(pipes, numLoops = 2) {
  const errors = [];
  const warnings = [];

  if (!Array.isArray(pipes) || pipes.length === 0) {
    errors.push('No pipes defined in the network.');
    return { isValid: false, errors, warnings };
  }

  const loopPipeCounts = Array(numLoops).fill(0);
  const pipeIds = new Set();

  pipes.forEach((p, idx) => {
    const id = p.id || `Pipe-${idx + 1}`;
    if (pipeIds.has(id)) {
      errors.push(`Duplicate Pipe ID: "${id}". Each pipe must have a unique identifier.`);
    }
    pipeIds.add(id);

    if (p.length !== undefined && (isNaN(p.length) || Number(p.length) <= 0)) {
      errors.push(`Pipe "${id}": Length must be greater than zero.`);
    }
    if (p.diameter !== undefined && (isNaN(p.diameter) || Number(p.diameter) <= 0)) {
      errors.push(`Pipe "${id}": Diameter must be greater than zero.`);
    }
    if (p.frictionFactor !== undefined && (isNaN(p.frictionFactor) || Number(p.frictionFactor) <= 0 || Number(p.frictionFactor) > 0.2)) {
      warnings.push(`Pipe "${id}": Darcy friction factor f (${p.frictionFactor}) is outside typical range (0.008 – 0.08).`);
    }

    // Check loop membership
    let inAnyLoop = false;
    for (let l = 0; l < numLoops; l++) {
      const dir = p.loops && p.loops[l];
      if (dir === 1 || dir === -1) {
        loopPipeCounts[l]++;
        inAnyLoop = true;
      }
    }
    if (!inAnyLoop) {
      warnings.push(`Pipe "${id}" is not assigned to any loop (flow won't be corrected by loops).`);
    }
  });

  loopPipeCounts.forEach((count, lIdx) => {
    if (count < 2) {
      errors.push(`Loop ${lIdx + 1} has only ${count} pipe(s). A closed hydraulic loop requires at least 2 connected pipes.`);
    }
  });

  return {
    isValid: errors.length === 0,
    errors,
    warnings
  };
}

/**
 * Execute one iteration of Hardy Cross loop balancing
 *
 * @param {Array} currentPipes - Array of pipe objects with current flow 'flow'
 * @param {Object} config - { numLoops, equation, useTextbook12_1, n }
 * @returns {Object} iteration result with per-loop details, updated flows, and residuals
 */
export function executeHardyCrossIteration(currentPipes, config) {
  const { numLoops = 2, equation = EQUATIONS.DARCY, useTextbook12_1 = false } = config;
  const n = getExponent(equation);

  // Initialize loop accumulators
  const loopDetails = Array.from({ length: numLoops }, (_, lIdx) => ({
    loopIndex: lIdx,
    loopLabel: `Loop ${lIdx + 1}`,
    pipesInLoop: [],
    sumH: 0,
    sumDeriv: 0,
    deltaQ: 0
  }));

  // Calculate head loss and derivative term for each pipe in each loop
  currentPipes.forEach(pipe => {
    const K = calculateK(pipe, equation, useTextbook12_1);
    const Q_primary = parseFloat(pipe.flow) || 0;

    for (let l = 0; l < numLoops; l++) {
      const dir = (pipe.loops && pipe.loops[l]) || 0; // +1, -1, or 0
      if (dir === 0) continue;

      // Flow in this loop's clockwise orientation:
      const Q_loop = Q_primary * dir;
      const absQ = Math.abs(Q_loop);
      const signQ = Q_loop >= 0 ? 1 : -1;

      // Signed head loss in clockwise loop sense:
      // h = sign(Q) * K * |Q|^n
      const h_loop = signQ * K * Math.pow(absQ, n);

      // Derivative d(h)/dQ:
      // For absQ > 0: n * |h| / |Q| = n * K * |Q|^(n - 1)
      // When absQ is very close to zero, evaluate n * K * |Q|^(n-1) to avoid divide-by-zero
      let deriv = 0;
      if (absQ > 1e-12) {
        deriv = n * K * Math.pow(absQ, n - 1);
      } else {
        deriv = 0;
      }

      loopDetails[l].pipesInLoop.push({
        pipeId: pipe.id,
        pipeName: pipe.name || pipe.id,
        direction: dir,
        K,
        Q_primary,
        Q_loop,
        absQ,
        h_loop,
        deriv,
        length: pipe.length,
        diameter: pipe.diameter
      });

      loopDetails[l].sumH += h_loop;
      loopDetails[l].sumDeriv += deriv;
    }
  });

  // Calculate flow correction ΔQ for each loop:
  // ΔQ = - (Σh) / (Σ derivative)
  let maxDeltaQ = 0;
  let maxResidualHead = 0;

  loopDetails.forEach(loop => {
    if (Math.abs(loop.sumDeriv) > 1e-12) {
      loop.deltaQ = -loop.sumH / loop.sumDeriv;
    } else {
      loop.deltaQ = 0;
    }
    const absDelta = Math.abs(loop.deltaQ);
    const absSumH = Math.abs(loop.sumH);
    if (absDelta > maxDeltaQ) maxDeltaQ = absDelta;
    if (absSumH > maxResidualHead) maxResidualHead = absSumH;
  });

  // Update pipe flows:
  // For each pipe, apply loop corrections.
  // ΔQ_net_primary = Σ_l (ΔQ_l * dir_l)
  const updatedPipes = currentPipes.map(pipe => {
    let deltaQ_applied = 0;
    for (let l = 0; l < numLoops; l++) {
      const dir = (pipe.loops && pipe.loops[l]) || 0;
      if (dir !== 0) {
        deltaQ_applied += loopDetails[l].deltaQ * dir;
      }
    }

    const oldFlow = parseFloat(pipe.flow) || 0;
    const newFlow = oldFlow + deltaQ_applied;
    const K = calculateK(pipe, equation, useTextbook12_1);
    const D = parseFloat(pipe.diameter) || 0.1;
    const area = (Math.PI / 4) * Math.pow(D, 2);
    const velocity = area > 0 ? Math.abs(newFlow) / area : 0;
    const headLoss = K * Math.pow(Math.abs(newFlow), n);
    const reynolds = (velocity * D) / WATER_VISCOSITY_20C;

    return {
      ...pipe,
      flow: newFlow,
      deltaQ: deltaQ_applied,
      previousFlow: oldFlow,
      headLoss,
      velocity,
      reynolds,
      K
    };
  });

  return {
    loopDetails,
    updatedPipes,
    maxDeltaQ,
    maxResidualHead
  };
}

/**
 * Solves the complete Hardy Cross network until convergence or max iterations
 *
 * @param {Array} initialPipes
 * @param {Object} options
 * @returns {Object} Full solution with iteration history, final pipes, and summary
 */
export function solveHardyCross(initialPipes, options = {}) {
  const {
    numLoops = 2,
    equation = EQUATIONS.DARCY,
    useTextbook12_1 = false,
    tolerance = 0.0001,
    maxIterations = 30
  } = options;

  const validation = validateNetwork(initialPipes, numLoops);
  if (!validation.isValid) {
    return {
      success: false,
      validation,
      iterations: [],
      finalPipes: initialPipes,
      message: 'Network validation failed. Check pipe parameters and loop assignments.'
    };
  }

  let currentPipes = initialPipes.map(p => ({
    ...p,
    flow: parseFloat(p.initialFlow !== undefined ? p.initialFlow : p.flow) || 0
  }));

  const iterationHistory = [];
  let converged = false;
  let finalIterationCount = 0;

  for (let iter = 1; iter <= maxIterations; iter++) {
    const iterResult = executeHardyCrossIteration(currentPipes, {
      numLoops,
      equation,
      useTextbook12_1
    });

    iterationHistory.push({
      iterationNumber: iter,
      loopDetails: iterResult.loopDetails,
      pipesSnapshot: currentPipes.map(p => ({ ...p })),
      updatedPipes: iterResult.updatedPipes.map(p => ({ ...p })),
      maxDeltaQ: iterResult.maxDeltaQ,
      maxResidualHead: iterResult.maxResidualHead
    });

    currentPipes = iterResult.updatedPipes;
    finalIterationCount = iter;

    // Check convergence: flow corrections sufficiently small OR residual loop head sufficiently small
    if (iterResult.maxDeltaQ < tolerance || iterResult.maxResidualHead < tolerance) {
      converged = true;
      break;
    }
  }

  // Calculate final summary statistics
  const totalHeadLoss = currentPipes.reduce((acc, p) => acc + (p.headLoss || 0), 0);
  const maxVelocity = Math.max(...currentPipes.map(p => p.velocity || 0));

  return {
    success: true,
    converged,
    iterationsCount: finalIterationCount,
    maxIterations,
    tolerance,
    equation,
    iterations: iterationHistory,
    finalPipes: currentPipes,
    totalHeadLoss,
    maxVelocity,
    validation
  };
}
