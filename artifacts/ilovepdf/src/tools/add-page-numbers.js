import { loadScript, generateFilename, downloadBlob, setBtn, showErr, clearErr, showResult, setupDropZone, trustBar, toolHeader } from '../utils/helpers.js';
const PDFLIB = 'https://cdn.jsdelivr.net/npm/pdf-lib@1.17.1/dist/pdf-lib.min.js';

export class AddPageNumbersTool {
  constructor() { this.file = null; }

  render() {
    return `
    ${toolHeader('🔢','Add Page Numbers','Add page numbering to every page of your PDF.')}
    ${trustBar()}
    <div id="pn-zone" class="upload-zone" style="margin-bottom:1.5rem;">
      <div style="font-size:2.5rem;margin-bottom:.75rem;">📄</div>
      <p style="font-weight:600;color:#1A1530;margin-bottom:.25rem;">Drop a PDF here</p>
      <p style="font-size:.875rem;color:#6B7280;">or click to browse</p>
      <input id="pn-input" type="file" accept=".pdf,application/pdf" style="display:none;" />
    </div>
    <div id="pn-options" style="display:none;margin-bottom:1.5rem;">
      <p id="pn-info" style="font-weight:600;color:#1A1530;margin-bottom:1rem;"></p>
      <div style="display:grid;gap:1rem;max-width:400px;">
        <div>
          <label style="font-weight:600;font-size:.9rem;color:#1A1530;display:block;margin-bottom:.4rem;">Position</label>
          <select id="pn-position" style="width:100%">
            <option value="bottom-center">Bottom Center</option>
            <option value="bottom-right">Bottom Right</option>
            <option value="bottom-left">Bottom Left</option>
            <option value="top-center">Top Center</option>
          </select>
        </div>
        <div style="display:grid;grid-template-columns:1fr 1fr;gap:.75rem;">
          <div><label style="font-weight:600;font-size:.9rem;color:#1A1530;display:block;margin-bottom:.4rem;">Start Number</label><input id="pn-start" type="number" min="1" value="1" /></div>
          <div><label style="font-weight:600;font-size:.9rem;color:#1A1530;display:block;margin-bottom:.4rem;">Font Size</label><input id="pn-size" type="number" min="6" max="24" value="10" /></div>
        </div>
        <div>
          <label style="font-weight:600;font-size:.9rem;color:#1A1530;display:block;margin-bottom:.4rem;">Format</label>
          <select id="pn-format" style="width:100%">
            <option value="num">1, 2, 3…</option>
            <option value="page-of">Page 1 of N</option>
            <option value="dash">— 1 —</option>
          </select>
        </div>
      </div>
    </div>
    <button id="pn-btn" class="btn-primary" data-label="🔢 Add Page Numbers" style="display:none;">🔢 Add Page Numbers</button>
    <div id="pn-error" class="error-box"></div>
    <div id="pn-result" class="result-box"></div>`;
  }

  setupEvents() {
    setupDropZone('pn-zone','pn-input', files => this.loadFile(files[0]));
  }

  async loadFile(f) {
    if (!f || (!f.name.endsWith('.pdf') && f.type !== 'application/pdf')) { showErr('pn-error','Please select a PDF file.'); return; }
    if (f.size === 0) { showErr('pn-error','File is empty.'); return; }
    clearErr('pn-error');
    this.file = f;
    try {
      await loadScript(PDFLIB);
      const buf = await f.arrayBuffer();
      const doc = await window.PDFLib.PDFDocument.load(buf, { ignoreEncryption: true });
      this.pageCount = doc.getPageCount();
      document.getElementById('pn-info').textContent = `📄 ${f.name} — ${this.pageCount} page(s)`;
      document.getElementById('pn-options').style.display = 'block';
      const btn = document.getElementById('pn-btn');
      btn.style.display = 'inline-flex';
      btn.onclick = () => this.apply();
    } catch(e) { showErr('pn-error','Could not read PDF: ' + e.message); }
  }

  async apply() {
    if (!this.file) return;
    const pos = document.getElementById('pn-position').value;
    const start = parseInt(document.getElementById('pn-start').value)||1;
    const fontSize = parseInt(document.getElementById('pn-size').value)||10;
    const format = document.getElementById('pn-format').value;
    setBtn('pn-btn', true); clearErr('pn-error');
    try {
      await loadScript(PDFLIB);
      const { PDFDocument, StandardFonts, rgb } = window.PDFLib;
      const buf = await this.file.arrayBuffer();
      const doc = await PDFDocument.load(buf, { ignoreEncryption: true });
      const font = await doc.embedFont(StandardFonts.Helvetica);
      const pages = doc.getPages();
      pages.forEach((page, idx) => {
        const num = start + idx;
        const total = pages.length;
        let label;
        if (format === 'num') label = String(num);
        else if (format === 'page-of') label = `Page ${num} of ${total}`;
        else label = `— ${num} —`;
        const { width, height } = page.getSize();
        const textW = label.length * fontSize * 0.55;
        let x, y;
        if (pos === 'bottom-center') { x=(width-textW)/2; y=20; }
        else if (pos === 'bottom-right') { x=width-textW-20; y=20; }
        else if (pos === 'bottom-left') { x=20; y=20; }
        else { x=(width-textW)/2; y=height-30; }
        page.drawText(label, { x, y, size: fontSize, font, color: rgb(0.4,0.4,0.4) });
      });
      const bytes = await doc.save();
      const fname = generateFilename(this.file.name.replace(/\.pdf$/i,'')+'_numbered', 'pdf');
      downloadBlob(new Blob([bytes],{type:'application/pdf'}), fname);
      showResult('pn-result',`<p style="font-weight:700;color:#166534;">✅ Page numbers added to ${pages.length} pages!</p><p style="font-size:.875rem;color:#166534;margin-top:.25rem;">Downloaded: <strong>${fname}</strong></p>`);
    } catch(e) { showErr('pn-error','Failed: ' + e.message); }
    finally { setBtn('pn-btn', false, '🔢 Add Page Numbers'); }
  }
}
