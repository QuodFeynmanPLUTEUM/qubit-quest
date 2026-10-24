"""Game rules, level definitions, coherence budget, and scoring engine."""

from typing import Dict, List


LEVELS_CONFIG: List[Dict] = [
    {
        "id": 1,
        "name": "First Contact",
        "subtitle": "How Machine Learning Learns Patterns",
        "description": "Aprende cómo los ángulos de las compuertas cuánticas (Ry, Rz) ajustan la frontera de decisión para separar dos cúmulos de datos.",
        "pedagogical_goal": "Observar cómo el ajuste iterativo de parámetros variacionales θ reduce el error de clasificación.",
        "hint": "Una sola capa variacional sin entrelazamiento basta para separar patrones lineales. ¡Usa pulsos de 10 épocas!",
        "initial_coherence": 50,
        "target_accuracy": 0.85,
        "allowed_upgrades": ["layers"],
        "recommended_layers": 1,
        "recommended_entanglement": False,
        "dataset_type": "linear_separable",
    },
    {
        "id": 2,
        "name": "The Pattern Gets Weird",
        "subtitle": "Quantum Feature Re-Uploading & Depth",
        "description": "Los datos forman anillos concéntricos. Una sola rotación cuántica es monótona y no puede encerrar un círculo.",
        "pedagogical_goal": "Comprobar cómo añadir capas variacionales con re-codificación de datos (Data Re-Uploading) genera armónicos no lineales capaces de curvar la frontera.",
        "hint": "Un circuito de 1 capa se estancará cerca del 60%. Abre 'Upgrades / Hardware Lab' y desbloquea Depth = 2 capas.",
        "initial_coherence": 75,
        "target_accuracy": 0.85,
        "allowed_upgrades": ["layers"],
        "recommended_layers": 2,
        "recommended_entanglement": False,
        "dataset_type": "concentric_circles",
    },
    {
        "id": 3,
        "name": "Entanglement Unlocked",
        "subtitle": "Quantum Correlations & CNOT Gates",
        "description": "El temido patrón XOR cuántico en 4 cuadrantes. Sin entrelazamiento, los qubits evolucionan por separado y es matemáticamente imposible resolverlo.",
        "pedagogical_goal": "Experimentar por qué la compuerta CNOT crea correlaciones cuánticas no separables entre q0 y q1 (términos cruzados x0·x1) indispensables para XOR.",
        "hint": "Activa la compuerta CNOT (Entanglement) y usa al menos 2 capas para correlacionar las fases de ambos qubits.",
        "initial_coherence": 100,
        "target_accuracy": 0.85,
        "allowed_upgrades": ["layers", "entanglement"],
        "recommended_layers": 2,
        "recommended_entanglement": True,
        "dataset_type": "quantum_xor",
    },
]


def get_all_levels() -> List[Dict]:
    """Return metadata for all levels."""
    return LEVELS_CONFIG


def get_level_config(level_id: int) -> Dict:
    """Return configuration dict for a given level_id."""
    for lvl in LEVELS_CONFIG:
        if lvl["id"] == level_id:
            return lvl
    raise ValueError(f"Level {level_id} not found")


def calculate_coherence_cost(epochs: int, layers: int, use_entanglement: bool) -> int:
    """
    Calculate coherence consumed by a training pulse.
    Base cost scales with epochs, with a mild circuit depth/CNOT overhead.
    """
    # Keep aligned with specs: e.g., 10 epochs -> ~10-15 coherence units
    depth_multiplier = 1.0 + 0.15 * max(0, layers - 1) + (0.15 if use_entanglement else 0.0)
    cost = int(round(epochs * depth_multiplier))
    return max(2, cost)


def calculate_score_and_stars(
    test_accuracy: float,
    coherence_remaining: int,
    initial_coherence: int,
    layers: int,
    target_accuracy: float = 0.85,
) -> Dict:
    """
    Compute final level score and 1-3 star medal rating according to specs:
      Score = (Test Accuracy * 1000) + (Remaining Coherence * 15) - (Extra Layers * 50)
    """
    extra_layers = max(0, layers - 1)
    raw_score = (
        (test_accuracy * 1000.0)
        + (max(0, coherence_remaining) * 15.0)
        - (extra_layers * 50.0)
    )
    score = max(0, int(round(raw_score)))

    coherence_ratio = (
        coherence_remaining / float(initial_coherence) if initial_coherence > 0 else 0.0
    )

    if test_accuracy < target_accuracy:
        stars = 0
    elif test_accuracy >= 0.92 and coherence_ratio >= 0.50:
        stars = 3
    elif coherence_ratio >= 0.30:
        stars = 2
    else:
        stars = 1

    return {
        "score": score,
        "stars": stars,
        "passed": test_accuracy >= target_accuracy,
        "coherence_ratio": round(coherence_ratio, 3),
    }
