import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import confetti from 'canvas-confetti';
import Header from './components/Header.jsx';
import GameCanvas from './components/GameCanvas.jsx';
import ControlPanel from './components/ControlPanel.jsx';
import CircuitViewer from './components/CircuitViewer.jsx';
import UpgradesModal from './components/UpgradesModal.jsx';
import PedagogicalDrawer from './components/PedagogicalDrawer.jsx';
import VictoryModal from './components/VictoryModal.jsx';
import {
  checkHealth,
  fetchLevelData,
  fetchLevels,
  predictGrid,
  trainCircuit,
} from './services/api.js';
import { useGameSound } from './hooks/useGameSound.js';

const FALLBACK_LEVELS = [
  {
    id: 1,
    name: 'First Contact',
    subtitle: 'How Machine Learning Learns Patterns',
    description:
      'Aprende cómo los ángulos de las compuertas cuánticas (Ry, Rz) ajustan la frontera de decisión.',
    initial_coherence: 50,
    target_accuracy: 0.85,
    allowed_upgrades: ['layers'],
  },
  {
    id: 2,
    name: 'The Pattern Gets Weird',
    subtitle: 'Quantum Feature Re-Uploading & Depth',
    description:
      'Los datos forman anillos concéntricos. Desbloquea más capas variacionales para curvar la frontera.',
    initial_coherence: 75,
    target_accuracy: 0.85,
    allowed_upgrades: ['layers'],
  },
  {
    id: 3,
    name: 'Entanglement Unlocked',
    subtitle: 'Quantum Correlations & CNOT Gates',
    description:
      'Patrón XOR cuántico. Activa la compuerta CNOT para entrelazar q0 y q1.',
    initial_coherence: 100,
    target_accuracy: 0.85,
    allowed_upgrades: ['layers', 'entanglement'],
  },
];

export default function App() {
  const [levels, setLevels] = useState(FALLBACK_LEVELS);
  const [currentLevelId, setCurrentLevelId] = useState(1);
  const [backendOnline, setBackendOnline] = useState(false);
  const [errorMsg, setErrorMsg] = useState(null);

  // Level & Circuit State
  const [levelInfo, setLevelInfo] = useState(FALLBACK_LEVELS[0]);
  const [trainPoints, setTrainPoints] = useState([]);
  const [testPoints, setTestPoints] = useState([]);
  const [decisionGrid, setDecisionGrid] = useState([]);
  const [parameters, setParameters] = useState([0.1, -0.1, 0.0, 0.0]);
  const [layers, setLayers] = useState(1);
  const [useEntanglement, setUseEntanglement] = useState(false);
  const [epochs, setEpochs] = useState(10);

  // Metrics & Resources
  const [coherence, setCoherence] = useState(50);
  const [maxCoherence, setMaxCoherence] = useState(50);
  const [trainAccuracy, setTrainAccuracy] = useState(0.5);
  const [testAccuracy, setTestAccuracy] = useState(0.5);
  const [lossHistory, setLossHistory] = useState([]);
  const [circuitAscii, setCircuitAscii] = useState('');
  const [quantumTelemetry, setQuantumTelemetry] = useState(null);
  const [isTraining, setIsTraining] = useState(false);

  // Progression & Modals
  const [levelScores, setLevelScores] = useState({ 1: 0, 2: 0, 3: 0 });
  const [levelStars, setLevelStars] = useState({ 1: 0, 2: 0, 3: 0 });
  const [lastVictoryData, setLastVictoryData] = useState(null);
  const [isUpgradesOpen, setIsUpgradesOpen] = useState(false);
  const [isVictoryOpen, setIsVictoryOpen] = useState(false);
  const victoryShownForAttemptRef = useRef(false);

  const {
    soundEnabled,
    setSoundEnabled,
    playPulse,
    playUpgrade,
    playVictory,
    playReset,
  } = useGameSound();

  const totalScore = useMemo(
    () => Object.values(levelScores).reduce((acc, s) => acc + s, 0),
    [levelScores]
  );

  const estimatedCost = useMemo(() => {
    const mult = 1.0 + 0.15 * Math.max(0, layers - 1) + (useEntanglement ? 0.15 : 0.0);
    return Math.max(2, Math.round(epochs * mult));
  }, [epochs, layers, useEntanglement]);

  // Initial load of levels and health
  useEffect(() => {
    let mounted = true;
    checkHealth()
      .then(() => {
        if (mounted) setBackendOnline(true);
      })
      .catch(() => {
        if (mounted) setBackendOnline(false);
      });

    fetchLevels()
      .then((res) => {
        if (mounted && res.levels && res.levels.length > 0) {
          setLevels(res.levels);
        }
      })
      .catch(() => {});

    return () => {
      mounted = false;
    };
  }, []);

  const loadLevel = useCallback(
    async (lvlId, customLayers = 1, customEntanglement = false) => {
      setIsTraining(true);
      setErrorMsg(null);
      victoryShownForAttemptRef.current = false;
      try {
        const data = await fetchLevelData(lvlId, customLayers, customEntanglement);
        setBackendOnline(true);
        setLevelInfo(data.level);
        setTrainPoints(data.train_points || []);
        setTestPoints(data.test_points || []);
        setParameters(data.initial_parameters || []);
        setDecisionGrid(data.decision_grid || []);
        setTrainAccuracy(data.train_accuracy ?? 0.5);
        setTestAccuracy(data.test_accuracy ?? 0.5);
        setLossHistory(data.initial_loss ? [data.initial_loss] : []);
        setCircuitAscii(data.circuit_ascii || '');
        setQuantumTelemetry(data.quantum_telemetry || null);
        setCoherence(data.level?.initial_coherence ?? 50);
        setMaxCoherence(data.level?.initial_coherence ?? 50);
      } catch (err) {
        setBackendOnline(false);
        setErrorMsg(`No se pudo conectar con el backend Qiskit: ${err.message}`);
      } finally {
        setIsTraining(false);
      }
    },
    []
  );

  useEffect(() => {
    // Default circuit config when switching levels
    const defaultL = 1;
    const defaultEnt = false;
    setLayers(defaultL);
    setUseEntanglement(defaultEnt);
    loadLevel(currentLevelId, defaultL, defaultEnt);
  }, [currentLevelId, loadLevel]);

  const handleTrain = async () => {
    if (isTraining || coherence <= 0) return;
    setIsTraining(true);
    setErrorMsg(null);
    playPulse();

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

        setLevelScores((prev) => ({
          ...prev,
          [currentLevelId]: Math.max(prev[currentLevelId] || 0, evalData.score),
        }));
        setLevelStars((prev) => ({
          ...prev,
          [currentLevelId]: Math.max(prev[currentLevelId] || 0, evalData.stars),
        }));
        setLastVictoryData({
          score: evalData.score,
          stars: evalData.stars,
          coherenceRemaining: newCoherence,
          testAccuracy: res.test_accuracy,
        });
        playVictory();
        confetti({
          particleCount: 90,
          spread: 70,
          origin: { y: 0.6 },
        });
        setIsVictoryOpen(true);
      }
    } catch (err) {
      setErrorMsg(`Error en entrenamiento cuántico: ${err.message}`);
    } finally {
      setIsTraining(false);
    }
  };

  const handleReset = () => {
    playReset();
    setIsVictoryOpen(false);
    loadLevel(currentLevelId, layers, useEntanglement);
  };

  const handleApplyConfig = async (newLayers, newEntanglement) => {
    playUpgrade();
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

  return (
    <div className="min-h-screen flex flex-col justify-between text-slate-100">
      <div>
        <Header
          levels={levels}
          currentLevelId={currentLevelId}
          onSelectLevel={(id) => {
            setIsVictoryOpen(false);
            setCurrentLevelId(id);
          }}
          coherence={coherence}
          maxCoherence={maxCoherence}
          totalScore={totalScore}
          levelStars={levelStars}
          backendOnline={backendOnline}
          soundEnabled={soundEnabled}
          onToggleSound={() => setSoundEnabled((s) => !s)}
          onOpenUpgrades={() => setIsUpgradesOpen(true)}
        />

        {errorMsg && (
          <div className="max-w-7xl mx-auto px-4 mt-3">
            <div className="rounded-xl bg-rose-500/15 border border-rose-500/40 px-4 py-2.5 text-xs text-rose-200 flex items-center justify-between">
              <span>{errorMsg}</span>
              <button
                onClick={() => loadLevel(currentLevelId, layers, useEntanglement)}
                className="px-3 py-1 rounded bg-rose-500/30 hover:bg-rose-500/50 text-white font-semibold"
              >
                Reintentar Conexión
              </button>
            </div>
          </div>
        )}

        {/* Main 2-Column Quantum Lab & Cockpit */}
        <main className="max-w-7xl mx-auto px-4 py-5 grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
          {/* Left Column: 2D Quantum Decision Boundary Canvas */}
          <div className="lg:col-span-6">
            <GameCanvas
              trainPoints={trainPoints}
              testPoints={testPoints}
              decisionGrid={decisionGrid}
              isTraining={isTraining}
              levelInfo={levelInfo}
            />
          </div>

          {/* Right Column: Training Cockpit & Parameterized Quantum Circuit */}
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
        </main>
      </div>

      {/* Bottom Pedagogical Drawer */}
      <PedagogicalDrawer />

      {/* Modals */}
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
          if (currentLevelId < 3) {
            setCurrentLevelId(currentLevelId + 1);
          }
        }}
        hasNextLevel={currentLevelId < 3}
      />
    </div>
  );
}
