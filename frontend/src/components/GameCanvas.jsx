import React, { useEffect, useRef, useState } from 'react';
import { Eye, Crosshair } from 'lucide-react';

const BOUNDS = 1.5;
const CLASS1_COLOR = [59, 130, 246];
const CLASS0_COLOR = [249, 115, 22];

function sampleBilinear(grid, u, v) {
  if (!grid || !grid.length) return 0.5;
  const rows = grid.length;
  const cols = grid[0].length;
  const x = Math.max(0, Math.min(cols - 1, u * (cols - 1)));
  const y = Math.max(0, Math.min(rows - 1, v * (rows - 1)));

  const x0 = Math.floor(x);
  const x1 = Math.min(cols - 1, x0 + 1);
  const y0 = Math.floor(y);
  const y1 = Math.min(rows - 1, y0 + 1);

  const dx = x - x0;
  const dy = y - y0;

  const v00 = grid[y0][x0];
  const v10 = grid[y0][x1];
  const v01 = grid[y1][x0];
  const v11 = grid[y1][x1];

  return (
    v00 * (1 - dx) * (1 - dy) +
    v10 * dx * (1 - dy) +
    v01 * (1 - dx) * dy +
    v11 * dx * dy
  );
}

export default function GameCanvas({
  trainPoints = [],
  testPoints = [],
  decisionGrid = [],
  isTraining = false,
  levelInfo,
}) {
  const canvasRef = useRef(null);
  const [showTestPoints, setShowTestPoints] = useState(true);
  const [hoverInfo, setHoverInfo] = useState(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const width = canvas.width;
    const height = canvas.height;

    ctx.clearRect(0, 0, width, height);
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, width, height);

    // 1. Soft decision-region fill + boundary contour
    if (decisionGrid && decisionGrid.length > 0) {
      const imgData = ctx.createImageData(width, height);
      const data = imgData.data;

      for (let py = 0; py < height; py++) {
        const v = 1.0 - py / (height - 1);
        for (let px = 0; px < width; px++) {
          const u = px / (width - 1);
          const prob = sampleBilinear(decisionGrid, u, v);
          const idx = (py * width + px) * 4;
          const dist = Math.abs(prob - 0.5);

          if (dist < 0.012) {
            data[idx] = 124;
            data[idx + 1] = 92;
            data[idx + 2] = 255;
            data[idx + 3] = 170;
          } else {
            const color = prob >= 0.5 ? CLASS1_COLOR : CLASS0_COLOR;
            const intensity = Math.min(1, dist * 2.2);
            data[idx] = color[0];
            data[idx + 1] = color[1];
            data[idx + 2] = color[2];
            data[idx + 3] = Math.round(18 + 55 * intensity);
          }
        }
      }
      ctx.putImageData(imgData, 0, 0);
    }

    // 2. Light grid overlay
    ctx.strokeStyle = 'rgba(30, 33, 48, 0.06)';
    ctx.lineWidth = 1;
    const gridSteps = 6;
    for (let i = 1; i < gridSteps; i++) {
      const pos = (width / gridSteps) * i;
      ctx.beginPath();
      ctx.moveTo(pos, 0);
      ctx.lineTo(pos, height);
      ctx.stroke();

      ctx.beginPath();
      ctx.moveTo(0, pos);
      ctx.lineTo(width, pos);
      ctx.stroke();
    }

    ctx.strokeStyle = 'rgba(30, 33, 48, 0.18)';
    ctx.beginPath();
    ctx.moveTo(width / 2, 0);
    ctx.lineTo(width / 2, height);
    ctx.moveTo(0, height / 2);
    ctx.lineTo(width, height / 2);
    ctx.stroke();

    const toCanvasCoords = (x, y) => {
      const cx = ((x + BOUNDS) / (2 * BOUNDS)) * width;
      const cy = ((BOUNDS - y) / (2 * BOUNDS)) * height;
      return [cx, cy];
    };

    const isPointCorrect = (x, y, label) => {
      if (!decisionGrid || !decisionGrid.length) return true;
      const u = (x + BOUNDS) / (2 * BOUNDS);
      const v = (y + BOUNDS) / (2 * BOUNDS);
      const prob = sampleBilinear(decisionGrid, u, v);
      const pred = prob >= 0.5 ? 1 : 0;
      return pred === label;
    };

    // 3. Training points (circles)
    trainPoints.forEach((pt) => {
      const [cx, cy] = toCanvasCoords(pt.x, pt.y);
      const correct = isPointCorrect(pt.x, pt.y, pt.label);
      const fill = pt.label === 1 ? '#2563eb' : '#ea580c';

      ctx.save();
      if (!correct) {
        ctx.beginPath();
        ctx.arc(cx, cy, 9, 0, Math.PI * 2);
        ctx.strokeStyle = 'rgba(225, 29, 72, 0.75)';
        ctx.lineWidth = 1.8;
        ctx.stroke();
      }
      ctx.beginPath();
      ctx.arc(cx, cy, 5.2, 0, Math.PI * 2);
      ctx.fillStyle = fill;
      ctx.fill();
      ctx.lineWidth = 1.4;
      ctx.strokeStyle = '#ffffff';
      ctx.stroke();
      ctx.restore();
    });

    // 4. Test points (diamonds)
    if (showTestPoints) {
      testPoints.forEach((pt) => {
        const [cx, cy] = toCanvasCoords(pt.x, pt.y);
        const correct = isPointCorrect(pt.x, pt.y, pt.label);
        const fill = pt.label === 1 ? '#60a5fa' : '#fb923c';
        const r = 6.2;

        ctx.save();
        if (!correct) {
          ctx.beginPath();
          ctx.arc(cx, cy, 10, 0, Math.PI * 2);
          ctx.strokeStyle = 'rgba(225, 29, 72, 0.85)';
          ctx.lineWidth = 1.6;
          ctx.stroke();
        }
        ctx.beginPath();
        ctx.moveTo(cx, cy - r);
        ctx.lineTo(cx + r, cy);
        ctx.lineTo(cx, cy + r);
        ctx.lineTo(cx - r, cy);
        ctx.closePath();
        ctx.fillStyle = fill;
        ctx.fill();
        ctx.lineWidth = 1.6;
        ctx.strokeStyle = '#ffffff';
        ctx.stroke();
        ctx.restore();
      });
    }
  }, [trainPoints, testPoints, decisionGrid, showTestPoints]);

  const handleMouseMove = (e) => {
    const canvas = canvasRef.current;
    if (!canvas || !decisionGrid || !decisionGrid.length) return;
    const rect = canvas.getBoundingClientRect();
    const u = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
    const v = Math.max(0, Math.min(1, 1.0 - (e.clientY - rect.top) / rect.height));
    const x0 = (u * 2 * BOUNDS - BOUNDS).toFixed(2);
    const x1 = (v * 2 * BOUNDS - BOUNDS).toFixed(2);
    const prob = sampleBilinear(decisionGrid, u, v);
    setHoverInfo({ x0, x1, prob });
  };

  return (
    <div className="rounded-2xl bg-qq-surface border border-qq-border shadow-card p-4 flex flex-col gap-3">
      {/* Top Header of Canvas Card */}
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold uppercase tracking-wider text-qq-primary">
              Espacio de Decisión Cuántico
            </span>
            {levelInfo && (
              <span className="text-xs px-2 py-0.5 rounded bg-qq-bg text-qq-subtle font-medium">
                {levelInfo.subtitle}
              </span>
            )}
          </div>
          <p className="text-xs text-qq-subtle mt-0.5">{levelInfo?.description}</p>
        </div>

        <button
          onClick={() => setShowTestPoints((v) => !v)}
          className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium border transition ${
            showTestPoints
              ? 'bg-qq-primarySoft border-violet-200 text-qq-primary'
              : 'bg-qq-bg border-qq-border text-qq-faint'
          }`}
        >
          <Eye className="w-3.5 h-3.5" />
          <span>{showTestPoints ? 'Test: ON' : 'Test: OFF'}</span>
        </button>
      </div>

      {/* Interactive 2D Canvas */}
      <div className="relative w-full aspect-square max-w-[500px] mx-auto rounded-xl overflow-hidden border border-qq-border">
        <canvas
          ref={canvasRef}
          width={500}
          height={500}
          onMouseMove={handleMouseMove}
          onMouseLeave={() => setHoverInfo(null)}
          className="w-full h-full block cursor-crosshair"
        />

        {isTraining && (
          <div className="absolute inset-0 bg-white/70 backdrop-blur-[1px] flex flex-col items-center justify-center gap-2 pointer-events-none">
            <div className="w-12 h-12 rounded-full border-[3px] border-qq-primary border-t-transparent animate-spin" />
            <span className="text-xs font-semibold text-qq-primary bg-white px-3 py-1 rounded-full border border-qq-border shadow-sm">
              Optimizando rotaciones cuánticas...
            </span>
          </div>
        )}

        {hoverInfo && (
          <div className="absolute bottom-2.5 left-2.5 bg-white border border-qq-border rounded-lg px-2.5 py-1.5 text-[11px] font-mono flex items-center gap-3 pointer-events-none shadow-sm">
            <span className="flex items-center gap-1 text-qq-subtle">
              <Crosshair className="w-3 h-3 text-qq-primary" />
              x₀={hoverInfo.x0}, x₁={hoverInfo.x1}
            </span>
            <span className={hoverInfo.prob >= 0.5 ? 'text-blue-600 font-bold' : 'text-orange-600 font-bold'}>
              P(|1⟩) = {(hoverInfo.prob * 100).toFixed(1)}%
            </span>
          </div>
        )}
      </div>

      {/* Legend Bar */}
      <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-qq-subtle pt-1 border-t border-qq-border">
        <div className="flex items-center gap-4">
          <span className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-full bg-orange-500 inline-block" />
            <span>Clase 0 (|0⟩)</span>
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-full bg-blue-600 inline-block" />
            <span>Clase 1 (|1⟩)</span>
          </span>
        </div>
        <div className="flex items-center gap-4 text-[11px] text-qq-faint">
          <span>● Círculo: Train</span>
          <span>◆ Diamante: Test</span>
          <span className="text-rose-500">◯ Aro rojo: Error</span>
        </div>
      </div>
    </div>
  );
}
