import React, { useEffect, useRef, useState } from 'react';
import { Eye, Crosshair, Layers } from 'lucide-react';

const BOUNDS = 1.5;

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

    // 1. Render interpolated Decision Boundary Heatmap
    if (decisionGrid && decisionGrid.length > 0) {
      const imgData = ctx.createImageData(width, height);
      const data = imgData.data;

      for (let py = 0; py < height; py++) {
        // py=0 is top (y = +1.5 -> v = 1.0), py=height-1 is bottom (y = -1.5 -> v = 0.0)
        const v = 1.0 - py / (height - 1);
        for (let px = 0; px < width; px++) {
          const u = px / (width - 1);
          const prob = sampleBilinear(decisionGrid, u, v);
          const idx = (py * width + px) * 4;

          // Distance from decision boundary P = 0.5
          const distFromBoundary = Math.abs(prob - 0.5);

          if (distFromBoundary < 0.016) {
            // Glowing white-cyan decision boundary contour line
            data[idx] = 215;
            data[idx + 1] = 250;
            data[idx + 2] = 255;
            data[idx + 3] = 210;
          } else if (prob >= 0.5) {
            // Class 1: Quantum Cyan (#00f0ff)
            const intensity = Math.min(1, (prob - 0.5) * 2.0);
            data[idx] = Math.round(6 + 15 * intensity);
            data[idx + 1] = Math.round(32 + 175 * intensity);
            data[idx + 2] = Math.round(52 + 195 * intensity);
            data[idx + 3] = Math.round(80 + 115 * intensity);
          } else {
            // Class 0: Neon Amber/Orange (#ff7a00)
            const intensity = Math.min(1, (0.5 - prob) * 2.0);
            data[idx] = Math.round(45 + 205 * intensity);
            data[idx + 1] = Math.round(22 + 95 * intensity);
            data[idx + 2] = Math.round(18 + 15 * intensity);
            data[idx + 3] = Math.round(80 + 115 * intensity);
          }
        }
      }
      ctx.putImageData(imgData, 0, 0);
    } else {
      ctx.fillStyle = '#0d1322';
      ctx.fillRect(0, 0, width, height);
    }

    // 2. Quantum Radar Grid Overlay
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.07)';
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

    // Center axes (x0 = 0, x1 = 0)
    ctx.strokeStyle = 'rgba(0, 240, 255, 0.22)';
    ctx.setLineDash([4, 4]);
    ctx.beginPath();
    ctx.moveTo(width / 2, 0);
    ctx.lineTo(width / 2, height);
    ctx.moveTo(0, height / 2);
    ctx.lineTo(width, height / 2);
    ctx.stroke();
    ctx.setLineDash([]);

    // Helper to map (x, y) in [-1.5, 1.5] to canvas pixel coordinates
    const toCanvasCoords = (x, y) => {
      const cx = ((x + BOUNDS) / (2 * BOUNDS)) * width;
      const cy = ((BOUNDS - y) / (2 * BOUNDS)) * height;
      return [cx, cy];
    };

    // Helper to check if point is correctly classified by current grid
    const isPointCorrect = (x, y, label) => {
      if (!decisionGrid || !decisionGrid.length) return true;
      const u = (x + BOUNDS) / (2 * BOUNDS);
      const v = (y + BOUNDS) / (2 * BOUNDS);
      const prob = sampleBilinear(decisionGrid, u, v);
      const pred = prob >= 0.5 ? 1 : 0;
      return pred === label;
    };

    // 3. Draw Training Points (Solid Glowing Circles)
    trainPoints.forEach((pt) => {
      const [cx, cy] = toCanvasCoords(pt.x, pt.y);
      const correct = isPointCorrect(pt.x, pt.y, pt.label);
      const fill = pt.label === 1 ? '#00f0ff' : '#ff8800';

      ctx.save();
      if (!correct) {
        // Subtle rose halo around misclassified points
        ctx.beginPath();
        ctx.arc(cx, cy, 9, 0, Math.PI * 2);
        ctx.strokeStyle = 'rgba(244, 63, 94, 0.85)';
        ctx.lineWidth = 1.8;
        ctx.stroke();
      }

      ctx.shadowColor = fill;
      ctx.shadowBlur = 10;
      ctx.beginPath();
      ctx.arc(cx, cy, 5.5, 0, Math.PI * 2);
      ctx.fillStyle = fill;
      ctx.fill();
      ctx.lineWidth = 1.5;
      ctx.strokeStyle = '#0a0e17';
      ctx.stroke();
      ctx.restore();
    });

    // 4. Draw Test Points (Diamonds) if enabled
    if (showTestPoints) {
      testPoints.forEach((pt) => {
        const [cx, cy] = toCanvasCoords(pt.x, pt.y);
        const correct = isPointCorrect(pt.x, pt.y, pt.label);
        const fill = pt.label === 1 ? '#38bdf8' : '#fb923c';
        const r = 6.2;

        ctx.save();
        if (!correct) {
          ctx.beginPath();
          ctx.arc(cx, cy, 10, 0, Math.PI * 2);
          ctx.strokeStyle = 'rgba(244, 63, 94, 0.9)';
          ctx.lineWidth = 1.6;
          ctx.stroke();
        }

        ctx.shadowColor = fill;
        ctx.shadowBlur = 8;
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
    <div className="rounded-2xl bg-white/5 border border-white/10 backdrop-blur-md p-4 flex flex-col gap-3 shadow-xl">
      {/* Top Header of Canvas Card */}
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-mono uppercase tracking-wider text-cyan-400">
              Quantum Hilbert Decision Space
            </span>
            {levelInfo && (
              <span className="text-xs px-2 py-0.5 rounded bg-white/10 text-slate-300 font-medium">
                {levelInfo.subtitle}
              </span>
            )}
          </div>
          <p className="text-xs text-slate-400 mt-0.5">
            {levelInfo?.description}
          </p>
        </div>

        <button
          onClick={() => setShowTestPoints((v) => !v)}
          className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium border transition ${
            showTestPoints
              ? 'bg-cyan-500/15 border-cyan-400/40 text-cyan-200'
              : 'bg-slate-900/60 border-white/10 text-slate-400'
          }`}
        >
          <Eye className="w-3.5 h-3.5" />
          <span>{showTestPoints ? 'Test Points: ON' : 'Test Points: OFF'}</span>
        </button>
      </div>

      {/* Interactive 2D Canvas */}
      <div className="relative w-full aspect-square max-w-[500px] mx-auto rounded-xl overflow-hidden border border-cyan-500/30 shadow-[0_0_30px_rgba(0,240,255,0.12)]">
        <canvas
          ref={canvasRef}
          width={500}
          height={500}
          onMouseMove={handleMouseMove}
          onMouseLeave={() => setHoverInfo(null)}
          className="w-full h-full block cursor-crosshair"
        />

        {/* Training Pulse Overlay */}
        {isTraining && (
          <div className="absolute inset-0 bg-slate-950/45 backdrop-blur-[2px] flex flex-col items-center justify-center gap-2 pointer-events-none">
            <div className="w-12 h-12 rounded-full border-2 border-cyan-400 border-t-transparent animate-spin" />
            <span className="font-mono text-xs uppercase tracking-widest text-cyan-300 bg-slate-900/90 px-3 py-1 rounded-full border border-cyan-400/30">
              Optimizing Quantum Rotations...
            </span>
          </div>
        )}

        {/* Coordinate Probe HUD */}
        {hoverInfo && (
          <div className="absolute bottom-2.5 left-2.5 bg-slate-950/90 border border-white/15 rounded-lg px-2.5 py-1.5 text-[11px] font-mono flex items-center gap-3 pointer-events-none">
            <span className="flex items-center gap-1 text-slate-300">
              <Crosshair className="w-3 h-3 text-cyan-400" />
              x₀={hoverInfo.x0}, x₁={hoverInfo.x1}
            </span>
            <span
              className={
                hoverInfo.prob >= 0.5 ? 'text-cyan-300 font-bold' : 'text-amber-400 font-bold'
              }
            >
              P(|1⟩) = {(hoverInfo.prob * 100).toFixed(1)}%
            </span>
          </div>
        )}
      </div>

      {/* Legend Bar */}
      <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-slate-300 pt-1 border-t border-white/10">
        <div className="flex items-center gap-4">
          <span className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-full bg-[#ff8800] inline-block shadow-[0_0_8px_#ff8800]" />
            <span>Clase 0 (|0⟩)</span>
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-full bg-[#00f0ff] inline-block shadow-[0_0_8px_#00f0ff]" />
            <span>Clase 1 (|1⟩)</span>
          </span>
        </div>
        <div className="flex items-center gap-4 text-[11px] text-slate-400">
          <span>● Círculo: Train</span>
          <span>◆ Diamante: Test</span>
          <span className="text-rose-400">◯ Aro Rojo: Error</span>
        </div>
      </div>
    </div>
  );
}
