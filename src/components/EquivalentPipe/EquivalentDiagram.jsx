import React from 'react';
import { formatNum, formatFlow } from '../../engine/unitConversions';

export default function EquivalentDiagram({ mode = 'series', result, displayUnit = 'l_s' }) {
  if (!result || !result.success) return null;

  const isSeries = mode === 'series';

  return (
    <div className="network-diagram-box" style={{ padding: '1.25rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
        <span style={{ fontSize: '0.85rem', fontWeight: '700', color: '#0369a1', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
          {isSeries ? 'Series Pipeline Schematic' : 'Parallel Pipe Manifold Schematic'}
        </span>
        <span style={{ fontSize: '0.75rem', color: '#64748b' }}>
          {isSeries ? 'Constant Flow Q | Additive Head Losses (Σh)' : 'Constant Head Loss h | Additive Flow (ΣQ)'}
        </span>
      </div>

      <svg
        className="network-svg"
        viewBox="0 0 680 280"
        preserveAspectRatio="xMidYMid meet"
      >
        <defs>
          <linearGradient id="pipe-water-grad" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#38bdf8" />
            <stop offset="100%" stopColor="#0284c7" />
          </linearGradient>
          <linearGradient id="eq-pipe-grad" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#34d399" />
            <stop offset="100%" stopColor="#059669" />
          </linearGradient>
          <marker
            id="eq-arrow"
            viewBox="0 0 10 10"
            refX="6"
            refY="5"
            markerWidth="6"
            markerHeight="6"
            orient="auto-start-reverse"
          >
            <path d="M 0 1 L 9 5 L 0 9 z" fill="#0284c7" />
          </marker>
        </defs>

        {isSeries ? (
          /* ================= SERIES SCHEMATIC ================= */
          <g>
            <text x="30" y="30" fontSize="11" fontWeight="700" fill="#475569">
              Original Compound Pipe System (Pipes in Series):
            </text>

            {/* Inflow Arrow */}
            <line x1="20" y1="90" x2="60" y2="90" stroke="#0284c7" strokeWidth="3" markerEnd="url(#eq-arrow)" />
            <text x="35" y="75" fontSize="9" fontWeight="700" fill="#0284c7">
              Q = {formatFlow(result.totalDischarge, displayUnit)}
            </text>

            {/* Render Series Segments */}
            {result.pipes && result.pipes.map((p, idx) => {
              const count = result.pipes.length;
              const totalWidth = 540;
              const segWidth = totalWidth / count;
              const startX = 65 + idx * segWidth;
              // Visual height proportional to diameter
              const pipeH = Math.max(16, Math.min(45, (p.diameter / 0.4) * 32));
              const startY = 90 - pipeH / 2;

              return (
                <g key={`series-seg-${idx}`}>
                  {/* Pipe Body */}
                  <rect
                    x={startX}
                    y={startY}
                    width={segWidth - 4}
                    height={pipeH}
                    rx="4"
                    fill="url(#pipe-water-grad)"
                    stroke="#0369a1"
                    strokeWidth="1.5"
                    opacity="0.9"
                  />
                  {/* Pipe Label */}
                  <text
                    x={startX + segWidth / 2}
                    y={startY - 6}
                    textAnchor="middle"
                    fontSize="9.5"
                    fontWeight="700"
                    fill="#0f172a"
                  >
                    {p.name}: L={p.length}m, D={(p.diameter * 1000).toFixed(0)}mm
                  </text>
                  {/* Head Loss Label */}
                  <text
                    x={startX + segWidth / 2}
                    y={startY + pipeH + 14}
                    textAnchor="middle"
                    fontSize="8.5"
                    fontWeight="600"
                    fill="#0369a1"
                  >
                    h_f = {formatNum(p.headLoss, 3)} m | v = {p.velocity.toFixed(2)} m/s
                  </text>
                </g>
              );
            })}

            {/* Outflow Arrow */}
            <line x1="610" y1="90" x2="655" y2="90" stroke="#0284c7" strokeWidth="3" markerEnd="url(#eq-arrow)" />

            {/* Divider Line */}
            <line x1="30" y1="150" x2="650" y2="150" stroke="#e2e8f0" strokeWidth="1" strokeDasharray="4 4" />

            {/* Equivalent Pipe Visualization */}
            <text x="30" y="175" fontSize="11" fontWeight="700" fill="#047857">
              Hydraulically Equivalent Pipe (Same Head Loss H = {formatNum(result.totalHeadLoss, 3)} m at Q = {formatFlow(result.totalDischarge, displayUnit)}):
            </text>

            <rect
              x="65"
              y="195"
              width="536"
              height={Math.max(18, Math.min(45, (result.equivalentDiameter / 0.4) * 32))}
              rx="6"
              fill="url(#eq-pipe-grad)"
              stroke="#047857"
              strokeWidth="2"
              opacity="0.9"
            />
            <text
              x="333"
              y="250"
              textAnchor="middle"
              fontSize="11"
              fontWeight="800"
              fill="#065f46"
            >
              Equivalent Pipe: Le = {result.equivalentLength} m | De = {(result.equivalentDiameter * 1000).toFixed(1)} mm ({result.equivalentDiameter.toFixed(4)} m) | Ke = {formatNum(result.Ke, 4)}
            </text>
          </g>
        ) : (
          /* ================= PARALLEL SCHEMATIC ================= */
          <g>
            <text x="30" y="25" fontSize="11" fontWeight="700" fill="#475569">
              Parallel Pipe Manifold (Common Head Loss h = {formatNum(result.commonHeadLoss, 3)} m across all branches):
            </text>

            {/* Inlet Manifold */}
            <rect x="70" y="45" width="18" height="135" rx="4" fill="#0369a1" />
            <text x="35" y="115" textAnchor="middle" fontSize="9.5" fontWeight="700" fill="#0284c7">
              Q_total
            </text>
            <line x1="15" y1="112" x2="65" y2="112" stroke="#0284c7" strokeWidth="3" markerEnd="url(#eq-arrow)" />

            {/* Outlet Manifold */}
            <rect x="580" y="45" width="18" height="135" rx="4" fill="#0369a1" />
            <line x1="605" y1="112" x2="655" y2="112" stroke="#0284c7" strokeWidth="3" markerEnd="url(#eq-arrow)" />

            {/* Parallel Branches */}
            {result.branches && result.branches.map((b, idx) => {
              const count = result.branches.length;
              const spacing = 110 / Math.max(1, count - 1);
              const branchY = 55 + idx * spacing;
              const pipeH = Math.max(12, Math.min(28, (b.diameter / 0.35) * 20));

              return (
                <g key={`par-branch-${idx}`}>
                  <rect
                    x="90"
                    y={branchY - pipeH / 2}
                    width="488"
                    height={pipeH}
                    rx="3"
                    fill="url(#pipe-water-grad)"
                    stroke="#0284c7"
                    strokeWidth="1"
                    opacity="0.85"
                  />
                  {/* Branch Details */}
                  <text
                    x="334"
                    y={branchY - 4}
                    textAnchor="middle"
                    fontSize="9"
                    fontWeight="700"
                    fill="#0f172a"
                  >
                    {b.name}: L={b.length}m, D={(b.diameter * 1000).toFixed(0)}mm
                  </text>
                  <text
                    x="334"
                    y={branchY + 11}
                    textAnchor="middle"
                    fontSize="8.5"
                    fontWeight="800"
                    fill="#0369a1"
                  >
                    Flow: {formatFlow(b.flow, displayUnit)} ({b.percentage.toFixed(1)}%) | v = {b.velocity.toFixed(2)} m/s
                  </text>
                </g>
              );
            })}

            {/* Divider */}
            <line x1="30" y1="195" x2="650" y2="195" stroke="#e2e8f0" strokeWidth="1" strokeDasharray="4 4" />

            {/* Equivalent Pipe Result */}
            <text x="30" y="215" fontSize="10.5" fontWeight="700" fill="#047857">
              Equivalent Single Pipe (Carrying Q_total = {formatFlow(result.totalDischarge, displayUnit)} with same head loss):
            </text>

            <rect
              x="90"
              y="225"
              width="488"
              height={Math.max(16, Math.min(36, (result.equivalentDiameter / 0.4) * 26))}
              rx="5"
              fill="url(#eq-pipe-grad)"
              stroke="#047857"
              strokeWidth="1.5"
            />
            <text
              x="334"
              y="265"
              textAnchor="middle"
              fontSize="10"
              fontWeight="800"
              fill="#065f46"
            >
              Equivalent Pipe: Le = {result.equivalentLength} m | De = {(result.equivalentDiameter * 1000).toFixed(1)} mm ({result.equivalentDiameter.toFixed(4)} m) | Ke = {formatNum(result.Ke, 4)}
            </text>
          </g>
        )}
      </svg>
    </div>
  );
}
