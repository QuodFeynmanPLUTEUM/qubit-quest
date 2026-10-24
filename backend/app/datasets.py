"""Synthetic 2D dataset generators for Qubit Quest levels."""

from typing import Dict, List, Tuple
import numpy as np
from sklearn.datasets import make_blobs, make_circles
from sklearn.model_selection import train_test_split


def _generate_linear_blobs(seed: int = 42) -> Tuple[np.ndarray, np.ndarray]:
    """Level 1: Two linearly separable clusters."""
    centers = [[-0.65, -0.55], [0.65, 0.55]]
    X, y = make_blobs(
        n_samples=60,
        centers=centers,
        cluster_std=0.28,
        random_state=seed,
    )
    X = np.clip(X, -1.35, 1.35)
    return X, y


def _generate_concentric_circles(seed: int = 42) -> Tuple[np.ndarray, np.ndarray]:
    """Level 2: Non-linear concentric circles requiring multi-layer quantum feature re-uploading."""
    X, y = make_circles(
        n_samples=72,
        factor=0.32,
        noise=0.07,
        random_state=seed,
    )
    # Scale outer ring to ~1.05 so inner cluster is ~0.34
    X = X * 1.08
    X = np.clip(X, -1.35, 1.35)
    return X, y


def _generate_quantum_xor(seed: int = 42) -> Tuple[np.ndarray, np.ndarray]:
    """Level 3: 4-quadrant Quantum XOR pattern requiring CNOT entanglement."""
    rng = np.random.RandomState(seed)
    n_per_quadrant = 18
    quadrant_centers = [
        (0.68, 0.68, 1),
        (-0.68, -0.68, 1),
        (-0.68, 0.68, 0),
        (0.68, -0.68, 0),
    ]
    xs = []
    ys = []
    for cx, cy, label in quadrant_centers:
        pts = rng.normal(loc=[cx, cy], scale=0.20, size=(n_per_quadrant, 2))
        xs.append(pts)
        ys.append(np.full(n_per_quadrant, label, dtype=int))
    X = np.vstack(xs)
    y = np.concatenate(ys)
    X = np.clip(X, -1.35, 1.35)
    return X, y


_DATASET_CACHE: Dict[int, Dict] = {}


def get_level_dataset(level_id: int) -> Dict:
    """Return deterministic train and test splits for the requested level."""
    if level_id in _DATASET_CACHE:
        return _DATASET_CACHE[level_id]

    if level_id == 1:
        X, y = _generate_linear_blobs(seed=42)
    elif level_id == 2:
        X, y = _generate_concentric_circles(seed=42)
    elif level_id == 3:
        X, y = _generate_quantum_xor(seed=42)
    else:
        raise ValueError(f"Unknown level_id: {level_id}")

    X_train, X_test, y_train, y_test = train_test_split(
        X,
        y,
        test_size=0.33,
        random_state=42,
        stratify=y,
    )

    train_points: List[Dict] = [
        {"x": round(float(pt[0]), 4), "y": round(float(pt[1]), 4), "label": int(lbl)}
        for pt, lbl in zip(X_train, y_train)
    ]
    test_points: List[Dict] = [
        {"x": round(float(pt[0]), 4), "y": round(float(pt[1]), 4), "label": int(lbl)}
        for pt, lbl in zip(X_test, y_test)
    ]

    result = {
        "level_id": level_id,
        "train_points": train_points,
        "test_points": test_points,
        "_raw": {
            "X_train": X_train,
            "y_train": y_train,
            "X_test": X_test,
            "y_test": y_test,
        },
    }
    _DATASET_CACHE[level_id] = result
    return result
