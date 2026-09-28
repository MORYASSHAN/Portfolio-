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

// jobs: [(onBytes) => Promise]. onProgress(0..1) is weighted by bytes and never moves backwards,
// even as later files report their sizes. Resolves once every job has finished or failed.
export function loadAll(jobs, onProgress) {
  const got = jobs.map(() => 0), total = jobs.map(() => 0);
  let shown = 0;
  const report = () => {
    const t = total.reduce((a, b) => a + b, 0);
    if (!t) return;
    shown = Math.max(shown, Math.min(1, got.reduce((a, b) => a + b, 0) / t));
    onProgress(shown);
  };
  return Promise.allSettled(jobs.map((job, i) => job((g, t) => { got[i] = g; if (t) total[i] = t; report(); })))
    .then(() => onProgress(1));
}
