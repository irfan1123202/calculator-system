import React, { useState } from 'react';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import AboutModal from './components/AboutModal';
import HomeView from './components/Home/HomeView';
import HardyCrossCalculator from './components/HardyCross/HardyCrossCalculator';
import EquivalentPipeCalculator from './components/EquivalentPipe/EquivalentPipeCalculator';
import TheorySection from './components/Theory/TheorySection';
import WorkedExamples from './components/Theory/WorkedExamples';
import HelpSection from './components/Theory/HelpSection';
import AIChatWidget from './components/Chat/AIChatWidget';

export default function App() {
  const [activeSection, setActiveSection] = useState('home');
  const [isAboutOpen, setIsAboutOpen] = useState(false);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [displayUnit, setDisplayUnit] = useState('l_s'); // 'l_s' | 'm3_s'

  const handleNavigate = (sectionId) => {
    setActiveSection(sectionId);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      {/* Printable Engineering Report Header (Only visible when printing) */}
      <div className="print-only-header">
        <h1>WaterFlow – Water Management System Calculation Report</h1>
        <p style={{ margin: '4px 0', fontSize: '0.9rem', color: '#475569' }}>
          Hydraulic Network Analysis & Verification Report | Generated: {new Date().toLocaleString()}
        </p>
      </div>

      {/* Global Navigation Bar */}
      <Navbar
        activeSection={activeSection}
        onSelectSection={handleNavigate}
        onOpenAbout={() => setIsAboutOpen(true)}
        onOpenChat={() => setIsChatOpen(true)}
      />

      {/* Main Content Area */}
      <main style={{ flex: 1, padding: '2rem 0' }}>
        <div className="container">
          {activeSection === 'home' && (
            <HomeView onSelectSection={handleNavigate} onOpenChat={() => setIsChatOpen(true)} />
          )}

          {activeSection === 'hardy_cross' && (
            <div>
              <div style={{ marginBottom: '1.5rem' }}>
                <h1 style={{ color: '#0c4a6e', fontSize: '2.2rem' }}>Hardy Cross Looped Network Calculator</h1>
                <p style={{ color: '#64748b', marginTop: '4px' }}>
                  Balance closed water distribution loops using iterative Newton-Raphson head loss relaxation (Darcy-Weisbach or Hazen-Williams).
                </p>
              </div>
              <HardyCrossCalculator />
            </div>
          )}

          {activeSection === 'equivalent' && (
            <div>
              <div style={{ marginBottom: '1.5rem' }}>
                <h1 style={{ color: '#0c4a6e', fontSize: '2.2rem' }}>Equivalent Pipe Calculator</h1>
                <p style={{ color: '#64748b', marginTop: '4px' }}>
                  Analyze series pipelines and parallel distribution manifolds, calculating equivalent diameters, resistances, and discharge splits.
                </p>
              </div>
              <EquivalentPipeCalculator displayUnit={displayUnit} />
            </div>
          )}

          {activeSection === 'theory' && (
            <TheorySection />
          )}

          {activeSection === 'examples' && (
            <WorkedExamples onNavigateToCalculator={handleNavigate} />
          )}

          {activeSection === 'help' && (
            <HelpSection />
          )}
        </div>
      </main>

      {/* Footer */}
      <Footer
        onSelectSection={handleNavigate}
        onOpenAbout={() => setIsAboutOpen(true)}
        onOpenChat={() => setIsChatOpen(true)}
      />

      {/* About Modal */}
      <AboutModal
        isOpen={isAboutOpen}
        onClose={() => setIsAboutOpen(false)}
      />

      {/* AI Chatbox Assistant for Calculations and Defined Questions */}
      <AIChatWidget
        onNavigateSection={handleNavigate}
        isOpen={isChatOpen}
        onToggleOpen={setIsChatOpen}
      />
    </div>
  );
}
