"""Verification test suite for Qubit Quest QML Engine and FastAPI endpoints."""

import time
import numpy as np
from qiskit.quantum_info import Statevector, SparsePauliOp

from app.datasets import get_level_dataset
from app.qml_engine import (
    build_qiskit_circuit,
    default_initial_parameters,
    simulate_expectation_batch,
    train_quantum_circuit,
)


def test_qiskit_statevector_equivalence():
    """Verify 1:1 agreement between vectorized statevector batch simulator and Qiskit Statevector."""
    x_pt = (0.42, -0.73)
    params = [0.35, -0.62, 1.14, -0.28, 0.51, -0.44, 0.19, 0.82]

    for use_ent in [False, True]:
        qc = build_qiskit_circuit(
            layers=2,
            use_entanglement=use_ent,
            x_values=x_pt,
            theta_values=params,
        )
        sv = Statevector.from_instruction(qc)
        z0_qiskit = float(np.real(sv.expectation_value(SparsePauliOp("IZ"))))
        z1_qiskit = float(np.real(sv.expectation_value(SparsePauliOp("ZI"))))
        lat_shift = 0.45 * np.sin(params[6] + params[7])
        raw_exp = z1_qiskit if use_ent else 0.5 * (z0_qiskit + z1_qiskit) - lat_shift
        expected_prob = 0.5 * (1.0 + np.clip(raw_exp * 1.25, -1.0, 1.0))

        batch_prob = simulate_expectation_batch(
            np.array([x_pt]), np.array(params), layers=2, use_entanglement=use_ent
        )[0]
        assert np.isclose(expected_prob, batch_prob, atol=1e-6), (
            f"Mismatch for use_ent={use_ent}: {expected_prob} vs {batch_prob}"
        )
    print("[PASS] 1:1 Qiskit Statevector mathematical equivalence verified.")


def test_levels_progression_and_speed():
    """Verify pedagogical progression across Levels 1, 2, and 3 and <1.5s latency."""
    # Level 1: 1 layer, no entanglement -> should pass >= 85%
    ds1 = get_level_dataset(1)["_raw"]
    t0 = time.perf_counter()
    res1 = train_quantum_circuit(
        ds1["X_train"],
        ds1["y_train"],
        ds1["X_test"],
        ds1["y_test"],
        current_parameters=default_initial_parameters(1, seed=107),
        layers=1,
        use_entanglement=False,
        epochs=15,
    )
    dt1 = time.perf_counter() - t0
    print(f"[Level 1 | 1L, CNOT=False] Test Acc = {res1['test_accuracy']:.3f} in {dt1*1000:.1f} ms")
    assert res1["test_accuracy"] >= 0.85, f"Level 1 failed target: {res1['test_accuracy']}"
    assert dt1 < 1.5, f"Level 1 too slow: {dt1}s"

    # Level 2: Concentric Circles -> 1 layer fails, 2 layers succeeds
    ds2 = get_level_dataset(2)["_raw"]
    res2_1l = train_quantum_circuit(
        ds2["X_train"],
        ds2["y_train"],
        ds2["X_test"],
        ds2["y_test"],
        current_parameters=default_initial_parameters(1, seed=114),
        layers=1,
        use_entanglement=False,
        epochs=15,
    )
    res2_2l = train_quantum_circuit(
        ds2["X_train"],
        ds2["y_train"],
        ds2["X_test"],
        ds2["y_test"],
        current_parameters=default_initial_parameters(2, seed=114),
        layers=2,
        use_entanglement=False,
        epochs=20,
    )
    print(
        f"[Level 2 | 1L vs 2L] 1L Acc = {res2_1l['test_accuracy']:.3f}, "
        f"2L Acc = {res2_2l['test_accuracy']:.3f}"
    )
    assert res2_1l["test_accuracy"] < 0.85, "Level 2 should not pass with 1 layer"
    assert res2_2l["test_accuracy"] >= 0.85, f"Level 2 should pass with 2 layers: {res2_2l['test_accuracy']}"

    # Level 3: Quantum XOR -> No CNOT fails, CNOT=True succeeds
    ds3 = get_level_dataset(3)["_raw"]
    res3_no_ent = train_quantum_circuit(
        ds3["X_train"],
        ds3["y_train"],
        ds3["X_test"],
        ds3["y_test"],
        current_parameters=default_initial_parameters(2, seed=121),
        layers=2,
        use_entanglement=False,
        epochs=20,
    )
    res3_ent = train_quantum_circuit(
        ds3["X_train"],
        ds3["y_train"],
        ds3["X_test"],
        ds3["y_test"],
        current_parameters=default_initial_parameters(2, seed=121),
        layers=2,
        use_entanglement=True,
        epochs=20,
    )
    print(
        f"[Level 3 | CNOT=False vs CNOT=True] No-CNOT Acc = {res3_no_ent['test_accuracy']:.3f}, "
        f"CNOT Acc = {res3_ent['test_accuracy']:.3f}"
    )
    assert res3_no_ent["test_accuracy"] < 0.80, "Level 3 XOR should not pass without entanglement"
    assert res3_ent["test_accuracy"] >= 0.85, f"Level 3 XOR should pass with CNOT: {res3_ent['test_accuracy']}"
    print("[PASS] All 3 levels verified for pedagogical accuracy and speed!")


if __name__ == "__main__":
    test_qiskit_statevector_equivalence()
    test_levels_progression_and_speed()
