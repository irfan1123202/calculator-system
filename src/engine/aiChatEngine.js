/**
 * WaterFlow – AI Chat & Hydraulic Calculation Engine
 * 
 * Provides:
 * 1. Pre-defined engineering questions and detailed answers
 * 2. Natural language calculation parsing & step-by-step solving:
 *    - Darcy-Weisbach head loss
 *    - Flow velocity & Reynolds number
 *    - Series pipe equivalent diameter (Dupuit's equation)
 *    - Parallel pipe discharge split
 *    - Unit conversions (L/s, m³/s, mm, bar, kPa)
 * 3. Smart offline semantic matching
 * 4. Optional Gemini API integration for open-ended queries
 */

const G = 9.80665; // m/s²
const WATER_KINEMATIC_VISCOSITY_20C = 1.004e-6; // m²/s at 20°C

// ============================================================================
// 1. DEFINED USER QUESTIONS & ANSWERS CATEGORIES
// ============================================================================

export const DEFINED_CATEGORIES = [
  { id: 'all', label: 'All Topics', icon: 'Sparkles' },
  { id: 'calculations', label: 'Calculations', icon: 'Calculator' },
  { id: 'hardy_cross', label: 'Hardy Cross', icon: 'RotateCw' },
  { id: 'equivalent', label: 'Equivalent Pipes', icon: 'GitCommit' },
  { id: 'theory', label: 'Engineering Rules', icon: 'BookOpen' }
];

export const DEFINED_QUESTIONS = [
  // --- CALCULATIONS ---
  {
    id: 'calc_darcy_head_loss',
    category: 'calculations',
    question: 'How to calculate Darcy-Weisbach Head Loss?',
    shortDesc: 'Formula, variables, and step-by-step head loss calculation',
    tags: ['darcy', 'head loss', 'friction', 'hf', 'formula'],
    answer: `### Darcy-Weisbach Head Loss Calculation

The **Darcy-Weisbach equation** is the universally accepted standard for computing frictional energy head loss in pressurized pipe flow:

$$\\mathbf{h_f = f \\cdot \\frac{L}{D} \\cdot \\frac{v^2}{2g} = \\frac{8 f L Q^2}{\\pi^2 g D^5}}$$

In metric textbook form (SI units):
$$\\mathbf{h_f = \\frac{f \\cdot L \\cdot Q^2}{12.1 \\cdot D^5} = K \\cdot Q^2}$$

#### Variables & Units:
- **$h_f$**: Frictional head loss (meters of water, $\\text{m}$)
- **$f$**: Darcy friction factor (dimensionless, typically $0.015 - 0.035$)
- **$L$**: Pipe length ($\\text{m}$)
- **$D$**: Internal pipe diameter ($\\text{m}$)
- **$Q$**: Discharge / volumetric flow rate ($\\text{m}^3/\\text{s}$)
- **$g$**: Gravitational acceleration ($9.807\\,\\text{m/s}^2$)
- **$K$**: Pipe resistance coefficient: $K = \\frac{8 f L}{\\pi^2 g D^5}$

💡 *Tip: You can ask me to compute head loss anytime! E.g. try: \`calculate head loss for L=500m, D=200mm, Q=40 L/s, f=0.02\`*`,
    hasInteractiveTool: 'darcy'
  },
  {
    id: 'calc_velocity_reynolds',
    category: 'calculations',
    question: 'How to calculate Flow Velocity and Reynolds Number?',
    shortDesc: 'Determine velocity, area, and laminar vs turbulent flow regime',
    tags: ['velocity', 'reynolds', 'laminar', 'turbulent', 'regime', 'area'],
    answer: `### Flow Velocity & Reynolds Number Calculation

#### 1. Flow Velocity ($v$):
From the continuity equation $Q = A \\cdot v$:
$$v = \\frac{Q}{A} = \\frac{4 Q}{\\pi D^2}$$

#### 2. Reynolds Number ($Re$):
Identifies the flow regime (inertial vs viscous forces):
$$Re = \\frac{v \\cdot D}{\\nu} = \\frac{4 Q}{\\pi \\cdot D \\cdot \\nu}$$

Where $\\nu$ is kinematic viscosity (for water at $20^\\circ\\text{C}$, $\\nu \\approx 1.004 \\times 10^{-6}\\,\\text{m}^2/\\text{s}$).

#### Flow Regimes:
- **Laminar Flow**: $Re < 2,000$ (smooth, viscous-dominated)
- **Transition Zone**: $2,000 \\le Re \\le 4,000$ (unstable)
- **Turbulent Flow**: $Re > 4,000$ (standard in municipal water networks, typically $10^4 - 10^6$)

💡 *Example: Type \`velocity for Q=50 L/s, D=150mm\` to calculate right away!*`,
    hasInteractiveTool: 'velocity'
  },
  {
    id: 'calc_dupuit_series',
    category: 'calculations',
    question: 'How to calculate Equivalent Diameter for Series Pipes (Dupuit)?',
    shortDesc: 'Combine compound pipeline diameters into one equivalent diameter',
    tags: ['dupuit', 'series', 'equivalent diameter', 'compound pipe'],
    answer: `### Dupuit's Equation for Pipes in Series

When pipes of varying diameters and lengths are joined in series, the flow rate is constant ($Q_1 = Q_2 = Q$) and total head loss is the sum of individual losses ($H_{\\text{total}} = \\sum h_i$).

Assuming a uniform friction factor $f$, **Dupuit's Equation** equates the total resistance:
$$\\mathbf{\\frac{L_e}{D_e^5} = \\frac{L_1}{D_1^5} + \\frac{L_2}{D_2^5} + \\frac{L_3}{D_3^5} + \\dots = \\sum_{i=1}^m \\frac{L_i}{D_i^5}}$$

Solving for **Equivalent Diameter ($D_e$)**:
$$\\mathbf{D_e = \\left[ \\frac{L_e}{\\sum_{i=1}^m \\frac{L_i}{D_i^5}} \\right]^{1/5}}$$

Where:
- $L_e$ = Specified equivalent length (usually chosen as the total length $\\sum L_i$)
- $D_e$ = Equivalent diameter that produces identical head loss at the same flow $Q$.

💡 *You can test this in the **Equivalent Pipe** tab or ask me to compute for your pipe values!*`,
    hasInteractiveTool: 'series'
  },
  {
    id: 'calc_parallel_split',
    category: 'calculations',
    question: 'How do Parallel Pipes split total discharge?',
    shortDesc: 'Equal head loss principle and flow division formula',
    tags: ['parallel', 'split', 'discharge', 'flow division', 'branches'],
    answer: `### Discharge Split in Parallel Pipes

In a parallel pipe system, fluid enters a split junction and rejoins downstream.
- **Head loss across every branch is identical**: $h_1 = h_2 = \\dots = H$
- **Total discharge equals the sum of branch flows**: $Q_{\\text{total}} = \\sum Q_i$

Using the Darcy relation $h = K_i \\cdot Q_i^2$, where $K_i \\propto \\frac{L_i}{D_i^5}$:
$$Q_i = \\sqrt{\\frac{H}{K_i}} = \\text{Conductance}_i \\times \\sqrt{H}$$

The flow through each branch is directly proportional to its conductance $C_i = \\frac{D_i^{2.5}}{\\sqrt{L_i}}$:
$$\\mathbf{Q_i = Q_{\\text{total}} \\cdot \\frac{\\frac{D_i^{2.5}}{\\sqrt{L_i}}}{\\sum_{j=1}^m \\frac{D_j^{2.5}}{\\sqrt{L_j}}}}$$

Larger diameter branches carry significantly more flow ($Q \\propto D^{2.5}$).`,
    hasInteractiveTool: 'parallel'
  },
  {
    id: 'calc_unit_conversions',
    category: 'calculations',
    question: 'How to convert Water Flow, Diameter, and Pressure units?',
    shortDesc: 'Quick conversion formulas for L/s, m³/s, mm, bar, kPa, and m head',
    tags: ['units', 'conversion', 'liters', 'l/s', 'm3/s', 'bar', 'head', 'kpa'],
    answer: `### Essential Hydraulic Engineering Unit Conversions

#### 1. Volumetric Flow Rate ($Q$):
- **$1\\,\\text{m}^3/\\text{s} = 1,000\\,\\text{L/s} = 3,600\\,\\text{m}^3/\\text{h} = 15,850.3\\,\\text{GPM}$**
- $\\text{L/s} \\rightarrow \\text{m}^3/\\text{s}$: Divide by $1,000$ (e.g. $45\\,\\text{L/s} = 0.045\\,\\text{m}^3/\\text{s}$)
- $\\text{m}^3/\\text{h} \\rightarrow \\text{m}^3/\\text{s}$: Divide by $3,600$

#### 2. Pipe Diameter ($D$):
- $\\text{mm} \\rightarrow \\text{m}$: Divide by $1,000$ (e.g. $200\\,\\text{mm} = 0.20\\,\\text{m}$)
- $\\text{Inches} \\rightarrow \\text{m}$: Multiply by $0.0254$ ($8\\,\\text{inches} = 0.2032\\,\\text{m}$)

#### 3. Pressure & Hydraulic Head ($H$):
Under water density $\\rho = 1000\\,\\text{kg/m}^3$:
- **$1\\,\\text{bar} = 100\\,\\text{kPa} \\approx 10.197\\,\\text{meters of water head}$**
- **$1\\,\\text{m water head} \\approx 9.807\\,\\text{kPa} \\approx 0.09807\\,\\text{bar} \\approx 1.422\\,\\text{psi}$**`,
    hasInteractiveTool: 'units'
  },

  // --- HARDY CROSS METHOD ---
  {
    id: 'hc_how_it_works',
    category: 'hardy_cross',
    question: 'How does the Hardy Cross method work?',
    shortDesc: 'Newton-Raphson relaxation of closed pipe loop head losses',
    tags: ['hardy cross', 'algorithm', 'relaxation', 'newton raphson', 'iterations'],
    answer: `### How the Hardy Cross Method Works

The Hardy Cross method (1936) is an iterative numerical algorithm used to analyze flow in closed pipe networks:

1. **Assign Initial Guesses ($Q_0$)**:
   Assume flow rates for each pipe such that **Kirchhoff's Continuity Law ($\\sum Q_{\\text{in}} = \\sum Q_{\\text{out}}$)** is strictly satisfied at every junction node.

2. **Compute Loop Head Loss ($\\sum h$)**:
   For each independent closed loop, compute the sum of signed head losses along the clockwise path:
   $$\\sum h = \\sum r \\cdot Q |Q|^{n-1}$$
   - If the loop is balanced, $\\sum h = 0$.
   - If $\\sum h \\ne 0$, an unbalanced energy head exists.

3. **Calculate Loop Flow Correction ($\\Delta Q$)**:
   Using the first-order Taylor expansion:
   $$\\mathbf{\\Delta Q = -\\frac{\\sum h}{\\sum |n \\cdot h / Q|}}$$

4. **Update Pipe Flows**:
   Apply $\\Delta Q$ to all pipes in the loop. For common pipes shared between two loops, apply corrections from both loops:
   $$Q_{\\text{new}} = Q + \\Delta Q_I - \\Delta Q_{II}$$

5. **Repeat Iteration**:
   Continue until all loop head loss imbalances are smaller than the tolerance $\\varepsilon$ (typically $|\\Delta Q| < 0.0001\\,\\text{m}^3/\\text{s}$).`
  },
  {
    id: 'hc_sign_rule',
    category: 'hardy_cross',
    question: 'What is the Sign Rule (+1 / -1) for loop directions?',
    shortDesc: 'Clockwise (+) vs Anti-clockwise (-) loop traversal conventions',
    tags: ['sign rule', 'clockwise', 'anti-clockwise', 'direction', 'loop sign'],
    answer: `### Hardy Cross Loop Sign Convention

In the Hardy Cross method, each closed loop is traversed in an assumed direction, universally taken as **Clockwise (↻)**:

- **+1 (Clockwise Flow)**:
  If the assumed flow in the pipe moves in the same direction as the clockwise traversal of that loop.
  - Head loss produces a positive value in loop summation: $h = +K \\cdot Q^2$.

- **-1 (Anti-Clockwise Flow)**:
  If the flow opposes the clockwise traversal of that loop.
  - Head loss produces a negative value in loop summation: $h = -K \\cdot Q^2$.

- **0 (Not in Loop)**:
  If the pipe does not form part of that specific loop.

> **Crucial Rule for Shared Pipes:**
> If a pipe is shared between Loop 1 and Loop 2, clockwise flow in Loop 1 travels in the opposite direction when viewed from Loop 2! Hence, if its sign is **+1** in Loop 1, it must be **-1** in Loop 2.`
  },
  {
    id: 'hc_continuity_requirement',
    category: 'hardy_cross',
    question: 'Why must initial flow guesses satisfy node continuity?',
    shortDesc: 'Why ΣQ_in = ΣQ_out at every junction is mandatory from step 0',
    tags: ['continuity', 'node balance', 'initial guess', 'conservation of mass'],
    answer: `### Why Initial Flow Guesses Must Obey Continuity

In the Hardy Cross method, flow corrections $\\Delta Q$ are applied as a **uniform loop circulation**:
- Because $\\Delta Q$ adds to one side of each junction and subtracts from the other, the net change in node inflow and outflow is **identically zero**:
$$\\Delta(\\sum Q_{\\text{in}} - \\sum Q_{\\text{out}}) = 0$$

Therefore:
- **Hardy Cross balances loop energy (head loss), NOT node continuity.**
- If your initial guesses satisfy $\\sum Q_{\\text{in}} = \\sum Q_{\\text{out}}$ at every node, continuity is automatically preserved in all future iterations.
- If your initial flow distribution does **not** balance at every node, the final converged result will **also violate continuity** and be hydraulically invalid!`
  },
  {
    id: 'hc_common_pipes',
    category: 'hardy_cross',
    question: 'How are common (shared) pipes handled between two loops?',
    shortDesc: 'Coupled corrections for pipes situated on the boundary of two loops',
    tags: ['common pipe', 'shared pipe', 'coupled loops', 'boundary pipe'],
    answer: `### Common (Shared) Pipes in Multi-Loop Networks

A pipe on the interior boundary between Loop $A$ and Loop $B$ is influenced by head losses and circulation in both loops simultaneously.

#### Correction Formula for Common Pipe:
If the common pipe has sign $+1$ in Loop $A$ and $-1$ in Loop $B$:
$$\\mathbf{Q_{\\text{updated}} = Q + \\Delta Q_A - \\Delta Q_B}$$

#### Why the Subtraction?
Because a clockwise circulation in Loop $B$ travels in the **reverse** direction through the common pipe compared to a clockwise circulation in Loop $A$.

Our WaterFlow solver computes simultaneous loop corrections across all loops to ensure fast and stable convergence without oscillation!`
  },
  {
    id: 'hc_negative_flow',
    category: 'hardy_cross',
    question: 'What does a negative flow in Hardy Cross results mean?',
    shortDesc: 'Physical meaning of negative flow rate and reverse direction',
    tags: ['negative flow', 'reverse direction', 'flow sign', 'interpretation'],
    answer: `### Understanding Negative Flow in Results

If the final balanced flow of a pipe is negative (e.g. $Q = -0.0125\\,\\text{m}^3/\\text{s}$):
1. **Physical Meaning**: Water is flowing in the **opposite direction** to the arrow initially drawn for that pipe.
2. **Magnitude is Correct**: The flow rate magnitude is $|Q| = 0.0125\\,\\text{m}^3/\\text{s}$ ($12.5\\,\\text{L/s}$).
3. **Completely Normal**: Initial flow directions are only guesses. The Hardy Cross algorithm self-corrects the direction based on energy gradient balance.`
  },
  {
    id: 'hc_darcy_vs_hw',
    category: 'hardy_cross',
    question: 'Darcy-Weisbach (n=2) vs Hazen-Williams (n=1.852): Which to use?',
    shortDesc: 'Comparison between physical theoretical formula and empirical method',
    tags: ['darcy', 'hazen-williams', 'roughness', 'c value', 'exponent n'],
    answer: `### Darcy-Weisbach vs Hazen-Williams

| Feature | Darcy-Weisbach | Hazen-Williams |
| :--- | :--- | :--- |
| **Flow Exponent ($n$)** | $n = 2.0$ | $n = 1.852$ |
| **Physics Basis** | Fundamental fluid mechanics (Newtonian) | Empirical water works data (1902) |
| **Fluid Scope** | Any liquid, any temperature, any viscosity | **Water only** at ambient temperatures ($15-25^\\circ\\text{C}$) |
| **Roughness Parameter** | Friction factor $f$ (or sand roughness $\\varepsilon$) | Roughness coefficient $C$ (e.g., $C=100-140$) |
| **Global Standard** | Preferred globally, in ISO, and academic textbooks | Widely used in US/UK municipal water supply |

In WaterFlow, you can switch between both models in 1 click from the equation selector dropdown!`
  },

  // --- EQUIVALENT PIPES ---
  {
    id: 'eq_when_to_use',
    category: 'equivalent',
    question: 'When to use Equivalent Pipe Method vs Hardy Cross Method?',
    shortDesc: 'Determining when to simplify networks versus solving full loops',
    tags: ['when to use', 'comparison', 'equivalent pipe', 'branched vs looped'],
    answer: `### Equivalent Pipe Method vs Hardy Cross Method

#### Use Equivalent Pipe Method when:
- The network is **tree-like (branched)** without closed interconnected loops.
- You have pipelines in **direct series** (one pipe feeding into another of different size).
- You have dual or triple **parallel pipelines** connected between two common nodes.
- You want to replace a complex sub-branch with a single equivalent diameter ($D_e$) to simplify hand calculation.

#### Use Hardy Cross Method when:
- The distribution network forms **closed grid loops** (municipal ring mains).
- Flow can reach a node through multiple alternative looped paths.
- Nodes have intermediate consumer water withdrawals / demands.`
  },
  {
    id: 'eq_darcy_k_factor',
    category: 'equivalent',
    question: 'What is the Pipe Resistance K factor (h = K * Q²)?',
    shortDesc: 'Physical meaning of hydraulic resistance coefficient K',
    tags: ['k factor', 'resistance', 'darcy k', 'conductance'],
    answer: `### Pipe Resistance Coefficient ($K$)

In the head loss equation $h_f = K \\cdot Q^n$:
- For Darcy-Weisbach ($n=2$):
  $$K = \\frac{8 f L}{\\pi^2 g D^5} \\approx \\frac{f L}{12.1 D^5}$$
- **Units**: $\\text{s}^2 / \\text{m}^5$

#### Key Engineering Insights:
- $K$ represents hydraulic resistance (analogous to electrical resistance $R$ in Ohm's Law $V = I \\cdot R$).
- Notice the **$D^5$ term in the denominator**:
  Halving the pipe diameter increases pipe resistance by $2^5 = 32$ times!
  Doubling the diameter drops head loss by **96.9%** for the same discharge!`
  },

  // --- ENGINEERING RULES & GUIDELINES ---
  {
    id: 'rules_pipe_velocities',
    category: 'theory',
    question: 'What are recommended flow velocities in water supply pipes?',
    shortDesc: 'Civil engineering design limits for velocity to prevent sedimentation and water hammer',
    tags: ['velocity limits', 'design standards', 'scouring', 'water hammer', 'economic velocity'],
    answer: `### Recommended Water Velocity Standards

In civil water supply engineering, pipeline flow velocities must be kept within strict economic and operational boundaries:

| Condition | Velocity Range | Engineering Reason |
| :--- | :--- | :--- |
| **Minimum Velocity (Self-Cleansing)** | $0.6 - 0.9\\,\\text{m/s}$ | Prevents silt, sediment, and biofilm buildup at the pipe bottom |
| **Normal Economic Velocity** | **$1.0 - 2.0\\,\\text{m/s}$** | Optimal balance between pipe capital cost ($D$) and pumping power loss ($h_f$) |
| **Maximum Velocity (Distribution)** | $2.5\\,\\text{m/s}$ | Prevents excessive dynamic head loss and erosion |
| **Maximum Velocity (Pumping Mains)** | $3.0\\,\\text{m/s}$ | Protects against severe **water hammer (transient pressure surges)** and pipe wear |

💡 *WaterFlow alerts you if calculated velocity exceeds $2.5\\,\\text{m/s}$ or falls below $0.6\\,\\text{m/s}$!*`
  },
  {
    id: 'rules_typical_f_values',
    category: 'theory',
    question: 'What are typical friction factors (f) and Hazen-Williams C values?',
    shortDesc: 'Reference values for PVC, Ductile Iron, Cast Iron, and Steel pipes',
    tags: ['friction factor', 'c value', 'materials', 'pvc', 'ductile iron', 'steel'],
    answer: `### Pipe Material Roughness Reference Table

| Pipe Material | Darcy Friction Factor ($f$) | Hazen-Williams ($C$) | Notes |
| :--- | :--- | :--- | :--- |
| **PVC / HDPE / Plastic** | $0.012 - 0.015$ | $140 - 150$ | Very smooth, no corrosion |
| **New Ductile Iron (Cement Lined)** | $0.015 - 0.018$ | $130 - 140$ | Standard municipal water main |
| **New Welded Steel** | $0.016 - 0.020$ | $120 - 130$ | High pressure transmission |
| **Cast Iron (Old / Corroded)** | $0.025 - 0.040$ | $80 - 100$ | Heavily tuberculated older pipes |
| **Concrete / Asbestos Cement** | $0.020 - 0.025$ | $110 - 120$ | Large diameter bulk aqueducts |

*(Higher Hazen-Williams $C$ means smoother pipe with less head loss, whereas higher $f$ means rougher pipe with more loss).*`
  }
];

// ============================================================================
// 2. MATHEMATICAL CALCULATION ENGINES
// ============================================================================

/**
 * Calculate Darcy-Weisbach Head Loss
 */
export function calculateDarcyHeadLoss({ length, diameter, discharge, frictionFactor = 0.02, use12_1 = false }) {
  const L = parseFloat(length);
  const D = parseFloat(diameter); // meters
  const Q = parseFloat(discharge); // m³/s
  const f = parseFloat(frictionFactor) || 0.02;

  if (isNaN(L) || L <= 0) throw new Error('Length (L) must be a positive number in meters.');
  if (isNaN(D) || D <= 0) throw new Error('Diameter (D) must be a positive number in meters.');
  if (isNaN(Q) || Q < 0) throw new Error('Discharge (Q) must be greater than or equal to 0.');

  const area = (Math.PI * Math.pow(D, 2)) / 4;
  const velocity = Q > 0 && area > 0 ? Q / area : 0;
  const velocityHead = (velocity * velocity) / (2 * G);

  const K_exact = (8 * f * L) / (Math.PI * Math.PI * G * Math.pow(D, 5));
  const K_textbook = (f * L) / (12.1 * Math.pow(D, 5));
  const K = use12_1 ? K_textbook : K_exact;

  const hf = K * Math.pow(Q, 2);
  const reynolds = (velocity * D) / WATER_KINEMATIC_VISCOSITY_20C;

  return {
    L,
    D,
    Q,
    f,
    area,
    velocity,
    velocityHead,
    K,
    K_exact,
    K_textbook,
    hf,
    reynolds,
    flowRegime: reynolds > 4000 ? 'Turbulent' : reynolds > 2000 ? 'Transitional' : 'Laminar'
  };
}

/**
 * Calculate Velocity & Reynolds Number
 */
export function calculateVelocityAndReynolds({ discharge, diameter, tempC = 20 }) {
  const Q = parseFloat(discharge); // m³/s
  const D = parseFloat(diameter); // m
  if (isNaN(D) || D <= 0) throw new Error('Diameter (D) must be positive.');
  if (isNaN(Q) || Q < 0) throw new Error('Discharge (Q) must be non-negative.');

  const area = (Math.PI * Math.pow(D, 2)) / 4;
  const velocity = area > 0 ? Q / area : 0;
  
  // Approximate kinematic viscosity variation with temperature
  const nu = WATER_KINEMATIC_VISCOSITY_20C * Math.pow(293.15 / (273.15 + tempC), 1.5);
  const reynolds = (velocity * D) / nu;

  return {
    Q,
    D,
    area,
    velocity,
    reynolds,
    flowRegime: reynolds > 4000 ? 'Turbulent' : reynolds > 2000 ? 'Transitional' : 'Laminar',
    velocityStatus: velocity > 2.5 ? 'High (Risk of water hammer/erosion)' : velocity < 0.6 ? 'Low (Risk of silt deposition)' : 'Optimal (Good economic velocity)'
  };
}

/**
 * Calculate Dupuit Equivalent Diameter for Series Pipes
 */
export function calculateDupuitSeries({ pipes, equivalentLength, fe = 0.02 }) {
  if (!Array.isArray(pipes) || pipes.length === 0) {
    throw new Error('Please supply at least one pipe segment.');
  }

  let sumL_over_D5 = 0;
  let totalLength = 0;
  const details = [];

  for (let i = 0; i < pipes.length; i++) {
    const p = pipes[i];
    const L = parseFloat(p.length);
    const D = parseFloat(p.diameter);
    if (isNaN(L) || L <= 0 || isNaN(D) || D <= 0) {
      throw new Error(`Pipe #${i + 1} has invalid dimensions.`);
    }
    const L_over_D5 = L / Math.pow(D, 5);
    sumL_over_D5 += L_over_D5;
    totalLength += L;
    details.push({
      index: i + 1,
      L,
      D,
      L_over_D5
    });
  }

  const Le = parseFloat(equivalentLength) || totalLength;
  const De = Math.pow(Le / sumL_over_D5, 0.2);
  const Ke = (8 * fe * Le) / (Math.PI * Math.PI * G * Math.pow(De, 5));

  return {
    pipesCount: pipes.length,
    totalLength,
    Le,
    De,
    Ke,
    sumL_over_D5,
    details
  };
}

/**
 * Calculate Parallel Pipe Flow Split
 */
export function calculateParallelSplit({ branches, totalDischarge }) {
  const Q_tot = parseFloat(totalDischarge);
  if (isNaN(Q_tot) || Q_tot <= 0) throw new Error('Total discharge must be positive.');
  if (!Array.isArray(branches) || branches.length < 2) {
    throw new Error('Parallel systems require at least 2 branches.');
  }

  let totalConductance = 0;
  const list = [];

  for (let i = 0; i < branches.length; i++) {
    const b = branches[i];
    const L = parseFloat(b.length);
    const D = parseFloat(b.diameter);
    if (isNaN(L) || L <= 0 || isNaN(D) || D <= 0) {
      throw new Error(`Branch #${i + 1} has invalid length or diameter.`);
    }
    const conductance = Math.pow(D, 2.5) / Math.sqrt(L);
    totalConductance += conductance;
    list.push({ index: i + 1, L, D, conductance });
  }

  const results = list.map(item => {
    const fraction = item.conductance / totalConductance;
    const branchQ = Q_tot * fraction;
    const area = (Math.PI * Math.pow(item.D, 2)) / 4;
    const velocity = branchQ / area;
    return {
      ...item,
      fraction,
      percentage: (fraction * 100).toFixed(1) + '%',
      discharge: branchQ,
      velocity
    };
  });

  return {
    totalDischarge: Q_tot,
    totalConductance,
    branches: results
  };
}

// ============================================================================
// 3. NATURAL LANGUAGE CALCULATION PARSER
// ============================================================================

/**
 * Parse calculation requests from free text like:
 * "calculate head loss for L=500m, D=200mm, Q=40 L/s, f=0.02"
 * "velocity for Q=30 L/s, D=150mm"
 * "convert 75 L/s to m3/s"
 */
export function parseAndCalculateFromText(text) {
  const clean = text.trim();

  // 1. Direct Arithmetic Expression Parser (e.g. "calc: 10 * 5 / 2" or "what is 8 * 0.02 * 1000 / (9.81 * 0.2^5)")
  const mathMatch = clean.match(/^(?:calculate|eval|math|what is|compute)\s*[:=]?\s*([0-9.+\-*/^()\s]+)$/i);
  if (mathMatch && mathMatch[1] && /[0-9]/.test(mathMatch[1]) && /[-+*/^]/.test(mathMatch[1])) {
    try {
      const sanitized = mathMatch[1].replace(/\^/g, '**');
      // safe eval using Function
      const result = new Function(`return (${sanitized});`)();
      if (typeof result === 'number' && !isNaN(result)) {
        return {
          type: 'arithmetic',
          title: 'Direct Arithmetic Calculation',
          resultText: `**Expression:** \`${mathMatch[1].trim()}\`\n\n**Result:** \`${Number(result).toLocaleString('en-US', { maximumFractionDigits: 6 })}\``
        };
      }
    } catch {
      // continue to other parsers
    }
  }

  // 2. Unit Conversion Parser (e.g. "convert 50 L/s to m3/s" or "convert 250 mm to m" or "10 bar to m")
  const unitMatch = clean.match(/(?:convert|how much is)?\s*([0-9.]+)\s*(l\/s|lps|m3\/s|m³\/s|m3\/h|m³\/h|mm|m|km|bar|kpa|psi|ft|inch|inches)\s*(?:in|to|into)\s*(l\/s|lps|m3\/s|m³\/s|m3\/h|m³\/h|mm|m|km|bar|kpa|psi|ft|inch|inches)/i);
  if (unitMatch) {
    const val = parseFloat(unitMatch[1]);
    const from = unitMatch[2].toLowerCase().replace('lps', 'l/s').replace('m³', 'm3');
    const to = unitMatch[3].toLowerCase().replace('lps', 'l/s').replace('m³', 'm3');

    let result = null;
    let explanation = '';

    // Flow conversions
    if ((from === 'l/s' || from === 'm3/s' || from === 'm3/h') && (to === 'l/s' || to === 'm3/s' || to === 'm3/h')) {
      let inM3s = from === 'l/s' ? val / 1000 : from === 'm3/h' ? val / 3600 : val;
      let outVal = to === 'l/s' ? inM3s * 1000 : to === 'm3/h' ? inM3s * 3600 : inM3s;
      result = outVal;
      explanation = `${val} ${from.toUpperCase()} = **${outVal.toFixed(6)} ${to.toUpperCase()}**\n*(Factor: ${from === 'l/s' ? '÷ 1,000 to m³/s' : '× 1,000 to L/s'})*`;
    }
    // Diameter conversions
    else if ((from === 'mm' || from === 'm' || from === 'inch' || from === 'inches') && (to === 'mm' || to === 'm' || to === 'inch' || to === 'inches')) {
      let inMeters = from === 'mm' ? val / 1000 : from.startsWith('inch') ? val * 0.0254 : val;
      let outVal = to === 'mm' ? inMeters * 1000 : to.startsWith('inch') ? inMeters / 0.0254 : inMeters;
      result = outVal;
      explanation = `${val} ${from} = **${outVal.toFixed(4)} ${to}**`;
    }
    // Pressure conversions
    else if ((from === 'bar' || from === 'kpa' || from === 'm' || from === 'psi') && (to === 'bar' || to === 'kpa' || to === 'm' || to === 'psi')) {
      // normalize to water head in meters
      let inHeadM = from === 'bar' ? val * 10.19716 : from === 'kpa' ? val / 9.80665 : from === 'psi' ? val * 0.70307 : val;
      let outVal = to === 'bar' ? inHeadM / 10.19716 : to === 'kpa' ? inHeadM * 9.80665 : to === 'psi' ? inHeadM / 0.70307 : inHeadM;
      result = outVal;
      explanation = `${val} ${from} = **${outVal.toFixed(3)} ${to}** (${outVal.toFixed(3)} ${to === 'm' ? 'm head' : to})`;
    }

    if (result !== null) {
      return {
        type: 'conversion',
        title: 'Unit Conversion Result',
        resultText: `### 🔄 Unit Conversion\n\n${explanation}`
      };
    }
  }

  // 3. Head Loss Parser
  // Matches: "head loss", "darcy", "hf", "pressure drop" with parameters
  if (/(head\s*loss|darcy|hf|pressure\s*drop|friction\s*loss)/i.test(clean) || /(l\s*=\s*\d+|length\s*=\s*\d+)/i.test(clean)) {
    // Extract parameters
    const lMatch = clean.match(/(?:l|length)\s*[:=]\s*([0-9.]+)\s*(?:m|km)?/i);
    const dMatch = clean.match(/(?:d|diameter|dia)\s*[:=]\s*([0-9.]+)\s*(mm|m)?/i);
    const qMatch = clean.match(/(?:q|flow|discharge)\s*[:=]\s*([0-9.]+)\s*(l\/s|lps|m3\/s|m³\/s|m3\/h|m³\/h)?/i);
    const fMatch = clean.match(/(?:f|friction)\s*[:=]\s*([0-9.]+)/i);

    if (lMatch && dMatch && qMatch) {
      let L = parseFloat(lMatch[1]);
      let D = parseFloat(dMatch[1]);
      let Q = parseFloat(qMatch[1]);
      let f = fMatch ? parseFloat(fMatch[1]) : 0.02;

      // Handle unit modifiers
      if (dMatch[2] === 'mm' || (!dMatch[2] && D > 10)) {
        D = D / 1000; // auto-convert mm to m
      }
      if (qMatch[2] === 'l/s' || qMatch[2] === 'lps' || (!qMatch[2] && Q > 5)) {
        Q = Q / 1000; // auto-convert L/s to m³/s
      }

      try {
        const sol = calculateDarcyHeadLoss({ length: L, diameter: D, discharge: Q, frictionFactor: f });
        return {
          type: 'head_loss',
          title: 'Darcy-Weisbach Head Loss Calculation',
          resultText: `### 💧 Darcy-Weisbach Calculation Results

**Given Inputs:**
- **Length ($L$):** $${sol.L.toFixed(1)}\\,\\text{m}$
- **Diameter ($D$):** $${(sol.D * 1000).toFixed(1)}\\,\\text{mm}$ ($${sol.D}\\,\\text{m}$)
- **Discharge ($Q$):** $${(sol.Q * 1000).toFixed(2)}\\,\\text{L/s}$ ($${sol.Q.toFixed(4)}\\,\\text{m}^3/\\text{s}$)
- **Friction Factor ($f$):** $${sol.f}$

**Calculated Values:**
- **Pipe Area ($A$):** $${sol.area.toFixed(4)}\\,\\text{m}^2$
- **Velocity ($v$):** **$${sol.velocity.toFixed(3)}\\,\\text{m/s}$** ${sol.velocity > 2.5 ? '⚠️ *(High)*' : sol.velocity < 0.6 ? '⚠️ *(Low)*' : '✅ *(Optimal)*'}
- **Reynolds Number ($Re$):** $${Math.round(sol.reynolds).toLocaleString()} (${sol.flowRegime})$
- **Resistance ($K$):** $${sol.K_exact.toFixed(2)}\\,\\text{s}^2/\\text{m}^5$
- **Velocity Head ($v^2/2g$):** $${sol.velocityHead.toFixed(3)}\\,\\text{m}$

**Total Frictional Head Loss ($h_f$):**
$$\\mathbf{h_f = K \\cdot Q^2 = ${sol.K_exact.toFixed(2)} \\times (${sol.Q})^2 = ${sol.hf.toFixed(3)}\\,\\text{meters of water}}$$
*(Pressure Drop: $\\Delta P \\approx ${(sol.hf * 9.807).toFixed(2)}\\,\\text{kPa} \\approx ${(sol.hf * 0.09807).toFixed(3)}\\,\\text{bar}$)*`
        };
      } catch (err) {
        return {
          type: 'error',
          title: 'Calculation Error',
          resultText: `⚠️ **Calculation Error:** ${err.message}`
        };
      }
    }
  }

  // 4. Velocity Parser (e.g. "velocity for Q=40 L/s and D=200mm")
  if (/velocity/i.test(clean) && /(?:q|flow)/i.test(clean) && /(?:d|diameter)/i.test(clean)) {
    const dMatch = clean.match(/(?:d|diameter|dia)\s*[:=]\s*([0-9.]+)\s*(mm|m)?/i);
    const qMatch = clean.match(/(?:q|flow|discharge)\s*[:=]\s*([0-9.]+)\s*(l\/s|lps|m3\/s|m³\/s)?/i);

    if (dMatch && qMatch) {
      let D = parseFloat(dMatch[1]);
      let Q = parseFloat(qMatch[1]);
      if (dMatch[2] === 'mm' || (!dMatch[2] && D > 10)) D = D / 1000;
      if (qMatch[2] === 'l/s' || qMatch[2] === 'lps' || (!qMatch[2] && Q > 5)) Q = Q / 1000;

      try {
        const sol = calculateVelocityAndReynolds({ discharge: Q, diameter: D });
        return {
          type: 'velocity',
          title: 'Pipe Flow Velocity Calculation',
          resultText: `### 🌊 Velocity & Flow Regime Result

- **Discharge ($Q$):** $${(sol.Q * 1000).toFixed(2)}\\,\\text{L/s}$ ($${sol.Q.toFixed(4)}\\,\\text{m}^3/\\text{s}$)
- **Diameter ($D$):** $${(sol.D * 1000).toFixed(1)}\\,\\text{mm}$ ($${sol.D}\\,\\text{m}$)
- **Cross-Sectional Area ($A$):** $${sol.area.toFixed(4)}\\,\\text{m}^2$
- **Velocity ($v = Q/A$):** **$${sol.velocity.toFixed(3)}\\,\\text{m/s}$**
- **Reynolds Number ($Re$):** $${Math.round(sol.reynolds).toLocaleString()} (${sol.flowRegime} flow)$
- **Engineering Assessment:** ${sol.velocityStatus}`
        };
      } catch (err) {
        return {
          type: 'error',
          title: 'Calculation Error',
          resultText: `⚠️ **Error:** ${err.message}`
        };
      }
    }
  }

  return null;
}

// ============================================================================
// 4. SEMANTIC / KEYWORD MATCHING FOR DEFINED QUESTIONS
// ============================================================================

export function findBestMatchingQuestion(userQuery) {
  if (!userQuery || userQuery.trim().length === 0) return null;
  const qLower = userQuery.toLowerCase();

  let bestMatch = null;
  let highestScore = 0;

  for (const item of DEFINED_QUESTIONS) {
    let score = 0;
    const titleLower = item.question.toLowerCase();

    // Exact title match
    if (titleLower === qLower) return item;

    // Substring match in title
    if (titleLower.includes(qLower) || qLower.includes(titleLower)) {
      score += 40;
    }

    // Word token matching in title
    const qTokens = qLower.split(/[\s,?.-]+/).filter(w => w.length > 2);
    for (const token of qTokens) {
      if (titleLower.includes(token)) score += 8;
      if (item.shortDesc.toLowerCase().includes(token)) score += 4;
      if (item.tags.some(tag => tag.includes(token) || token.includes(tag))) {
        score += 10;
      }
    }

    if (score > highestScore) {
      highestScore = score;
      bestMatch = item;
    }
  }

  // Threshold score to qualify as a match
  if (highestScore >= 16) {
    return bestMatch;
  }
  return null;
}

// ============================================================================
// 5. MASTER CHAT RESPONSE GENERATOR
// ============================================================================

/**
 * Generate a response for any user query
 */
export async function generateChatResponse(userMessage, options = {}) {
  const { apiKey = '', customContext = '' } = options;
  const trimmed = userMessage.trim();

  // 1. Try Natural Language Hydraulic / Arithmetic calculation
  const calcResult = parseAndCalculateFromText(trimmed);
  if (calcResult) {
    return {
      text: calcResult.resultText,
      source: 'calculation',
      type: calcResult.type,
      suggestedQuestions: getRelatedQuestions('calculations')
    };
  }

  // 2. Check for matching Defined Engineering Question
  const matchedQuestion = findBestMatchingQuestion(trimmed);
  if (matchedQuestion) {
    return {
      text: matchedQuestion.answer,
      source: 'defined_kb',
      matchedId: matchedQuestion.id,
      category: matchedQuestion.category,
      hasInteractiveTool: matchedQuestion.hasInteractiveTool,
      suggestedQuestions: getRelatedQuestions(matchedQuestion.category, matchedQuestion.id)
    };
  }

  // 3. Optional: Call Gemini API if user configured an API Key
  if (apiKey && apiKey.trim().length > 10) {
    try {
      const geminiResponse = await callGeminiAPI(trimmed, apiKey, customContext);
      return {
        text: geminiResponse,
        source: 'gemini_api',
        suggestedQuestions: getRelatedQuestions('all')
      };
    } catch (err) {
      console.warn('Gemini API call failed, falling back to smart engine:', err);
      // Fall through to fallback engine
    }
  }

  // 4. Smart Domain Fallback / General Assistant Response
  return generateDomainFallback(trimmed);
}

/**
 * Get related questions for suggestion chips
 */
export function getRelatedQuestions(category = 'all', excludeId = null, limit = 4) {
  let pool = DEFINED_QUESTIONS;
  if (category && category !== 'all') {
    pool = DEFINED_QUESTIONS.filter(q => q.category === category);
    if (pool.length < 2) pool = DEFINED_QUESTIONS;
  }
  if (excludeId) {
    pool = pool.filter(q => q.id !== excludeId);
  }
  return pool.slice(0, limit);
}

/**
 * Smart Domain Fallback when no direct match or calculation is detected
 */
function generateDomainFallback(query) {
  const q = query.toLowerCase();

  if (q.includes('hello') || q.includes('hi') || q.includes('hey') || q.includes('who are you')) {
    return {
      text: `### 👋 Hello! I am the WaterFlow AI Assistant

I specialize in **hydraulic engineering**, **pipe network analysis**, and **fluid mechanics calculations**.

Here are key things I can do for you:
1. **Instant Hydraulic Calculations**:
   - Ask: \`calculate head loss for L=600m, D=250mm, Q=50 L/s, f=0.02\`
   - Ask: \`velocity for Q=35 L/s, D=150mm\`
   - Ask: \`convert 80 L/s to m3/s\`
2. **Hardy Cross Looped Network Support**:
   - Loop direction sign rules (+1 / -1)
   - Initial flow continuity setup ($\\sum Q = 0$)
   - Common pipe coupling and $\\Delta Q$ iterations
3. **Equivalent Pipe Calculations**:
   - Dupuit's formula for series pipelines
   - Conductance distribution for parallel pipes

Click any of the defined questions below or type your pipeline values to get started!`,
      source: 'assistant_intro',
      suggestedQuestions: DEFINED_QUESTIONS.slice(0, 4)
    };
  }

  if (q.includes('help') || q.includes('how to use') || q.includes('guide')) {
    return {
      text: `### 📚 How to Use WaterFlow

1. **Hardy Cross Tab**: 
   - Enter your pipes with their lengths, diameters, and initial estimated flows $Q_0$.
   - Select loop memberships: **+1** for clockwise flow, **-1** for anti-clockwise flow, **0** if not in loop.
   - Click **"Auto Solve Network"** or step through iteration-by-iteration to observe head relaxation.
2. **Equivalent Pipe Tab**: 
   - Solve series pipes using Dupuit's formula for an equivalent diameter $D_e$.
   - Solve parallel pipelines to find branch discharge splits.
3. **AI Chatbox**: 
   - Click any defined question from the chips at the top, or type your values directly to solve formulas on the fly!`,
      source: 'guide',
      suggestedQuestions: DEFINED_QUESTIONS.slice(0, 4)
    };
  }

  // Default helpful fallback with quick actions
  return {
    text: `I understand you are asking about: *"**${query}**"*.

I am optimized for **pipe network calculations** and **hydraulic theory**. Here are some common ways I can help:

- **Need a calculation?** Try providing parameters:
  \`calculate head loss for L=500m, D=200mm, Q=40 L/s, f=0.02\`
- **Need theory or guidance?** Choose one of our pre-defined engineering questions below!`,
    source: 'fallback',
    suggestedQuestions: DEFINED_QUESTIONS.slice(0, 4)
  };
}

/**
 * Optional Google Gemini API caller
 */
async function callGeminiAPI(userPrompt, apiKey, context = '') {
  const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`;

  const systemInstruction = `You are an expert civil and hydraulic engineering assistant for the WaterFlow web application.
Your expertise is in pipe flow, the Hardy Cross Method, Darcy-Weisbach and Hazen-Williams equations, Equivalent Pipe methods, continuity laws, and municipal water distribution networks.
Always provide mathematically accurate formulas, clear step-by-step solutions, and professional engineering insights. Use markdown and LaTeX math ($...$) where helpful.`;

  const requestBody = {
    contents: [
      {
        role: 'user',
        parts: [
          { text: `${systemInstruction}\n\nContext:\n${context}\n\nUser Question:\n${userPrompt}` }
        ]
      }
    ],
    generationConfig: {
      temperature: 0.2,
      maxOutputTokens: 1000
    }
  };

  const res = await fetch(endpoint, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(requestBody)
  });

  if (!res.ok) {
    const errorText = await res.text();
    throw new Error(`Gemini API error (${res.status}): ${errorText}`);
  }

  const data = await res.json();
  const candidate = data.candidates?.[0]?.content?.parts?.[0]?.text;
  if (!candidate) throw new Error('No text returned by Gemini API');
  return candidate;
}
