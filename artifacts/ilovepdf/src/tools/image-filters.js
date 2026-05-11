import { generateFilename, downloadBlob, setBtn, showErr, clearErr, showResult, setupDropZone, trustBar, toolHeader } from '../utils/helpers.js';

export class ImageFiltersTool {
  constructor() { this.file = null; this.img = null; }

  render() {
    return `
    ${toolHeader('🎞️','Image Filters','Apply brightness, contrast, saturation, and blur effects to images.')}
    ${trustBar()}
    <div id="filt-zone" class="upload-zone" style="margin-bottom:1.5rem;">
      <div style="font-size:2.5rem;margin-bottom:.75rem;">🖼️</div>
      <p style="font-weight:600;color:#1A1530;margin-bottom:.25rem;">Drop an image here</p>
      <p style="font-size:.875rem;color:#6B7280;">JPG, PNG, WEBP supported</p>
      <input id="filt-input" type="file" accept="image/*" style="display:none;" />
    </div>
    <div id="filt-options" style="display:none;margin-bottom:1.5rem;">
      <p id="filt-info" style="font-weight:600;color:#1A1530;margin-bottom:1rem;"></p>
      <div style="display:grid;gap:1rem;max-width:480px;">
        ${[['brightness','Brightness','0','200','100','%'],['contrast','Contrast','0','200','100','%'],['saturate','Saturation','0','200','100','%'],['hue-rotate','Hue Rotate','0','360','0','°'],['blur','Blur','0','10','0','px'],['opacity','Opacity','0','100','100','%'],['sepia','Sepia','0','100','0','%'],['grayscale','Grayscale','0','100','0','%']].map(([id,label,min,max,def,unit])=>`
          <div style="display:grid;grid-template-columns:120px 1fr 60px;align-items:center;gap:.75rem;">
            <label style="font-weight:600;font-size:.875rem;color:#1A1530;">${label}</label>
            <input type="range" id="filt-${id}" min="${min}" max="${max}" value="${def}" oninput="document.getElementById('filt-${id}-v').textContent=this.value+'${unit}';window._filtPreview()" style="flex:1;" />
            <span id="filt-${id}-v" style="font-size:.85rem;color:#7B3FF2;font-weight:600;text-align:right;">${def}${unit}</span>
          </div>`).join('')}
      </div>
      <div style="margin-top:1rem;">
        <canvas id="filt-preview" style="max-width:100%;border-radius:8px;border:1px solid #E5E7EB;display:block;max-height:250px;"></canvas>
      </div>
      <button id="filt-reset" style="background:#F3F4F6;border:1px solid #E5E7EB;border-radius:8px;padding:.5rem 1rem;cursor:pointer;font-family:'Plus Jakarta Sans',sans-serif;min-height:44px;margin-top:.75rem;" onclick="window._filtReset()">Reset All</button>
    </div>
    <button id="filt-btn" class="btn-primary" data-label="🎞️ Apply Filters" style="display:none;">🎞️ Apply Filters</button>
    <div id="filt-error" class="error-box"></div>
    <div id="filt-result" class="result-box"></div>`;
  }

  setupEvents() {
    setupDropZone('filt-zone','filt-input', files => this.loadFile(files[0]));
  }

  loadFile(f) {
    if (!f || !f.type.startsWith('image/')) { showErr('filt-error','Please select an image.'); return; }
    if (f.size === 0) { showErr('filt-error','File is empty.'); return; }
    clearErr('filt-error');
    this.file = f;
    const img = new Image();
    img.onload = () => {
      this.img = img;
      document.getElementById('filt-info').textContent = `🖼️ ${f.name} — ${img.width}×${img.height}px`;
      document.getElementById('filt-options').style.display = 'block';
      document.getElementById('filt-btn').style.display = 'inline-flex';
      document.getElementById('filt-btn').onclick = () => this.apply();
      window._filtPreview = () => this.preview();
      window._filtReset = () => {
        [['brightness','100'],['contrast','100'],['saturate','100'],['hue-rotate','0'],['blur','0'],['opacity','100'],['sepia','0'],['grayscale','0']].forEach(([id,def]) => {
          const el = document.getElementById('filt-'+id); if(el) el.value=def;
          const unit = id==='blur'?'px':id==='hue-rotate'?'°':'%';
          const vEl = document.getElementById('filt-'+id+'-v'); if(vEl) vEl.textContent=def+unit;
        });
        this.preview();
      };
      this.preview();
    };
    img.src = URL.createObjectURL(f);
  }

  getFilter() {
    const get = id => document.getElementById('filt-'+id)?.value||'0';
    return `brightness(${get('brightness')}%) contrast(${get('contrast')}%) saturate(${get('saturate')}%) hue-rotate(${get('hue-rotate')}deg) blur(${get('blur')}px) opacity(${get('opacity')}%) sepia(${get('sepia')}%) grayscale(${get('grayscale')}%)`;
  }

  preview() {
    if (!this.img) return;
    const canvas = document.getElementById('filt-preview');
    const scale = Math.min(1, 400/this.img.width, 250/this.img.height);
    canvas.width = this.img.width*scale; canvas.height = this.img.height*scale;
    const ctx = canvas.getContext('2d');
    ctx.filter = this.getFilter();
    ctx.drawImage(this.img, 0, 0, canvas.width, canvas.height);
  }

  apply() {
    if (!this.img) return;
    setBtn('filt-btn', true); clearErr('filt-error');
    try {
      const canvas = document.createElement('canvas');
      canvas.width = this.img.width; canvas.height = this.img.height;
      const ctx = canvas.getContext('2d');
      ctx.filter = this.getFilter();
      ctx.drawImage(this.img, 0, 0);
      canvas.toBlob(blob => {
        const fname = generateFilename(this.file.name.replace(/\.[^.]+$/,'')+'_filtered', 'jpg');
        downloadBlob(blob, fname);
        showResult('filt-result',`<p style="font-weight:700;color:#166534;">✅ Filters applied!</p><p style="font-size:.875rem;color:#166534;margin-top:.25rem;">Downloaded: <strong>${fname}</strong></p>`);
        setBtn('filt-btn', false, '🎞️ Apply Filters');
      }, 'image/jpeg', 0.92);
    } catch(e) { showErr('filt-error','Failed: ' + e.message); setBtn('filt-btn', false, '🎞️ Apply Filters'); }
  }
}
