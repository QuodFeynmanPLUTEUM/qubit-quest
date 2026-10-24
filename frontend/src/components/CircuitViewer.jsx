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
    <div className="rounded-2xl bg-qq-surface border border-qq-border shadow-card p-4 flex flex-col gap-3">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <Cpu className="w-4 h-4 text-qq-primary" />
          <h3 className="text-sm font-extrabold text-qq-ink">Circuito Cuántico Parametrizado (2 Qubits)</h3>
        </div>

        <div className="flex items-center gap-1.5">
          <button
            onClick={() => setShowSliders((s) => !s)}
            className={`px-2.5 py-1 rounded-lg text-xs font-medium flex items-center gap-1 border transition ${
              showSliders
                ? 'bg-qq-primarySoft border-violet-200 text-qq-primary'
                : 'bg-white border-qq-border text-qq-faint'
            }`}
          >
            <Sliders className="w-3.5 h-3.5" />
            <span>Sliders</span>
          </button>

          <button
            onClick={() => setShowAscii((a) => !a)}
            className={`px-2.5 py-1 rounded-lg text-xs font-medium flex items-center gap-1 border transition ${
              showAscii
                ? 'bg-teal-50 border-teal-200 text-teal-700'
                : 'bg-white border-qq-border text-qq-faint'
            }`}
          >
            <Code2 className="w-3.5 h-3.5" />
            <span>Qiskit ASCII</span>
          </button>
        </div>
      </div>

      {/* Visual Quantum Circuit Wire Diagram */}
      <div className="bg-qq-bg border border-qq-border rounded-xl p-3 overflow-x-auto">
        <div className="min-w-[460px] flex flex-col gap-4 relative py-1">
          {/* Qubit 0 Wire */}
          <div className="flex items-center gap-2 relative">
            <span className="w-12 font-mono text-xs font-bold text-qq-primary shrink-0">q₀ |0⟩</span>
            <div className="flex-1 flex items-center gap-2 relative">
              <div className="absolute inset-x-0 h-0.5 bg-qq-border z-0" />
              {layerIndices.map((l) => {
                const idxRy = 4 * l;
                const idxRz = 4 * l + 2;
                const valRy = (parameters[idxRy] ?? 0).toFixed(2);
                const valRz = (parameters[idxRz] ?? 0).toFixed(2);
                return (
                  <React.Fragment key={`q0-l-${l}`}>
                    <div className="z-10 px-2 py-1 rounded bg-violet-50 border border-violet-200 text-[10px] font-mono text-violet-700 shadow-sm">
                      Ry(x₀)
                    </div>
                    <div className="z-10 px-2 py-1 rounded bg-sky-50 border border-sky-200 text-[10px] font-mono text-sky-700 shadow-sm">
                      Ry({valRy})
                    </div>
                    <div className="z-10 px-2 py-1 rounded bg-sky-50 border border-sky-200 text-[10px] font-mono text-sky-700 shadow-sm">
                      Rz({valRz})
                    </div>
                    {useEntanglement && (
                      <div className="z-10 w-6 h-6 rounded-full bg-teal-500 border border-teal-500 flex items-center justify-center text-white font-bold text-xs">
                        ●
                      </div>
                    )}
                  </React.Fragment>
                );
              })}
              <div className="z-10 ml-auto px-2 py-1 rounded bg-rose-50 border border-rose-200 text-[10px] font-mono text-rose-700">
                ⟨Z₀⟩
              </div>
            </div>
          </div>

          {/* Qubit 1 Wire */}
          <div className="flex items-center gap-2 relative">
            <span className="w-12 font-mono text-xs font-bold text-qq-primary shrink-0">q₁ |0⟩</span>
            <div className="flex-1 flex items-center gap-2 relative">
              <div className="absolute inset-x-0 h-0.5 bg-qq-border z-0" />
              {layerIndices.map((l) => {
                const idxRy = 4 * l + 1;
                const idxRz = 4 * l + 3;
                const valRy = (parameters[idxRy] ?? 0).toFixed(2);
                const valRz = (parameters[idxRz] ?? 0).toFixed(2);
                return (
                  <React.Fragment key={`q1-l-${l}`}>
                    <div className="z-10 px-2 py-1 rounded bg-violet-50 border border-violet-200 text-[10px] font-mono text-violet-700 shadow-sm">
                      Ry(x₁)
                    </div>
                    <div className="z-10 px-2 py-1 rounded bg-sky-50 border border-sky-200 text-[10px] font-mono text-sky-700 shadow-sm">
                      Ry({valRy})
                    </div>
                    <div className="z-10 px-2 py-1 rounded bg-sky-50 border border-sky-200 text-[10px] font-mono text-sky-700 shadow-sm">
                      Rz({valRz})
                    </div>
                    {useEntanglement && (
                      <div className="z-10 w-6 h-6 rounded-full bg-teal-100 border-2 border-teal-500 flex items-center justify-center text-teal-700 font-bold text-xs">
                        ⊕
                      </div>
                    )}
                  </React.Fragment>
                );
              })}
              <div className="z-10 ml-auto px-2 py-1 rounded bg-rose-50 border border-rose-200 text-[10px] font-mono text-rose-700">
                ⟨Z₁⟩
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Interactive Manual Angle Sliders (0 Coherence Cost) */}
      {showSliders && (
        <div className="bg-qq-bg border border-qq-border rounded-xl p-3">
          <div className="flex items-center justify-between text-[11px] text-qq-subtle mb-2">
            <span>Ajuste manual de ángulos variacionales θ (Costo: 0 Coherencia)</span>
            <span className="font-mono text-qq-primary">[-π, +π] rad</span>
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
                <div key={idx} className="bg-white border border-qq-border rounded-lg p-2 flex flex-col gap-1">
                  <div className="flex items-center justify-between text-[10px] font-mono">
                    <span className="text-qq-subtle">
                      θ<sub>{idx}</sub> {gateLabel}
                    </span>
                    <span className="text-qq-primary font-bold">{Number(val).toFixed(2)}</span>
                  </div>
                  <input
                    type="range"
                    min="-3.14"
                    max="3.14"
                    step="0.05"
                    value={val}
                    disabled={disabled}
                    onChange={(e) => handleSliderChange(idx, e.target.value)}
                    className="w-full accent-qq-primary cursor-pointer h-1.5 bg-qq-bg rounded-lg"
                  />
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Raw Qiskit Circuit ASCII Drawer */}
      {showAscii && circuitAscii && (
        <pre className="bg-qq-ink border border-qq-border rounded-xl p-3 text-[11px] font-mono text-violet-200 overflow-x-auto leading-snug">
          {circuitAscii}
        </pre>
      )}
    </div>
  );
}
