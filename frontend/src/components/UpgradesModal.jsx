import React from 'react';
import { Cpu, GitCompare, Layers, Lock, Sparkles, X } from 'lucide-react';

export default function UpgradesModal({
  isOpen,
  onClose,
  layers,
  useEntanglement,
  onApplyConfig,
  currentLevelId,
  allowedUpgrades = ['layers', 'entanglement'],
}) {
  if (!isOpen) return null;

  const canUseEntanglement =
    allowedUpgrades.includes('entanglement') || currentLevelId >= 3;

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4">
      <div className="w-full max-w-lg rounded-2xl bg-slate-900 border border-purple-500/40 shadow-[0_0_50px_rgba(168,85,247,0.25)] p-6 flex flex-col gap-5">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-white/10 pb-3">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-purple-500/20 border border-purple-400/40 flex items-center justify-center">
              <Cpu className="w-5 h-5 text-purple-300" />
            </div>
            <div>
              <h2 className="text-base font-extrabold tracking-wide text-white">
                QUANTUM HARDWARE LAB & UPGRADES
              </h2>
              <p className="text-xs text-slate-400">
                Modifica la arquitectura de tu Variational Quantum Classifier
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* 1. Variational Circuit Depth (Layers) */}
        <div className="bg-slate-950/80 border border-white/10 rounded-xl p-4 flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Layers className="w-4 h-4 text-cyan-400" />
              <span className="text-sm font-bold text-slate-100">
                Capas Variacionales (Data Re-Uploading Depth)
              </span>
            </div>
            <span className="text-xs font-mono text-cyan-300">
              {layers * 4} parámetros θ
            </span>
          </div>

          <p className="text-xs text-slate-400 leading-relaxed">
            Cada capa adicional re-codifica las coordenadas <code className="text-cyan-300">(x₀, x₁)</code> y añade 4 compuertas parametrizadas, generando armónicos de Fourier de mayor orden para curvar la frontera (esencial en Nivel 2).
          </p>

          <div className="grid grid-cols-3 gap-2.5 pt-1">
            {[1, 2, 3].map((l) => {
              const selected = layers === l;
              return (
                <button
                  key={l}
                  onClick={() => onApplyConfig(l, useEntanglement)}
                  className={`p-3 rounded-xl border text-left transition flex flex-col gap-1 ${
                    selected
                      ? 'bg-cyan-500/20 border-cyan-400 text-cyan-100 shadow-[0_0_15px_rgba(0,240,255,0.2)]'
                      : 'bg-slate-900 border-white/10 text-slate-300 hover:border-white/25'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-xs font-bold">DEPTH {l}</span>
                    {l === 2 && currentLevelId === 2 && (
                      <span className="text-[10px] px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-300">
                        Ideal Lvl 2
                      </span>
                    )}
                  </div>
                  <span className="text-[11px] text-slate-400">
                    {l === 1
                      ? 'Frontera Simple (0 penalización)'
                      : l === 2
                      ? 'Curva No-Lineal (-50 pts)'
                      : 'Alta Expresividad (-100 pts)'}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* 2. Quantum Entanglement (CNOT Gate) */}
        <div className="bg-slate-950/80 border border-white/10 rounded-xl p-4 flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <GitCompare className="w-4 h-4 text-purple-400" />
              <span className="text-sm font-bold text-slate-100">
                Entrelazamiento Cuántico (Compuerta CNOT)
              </span>
            </div>
            {!canUseEntanglement && (
              <span className="flex items-center gap-1 text-[11px] font-mono text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded border border-amber-400/30">
                <Lock className="w-3 h-3" /> Nivel 3
              </span>
            )}
          </div>

          <p className="text-xs text-slate-400 leading-relaxed">
            Intercala compuertas <code className="text-purple-300">CNOT(q₀, q₁)</code> entre capas. Transforma el observable en correlaciones cruzadas <code className="text-purple-300">⟨Z₀ ⊗ Z₁⟩</code> capaces de resolver patrones no separables como el XOR cuántico.
          </p>

          <div className="grid grid-cols-2 gap-2.5 pt-1">
            <button
              onClick={() => onApplyConfig(layers, false)}
              className={`p-3 rounded-xl border text-left transition ${
                !useEntanglement
                  ? 'bg-cyan-500/20 border-cyan-400 text-cyan-100'
                  : 'bg-slate-900 border-white/10 text-slate-400 hover:border-white/25'
              }`}
            >
              <div className="font-mono text-xs font-bold">CNOT: DESACTIVADO</div>
              <div className="text-[11px] text-slate-400 mt-0.5">
                Estado producto separable |ψ₀⟩ ⊗ |ψ₁⟩
              </div>
            </button>

            <button
              onClick={() => onApplyConfig(layers, true)}
              className={`p-3 rounded-xl border text-left transition ${
                useEntanglement
                  ? 'bg-purple-500/25 border-purple-400 text-purple-100 shadow-[0_0_15px_rgba(168,85,247,0.3)]'
                  : 'bg-slate-900 border-white/10 text-slate-300 hover:border-purple-400/40'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="font-mono text-xs font-bold flex items-center gap-1">
                  <Sparkles className="w-3.5 h-3.5 text-purple-300" />
                  CNOT: ACTIVO
                </span>
              </div>
              <div className="text-[11px] text-slate-400 mt-0.5">
                Entrelazamiento cuántico |Ψ⟩ activo
              </div>
            </button>
          </div>
        </div>

        {/* Footer */}
        <div className="flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-gradient-to-r from-cyan-500 to-purple-500 text-slate-950 font-bold text-xs uppercase tracking-wider hover:brightness-110 transition"
          >
            Listo para Entrenar
          </button>
        </div>
      </div>
    </div>
  );
}
