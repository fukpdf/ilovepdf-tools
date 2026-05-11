export function loadScript(url) {
  return new Promise((resolve, reject) => {
    if (document.querySelector(`script[src="${url}"]`)) { resolve(); return; }
    const s = document.createElement('script');
    s.src = url; s.onload = resolve; s.onerror = () => reject(new Error('Failed to load: ' + url));
    document.head.appendChild(s);
  });
}

export function generateFilename(originalName, ext) {
  let base = (originalName || 'file').replace(/\.[^.]+$/, '').replace(/[^a-zA-Z0-9_-]/g, '_');
  if (base.endsWith('-ilovepdf.cyou')) return base + '.' + ext;
  return base + '-ilovepdf.cyou.' + ext;
}

export function downloadBlob(blob, filename) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url; a.download = filename; a.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

export function setBtn(id, loading, label = '') {
  const btn = document.getElementById(id);
  if (!btn) return;
  btn.disabled = loading;
  btn.innerHTML = loading
    ? `<span class="spinner"></span> Processing...`
    : label || btn.dataset.label || 'Process';
}

export function showErr(id, msg) {
  const el = document.getElementById(id);
  if (!el) return;
  el.textContent = '⚠️ ' + msg;
  el.classList.add('show');
}

export function clearErr(id) {
  const el = document.getElementById(id);
  if (el) el.classList.remove('show');
}

export function showResult(id, html) {
  const el = document.getElementById(id);
  if (!el) return;
  el.innerHTML = html;
  el.classList.add('show');
}

export function setupDropZone(zoneId, inputId, onFiles) {
  const zone = document.getElementById(zoneId);
  const input = document.getElementById(inputId);
  if (!zone || !input) return;
  zone.addEventListener('click', () => input.click());
  zone.addEventListener('dragover', e => { e.preventDefault(); zone.classList.add('drag-over'); });
  zone.addEventListener('dragleave', () => zone.classList.remove('drag-over'));
  zone.addEventListener('drop', e => {
    e.preventDefault(); zone.classList.remove('drag-over');
    if (e.dataTransfer.files.length) onFiles(e.dataTransfer.files);
  });
  input.addEventListener('change', () => { if (input.files.length) onFiles(input.files); });
}

export function trustBar() {
  return `<div class="trust-bar"><span>🔒 Files never leave your device</span><span>⚡ Instant browser processing</span><span>🗑️ Auto-cleanup</span><span>✅ No account required</span></div>`;
}

export function toolHeader(icon, title, desc) {
  return `
  <div style="margin-bottom:2rem;">
    <a href="#" style="color:#7B3FF2;text-decoration:none;font-size:.9rem;display:inline-flex;align-items:center;gap:.4rem;margin-bottom:1.5rem;">← All Tools</a>
    <div style="display:flex;align-items:center;gap:1rem;margin-bottom:.75rem;">
      <span style="font-size:2.5rem;">${icon}</span>
      <h1 style="font-size:1.8rem;font-weight:800;color:#1A1530;">${title}</h1>
    </div>
    <p style="color:#6B7280;font-size:1rem;line-height:1.6;">${desc}</p>
  </div>`;
}
