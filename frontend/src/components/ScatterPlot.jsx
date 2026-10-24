import React, { useEffect, useRef, useState } from 'react';
import { Crosshair } from 'lucide-react';

const BOUNDS = 1.5;
const SIZE = { width: 720, height: 450 };
const PLOT = { left: 64, top: 20, width: 632, height: 368 };
const CLASS1_COLOR = [59, 130, 246]; // blue-500
const CLASS0_COLOR = [249, 115, 22]; // orange-500

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

export default function ScatterPlot({
  trainPoints = [],
  testPoints = [],
  decisionGrid = [],
  isTraining = false,
}) {
  const canvasRef = useRef(null);
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

    const toCanvasCoords = (x, y) => [
      PLOT.left + ((x + BOUNDS) / (2 * BOUNDS)) * PLOT.width,
      PLOT.top + ((BOUNDS - y) / (2 * BOUNDS)) * PLOT.height,
    ];

    // Keep the prediction surface inside the axes, leaving room for tick labels.
    if (decisionGrid.length) {
      const image = ctx.createImageData(PLOT.width, PLOT.height);
      for (let py = 0; py < PLOT.height; py++) {
        for (let px = 0; px < PLOT.width; px++) {
          const prob = sampleBilinear(decisionGrid, px / (PLOT.width - 1), 1 - py / (PLOT.height - 1));
          const color = prob >= 0.5 ? CLASS1_COLOR : CLASS0_COLOR;
          const offset = (py * PLOT.width + px) * 4;
          image.data.set([...color, Math.round(20 + 48 * Math.min(1, Math.abs(prob - 0.5) * 2.2))], offset);
        }
      }
      ctx.putImageData(image, PLOT.left, PLOT.top);
    }

    ctx.font = '16px system-ui, sans-serif';
    ctx.fillStyle = '#64748b';
    for (let i = 0; i <= 6; i++) {
      const value = -BOUNDS + i * 0.5;
      const [x, y] = toCanvasCoords(value, value);
      ctx.strokeStyle = value === 0 ? '#94a3b8' : '#d8dee9';
      ctx.lineWidth = value === 0 ? 1.2 : 0.8;
      ctx.setLineDash(value === 0 ? [] : [4, 4]);
      ctx.beginPath();
      ctx.moveTo(x, PLOT.top);
      ctx.lineTo(x, PLOT.top + PLOT.height);
      ctx.moveTo(PLOT.left, y);
      ctx.lineTo(PLOT.left + PLOT.width, y);
      ctx.stroke();
      ctx.setLineDash([]);
      ctx.strokeStyle = '#64748b';
      ctx.beginPath();
      ctx.moveTo(x, PLOT.top + PLOT.height);
      ctx.lineTo(x, PLOT.top + PLOT.height + 6);
      ctx.moveTo(PLOT.left - 6, y);
      ctx.lineTo(PLOT.left, y);
      ctx.stroke();
      const label = value.toLocaleString('es-PE', { maximumFractionDigits: 1 });
      ctx.textAlign = 'center';
      ctx.textBaseline = 'top';
      ctx.fillText(label, x, PLOT.top + PLOT.height + 10);
      ctx.textAlign = 'right';
      ctx.textBaseline = 'middle';
      ctx.fillText(label, PLOT.left - 12, y);
    }
    ctx.strokeStyle = '#64748b';
    ctx.lineWidth = 1.6;
    ctx.beginPath();
    ctx.moveTo(PLOT.left, PLOT.top);
    ctx.lineTo(PLOT.left, PLOT.top + PLOT.height);
    ctx.lineTo(PLOT.left + PLOT.width, PLOT.top + PLOT.height);
    ctx.stroke();
    ctx.fillStyle = '#334155';
    ctx.font = '600 18px system-ui, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('X', PLOT.left + PLOT.width / 2, height - 12);
    ctx.save();
    ctx.translate(16, PLOT.top + PLOT.height / 2);
    ctx.rotate(-Math.PI / 2);
    ctx.fillText('Y', 0, 0);
    ctx.restore();

    ctx.save();
    ctx.beginPath();
    ctx.rect(PLOT.left, PLOT.top, PLOT.width, PLOT.height);
    ctx.clip();
    // Trace the actual 0.5 contour rather than painting a thick probability band.
    if (decisionGrid.length > 1) {
      const rows = decisionGrid.length;
      const cols = decisionGrid[0].length;
      ctx.strokeStyle = '#9975f5';
      ctx.lineWidth = 1.8;
      ctx.setLineDash([6, 5]);
      let distance = 0;
      for (let row = 0; row < rows - 1; row++) {
        for (let col = 0; col < cols - 1; col++) {
          const corners = [
            [col, row, decisionGrid[row][col]],
            [col + 1, row, decisionGrid[row][col + 1]],
            [col + 1, row + 1, decisionGrid[row + 1][col + 1]],
            [col, row + 1, decisionGrid[row + 1][col]],
          ];
          const crossings = [];
          for (let edge = 0; edge < 4; edge++) {
            const a = corners[edge], b = corners[(edge + 1) % 4];
            if ((a[2] >= 0.5) === (b[2] >= 0.5)) continue;
            const t = (0.5 - a[2]) / (b[2] - a[2]);
            crossings.push([
              PLOT.left + (a[0] + t * (b[0] - a[0])) / (cols - 1) * PLOT.width,
              PLOT.top + (1 - (a[1] + t * (b[1] - a[1])) / (rows - 1)) * PLOT.height,
            ]);
          }
          for (let i = 0; i + 1 < crossings.length; i += 2) {
            const [a, b] = [crossings[i], crossings[i + 1]];
            ctx.lineDashOffset = -distance;
            ctx.beginPath();
            ctx.moveTo(...a);
            ctx.lineTo(...b);
            ctx.stroke();
            distance += Math.hypot(b[0] - a[0], b[1] - a[1]);
          }
        }
      }
      ctx.setLineDash([]);
    }

    const isPointCorrect = (x, y, label) => {
      if (!decisionGrid || !decisionGrid.length) return true;
      const u = (x + BOUNDS) / (2 * BOUNDS);
      const v = (y + BOUNDS) / (2 * BOUNDS);
      const prob = sampleBilinear(decisionGrid, u, v);
      const pred = prob >= 0.5 ? 1 : 0;
      return pred === label;
    };

    const drawPoints = (pts, radius) => {
      pts.forEach((pt) => {
        const [cx, cy] = toCanvasCoords(pt.x, pt.y);
        const correct = isPointCorrect(pt.x, pt.y, pt.label);
        const fill = pt.label === 1 ? '#2563eb' : '#ea580c';

        ctx.save();
        if (!correct) {
          ctx.beginPath();
          ctx.arc(cx, cy, radius + 3.5, 0, Math.PI * 2);
          ctx.strokeStyle = 'rgba(225, 29, 72, 0.75)';
          ctx.lineWidth = 1.6;
          ctx.stroke();
        }
        ctx.beginPath();
        ctx.arc(cx, cy, radius, 0, Math.PI * 2);
        ctx.fillStyle = fill;
        ctx.fill();
        ctx.lineWidth = 1.4;
        ctx.strokeStyle = '#ffffff';
        ctx.stroke();
        ctx.restore();
      });
    };

    drawPoints(trainPoints, 4);
    drawPoints(testPoints, 4);
    ctx.restore();
  }, [trainPoints, testPoints, decisionGrid]);

  const handleMouseMove = (e) => {
    const canvas = canvasRef.current;
    if (!canvas || !decisionGrid || !decisionGrid.length) return;
    const rect = canvas.getBoundingClientRect();
    const px = (e.clientX - rect.left) / rect.width * SIZE.width;
    const py = (e.clientY - rect.top) / rect.height * SIZE.height;
    const u = (px - PLOT.left) / PLOT.width;
    const v = 1 - (py - PLOT.top) / PLOT.height;
    if (u < 0 || u > 1 || v < 0 || v > 1) {
      setHoverInfo(null);
      return;
    }
    const x0 = (u * 2 * BOUNDS - BOUNDS).toFixed(2);
    const x1 = (v * 2 * BOUNDS - BOUNDS).toFixed(2);
    const prob = sampleBilinear(decisionGrid, u, v);
    setHoverInfo({ x0, x1, prob });
  };

  return (
    <div className="relative w-full aspect-[8/5] mx-auto bg-white">
      <canvas
        ref={canvasRef}
        role="img"
        aria-label="Plano cartesiano: eje X horizontal y eje Y vertical, de −1,5 a 1,5. Puntos de datos y frontera de decisión del clasificador."
        width={SIZE.width}
        height={SIZE.height}
        onMouseMove={handleMouseMove}
        onMouseLeave={() => setHoverInfo(null)}
        className="w-full h-full block cursor-crosshair"
      />

      {isTraining && (
        <div className="absolute top-2 right-3 bg-white/95 rounded-lg px-3 py-2 shadow-sm flex items-center gap-2 pointer-events-none">
          <div className="w-5 h-5 rounded-full border-[3px] border-qq-primary border-t-transparent animate-spin" />
          <span className="text-xs font-semibold text-qq-primary bg-white px-3 py-1 rounded-full border border-qq-border shadow-sm">
            Entrenando circuito cuántico...
          </span>
        </div>
      )}

      {hoverInfo && (
        <div className="absolute bottom-2.5 left-2.5 bg-white border border-qq-border rounded-lg px-2.5 py-1.5 text-[11px] font-mono flex items-center gap-3 pointer-events-none shadow-sm">
          <span className="flex items-center gap-1 text-qq-subtle">
            <Crosshair className="w-3 h-3 text-qq-primary" />
            X={hoverInfo.x0}, Y={hoverInfo.x1}
          </span>
          <span className={hoverInfo.prob >= 0.5 ? 'text-blue-600 font-bold' : 'text-orange-600 font-bold'}>
            P(azul) = {(hoverInfo.prob * 100).toFixed(1)}%
          </span>
        </div>
      )}
    </div>
  );
}
