import { loadScript, generateFilename, downloadBlob, setBtn, showErr, clearErr, showResult, setupDropZone, trustBar, toolHeader } from '../utils/helpers.js';
const PDFLIB = 'https://cdn.jsdelivr.net/npm/pdf-lib@1.17.1/dist/pdf-lib.min.js';

export class SplitPdfTool {
  constructor() { this.file = null; this.pageCount = 0; }

  render() {
    return `
    ${toolHeader('✂️','Split PDF','Extract specific pages or page ranges from a PDF file.')}
    ${trustBar()}
    <div id="split-zone" class="upload-zone" style="margin-bottom:1.5rem;">
      <div style="font-size:2.5rem;margin-bottom:.75rem;">📄</div>
      <p style="font-weight:600;color:#1A1530;margin-bottom:.25rem;">Drop a PDF here</p>
      <p style="font-size:.875rem;color:#6B7280;">or click to browse</p>
      <input id="split-input" type="file" accept=".pdf,application/pdf" style="display:none;" />
    </div>
    <div id="split-options" style="display:none;margin-bottom:1.5rem;">
      <p id="split-info" style="font-weight:600;color:#1A1530;margin-bottom:1rem;"></p>
      <label style="font-weight:600;color:#1A1530;font-size:.9rem;display:block;margin-bottom:.5rem;">Page Range (e.g. 1-3, 5, 7-9)</label>
      <input id="split-range" type="text" placeholder="e.g. 1-3, 5, 8-10" style="max-width:320px;" />
      <p style="font-size:.8rem;color:#6B7280;margin-top:.4rem;">Leave blank to split each page into a separate file.</p>
    </div>
    <button id="split-btn" class="btn-primary" data-label="✂️ Split PDF" style="display:none;">✂️ Split PDF</button>
    <div id="split-error" class="error-box"></div>
    <div id="split-result" class="result-box"></div>`;
  }

  setupEvents() {
    setupDropZone('split-zone','split-input', files => this.loadFile(files[0]));
  }

  async loadFile(f) {
    if (!f || (!f.name.endsWith('.pdf') && f.type !== 'application/pdf')) { showErr('split-error','Please select a PDF file.'); return; }
    if (f.size === 0) { showErr('split-error','File is empty.'); return; }
    clearErr('split-error');
    this.file = f;
    try {
      await loadScript(PDFLIB);
      const buf = await f.arrayBuffer();
      const doc = await window.PDFLib.PDFDocument.load(buf, { ignoreEncryption: true });
      this.pageCount = doc.getPageCount();
      document.getElementById('split-info').textContent = `📄 ${f.name} — ${this.pageCount} page(s)`;
      document.getElementById('split-options').style.display = 'block';
      const btn = document.getElementById('split-btn');
      btn.style.display = 'inline-flex';
      btn.onclick = () => this.split();
    } catch(e) { showErr('split-error', 'Could not read PDF: ' + e.message); }
  }

  parseRange(rangeStr) {
    const pages = new Set();
    const parts = rangeStr.split(',');
    for (const part of parts) {
      const trimmed = part.trim();
      if (!trimmed) continue;
      if (trimmed.includes('-')) {
        const [a,b] = trimmed.split('-').map(Number);
        for (let i=a; i<=b; i++) pages.add(i);
      } else pages.add(Number(trimmed));
    }
    return [...pages].filter(n => n>=1 && n<=this.pageCount).sort((a,b)=>a-b);
  }

  async split() {
    if (!this.file) return;
    const rangeStr = document.getElementById('split-range').value.trim();
    setBtn('split-btn', true); clearErr('split-error');
    try {
      await loadScript(PDFLIB);
      const { PDFDocument } = window.PDFLib;
      const srcBuf = await this.file.arrayBuffer();
      const srcDoc = await PDFDocument.load(srcBuf, { ignoreEncryption: true });

      if (!rangeStr) {
        // Split every page
        const blobs = [];
        for (let i=0; i<this.pageCount; i++) {
          const newDoc = await PDFDocument.create();
          const [page] = await newDoc.copyPages(srcDoc, [i]);
          newDoc.addPage(page);
          const bytes = await newDoc.save();
          blobs.push({ blob: new Blob([bytes],{type:'application/pdf'}), name: generateFilename(`${this.file.name.replace(/\.pdf$/i,'')}_page${i+1}`, 'pdf') });
        }
        blobs.forEach(({blob,name}) => downloadBlob(blob, name));
        showResult('split-result',`<p style="font-weight:700;color:#166534;">✅ Split into ${blobs.length} files — all downloaded!</p>`);
      } else {
        const pages = this.parseRange(rangeStr);
        if (!pages.length) { showErr('split-error','No valid pages in range.'); return; }
        const newDoc = await PDFDocument.create();
        const copied = await newDoc.copyPages(srcDoc, pages.map(p=>p-1));
        copied.forEach(p => newDoc.addPage(p));
        const bytes = await newDoc.save();
        const fname = generateFilename(`${this.file.name.replace(/\.pdf$/i,'')}_pages${pages[0]}-${pages[pages.length-1]}`, 'pdf');
        downloadBlob(new Blob([bytes],{type:'application/pdf'}), fname);
        showResult('split-result',`<p style="font-weight:700;color:#166534;">✅ Extracted pages: ${pages.join(', ')}</p><p style="font-size:.875rem;color:#166534;margin-top:.25rem;">Downloaded: <strong>${fname}</strong></p>`);
      }
    } catch(e) { showErr('split-error', 'Split failed: ' + e.message); }
    finally { setBtn('split-btn', false, '✂️ Split PDF'); }
  }
}
