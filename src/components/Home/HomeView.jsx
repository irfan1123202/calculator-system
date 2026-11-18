import React from 'react';
import {
  Droplet,
  RotateCw,
  GitCommit,
  GitFork,
  ArrowRight,
  BookOpen,
  BarChart3,
  CheckCircle,
  ShieldCheck,
  Download,
  Printer,
  Sparkles,
  Layers
} from 'lucide-react';

export default function HomeView({ onSelectSection, onOpenChat }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '3.5rem' }}>
      {/* Hero Section */}
      <section style={{
        position: 'relative',
        padding: '3rem 0 2rem 0',
        textAlign: 'center'
      }}>
        {/* Decorative Badge */}
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', background: '#e0f2fe', color: '#0369a1', padding: '0.35rem 1rem', borderRadius: '9999px', fontSize: '0.85rem', fontWeight: '700', marginBottom: '1.25rem' }}>
          <Sparkles size={15} /> Educational Hydraulic Engineering Platform
        </div>

        <h1 style={{
          fontSize: '3rem',
          fontWeight: '800',
          color: '#0c4a6e',
          lineHeight: '1.15',
          maxWidth: '850px',
          margin: '0 auto 1.25rem auto',
          letterSpacing: '-0.03em'
        }}>
          WaterFlow – Water Management System Calculator
        </h1>

        <p style={{
          fontSize: '1.15rem',
          color: '#475569',
          maxWidth: '680px',
          margin: '0 auto 2rem auto',
          lineHeight: '1.6'
        }}>
          Calculate, analyze, and visualize municipal water distribution pipe networks using the <strong>Hardy Cross Method</strong> and <strong>Equivalent Pipe Method</strong> with interactive diagrams, step-by-step formulas, and engineering charts.
        </p>

        {/* Action Buttons */}
        <div style={{ display: 'flex', justifyContent: 'center', gap: '1rem', flexWrap: 'wrap' }}>
          <button
            type="button"
            className="btn btn-primary btn-lg"
            onClick={() => onSelectSection('hardy_cross')}
          >
            <RotateCw size={18} /> Launch Hardy Cross Calculator
          </button>
          <button
            type="button"
            className="btn btn-secondary btn-lg"
            onClick={() => onSelectSection('equivalent')}
          >
            <GitCommit size={18} /> Equivalent Pipe Calculator
          </button>
          <button
            type="button"
            className="btn btn-lg"
            style={{
              background: 'linear-gradient(135deg, #0284c7 0%, #06b6d4 100%)',
              color: 'white',
              border: 'none',
              boxShadow: '0 4px 14px rgba(2, 132, 199, 0.35)'
            }}
            onClick={onOpenChat}
          >
            <Sparkles size={18} /> Ask AI Assistant
          </button>
        </div>

        {/* Key Feature Stats Bar */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
          gap: '1rem',
          maxWidth: '860px',
          margin: '3rem auto 0 auto'
        }}>
          <div className="card" style={{ padding: '1rem', textAlign: 'center' }}>
            <div style={{ fontSize: '1.6rem', fontWeight: '800', color: '#0284c7' }}>100%</div>
            <div style={{ fontSize: '0.8rem', color: '#64748b', fontWeight: '600' }}>Verified Engineering Physics</div>
          </div>
          <div className="card" style={{ padding: '1rem', textAlign: 'center' }}>
            <div style={{ fontSize: '1.6rem', fontWeight: '800', color: '#06b6d4' }}>Darcy & HW</div>
            <div style={{ fontSize: '0.8rem', color: '#64748b', fontWeight: '600' }}>Dual Head-Loss Equations</div>
          </div>
          <div className="card" style={{ padding: '1rem', textAlign: 'center' }}>
            <div style={{ fontSize: '1.6rem', fontWeight: '800', color: '#10b981' }}>Interactive</div>
            <div style={{ fontSize: '0.8rem', color: '#64748b', fontWeight: '600' }}>SVG Network Schematics</div>
          </div>
          <div className="card" style={{ padding: '1rem', textAlign: 'center' }}>
            <div style={{ fontSize: '1.6rem', fontWeight: '800', color: '#8b5cf6' }}>AI Assistant</div>
            <div style={{ fontSize: '0.8rem', color: '#64748b', fontWeight: '600' }}>Calculations & FAQs</div>
          </div>
        </div>
      </section>

      {/* Calculator Cards Section */}
      <section>
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <h2 style={{ color: '#0f172a', fontSize: '2rem' }}>Choose Your Hydraulic Calculation Tool</h2>
          <p style={{ color: '#64748b', marginTop: '0.5rem' }}>
            Select either looped network loop balancing or series/parallel pipeline simplification.
          </p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))', gap: '2rem' }}>
          {/* Card 1: Hardy Cross */}
          <div className="card" style={{
            padding: '2rem',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            position: 'relative',
            overflow: 'hidden',
            borderTop: '4px solid #0284c7'
          }}>
            <div>
              <div style={{
                width: '48px',
                height: '48px',
                borderRadius: '12px',
                background: '#e0f2fe',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#0284c7',
                marginBottom: '1.25rem'
              }}>
                <RotateCw size={26} />
              </div>
              <h3 style={{ fontSize: '1.4rem', color: '#0c4a6e', marginBottom: '0.75rem' }}>
                Hardy Cross Looped Network Calculator
              </h3>
              <p style={{ fontSize: '0.925rem', color: '#475569', lineHeight: '1.6', marginBottom: '1.25rem' }}>
                Solve closed water distribution loops by iteratively driving loop head losses (Σh) to zero using Taylor series relaxation. Features signed directional flow, shared branch handling, and interactive vector network diagram.
              </p>
              <ul style={{ paddingLeft: '1.25rem', fontSize: '0.875rem', color: '#475569', lineHeight: '1.7', marginBottom: '1.5rem' }}>
                <li>Darcy-Weisbach (n = 2.0) and Hazen-Williams (n = 1.852)</li>
                <li>Dynamic pipe row additions, duplicate & removal</li>
                <li>Single-step iteration inspection or automatic solve</li>
                <li>Interactive SVG schematic with balanced flow arrows</li>
                <li>Chart.js charts for flow & head loss distribution</li>
              </ul>
            </div>
            <button
              type="button"
              className="btn btn-primary"
              style={{ width: '100%' }}
              onClick={() => onSelectSection('hardy_cross')}
            >
              Open Hardy Cross Calculator <ArrowRight size={16} />
            </button>
          </div>

          {/* Card 2: Equivalent Pipe */}
          <div className="card" style={{
            padding: '2rem',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            position: 'relative',
            overflow: 'hidden',
            borderTop: '4px solid #06b6d4'
          }}>
            <div>
              <div style={{
                width: '48px',
                height: '48px',
                borderRadius: '12px',
                background: '#ecfeff',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#0891b2',
                marginBottom: '1.25rem'
              }}>
                <GitCommit size={26} />
              </div>
              <h3 style={{ fontSize: '1.4rem', color: '#0c4a6e', marginBottom: '0.75rem' }}>
                Equivalent Pipe Calculator (Series & Parallel)
              </h3>
              <p style={{ fontSize: '0.925rem', color: '#475569', lineHeight: '1.6', marginBottom: '1.25rem' }}>
                Simplify complex compound transmission pipelines or multi-branch distribution manifolds into a single hydraulically equivalent uniform diameter pipe.
              </p>
              <ul style={{ paddingLeft: '1.25rem', fontSize: '0.875rem', color: '#475569', lineHeight: '1.7', marginBottom: '1.5rem' }}>
                <li><strong>Pipes in Series:</strong> Dupuit's equation: Le / De⁵ = Σ(Li / Di⁵)</li>
                <li><strong>Pipes in Parallel:</strong> Equivalent resistance: 1/√Ke = Σ(1/√Ki)</li>
                <li>Automatic branch flow share percentage calculation</li>
                <li>Verification of continuity and common head loss</li>
                <li>SVG cross-section & manifold schematics</li>
              </ul>
            </div>
            <button
              type="button"
              className="btn btn-accent"
              style={{ width: '100%' }}
              onClick={() => onSelectSection('equivalent')}
            >
              Open Equivalent Pipe Calculator <ArrowRight size={16} />
            </button>
          </div>
        </div>
      </section>

      {/* Brief Overview of Water Distribution Systems */}
      <section className="card" style={{ padding: '2rem' }}>
        <h2 style={{ color: '#0369a1', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Droplet size={24} /> Understanding Water Distribution Systems
        </h2>
        <p style={{ fontSize: '0.95rem', lineHeight: '1.7', marginBottom: '1rem', color: '#334155' }}>
          Municipal water distribution systems deliver potable water from treatment works and service reservoirs directly to residential consumers, commercial facilities, and fire hydrants. Unlike simple single pipelines, modern distribution networks are laid out as interconnected loops (gridiron systems).
        </p>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.5rem', marginTop: '1.5rem' }}>
          <div style={{ background: '#f8fafc', padding: '1.25rem', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
            <h4 style={{ color: '#0f172a', marginBottom: '0.5rem' }}>Why are networks looped?</h4>
            <p style={{ fontSize: '0.875rem', color: '#475569' }}>
              Looped systems ensure security of supply: if a burst occurs on one main, isolating valves can close it off while water continues flowing to customers around the other branch of the loop. They also prevent dead ends and water stagnation.
            </p>
          </div>
          <div style={{ background: '#f8fafc', padding: '1.25rem', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
            <h4 style={{ color: '#0f172a', marginBottom: '0.5rem' }}>Why are calculations needed?</h4>
            <p style={{ fontSize: '0.875rem', color: '#475569' }}>
              Because head loss depends non-linearly on flow (h ∝ Q² or Q^1.852), one cannot solve looped networks using simple linear algebra. The Hardy Cross method provides an elegant numerical algorithm to find the exact flow and head loss in every pipe.
            </p>
          </div>
          <div style={{ background: '#f8fafc', padding: '1.25rem', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
            <h4 style={{ color: '#0f172a', marginBottom: '0.5rem' }}>Why use equivalent pipes?</h4>
            <p style={{ fontSize: '0.875rem', color: '#475569' }}>
              Before computer modeling, calculating compound pipelines of varying diameters was tedious. The equivalent pipe method replaces compound or parallel sections with an equivalent diameter De, drastically simplifying manual calculations.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
