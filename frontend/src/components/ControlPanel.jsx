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
    lossHistory && lossHistory.length > 0 ? lossHistory[lossHistory.length - 1] : null;

  const canTrain = coherence > 0 && !isTraining;

  return (
    <div className="rounded-2xl bg-qq-surface border border-qq-border shadow-card p-4 flex flex-col gap-4">
      {/* Section Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Activity className="w-4 h-4 text-qq-primary" />
          <h2 className="text-sm font-extrabold text-qq-ink">Cabina de Entrenamiento</h2>
        </div>
        <div className="flex items-center gap-2 text-xs font-mono">
          <span className="px-2 py-0.5 rounded bg-qq-primarySoft border border-violet-200 text-qq-primary">
            Depth: {layers}L
          </span>
          <span
            className={`px-2 py-0.5 rounded border ${
              useEntanglement
                ? 'bg-teal-50 border-teal-200 text-teal-700'
                : 'bg-qq-bg border-qq-border text-qq-faint'
            }`}
          >
            CNOT: {useEntanglement ? 'ON' : 'OFF'}
          </span>
        </div>
      </div>

      {/* Main Action Controls */}
      <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 items-stretch">
        {/* Epochs per Pulse Selector */}
        <div className="sm:col-span-5 bg-qq-bg border border-qq-border rounded-xl p-3 flex flex-col justify-between">
          <div className="flex items-center justify-between text-xs text-qq-subtle mb-2">
            <span>Épocas por Pulso</span>
            <span className="font-mono text-amber-600 flex items-center gap-1">
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
                    ? 'bg-qq-primary text-white shadow-sm'
                    : 'bg-white border border-qq-border text-qq-subtle hover:bg-qq-bg'
                }`}
              >
                {ep}
              </button>
            ))}
          </div>
        </div>

        {/* TRAIN Button */}
        <div className="sm:col-span-7 flex flex-col gap-2">
          <button
            onClick={onTrain}
            disabled={!canTrain}
            className={`w-full flex-1 py-3 px-4 rounded-xl font-extrabold text-sm flex items-center justify-center gap-2.5 transition-all ${
              canTrain
                ? 'bg-qq-primary text-white hover:bg-qq-primaryDark quantum-pulse-btn'
                : 'bg-qq-bg text-qq-faint border border-qq-border cursor-not-allowed'
            }`}
          >
            <Play className="w-4 h-4 fill-current" />
            <span>
              {isTraining
                ? 'Entrenando circuito...'
                : coherence <= 0
                ? 'Sin coherencia (Reset)'
                : 'Entrenar circuito cuántico'}
            </span>
          </button>

          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={onReset}
              disabled={isTraining}
              className="py-1.5 px-3 rounded-lg bg-white hover:bg-qq-bg border border-qq-border text-xs font-semibold text-qq-subtle flex items-center justify-center gap-1.5 transition"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reset Circuit</span>
            </button>

            <button
              onClick={onOpenUpgrades}
              disabled={isTraining}
              className="py-1.5 px-3 rounded-lg bg-qq-primarySoft hover:bg-violet-100 border border-violet-200 text-xs font-semibold text-qq-primary flex items-center justify-center gap-1.5 transition"
            >
              <Cpu className="w-3.5 h-3.5" />
              <span>Upgrades Lab</span>
            </button>
          </div>
        </div>
      </div>

      {/* Live Metrics Grid */}
      <div className="grid grid-cols-3 gap-2.5">
        {/* Test Accuracy Card */}
        <div className="col-span-2 bg-qq-bg border border-qq-border rounded-xl p-3">
          <div className="flex items-center justify-between text-xs mb-1.5">
            <span className="flex items-center gap-1.5 text-qq-subtle font-semibold">
              <Target className="w-3.5 h-3.5 text-qq-primary" />
              Test Accuracy (Meta: {targetPct}%)
            </span>
            <span
              className={`font-mono text-base font-extrabold ${
                testAccPct >= targetPct ? 'text-green-600' : 'text-qq-primary'
              }`}
            >
              {testAccPct}%
            </span>
          </div>

          <div className="relative w-full h-3 bg-white rounded-full overflow-hidden border border-qq-border">
            <div
              className={`h-full transition-all duration-300 ${
                testAccPct >= targetPct ? 'bg-green-500' : 'bg-qq-primary'
              }`}
              style={{ width: `${Math.min(100, testAccPct)}%` }}
            />
            <div
              className="absolute top-0 bottom-0 w-0.5 bg-amber-500"
              style={{ left: `${targetPct}%` }}
              title={`Target: ${targetPct}%`}
            />
          </div>

          <div className="flex items-center justify-between text-[11px] text-qq-faint mt-1.5 font-mono">
            <span>Train Acc: {trainAccPct}%</span>
            <span className={testAccPct >= targetPct ? 'text-green-600 font-semibold' : ''}>
              {testAccPct >= targetPct ? '★ Meta alcanzada' : `Faltan ${Math.max(0, targetPct - testAccPct)}%`}
            </span>
          </div>
        </div>

        {/* Loss & Telemetry Card */}
        <div className="bg-qq-bg border border-qq-border rounded-xl p-3 flex flex-col justify-between">
          <div className="flex items-center justify-between text-xs text-qq-subtle">
            <span className="flex items-center gap-1">
              <TrendingDown className="w-3.5 h-3.5 text-qq-primary" />
              Loss
            </span>
            <span className="font-mono text-sm font-bold text-qq-primary">
              {latestLoss !== null ? latestLoss.toFixed(3) : '—'}
            </span>
          </div>

          <div className="h-8 flex items-end gap-0.5 mt-1">
            {(lossHistory.slice(-14) || []).map((val, i) => {
              const h = Math.max(12, Math.min(100, Math.round((val / 1.1) * 100)));
              return (
                <div
                  key={i}
                  className="flex-1 bg-violet-300 rounded-t"
                  style={{ height: `${h}%` }}
                  title={`Loss: ${val}`}
                />
              );
            })}
          </div>

          {quantumTelemetry?.bloch_z && (
            <div className="text-[10px] font-mono text-qq-faint truncate mt-1">
              ⟨ZZ⟩={quantumTelemetry.bloch_z.zz_correlation}
            </div>
          )}
        </div>
      </div>

      {/* Tactical Hint Banner */}
      {levelInfo?.hint && (
        <div className="rounded-xl bg-amber-50 border border-amber-200 px-3 py-2 flex items-start gap-2 text-xs text-amber-800">
          <Lightbulb className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
          <div>
            <span className="font-bold text-amber-700">Consejo cuántico: </span>
            <span>{levelInfo.hint}</span>
          </div>
        </div>
      )}
    </div>
  );
}
