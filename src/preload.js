// Downloads with byte-level progress, for the loading ring on the enter gate.

// fetch a file into memory, reporting onBytes(received, total) as it arrives
export async function fetchWithProgress(url, onBytes = () => {}) {
  const r = await fetch(url);
  if (!r.ok) throw new Error(`${url}: ${r.status}`);
  const total = +r.headers.get('content-length') || 0;
  onBytes(0, total);
  if (!r.body) {
    const b = await r.blob();
    onBytes(b.size, total || b.size);
    return b;
  }
  const reader = r.body.getReader(), parts = [];
  let got = 0;
  for (;;) {
    const { done, value } = await reader.read();
    if (done) break;
    parts.push(value);
    got += value.length;
    onBytes(got, total);
  }
  return new Blob(parts, { type: r.headers.get('content-type') || '' });
}

// jobs: [(onBytes) => Promise]. onProgress(0..1) is weighted by bytes and never moves backwards.
// It stays quiet until every file has reported its size (or settled), so the percentage is measured
// against the true grand total instead of one that keeps growing. Resolves once every job has finished or failed.
export function loadAll(jobs, onProgress) {
  const got = jobs.map(() => 0), total = jobs.map(() => 0), known = jobs.map(() => false);
  let shown = 0;
  const report = () => {
    if (!known.every(Boolean)) return;
    const t = total.reduce((a, b) => a + b, 0);
    if (!t) return;
    shown = Math.max(shown, Math.min(1, got.reduce((a, b) => a + b, 0) / t));
    onProgress(shown);
  };
  const settle = (i) => { known[i] = true; total[i] = Math.max(total[i], got[i]); report(); };
  return Promise.allSettled(jobs.map((job, i) =>
    job((g, t) => { got[i] = g; if (t) { total[i] = t; known[i] = true; } report(); })
      .finally(() => settle(i))))
    .then(() => onProgress(1));
}
