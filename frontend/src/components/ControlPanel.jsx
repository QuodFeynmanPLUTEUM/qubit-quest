import React from 'react';
import {
  Activity,
  Cpu,
  Lightbulb,
  Play,
  RotateCcw,
  Target,
  TrendingDown,
  Zap,
} from 'lucide-react';

export default function ControlPanel({
  epochs,
  onChangeEpochs,
  onTrain,
  onReset,
  onOpenUpgrades,
  isTraining,
  coherence,
  estimatedCost,
  trainAccuracy,
  testAccuracy,
  targetAccuracy = 0.85,
  lossHistory = [],
  layers,
  useEntanglement,
  levelInfo,
  quantumTelemetry,
}) {
  const testAccPct = Math.round((testAccuracy || 0) * 100);
  const trainAccPct = Math.round((trainAccuracy || 0) * 100);
  const targetPct = Math.round(targetAccuracy * 100);
  const latestLoss =
    lossHistory && lossHistory.length > 0
      ? lossHistory[lossHistory.length - 1]
      : null;

  const canTrain = coherence > 0 && !isTraining;

  return (
    <div className="rounded-2xl bg-white/5 border border-white/10 backdrop-blur-md p-4 flex flex-col gap-4 shadow-xl">
      {/* Section Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Activity className="w-4 h-4 text-cyan-400" />
          <h2 className="text-sm font-bold uppercase tracking-wider text-slate-100">
            Quantum Training Cockpit
          </h2>
        </div>
        <div className="flex items-center gap-2 text-xs font-mono">
          <span className="px-2 py-0.5 rounded bg-cyan-500/15 border border-cyan-400/30 text-cyan-300">
            Depth: {layers}L
          </span>
          <span
            className={`px-2 py-0.5 rounded border ${
              useEntanglement
                ? 'bg-purple-500/20 border-purple-400/40 text-purple-300'
                : 'bg-slate-800/80 border-white/10 text-slate-400'
            }`}
          >
            CNOT: {useEntanglement ? 'ON' : 'OFF'}
          </span>
        </div>
      </div>

      {/* Main Action Controls */}
      <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 items-stretch">
        {/* Epochs per Pulse Selector */}
        <div className="sm:col-span-5 bg-slate-900/80 border border-white/10 rounded-xl p-3 flex flex-col justify-between">
          <div className="flex items-center justify-between text-xs text-slate-400 mb-2">
            <span>Épocas por Pulso</span>
            <span className="font-mono text-amber-300 flex items-center gap-1">
              <Zap className="w-3 h-3" /> -{estimatedCost} coh
            </span>
          </div>
          <div className="grid grid-cols-4 gap-1.5">
            {[5, 10, 15, 20].map((ep) => (
              <button
                key={ep}
                onClick={() => onChangeEpochs(ep)}
                disabled={isTraining}
                className={`py-1.5 rounded-lg font-mono text-xs font-bold transition ${
                  epochs === ep
                    ? 'bg-cyan-500 text-slate-950 shadow-[0_0_12px_rgba(0,240,255,0.5)]'
                    : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                }`}
              >
                {ep}
              </button>
            ))}
          </div>
        </div>

        {/* PULSE QUANTUM TRAIN Button */}
        <div className="sm:col-span-7 flex flex-col gap-2">
          <button
            onClick={onTrain}
            disabled={!canTrain}
            className={`w-full flex-1 py-3 px-4 rounded-xl font-extrabold text-sm tracking-wider uppercase flex items-center justify-center gap-2.5 transition-all ${
              canTrain
                ? 'bg-gradient-to-r from-cyan-500 via-sky-400 to-purple-500 text-slate-950 hover:brightness-110 active:scale-[0.99] quantum-pulse-btn'
                : 'bg-slate-800 text-slate-500 border border-white/5 cursor-not-allowed'
            }`}
          >
            <Play className="w-4 h-4 fill-current" />
            <span>
              {isTraining
                ? 'Entrenando Circuito...'
                : coherence <= 0
                ? 'Sin Coherencia (Reset)'
                : 'PULSE QUANTUM TRAIN'}
            </span>
          </button>

          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={onReset}
              disabled={isTraining}
              className="py-1.5 px-3 rounded-lg bg-slate-900/90 hover:bg-slate-800 border border-white/10 text-xs font-semibold text-slate-300 flex items-center justify-center gap-1.5 transition"
            >
              <RotateCcw className="w-3.5 h-3.5 text-slate-400" />
              <span>Reset Circuit</span>
            </button>

            <button
              onClick={onOpenUpgrades}
              disabled={isTraining}
              className="py-1.5 px-3 rounded-lg bg-purple-500/20 hover:bg-purple-500/30 border border-purple-400/40 text-xs font-semibold text-purple-200 flex items-center justify-center gap-1.5 transition"
            >
              <Cpu className="w-3.5 h-3.5 text-purple-300" />
              <span>Upgrades Lab</span>
            </button>
          </div>
        </div>
      </div>

      {/* Live Metrics Grid */}
      <div className="grid grid-cols-3 gap-2.5">
        {/* Test Accuracy Card */}
        <div className="col-span-2 bg-slate-900/85 border border-white/10 rounded-xl p-3">
          <div className="flex items-center justify-between text-xs mb-1.5">
            <span className="flex items-center gap-1.5 text-slate-300 font-semibold">
              <Target className="w-3.5 h-3.5 text-cyan-400" />
              Test Accuracy (Meta: {targetPct}%)
            </span>
            <span
              className={`font-mono text-base font-extrabold ${
                testAccPct >= targetPct ? 'text-emerald-400' : 'text-cyan-300'
              }`}
            >
              {testAccPct}%
            </span>
          </div>

          <div className="relative w-full h-3 bg-slate-950 rounded-full overflow-hidden border border-white/10">
            <div
              className={`h-full transition-all duration-300 ${
                testAccPct >= targetPct
                  ? 'bg-gradient-to-r from-emerald-400 to-cyan-400'
                  : 'bg-gradient-to-r from-cyan-500 to-purple-500'
              }`}
              style={{ width: `${Math.min(100, testAccPct)}%` }}
            />
            {/* Target threshold marker line */}
            <div
              className="absolute top-0 bottom-0 w-0.5 bg-amber-400 shadow-[0_0_6px_#fbbf24]"
              style={{ left: `${targetPct}%` }}
              title={`Target: ${targetPct}%`}
            />
          </div>

          <div className="flex items-center justify-between text-[11px] text-slate-400 mt-1.5 font-mono">
            <span>Train Acc: {trainAccPct}%</span>
            <span className={testAccPct >= targetPct ? 'text-emerald-400 font-semibold' : ''}>
              {testAccPct >= targetPct ? '★ META ALCANZADA' : `Faltan ${Math.max(0, targetPct - testAccPct)}%`}
            </span>
          </div>
        </div>

        {/* Loss & Telemetry Card */}
        <div className="bg-slate-900/85 border border-white/10 rounded-xl p-3 flex flex-col justify-between">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span className="flex items-center gap-1">
              <TrendingDown className="w-3.5 h-3.5 text-purple-400" />
              Loss
            </span>
            <span className="font-mono text-sm font-bold text-purple-300">
              {latestLoss !== null ? latestLoss.toFixed(3) : '—'}
            </span>
          </div>

          {/* Mini Loss Sparkbars */}
          <div className="h-8 flex items-end gap-0.5 mt-1">
            {(lossHistory.slice(-14) || []).map((val, i) => {
              const h = Math.max(12, Math.min(100, Math.round((val / 1.1) * 100)));
              return (
                <div
                  key={i}
                  className="flex-1 bg-purple-400/50 rounded-t"
                  style={{ height: `${h}%` }}
                  title={`Loss: ${val}`}
                />
              );
            })}
          </div>

          {quantumTelemetry?.bloch_z && (
            <div className="text-[10px] font-mono text-slate-400 truncate mt-1">
              ⟨ZZ⟩={quantumTelemetry.bloch_z.zz_correlation}
            </div>
          )}
        </div>
      </div>

      {/* Tactical Hint Banner */}
      {levelInfo?.hint && (
        <div className="rounded-xl bg-amber-500/10 border border-amber-400/25 px-3 py-2 flex items-start gap-2 text-xs text-amber-200/90">
          <Lightbulb className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
          <div>
            <span className="font-bold text-amber-300">Consejo Cuántico: </span>
            <span>{levelInfo.hint}</span>
          </div>
        </div>
      )}
    </div>
  );
}
