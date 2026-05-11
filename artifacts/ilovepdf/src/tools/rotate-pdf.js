import { loadScript, generateFilename, downloadBlob, setBtn, showErr, clearErr, showResult, setupDropZone, trustBar, toolHeader } from '../utils/helpers.js';
const PDFLIB = 'https://cdn.jsdelivr.net/npm/pdf-lib@1.17.1/dist/pdf-lib.min.js';

export class RotatePdfTool {
  constructor() { this.file = null; }

  render() {
    return `
    ${toolHeader('🔄','Rotate PDF','Rotate all pages in your PDF by 90°, 180°, or 270°.')}
    ${trustBar()}
    <div id="rotate-zone" class="upload-zone" style="margin-bottom:1.5rem;">
      <div style="font-size:2.5rem;margin-bottom:.75rem;">📄</div>
      <p style="font-weight:600;color:#1A1530;margin-bottom:.25rem;">Drop a PDF here</p>
      <p style="font-size:.875rem;color:#6B7280;">or click to browse</p>
      <input id="rotate-input" type="file" accept=".pdf,application/pdf" style="display:none;" />
    </div>
    <div id="rotate-options" style="display:none;margin-bottom:1.5rem;">
      <p id="rotate-info" style="font-weight:600;color:#1A1530;margin-bottom:1rem;"></p>
      <label style="font-weight:600;color:#1A1530;font-size:.9rem;display:block;margin-bottom:.75rem;">Rotation Angle</label>
      <div style="display:flex;gap:.75rem;flex-wrap:wrap;">
        ${[['90° Clockwise','90','🔃'],['180°','180','🔁'],['90° Counter-CW','270','🔄']].map(([label,val,icon])=>`
          <label style="display:flex;align-items:center;gap:.5rem;cursor:pointer;background:#F9FAFB;border:2px solid #E5E7EB;border-radius:10px;padding:.75rem 1.25rem;transition:all .2s;">
            <input type="radio" name="rotate-angle" value="${val}" style="accent-color:#7B3FF2;" ${val==='90'?'checked':''}/>
            <span style="font-size:1.1rem;">${icon}</span>
            <span style="font-weight:600;font-size:.9rem;">${label}</span>
          </label>`).join('')}
      </div>
    </div>
    <button id="rotate-btn" class="btn-primary" data-label="🔄 Rotate PDF" style="display:none;">🔄 Rotate PDF</button>
    <div id="rotate-error" class="error-box"></div>
    <div id="rotate-result" class="result-box"></div>`;
  }

  setupEvents() {
    setupDropZone('rotate-zone','rotate-input', files => this.loadFile(files[0]));
  }

  loadFile(f) {
    if (!f || (!f.name.endsWith('.pdf') && f.type !== 'application/pdf')) { showErr('rotate-error','Please select a PDF file.'); return; }
    if (f.size === 0) { showErr('rotate-error','File is empty.'); return; }
    clearErr('rotate-error');
    this.file = f;
    document.getElementById('rotate-info').textContent = `📄 ${f.name} — ${(f.size/1024).toFixed(1)} KB`;
    document.getElementById('rotate-options').style.display = 'block';
    const btn = document.getElementById('rotate-btn');
    btn.style.display = 'inline-flex';
    btn.onclick = () => this.rotate();
  }

  async rotate() {
    if (!this.file) return;
    const angle = parseInt(document.querySelector('input[name="rotate-angle"]:checked').value);
    setBtn('rotate-btn', true); clearErr('rotate-error');
    try {
      await loadScript(PDFLIB);
      const { PDFDocument, degrees } = window.PDFLib;
      const buf = await this.file.arrayBuffer();
      const doc = await PDFDocument.load(buf, { ignoreEncryption: true });
      const pages = doc.getPages();
      pages.forEach(p => {
        const current = p.getRotation().angle;
        p.setRotation(degrees((current + angle) % 360));
      });
      const bytes = await doc.save();
      const fname = generateFilename(this.file.name.replace(/\.pdf$/i,'')+`_rotated${angle}`, 'pdf');
      downloadBlob(new Blob([bytes],{type:'application/pdf'}), fname);
      showResult('rotate-result',`<p style="font-weight:700;color:#166534;">✅ Rotated ${pages.length} page(s) by ${angle}°</p><p style="font-size:.875rem;color:#166534;margin-top:.25rem;">Downloaded: <strong>${fname}</strong></p>`);
    } catch(e) { showErr('rotate-error','Rotation failed: ' + e.message); }
    finally { setBtn('rotate-btn', false, '🔄 Rotate PDF'); }
  }
}
