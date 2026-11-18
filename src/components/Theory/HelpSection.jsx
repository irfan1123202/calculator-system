import React from 'react';
import { HelpCircle, CheckCircle2, AlertTriangle, ArrowRight, Layers, RotateCw } from 'lucide-react';

export default function HelpSection() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.75rem', maxWidth: '1000px', margin: '0 auto' }}>
      {/* Header */}
      <div className="card" style={{ background: 'linear-gradient(135deg, #0284c7 0%, #06b6d4 100%)', color: 'white', padding: '1.75rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
          <span className="badge" style={{ background: 'rgba(255,255,255,0.2)', color: 'white' }}>
            <HelpCircle size={13} /> User Guide & Documentation
          </span>
        </div>
        <h1 style={{ color: 'white', fontSize: '1.85rem' }}>
          How to Enter Data & Configure Hydraulic Calculations
        </h1>
        <p style={{ color: '#ecfeff', marginTop: '0.5rem', fontSize: '0.95rem' }}>
          A clear user tutorial for engineering students on assigning loop directions, setting initial flow guesses, and interpreting calculation results.
        </p>
      </div>

      {/* Guide 1: Hardy Cross Data Entry */}
      <div className="card" style={{ padding: '1.5rem' }}>
        <h2 style={{ color: '#0369a1', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <RotateCw size={22} /> 1. Entering Data into the Hardy Cross Calculator
        </h2>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          <div style={{ display: 'flex', gap: '1rem', alignItems: 'flex-start' }}>
            <div style={{ background: '#0284c7', color: 'white', width: '28px', height: '28px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: '800', flexShrink: 0 }}>
              1
            </div>
            <div>
              <h4 style={{ color: '#0f172a', marginBottom: '0.25rem' }}>Choose Number of Closed Loops & Equation</h4>
              <p style={{ fontSize: '0.9rem', color: '#475569' }}>
                Set the number of independent closed loops (e.g., 2 loops). Select either <strong>Darcy-Weisbach (n=2)</strong> or <strong>Hazen-Williams (n=1.852)</strong> depending on your assignment or regional practice.
              </p>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '1rem', alignItems: 'flex-start' }}>
            <div style={{ background: '#0284c7', color: 'white', width: '28px', height: '28px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: '800', flexShrink: 0 }}>
              2
            </div>
            <div>
              <h4 style={{ color: '#0f172a', marginBottom: '0.25rem' }}>Assign Loop Directions (Sign Rule)</h4>
              <p style={{ fontSize: '0.9rem', color: '#475569', marginBottom: '0.5rem' }}>
                By standard convention, <strong>clockwise flow around a loop is considered positive (+1)</strong> and counter-clockwise flow is negative (-1):
              </p>
              <ul style={{ paddingLeft: '1.25rem', fontSize: '0.875rem', color: '#475569' }}>
                <li>Select <strong>+1 Clockwise (↻)</strong> if traversing the loop in a clockwise circle follows the primary direction of the pipe.</li>
                <li>Select <strong>-1 Anti-Clockwise (↺)</strong> if traversing clockwise opposes the pipe's primary direction.</li>
                <li>Select <strong>0 (Not in Loop)</strong> if the pipe is not on the perimeter or interior of that loop.</li>
              </ul>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '1rem', alignItems: 'flex-start' }}>
            <div style={{ background: '#0284c7', color: 'white', width: '28px', height: '28px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: '800', flexShrink: 0 }}>
              3
            </div>
            <div>
              <h4 style={{ color: '#0f172a', marginBottom: '0.25rem' }}>Enter Initial Flow Guesses (Q₀) that Obey Continuity</h4>
              <p style={{ fontSize: '0.9rem', color: '#475569' }}>
                The Hardy Cross method requires an initial guess for the flow in each pipe. Make sure your guessed flow rates strictly satisfy <strong>ΣQ_in = ΣQ_out</strong> at every node. If continuity is not satisfied at the start, the balanced results will also violate junction continuity!
              </p>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '1rem', alignItems: 'flex-start' }}>
            <div style={{ background: '#0284c7', color: 'white', width: '28px', height: '28px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: '800', flexShrink: 0 }}>
              4
            </div>
            <div>
              <h4 style={{ color: '#0f172a', marginBottom: '0.25rem' }}>Solve Automatically or Step Iteration-by-Iteration</h4>
              <p style={{ fontSize: '0.9rem', color: '#475569' }}>
                Click <strong>"Auto Solve Network"</strong> to immediately balance the system to within tolerance (ε = 0.0001). Or click <strong>"Next Iteration (Step)"</strong> to observe the relaxation process step-by-step for educational study.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Guide 2: Common Questions & Troubleshooting */}
      <div className="card" style={{ padding: '1.5rem' }}>
        <h2 style={{ color: '#0369a1', marginBottom: '1rem' }}>
          Frequently Asked Questions & Troubleshooting
        </h2>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '8px', padding: '1rem' }}>
            <h4 style={{ color: '#0f172a', fontSize: '0.95rem', marginBottom: '0.35rem' }}>
              Q: What happens if flow through a pipe becomes zero?
            </h4>
            <p style={{ fontSize: '0.875rem', color: '#475569' }}>
              In the analytical formula, the derivative term is n·|h|/|Q|. When Q approaches zero, direct division by |Q| causes a division-by-zero (NaN/Infinity) crash. WaterFlow safely evaluates the derivative using <code>n·K·|Q|^(n-1)</code>, allowing seamless handling of zero-flow stagnation points.
            </p>
          </div>

          <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '8px', padding: '1rem' }}>
            <h4 style={{ color: '#0f172a', fontSize: '0.95rem', marginBottom: '0.35rem' }}>
              Q: What if the balanced flow has a negative sign in the final results?
            </h4>
            <p style={{ fontSize: '0.875rem', color: '#475569' }}>
              A negative flow rate in the final results simply means that water actually travels in the <strong>opposite direction</strong> to your initial guess. The magnitude of the flow rate is still correct, and WaterFlow displays a "Reversed (↺)" badge on the diagram and table.
            </p>
          </div>

          <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '8px', padding: '1rem' }}>
            <h4 style={{ color: '#0f172a', fontSize: '0.95rem', marginBottom: '0.35rem' }}>
              Q: Why is velocity between 0.6 and 2.5 m/s recommended?
            </h4>
            <p style={{ fontSize: '0.875rem', color: '#475569' }}>
              Below 0.6 m/s, suspended particulates in water settle down and form silt deposits. Above 2.5 m/s, high shear stress causes internal pipe abrasion, excessive pumping costs, and high surge pressures if valves close abruptly.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
