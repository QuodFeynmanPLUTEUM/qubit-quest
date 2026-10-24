import React, { useEffect, useRef, useState } from 'react';
import {
  Eye,
  GraduationCap,
  Play,
  RotateCcw,
  Target,
  TrendingDown,
  Sparkles,
} from 'lucide-react';
import ScatterPlot from './ScatterPlot.jsx';
import CircuitDiagram from './CircuitDiagram.jsx';
import MetricChart from './MetricChart.jsx';
import { fetchSandboxData, trainSandbox } from '../services/api.js';

const DATASETS = [
  { id: 'circles', label: 'Círculos' },
  { id: 'moons', label: 'Lunas' },
  { id: 'blobs', label: 'Blobs' },
  { id: 'xor', label: 'XOR Cuántico' },
];

// Recommended circuit architecture per dataset: the ansatz used here only
// closes a circular/curved boundary via extra re-uploading layers (no CNOT
// needed), while XOR's 4-quadrant pattern specifically requires the CNOT
// entangling gate. Mismatching these (e.g. CNOT + circles) still runs, but
// converges to a messy, non-circular decision surface.
const RECOMMENDED_CONFIG = {
  blobs: { layers: 1, useEntanglement: false },
  circles: { layers: 2, useEntanglement: false },
  moons: { layers: 2, useEntanglement: false },
  xor: { layers: 2, useEntanglement: true },
};

const EPOCHS_PER_PULSE = 10;
const ITERATION_TARGET = 100;

export default function PlaygroundView({ onTrainingPulse, isTrainingGlobal }) {
  const [datasetType, setDatasetType] = useState('circles');
  const [noise, setNoise] = useState(0.1);
  const [layers, setLayers] = useState(RECOMMENDED_CONFIG.circles.layers);
  const [useEntanglement, setUseEntanglement] = useState(RECOMMENDED_CONFIG.circles.useEntanglement);

  const [trainPoints, setTrainPoints] = useState([]);
  const [testPoints, setTestPoints] = useState([]);
  const [decisionGrid, setDecisionGrid] = useState([]);
  const [parameters, setParameters] = useState([]);

  const [lossHistory, setLossHistory] = useState([]);
  const [trainAccHistory, setTrainAccHistory] = useState([]);
  const [testAccHistory, setTestAccHistory] = useState([]);
  const [iterationsUsed, setIterationsUsed] = useState(0);

  const [trainAccuracy, setTrainAccuracy] = useState(0.5);
  const [testAccuracy, setTestAccuracy] = useState(0.5);

  const [isTraining, setIsTraining] = useState(false);
  const [isLoadingData, setIsLoadingData] = useState(false);
  const [errorMsg, setErrorMsg] = useState(null);

  const debounceRef = useRef(null);

  const loadData = async (overrides = {}) => {
    const cfg = {
      datasetType: overrides.datasetType ?? datasetType,
      noise: overrides.noise ?? noise,
      layers: overrides.layers ?? layers,
      useEntanglement: overrides.useEntanglement ?? useEntanglement,
    };
    setIsLoadingData(true);
    setErrorMsg(null);
    try {
      const data = await fetchSandboxData(cfg);
      setTrainPoints(data.train_points || []);
      setTestPoints(data.test_points || []);
      setDecisionGrid(data.decision_grid || []);
      setParameters(data.initial_parameters || []);
      setTrainAccuracy(data.train_accuracy ?? 0.5);
      setTestAccuracy(data.test_accuracy ?? 0.5);
      setLossHistory(data.initial_loss !== undefined ? [data.initial_loss] : []);
      setTrainAccHistory(data.train_accuracy !== undefined ? [data.train_accuracy] : []);
      setTestAccHistory(data.test_accuracy !== undefined ? [data.test_accuracy] : []);
      setIterationsUsed(0);
    } catch (err) {
      setErrorMsg(`No se pudo conectar con el backend Qiskit: ${err.message}`);
    } finally {
      setIsLoadingData(false);
    }
  };

  useEffect(() => {
    loadData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleDatasetChange = (id) => {
    const recommended = RECOMMENDED_CONFIG[id] || { layers, useEntanglement };
    setDatasetType(id);
    setLayers(recommended.layers);
    setUseEntanglement(recommended.useEntanglement);
    loadData({ datasetType: id, layers: recommended.layers, useEntanglement: recommended.useEntanglement });
  };

  const handleNoiseChange = (val) => {
    setNoise(val);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      loadData({ noise: val });
    }, 400);
  };

  const handleLayersChange = (val) => {
    setLayers(val);
    loadData({ layers: val });
  };

  const handleEntanglementToggle = () => {
    const next = !useEntanglement;
    setUseEntanglement(next);
    loadData({ useEntanglement: next });
  };

  const handleTrain = async () => {
    if (isTraining) return;
    setIsTraining(true);
    setErrorMsg(null);
    try {
      const res = await trainSandbox({
        datasetType,
        noise,
        currentParameters: parameters,
        layers,
        useEntanglement,
        epochs: EPOCHS_PER_PULSE,
      });
      setParameters(res.updated_parameters || parameters);
      setDecisionGrid(res.decision_grid || decisionGrid);
      setTrainAccuracy(res.train_accuracy ?? trainAccuracy);
      setTestAccuracy(res.test_accuracy ?? testAccuracy);
      setLossHistory((prev) => [...prev, ...(res.loss_history || [])]);
      setTrainAccHistory((prev) => [...prev, ...(res.train_accuracy_history || [])]);
      setTestAccHistory((prev) => [...prev, ...(res.test_accuracy_history || [])]);
      setIterationsUsed((prev) => prev + EPOCHS_PER_PULSE);
      onTrainingPulse?.();
    } catch (err) {
      setErrorMsg(`Error en entrenamiento cuántico: ${err.message}`);
    } finally {
      setIsTraining(false);
    }
  };

  const handleReset = () => {
    loadData();
  };

  const busy = isTraining || isLoadingData;
  const iterationsPct = Math.min(100, (iterationsUsed / ITERATION_TARGET) * 100);
  const datasetLabel = DATASETS.find((d) => d.id === datasetType)?.label ?? datasetType;

  return (
    <div className="flex flex-col gap-5">
      {errorMsg && (
        <div className="rounded-xl bg-rose-50 border border-rose-200 px-4 py-2.5 text-xs text-rose-700 flex items-center justify-between">
          <span>{errorMsg}</span>
          <button
            onClick={() => loadData()}
            className="px-3 py-1 rounded bg-rose-100 hover:bg-rose-200 text-rose-800 font-semibold"
          >
            Reintentar
          </button>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
        {/* Left: scatter card */}
        <div className="lg:col-span-7 rounded-2xl bg-qq-surface border border-qq-border shadow-card p-5 flex flex-col gap-4">
          <div>
            <h2 className="text-lg font-extrabold text-qq-ink">Entrenando tu clasificador cuántico</h2>
            <p className="text-sm text-qq-subtle mt-0.5">
              El modelo está aprendiendo una frontera de decisión para separar las dos clases de puntos.
            </p>
          </div>

          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 min-w-0">
              <ScatterPlot
                trainPoints={trainPoints}
                testPoints={testPoints}
                decisionGrid={decisionGrid}
                isTraining={busy}
              />
            </div>

            <div className="md:w-40 shrink-0 flex flex-col gap-3 text-xs text-qq-subtle p-3 rounded-xl border border-qq-border">
              <LegendDot color="#2563eb" label="Clase azul" sub="(interior)" />
              <LegendDot color="#ea580c" label="Clase naranja" sub="(exterior)" />
              <LegendLine color="#7c5cff" label="Frontera de decisión" sub="del modelo (en aprendizaje)" />
              <LegendSwatch color="rgba(59,130,246,0.18)" label="Región predicha" sub="como clase azul" />
              <LegendSwatch color="rgba(249,115,22,0.18)" label="Región predicha" sub="como clase naranja" />
            </div>
          </div>

          {/* Controls row */}
          <div className="flex flex-wrap items-end gap-3 pt-2 border-t border-qq-border">
            <div className="flex flex-col gap-1">
              <label className="text-[11px] font-semibold text-qq-subtle">Dataset</label>
              <select
                value={datasetType}
                onChange={(e) => handleDatasetChange(e.target.value)}
                disabled={busy}
                className="px-3 py-2 rounded-lg border border-qq-border bg-white text-sm font-medium text-qq-ink"
              >
                {DATASETS.map((d) => (
                  <option key={d.id} value={d.id}>
                    {d.label}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex flex-col gap-1 flex-1 min-w-[160px]">
              <label className="text-[11px] font-semibold text-qq-subtle flex items-center justify-between">
                <span>Ruido (σ)</span>
                <span className="font-mono text-qq-ink">{noise.toFixed(2)}</span>
              </label>
              <input
                type="range"
                min="0"
                max="1"
                step="0.05"
                value={noise}
                disabled={isTraining}
                onChange={(e) => handleNoiseChange(parseFloat(e.target.value))}
                className="w-full accent-qq-primary cursor-pointer"
              />
            </div>

            <button
              onClick={handleTrain}
              disabled={busy}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-sm transition ${
                busy
                  ? 'bg-qq-primarySoft text-qq-primary cursor-wait'
                  : 'bg-qq-primary text-white hover:bg-qq-primaryDark quantum-pulse-btn'
              }`}
            >
              {isTraining ? (
                <>
                  <span className="w-3.5 h-3.5 rounded-full border-2 border-white border-t-transparent animate-spin" />
                  Entrenando...
                </>
              ) : (
                <>
                  <Play className="w-3.5 h-3.5 fill-current" />
                  Entrenar
                </>
              )}
            </button>

            <button
              onClick={handleReset}
              disabled={busy}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-qq-border bg-white text-sm font-bold text-qq-ink hover:bg-qq-bg transition"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              Reiniciar
            </button>
          </div>
        </div>

        {/* Right: circuit card */}
        <div className="lg:col-span-5 rounded-2xl bg-qq-surface border border-qq-border shadow-card p-5 flex flex-col gap-4">
          <div>
            <h2 className="text-lg font-extrabold text-qq-ink">Tu circuito cuántico</h2>
            <p className="text-sm text-qq-subtle mt-0.5">
              Codifica los datos, aplica capas variacionales y mide.
            </p>
          </div>

          <div className="bg-qq-bg/60 border border-qq-border rounded-xl p-3">
            <CircuitDiagram layers={layers} useEntanglement={useEntanglement} />
          </div>

          <div className="flex flex-wrap items-center gap-x-4 gap-y-3">
            <div className="flex flex-col gap-1">
              <label htmlFor="pg-layers" className="text-[11px] font-semibold text-qq-subtle flex items-center gap-1">
                Capas variacionales
                <InfoDot title="Cuántas veces se repite el bloque de codificación + rotaciones entrenables. Más capas = fronteras más curvas." />
              </label>
              <select
                id="pg-layers"
                value={layers}
                onChange={(e) => handleLayersChange(parseInt(e.target.value, 10))}
                disabled={busy}
                className="px-3 py-2 rounded-lg border border-qq-border bg-white text-sm font-medium text-qq-ink w-24 focus:outline-none focus-visible:ring-2 focus-visible:ring-qq-primary focus-visible:ring-offset-1"
              >
                {[1, 2, 3].map((l) => (
                  <option key={l} value={l}>
                    {l}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex flex-col gap-1">
              <span id="pg-entanglement-label" className="text-[11px] font-semibold text-qq-subtle flex items-center gap-1">
                Entrelazamiento
                <InfoDot title="Activa una puerta CNOT entre qubits adyacentes, creando correlaciones cuánticas necesarias para patrones tipo XOR." />
              </span>
              <button
                type="button"
                role="switch"
                aria-checked={useEntanglement}
                aria-labelledby="pg-entanglement-label"
                onClick={handleEntanglementToggle}
                disabled={busy}
                className={`relative inline-flex w-12 h-6 shrink-0 self-start p-0 rounded-full transition-colors disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus-visible:ring-2 focus-visible:ring-qq-primary focus-visible:ring-offset-1 ${
                  useEntanglement ? 'bg-qq-primary' : 'bg-qq-border'
                }`}
              >
                <span
                  className={`pointer-events-none absolute left-0.5 top-0.5 w-5 h-5 rounded-full bg-white shadow transition-transform ${
                    useEntanglement ? 'translate-x-6' : 'translate-x-0'
                  }`}
                />
              </button>
            </div>
            <span className="text-[11px] text-qq-faint max-w-[150px] leading-snug self-end pb-1.5">
              CNOT entre qubits adyacentes
            </span>
          </div>

          <div className="rounded-xl bg-sky-50 border border-sky-200 px-3.5 py-3 flex items-start gap-2.5">
            <Sparkles className="w-4 h-4 text-sky-500 shrink-0 mt-0.5" />
            <p className="text-xs text-sky-800 leading-relaxed">
              Las puertas Ry(θ) tienen ángulos que el optimizador ajusta. Durante el entrenamiento, estos
              parámetros se actualizan para mejorar la clasificación.
            </p>
          </div>
        </div>
      </div>

      {/* Bottom metrics row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricChart
          title="Pérdida de entrenamiento"
          icon={TrendingDown}
          color="#7c5cff"
          softColor="#efeaff"
          data={lossHistory}
          xMax={Math.max(ITERATION_TARGET, iterationsUsed)}
          yMin={0}
          yMax={Math.max(1, ...lossHistory, 0.1)}
          valueFormatter={(v) => v.toFixed(3)}
          statusLabel={isTraining ? 'Entrenando...' : undefined}
          infoTooltip="Error promedio (entropía cruzada) entre la predicción del circuito y la etiqueta real."
        />
        <MetricChart
          title="Precisión (train)"
          icon={Target}
          color="#2563eb"
          softColor="#dbe9ff"
          data={trainAccHistory}
          xMax={Math.max(ITERATION_TARGET, iterationsUsed)}
          yMin={0}
          yMax={1}
          valueFormatter={(v) => `${Math.round(v * 100)}%`}
          statusLabel={isTraining ? 'Actualizando...' : undefined}
          infoTooltip="Precisión sobre los puntos usados para entrenar."
        />
        <MetricChart
          title="Precisión (test)"
          icon={Eye}
          color="#16a34a"
          softColor="#dcfce7"
          data={testAccHistory}
          xMax={Math.max(ITERATION_TARGET, iterationsUsed)}
          yMin={0}
          yMax={1}
          valueFormatter={(v) => `${Math.round(v * 100)}%`}
          statusLabel={isTraining ? 'Evaluando...' : undefined}
          infoTooltip="Precisión sobre puntos que el circuito nunca vio durante el entrenamiento."
        />

        <div className="rounded-2xl bg-qq-surface border border-qq-border shadow-card p-4 flex flex-col justify-between gap-2">
          <div className="flex items-center justify-between text-xs font-bold text-qq-subtle">
            <span>Iteraciones usadas</span>
            {isTraining && (
              <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-qq-primarySoft text-qq-primary">
                Entrenando...
              </span>
            )}
          </div>
          <div className="text-3xl font-extrabold text-qq-ink font-mono">
            {iterationsUsed}
            <span className="text-base text-qq-faint font-semibold"> / {ITERATION_TARGET}</span>
          </div>
          <div className="w-full h-2.5 bg-qq-bg rounded-full overflow-hidden border border-qq-border">
            <div
              className="h-full bg-qq-primary transition-all duration-300"
              style={{ width: `${iterationsPct}%` }}
            />
          </div>
        </div>
      </div>

      {/* Footer info bar */}
      <div className="rounded-xl bg-qq-primarySoft/60 border border-qq-border px-4 py-2.5 flex flex-wrap items-center justify-between gap-2 text-xs text-qq-subtle">
        <span className="flex items-center gap-1.5">
          <GraduationCap className="w-3.5 h-3.5 text-qq-primary" />
          <span className="font-semibold text-qq-ink">Objetivo del reto:</span> entrena un circuito cuántico
          que separe las dos clases en el dataset de {datasetLabel}.
        </span>
        <span className="font-mono text-qq-faint">Qiskit · simulador local</span>
      </div>
    </div>
  );
}

function LegendDot({ color, label, sub }) {
  return (
    <div className="flex items-start gap-2">
      <span className="w-3 h-3 rounded-full mt-0.5 shrink-0" style={{ backgroundColor: color }} />
      <span>
        <span className="font-semibold text-qq-ink block">{label}</span>
        <span className="text-qq-faint">{sub}</span>
      </span>
    </div>
  );
}

function LegendLine({ color, label, sub }) {
  return (
    <div className="flex items-start gap-2">
      <span
        className="w-3 h-0 mt-2.5 shrink-0 border-t-2 border-dashed"
        style={{ borderColor: color }}
      />
      <span>
        <span className="font-semibold text-qq-ink block">{label}</span>
        <span className="text-qq-faint">{sub}</span>
      </span>
    </div>
  );
}

function LegendSwatch({ color, label, sub }) {
  return (
    <div className="flex items-start gap-2">
      <span className="w-3 h-3 rounded mt-0.5 shrink-0" style={{ backgroundColor: color }} />
      <span>
        <span className="font-semibold text-qq-ink block">{label}</span>
        <span className="text-qq-faint">{sub}</span>
      </span>
    </div>
  );
}

function InfoDot({ title }) {
  return (
    <span className="text-qq-faint cursor-help text-[10px]" title={title}>
      ⓘ
    </span>
  );
}
