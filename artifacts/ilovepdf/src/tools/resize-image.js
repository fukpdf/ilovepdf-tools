import { generateFilename, downloadBlob, setBtn, showErr, clearErr, showResult, setupDropZone, trustBar, toolHeader } from '../utils/helpers.js';

export class ResizeImageTool {
  constructor() { this.file = null; this.img = null; }

  render() {
    return `
    ${toolHeader('📐','Resize Image','Change image dimensions while maintaining aspect ratio.')}
    ${trustBar()}
    <div id="resize-zone" class="upload-zone" style="margin-bottom:1.5rem;">
      <div style="font-size:2.5rem;margin-bottom:.75rem;">🖼️</div>
      <p style="font-weight:600;color:#1A1530;margin-bottom:.25rem;">Drop an image here</p>
      <p style="font-size:.875rem;color:#6B7280;">JPG, PNG, WEBP supported</p>
      <input id="resize-input" type="file" accept="image/*" style="display:none;" />
    </div>
    <div id="resize-options" style="display:none;margin-bottom:1.5rem;">
      <p id="resize-info" style="font-weight:600;color:#1A1530;margin-bottom:1rem;"></p>
      <div style="display:grid;grid-template-columns:auto 1fr auto 1fr auto;gap:.75rem;align-items:center;max-width:400px;margin-bottom:1rem;">
        <label style="font-size:.9rem;font-weight:600;color:#1A1530;">W</label>
        <input id="rs-w" type="number" min="1" max="10000" oninput="window._rsUpdateH(this.value)" />
        <label style="font-size:.9rem;font-weight:600;color:#1A1530;">H</label>
        <input id="rs-h" type="number" min="1" max="10000" oninput="window._rsUpdateW(this.value)" />
        <label><input id="rs-lock" type="checkbox" checked style="accent-color:#7B3FF2;" /> Lock</label>
      </div>
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:.75rem;max-width:300px;">
        <div>
          <label style="font-weight:600;font-size:.9rem;color:#1A1530;display:block;margin-bottom:.4rem;">Format</label>
          <select id="rs-format"><option value="image/jpeg">JPG</option><option value="image/png">PNG</option><option value="image/webp">WEBP</option></select>
        </div>
        <div>
          <label style="font-weight:600;font-size:.9rem;color:#1A1530;display:block;margin-bottom:.4rem;">Quality</label>
          <input id="rs-quality" type="number" min="10" max="100" value="90" />
        </div>
      </div>
    </div>
    <button id="resize-btn" class="btn-primary" data-label="📐 Resize Image" style="display:none;">📐 Resize Image</button>
    <div id="resize-error" class="error-box"></div>
    <div id="resize-result" class="result-box"></div>`;
  }

  setupEvents() {
    setupDropZone('resize-zone','resize-input', files => this.loadFile(files[0]));
  }

  loadFile(f) {
    if (!f || !f.type.startsWith('image/')) { showErr('resize-error','Please select an image.'); return; }
    if (f.size === 0) { showErr('resize-error','File is empty.'); return; }
    clearErr('resize-error');
    this.file = f;
    const img = new Image();
    img.onload = () => {
      this.img = img;
      this.origW = img.width; this.origH = img.height;
      document.getElementById('resize-info').textContent = `🖼️ ${f.name} — ${img.width}×${img.height}px`;
      document.getElementById('rs-w').value = img.width;
      document.getElementById('rs-h').value = img.height;
      document.getElementById('resize-options').style.display = 'block';
      document.getElementById('resize-btn').style.display = 'inline-flex';
      document.getElementById('resize-btn').onclick = () => this.resize();
      const ratio = img.width / img.height;
      window._rsUpdateH = (w) => { if(document.getElementById('rs-lock').checked) document.getElementById('rs-h').value = Math.round(w/ratio); };
      window._rsUpdateW = (h) => { if(document.getElementById('rs-lock').checked) document.getElementById('rs-w').value = Math.round(h*ratio); };
    };
    img.src = URL.createObjectURL(f);
  }

  resize() {
    if (!this.img) return;
    const w = parseInt(document.getElementById('rs-w').value);
    const h = parseInt(document.getElementById('rs-h').value);
    const format = document.getElementById('rs-format').value;
    const quality = parseInt(document.getElementById('rs-quality').value)/100;
    const ext = format.split('/')[1];
    setBtn('resize-btn', true); clearErr('resize-error');
    try {
      const canvas = document.createElement('canvas');
      canvas.width = w; canvas.height = h;
      const ctx = canvas.getContext('2d');
      if (format === 'image/jpeg') { ctx.fillStyle='white'; ctx.fillRect(0,0,w,h); }
      ctx.drawImage(this.img, 0, 0, w, h);
      canvas.toBlob(blob => {
        const fname = generateFilename(this.file.name.replace(/\.[^.]+$/,'')+'_resized', ext);
        downloadBlob(blob, fname);
        showResult('resize-result',`
          <p style="font-weight:700;color:#166534;">✅ Resized to ${w}×${h}px!</p>
          <p style="font-size:.875rem;color:#166534;margin-top:.25rem;">${(blob.size/1024).toFixed(1)} KB — Downloaded: <strong>${fname}</strong></p>
          <img src="${canvas.toDataURL()}" style="max-width:300px;max-height:200px;margin-top:.75rem;border-radius:8px;border:1px solid #BBF7D0;" />`);
        setBtn('resize-btn', false, '📐 Resize Image');
      }, format, quality);
    } catch(e) { showErr('resize-error','Resize failed: ' + e.message); setBtn('resize-btn', false, '📐 Resize Image'); }
  }
}
