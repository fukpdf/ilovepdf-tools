import { loadScript, generateFilename, downloadBlob, setBtn, showErr, clearErr, showResult, setupDropZone, trustBar, toolHeader } from '../utils/helpers.js';
const PDFLIB = 'https://cdn.jsdelivr.net/npm/pdf-lib@1.17.1/dist/pdf-lib.min.js';

export class WatermarkPdfTool {
  constructor() { this.file = null; }

  render() {
    return `
    ${toolHeader('💧','Watermark PDF','Add a text watermark to every page of your PDF.')}
    ${trustBar()}
    <div id="wm-zone" class="upload-zone" style="margin-bottom:1.5rem;">
      <div style="font-size:2.5rem;margin-bottom:.75rem;">📄</div>
      <p style="font-weight:600;color:#1A1530;margin-bottom:.25rem;">Drop a PDF here</p>
      <p style="font-size:.875rem;color:#6B7280;">or click to browse</p>
      <input id="wm-input" type="file" accept=".pdf,application/pdf" style="display:none;" />
    </div>
    <div id="wm-options" style="display:none;margin-bottom:1.5rem;">
      <p id="wm-info" style="font-weight:600;color:#1A1530;margin-bottom:1rem;"></p>
      <div style="display:grid;gap:1rem;max-width:480px;">
        <div>
          <label style="font-weight:600;font-size:.9rem;color:#1A1530;display:block;margin-bottom:.4rem;">Watermark Text</label>
          <input id="wm-text" type="text" placeholder="e.g. CONFIDENTIAL" value="WATERMARK" />
        </div>
        <div style="display:grid;grid-template-columns:1fr 1fr;gap:.75rem;">
          <div><label style="font-weight:600;font-size:.9rem;color:#1A1530;display:block;margin-bottom:.4rem;">Font Size</label><input id="wm-size" type="number" min="12" max="200" value="60" /></div>
          <div><label style="font-weight:600;font-size:.9rem;color:#1A1530;display:block;margin-bottom:.4rem;">Opacity (0-100)</label><input id="wm-opacity" type="number" min="1" max="100" value="30" /></div>
        </div>
        <div>
          <label style="font-weight:600;font-size:.9rem;color:#1A1530;display:block;margin-bottom:.4rem;">Color</label>
          <input id="wm-color" type="color" value="#FF0000" style="width:60px;height:40px;border:1px solid #E5E7EB;border-radius:8px;cursor:pointer;" />
        </div>
      </div>
    </div>
    <button id="wm-btn" class="btn-primary" data-label="💧 Add Watermark" style="display:none;">💧 Add Watermark</button>
    <div id="wm-error" class="error-box"></div>
    <div id="wm-result" class="result-box"></div>`;
  }

  setupEvents() {
    setupDropZone('wm-zone','wm-input', files => this.loadFile(files[0]));
  }

  async loadFile(f) {
    if (!f || (!f.name.endsWith('.pdf') && f.type !== 'application/pdf')) { showErr('wm-error','Please select a PDF file.'); return; }
    if (f.size === 0) { showErr('wm-error','File is empty.'); return; }
    clearErr('wm-error');
    this.file = f;
    try {
      await loadScript(PDFLIB);
      const buf = await f.arrayBuffer();
      const doc = await window.PDFLib.PDFDocument.load(buf, { ignoreEncryption: true });
      document.getElementById('wm-info').textContent = `📄 ${f.name} — ${doc.getPageCount()} page(s)`;
      document.getElementById('wm-options').style.display = 'block';
      const btn = document.getElementById('wm-btn');
      btn.style.display = 'inline-flex';
      btn.onclick = () => this.apply();
    } catch(e) { showErr('wm-error','Could not read PDF: ' + e.message); }
  }

  async apply() {
    if (!this.file) return;
    const text = document.getElementById('wm-text').value.trim();
    if (!text) { showErr('wm-error','Enter watermark text.'); return; }
    const fontSize = parseInt(document.getElementById('wm-size').value);
    const opacity = parseInt(document.getElementById('wm-opacity').value)/100;
    const hex = document.getElementById('wm-color').value;
    const r = parseInt(hex.slice(1,3),16)/255, g = parseInt(hex.slice(3,5),16)/255, b = parseInt(hex.slice(5,7),16)/255;
    setBtn('wm-btn', true); clearErr('wm-error');
    try {
      await loadScript(PDFLIB);
      const { PDFDocument, StandardFonts, rgb, degrees } = window.PDFLib;
      const buf = await this.file.arrayBuffer();
      const doc = await PDFDocument.load(buf, { ignoreEncryption: true });
      const font = await doc.embedFont(StandardFonts.HelveticaBold);
      doc.getPages().forEach(page => {
        const { width, height } = page.getSize();
        page.drawText(text, {
          x: width/2 - (text.length * fontSize * 0.3),
          y: height/2,
          size: fontSize, font,
          color: rgb(r,g,b),
          opacity,
          rotate: degrees(45)
        });
      });
      const bytes = await doc.save();
      const fname = generateFilename(this.file.name.replace(/\.pdf$/i,'')+'_watermarked', 'pdf');
      downloadBlob(new Blob([bytes],{type:'application/pdf'}), fname);
      showResult('wm-result',`<p style="font-weight:700;color:#166534;">✅ Watermark added to all pages!</p><p style="font-size:.875rem;color:#166534;margin-top:.25rem;">Downloaded: <strong>${fname}</strong></p>`);
    } catch(e) { showErr('wm-error','Failed: ' + e.message); }
    finally { setBtn('wm-btn', false, '💧 Add Watermark'); }
  }
}
