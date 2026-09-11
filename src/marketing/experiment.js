const PREFIX = 'vy_experiment_';

function hash(value) {
  let result = 2166136261;
  for (let index = 0; index < value.length; index += 1) {
    result ^= value.charCodeAt(index);
    result = Math.imul(result, 16777619);
  }
  return result >>> 0;
}

export function assignExperiment(win, visitorId, experimentId, variants = ['control', 'variant']) {
  const key = `${PREFIX}${experimentId}`;
  try {
    const existing = win.localStorage.getItem(key);
    if (variants.includes(existing)) return existing;
  } catch { /* Deterministic fallback still keeps this visitor stable. */ }
  const variant = variants[hash(`${visitorId}:${experimentId}`) % variants.length];
  try { win.localStorage.setItem(key, variant); } catch { /* Optional persistence. */ }
  return variant;
}
