import { generateFilename, downloadBlob, setBtn, showErr, clearErr, showResult, setupDropZone, trustBar, toolHeader } from '../utils/helpers.js';

export class CompressImageTool {
  constructor() { this.file = null; this.img = null; }

  render() {
    return `
    ${toolHeader('🗜️','Compress Image','Reduce image file size using JPEG quality scaling via Canvas.')}
    ${trustBar()}
    <div id="cimg-zone" class="upload-zone" style="margin-bottom:1.5rem;">
      <div style="font-size:2.5rem;margin-bottom:.75rem;">🖼️</div>
      <p style="font-weight:600;color:#1A1530;margin-bottom:.25rem;">Drop an image here</p>
      <p style="font-size:.875rem;color:#6B7280;">JPG, PNG, WEBP supported</p>
      <input id="cimg-input" type="file" accept="image/*" style="display:none;" />
    </div>
    <div id="cimg-options" style="display:none;margin-bottom:1.5rem;">
      <p id="cimg-info" style="font-weight:600;color:#1A1530;margin-bottom:1rem;"></p>
      <div style="display:grid;gap:1rem;max-width:480px;">
        <div>
          <label style="font-weight:600;font-size:.9rem;color:#1A1530;display:block;margin-bottom:.5rem;">Quality: <span id="cimg-qval">80</span>%</label>
          <input type="range" id="cimg-quality" min="5" max="100" value="80" oninput="document.getElementById('cimg-qval').textContent=this.value" style="width:100%;" />
          <div style="display:flex;justify-content:space-between;font-size:.8rem;color:#9CA3AF;margin-top:.25rem;"><span>Smallest</span><span>Best Quality</span></div>
        </div>
        <div style="display:grid;grid-template-columns:1fr 1fr;gap:.75rem;">
          <div>
            <label style="font-weight:600;font-size:.9rem;color:#1A1530;display:block;margin-bottom:.4rem;">Max Width (px)</label>
            <input id="cimg-maxw" type="number" min="0" placeholder="No limit" />
          </div>
          <div>
            <label style="font-weight:600;font-size:.9rem;color:#1A1530;display:block;margin-bottom:.4rem;">Format</label>
            <select id="cimg-format"><option value="image/jpeg">JPG (smaller)</option><option value="image/webp">WEBP (modern)</option><option value="image/png">PNG (lossless)</option></select>
          </div>
        </div>
      </div>
    </div>
    <button id="cimg-btn" class="btn-primary" data-label="🗜️ Compress" style="display:none;">🗜️ Compress</button>
    <div id="cimg-error" class="error-box"></div>
    <div id="cimg-result" class="result-box"></div>`;
  }

  setupEvents() {
    setupDropZone('cimg-zone','cimg-input', files => this.loadFile(files[0]));
  }

  loadFile(f) {
    if (!f || !f.type.startsWith('image/')) { showErr('cimg-error','Please select an image.'); return; }
    if (f.size === 0) { showErr('cimg-error','File is empty.'); return; }
    clearErr('cimg-error');
    this.file = f;
    const img = new Image();
    img.onload = () => {
      this.img = img;
      document.getElementById('cimg-info').textContent = `🖼️ ${f.name} — ${img.width}×${img.height}px — ${(f.size/1024).toFixed(1)} KB`;
      document.getElementById('cimg-maxw').placeholder = `Max ${img.width}`;
      document.getElementById('cimg-options').style.display = 'block';
      document.getElementById('cimg-btn').style.display = 'inline-flex';
      document.getElementById('cimg-btn').onclick = () => this.compress();
    };
    img.src = URL.createObjectURL(f);
  }

  compress() {
    if (!this.img) return;
    const quality = parseInt(document.getElementById('cimg-quality').value)/100;
    const maxW = parseInt(document.getElementById('cimg-maxw').value)||this.img.width;
    const format = document.getElementById('cimg-format').value;
    const ext = format.split('/')[1];
    setBtn('cimg-btn', true); clearErr('cimg-error');
    try {
      const scale = Math.min(1, maxW/this.img.width);
      const w = Math.round(this.img.width*scale), h = Math.round(this.img.height*scale);
      const canvas = document.createElement('canvas');
      canvas.width = w; canvas.height = h;
      const ctx = canvas.getContext('2d');
      if (format === 'image/jpeg') { ctx.fillStyle='white'; ctx.fillRect(0,0,w,h); }
      ctx.drawImage(this.img, 0, 0, w, h);
      canvas.toBlob(blob => {
        const saved = ((this.file.size - blob.size)/this.file.size*100).toFixed(1);
        const fname = generateFilename(this.file.name.replace(/\.[^.]+$/,'')+'_compressed', ext);
        downloadBlob(blob, fname);
        showResult('cimg-result',`
          <p style="font-weight:700;color:#166534;margin-bottom:.75rem;">✅ Compressed!</p>
          <div style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:.75rem;text-align:center;margin-bottom:.75rem;">
            <div style="background:white;border-radius:8px;padding:.75rem;"><div style="font-size:.75rem;color:#6B7280;">Original</div><div style="font-weight:700;">${(this.file.size/1024).toFixed(1)} KB</div></div>
            <div style="background:white;border-radius:8px;padding:.75rem;"><div style="font-size:.75rem;color:#6B7280;">Compressed</div><div style="font-weight:700;color:#7B3FF2;">${(blob.size/1024).toFixed(1)} KB</div></div>
            <div style="background:white;border-radius:8px;padding:.75rem;"><div style="font-size:.75rem;color:#6B7280;">Saved</div><div style="font-weight:700;color:#059669;">${saved}%</div></div>
          </div>
          <p style="font-size:.875rem;color:#166534;">Downloaded: <strong>${fname}</strong></p>`);
        setBtn('cimg-btn', false, '🗜️ Compress');
      }, format, quality);
    } catch(e) { showErr('cimg-error','Compression failed: ' + e.message); setBtn('cimg-btn', false, '🗜️ Compress'); }
  }
}
