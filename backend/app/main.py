"""FastAPI Backend for Qubit Quest (Quantum Machine Learning Game)."""

from typing import List, Optional
import numpy as np
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field

from .datasets import SANDBOX_DATASET_LABELS, get_level_dataset, get_sandbox_dataset
from .game_rules import (
    calculate_coherence_cost,
    calculate_score_and_stars,
    get_all_levels,
    get_level_config,
)
from .qml_engine import (
    compute_decision_grid,
    compute_loss_and_accuracy,
    default_initial_parameters,
    get_circuit_ascii,
    get_num_parameters,
    train_quantum_circuit,
    verify_with_qiskit_statevector,
)

app = FastAPI(
    title="Qubit Quest API",
    description="Quantum Machine Learning Educational Game Backend (Qiskit VQC)",
    version="1.0.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


class TrainRequest(BaseModel):
    level_id: int = Field(..., ge=1, le=3)
    current_parameters: List[float] = Field(default_factory=list)
    layers: int = Field(default=1, ge=1, le=3)
    use_entanglement: bool = Field(default=False)
    epochs: int = Field(default=10, ge=1, le=50)
    learning_rate: float = Field(default=0.12, gt=0.0, le=1.0)
    coherence_remaining: Optional[int] = Field(default=None)


class PredictGridRequest(BaseModel):
    level_id: int = Field(default=1, ge=1, le=3)
    parameters: List[float] = Field(default_factory=list)
    layers: int = Field(default=1, ge=1, le=3)
    use_entanglement: bool = Field(default=False)
    grid_resolution: int = Field(default=25, ge=10, le=40)


class SandboxDataRequest(BaseModel):
    dataset_type: str = Field(default="circles")
    noise: float = Field(default=0.1, ge=0.0, le=1.0)
    layers: int = Field(default=1, ge=1, le=3)
    use_entanglement: bool = Field(default=False)
    seed: int = Field(default=7)


class SandboxTrainRequest(BaseModel):
    dataset_type: str = Field(default="circles")
    noise: float = Field(default=0.1, ge=0.0, le=1.0)
    current_parameters: List[float] = Field(default_factory=list)
    layers: int = Field(default=1, ge=1, le=3)
    use_entanglement: bool = Field(default=False)
    epochs: int = Field(default=10, ge=1, le=50)
    learning_rate: float = Field(default=0.14, gt=0.0, le=1.0)
    seed: int = Field(default=7)


@app.get("/api/health")
def health_check():
    """Health check endpoint."""
    return {"status": "ok", "engine": "Qiskit Statevector VQC", "qubits": 2}


@app.get("/api/levels")
def list_levels():
    """Return all available game levels and their configurations."""
    return {"levels": get_all_levels()}


@app.get("/api/levels/{level_id}/data")
def get_level_data(
    level_id: int,
    layers: int = 1,
    use_entanglement: bool = False,
):
    """Return train/test points and initial quantum circuit state for a level."""
    try:
        level_cfg = get_level_config(level_id)
        dataset = get_level_dataset(level_id)
    except ValueError as exc:
        raise HTTPException(status_code=404, detail=str(exc)) from exc

    layers = max(1, min(3, layers))
    init_params = default_initial_parameters(layers, seed=100 + level_id * 7)
    theta = np.array(init_params, dtype=float)

    raw = dataset["_raw"]
    init_loss, train_acc = compute_loss_and_accuracy(
        raw["X_train"], raw["y_train"], theta, layers, use_entanglement
    )
    _, test_acc = compute_loss_and_accuracy(
        raw["X_test"], raw["y_test"], theta, layers, use_entanglement
    )
    decision_grid = compute_decision_grid(
        params=theta,
        layers=layers,
        use_entanglement=use_entanglement,
        resolution=25,
    )
    circuit_ascii = get_circuit_ascii(
        layers=layers,
        use_entanglement=use_entanglement,
        theta_values=init_params,
    )
    telemetry = verify_with_qiskit_statevector(
        x_sample=(0.5, 0.5),
        params=theta,
        layers=layers,
        use_entanglement=use_entanglement,
    )

    return {
        "level_id": level_id,
        "level": level_cfg,
        "train_points": dataset["train_points"],
        "test_points": dataset["test_points"],
        "initial_parameters": init_params,
        "train_accuracy": round(train_acc, 4),
        "test_accuracy": round(test_acc, 4),
        "initial_loss": round(init_loss, 4),
        "grid_resolution": 25,
        "decision_grid": decision_grid,
        "circuit_ascii": circuit_ascii,
        "quantum_telemetry": telemetry,
    }


@app.post("/api/train")
def train_endpoint(req: TrainRequest):
    """Execute N variational optimization epochs on the quantum circuit."""
    try:
        level_cfg = get_level_config(req.level_id)
        dataset = get_level_dataset(req.level_id)
    except ValueError as exc:
        raise HTTPException(status_code=404, detail=str(exc)) from exc

    raw = dataset["_raw"]
    result = train_quantum_circuit(
        X_train=raw["X_train"],
        y_train=raw["y_train"],
        X_test=raw["X_test"],
        y_test=raw["y_test"],
        current_parameters=req.current_parameters,
        layers=req.layers,
        use_entanglement=req.use_entanglement,
        epochs=req.epochs,
        learning_rate=req.learning_rate,
        grid_resolution=25,
    )

    coherence_consumed = calculate_coherence_cost(
        epochs=req.epochs,
        layers=req.layers,
        use_entanglement=req.use_entanglement,
    )

    rem_coherence = (
        max(0, req.coherence_remaining - coherence_consumed)
        if req.coherence_remaining is not None
        else max(0, level_cfg["initial_coherence"] - coherence_consumed)
    )

    scoring = calculate_score_and_stars(
        test_accuracy=result["test_accuracy"],
        coherence_remaining=rem_coherence,
        initial_coherence=level_cfg["initial_coherence"],
        layers=req.layers,
        target_accuracy=level_cfg["target_accuracy"],
    )

    return {
        **result,
        "coherence_consumed": coherence_consumed,
        "evaluation": scoring,
    }


@app.get("/api/sandbox/datasets")
def list_sandbox_datasets():
    """Return the dataset types selectable in the free-play Playground sandbox."""
    return {
        "datasets": [
            {"id": key, "label": label} for key, label in SANDBOX_DATASET_LABELS.items()
        ]
    }


@app.post("/api/sandbox/data")
def sandbox_data(req: SandboxDataRequest):
    """Generate a fresh sandbox dataset and the initial (untrained) circuit state."""
    try:
        dataset = get_sandbox_dataset(req.dataset_type, req.noise, seed=req.seed)
    except ValueError as exc:
        raise HTTPException(status_code=400, detail=str(exc)) from exc

    layers = max(1, min(3, req.layers))
    init_params = default_initial_parameters(layers, seed=321)
    theta = np.array(init_params, dtype=float)

    raw = dataset["_raw"]
    init_loss, train_acc = compute_loss_and_accuracy(
        raw["X_train"], raw["y_train"], theta, layers, req.use_entanglement
    )
    _, test_acc = compute_loss_and_accuracy(
        raw["X_test"], raw["y_test"], theta, layers, req.use_entanglement
    )
    decision_grid = compute_decision_grid(
        params=theta,
        layers=layers,
        use_entanglement=req.use_entanglement,
        resolution=25,
    )
    circuit_ascii = get_circuit_ascii(
        layers=layers,
        use_entanglement=req.use_entanglement,
        theta_values=init_params,
    )

    return {
        "dataset_type": req.dataset_type,
        "noise": dataset["noise"],
        "train_points": dataset["train_points"],
        "test_points": dataset["test_points"],
        "initial_parameters": init_params,
        "train_accuracy": round(train_acc, 4),
        "test_accuracy": round(test_acc, 4),
        "initial_loss": round(init_loss, 4),
        "grid_resolution": 25,
        "decision_grid": decision_grid,
        "circuit_ascii": circuit_ascii,
    }


@app.post("/api/sandbox/train")
def sandbox_train(req: SandboxTrainRequest):
    """Run free-play training on the sandbox dataset — no coherence budget consumed."""
    try:
        dataset = get_sandbox_dataset(req.dataset_type, req.noise, seed=req.seed)
    except ValueError as exc:
        raise HTTPException(status_code=400, detail=str(exc)) from exc

    raw = dataset["_raw"]
    result = train_quantum_circuit(
        X_train=raw["X_train"],
        y_train=raw["y_train"],
        X_test=raw["X_test"],
        y_test=raw["y_test"],
        current_parameters=req.current_parameters,
        layers=req.layers,
        use_entanglement=req.use_entanglement,
        epochs=req.epochs,
        learning_rate=req.learning_rate,
        grid_resolution=25,
    )
    return {**result, "dataset_type": req.dataset_type, "noise": dataset["noise"]}


@app.post("/api/predict_grid")
def predict_grid_endpoint(req: PredictGridRequest):
    """
    Evaluate the decision boundary grid and accuracies for arbitrary circuit parameters
    without consuming coherence budget (used for manual gate angle sliders & circuit resets).
    """
    try:
        dataset = get_level_dataset(req.level_id)
    except ValueError as exc:
        raise HTTPException(status_code=404, detail=str(exc)) from exc

    num_params = get_num_parameters(req.layers)
    if req.parameters and len(req.parameters) >= num_params:
        params = [round(float(p), 4) for p in req.parameters[:num_params]]
    elif req.parameters:
        padded = list(req.parameters) + default_initial_parameters(req.layers)[len(req.parameters) :]
        params = [round(float(p), 4) for p in padded[:num_params]]
    else:
        params = default_initial_parameters(req.layers, seed=100 + req.level_id * 7)

    theta = np.array(params, dtype=float)
    raw = dataset["_raw"]
    loss, train_acc = compute_loss_and_accuracy(
        raw["X_train"], raw["y_train"], theta, req.layers, req.use_entanglement
    )
    _, test_acc = compute_loss_and_accuracy(
        raw["X_test"], raw["y_test"], theta, req.layers, req.use_entanglement
    )
    decision_grid = compute_decision_grid(
        params=theta,
        layers=req.layers,
        use_entanglement=req.use_entanglement,
        resolution=req.grid_resolution,
    )
    circuit_ascii = get_circuit_ascii(
        layers=req.layers,
        use_entanglement=req.use_entanglement,
        theta_values=params,
    )
    telemetry = verify_with_qiskit_statevector(
        x_sample=(0.5, 0.5),
        params=theta,
        layers=req.layers,
        use_entanglement=req.use_entanglement,
    )

    return {
        "parameters": params,
        "loss": round(loss, 4),
        "train_accuracy": round(train_acc, 4),
        "test_accuracy": round(test_acc, 4),
        "grid_resolution": req.grid_resolution,
        "decision_grid": decision_grid,
        "circuit_ascii": circuit_ascii,
        "quantum_telemetry": telemetry,
    }
