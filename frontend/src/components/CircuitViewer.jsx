import React, { useState } from 'react';
import { Code2, Cpu, Sliders } from 'lucide-react';

export default function CircuitViewer({
  layers = 1,
  useEntanglement = false,
  parameters = [],
  circuitAscii = '',
  onManualParameterChange,
  disabled = false,
}) {
  const [showAscii, setShowAscii] = useState(false);
  const [showSliders, setShowSliders] = useState(true);

  const layerIndices = Array.from({ length: layers }, (_, i) => i);

  const handleSliderChange = (index, newVal) => {
    if (!onManualParameterChange || disabled) return;
    const updated = [...parameters];
    updated[index] = parseFloat(newVal);
    onManualParameterChange(updated);
  };

  return (
    <div className="rounded-2xl bg-white/5 border border-white/10 backdrop-blur-md p-4 flex flex-col gap-3 shadow-xl">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <Cpu className="w-4 h-4 text-purple-400" />
          <h3 className="text-sm font-bold uppercase tracking-wider text-slate-100">
            Parameterized Quantum Circuit (2 Qubits)
          </h3>
        </div>

        <div className="flex items-center gap-1.5">
          <button
            onClick={() => setShowSliders((s) => !s)}
            className={`px-2.5 py-1 rounded-lg text-xs font-medium flex items-center gap-1 border transition ${
              showSliders
                ? 'bg-cyan-500/15 border-cyan-400/40 text-cyan-200'
                : 'bg-slate-900/70 border-white/10 text-slate-400'
            }`}
          >
            <Sliders className="w-3.5 h-3.5" />
            <span>Gate Sliders</span>
          </button>

          <button
            onClick={() => setShowAscii((a) => !a)}
            className={`px-2.5 py-1 rounded-lg text-xs font-medium flex items-center gap-1 border transition ${
              showAscii
                ? 'bg-purple-500/20 border-purple-400/40 text-purple-200'
                : 'bg-slate-900/70 border-white/10 text-slate-400'
            }`}
          >
            <Code2 className="w-3.5 h-3.5" />
            <span>Qiskit ASCII</span>
          </button>
        </div>
      </div>

      {/* Visual Quantum Circuit Wire Diagram */}
      <div className="bg-slate-950/90 border border-white/10 rounded-xl p-3 overflow-x-auto">
        <div className="min-w-[460px] flex flex-col gap-4 relative py-1">
          {/* Qubit 0 Wire */}
          <div className="flex items-center gap-2 relative">
            <span className="w-12 font-mono text-xs font-bold text-cyan-300 shrink-0">
              q₀ |0⟩
            </span>
            <div className="flex-1 flex items-center gap-2 relative">
              <div className="absolute inset-x-0 h-0.5 bg-slate-700 z-0" />
              {layerIndices.map((l) => {
                const idxRy = 4 * l;
                const idxRz = 4 * l + 2;
                const valRy = (parameters[idxRy] ?? 0).toFixed(2);
                const valRz = (parameters[idxRz] ?? 0).toFixed(2);
                return (
                  <React.Fragment key={`q0-l-${l}`}>
                    <div className="z-10 px-2 py-1 rounded bg-sky-950 border border-sky-400/50 text-[10px] font-mono text-sky-200 shadow">
                      Ry(x₀)
                    </div>
                    <div className="z-10 px-2 py-1 rounded bg-cyan-950 border border-cyan-400/60 text-[10px] font-mono text-cyan-200 shadow">
                      Ry({valRy})
                    </div>
                    <div className="z-10 px-2 py-1 rounded bg-purple-950 border border-purple-400/60 text-[10px] font-mono text-purple-200 shadow">
                      Rz({valRz})
                    </div>
                    {useEntanglement && (
                      <div className="z-10 w-6 h-6 rounded-full bg-amber-500/20 border border-amber-400 flex items-center justify-center text-amber-300 font-bold text-xs">
                        ●
                      </div>
                    )}
                  </React.Fragment>
                );
              })}
              <div className="z-10 ml-auto px-2 py-1 rounded bg-emerald-950 border border-emerald-400/50 text-[10px] font-mono text-emerald-300">
                ⟨Z₀⟩
              </div>
            </div>
          </div>

          {/* Qubit 1 Wire */}
          <div className="flex items-center gap-2 relative">
            <span className="w-12 font-mono text-xs font-bold text-purple-300 shrink-0">
              q₁ |0⟩
            </span>
            <div className="flex-1 flex items-center gap-2 relative">
              <div className="absolute inset-x-0 h-0.5 bg-slate-700 z-0" />
              {layerIndices.map((l) => {
                const idxRy = 4 * l + 1;
                const idxRz = 4 * l + 3;
                const valRy = (parameters[idxRy] ?? 0).toFixed(2);
                const valRz = (parameters[idxRz] ?? 0).toFixed(2);
                return (
                  <React.Fragment key={`q1-l-${l}`}>
                    <div className="z-10 px-2 py-1 rounded bg-sky-950 border border-sky-400/50 text-[10px] font-mono text-sky-200 shadow">
                      Ry(x₁)
                    </div>
                    <div className="z-10 px-2 py-1 rounded bg-cyan-950 border border-cyan-400/60 text-[10px] font-mono text-cyan-200 shadow">
                      Ry({valRy})
                    </div>
                    <div className="z-10 px-2 py-1 rounded bg-purple-950 border border-purple-400/60 text-[10px] font-mono text-purple-200 shadow">
                      Rz({valRz})
                    </div>
                    {useEntanglement && (
                      <div className="z-10 w-6 h-6 rounded-full bg-amber-500/30 border border-amber-400 flex items-center justify-center text-amber-200 font-bold text-xs shadow-[0_0_10px_rgba(251,191,36,0.4)]">
                        ⊕
                      </div>
                    )}
                  </React.Fragment>
                );
              })}
              <div className="z-10 ml-auto px-2 py-1 rounded bg-emerald-950 border border-emerald-400/50 text-[10px] font-mono text-emerald-300">
                ⟨Z₁⟩
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Interactive Manual Angle Sliders (0 Coherence Cost) */}
      {showSliders && (
        <div className="bg-slate-900/75 border border-white/10 rounded-xl p-3">
          <div className="flex items-center justify-between text-[11px] text-slate-400 mb-2">
            <span>Ajuste Manual de Ángulos Variacionales θ (Costo: 0 Coherencia)</span>
            <span className="font-mono text-cyan-300">[-π, +π] rad</span>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 max-h-40 overflow-y-auto pr-1">
            {parameters.map((val, idx) => {
              const layerNum = Math.floor(idx / 4) + 1;
              const gatePos = idx % 4;
              const gateLabel =
                gatePos === 0
                  ? `L${layerNum} Ry(q₀)`
                  : gatePos === 1
                  ? `L${layerNum} Ry(q₁)`
                  : gatePos === 2
                  ? `L${layerNum} Rz(q₀)`
                  : `L${layerNum} Rz(q₁)`;
              return (
                <div
                  key={idx}
                  className="bg-slate-950/80 border border-white/10 rounded-lg p-2 flex flex-col gap-1"
                >
                  <div className="flex items-center justify-between text-[10px] font-mono">
                    <span className="text-slate-300">
                      θ<sub>{idx}</sub> {gateLabel}
                    </span>
                    <span className="text-cyan-300 font-bold">{Number(val).toFixed(2)}</span>
                  </div>
                  <input
                    type="range"
                    min="-3.14"
                    max="3.14"
                    step="0.05"
                    value={val}
                    disabled={disabled}
                    onChange={(e) => handleSliderChange(idx, e.target.value)}
                    className="w-full accent-cyan-400 cursor-pointer h-1.5 bg-slate-800 rounded-lg"
                  />
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Raw Qiskit Circuit ASCII Drawer */}
      {showAscii && circuitAscii && (
        <pre className="bg-slate-950 border border-purple-500/30 rounded-xl p-3 text-[11px] font-mono text-purple-200 overflow-x-auto leading-snug">
          {circuitAscii}
        </pre>
      )}
    </div>
  );
}
