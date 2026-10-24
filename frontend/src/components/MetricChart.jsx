import React from 'react';

const WIDTH = 240;
const HEIGHT = 110;
const PAD = 22;

export default function MetricChart({
  title,
  icon: Icon,
  color = '#7c5cff',
  softColor = '#efeaff',
  data = [],
  xMax = 100,
  yMin = 0,
  yMax = 1,
  valueFormatter = (v) => v.toFixed(2),
  statusLabel,
  infoTooltip,
}) {
  const points = data.map((v, i) => {
    const x = PAD + (data.length > 1 ? (i / Math.max(1, xMax - 1)) : 0) * (WIDTH - PAD * 2);
    const clamped = Math.max(yMin, Math.min(yMax, v));
    const y = HEIGHT - PAD + 6 - ((clamped - yMin) / (yMax - yMin || 1)) * (HEIGHT - PAD * 1.3);
    return [x, y];
  });

  const pathD = points.length
    ? 'M ' + points.map(([x, y]) => `${x.toFixed(1)},${y.toFixed(1)}`).join(' L ')
    : '';

  const areaD = points.length
    ? `${pathD} L ${points[points.length - 1][0].toFixed(1)},${HEIGHT - PAD + 6} L ${points[0][0].toFixed(1)},${HEIGHT - PAD + 6} Z`
    : '';

  const latest = data.length ? data[data.length - 1] : null;

  return (
    <div className="rounded-2xl bg-qq-surface border border-qq-border shadow-card p-4 flex flex-col gap-2">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1.5 text-xs font-bold text-qq-subtle">
          {Icon && <Icon className="w-3.5 h-3.5" style={{ color }} />}
          <span>{title}</span>
          {infoTooltip && (
            <span className="text-qq-faint cursor-help" title={infoTooltip}>
              ⓘ
            </span>
          )}
        </div>
        {statusLabel && (
          <span
            className="text-[10px] font-semibold px-2 py-0.5 rounded-full"
            style={{ backgroundColor: softColor, color }}
          >
            {statusLabel}
          </span>
        )}
      </div>

      <svg viewBox={`0 0 ${WIDTH} ${HEIGHT}`} className="w-full h-auto">
        {[0, 0.5, 1].map((f) => (
          <line
            key={f}
            x1={PAD}
            x2={WIDTH - PAD}
            y1={HEIGHT - PAD + 6 - f * (HEIGHT - PAD * 1.3)}
            y2={HEIGHT - PAD + 6 - f * (HEIGHT - PAD * 1.3)}
            stroke="#e6e7f2"
            strokeWidth="1"
          />
        ))}
        {areaD && <path d={areaD} fill={softColor} opacity="0.6" />}
        {pathD && (
          <path d={pathD} fill="none" stroke={color} strokeWidth="2" strokeLinejoin="round" strokeLinecap="round" />
        )}
        {points.length > 0 && (
          <circle cx={points[points.length - 1][0]} cy={points[points.length - 1][1]} r="3" fill={color} />
        )}
        <text x={PAD} y={HEIGHT - 4} fontSize="8" fill="#9397a8">0</text>
        <text x={WIDTH - PAD - 14} y={HEIGHT - 4} fontSize="8" fill="#9397a8">{xMax}</text>
        <text x={2} y={HEIGHT - PAD + 2} fontSize="8" fill="#9397a8" transform={`rotate(-90 10 ${HEIGHT - PAD})`}>
        </text>
      </svg>

      <div className="flex items-center justify-between text-[11px] text-qq-faint">
        <span>Iteraciones</span>
        <span className="font-mono font-bold text-qq-ink">
          {latest !== null ? valueFormatter(latest) : '—'}
        </span>
      </div>
    </div>
  );
}
