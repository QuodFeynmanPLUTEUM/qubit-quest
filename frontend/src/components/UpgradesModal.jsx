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

  const canUseEntanglement = allowedUpgrades.includes('entanglement') || currentLevelId >= 3;

  return (
    <div className="fixed inset-0 z-50 bg-qq-ink/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="w-full max-w-lg rounded-2xl bg-qq-surface border border-violet-200 shadow-2xl p-6 flex flex-col gap-5">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-qq-border pb-3">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-qq-primarySoft border border-violet-200 flex items-center justify-center">
              <Cpu className="w-5 h-5 text-qq-primary" />
            </div>
            <div>
              <h2 className="text-base font-extrabold text-qq-ink">Hardware Lab & Upgrades</h2>
              <p className="text-xs text-qq-subtle">
                Modifica la arquitectura de tu Variational Quantum Classifier
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg bg-qq-bg hover:bg-violet-100 text-qq-subtle hover:text-qq-ink transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* 1. Variational Circuit Depth (Layers) */}
        <div className="bg-qq-bg border border-qq-border rounded-xl p-4 flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Layers className="w-4 h-4 text-qq-primary" />
              <span className="text-sm font-bold text-qq-ink">
                Capas Variacionales (Data Re-Uploading Depth)
              </span>
            </div>
            <span className="text-xs font-mono text-qq-primary">{layers * 4} parámetros θ</span>
          </div>

          <p className="text-xs text-qq-subtle leading-relaxed">
            Cada capa adicional re-codifica las coordenadas{' '}
            <code className="text-qq-primary">(x₀, x₁)</code> y añade 4 compuertas parametrizadas,
            generando armónicos de Fourier de mayor orden para curvar la frontera (esencial en Nivel 2).
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
                      ? 'bg-qq-primarySoft border-qq-primary text-qq-primary'
                      : 'bg-white border-qq-border text-qq-subtle hover:border-violet-300'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-xs font-bold">DEPTH {l}</span>
                    {l === 2 && currentLevelId === 2 && (
                      <span className="text-[10px] px-1.5 py-0.5 rounded bg-green-50 text-green-700">
                        Ideal Lvl 2
                      </span>
                    )}
                  </div>
                  <span className="text-[11px] text-qq-faint">
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
        <div className="bg-qq-bg border border-qq-border rounded-xl p-4 flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <GitCompare className="w-4 h-4 text-qq-primary" />
              <span className="text-sm font-bold text-qq-ink">
                Entrelazamiento Cuántico (Compuerta CNOT)
              </span>
            </div>
            {!canUseEntanglement && (
              <span className="flex items-center gap-1 text-[11px] font-mono text-amber-700 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                <Lock className="w-3 h-3" /> Nivel 3
              </span>
            )}
          </div>

          <p className="text-xs text-qq-subtle leading-relaxed">
            Intercala compuertas <code className="text-qq-primary">CNOT(q₀, q₁)</code> entre capas.
            Transforma el observable en correlaciones cruzadas{' '}
            <code className="text-qq-primary">⟨Z₀ ⊗ Z₁⟩</code> capaces de resolver patrones no
            separables como el XOR cuántico.
          </p>

          <div className="grid grid-cols-2 gap-2.5 pt-1">
            <button
              onClick={() => onApplyConfig(layers, false)}
              className={`p-3 rounded-xl border text-left transition ${
                !useEntanglement
                  ? 'bg-qq-primarySoft border-qq-primary text-qq-primary'
                  : 'bg-white border-qq-border text-qq-faint hover:border-violet-300'
              }`}
            >
              <div className="font-mono text-xs font-bold">CNOT: DESACTIVADO</div>
              <div className="text-[11px] text-qq-faint mt-0.5">Estado producto separable |ψ₀⟩ ⊗ |ψ₁⟩</div>
            </button>

            <button
              onClick={() => onApplyConfig(layers, true)}
              className={`p-3 rounded-xl border text-left transition ${
                useEntanglement
                  ? 'bg-teal-50 border-teal-400 text-teal-700'
                  : 'bg-white border-qq-border text-qq-subtle hover:border-teal-300'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="font-mono text-xs font-bold flex items-center gap-1">
                  <Sparkles className="w-3.5 h-3.5" />
                  CNOT: ACTIVO
                </span>
              </div>
              <div className="text-[11px] text-qq-faint mt-0.5">Entrelazamiento cuántico |Ψ⟩ activo</div>
            </button>
          </div>
        </div>

        {/* Footer */}
        <div className="flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-qq-primary text-white font-bold text-xs uppercase tracking-wider hover:bg-qq-primaryDark transition"
          >
            Listo para entrenar
          </button>
        </div>
      </div>
    </div>
  );
}
