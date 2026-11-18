import React, { useState } from 'react';
import { formatFlow, formatHead } from '../../engine/unitConversions';
import { Info, RotateCw } from 'lucide-react';

export default function NetworkDiagram({
  nodes = [],
  pipes = [],
  numLoops = 2,
  onSelectPipe,
  selectedPipeId,
  displayUnit = 'l_s'
}) {
  const [hoveredPipe, setHoveredPipe] = useState(null);

  // If no custom nodes are provided, generate a fallback geometric layout
  const nodeMap = {};
  if (nodes.length > 0) {
    nodes.forEach(n => { nodeMap[n.id] = n; });
  } else {
    // Generate default coordinates if user created custom pipes without layout
    const uniqueNodes = new Set();
    pipes.forEach(p => {
      if (p.from) uniqueNodes.add(p.from);
      if (p.to) uniqueNodes.add(p.to);
    });
    const nodeList = Array.from(uniqueNodes);
    const count = nodeList.length || 4;
    const cx = 310, cy = 180, rx = 220, ry = 120;
    nodeList.forEach((nid, i) => {
      const angle = (2 * Math.PI * i) / count - Math.PI / 2;
      nodeMap[nid] = {
        id: nid,
        x: cx + rx * Math.cos(angle),
        y: cy + ry * Math.sin(angle),
        label: `Junction ${nid}`
      };
    });
  }

  // Calculate loop centroid positions for loop badges
  const loopCenters = [];
  if (numLoops === 1) {
    loopCenters.push({ x: 260, y: 180, label: 'Loop I' });
  } else if (numLoops === 2) {
    loopCenters.push({ x: 190, y: 180, label: 'Loop I' });
    loopCenters.push({ x: 410, y: 180, label: 'Loop II' });
  } else {
    for (let l = 0; l < numLoops; l++) {
      loopCenters.push({ x: 120 + l * 180, y: 180, label: `Loop ${l + 1}` });
    }
  }

  return (
    <div className="network-diagram-box">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <span style={{ fontSize: '0.85rem', fontWeight: '700', color: '#0369a1', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            Interactive Network Schematic
          </span>
          <span style={{ fontSize: '0.75rem', color: '#64748b', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
            <RotateCw size={12} color="#0284c7" /> Clockwise (+) Sign Convention
          </span>
        </div>
        <div style={{ fontSize: '0.75rem', color: '#64748b' }}>
          Hover or click on pipes to inspect hydraulic properties
        </div>
      </div>

      <svg
        className="network-svg"
        viewBox="0 0 620 360"
        preserveAspectRatio="xMidYMid meet"
      >
        <defs>
          {/* Arrow markers for flow direction */}
          <marker
            id="arrow-forward"
            viewBox="0 0 10 10"
            refX="6"
            refY="5"
            markerWidth="6"
            markerHeight="6"
            orient="auto-start-reverse"
          >
            <path d="M 0 1 L 9 5 L 0 9 z" fill="#0284c7" />
          </marker>
          <marker
            id="arrow-reverse"
            viewBox="0 0 10 10"
            refX="6"
            refY="5"
            markerWidth="6"
            markerHeight="6"
            orient="auto"
          >
            <path d="M 9 1 L 0 5 L 9 9 z" fill="#0284c7" />
          </marker>
          <marker
            id="arrow-selected"
            viewBox="0 0 10 10"
            refX="6"
            refY="5"
            markerWidth="7"
            markerHeight="7"
            orient="auto-start-reverse"
          >
            <path d="M 0 1 L 9 5 L 0 9 z" fill="#0d9488" />
          </marker>
        </defs>

        {/* Loop Centroid Badges */}
        {loopCenters.map((lc, idx) => (
          <g key={`loop-center-${idx}`} opacity="0.85">
            <circle
              cx={lc.x}
              cy={lc.y}
              r="24"
              fill="#f0f9ff"
              stroke="#bae6fd"
              strokeWidth="2"
              strokeDasharray="4 2"
            />
            <text
              x={lc.x}
              y={lc.y - 2}
              textAnchor="middle"
              fill="#0369a1"
              fontSize="10"
              fontWeight="700"
            >
              {lc.label}
            </text>
            <text
              x={lc.x}
              y={lc.y + 11}
              textAnchor="middle"
              fill="#0284c7"
              fontSize="8"
              fontWeight="600"
            >
              ↻ CW (+)
            </text>
          </g>
        ))}

        {/* Pipes (Lines & Flow Arrows) */}
        {pipes.map((pipe, idx) => {
          const fromNode = nodeMap[pipe.from] || { x: 80 + (idx % 3) * 180, y: 80 + Math.floor(idx / 3) * 160 };
          const toNode = nodeMap[pipe.to] || { x: 260 + (idx % 3) * 180, y: 80 + Math.floor(idx / 3) * 160 };

          const isSelected = selectedPipeId === pipe.id;
          const isHovered = hoveredPipe && hoveredPipe.id === pipe.id;

          const flow = parseFloat(pipe.flow) || 0;
          const isPositiveFlow = flow >= 0;
          const flowAbs = Math.abs(flow);

          // Calculate midpoint and angle
          const midX = (fromNode.x + toNode.x) / 2;
          const midY = (fromNode.y + toNode.y) / 2;
          const dx = toNode.x - fromNode.x;
          const dy = toNode.y - fromNode.y;
          const angleDeg = (Math.atan2(dy, dx) * 180) / Math.PI;

          // Perpendicular offset for text so it doesn't overlap pipe line
          const len = Math.sqrt(dx * dx + dy * dy) || 1;
          const nx = -dy / len;
          const ny = dx / len;
          const labelDist = 14;

          const isShared = (pipe.loops && pipe.loops.filter(l => l !== 0).length > 1);

          // Pipe styling
          let strokeColor = '#38bdf8'; // Default sky blue
          if (isSelected) strokeColor = '#0f766e';
          else if (isHovered) strokeColor = '#0284c7';
          else if (isShared) strokeColor = '#6366f1'; // Shared loop line highlighted purple/indigo
          else if (pipe.velocity > 2.5) strokeColor = '#f59e0b'; // High velocity amber

          const strokeWidth = Math.max(3, Math.min(8, (parseFloat(pipe.diameter) || 0.2) * 20));

          return (
            <g
              key={`pipe-svg-${pipe.id || idx}`}
              style={{ cursor: 'pointer' }}
              onClick={() => onSelectPipe && onSelectPipe(pipe.id)}
              onMouseEnter={() => setHoveredPipe(pipe)}
              onMouseLeave={() => setHoveredPipe(null)}
            >
              {/* Invisible thicker hit area for easy clicking */}
              <line
                x1={fromNode.x}
                y1={fromNode.y}
                x2={toNode.x}
                y2={toNode.y}
                stroke="transparent"
                strokeWidth={strokeWidth + 14}
              />

              {/* Main Pipe Line */}
              <line
                x1={fromNode.x}
                y1={fromNode.y}
                x2={toNode.x}
                y2={toNode.y}
                stroke={strokeColor}
                strokeWidth={strokeWidth}
                strokeLinecap="round"
                opacity={isSelected || isHovered ? 1 : 0.85}
              />

              {/* Direction Arrow marker in center */}
              <circle
                cx={midX}
                cy={midY}
                r="7"
                fill="white"
                stroke={strokeColor}
                strokeWidth="1.5"
              />
              <path
                d={
                  isPositiveFlow
                    ? "M -3 -3 L 3 0 L -3 3 z"
                    : "M 3 -3 L -3 0 L 3 3 z"
                }
                transform={`translate(${midX}, ${midY}) rotate(${angleDeg})`}
                fill={isSelected ? '#0f766e' : '#0284c7'}
              />

              {/* Pipe Name and Flow Rate Label */}
              <g transform={`translate(${midX + nx * labelDist}, ${midY + ny * labelDist})`}>
                <rect
                  x="-36"
                  y="-10"
                  width="72"
                  height="20"
                  rx="4"
                  fill="rgba(255, 255, 255, 0.95)"
                  stroke={isSelected ? '#0f766e' : '#e2e8f0'}
                  strokeWidth="1"
                />
                <text
                  textAnchor="middle"
                  y="4"
                  fontSize="9.5"
                  fontWeight="700"
                  fill="#0f172a"
                  fontFamily="var(--font-mono)"
                >
                  {pipe.id}: {displayUnit === 'l_s' ? (flowAbs * 1000).toFixed(1) + ' L/s' : flowAbs.toFixed(4)}
                </text>
              </g>
            </g>
          );
        })}

        {/* Junction Nodes */}
        {Object.values(nodeMap).map((node) => {
          const isInlet = node.type === 'inlet';
          const isOutlet = node.type === 'outlet';

          let nodeFill = '#ffffff';
          let nodeStroke = '#0284c7';
          if (isInlet) {
            nodeFill = '#ecfdf5';
            nodeStroke = '#10b981';
          } else if (isOutlet) {
            nodeFill = '#fff1f2';
            nodeStroke = '#f43f5e';
          }

          return (
            <g key={`node-svg-${node.id}`} transform={`translate(${node.x}, ${node.y})`}>
              {/* Outer halo */}
              <circle r="14" fill={nodeFill} stroke={nodeStroke} strokeWidth="2.5" />
              {/* Node letter */}
              <text
                textAnchor="middle"
                y="4"
                fontSize="11"
                fontWeight="800"
                fill="#0f172a"
                fontFamily="var(--font-sans)"
              >
                {node.id}
              </text>
              {/* Node description / demand text */}
              <text
                textAnchor="middle"
                y="-18"
                fontSize="8.5"
                fontWeight="600"
                fill={isInlet ? '#059669' : isOutlet ? '#e11d48' : '#64748b'}
              >
                {node.label || `Node ${node.id}`}
              </text>
            </g>
          );
        })}
      </svg>

      {/* Floating Hover Tooltip */}
      {hoveredPipe && (
        <div style={{
          position: 'absolute',
          bottom: '12px',
          right: '12px',
          background: 'rgba(15, 23, 42, 0.94)',
          color: '#ffffff',
          borderRadius: '8px',
          padding: '10px 14px',
          fontSize: '0.8rem',
          boxShadow: '0 4px 14px rgba(0,0,0,0.25)',
          maxWidth: '280px',
          backdropFilter: 'blur(8px)',
          border: '1px solid rgba(255,255,255,0.1)'
        }}>
          <div style={{ fontWeight: '700', fontSize: '0.9rem', color: '#38bdf8', marginBottom: '4px' }}>
            {hoveredPipe.name || hoveredPipe.id} ({hoveredPipe.from || 'A'} → {hoveredPipe.to || 'B'})
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'auto auto', gap: '3px 12px', fontFamily: 'var(--font-mono)' }}>
            <span style={{ color: '#94a3b8' }}>Flow Q:</span>
            <span style={{ color: '#34d399', fontWeight: '600' }}>{formatFlow(hoveredPipe.flow, displayUnit)}</span>

            <span style={{ color: '#94a3b8' }}>Head Loss h_f:</span>
            <span>{formatHead(hoveredPipe.headLoss)}</span>

            <span style={{ color: '#94a3b8' }}>Velocity v:</span>
            <span>{(hoveredPipe.velocity || 0).toFixed(2)} m/s</span>

            <span style={{ color: '#94a3b8' }}>Length L:</span>
            <span>{hoveredPipe.length} m</span>

            <span style={{ color: '#94a3b8' }}>Diameter D:</span>
            <span>{((parseFloat(hoveredPipe.diameter) || 0) * 1000).toFixed(0)} mm</span>

            <span style={{ color: '#94a3b8' }}>Resistance K:</span>
            <span>{(hoveredPipe.K || 0).toFixed(4)}</span>
          </div>
        </div>
      )}
    </div>
  );
}
