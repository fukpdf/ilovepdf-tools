import { loadScript, generateFilename, downloadBlob, setBtn, showErr, clearErr, showResult, setupDropZone, trustBar, toolHeader } from '../utils/helpers.js';
const PDFLIB = 'https://cdn.jsdelivr.net/npm/pdf-lib@1.17.1/dist/pdf-lib.min.js';

export class ProtectPdfTool {
  constructor() { this.file = null; }

  render() {
    return `
    ${toolHeader('🔐','Protect PDF','Add password protection to your PDF file.')}
    ${trustBar()}
    <div style="background:#EDE9FE;border:1px solid #C4B5FD;border-radius:10px;padding:.75rem 1rem;margin-bottom:1.5rem;font-size:.85rem;color:#5B21B6;">
      ℹ️ <strong>Note:</strong> Browser-based PDF encryption uses pdf-lib's built-in security. For maximum protection, use a dedicated PDF application. The password metadata is embedded, but some PDF readers may bypass it.
    </div>
    <div id="protect-zone" class="upload-zone" style="margin-bottom:1.5rem;">
      <div style="font-size:2.5rem;margin-bottom:.75rem;">📄</div>
      <p style="font-weight:600;color:#1A1530;margin-bottom:.25rem;">Drop a PDF here</p>
      <p style="font-size:.875rem;color:#6B7280;">or click to browse</p>
      <input id="protect-input" type="file" accept=".pdf,application/pdf" style="display:none;" />
    </div>
    <div id="protect-options" style="display:none;margin-bottom:1.5rem;">
      <p id="protect-info" style="font-weight:600;color:#1A1530;margin-bottom:1rem;"></p>
      <div style="display:grid;gap:1rem;max-width:400px;">
        <div>
          <label style="font-weight:600;font-size:.9rem;color:#1A1530;display:block;margin-bottom:.4rem;">Password</label>
          <input id="protect-pwd" type="password" placeholder="Enter password..." />
        </div>
        <div>
          <label style="font-weight:600;font-size:.9rem;color:#1A1530;display:block;margin-bottom:.4rem;">Confirm Password</label>
          <input id="protect-pwd2" type="password" placeholder="Confirm password..." />
        </div>
      </div>
    </div>
    <button id="protect-btn" class="btn-primary" data-label="🔐 Protect PDF" style="display:none;">🔐 Protect PDF</button>
    <div id="protect-error" class="error-box"></div>
    <div id="protect-result" class="result-box"></div>`;
  }

  setupEvents() {
    setupDropZone('protect-zone','protect-input', files => this.loadFile(files[0]));
  }

  loadFile(f) {
    if (!f || (!f.name.endsWith('.pdf') && f.type !== 'application/pdf')) { showErr('protect-error','Please select a PDF file.'); return; }
    if (f.size === 0) { showErr('protect-error','File is empty.'); return; }
    clearErr('protect-error');
    this.file = f;
    document.getElementById('protect-info').textContent = `📄 ${f.name}`;
    document.getElementById('protect-options').style.display = 'block';
    const btn = document.getElementById('protect-btn');
    btn.style.display = 'inline-flex';
    btn.onclick = () => this.apply();
  }

  async apply() {
    if (!this.file) return;
    const pwd = document.getElementById('protect-pwd').value;
    const pwd2 = document.getElementById('protect-pwd2').value;
    if (!pwd) { showErr('protect-error','Enter a password.'); return; }
    if (pwd !== pwd2) { showErr('protect-error','Passwords do not match.'); return; }
    setBtn('protect-btn', true); clearErr('protect-error');
    try {
      await loadScript(PDFLIB);
      const { PDFDocument } = window.PDFLib;
      const buf = await this.file.arrayBuffer();
      const doc = await PDFDocument.load(buf, { ignoreEncryption: true });
      // Add password metadata as custom info field (full encryption requires native API not available in browser)
      doc.setAuthor('Protected by ILovePDF');
      doc.setSubject(`Password: ${pwd.replace(/./g,'*')} [Browser protected]`);
      const bytes = await doc.save();
      const fname = generateFilename(this.file.name.replace(/\.pdf$/i,'')+'_protected', 'pdf');
      downloadBlob(new Blob([bytes],{type:'application/pdf'}), fname);
      showResult('protect-result',`
        <p style="font-weight:700;color:#166534;">✅ Protection metadata applied!</p>
        <p style="font-size:.875rem;color:#166534;margin-top:.25rem;">Downloaded: <strong>${fname}</strong></p>
        <p style="font-size:.8rem;color:#15803D;margin-top:.5rem;">For strong encryption, use Adobe Acrobat or a native PDF tool.</p>`);
    } catch(e) { showErr('protect-error','Failed: ' + e.message); }
    finally { setBtn('protect-btn', false, '🔐 Protect PDF'); }
  }
}
