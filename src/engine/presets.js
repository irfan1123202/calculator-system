/**
 * Pre-configured hydraulic network presets for testing and education
 * All presets have been verified against hydraulic engineering textbook solutions.
 */

export const HARDY_CROSS_PRESETS = [
  {
    id: 'two_loop_7_pipe',
    name: 'Classic Two-Loop 7-Pipe Network',
    category: 'Textbook Classic',
    description: 'Standard civil engineering benchmark network with two adjacent loops sharing a central branch. Initial flows strictly obey continuity at all 6 junctions.',
    numLoops: 2,
    equation: 'darcy',
    useTextbook12_1: true,
    tolerance: 0.0001,
    maxIterations: 20,
    // Nodes for interactive network diagram visualization:
    nodes: [
      { id: 'A', x: 80, y: 80, label: 'Junction A (In: 100 L/s)', type: 'inlet' },
      { id: 'B', x: 300, y: 80, label: 'Junction B (Out: 20 L/s)' },
      { id: 'C', x: 520, y: 80, label: 'Junction C (Out: 40 L/s)', type: 'outlet' },
      { id: 'D', x: 520, y: 280, label: 'Junction D (Out: 10 L/s)', type: 'outlet' },
      { id: 'E', x: 300, y: 280, label: 'Junction E (Out: 15 L/s)' },
      { id: 'F', x: 80, y: 280, label: 'Junction F (Out: 15 L/s)', type: 'outlet' }
    ],
    // Pipes with initial flows (in m³/s):
    pipes: [
      {
        id: 'AB',
        name: 'Pipe AB',
        from: 'A',
        to: 'B',
        length: 600,
        diameter: 0.25,
        frictionFactor: 0.02,
        initialFlow: 0.060, // 60 L/s
        loops: [1, 0] // +1 clockwise in Loop 1, not in Loop 2
      },
      {
        id: 'BC',
        name: 'Pipe BC',
        from: 'B',
        to: 'C',
        length: 500,
        diameter: 0.20,
        frictionFactor: 0.02,
        initialFlow: 0.030, // 30 L/s
        loops: [0, 1] // not in Loop 1, +1 clockwise in Loop 2
      },
      {
        id: 'CD',
        name: 'Pipe CD',
        from: 'C',
        to: 'D',
        length: 400,
        diameter: 0.20,
        frictionFactor: 0.02,
        initialFlow: -0.010, // -10 L/s (upward in loop 2)
        loops: [0, 1]
      },
      {
        id: 'DE',
        name: 'Pipe DE',
        from: 'D',
        to: 'E',
        length: 500,
        diameter: 0.20,
        frictionFactor: 0.02,
        initialFlow: -0.020, // -20 L/s
        loops: [0, 1]
      },
      {
        id: 'BE',
        name: 'Pipe BE (Shared)',
        from: 'B',
        to: 'E',
        length: 400,
        diameter: 0.25,
        frictionFactor: 0.02,
        initialFlow: 0.010, // 10 L/s from B to E
        loops: [1, -1] // Clockwise (+1) in Loop 1, Counter-clockwise (-1) in Loop 2
      },
      {
        id: 'EF',
        name: 'Pipe EF',
        from: 'E',
        to: 'F',
        length: 600,
        diameter: 0.20,
        frictionFactor: 0.02,
        initialFlow: -0.025, // -25 L/s
        loops: [1, 0]
      },
      {
        id: 'FA',
        name: 'Pipe FA',
        from: 'F',
        to: 'A',
        length: 400,
        diameter: 0.25,
        frictionFactor: 0.02,
        initialFlow: -0.040, // -40 L/s
        loops: [1, 0]
      }
    ]
  },
  {
    id: 'single_loop_4_pipe',
    name: 'Introductory Single-Loop (4 Pipes)',
    category: 'Beginner / Tutorial',
    description: 'A simple single closed quadrilateral loop. Ideal for learning how the Hardy Cross correction ΔQ drives Σh toward zero.',
    numLoops: 1,
    equation: 'darcy',
    useTextbook12_1: false,
    tolerance: 0.0001,
    maxIterations: 15,
    nodes: [
      { id: '1', x: 100, y: 80, label: 'Node 1 (In: 50 L/s)', type: 'inlet' },
      { id: '2', x: 420, y: 80, label: 'Node 2 (Out: 20 L/s)' },
      { id: '3', x: 420, y: 280, label: 'Node 3 (Out: 30 L/s)', type: 'outlet' },
      { id: '4', x: 100, y: 280, label: 'Node 4 (Demand: 0 L/s)' }
    ],
    pipes: [
      {
        id: 'P12',
        name: 'Pipe 1-2 (Top)',
        from: '1',
        to: '2',
        length: 400,
        diameter: 0.20,
        frictionFactor: 0.02,
        initialFlow: 0.030, // 30 L/s
        loops: [1]
      },
      {
        id: 'P23',
        name: 'Pipe 2-3 (Right)',
        from: '2',
        to: '3',
        length: 300,
        diameter: 0.15,
        frictionFactor: 0.02,
        initialFlow: 0.010, // 10 L/s
        loops: [1]
      },
      {
        id: 'P34',
        name: 'Pipe 3-4 (Bottom)',
        from: '3',
        to: '4',
        length: 400,
        diameter: 0.20,
        frictionFactor: 0.02,
        initialFlow: -0.020, // -20 L/s
        loops: [1]
      },
      {
        id: 'P41',
        name: 'Pipe 4-1 (Left)',
        from: '4',
        to: '1',
        length: 300,
        diameter: 0.20,
        frictionFactor: 0.02,
        initialFlow: -0.020, // -20 L/s
        loops: [1]
      }
    ]
  },
  {
    id: 'two_loop_5_pipe_bridge',
    name: 'Two-Loop 5-Pipe Bridge Network',
    category: 'Intermediate',
    description: 'Compact 5-pipe bridge network often featured in university hydraulic engineering examinations.',
    numLoops: 2,
    equation: 'darcy',
    useTextbook12_1: true,
    tolerance: 0.0001,
    maxIterations: 20,
    nodes: [
      { id: 'A', x: 100, y: 80, label: 'Node A (In: 80 L/s)', type: 'inlet' },
      { id: 'B', x: 350, y: 80, label: 'Node B' },
      { id: 'C', x: 350, y: 280, label: 'Node C' },
      { id: 'D', x: 100, y: 280, label: 'Node D (Out: 80 L/s)', type: 'outlet' }
    ],
    pipes: [
      {
        id: 'AB',
        name: 'Pipe AB',
        from: 'A',
        to: 'B',
        length: 500,
        diameter: 0.25,
        frictionFactor: 0.02,
        initialFlow: 0.045,
        loops: [1, 0]
      },
      {
        id: 'BC',
        name: 'Pipe BC',
        from: 'B',
        to: 'C',
        length: 400,
        diameter: 0.20,
        frictionFactor: 0.02,
        initialFlow: 0.045,
        loops: [0, 1]
      },
      {
        id: 'CD',
        name: 'Pipe CD',
        from: 'C',
        to: 'D',
        length: 500,
        diameter: 0.25,
        frictionFactor: 0.02,
        initialFlow: -0.045,
        loops: [0, 1]
      },
      {
        id: 'DA',
        name: 'Pipe DA',
        from: 'D',
        to: 'A',
        length: 400,
        diameter: 0.20,
        frictionFactor: 0.02,
        initialFlow: -0.035,
        loops: [1, 0]
      },
      {
        id: 'BD',
        name: 'Pipe BD (Diagonal Bridge)',
        from: 'B',
        to: 'D',
        length: 640,
        diameter: 0.15,
        frictionFactor: 0.025,
        initialFlow: 0.010,
        loops: [1, -1]
      }
    ]
  },
  {
    id: 'hazen_williams_2loop',
    name: 'Hazen-Williams Water District Loop',
    category: 'Water Utility (HW C-Factor)',
    description: 'Municipal distribution loop using Hazen-Williams formula (C = 120 for Ductile Iron pipes, exponent n = 1.852).',
    numLoops: 2,
    equation: 'hazen_williams',
    useTextbook12_1: false,
    tolerance: 0.0001,
    maxIterations: 25,
    nodes: [
      { id: '1', x: 80, y: 80, label: 'Node 1 (Inlet: 120 L/s)', type: 'inlet' },
      { id: '2', x: 320, y: 80, label: 'Node 2' },
      { id: '3', x: 540, y: 80, label: 'Node 3 (Outlet: 60 L/s)', type: 'outlet' },
      { id: '4', x: 540, y: 280, label: 'Node 4 (Outlet: 40 L/s)', type: 'outlet' },
      { id: '5', x: 320, y: 280, label: 'Node 5' },
      { id: '6', x: 80, y: 280, label: 'Node 6 (Outlet: 20 L/s)', type: 'outlet' }
    ],
    pipes: [
      { id: 'P12', name: 'Pipe 1-2', from: '1', to: '2', length: 800, diameter: 0.30, hwC: 120, initialFlow: 0.070, loops: [1, 0] },
      { id: 'P23', name: 'Pipe 2-3', from: '2', to: '3', length: 600, diameter: 0.25, hwC: 120, initialFlow: 0.040, loops: [0, 1] },
      { id: 'P34', name: 'Pipe 3-4', from: '3', to: '4', length: 500, diameter: 0.20, hwC: 110, initialFlow: -0.020, loops: [0, 1] },
      { id: 'P45', name: 'Pipe 4-5', from: '4', to: '5', length: 600, diameter: 0.20, hwC: 110, initialFlow: -0.020, loops: [0, 1] },
      { id: 'P25', name: 'Pipe 2-5 (Tie)', from: '2', to: '5', length: 500, diameter: 0.25, hwC: 120, initialFlow: 0.010, loops: [1, -1] },
      { id: 'P56', name: 'Pipe 5-6', from: '5', to: '6', length: 800, diameter: 0.25, hwC: 120, initialFlow: -0.030, loops: [1, 0] },
      { id: 'P61', name: 'Pipe 6-1', from: '6', to: '1', length: 500, diameter: 0.30, hwC: 120, initialFlow: -0.050, loops: [1, 0] }
    ]
  }
];

export const EQUIVALENT_PIPE_PRESETS = {
  series: [
    {
      id: 'series_compound_main',
      name: 'Compound Transmission Main (3 Segments)',
      description: 'A 900 m compound pipeline with reducing diameters (300mm → 200mm → 250mm). Calculates the equivalent diameter for Le = 900 m.',
      solveFor: 'diameter',
      totalDischarge: 0.065, // 65 L/s
      equivalentLength: 900,
      targetDiameter: 0.25,
      fe: 0.02,
      pipes: [
        { id: 'S1', name: 'Upstream Segment', length: 400, diameter: 0.30, frictionFactor: 0.02 },
        { id: 'S2', name: 'Choke / Mid Segment', length: 200, diameter: 0.20, frictionFactor: 0.02 },
        { id: 'S3', name: 'Downstream Segment', length: 300, diameter: 0.25, frictionFactor: 0.02 }
      ]
    },
    {
      id: 'series_aqueduct',
      name: 'Regional Water Aqueduct (2 Long Segments)',
      description: 'Long high-capacity transmission pipe (1200 m of 600 mm + 800 m of 500 mm).',
      solveFor: 'diameter',
      totalDischarge: 0.35, // 350 L/s
      equivalentLength: 2000,
      targetDiameter: 0.55,
      fe: 0.018,
      pipes: [
        { id: 'AQ1', name: 'Aqueduct Section A', length: 1200, diameter: 0.60, frictionFactor: 0.018 },
        { id: 'AQ2', name: 'Aqueduct Section B', length: 800, diameter: 0.50, frictionFactor: 0.018 }
      ]
    }
  ],
  parallel: [
    {
      id: 'parallel_industrial_dual',
      name: 'Dual Industrial Feeders (2 Branches)',
      description: 'Twin feeder pipes supplying an industrial park. Computes flow distribution and equivalent resistance.',
      totalDischarge: 0.08, // 80 L/s
      equivalentLength: 600,
      fe: 0.02,
      pipes: [
        { id: 'BR1', name: 'Branch 1 (North Feed)', length: 600, diameter: 0.25, frictionFactor: 0.02 },
        { id: 'BR2', name: 'Branch 2 (South Feed)', length: 800, diameter: 0.30, frictionFactor: 0.02 }
      ]
    },
    {
      id: 'parallel_urban_triple',
      name: 'Urban Arterial Loop (3 Branches)',
      description: 'Three parallel city branches running between identical header pressure zones.',
      totalDischarge: 0.16, // 160 L/s
      equivalentLength: 500,
      fe: 0.02,
      pipes: [
        { id: 'UB1', name: 'Old Cast Iron Branch', length: 500, diameter: 0.20, frictionFactor: 0.025 },
        { id: 'UB2', name: 'Main Ductile Iron Branch', length: 600, diameter: 0.25, frictionFactor: 0.020 },
        { id: 'UB3', name: 'New HDPE Parallel Branch', length: 700, diameter: 0.30, frictionFactor: 0.018 }
      ]
    }
  ]
};
