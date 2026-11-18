import React from 'react';
import { Droplet, Heart, Shield, BookOpen } from 'lucide-react';

export default function Footer({ onSelectSection, onOpenAbout, onOpenChat }) {
  return (
    <footer className="footer no-print" style={{
      marginTop: 'auto',
      background: '#ffffff',
      borderTop: '1px solid #e2e8f0',
      padding: '2.5rem 0 1.5rem 0'
    }}>
      <div className="container">
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
          gap: '2rem',
          paddingBottom: '2rem',
          borderBottom: '1px solid #f1f5f9'
        }}>
          {/* Brand Info */}
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.75rem' }}>
              <div style={{
                width: '32px',
                height: '32px',
                borderRadius: '8px',
                background: 'linear-gradient(135deg, #0284c7, #06b6d4)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'white'
              }}>
                <Droplet size={18} fill="currentColor" />
              </div>
              <span style={{ fontSize: '1.2rem', fontWeight: '800', color: '#0c4a6e' }}>
                WaterFlow
              </span>
            </div>
            <p style={{ fontSize: '0.85rem', color: '#64748b', lineHeight: '1.6' }}>
              Educational hydraulic engineering platform for calculating water distribution pipe networks using the Hardy Cross Method and Equivalent Pipe Method.
            </p>
          </div>

          {/* Quick Calculators */}
          <div>
            <h4 style={{ fontSize: '0.9rem', color: '#0f172a', marginBottom: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Calculators
            </h4>
            <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '0.5rem', fontSize: '0.875rem' }}>
              <li>
                <button
                  type="button"
                  style={{ background: 'none', border: 'none', color: '#64748b', cursor: 'pointer', padding: 0 }}
                  onClick={() => onSelectSection('hardy_cross')}
                >
                  Hardy Cross Looped Network Solver
                </button>
              </li>
              <li>
                <button
                  type="button"
                  style={{ background: 'none', border: 'none', color: '#64748b', cursor: 'pointer', padding: 0 }}
                  onClick={() => onSelectSection('equivalent')}
                >
                  Equivalent Pipes in Series (Dupuit)
                </button>
              </li>
              <li>
                <button
                  type="button"
                  style={{ background: 'none', border: 'none', color: '#64748b', cursor: 'pointer', padding: 0 }}
                  onClick={() => onSelectSection('equivalent')}
                >
                  Equivalent Pipes in Parallel
                </button>
              </li>
              <li>
                <button
                  type="button"
                  style={{ background: 'none', border: 'none', color: '#0284c7', cursor: 'pointer', padding: 0, fontWeight: '600' }}
                  onClick={onOpenChat}
                >
                  ✨ AI Calculation Chatbox
                </button>
              </li>
            </ul>
          </div>

          {/* Educational Resources */}
          <div>
            <h4 style={{ fontSize: '0.9rem', color: '#0f172a', marginBottom: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Learning & Theory
            </h4>
            <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '0.5rem', fontSize: '0.875rem' }}>
              <li>
                <button
                  type="button"
                  style={{ background: 'none', border: 'none', color: '#64748b', cursor: 'pointer', padding: 0 }}
                  onClick={() => onSelectSection('theory')}
                >
                  Continuity & Energy Conservation
                </button>
              </li>
              <li>
                <button
                  type="button"
                  style={{ background: 'none', border: 'none', color: '#64748b', cursor: 'pointer', padding: 0 }}
                  onClick={() => onSelectSection('theory')}
                >
                  Darcy-Weisbach vs Hazen-Williams
                </button>
              </li>
              <li>
                <button
                  type="button"
                  style={{ background: 'none', border: 'none', color: '#64748b', cursor: 'pointer', padding: 0 }}
                  onClick={() => onSelectSection('examples')}
                >
                  Hand-Worked Engineering Examples
                </button>
              </li>
              <li>
                <button
                  type="button"
                  style={{ background: 'none', border: 'none', color: '#64748b', cursor: 'pointer', padding: 0 }}
                  onClick={() => onSelectSection('help')}
                >
                  User Guide & Sign Conventions
                </button>
              </li>
            </ul>
          </div>

          {/* Technical Specs */}
          <div>
            <h4 style={{ fontSize: '0.9rem', color: '#0f172a', marginBottom: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Standards & Integrity
            </h4>
            <p style={{ fontSize: '0.825rem', color: '#64748b', lineHeight: '1.6' }}>
              Pure client-side calculations based on standard hydraulic literature. Zero fake results or placeholders. Verified against textbook benchmarks.
            </p>
          </div>
        </div>

        {/* Bottom Bar */}
        <div style={{
          paddingTop: '1.5rem',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '1rem',
          fontSize: '0.825rem',
          color: '#94a3b8'
        }}>
          <div>
            © {new Date().getFullYear()} WaterFlow – Water Management System Calculator. Open Educational Resource.
          </div>
          <div style={{ display: 'flex', gap: '1rem' }}>
            <span style={{ cursor: 'pointer', color: '#0284c7' }} onClick={onOpenAbout}>About Software</span>
            <span>•</span>
            <span style={{ cursor: 'pointer', color: '#0284c7' }} onClick={() => window.print()}>Print Report</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
