import { loadScript, generateFilename, downloadBlob, setBtn, showErr, clearErr, showResult, setupDropZone, trustBar, toolHeader } from '../utils/helpers.js';
const PDFLIB = 'https://cdn.jsdelivr.net/npm/pdf-lib@1.17.1/dist/pdf-lib.min.js';

export class CropPdfTool {
  constructor() { this.file = null; }

  render() {
    return `
    ${toolHeader('🪟','Crop PDF','Trim page margins by specifying crop values in points (1 point = 1/72 inch).')}
    ${trustBar()}
    <div id="crop-zone" class="upload-zone" style="margin-bottom:1.5rem;">
      <div style="font-size:2.5rem;margin-bottom:.75rem;">📄</div>
      <p style="font-weight:600;color:#1A1530;margin-bottom:.25rem;">Drop a PDF here</p>
      <p style="font-size:.875rem;color:#6B7280;">or click to browse</p>
      <input id="crop-input" type="file" accept=".pdf,application/pdf" style="display:none;" />
    </div>
    <div id="crop-options" style="display:none;margin-bottom:1.5rem;">
      <p id="crop-info" style="font-weight:600;color:#1A1530;margin-bottom:1rem;"></p>
      <label style="font-weight:600;color:#1A1530;font-size:.9rem;display:block;margin-bottom:.75rem;">Crop Margins (in points)</label>
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:1rem;max-width:400px;">
        <div><label style="font-size:.85rem;color:#6B7280;display:block;margin-bottom:.25rem;">Top</label><input id="crop-top" type="number" min="0" max="500" value="0" /></div>
        <div><label style="font-size:.85rem;color:#6B7280;display:block;margin-bottom:.25rem;">Right</label><input id="crop-right" type="number" min="0" max="500" value="0" /></div>
        <div><label style="font-size:.85rem;color:#6B7280;display:block;margin-bottom:.25rem;">Bottom</label><input id="crop-bottom" type="number" min="0" max="500" value="0" /></div>
        <div><label style="font-size:.85rem;color:#6B7280;display:block;margin-bottom:.25rem;">Left</label><input id="crop-left" type="number" min="0" max="500" value="0" /></div>
      </div>
      <p style="font-size:.8rem;color:#6B7280;margin-top:.5rem;">72 points = 1 inch. A4 page is ~595 × 842 pts.</p>
    </div>
    <button id="crop-btn" class="btn-primary" data-label="🪟 Crop PDF" style="display:none;">🪟 Crop PDF</button>
    <div id="crop-error" class="error-box"></div>
    <div id="crop-result" class="result-box"></div>`;
  }

  setupEvents() {
    setupDropZone('crop-zone','crop-input', files => this.loadFile(files[0]));
  }

  loadFile(f) {
    if (!f || (!f.name.endsWith('.pdf') && f.type !== 'application/pdf')) { showErr('crop-error','Please select a PDF file.'); return; }
    if (f.size === 0) { showErr('crop-error','File is empty.'); return; }
    clearErr('crop-error');
    this.file = f;
    document.getElementById('crop-info').textContent = `📄 ${f.name}`;
    document.getElementById('crop-options').style.display = 'block';
    const btn = document.getElementById('crop-btn');
    btn.style.display = 'inline-flex';
    btn.onclick = () => this.crop();
  }

  async crop() {
    if (!this.file) return;
    const top = parseInt(document.getElementById('crop-top').value)||0;
    const right = parseInt(document.getElementById('crop-right').value)||0;
    const bottom = parseInt(document.getElementById('crop-bottom').value)||0;
    const left = parseInt(document.getElementById('crop-left').value)||0;
    setBtn('crop-btn', true); clearErr('crop-error');
    try {
      await loadScript(PDFLIB);
      const { PDFDocument } = window.PDFLib;
      const buf = await this.file.arrayBuffer();
      const doc = await PDFDocument.load(buf, { ignoreEncryption: true });
      doc.getPages().forEach(p => {
        const { width, height } = p.getSize();
        p.setCropBox(left, bottom, width - left - right, height - top - bottom);
      });
      const bytes = await doc.save();
      const fname = generateFilename(this.file.name.replace(/\.pdf$/i,'')+'_cropped', 'pdf');
      downloadBlob(new Blob([bytes],{type:'application/pdf'}), fname);
      showResult('crop-result',`<p style="font-weight:700;color:#166534;">✅ Cropped successfully!</p><p style="font-size:.875rem;color:#166534;margin-top:.25rem;">Margins: T:${top} R:${right} B:${bottom} L:${left} pts<br/>Downloaded: <strong>${fname}</strong></p>`);
    } catch(e) { showErr('crop-error','Crop failed: ' + e.message); }
    finally { setBtn('crop-btn', false, '🪟 Crop PDF'); }
  }
}
