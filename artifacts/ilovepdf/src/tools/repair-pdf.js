import { loadScript, generateFilename, downloadBlob, setBtn, showErr, clearErr, showResult, setupDropZone, trustBar, toolHeader } from '../utils/helpers.js';
const PDFLIB = 'https://cdn.jsdelivr.net/npm/pdf-lib@1.17.1/dist/pdf-lib.min.js';

export class RepairPdfTool {
  constructor() { this.file = null; }

  render() {
    return `
    ${toolHeader('🔧','Repair PDF','Attempt to fix corrupted or damaged PDF files by rebuilding the structure.')}
    ${trustBar()}
    <div id="repair-zone" class="upload-zone" style="margin-bottom:1.5rem;">
      <div style="font-size:2.5rem;margin-bottom:.75rem;">📄</div>
      <p style="font-weight:600;color:#1A1530;margin-bottom:.25rem;">Drop a PDF here</p>
      <p style="font-size:.875rem;color:#6B7280;">or click to browse</p>
      <input id="repair-input" type="file" accept=".pdf,application/pdf" style="display:none;" />
    </div>
    <div style="background:#EDE9FE;border:1px solid #C4B5FD;border-radius:10px;padding:.75rem 1rem;margin-bottom:1.5rem;font-size:.85rem;color:#5B21B6;">
      ℹ️ This tool uses pdf-lib to re-parse and rebuild the PDF structure. It can fix minor corruption, but severely damaged files may not be recoverable.
    </div>
    <button id="repair-btn" class="btn-primary" data-label="🔧 Repair PDF" style="display:none;">🔧 Repair PDF</button>
    <div id="repair-error" class="error-box"></div>
    <div id="repair-result" class="result-box"></div>`;
  }

  setupEvents() {
    setupDropZone('repair-zone','repair-input', files => this.loadFile(files[0]));
  }

  loadFile(f) {
    if (!f || (!f.name.endsWith('.pdf') && f.type !== 'application/pdf')) { showErr('repair-error','Please select a PDF file.'); return; }
    if (f.size === 0) { showErr('repair-error','File is empty.'); return; }
    clearErr('repair-error');
    this.file = f;
    const btn = document.getElementById('repair-btn');
    btn.style.display = 'inline-flex';
    btn.onclick = () => this.repair();
  }

  async repair() {
    if (!this.file) return;
    setBtn('repair-btn', true); clearErr('repair-error');
    try {
      await loadScript(PDFLIB);
      const { PDFDocument } = window.PDFLib;
      const buf = await this.file.arrayBuffer();
      const doc = await PDFDocument.load(buf, { ignoreEncryption: true, throwOnInvalidObject: false, updateMetadata: false });
      doc.setProducer('ILovePDF Repair Tool');
      doc.setCreator('ILovePDF');
      const bytes = await doc.save({ useObjectStreams: false });
      const before = (this.file.size/1024).toFixed(1);
      const after = (bytes.length/1024).toFixed(1);
      const fname = generateFilename(this.file.name.replace(/\.pdf$/i,'')+'_repaired', 'pdf');
      downloadBlob(new Blob([bytes],{type:'application/pdf'}), fname);
      showResult('repair-result',`
        <p style="font-weight:700;color:#166534;">✅ PDF repaired and rebuilt!</p>
        <div style="margin-top:.75rem;font-size:.875rem;color:#166534;">
          <p>Original: ${before} KB → Repaired: ${after} KB</p>
          <p style="margin-top:.25rem;">Downloaded: <strong>${fname}</strong></p>
        </div>`);
    } catch(e) { showErr('repair-error','Could not repair this PDF: ' + e.message + '. The file may be too severely corrupted.'); }
    finally { setBtn('repair-btn', false, '🔧 Repair PDF'); }
  }
}
