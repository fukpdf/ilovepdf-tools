import { generateFilename, downloadBlob, setBtn, showErr, clearErr, showResult, setupDropZone, trustBar, toolHeader } from '../utils/helpers.js';

export class BackgroundRemoverTool {
  constructor() { this.file = null; }

  render() {
    return `
    ${toolHeader('🎨','Remove Background','Remove the background from images using canvas-based color detection.')}
    ${trustBar()}
    <div style="background:#FEF3C7;border:1px solid #FCD34D;border-radius:10px;padding:.75rem 1rem;margin-bottom:1.5rem;font-size:.85rem;color:#92400E;">
      ⚠️ This uses simple color-threshold detection. Works best on images with solid, uniform backgrounds (white, green screen, etc.).
    </div>
    <div id="bg-zone" class="upload-zone" style="margin-bottom:1.5rem;">
      <div style="font-size:2.5rem;margin-bottom:.75rem;">🖼️</div>
      <p style="font-weight:600;color:#1A1530;margin-bottom:.25rem;">Drop an image here</p>
      <p style="font-size:.875rem;color:#6B7280;">JPG, PNG, WEBP supported</p>
      <input id="bg-input" type="file" accept="image/*" style="display:none;" />
    </div>
    <div id="bg-options" style="display:none;margin-bottom:1.5rem;">
      <p id="bg-info" style="font-weight:600;color:#1A1530;margin-bottom:1rem;"></p>
      <div style="display:grid;gap:1rem;max-width:400px;">
        <div>
          <label style="font-weight:600;font-size:.9rem;color:#1A1530;display:block;margin-bottom:.4rem;">Background Color to Remove</label>
          <input id="bg-color" type="color" value="#ffffff" style="width:60px;height:40px;border:1px solid #E5E7EB;border-radius:8px;cursor:pointer;" />
          <span style="font-size:.85rem;color:#6B7280;margin-left:.75rem;">Pick background color</span>
        </div>
        <div>
          <label style="font-weight:600;font-size:.9rem;color:#1A1530;display:block;margin-bottom:.5rem;">Tolerance: <span id="bg-tol-val">30</span></label>
          <input type="range" id="bg-tolerance" min="5" max="100" value="30" oninput="document.getElementById('bg-tol-val').textContent=this.value" />
        </div>
      </div>
      <canvas id="bg-canvas" style="display:none;"></canvas>
    </div>
    <button id="bg-btn" class="btn-primary" data-label="🎨 Remove Background" style="display:none;">🎨 Remove Background</button>
    <div id="bg-error" class="error-box"></div>
    <div id="bg-result" class="result-box"></div>`;
  }

  setupEvents() {
    setupDropZone('bg-zone','bg-input', files => this.loadFile(files[0]));
  }

  loadFile(f) {
    if (!f || !f.type.startsWith('image/')) { showErr('bg-error','Please select an image file.'); return; }
    if (f.size === 0) { showErr('bg-error','File is empty.'); return; }
    clearErr('bg-error');
    this.file = f;
    document.getElementById('bg-info').textContent = `🖼️ ${f.name} — ${(f.size/1024).toFixed(1)} KB`;
    document.getElementById('bg-options').style.display = 'block';
    const btn = document.getElementById('bg-btn');
    btn.style.display = 'inline-flex';
    btn.onclick = () => this.process();
  }

  process() {
    if (!this.file) return;
    const hex = document.getElementById('bg-color').value;
    const tolerance = parseInt(document.getElementById('bg-tolerance').value);
    setBtn('bg-btn', true); clearErr('bg-error');
    const img = new Image();
    const url = URL.createObjectURL(this.file);
    img.onload = () => {
      try {
        const canvas = document.getElementById('bg-canvas');
        canvas.width = img.width; canvas.height = img.height;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0);
        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const data = imageData.data;
        const tr = parseInt(hex.slice(1,3),16), tg = parseInt(hex.slice(3,5),16), tb = parseInt(hex.slice(5,7),16);
        let removed = 0;
        for (let i=0; i<data.length; i+=4) {
          const dr=Math.abs(data[i]-tr), dg=Math.abs(data[i+1]-tg), db=Math.abs(data[i+2]-tb);
          if ((dr+dg+db)/3 < tolerance) { data[i+3]=0; removed++; }
        }
        ctx.putImageData(imageData, 0, 0);
        canvas.toBlob(blob => {
          URL.revokeObjectURL(url);
          const fname = generateFilename(this.file.name.replace(/\.[^.]+$/,'')+'_nobg', 'png');
          downloadBlob(blob, fname);
          showResult('bg-result',`
            <p style="font-weight:700;color:#166534;">✅ Background removed!</p>
            <p style="font-size:.875rem;color:#166534;margin-top:.25rem;">${removed.toLocaleString()} pixels made transparent<br/>Downloaded: <strong>${fname}</strong></p>
            <img src="${canvas.toDataURL()}" style="max-width:300px;max-height:200px;margin-top:.75rem;border-radius:8px;border:1px solid #BBF7D0;background:repeating-conic-gradient(#eee 0% 25%,white 0% 50%) 0 0/16px 16px;" />`);
          setBtn('bg-btn', false, '🎨 Remove Background');
        }, 'image/png');
      } catch(e) { showErr('bg-error','Processing failed: ' + e.message); setBtn('bg-btn', false, '🎨 Remove Background'); }
    };
    img.onerror = () => { showErr('bg-error','Could not load image.'); setBtn('bg-btn', false, '🎨 Remove Background'); };
    img.src = url;
  }
}
