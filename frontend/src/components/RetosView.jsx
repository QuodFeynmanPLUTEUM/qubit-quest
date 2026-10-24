import React, { useCallback, useEffect, useRef, useState } from 'react';
import confetti from 'canvas-confetti';
import { Star, Zap } from 'lucide-react';
import GameCanvas from './GameCanvas.jsx';
import ControlPanel from './ControlPanel.jsx';
import CircuitViewer from './CircuitViewer.jsx';
import UpgradesModal from './UpgradesModal.jsx';
import VictoryModal from './VictoryModal.jsx';
import { fetchLevelData, predictGrid, trainCircuit } from '../services/api.js';

export default function RetosView({
  levels,
  currentLevelId,
  onSelectLevel,
  levelStars,
  onLevelComplete,
  onTrainingPulse,
  playPulse,
  playVictory,
}) {
  const [levelInfo, setLevelInfo] = useState(null);
  const [trainPoints, setTrainPoints] = useState([]);
  const [testPoints, setTestPoints] = useState([]);
  const [decisionGrid, setDecisionGrid] = useState([]);
  const [parameters, setParameters] = useState([0.1, -0.1, 0.0, 0.0]);
  const [layers, setLayers] = useState(1);
  const [useEntanglement, setUseEntanglement] = useState(false);
  const [epochs, setEpochs] = useState(10);

  const [coherence, setCoherence] = useState(50);
  const [maxCoherence, setMaxCoherence] = useState(50);
  const [trainAccuracy, setTrainAccuracy] = useState(0.5);
  const [testAccuracy, setTestAccuracy] = useState(0.5);
  const [lossHistory, setLossHistory] = useState([]);
  const [circuitAscii, setCircuitAscii] = useState('');
  const [quantumTelemetry, setQuantumTelemetry] = useState(null);
  const [isTraining, setIsTraining] = useState(false);
  const [errorMsg, setErrorMsg] = useState(null);

  const [isUpgradesOpen, setIsUpgradesOpen] = useState(false);
  const [isVictoryOpen, setIsVictoryOpen] = useState(false);
  const [lastVictoryData, setLastVictoryData] = useState(null);
  const victoryShownForAttemptRef = useRef(false);

  const loadLevel = useCallback(async (lvlId, customLayers = 1, customEntanglement = false) => {
    setIsTraining(true);
    setErrorMsg(null);
    victoryShownForAttemptRef.current = false;
    try {
      const data = await fetchLevelData(lvlId, customLayers, customEntanglement);
      setLevelInfo(data.level);
      setTrainPoints(data.train_points || []);
      setTestPoints(data.test_points || []);
      setParameters(data.initial_parameters || []);
      setDecisionGrid(data.decision_grid || []);
      setTrainAccuracy(data.train_accuracy ?? 0.5);
      setTestAccuracy(data.test_accuracy ?? 0.5);
      setLossHistory(data.initial_loss !== undefined ? [data.initial_loss] : []);
      setCircuitAscii(data.circuit_ascii || '');
      setQuantumTelemetry(data.quantum_telemetry || null);
      setCoherence(data.level?.initial_coherence ?? 50);
      setMaxCoherence(data.level?.initial_coherence ?? 50);
    } catch (err) {
      setErrorMsg(`No se pudo conectar con el backend Qiskit: ${err.message}`);
    } finally {
      setIsTraining(false);
    }
  }, []);

  useEffect(() => {
    const defaultL = 1;
    const defaultEnt = false;
    setLayers(defaultL);
    setUseEntanglement(defaultEnt);
    loadLevel(currentLevelId, defaultL, defaultEnt);
  }, [currentLevelId, loadLevel]);

  const estimatedCost = (() => {
    const mult = 1.0 + 0.15 * Math.max(0, layers - 1) + (useEntanglement ? 0.15 : 0.0);
    return Math.max(2, Math.round(epochs * mult));
  })();

  const handleTrain = async () => {
    if (isTraining || coherence <= 0) return;
    setIsTraining(true);
    setErrorMsg(null);
    playPulse?.();
    onTrainingPulse?.();

    try {
      const res = await trainCircuit({
        levelId: currentLevelId,
        currentParameters: parameters,
        layers,
        useEntanglement,
        epochs,
        learningRate: 0.14,
        coherenceRemaining: coherence,
      });

      const newCoherence = Math.max(0, coherence - (res.coherence_consumed || estimatedCost));
      setParameters(res.updated_parameters || parameters);
      setDecisionGrid(res.decision_grid || decisionGrid);
      setTrainAccuracy(res.train_accuracy ?? trainAccuracy);
      setTestAccuracy(res.test_accuracy ?? testAccuracy);
      setLossHistory((prev) => [...prev, ...(res.loss_history || [])].slice(-30));
      setCircuitAscii(res.circuit_ascii || circuitAscii);
      setQuantumTelemetry(res.quantum_telemetry || quantumTelemetry);
      setCoherence(newCoherence);

      const targetAcc = levelInfo?.target_accuracy ?? 0.85;
      if (res.test_accuracy >= targetAcc && !victoryShownForAttemptRef.current) {
        victoryShownForAttemptRef.current = true;
        const evalData = res.evaluation || {
          score: Math.round(res.test_accuracy * 1000 + newCoherence * 15 - Math.max(0, layers - 1) * 50),
          stars: res.test_accuracy >= 0.92 && newCoherence >= maxCoherence * 0.5 ? 3 : 2,
        };

        onLevelComplete?.(currentLevelId, evalData.score, evalData.stars);
        setLastVictoryData({
          score: evalData.score,
          stars: evalData.stars,
          coherenceRemaining: newCoherence,
          testAccuracy: res.test_accuracy,
        });
        playVictory?.();
        confetti({ particleCount: 90, spread: 70, origin: { y: 0.6 } });
        setIsVictoryOpen(true);
      }
    } catch (err) {
      setErrorMsg(`Error en entrenamiento cuántico: ${err.message}`);
    } finally {
      setIsTraining(false);
    }
  };

  const handleReset = () => {
    setIsVictoryOpen(false);
    loadLevel(currentLevelId, layers, useEntanglement);
  };

  const handleApplyConfig = async (newLayers, newEntanglement) => {
    setLayers(newLayers);
    setUseEntanglement(newEntanglement);
    await loadLevel(currentLevelId, newLayers, newEntanglement);
  };

  const handleManualParameterChange = async (newParams) => {
    setParameters(newParams);
    try {
      const res = await predictGrid({
        levelId: currentLevelId,
        parameters: newParams,
        layers,
        useEntanglement,
        gridResolution: 25,
      });
      setDecisionGrid(res.decision_grid || decisionGrid);
      setTrainAccuracy(res.train_accuracy ?? trainAccuracy);
      setTestAccuracy(res.test_accuracy ?? testAccuracy);
      setCircuitAscii(res.circuit_ascii || circuitAscii);
      setQuantumTelemetry(res.quantum_telemetry || quantumTelemetry);
    } catch {
      // ignore transient drag errors
    }
  };

  const coherencePct = maxCoherence > 0 ? Math.max(0, Math.min(100, (coherence / maxCoherence) * 100)) : 0;

  return (
    <div className="flex flex-col gap-5">
      {errorMsg && (
        <div className="rounded-xl bg-rose-50 border border-rose-200 px-4 py-2.5 text-xs text-rose-700 flex items-center justify-between">
          <span>{errorMsg}</span>
          <button
            onClick={() => loadLevel(currentLevelId, layers, useEntanglement)}
            className="px-3 py-1 rounded bg-rose-100 hover:bg-rose-200 text-rose-800 font-semibold"
          >
            Reintentar Conexión
          </button>
        </div>
      )}

      {/* Level selector + coherence strip */}
      <div className="rounded-2xl bg-qq-surface border border-qq-border shadow-card p-3 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-1.5 bg-qq-bg p-1 rounded-xl border border-qq-border">
          {levels.map((lvl) => {
            const active = lvl.id === currentLevelId;
            const stars = levelStars[lvl.id] || 0;
            return (
              <button
                key={lvl.id}
                onClick={() => onSelectLevel(lvl.id)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-2 ${
                  active
                    ? 'bg-qq-primary text-white shadow-sm'
                    : 'text-qq-subtle hover:text-qq-ink hover:bg-white'
                }`}
              >
                <span className="font-mono text-[11px] opacity-80">LVL {lvl.id}</span>
                <span className="hidden md:inline">{lvl.name}</span>
                <span className="flex items-center gap-0.5">
                  {[1, 2, 3].map((s) => (
                    <Star
                      key={s}
                      className={`w-3 h-3 ${
                        s <= stars ? 'text-amber-500 fill-amber-500' : active ? 'text-white/40' : 'text-qq-border'
                      }`}
                    />
                  ))}
                </span>
              </button>
            );
          })}
        </div>

        <div className="w-44 sm:w-56">
          <div className="flex items-center justify-between text-[11px] mb-1">
            <span className="flex items-center gap-1 text-qq-subtle font-semibold">
              <Zap className="w-3.5 h-3.5 text-amber-500" />
              Coherencia
            </span>
            <span className="font-mono text-qq-ink">
              {coherence} <span className="text-qq-faint">/ {maxCoherence}</span>
            </span>
          </div>
          <div className="w-full h-2.5 bg-qq-bg rounded-full overflow-hidden border border-qq-border">
            <div
              className={`h-full transition-all duration-300 ${
                coherencePct > 50 ? 'bg-green-500' : coherencePct > 25 ? 'bg-amber-500' : 'bg-rose-500'
              }`}
              style={{ width: `${coherencePct}%` }}
            />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
        <div className="lg:col-span-6">
          <GameCanvas
            trainPoints={trainPoints}
            testPoints={testPoints}
            decisionGrid={decisionGrid}
            isTraining={isTraining}
            levelInfo={levelInfo}
          />
        </div>

        <div className="lg:col-span-6 flex flex-col gap-5">
          <ControlPanel
            epochs={epochs}
            onChangeEpochs={setEpochs}
            onTrain={handleTrain}
            onReset={handleReset}
            onOpenUpgrades={() => setIsUpgradesOpen(true)}
            isTraining={isTraining}
            coherence={coherence}
            estimatedCost={estimatedCost}
            trainAccuracy={trainAccuracy}
            testAccuracy={testAccuracy}
            targetAccuracy={levelInfo?.target_accuracy ?? 0.85}
            lossHistory={lossHistory}
            layers={layers}
            useEntanglement={useEntanglement}
            levelInfo={levelInfo}
            quantumTelemetry={quantumTelemetry}
          />

          <CircuitViewer
            layers={layers}
            useEntanglement={useEntanglement}
            parameters={parameters}
            circuitAscii={circuitAscii}
            onManualParameterChange={handleManualParameterChange}
            disabled={isTraining}
          />
        </div>
      </div>

      <UpgradesModal
        isOpen={isUpgradesOpen}
        onClose={() => setIsUpgradesOpen(false)}
        layers={layers}
        useEntanglement={useEntanglement}
        onApplyConfig={handleApplyConfig}
        currentLevelId={currentLevelId}
        allowedUpgrades={levelInfo?.allowed_upgrades || ['layers', 'entanglement']}
      />

      <VictoryModal
        isOpen={isVictoryOpen}
        onClose={() => setIsVictoryOpen(false)}
        levelInfo={levelInfo}
        testAccuracy={lastVictoryData?.testAccuracy ?? testAccuracy}
        coherenceRemaining={lastVictoryData?.coherenceRemaining ?? coherence}
        initialCoherence={maxCoherence}
        layers={layers}
        score={lastVictoryData?.score ?? 0}
        stars={lastVictoryData?.stars ?? 1}
        onRetry={handleReset}
        onNextLevel={() => {
          setIsVictoryOpen(false);
          if (currentLevelId < levels.length) {
            onSelectLevel(currentLevelId + 1);
          }
        }}
        hasNextLevel={currentLevelId < levels.length}
      />
    </div>
  );
}
