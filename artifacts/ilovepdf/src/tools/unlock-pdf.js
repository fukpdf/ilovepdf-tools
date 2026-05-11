import { loadScript, generateFilename, downloadBlob, setBtn, showErr, clearErr, showResult, setupDropZone, trustBar, toolHeader } from '../utils/helpers.js';
const PDFLIB = 'https://cdn.jsdelivr.net/npm/pdf-lib@1.17.1/dist/pdf-lib.min.js';

export class UnlockPdfTool {
  constructor() { this.file = null; }

  render() {
    return `
    ${toolHeader('🔓','Unlock PDF','Remove password protection from a PDF you own.')}
    ${trustBar()}
    <div style="background:#FEF3C7;border:1px solid #FCD34D;border-radius:10px;padding:.75rem 1rem;margin-bottom:1.5rem;font-size:.85rem;color:#92400E;">
      ⚠️ Only unlock PDFs you own or have permission to access. This tool uses pdf-lib to re-save with ignoreEncryption.
    </div>
    <div id="unlock-zone" class="upload-zone" style="margin-bottom:1.5rem;">
      <div style="font-size:2.5rem;margin-bottom:.75rem;">📄</div>
      <p style="font-weight:600;color:#1A1530;margin-bottom:.25rem;">Drop a PDF here</p>
      <p style="font-size:.875rem;color:#6B7280;">or click to browse</p>
      <input id="unlock-input" type="file" accept=".pdf,application/pdf" style="display:none;" />
    </div>
    <div id="unlock-options" style="display:none;margin-bottom:1.5rem;">
      <p id="unlock-info" style="font-weight:600;color:#1A1530;margin-bottom:1rem;"></p>
      <div style="max-width:400px;">
        <label style="font-weight:600;font-size:.9rem;color:#1A1530;display:block;margin-bottom:.4rem;">Password (if known)</label>
        <input id="unlock-pwd" type="password" placeholder="Leave blank to attempt without password..." />
      </div>
    </div>
    <button id="unlock-btn" class="btn-primary" data-label="🔓 Unlock PDF" style="display:none;">🔓 Unlock PDF</button>
    <div id="unlock-error" class="error-box"></div>
    <div id="unlock-result" class="result-box"></div>`;
  }

  setupEvents() {
    setupDropZone('unlock-zone','unlock-input', files => this.loadFile(files[0]));
  }

  loadFile(f) {
    if (!f || (!f.name.endsWith('.pdf') && f.type !== 'application/pdf')) { showErr('unlock-error','Please select a PDF file.'); return; }
    if (f.size === 0) { showErr('unlock-error','File is empty.'); return; }
    clearErr('unlock-error');
    this.file = f;
    document.getElementById('unlock-info').textContent = `📄 ${f.name} — ${(f.size/1024).toFixed(1)} KB`;
    document.getElementById('unlock-options').style.display = 'block';
    const btn = document.getElementById('unlock-btn');
    btn.style.display = 'inline-flex';
    btn.onclick = () => this.apply();
  }

  async apply() {
    if (!this.file) return;
    setBtn('unlock-btn', true); clearErr('unlock-error');
    try {
      await loadScript(PDFLIB);
      const { PDFDocument } = window.PDFLib;
      const buf = await this.file.arrayBuffer();
      const doc = await PDFDocument.load(buf, { ignoreEncryption: true, updateMetadata: false });
      const bytes = await doc.save();
      const fname = generateFilename(this.file.name.replace(/\.pdf$/i,'')+'_unlocked', 'pdf');
      downloadBlob(new Blob([bytes],{type:'application/pdf'}), fname);
      showResult('unlock-result',`<p style="font-weight:700;color:#166534;">✅ PDF unlocked and saved!</p><p style="font-size:.875rem;color:#166534;margin-top:.25rem;">Downloaded: <strong>${fname}</strong></p>`);
    } catch(e) { showErr('unlock-error','Could not unlock PDF. The file may use unsupported encryption. Error: ' + e.message); }
    finally { setBtn('unlock-btn', false, '🔓 Unlock PDF'); }
  }
}
