import React, { useState, useEffect, useRef } from 'react';
import {
  Sparkles,
  X,
  Minus,
  Send,
  Calculator,
  RotateCcw,
  BookOpen,
  Search,
  Copy,
  Check,
  Settings,
  HelpCircle,
  ArrowRight,
  Maximize2
} from 'lucide-react';
import {
  DEFINED_CATEGORIES,
  DEFINED_QUESTIONS,
  generateChatResponse
} from '../../engine/aiChatEngine';
import ChatMarkdown from './ChatMarkdown';
import QuickDarcyTool from './QuickDarcyTool';
import QuickVelocityTool from './QuickVelocityTool';
import QuickUnitTool from './QuickUnitTool';

export default function AIChatWidget({ onNavigateSection, isOpen: externalIsOpen, onToggleOpen }) {
  // Controlled or uncontrolled open state
  const [internalIsOpen, setInternalIsOpen] = useState(false);
  const isOpen = externalIsOpen !== undefined ? externalIsOpen : internalIsOpen;

  const [isMinimized, setIsMinimized] = useState(false);
  const [activeCategory, setActiveCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [showQuestionsBrowser, setShowQuestionsBrowser] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [apiKey, setApiKey] = useState(() => localStorage.getItem('waterflow_gemini_key') || '');
  const [copiedId, setCopiedId] = useState(null);
  const [showCalcTemplates, setShowCalcTemplates] = useState(false);

  // Messages state with welcome message
  const [messages, setMessages] = useState(() => {
    const saved = sessionStorage.getItem('waterflow_chat_messages');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {
        // fall back
      }
    }
    return [
      {
        id: 'welcome',
        sender: 'bot',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        text: `### 🌊 Welcome to WaterFlow AI Assistant!

I am your hydraulic engineering companion. I can solve formulas, explain fluid mechanics, and answer your network analysis questions:

- **Instant Calculations:** Head loss, velocity, Reynolds number, Dupuit series, parallel splits, unit conversions.
- **Hardy Cross Guidance:** Loop sign rules, node continuity balance, $\\Delta Q$ iterations.
- **Defined Engineering Questions:** Click any topic below to explore verified answers!`,
        source: 'welcome',
        suggestedQuestions: DEFINED_QUESTIONS.slice(0, 4)
      }
    ];
  });

  const [inputVal, setInputVal] = useState('');
  const [isThinking, setIsThinking] = useState(false);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  // Persist messages in session
  useEffect(() => {
    try {
      sessionStorage.setItem('waterflow_chat_messages', JSON.stringify(messages));
    } catch {
      // ignore
    }
  }, [messages]);

  // Auto-scroll to bottom
  const scrollToBottom = (behavior = 'smooth') => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior });
    }
  };

  useEffect(() => {
    if (isOpen && !isMinimized) {
      scrollToBottom('auto');
    }
  }, [isOpen, isMinimized, messages]);

  const handleToggleOpen = () => {
    const nextState = !isOpen;
    setInternalIsOpen(nextState);
    if (onToggleOpen) onToggleOpen(nextState);
    if (nextState) setIsMinimized(false);
  };

  const handleSend = async (textToSend = null) => {
    const text = (textToSend || inputVal).trim();
    if (!text || isThinking) return;

    const userMsg = {
      id: `u-${Date.now()}`,
      sender: 'user',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      text
    };

    setMessages(prev => [...prev, userMsg]);
    setInputVal('');
    setShowCalcTemplates(false);
    setShowQuestionsBrowser(false);
    setIsThinking(true);

    try {
      // Simulate natural response latency
      const response = await generateChatResponse(text, { apiKey });

      const botMsg = {
        id: `b-${Date.now()}`,
        sender: 'bot',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        text: response.text,
        source: response.source,
        hasInteractiveTool: response.hasInteractiveTool,
        suggestedQuestions: response.suggestedQuestions || []
      };

      setMessages(prev => [...prev, botMsg]);
    } catch (err) {
      setMessages(prev => [
        ...prev,
        {
          id: `err-${Date.now()}`,
          sender: 'bot',
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          text: `⚠️ **Error:** ${err.message || 'Unable to process query.'}`,
          source: 'error'
        }
      ]);
    } finally {
      setIsThinking(false);
    }
  };

  const handleSelectDefinedQuestion = (q) => {
    handleSend(q.question);
  };

  const handleClearChat = () => {
    const welcome = [
      {
        id: 'welcome-reset',
        sender: 'bot',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        text: `Chat cleared. Ask me any hydraulic engineering question or choose from the defined topics below:`,
        source: 'welcome',
        suggestedQuestions: DEFINED_QUESTIONS.slice(0, 4)
      }
    ];
    setMessages(welcome);
    sessionStorage.removeItem('waterflow_chat_messages');
  };

  const handleCopy = (id, text) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleSaveApiKey = (newKey) => {
    setApiKey(newKey);
    localStorage.setItem('waterflow_gemini_key', newKey);
    setShowSettings(false);
  };

  // Filtered defined questions for browser
  const filteredQuestions = DEFINED_QUESTIONS.filter(q => {
    const matchesCat = activeCategory === 'all' || q.category === activeCategory;
    const matchesQuery = !searchQuery.trim() ||
      q.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
      q.shortDesc.toLowerCase().includes(searchQuery.toLowerCase()) ||
      q.tags.some(t => t.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesCat && matchesQuery;
  });

  return (
    <>
      {/* Floating Trigger Button at Bottom-Right */}
      <div
        className="no-print"
        style={{
          position: 'fixed',
          bottom: '24px',
          right: '24px',
          zIndex: 9990,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'flex-end',
          gap: '8px'
        }}
      >
        {!isOpen && (
          <button
            type="button"
            onClick={handleToggleOpen}
            className="ai-chat-trigger"
            style={{
              background: 'linear-gradient(135deg, #0284c7 0%, #06b6d4 100%)',
              color: 'white',
              border: 'none',
              borderRadius: '9999px',
              padding: '12px 20px',
              boxShadow: '0 10px 25px -5px rgba(2, 132, 199, 0.4), 0 8px 10px -6px rgba(2, 132, 199, 0.2)',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              fontWeight: '700',
              fontSize: '0.95rem',
              transition: 'all 0.25s cubic-bezier(0.4, 0, 0.2, 1)',
              position: 'relative'
            }}
            title="Open AI Hydraulic Calculator & Assistant"
          >
            <div style={{
              width: '28px',
              height: '28px',
              borderRadius: '50%',
              background: 'rgba(255, 255, 255, 0.25)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <Sparkles size={16} />
            </div>
            <span>AI Assistant</span>
            <span
              className="ai-pulse-dot"
              style={{
                background: '#10b981',
                width: '9px',
                height: '9px',
                borderRadius: '50%',
                border: '2px solid white'
              }}
            />
          </button>
        )}
      </div>

      {/* Chat Window */}
      {isOpen && (
        <div
          className="no-print"
          style={{
            position: 'fixed',
            bottom: '24px',
            right: '24px',
            width: 'min(440px, 94vw)',
            height: isMinimized ? '60px' : 'min(640px, 86vh)',
            backgroundColor: '#ffffff',
            borderRadius: '16px',
            boxShadow: '0 20px 35px -5px rgba(15, 23, 42, 0.25), 0 10px 15px -5px rgba(15, 23, 42, 0.1)',
            border: '1px solid #cbd5e1',
            zIndex: 9995,
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden',
            transition: 'height 0.25s ease'
          }}
        >
          {/* Header */}
          <div
            style={{
              padding: '12px 16px',
              background: 'linear-gradient(135deg, #0c4a6e 0%, #0369a1 100%)',
              color: 'white',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              flexShrink: 0,
              cursor: 'pointer'
            }}
            onClick={() => {
              if (isMinimized) setIsMinimized(false);
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <div
                style={{
                  width: '32px',
                  height: '32px',
                  borderRadius: '8px',
                  background: 'rgba(255, 255, 255, 0.2)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#38bdf8'
                }}
              >
                <Sparkles size={18} />
              </div>
              <div>
                <div style={{ fontWeight: '700', fontSize: '0.95rem', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <span>WaterFlow AI</span>
                  <span
                    style={{
                      fontSize: '0.68rem',
                      background: 'rgba(6, 182, 212, 0.3)',
                      color: '#a5f3fc',
                      padding: '1px 6px',
                      borderRadius: '9999px',
                      fontWeight: '600'
                    }}
                  >
                    Hydraulic Expert
                  </span>
                </div>
                <div style={{ fontSize: '0.72rem', color: '#e0f2fe', display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#34d399' }} />
                  Calculations & Defined Questions
                </div>
              </div>
            </div>

            {/* Action buttons */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }} onClick={(e) => e.stopPropagation()}>
              <button
                type="button"
                onClick={() => setShowQuestionsBrowser(prev => !prev)}
                title="Browse Defined Questions"
                style={{
                  background: showQuestionsBrowser ? 'rgba(255, 255, 255, 0.3)' : 'transparent',
                  border: 'none',
                  color: 'white',
                  borderRadius: '6px',
                  padding: '5px',
                  cursor: 'pointer'
                }}
              >
                <BookOpen size={16} />
              </button>

              <button
                type="button"
                onClick={() => setShowSettings(prev => !prev)}
                title="Settings & API Key"
                style={{
                  background: showSettings ? 'rgba(255, 255, 255, 0.3)' : 'transparent',
                  border: 'none',
                  color: 'white',
                  borderRadius: '6px',
                  padding: '5px',
                  cursor: 'pointer'
                }}
              >
                <Settings size={16} />
              </button>

              <button
                type="button"
                onClick={handleClearChat}
                title="Clear Conversation"
                style={{
                  background: 'transparent',
                  border: 'none',
                  color: 'white',
                  borderRadius: '6px',
                  padding: '5px',
                  cursor: 'pointer'
                }}
              >
                <RotateCcw size={16} />
              </button>

              <button
                type="button"
                onClick={() => setIsMinimized(prev => !prev)}
                title={isMinimized ? 'Expand' : 'Minimize'}
                style={{
                  background: 'transparent',
                  border: 'none',
                  color: 'white',
                  borderRadius: '6px',
                  padding: '5px',
                  cursor: 'pointer'
                }}
              >
                {isMinimized ? <Maximize2 size={16} /> : <Minus size={16} />}
              </button>

              <button
                type="button"
                onClick={handleToggleOpen}
                title="Close Assistant"
                style={{
                  background: 'transparent',
                  border: 'none',
                  color: 'white',
                  borderRadius: '6px',
                  padding: '5px',
                  cursor: 'pointer'
                }}
              >
                <X size={17} />
              </button>
            </div>
          </div>

          {/* Body when not minimized */}
          {!isMinimized && (
            <div style={{ display: 'flex', flexDirection: 'column', flex: 1, minHeight: 0, position: 'relative' }}>
              
              {/* Optional Settings Overlay */}
              {showSettings && (
                <div
                  style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    background: '#ffffff',
                    zIndex: 10,
                    padding: '1rem',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '1rem',
                    overflowY: 'auto'
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <h3 style={{ fontSize: '1rem', color: '#0f172a', fontWeight: '700' }}>AI Assistant Settings</h3>
                    <button
                      type="button"
                      onClick={() => setShowSettings(false)}
                      style={{ background: 'none', border: 'none', color: '#64748b', cursor: 'pointer' }}
                    >
                      <X size={18} />
                    </button>
                  </div>

                  <div style={{ background: '#f0f9ff', border: '1px solid #bae6fd', borderRadius: '8px', padding: '0.75rem', fontSize: '0.82rem', color: '#0369a1' }}>
                    <strong>✅ Offline Engine Active:</strong> WaterFlow has a built-in hydraulic calculation and question matching engine that requires <strong>zero API keys</strong> and works 100% offline.
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: '600', color: '#334155', marginBottom: '4px' }}>
                      Google Gemini API Key (Optional):
                    </label>
                    <input
                      type="password"
                      placeholder="AIzaSy..."
                      value={apiKey}
                      onChange={(e) => setApiKey(e.target.value)}
                      style={{
                        width: '100%',
                        padding: '8px 10px',
                        fontSize: '0.82rem',
                        borderRadius: '6px',
                        border: '1px solid #cbd5e1'
                      }}
                    />
                    <p style={{ fontSize: '0.72rem', color: '#64748b', marginTop: '4px' }}>
                      Add an API key only if you want unrestricted live generative conversation.
                    </p>
                  </div>

                  <div style={{ display: 'flex', gap: '0.5rem', marginTop: 'auto' }}>
                    <button
                      type="button"
                      className="btn btn-primary btn-sm"
                      style={{ flex: 1 }}
                      onClick={() => handleSaveApiKey(apiKey)}
                    >
                      Save Settings
                    </button>
                    {apiKey && (
                      <button
                        type="button"
                        className="btn btn-secondary btn-sm"
                        onClick={() => handleSaveApiKey('')}
                      >
                        Clear Key
                      </button>
                    )}
                  </div>
                </div>
              )}

              {/* Defined Questions Browser Overlay */}
              {showQuestionsBrowser && (
                <div
                  style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    background: '#ffffff',
                    zIndex: 10,
                    padding: '1rem',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '0.75rem'
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <BookOpen size={16} color="#0284c7" />
                      <h3 style={{ fontSize: '0.95rem', color: '#0f172a', fontWeight: '700' }}>
                        Defined Questions & Topics
                      </h3>
                    </div>
                    <button
                      type="button"
                      onClick={() => setShowQuestionsBrowser(false)}
                      style={{ background: 'none', border: 'none', color: '#64748b', cursor: 'pointer' }}
                    >
                      <X size={18} />
                    </button>
                  </div>

                  {/* Search bar */}
                  <div style={{ position: 'relative' }}>
                    <Search size={14} style={{ position: 'absolute', left: '10px', top: '10px', color: '#94a3b8' }} />
                    <input
                      type="text"
                      placeholder="Search questions or formulas..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      style={{
                        width: '100%',
                        padding: '7px 10px 7px 30px',
                        fontSize: '0.8rem',
                        borderRadius: '6px',
                        border: '1px solid #cbd5e1'
                      }}
                    />
                  </div>

                  {/* Category Pills */}
                  <div style={{ display: 'flex', gap: '4px', overflowX: 'auto', paddingBottom: '4px' }}>
                    {DEFINED_CATEGORIES.map(cat => (
                      <button
                        key={cat.id}
                        type="button"
                        onClick={() => setActiveCategory(cat.id)}
                        style={{
                          padding: '4px 8px',
                          fontSize: '0.72rem',
                          borderRadius: '9999px',
                          border: '1px solid',
                          borderColor: activeCategory === cat.id ? '#0284c7' : '#e2e8f0',
                          background: activeCategory === cat.id ? '#e0f2fe' : '#f8fafc',
                          color: activeCategory === cat.id ? '#0369a1' : '#475569',
                          fontWeight: activeCategory === cat.id ? '700' : '500',
                          whiteSpace: 'nowrap',
                          cursor: 'pointer'
                        }}
                      >
                        {cat.label}
                      </button>
                    ))}
                  </div>

                  {/* Questions List */}
                  <div style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '6px' }}>
                    {filteredQuestions.map(q => (
                      <div
                        key={q.id}
                        onClick={() => handleSelectDefinedQuestion(q)}
                        style={{
                          padding: '8px 10px',
                          borderRadius: '8px',
                          border: '1px solid #e2e8f0',
                          background: '#f8fafc',
                          cursor: 'pointer',
                          transition: 'all 0.15s ease'
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.background = '#f0f9ff';
                          e.currentTarget.style.borderColor = '#bae6fd';
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.background = '#f8fafc';
                          e.currentTarget.style.borderColor = '#e2e8f0';
                        }}
                      >
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <span style={{ fontSize: '0.82rem', fontWeight: '700', color: '#0369a1' }}>
                            {q.question}
                          </span>
                          <ArrowRight size={13} color="#0284c7" />
                        </div>
                        <div style={{ fontSize: '0.72rem', color: '#64748b', marginTop: '2px' }}>
                          {q.shortDesc}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Quick Defined Questions Header Ribbon */}
              <div
                style={{
                  background: '#f8fafc',
                  borderBottom: '1px solid #e2e8f0',
                  padding: '6px 12px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  overflowX: 'auto',
                  flexShrink: 0
                }}
              >
                <span style={{ fontSize: '0.72rem', color: '#64748b', fontWeight: '700', display: 'flex', alignItems: 'center', gap: '3px', whiteSpace: 'nowrap' }}>
                  <HelpCircle size={12} /> Defined Questions:
                </span>
                <button
                  type="button"
                  onClick={() => handleSend('How to calculate Darcy-Weisbach Head Loss?')}
                  style={{
                    padding: '2px 8px',
                    fontSize: '0.72rem',
                    background: '#e0f2fe',
                    color: '#0369a1',
                    border: '1px solid #bae6fd',
                    borderRadius: '9999px',
                    whiteSpace: 'nowrap',
                    cursor: 'pointer'
                  }}
                >
                  💧 Head Loss
                </button>
                <button
                  type="button"
                  onClick={() => handleSend('How does the Hardy Cross method work?')}
                  style={{
                    padding: '2px 8px',
                    fontSize: '0.72rem',
                    background: '#e0f2fe',
                    color: '#0369a1',
                    border: '1px solid #bae6fd',
                    borderRadius: '9999px',
                    whiteSpace: 'nowrap',
                    cursor: 'pointer'
                  }}
                >
                  🔄 Hardy Cross
                </button>
                <button
                  type="button"
                  onClick={() => handleSend('How to calculate Equivalent Diameter for Series Pipes (Dupuit)?')}
                  style={{
                    padding: '2px 8px',
                    fontSize: '0.72rem',
                    background: '#e0f2fe',
                    color: '#0369a1',
                    border: '1px solid #bae6fd',
                    borderRadius: '9999px',
                    whiteSpace: 'nowrap',
                    cursor: 'pointer'
                  }}
                >
                  🔗 Dupuit Series
                </button>
                <button
                  type="button"
                  onClick={() => setShowQuestionsBrowser(true)}
                  style={{
                    padding: '2px 8px',
                    fontSize: '0.72rem',
                    background: '#ffffff',
                    color: '#475569',
                    border: '1px solid #cbd5e1',
                    borderRadius: '9999px',
                    whiteSpace: 'nowrap',
                    cursor: 'pointer',
                    fontWeight: '600'
                  }}
                >
                  More +
                </button>
              </div>

              {/* Messages Scroll Area */}
              <div
                style={{
                  flex: 1,
                  overflowY: 'auto',
                  padding: '12px 14px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '12px',
                  background: '#ffffff'
                }}
              >
                {messages.map((msg) => {
                  const isUser = msg.sender === 'user';
                  return (
                    <div
                      key={msg.id}
                      style={{
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: isUser ? 'flex-end' : 'flex-start'
                      }}
                    >
                      <div
                        style={{
                          maxWidth: '92%',
                          padding: isUser ? '8px 12px' : '10px 14px',
                          borderRadius: isUser ? '14px 14px 2px 14px' : '14px 14px 14px 2px',
                          background: isUser ? 'linear-gradient(135deg, #0284c7 0%, #0369a1 100%)' : '#f8fafc',
                          color: isUser ? '#ffffff' : '#0f172a',
                          border: isUser ? 'none' : '1px solid #e2e8f0',
                          fontSize: '0.88rem',
                          boxShadow: isUser
                            ? '0 2px 6px rgba(2, 132, 199, 0.25)'
                            : '0 1px 3px rgba(15, 23, 42, 0.05)',
                          wordBreak: 'break-word',
                          position: 'relative'
                        }}
                      >
                        {isUser ? (
                          <div style={{ whiteSpace: 'pre-wrap' }}>{msg.text}</div>
                        ) : (
                          <div>
                            <ChatMarkdown content={msg.text} />

                            {/* Render interactive calculation tools if relevant */}
                            {msg.hasInteractiveTool === 'darcy' && (
                              <QuickDarcyTool onInsertText={(summary) => handleSend(summary)} />
                            )}
                            {msg.hasInteractiveTool === 'velocity' && (
                              <QuickVelocityTool onInsertText={(summary) => handleSend(summary)} />
                            )}
                            {msg.hasInteractiveTool === 'units' && (
                              <QuickUnitTool />
                            )}

                            {/* Navigation shortcuts if relevant */}
                            {onNavigateSection && (msg.text.includes('Hardy Cross') || msg.text.includes('Equivalent Pipe')) && (
                              <div style={{ marginTop: '8px', display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                                {msg.text.includes('Hardy Cross') && (
                                  <button
                                    type="button"
                                    onClick={() => onNavigateSection('hardy_cross')}
                                    style={{
                                      fontSize: '0.72rem',
                                      padding: '3px 8px',
                                      borderRadius: '4px',
                                      background: '#e0f2fe',
                                      color: '#0369a1',
                                      border: '1px solid #bae6fd',
                                      cursor: 'pointer',
                                      fontWeight: '600'
                                    }}
                                  >
                                    ➔ Open Hardy Cross Tab
                                  </button>
                                )}
                                {msg.text.includes('Equivalent') && (
                                  <button
                                    type="button"
                                    onClick={() => onNavigateSection('equivalent')}
                                    style={{
                                      fontSize: '0.72rem',
                                      padding: '3px 8px',
                                      borderRadius: '4px',
                                      background: '#ecfeff',
                                      color: '#0e7490',
                                      border: '1px solid #a5f3fc',
                                      cursor: 'pointer',
                                      fontWeight: '600'
                                    }}
                                  >
                                    ➔ Open Equivalent Pipe Tab
                                  </button>
                                )}
                              </div>
                            )}

                            {/* Copy button & timestamp */}
                            <div
                              style={{
                                display: 'flex',
                                justifyContent: 'space-between',
                                alignItems: 'center',
                                marginTop: '6px',
                                paddingTop: '4px',
                                borderTop: '1px solid #f1f5f9',
                                fontSize: '0.7rem',
                                color: '#94a3b8'
                              }}
                            >
                              <span>{msg.timestamp}</span>
                              <button
                                type="button"
                                onClick={() => handleCopy(msg.id, msg.text)}
                                style={{
                                  background: 'none',
                                  border: 'none',
                                  color: copiedId === msg.id ? '#10b981' : '#94a3b8',
                                  cursor: 'pointer',
                                  display: 'flex',
                                  alignItems: 'center',
                                  gap: '2px',
                                  padding: '2px'
                                }}
                                title="Copy answer"
                              >
                                {copiedId === msg.id ? <Check size={12} /> : <Copy size={12} />}
                                <span>{copiedId === msg.id ? 'Copied' : 'Copy'}</span>
                              </button>
                            </div>
                          </div>
                        )}
                      </div>

                      {/* Suggested Questions Chips below bot response */}
                      {!isUser && msg.suggestedQuestions && msg.suggestedQuestions.length > 0 && (
                        <div
                          style={{
                            display: 'flex',
                            flexWrap: 'wrap',
                            gap: '5px',
                            marginTop: '6px',
                            maxWidth: '92%'
                          }}
                        >
                          {msg.suggestedQuestions.map((q) => (
                            <button
                              key={q.id}
                              type="button"
                              onClick={() => handleSelectDefinedQuestion(q)}
                              style={{
                                padding: '3px 8px',
                                fontSize: '0.72rem',
                                background: '#f0f9ff',
                                color: '#0369a1',
                                border: '1px solid #bae6fd',
                                borderRadius: '9999px',
                                cursor: 'pointer',
                                transition: 'all 0.15s ease',
                                textAlign: 'left'
                              }}
                              onMouseEnter={(e) => {
                                e.currentTarget.style.background = '#e0f2fe';
                              }}
                              onMouseLeave={(e) => {
                                e.currentTarget.style.background = '#f0f9ff';
                              }}
                            >
                              💡 {q.question}
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  );
                })}

                {isThinking && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#0284c7', fontSize: '0.8rem', padding: '6px' }}>
                    <Sparkles size={14} className="spin-slow" />
                    <span>Analyzing hydraulic formula...</span>
                  </div>
                )}

                <div ref={messagesEndRef} />
              </div>

              {/* Calculation Prompt Template Popup */}
              {showCalcTemplates && (
                <div
                  style={{
                    position: 'absolute',
                    bottom: '62px',
                    left: '12px',
                    right: '12px',
                    background: '#ffffff',
                    border: '1px solid #cbd5e1',
                    borderRadius: '10px',
                    boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
                    padding: '8px',
                    zIndex: 20
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                    <span style={{ fontSize: '0.75rem', fontWeight: '700', color: '#0369a1', display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <Calculator size={13} /> Quick Calculation Templates
                    </span>
                    <button
                      type="button"
                      onClick={() => setShowCalcTemplates(false)}
                      style={{ background: 'none', border: 'none', color: '#64748b', cursor: 'pointer' }}
                    >
                      <X size={14} />
                    </button>
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                    <button
                      type="button"
                      onClick={() => handleSend('calculate head loss for L=500m, D=200mm, Q=40 L/s, f=0.02')}
                      style={{
                        padding: '6px 8px',
                        fontSize: '0.75rem',
                        textAlign: 'left',
                        background: '#f8fafc',
                        border: '1px solid #e2e8f0',
                        borderRadius: '6px',
                        cursor: 'pointer',
                        color: '#1e293b'
                      }}
                    >
                      💧 <strong>Darcy Head Loss:</strong> L=500m, D=200mm, Q=40 L/s
                    </button>
                    <button
                      type="button"
                      onClick={() => handleSend('velocity for Q=35 L/s, D=150mm')}
                      style={{
                        padding: '6px 8px',
                        fontSize: '0.75rem',
                        textAlign: 'left',
                        background: '#f8fafc',
                        border: '1px solid #e2e8f0',
                        borderRadius: '6px',
                        cursor: 'pointer',
                        color: '#1e293b'
                      }}
                    >
                      🌊 <strong>Flow Velocity & Re:</strong> Q=35 L/s, D=150mm
                    </button>
                    <button
                      type="button"
                      onClick={() => handleSend('convert 60 L/s to m3/s')}
                      style={{
                        padding: '6px 8px',
                        fontSize: '0.75rem',
                        textAlign: 'left',
                        background: '#f8fafc',
                        border: '1px solid #e2e8f0',
                        borderRadius: '6px',
                        cursor: 'pointer',
                        color: '#1e293b'
                      }}
                    >
                      🔄 <strong>Unit Conversion:</strong> 60 L/s to m³/s
                    </button>
                  </div>
                </div>
              )}

              {/* Input Area */}
              <div
                style={{
                  padding: '8px 12px',
                  borderTop: '1px solid #e2e8f0',
                  background: '#f8fafc',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px'
                }}
              >
                <button
                  type="button"
                  onClick={() => setShowCalcTemplates(prev => !prev)}
                  title="Calculation templates"
                  style={{
                    background: showCalcTemplates ? '#e0f2fe' : '#ffffff',
                    border: '1px solid',
                    borderColor: showCalcTemplates ? '#0284c7' : '#cbd5e1',
                    borderRadius: '6px',
                    padding: '7px 8px',
                    color: '#0369a1',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '2px',
                    fontSize: '0.75rem',
                    fontWeight: '700'
                  }}
                >
                  <Calculator size={14} />
                  <span>Calc</span>
                </button>

                <input
                  ref={inputRef}
                  type="text"
                  placeholder="Ask a question or calculate (e.g. L=500m D=200mm Q=40L/s)..."
                  value={inputVal}
                  onChange={(e) => setInputVal(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      handleSend();
                    }
                  }}
                  style={{
                    flex: 1,
                    padding: '8px 12px',
                    fontSize: '0.82rem',
                    borderRadius: '8px',
                    border: '1px solid #cbd5e1',
                    outline: 'none',
                    background: '#ffffff'
                  }}
                />

                <button
                  type="button"
                  onClick={() => handleSend()}
                  disabled={!inputVal.trim() || isThinking}
                  style={{
                    background: inputVal.trim() ? 'linear-gradient(135deg, #0284c7 0%, #06b6d4 100%)' : '#cbd5e1',
                    border: 'none',
                    borderRadius: '8px',
                    color: 'white',
                    padding: '8px 12px',
                    cursor: inputVal.trim() ? 'pointer' : 'not-allowed',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}
                  title="Send Message"
                >
                  <Send size={15} />
                </button>
              </div>

            </div>
          )}
        </div>
      )}
    </>
  );
}
