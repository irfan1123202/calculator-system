import React from 'react';
import { Droplet, RotateCw, GitCommit, BookOpen, BookCheck, HelpCircle, Info, Sparkles } from 'lucide-react';

export default function Navbar({ activeSection, onSelectSection, onOpenAbout, onOpenChat }) {
  const navItems = [
    { id: 'home', label: 'Home', icon: Droplet },
    { id: 'hardy_cross', label: 'Hardy Cross', icon: RotateCw },
    { id: 'equivalent', label: 'Equivalent Pipe', icon: GitCommit },
    { id: 'theory', label: 'Theory', icon: BookOpen },
    { id: 'examples', label: 'Worked Examples', icon: BookCheck },
    { id: 'help', label: 'Help', icon: HelpCircle },
  ];

  return (
    <header className="navbar no-print">
      <div className="container">
        <div className="navbar-inner">
          {/* Brand Logo */}
          <div className="nav-brand" onClick={() => onSelectSection('home')}>
            <div className="brand-icon-box">
              <Droplet size={24} fill="currentColor" />
            </div>
            <div className="brand-text">
              <span className="brand-title">
                WaterFlow <span style={{ color: '#06b6d4', fontWeight: '900' }}>.</span>
              </span>
              <span className="brand-tag">Hydraulic Network Calculator</span>
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="nav-links">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeSection === item.id;
              return (
                <button
                  key={item.id}
                  type="button"
                  className={`nav-btn ${isActive ? 'active' : ''}`}
                  onClick={() => onSelectSection(item.id)}
                >
                  <Icon size={16} />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </nav>

          {/* Actions */}
          <div className="nav-actions" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <button
              type="button"
              className="btn btn-sm"
              onClick={onOpenChat}
              style={{
                background: 'linear-gradient(135deg, #e0f2fe 0%, #ecfeff 100%)',
                color: '#0369a1',
                border: '1px solid #bae6fd',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                fontWeight: '700'
              }}
              title="Open AI Chat Assistant for calculations and defined questions"
            >
              <Sparkles size={14} color="#0284c7" />
              <span>AI Assistant</span>
            </button>

            <button
              type="button"
              className="btn btn-secondary btn-sm"
              onClick={onOpenAbout}
              title="About WaterFlow"
            >
              <Info size={15} /> About
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}
