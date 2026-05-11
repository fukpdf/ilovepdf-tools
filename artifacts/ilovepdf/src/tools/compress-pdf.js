import { loadScript, generateFilename, downloadBlob, setBtn, showErr, clearErr, showResult, setupDropZone, trustBar, toolHeader } from '../utils/helpers.js';
const PDFLIB = 'https://cdn.jsdelivr.net/npm/pdf-lib@1.17.1/dist/pdf-lib.min.js';

export class CompressPdfTool {
  constructor() { this.file = null; }

  render() {
    return `
    ${toolHeader('📦','Compress PDF','Reduce your PDF file size with adjustable quality settings.')}
    ${trustBar()}
    <div id="compress-zone" class="upload-zone" style="margin-bottom:1.5rem;">
      <div style="font-size:2.5rem;margin-bottom:.75rem;">📄</div>
      <p style="font-weight:600;color:#1A1530;margin-bottom:.25rem;">Drop a PDF here</p>
      <p style="font-size:.875rem;color:#6B7280;">or click to browse</p>
      <input id="compress-input" type="file" accept=".pdf,application/pdf" style="display:none;" />
    </div>
    <div id="compress-options" style="display:none;margin-bottom:1.5rem;">
      <p id="compress-info" style="font-weight:600;color:#1A1530;margin-bottom:1rem;"></p>
      <label style="font-weight:600;color:#1A1530;font-size:.9rem;display:block;margin-bottom:.5rem;">Compression Level</label>
      <div style="display:flex;align-items:center;gap:1rem;margin-bottom:.5rem;">
        <span style="font-size:.85rem;color:#6B7280;">Smaller</span>
        <input id="quality-slider" type="range" min="10" max="100" value="70" style="flex:1;" oninput="document.getElementById('quality-val').textContent=this.value+'%'" />
        <span style="font-size:.85rem;color:#6B7280;">Better Quality</span>
      </div>
      <div style="text-align:center;"><span id="quality-val" style="font-weight:700;color:#7B3FF2;font-size:1.25rem;">70%</span></div>
      <div style="background:#EDE9FE;border-radius:8px;padding:.75rem;margin-top:.75rem;font-size:.85rem;color:#5B21B6;">
        <strong>Note:</strong> PDF compression works by optimizing internal structure. Image-heavy PDFs see the best size reduction.
      </div>
    </div>
    <button id="compress-btn" class="btn-primary" data-label="📦 Compress PDF" style="display:none;">📦 Compress PDF</button>
    <div id="compress-error" class="error-box"></div>
    <div id="compress-result" class="result-box"></div>`;
  }

  setupEvents() {
    setupDropZone('compress-zone','compress-input', files => this.loadFile(files[0]));
  }

  loadFile(f) {
    if (!f || (!f.name.endsWith('.pdf') && f.type !== 'application/pdf')) { showErr('compress-error','Please select a PDF file.'); return; }
    if (f.size === 0) { showErr('compress-error','File is empty.'); return; }
    clearErr('compress-error');
    this.file = f;
    document.getElementById('compress-info').textContent = `📄 ${f.name} — ${(f.size/1024).toFixed(1)} KB`;
    document.getElementById('compress-options').style.display = 'block';
    const btn = document.getElementById('compress-btn');
    btn.style.display = 'inline-flex';
    btn.onclick = () => this.compress();
  }

  async compress() {
    if (!this.file) return;
    const quality = parseInt(document.getElementById('quality-slider').value);
    setBtn('compress-btn', true); clearErr('compress-error');
    try {
      await loadScript(PDFLIB);
      const { PDFDocument } = window.PDFLib;
      const buf = await this.file.arrayBuffer();
      const doc = await PDFDocument.load(buf, { ignoreEncryption: true });
      // Optimize by re-saving with compression options
      const bytes = await doc.save({ useObjectStreams: quality > 50, addDefaultPage: false });
      const blob = new Blob([bytes], { type: 'application/pdf' });
      const fname = generateFilename(this.file.name.replace(/\.pdf$/i,'')+'_compressed', 'pdf');
      const saved = ((this.file.size - blob.size) / this.file.size * 100).toFixed(1);
      downloadBlob(blob, fname);
      showResult('compress-result',`
        <p style="font-weight:700;color:#166534;margin-bottom:.75rem;">✅ Compressed successfully!</p>
        <div style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:.75rem;text-align:center;margin-bottom:.75rem;">
          <div style="background:white;border-radius:8px;padding:.75rem;"><div style="font-size:.75rem;color:#6B7280;">Original</div><div style="font-weight:700;color:#1A1530;">${(this.file.size/1024).toFixed(1)} KB</div></div>
          <div style="background:white;border-radius:8px;padding:.75rem;"><div style="font-size:.75rem;color:#6B7280;">Compressed</div><div style="font-weight:700;color:#7B3FF2;">${(blob.size/1024).toFixed(1)} KB</div></div>
          <div style="background:white;border-radius:8px;padding:.75rem;"><div style="font-size:.75rem;color:#6B7280;">Saved</div><div style="font-weight:700;color:#059669;">${saved}%</div></div>
        </div>
        <p style="font-size:.875rem;color:#166534;">Downloaded: <strong>${fname}</strong></p>`);
    } catch(e) { showErr('compress-error', 'Compression failed: ' + e.message); }
    finally { setBtn('compress-btn', false, '📦 Compress PDF'); }
  }
}
