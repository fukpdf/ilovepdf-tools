import { loadScript, generateFilename, downloadBlob, setBtn, showErr, clearErr, showResult, setupDropZone, trustBar, toolHeader } from '../utils/helpers.js';
const PDFJS_URL = 'https://cdn.jsdelivr.net/npm/pdfjs-dist@3.11.174/build/pdf.min.js';

export class PdfToJpgTool {
  constructor() { this.file = null; }

  render() {
    return `
    ${toolHeader('🖼️','PDF to JPG','Convert each PDF page to a high-quality JPEG image.')}
    ${trustBar()}
    <div id="p2j-zone" class="upload-zone" style="margin-bottom:1.5rem;">
      <div style="font-size:2.5rem;margin-bottom:.75rem;">📄</div>
      <p style="font-weight:600;color:#1A1530;margin-bottom:.25rem;">Drop a PDF here</p>
      <p style="font-size:.875rem;color:#6B7280;">or click to browse</p>
      <input id="p2j-input" type="file" accept=".pdf,application/pdf" style="display:none;" />
    </div>
    <div id="p2j-options" style="display:none;margin-bottom:1.5rem;">
      <p id="p2j-info" style="font-weight:600;color:#1A1530;margin-bottom:1rem;"></p>
      <label style="font-weight:600;font-size:.9rem;color:#1A1530;display:block;margin-bottom:.5rem;">Quality: <span id="p2j-qval">90</span>%</label>
      <input type="range" id="p2j-quality" min="50" max="100" value="90" style="width:100%;max-width:300px;" oninput="document.getElementById('p2j-qval').textContent=this.value" />
      <div style="margin-top:.75rem;">
        <label style="font-weight:600;font-size:.9rem;color:#1A1530;display:block;margin-bottom:.5rem;">Scale</label>
        <select id="p2j-scale" style="max-width:200px;">
          <option value="1">1x (normal)</option>
          <option value="2" selected>2x (high-res)</option>
          <option value="3">3x (very high-res)</option>
        </select>
      </div>
    </div>
    <button id="p2j-btn" class="btn-primary" data-label="🖼️ Convert to JPG" style="display:none;">🖼️ Convert to JPG</button>
    <div id="p2j-error" class="error-box"></div>
    <div id="p2j-result" class="result-box"></div>`;
  }

  setupEvents() {
    setupDropZone('p2j-zone','p2j-input', files => this.loadFile(files[0]));
  }

  async loadFile(f) {
    if (!f || (!f.name.endsWith('.pdf') && f.type !== 'application/pdf')) { showErr('p2j-error','Please select a PDF file.'); return; }
    if (f.size === 0) { showErr('p2j-error','File is empty.'); return; }
    clearErr('p2j-error');
    this.file = f;
    try {
      await loadScript(PDFJS_URL);
      const pdfjsLib = window['pdfjs-dist/build/pdf'] || window.pdfjsLib;
      if (pdfjsLib && pdfjsLib.GlobalWorkerOptions) pdfjsLib.GlobalWorkerOptions.workerSrc = '';
      const buf = await f.arrayBuffer();
      const pdf = await pdfjsLib.getDocument({ data: new Uint8Array(buf), useWorkerFetch: false, isEvalSupported: false, useSystemFonts: true }).promise;
      this.pdf = pdf;
      document.getElementById('p2j-info').textContent = `📄 ${f.name} — ${pdf.numPages} page(s)`;
      document.getElementById('p2j-options').style.display = 'block';
      const btn = document.getElementById('p2j-btn');
      btn.style.display = 'inline-flex';
      btn.onclick = () => this.convert();
    } catch(e) { showErr('p2j-error','Could not read PDF: ' + e.message); }
  }

  async convert() {
    if (!this.pdf) return;
    const quality = parseInt(document.getElementById('p2j-quality').value)/100;
    const scale = parseFloat(document.getElementById('p2j-scale').value);
    setBtn('p2j-btn', true); clearErr('p2j-error');
    try {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      const imgs = [];
      for (let i=1; i<=this.pdf.numPages; i++) {
        document.getElementById('p2j-btn').innerHTML = `<span class="spinner"></span> Page ${i}/${this.pdf.numPages}...`;
        const page = await this.pdf.getPage(i);
        const vp = page.getViewport({ scale });
        canvas.width = vp.width; canvas.height = vp.height;
        ctx.fillStyle = 'white'; ctx.fillRect(0,0,canvas.width,canvas.height);
        await page.render({ canvasContext: ctx, viewport: vp }).promise;
        const blob = await new Promise(res => canvas.toBlob(res, 'image/jpeg', quality));
        const fname = generateFilename(`${this.file.name.replace(/\.pdf$/i,'')}_page${i}`, 'jpg');
        imgs.push({ blob, fname });
        downloadBlob(blob, fname);
        await new Promise(r => setTimeout(r, 200));
      }
      showResult('p2j-result',`<p style="font-weight:700;color:#166534;">✅ ${imgs.length} image(s) downloaded!</p><div style="display:flex;flex-wrap:wrap;gap:.5rem;margin-top:.75rem;">${imgs.map(img=>`<span style="background:white;border:1px solid #BBF7D0;border-radius:6px;padding:.35rem .6rem;font-size:.8rem;">${img.fname}</span>`).join('')}</div>`);
    } catch(e) { showErr('p2j-error','Conversion failed: ' + e.message); }
    finally { setBtn('p2j-btn', false, '🖼️ Convert to JPG'); }
  }
}
