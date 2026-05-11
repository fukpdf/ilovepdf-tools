import { loadScript, generateFilename, downloadBlob, setBtn, showErr, clearErr, showResult, setupDropZone, trustBar, toolHeader } from '../utils/helpers.js';
const PDFJS_URL = 'https://cdn.jsdelivr.net/npm/pdfjs-dist@3.11.174/build/pdf.min.js';

export class PdfToExcelTool {
  constructor() { this.file = null; }

  render() {
    return `
    ${toolHeader('📊','PDF to Excel','Extract text content from PDF and download as a CSV spreadsheet.')}
    ${trustBar()}
    <div id="p2e-zone" class="upload-zone" style="margin-bottom:1.5rem;">
      <div style="font-size:2.5rem;margin-bottom:.75rem;">📄</div>
      <p style="font-weight:600;color:#1A1530;margin-bottom:.25rem;">Drop a PDF here</p>
      <p style="font-size:.875rem;color:#6B7280;">or click to browse</p>
      <input id="p2e-input" type="file" accept=".pdf,application/pdf" style="display:none;" />
    </div>
    <button id="p2e-btn" class="btn-primary" data-label="📊 Extract to CSV" style="display:none;">📊 Extract to CSV</button>
    <div id="p2e-error" class="error-box"></div>
    <div id="p2e-result" class="result-box"></div>`;
  }

  setupEvents() {
    setupDropZone('p2e-zone','p2e-input', files => this.loadFile(files[0]));
  }

  loadFile(f) {
    if (!f || (!f.name.endsWith('.pdf') && f.type !== 'application/pdf')) { showErr('p2e-error','Please select a PDF file.'); return; }
    if (f.size === 0) { showErr('p2e-error','File is empty.'); return; }
    clearErr('p2e-error');
    this.file = f;
    const btn = document.getElementById('p2e-btn');
    btn.style.display = 'inline-flex';
    btn.onclick = () => this.extract();
  }

  async extract() {
    if (!this.file) return;
    setBtn('p2e-btn', true); clearErr('p2e-error');
    try {
      await loadScript(PDFJS_URL);
      const pdfjsLib = window['pdfjs-dist/build/pdf'] || window.pdfjsLib || window.pdfjs;
      if (pdfjsLib && pdfjsLib.GlobalWorkerOptions) pdfjsLib.GlobalWorkerOptions.workerSrc = '';
      const buf = await this.file.arrayBuffer();
      const pdf = await pdfjsLib.getDocument({ data: new Uint8Array(buf), useWorkerFetch: false, isEvalSupported: false, useSystemFonts: true }).promise;
      const rows = [['Page','Line','Content']];
      for (let i=1; i<=pdf.numPages; i++) {
        const page = await pdf.getPage(i);
        const content = await page.getTextContent();
        const lines = {};
        content.items.forEach(item => {
          const y = Math.round(item.transform[5]);
          if (!lines[y]) lines[y] = [];
          lines[y].push(item.str);
        });
        Object.keys(lines).sort((a,b)=>b-a).forEach((y,li) => {
          const text = lines[y].join(' ').trim();
          if (text) rows.push([i, li+1, `"${text.replace(/"/g,'""')}"`]);
        });
      }
      const csv = rows.map(r => r.join(',')).join('\n');
      const fname = generateFilename(this.file.name.replace(/\.pdf$/i,''), 'csv');
      downloadBlob(new Blob([csv],{type:'text/csv'}), fname);
      showResult('p2e-result',`
        <p style="font-weight:700;color:#166534;margin-bottom:.5rem;">✅ Extracted ${rows.length-1} rows!</p>
        <p style="font-size:.875rem;color:#166534;">Downloaded: <strong>${fname}</strong></p>
        <p style="font-size:.8rem;color:#15803D;margin-top:.5rem;">Open in Excel, Google Sheets, or any spreadsheet app.</p>`);
    } catch(e) { showErr('p2e-error','Extraction failed: ' + e.message); }
    finally { setBtn('p2e-btn', false, '📊 Extract to CSV'); }
  }
}
