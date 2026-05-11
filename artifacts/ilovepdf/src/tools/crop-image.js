import { generateFilename, downloadBlob, setBtn, showErr, clearErr, showResult, setupDropZone, trustBar, toolHeader } from '../utils/helpers.js';

export class CropImageTool {
  constructor() { this.file = null; this.img = null; this.crop = {x:0,y:0,w:0,h:0}; this.dragging=false; }

  render() {
    return `
    ${toolHeader('✂️','Crop Image','Crop images by specifying pixel dimensions or drawing a selection.')}
    ${trustBar()}
    <div id="crop-img-zone" class="upload-zone" style="margin-bottom:1.5rem;">
      <div style="font-size:2.5rem;margin-bottom:.75rem;">🖼️</div>
      <p style="font-weight:600;color:#1A1530;margin-bottom:.25rem;">Drop an image here</p>
      <p style="font-size:.875rem;color:#6B7280;">JPG, PNG, WEBP supported</p>
      <input id="crop-img-input" type="file" accept="image/*" style="display:none;" />
    </div>
    <div id="crop-img-options" style="display:none;margin-bottom:1.5rem;">
      <p id="crop-img-info" style="font-weight:600;color:#1A1530;margin-bottom:1rem;"></p>
      <div style="display:grid;grid-template-columns:1fr 1fr 1fr 1fr;gap:.75rem;max-width:480px;margin-bottom:1rem;">
        <div><label style="font-size:.85rem;color:#6B7280;display:block;margin-bottom:.25rem;">X</label><input id="ci-x" type="number" min="0" value="0" /></div>
        <div><label style="font-size:.85rem;color:#6B7280;display:block;margin-bottom:.25rem;">Y</label><input id="ci-y" type="number" min="0" value="0" /></div>
        <div><label style="font-size:.85rem;color:#6B7280;display:block;margin-bottom:.25rem;">Width</label><input id="ci-w" type="number" min="1" value="500" /></div>
        <div><label style="font-size:.85rem;color:#6B7280;display:block;margin-bottom:.25rem;">Height</label><input id="ci-h" type="number" min="1" value="500" /></div>
      </div>
      <div style="margin-bottom:.75rem;">
        <label style="font-weight:600;font-size:.9rem;color:#1A1530;display:block;margin-bottom:.4rem;">Output Format</label>
        <select id="ci-format" style="max-width:160px;"><option value="image/jpeg">JPG</option><option value="image/png">PNG</option><option value="image/webp">WEBP</option></select>
      </div>
    </div>
    <button id="crop-img-btn" class="btn-primary" data-label="✂️ Crop Image" style="display:none;">✂️ Crop Image</button>
    <div id="crop-img-error" class="error-box"></div>
    <div id="crop-img-result" class="result-box"></div>`;
  }

  setupEvents() {
    setupDropZone('crop-img-zone','crop-img-input', files => this.loadFile(files[0]));
  }

  loadFile(f) {
    if (!f || !f.type.startsWith('image/')) { showErr('crop-img-error','Please select an image.'); return; }
    if (f.size === 0) { showErr('crop-img-error','File is empty.'); return; }
    clearErr('crop-img-error');
    this.file = f;
    const img = new Image();
    img.onload = () => {
      this.img = img;
      document.getElementById('crop-img-info').textContent = `🖼️ ${f.name} — ${img.width}×${img.height}px`;
      document.getElementById('ci-w').value = img.width;
      document.getElementById('ci-h').value = img.height;
      document.getElementById('ci-x').max = img.width;
      document.getElementById('ci-y').max = img.height;
      document.getElementById('crop-img-options').style.display = 'block';
      const btn = document.getElementById('crop-img-btn');
      btn.style.display = 'inline-flex';
      btn.onclick = () => this.crop();
    };
    img.src = URL.createObjectURL(f);
  }

  crop() {
    if (!this.img) return;
    const x = parseInt(document.getElementById('ci-x').value)||0;
    const y = parseInt(document.getElementById('ci-y').value)||0;
    const w = Math.max(1, parseInt(document.getElementById('ci-w').value)||100);
    const h = Math.max(1, parseInt(document.getElementById('ci-h').value)||100);
    const format = document.getElementById('ci-format').value;
    const ext = format.split('/')[1];
    setBtn('crop-img-btn', true); clearErr('crop-img-error');
    try {
      const canvas = document.createElement('canvas');
      canvas.width = w; canvas.height = h;
      canvas.getContext('2d').drawImage(this.img, x, y, w, h, 0, 0, w, h);
      canvas.toBlob(blob => {
        const fname = generateFilename(this.file.name.replace(/\.[^.]+$/,'')+'_cropped', ext);
        downloadBlob(blob, fname);
        showResult('crop-img-result',`
          <p style="font-weight:700;color:#166534;">✅ Cropped successfully!</p>
          <p style="font-size:.875rem;color:#166534;margin-top:.25rem;">${w}×${h}px — Downloaded: <strong>${fname}</strong></p>
          <img src="${canvas.toDataURL()}" style="max-width:300px;max-height:200px;margin-top:.75rem;border-radius:8px;border:1px solid #BBF7D0;" />`);
        setBtn('crop-img-btn', false, '✂️ Crop Image');
      }, format, 0.92);
    } catch(e) { showErr('crop-img-error','Crop failed: ' + e.message); setBtn('crop-img-btn', false, '✂️ Crop Image'); }
  }
}
