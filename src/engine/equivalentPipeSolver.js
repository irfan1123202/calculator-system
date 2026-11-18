/**
 * WaterFlow – Equivalent Pipe Method Solver Engine
 *
 * Implements hydraulic calculations for:
 * 1. Pipes in Series (Constant Flow, Additive Head Loss)
 * 2. Pipes in Parallel (Constant Head Loss, Additive Flow)
 */

const G_CONST = 9.80665; // m/s²

/**
 * Calculate Darcy-Weisbach K coefficient
 * h = K * Q^2
 * K = (8 * f * L) / (π² * g * D⁵)
 */
export function getDarcyK(L, D, f, useTextbook12_1 = false) {
  if (useTextbook12_1) {
    return (f * L) / (12.1 * Math.pow(D, 5));
  }
  return (8 * f * L) / (Math.PI * Math.PI * G_CONST * Math.pow(D, 5));
}

/**
 * Solve Pipes in Series
 *
 * Governing relations:
 *   Q_1 = Q_2 = ... = Q_total = Q
 *   H_total = Σ h_i = Σ (K_i * Q^n) = Q^n * Σ K_i
 *   K_e = Σ K_i
 *
 * Dupuit's Equation (assuming constant f):
 *   L_e / D_e⁵ = Σ (L_i / D_i⁵)
 *   D_e = [ L_e / Σ(L_i / D_i⁵) ]^(1/5)
 *
 * @param {Array} pipes - Array of { id, name, length, diameter, frictionFactor }
 * @param {Object} options - { totalDischarge, equivalentLength, targetDiameter, solveFor, fe, useTextbook12_1 }
 * @returns {Object} Solution with equivalent parameters, branch details, and step-by-step formulas
 */
export function solveSeriesPipes(pipes, options = {}) {
  const {
    totalDischarge = 0.05, // m³/s
    equivalentLength = null, // m (if solveFor === 'diameter')
    targetDiameter = null, // m (if solveFor === 'length')
    solveFor = 'diameter', // 'diameter' | 'length'
    fe = 0.02, // Equivalent pipe friction factor
    useTextbook12_1 = false
  } = options;

  const errors = [];
  if (!Array.isArray(pipes) || pipes.length === 0) {
    errors.push('Please add at least one pipe in the series.');
    return { success: false, errors };
  }

  const Q = parseFloat(totalDischarge) || 0;
  if (Q <= 0) {
    errors.push('Total discharge (flow rate) must be greater than zero.');
  }

  let sumL_over_D5 = 0;
  let Ke = 0;
  const pipeDetails = [];
  const formulaSteps = [];

  for (let i = 0; i < pipes.length; i++) {
    const p = pipes[i];
    const L = parseFloat(p.length);
    const D = parseFloat(p.diameter);
    const f = parseFloat(p.frictionFactor) || fe;
    const name = p.name || p.id || `Pipe ${i + 1}`;

    if (isNaN(L) || L <= 0) {
      errors.push(`${name}: Length must be greater than 0.`);
    }
    if (isNaN(D) || D <= 0) {
      errors.push(`${name}: Diameter must be greater than 0.`);
    }

    if (errors.length > 0) continue;

    const Ki = getDarcyK(L, D, f, useTextbook12_1);
    Ke += Ki;

    const termL_D5 = L / Math.pow(D, 5);
    sumL_over_D5 += termL_D5;

    const area = (Math.PI / 4) * Math.pow(D, 2);
    const velocity = area > 0 ? Q / area : 0;
    const headLoss = Ki * Math.pow(Q, 2);
    const gradient = L > 0 ? headLoss / L : 0;

    pipeDetails.push({
      id: p.id || `P-${i + 1}`,
      name,
      length: L,
      diameter: D,
      frictionFactor: f,
      K: Ki,
      termL_D5,
      flow: Q,
      velocity,
      headLoss,
      gradient
    });

    formulaSteps.push({
      pipeName: name,
      L,
      D,
      term: termL_D5,
      K: Ki,
      h: headLoss
    });
  }

  if (errors.length > 0) {
    return { success: false, errors };
  }

  // Calculate equivalent parameters
  let calculatedDe = 0;
  let calculatedLe = 0;
  const f_eq = parseFloat(fe) || 0.02;

  if (solveFor === 'diameter') {
    const Le = parseFloat(equivalentLength) || pipeDetails.reduce((acc, p) => acc + p.length, 0);
    calculatedLe = Le;
    // D_e = [ (8 * f_eq * L_e) / (π² * g * K_e) ]^(1/5)
    // Or if Dupuit (constant f): D_e = [ L_e / sum(L_i / D_i⁵) ]^(0.2)
    calculatedDe = Math.pow(Le / sumL_over_D5, 0.2);
  } else {
    const De = parseFloat(targetDiameter) || 0.3;
    calculatedDe = De;
    calculatedLe = Math.pow(De, 5) * sumL_over_D5;
  }

  const totalHeadLoss = Ke * Math.pow(Q, 2);
  const eqArea = (Math.PI / 4) * Math.pow(calculatedDe, 2);
  const eqVelocity = eqArea > 0 ? Q / eqArea : 0;

  return {
    success: true,
    mode: 'series',
    solveFor,
    totalDischarge: Q,
    Ke,
    equivalentLength: calculatedLe,
    equivalentDiameter: calculatedDe,
    equivalentFrictionFactor: f_eq,
    totalHeadLoss,
    equivalentVelocity: eqVelocity,
    sumL_over_D5,
    pipes: pipeDetails,
    formulaSteps
  };
}

/**
 * Solve Pipes in Parallel
 *
 * Governing relations:
 *   h_1 = h_2 = ... = h_m = h_total = h
 *   Q_total = Σ Q_i
 *
 * Resistance formulation (h = K * Q^n):
 *   1 / K_e^(1/n) = Σ (1 / K_i^(1/n))
 *   K_e = [ Σ (1 / K_i^(1/n)) ]^(-n)
 *
 * For Darcy-Weisbach (n = 2):
 *   1 / √K_e = Σ (1 / √K_i)
 *   K_e = [ Σ (1 / √K_i) ]^(-2)
 *
 * Branch discharge:
 *   Q_i = Q_total * [ (1 / √K_i) / Σ(1 / √K_j) ]
 *   h_i = K_i * Q_i² = K_e * Q_total²
 *
 * @param {Array} pipes - Array of { id, name, length, diameter, frictionFactor }
 * @param {Object} options - { totalDischarge, equivalentLength, fe, useTextbook12_1 }
 * @returns {Object} Solution with equivalent parameters, branch flow distribution, and steps
 */
export function solveParallelPipes(pipes, options = {}) {
  const {
    totalDischarge = 0.1, // m³/s
    equivalentLength = 500, // m
    fe = 0.02,
    useTextbook12_1 = false
  } = options;

  const errors = [];
  if (!Array.isArray(pipes) || pipes.length === 0) {
    errors.push('Please add at least two pipes in parallel.');
    return { success: false, errors };
  }

  if (pipes.length < 2) {
    errors.push('Parallel pipe analysis requires at least 2 parallel branches.');
    return { success: false, errors };
  }

  const Q_total = parseFloat(totalDischarge) || 0;
  if (Q_total <= 0) {
    errors.push('Total discharge (flow rate) must be greater than zero.');
  }

  let sumInvSqrtK = 0;
  const tempBranches = [];

  for (let i = 0; i < pipes.length; i++) {
    const p = pipes[i];
    const L = parseFloat(p.length);
    const D = parseFloat(p.diameter);
    const f = parseFloat(p.frictionFactor) || fe;
    const name = p.name || p.id || `Branch ${i + 1}`;

    if (isNaN(L) || L <= 0) {
      errors.push(`${name}: Length must be greater than 0.`);
    }
    if (isNaN(D) || D <= 0) {
      errors.push(`${name}: Diameter must be greater than 0.`);
    }

    if (errors.length > 0) continue;

    const Ki = getDarcyK(L, D, f, useTextbook12_1);
    const invSqrtK = 1 / Math.sqrt(Ki);
    sumInvSqrtK += invSqrtK;

    tempBranches.push({
      id: p.id || `Branch-${i + 1}`,
      name,
      length: L,
      diameter: D,
      frictionFactor: f,
      K: Ki,
      invSqrtK
    });
  }

  if (errors.length > 0) {
    return { success: false, errors };
  }

  // Equivalent resistance Ke:
  // 1 / √Ke = sum(1 / √Ki)  =>  Ke = 1 / (sumInvSqrtK)²
  const Ke = 1 / Math.pow(sumInvSqrtK, 2);
  const commonHeadLoss = Ke * Math.pow(Q_total, 2);

  // Compute branch flows and check continuity
  let checkSumQ = 0;
  const branches = tempBranches.map(b => {
    const shareFraction = b.invSqrtK / sumInvSqrtK;
    const Qi = Q_total * shareFraction;
    checkSumQ += Qi;

    const area = (Math.PI / 4) * Math.pow(b.diameter, 2);
    const velocity = area > 0 ? Qi / area : 0;
    const branchHeadLoss = b.K * Math.pow(Qi, 2);

    return {
      ...b,
      flow: Qi,
      percentage: shareFraction * 100,
      velocity,
      headLoss: branchHeadLoss
    };
  });

  // Calculate equivalent pipe diameter for chosen equivalentLength Le
  const Le = parseFloat(equivalentLength) || (branches.reduce((a, b) => a + b.length, 0) / branches.length);
  const f_eq = parseFloat(fe) || 0.02;
  // Ke = (8 * fe * Le) / (π² * g * De⁵)  =>  De = [ (8 * fe * Le) / (π² * g * Ke) ]^(1/5)
  let calculatedDe = 0;
  if (useTextbook12_1) {
    calculatedDe = Math.pow((f_eq * Le) / (12.1 * Ke), 0.2);
  } else {
    calculatedDe = Math.pow((8 * f_eq * Le) / (Math.PI * Math.PI * G_CONST * Ke), 0.2);
  }

  const eqArea = (Math.PI / 4) * Math.pow(calculatedDe, 2);
  const eqVelocity = eqArea > 0 ? Q_total / eqArea : 0;

  return {
    success: true,
    mode: 'parallel',
    totalDischarge: Q_total,
    Ke,
    sumInvSqrtK,
    commonHeadLoss,
    equivalentLength: Le,
    equivalentDiameter: calculatedDe,
    equivalentFrictionFactor: f_eq,
    equivalentVelocity: eqVelocity,
    continuityError: Math.abs(checkSumQ - Q_total),
    branches
  };
}
