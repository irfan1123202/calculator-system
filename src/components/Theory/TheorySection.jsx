import React from 'react';
import { BookOpen, CheckCircle, Scale, Droplet, GitBranch, ShieldCheck } from 'lucide-react';

export default function TheorySection() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem', maxWidth: '1000px', margin: '0 auto' }}>
      {/* Intro Header */}
      <div className="card" style={{ background: 'linear-gradient(135deg, #0c4a6e 0%, #0369a1 100%)', color: 'white', padding: '2rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.75rem' }}>
          <span className="badge" style={{ background: 'rgba(255,255,255,0.2)', color: 'white' }}>
            <BookOpen size={13} /> Hydraulic Engineering Foundations
          </span>
        </div>
        <h1 style={{ color: 'white', fontSize: '2rem', marginBottom: '0.75rem' }}>
          Water Distribution Pipe Network Analysis Theory
        </h1>
        <p style={{ color: '#e0f2fe', fontSize: '1.05rem', lineHeight: '1.6' }}>
          A rigorous educational guide to the Hardy Cross Method and Equivalent Pipe Method, covering governing physical laws, analytical derivations, equations, and civil engineering design best practices.
        </p>
      </div>

      {/* 1. Fundamental Physical Laws */}
      <div className="card">
        <h2 style={{ color: '#0369a1', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Scale size={24} /> 1. Fundamental Governing Physical Laws
        </h2>
        <p style={{ marginBottom: '1rem' }}>
          Any municipal or industrial water distribution pipe network, no matter how complex, must strictly satisfy two fundamental physical conservation principles analogous to Kirchhoff’s circuit laws in electrical engineering:
        </p>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1.25rem' }}>
          <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '8px', padding: '1.25rem' }}>
            <h4 style={{ color: '#0369a1', marginBottom: '0.5rem' }}>
              A. Conservation of Mass (Continuity Law at Nodes)
            </h4>
            <p style={{ fontSize: '0.9rem', marginBottom: '0.75rem' }}>
              Water is an incompressible fluid. Therefore, at every junction (node) in the network, the total volumetric flow rate entering must exactly equal the total volumetric flow rate exiting (including consumer demand):
            </p>
            <div className="formula-block" style={{ padding: '0.75rem 1rem' }}>
              Σ Q_in - Σ Q_out = 0  (at every junction)
            </div>
            <p style={{ fontSize: '0.825rem', color: '#64748b', marginTop: '0.5rem' }}>
              In the Hardy Cross method, the user must provide an initial flow distribution Q₀ that strictly satisfies continuity at all junctions before starting loop relaxation.
            </p>
          </div>

          <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '8px', padding: '1.25rem' }}>
            <h4 style={{ color: '#0369a1', marginBottom: '0.5rem' }}>
              B. Conservation of Energy (Loop Head Loss Law)
            </h4>
            <p style={{ fontSize: '0.9rem', marginBottom: '0.75rem' }}>
              Between any two points in the network, the total change in hydraulic energy head is unique and path-independent. Consequently, traversing around any closed pipe loop and returning to the starting node must result in a net head change of zero:
            </p>
            <div className="formula-block" style={{ padding: '0.75rem 1rem' }}>
              Σ h_i = 0  (around any closed loop)
            </div>
            <p style={{ fontSize: '0.825rem', color: '#64748b', marginTop: '0.5rem' }}>
              Because initial guessed flows Q₀ generally do not balance the loop energies, Σh ≠ 0 initially. The Hardy Cross method iteratively calculates flow adjustments ΔQ to balance the loop heads.
            </p>
          </div>
        </div>
      </div>

      {/* 2. Hardy Cross Derivation */}
      <div className="card">
        <h2 style={{ color: '#0369a1', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Droplet size={24} /> 2. Mathematical Derivation of the Hardy Cross Method
        </h2>
        <p style={{ marginBottom: '1rem' }}>
          The Hardy Cross method was developed in 1936 by Professor Hardy Cross at the University of Illinois. It uses a first-order Taylor series approximation (Newton-Raphson relaxation) to solve the nonlinear loop energy equations.
        </p>

        <div className="formula-block" style={{ marginBottom: '1.25rem' }}>
          <div style={{ color: '#38bdf8', fontWeight: '700', marginBottom: '0.5rem' }}>
            Step-by-Step Derivation:
          </div>
          <div>1. Let the true balanced flow rate in pipe i be: Q_true = Q_i + ΔQ</div>
          <div>Where Q_i is the estimated flow and ΔQ is the loop flow correction (constant for all pipes in the loop to maintain node continuity).</div>
          <div style={{ marginTop: '0.5rem' }}>2. The head-loss relation in pipe i is: h_i = K_i · Q_i |Q_i|^(n - 1)</div>
          <div style={{ marginTop: '0.5rem' }}>3. For the true flow rate, the loop energy condition requires:</div>
          <div style={{ paddingLeft: '1.5rem', color: '#67e8f9', margin: '0.35rem 0' }}>Σ h(Q_i + ΔQ) = 0</div>
          <div>4. Expanding each pipe’s head loss using a Taylor series around Q_i:</div>
          <div style={{ paddingLeft: '1.5rem', margin: '0.35rem 0' }}>h(Q_i + ΔQ) ≈ h(Q_i) + ΔQ · (dh_i / dQ_i)</div>
          <div>5. Substituting back into the loop summation:</div>
          <div style={{ paddingLeft: '1.5rem', margin: '0.35rem 0' }}>Σ h(Q_i) + ΔQ · Σ (dh_i / dQ_i) = 0</div>
          <div>6. Solving for the flow correction ΔQ:</div>
          <div style={{ color: '#38bdf8', fontWeight: '800', fontSize: '1.05rem', margin: '0.5rem 0', padding: '0.5rem', background: 'rgba(2, 132, 199, 0.2)', borderRadius: '6px' }}>
            ΔQ = - [ Σ h_i ] / [ Σ (dh_i / dQ_i) ] = - [ Σ h_i ] / [ Σ (n · K_i · |Q_i|^(n - 1)) ]
          </div>
          <div className="formula-sub">
            Since |h_i| = K_i · |Q_i|^n, the derivative can also be written in the classic form: n · |h_i| / |Q_i|.
          </div>
        </div>

        <h4 style={{ color: '#0f172a', marginBottom: '0.5rem' }}>Common (Shared) Pipes Between Adjacent Loops</h4>
        <p style={{ fontSize: '0.925rem', lineHeight: '1.6' }}>
          When a pipe belongs to two adjacent loops (Loop A and Loop B), both loop corrections act upon it. In our sign convention (where clockwise is positive +1):
        </p>
        <ul style={{ paddingLeft: '1.5rem', fontSize: '0.9rem', color: '#475569', marginTop: '0.5rem' }}>
          <li>If the pipe is clockwise in Loop A and counter-clockwise in Loop B: <strong>Q_new = Q_old + ΔQ_A - ΔQ_B</strong></li>
          <li>If both loops share the same direction sense: <strong>Q_new = Q_old + ΔQ_A + ΔQ_B</strong></li>
        </ul>
      </div>

      {/* 3. Darcy-Weisbach vs Hazen-Williams Comparison */}
      <div className="card">
        <h2 style={{ color: '#0369a1', marginBottom: '1rem' }}>
          3. Head Loss Equations: Darcy-Weisbach vs Hazen-Williams
        </h2>

        <div className="table-responsive">
          <table className="eng-table">
            <thead>
              <tr>
                <th>Feature / Property</th>
                <th>Darcy-Weisbach Equation</th>
                <th>Hazen-Williams Equation</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td style={{ fontWeight: '700' }}>Formulation</td>
                <td className="mono-num">h_f = (f · L / D) · (v² / 2g) = [8fL / (π²gD⁵)] · Q²</td>
                <td className="mono-num">h_f = (10.67 · L · Q^1.852) / (C^1.852 · D^4.87)</td>
              </tr>
              <tr>
                <td style={{ fontWeight: '700' }}>Flow Exponent (n)</td>
                <td><strong>n = 2.0</strong> (Quadratic)</td>
                <td><strong>n = 1.852</strong> (Empirical)</td>
              </tr>
              <tr>
                <td style={{ fontWeight: '700' }}>Resistance Coefficient K</td>
                <td className="mono-num">K = 8fL / (π²gD⁵) ≈ 0.08263 · fL / D⁵</td>
                <td className="mono-num">K = 10.67 · L / (C^1.852 · D^4.87)</td>
              </tr>
              <tr>
                <td style={{ fontWeight: '700' }}>Fluid Compatibility</td>
                <td>Universal (Water, Oil, Gases, Slurries)</td>
                <td>Water only at normal temperatures (10°C – 25°C)</td>
              </tr>
              <tr>
                <td style={{ fontWeight: '700' }}>Friction Parameter</td>
                <td>Dimensionless Darcy friction factor f (0.015 – 0.04)</td>
                <td>Roughness coefficient C (100 = Old Iron, 140 = PVC)</td>
              </tr>
              <tr>
                <td style={{ fontWeight: '700' }}>Theoretical Basis</td>
                <td>Rigorous fluid mechanics & dimensional analysis</td>
                <td>Empirical regression from experimental tests</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* 4. Equivalent Pipe Theory */}
      <div className="card">
        <h2 style={{ color: '#0369a1', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <GitBranch size={24} /> 4. Equivalent Pipe Method Theory
        </h2>
        <p style={{ marginBottom: '1rem' }}>
          An equivalent pipe is an imaginary single uniform pipe that produces the exact same head loss as a compound network when carrying the same discharge.
        </p>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1.25rem' }}>
          <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '8px', padding: '1.25rem' }}>
            <h4 style={{ color: '#0369a1', marginBottom: '0.5rem' }}>Pipes in Series (Dupuit’s Equation)</h4>
            <p style={{ fontSize: '0.9rem', marginBottom: '0.5rem' }}>
              For pipes connected end-to-end, flow is identical (Q₁ = Q₂ = Q) and head losses are cumulative (H = Σ h_i).
            </p>
            <div className="formula-block" style={{ fontSize: '0.85rem', marginBottom: '0.5rem' }}>
              H = K_e · Q² = Σ (K_i · Q²)  ⟹  K_e = Σ K_i<br /><br />
              Assuming constant friction factor f:<br />
              L_e / D_e⁵ = Σ (L_i / D_i⁵)
            </div>
            <p style={{ fontSize: '0.85rem', color: '#475569' }}>
              Solving for equivalent diameter: <strong>D_e = [ L_e / Σ(L_i / D_i⁵) ]^0.2</strong>
            </p>
          </div>

          <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '8px', padding: '1.25rem' }}>
            <h4 style={{ color: '#0369a1', marginBottom: '0.5rem' }}>Pipes in Parallel</h4>
            <p style={{ fontSize: '0.9rem', marginBottom: '0.5rem' }}>
              For pipes connected across common junctions, head loss is identical (h₁ = h₂ = h) and discharges add up (Q_total = Σ Q_i).
            </p>
            <div className="formula-block" style={{ fontSize: '0.85rem', marginBottom: '0.5rem' }}>
              Q_total = Σ √(h / K_i) = √h · Σ (1 / √K_i)<br /><br />
              1 / √K_e = Σ (1 / √K_i)  ⟹  K_e = [ Σ (1 / √K_i) ]⁻²
            </div>
            <p style={{ fontSize: '0.85rem', color: '#475569' }}>
              Branch flow share: <strong>Q_i = Q_total · [ (1 / √K_i) / Σ(1 / √K_j) ]</strong>
            </p>
          </div>
        </div>
      </div>

      {/* 5. Engineering Standards & Design Constraints */}
      <div className="card">
        <h2 style={{ color: '#0369a1', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <ShieldCheck size={24} /> 5. Hydraulic Engineering Guidelines & Standard Practice
        </h2>
        <ul style={{ paddingLeft: '1.5rem', lineHeight: '1.7', fontSize: '0.925rem', color: '#334155' }}>
          <li>
            <strong>Velocity Limits:</strong> Safe distribution pipeline velocities must remain between <strong>0.6 m/s and 2.5 m/s</strong>. Velocities below 0.6 m/s promote sediment deposition and microbial stagnation; velocities above 2.5 m/s cause pipe scouring, excessive friction head loss, and dangerous water hammer surges.
          </li>
          <li>
            <strong>Residual Pressures:</strong> Urban water networks typically require a minimum residual pressure head of <strong>140 to 200 kPa (14 – 20 m of head)</strong> at customer service connections to supply multi-story buildings and fire hydrants.
          </li>
          <li>
            <strong>Convergence Criteria:</strong> In practical computer modeling, iterations are terminated when the maximum loop correction |ΔQ| falls below <strong>0.0001 m³/s (0.1 L/s)</strong> or when loop residual head loss |Σh| is below <strong>0.001 m</strong>.
          </li>
        </ul>
      </div>
    </div>
  );
}
