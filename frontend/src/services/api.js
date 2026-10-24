const API_BASE = import.meta.env.VITE_API_BASE_URL || '/api';

async function request(path, options = {}) {
  const res = await fetch(`${API_BASE}${path}`, {
    headers: {
      'Content-Type': 'application/json',
      ...(options.headers || {}),
    },
    ...options,
  });

  if (!res.ok) {
    let errText = `HTTP ${res.status}`;
    try {
      const data = await res.json();
      errText = data.detail || errText;
    } catch {
      // ignore json parse error
    }
    throw new Error(errText);
  }

  return res.json();
}

export async function checkHealth() {
  return request('/health');
}

export async function fetchLevels() {
  return request('/levels');
}

export async function fetchLevelData(levelId, layers = 1, useEntanglement = false) {
  const params = new URLSearchParams({
    layers: String(layers),
    use_entanglement: String(useEntanglement),
  });
  return request(`/levels/${levelId}/data?${params.toString()}`);
}

export async function trainCircuit({
  levelId,
  currentParameters,
  layers,
  useEntanglement,
  epochs,
  learningRate = 0.12,
  coherenceRemaining,
}) {
  return request('/train', {
    method: 'POST',
    body: JSON.stringify({
      level_id: levelId,
      current_parameters: currentParameters,
      layers,
      use_entanglement: useEntanglement,
      epochs,
      learning_rate: learningRate,
      coherence_remaining: coherenceRemaining,
    }),
  });
}

export async function predictGrid({
  levelId,
  parameters,
  layers,
  useEntanglement,
  gridResolution = 25,
}) {
  return request('/predict_grid', {
    method: 'POST',
    body: JSON.stringify({
      level_id: levelId,
      parameters,
      layers,
      use_entanglement: useEntanglement,
      grid_resolution: gridResolution,
    }),
  });
}
