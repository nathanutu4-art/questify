'use client';

import React from 'react';
import { UserCategoryXP } from '@/types/quest';

interface RadarChartProps {
  data: UserCategoryXP[];
  size?: number;
}

export const RadarChart: React.FC<RadarChartProps> = ({ data, size = 300 }) => {
  if (!data || data.length === 0) return null;

  const center = size / 2;
  const outerRadius = size * 0.40;
  const innerRadius = size * 0.32;
  const count = data.length;

  // Max value calculation (min 200 XP for scaling)
  const maxXP = Math.max(200, ...data.map((d) => d.xp));

  // Angles for each vertex (starting from top, clockwise)
  const getCoordinates = (index: number, radius: number) => {
    const angle = (Math.PI * 2 / count) * index - Math.PI / 2;
    const x = center + radius * Math.cos(angle);
    const y = center + radius * Math.sin(angle);
    return { x, y, angle };
  };

  // Precomputed coordinates for 5 vertices
  const vertexCoords = data.map((_, i) => getCoordinates(i, outerRadius));
  const innerVertexCoords = data.map((_, i) => getCoordinates(i, innerRadius));

  // Star lines: connecting i to (i + 2) % count (pentagram)
  const starPath = data
    .map((_, i) => {
      const targetIdx = (i * 2) % count;
      const pt = innerVertexCoords[targetIdx];
      return `${i === 0 ? 'M' : 'L'} ${pt.x} ${pt.y}`;
    })
    .join(' ') + ' Z';

  // Runic glyphs around the circle
  const runicSymbols = ['ᚠ', 'ᚢ', 'ᚦ', 'ᚨ', 'ᚱ', 'ᚲ', 'ᚷ', 'ᚹ', 'ᚺ', 'ᚾ', 'ᛁ', 'ᛃ', 'ᛈ', 'ᛇ', 'ᛉ', 'ᛊ', 'ᛏ', 'ᛒ', 'ᛖ', 'ᛗ', 'ᛚ', 'ᛜ', 'ᛞ', 'ᛟ'];

  return (
    <div className="relative flex flex-col items-center justify-center select-none py-2">
      <svg width={size} height={size} className="overflow-visible">
        <defs>
          {/* Glowing Filter */}
          <filter id="arcaneGlow" x="-30%" y="-30%" width="160%" height="160%">
            <feGaussianBlur stdDeviation="3" result="blur" />
            <feComposite in="SourceGraphic" in2="blur" operator="over" />
          </filter>

          {/* Golden Sheen Gradient */}
          <linearGradient id="goldArcane" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#fef08a" stopOpacity="0.9" />
            <stop offset="50%" stopColor="#d97706" stopOpacity="0.8" />
            <stop offset="100%" stopColor="#854d0e" stopOpacity="0.9" />
          </linearGradient>

          {/* Parchment Line Color */}
          <linearGradient id="runicBronze" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#eab308" stopOpacity="0.7" />
            <stop offset="100%" stopColor="#a16207" stopOpacity="0.5" />
          </linearGradient>
        </defs>

        {/* 1. Outer Runestone Circles */}
        <circle
          cx={center}
          cy={center}
          r={outerRadius + 8}
          fill="none"
          stroke="url(#runicBronze)"
          strokeWidth="1.5"
          strokeDasharray="4 2"
        />
        <circle
          cx={center}
          cy={center}
          r={outerRadius}
          fill="#0c1017"
          fillOpacity="0.85"
          stroke="#ca8a04"
          strokeWidth="2"
        />
        <circle
          cx={center}
          cy={center}
          r={outerRadius - 12}
          fill="none"
          stroke="#a16207"
          strokeWidth="1"
        />
        <circle
          cx={center}
          cy={center}
          r={innerRadius}
          fill="none"
          stroke="#ca8a04"
          strokeWidth="1.2"
        />

        {/* 2. Runic Inscriptions along the circle */}
        {runicSymbols.map((rune, idx) => {
          const angle = (idx / runicSymbols.length) * Math.PI * 2;
          const r = outerRadius - 6;
          const x = center + r * Math.cos(angle);
          const y = center + r * Math.sin(angle);
          return (
            <text
              key={idx}
              x={x}
              y={y}
              fontSize="8"
              fill="#eab308"
              opacity="0.65"
              textAnchor="middle"
              dominantBaseline="middle"
              className="font-serif"
            >
              {rune}
            </text>
          );
        })}

        {/* 3. Pentagram & Geometric Star Lines */}
        <path
          d={starPath}
          fill="none"
          stroke="#a16207"
          strokeWidth="1.5"
          strokeDasharray="3 3"
          opacity="0.85"
        />

        {/* Inner concentric web lines */}
        {[0.4, 0.7].map((scale, sIdx) => (
          <circle
            key={sIdx}
            cx={center}
            cy={center}
            r={innerRadius * scale}
            fill="none"
            stroke="#ca8a04"
            strokeWidth="0.8"
            opacity="0.5"
          />
        ))}

        {/* Central Alchemical Sigil Core */}
        <circle
          cx={center}
          cy={center}
          r={16}
          fill="#1e180d"
          stroke="#eab308"
          strokeWidth="1.5"
        />
        <text
          x={center}
          y={center + 1}
          fontSize="12"
          fill="#fef08a"
          textAnchor="middle"
          dominantBaseline="middle"
          className="font-bold select-none"
        >
          ψ
        </text>

        {/* 4. Mana Vials / Radiant Cylinders corresponding to XP */}
        {data.map((cat, i) => {
          const angle = (Math.PI * 2 / count) * i - Math.PI / 2;
          // Length scaled between 22px and innerRadius - 8px
          const ratio = Math.min(1, Math.max(0.18, cat.xp / maxXP));
          const vialLength = 22 + ratio * (innerRadius - 32);

          const endX = center + vialLength * Math.cos(angle);
          const endY = center + vialLength * Math.sin(angle);
          const startX = center + 14 * Math.cos(angle);
          const startY = center + 14 * Math.sin(angle);

          return (
            <g key={cat.category_id}>
              {/* Outer Glow */}
              <line
                x1={startX}
                y1={startY}
                x2={endX}
                y2={endY}
                stroke={cat.color || '#38bdf8'}
                strokeWidth="10"
                strokeLinecap="round"
                opacity="0.25"
                filter="url(#arcaneGlow)"
              />
              {/* Mana Cylinder Glass Tube */}
              <line
                x1={startX}
                y1={startY}
                x2={endX}
                y2={endY}
                stroke={cat.color || '#38bdf8'}
                strokeWidth="6"
                strokeLinecap="round"
                className="transition-all duration-700 ease-out"
              />
              {/* Core Brightness Highlight */}
              <line
                x1={startX}
                y1={startY}
                x2={endX}
                y2={endY}
                stroke="#ffffff"
                strokeWidth="1.8"
                strokeLinecap="round"
                opacity="0.75"
              />
            </g>
          );
        })}

        {/* 5. Vertex Orbs & Nodes */}
        {data.map((cat, i) => {
          const coord = vertexCoords[i];
          const labelCoord = getCoordinates(i, outerRadius + 22);

          return (
            <g key={`node-${cat.category_id}`}>
              {/* Connector line to node */}
              <line
                x1={center}
                y1={center}
                x2={coord.x}
                y2={coord.y}
                stroke="#ca8a04"
                strokeWidth="1"
                opacity="0.5"
              />

              {/* Node Outer Ring */}
              <circle
                cx={coord.x}
                cy={coord.y}
                r="11"
                fill="#121824"
                stroke="#ca8a04"
                strokeWidth="2"
                className="drop-shadow-md"
              />

              {/* Node Center Jewel */}
              <circle
                cx={coord.x}
                cy={coord.y}
                r="7"
                fill={cat.color || '#38bdf8'}
                className="drop-shadow-[0_0_6px_currentColor]"
              />

              {/* Category Label */}
              <text
                x={labelCoord.x}
                y={labelCoord.y}
                fontSize="10"
                fontWeight="700"
                fill="#fde68a"
                textAnchor="middle"
                dominantBaseline="middle"
                className="font-serif tracking-wider"
              >
                {cat.category_name}
              </text>
            </g>
          );
        })}
      </svg>
    </div>
  );
};
