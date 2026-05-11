import { loadScript, generateFilename, downloadBlob, setBtn, showErr, clearErr, showResult, setupDropZone, trustBar, toolHeader } from '../utils/helpers.js';
const PDFLIB = 'https://cdn.jsdelivr.net/npm/pdf-lib@1.17.1/dist/pdf-lib.min.js';

export class EditPdfTool {
  constructor() { this.file = null; }

  render() {
    return `
    ${toolHeader('✏️','Edit PDF','Add text annotations to any page of your PDF.')}
    ${trustBar()}
    <div id="edit-zone" class="upload-zone" style="margin-bottom:1.5rem;">
      <div style="font-size:2.5rem;margin-bottom:.75rem;">📄</div>
      <p style="font-weight:600;color:#1A1530;margin-bottom:.25rem;">Drop a PDF here</p>
      <p style="font-size:.875rem;color:#6B7280;">or click to browse</p>
      <input id="edit-input" type="file" accept=".pdf,application/pdf" style="display:none;" />
    </div>
    <div id="edit-options" style="display:none;margin-bottom:1.5rem;">
      <p id="edit-info" style="font-weight:600;color:#1A1530;margin-bottom:1rem;"></p>
      <div style="display:grid;gap:1rem;max-width:480px;">
        <div>
          <label style="font-weight:600;font-size:.9rem;color:#1A1530;display:block;margin-bottom:.4rem;">Text to Add</label>
          <input id="edit-text" type="text" placeholder="Enter your annotation text..." value="Annotated by ILovePDF" />
        </div>
        <div style="display:grid;grid-template-columns:1fr 1fr;gap:.75rem;">
          <div><label style="font-weight:600;font-size:.9rem;color:#1A1530;display:block;margin-bottom:.4rem;">Page</label><input id="edit-page" type="number" min="1" value="1" /></div>
          <div><label style="font-weight:600;font-size:.9rem;color:#1A1530;display:block;margin-bottom:.4rem;">Font Size</label><input id="edit-size" type="number" min="8" max="72" value="16" /></div>
        </div>
        <div style="display:grid;grid-template-columns:1fr 1fr;gap:.75rem;">
          <div><label style="font-weight:600;font-size:.9rem;color:#1A1530;display:block;margin-bottom:.4rem;">X Position (pts)</label><input id="edit-x" type="number" min="0" value="50" /></div>
          <div><label style="font-weight:600;font-size:.9rem;color:#1A1530;display:block;margin-bottom:.4rem;">Y Position (pts)</label><input id="edit-y" type="number" min="0" value="50" /></div>
        </div>
        <div>
          <label style="font-weight:600;font-size:.9rem;color:#1A1530;display:block;margin-bottom:.4rem;">Color</label>
          <input id="edit-color" type="color" value="#7B3FF2" style="width:60px;height:40px;border:1px solid #E5E7EB;border-radius:8px;cursor:pointer;" />
        </div>
      </div>
    </div>
    <button id="edit-btn" class="btn-primary" data-label="✏️ Add Text & Save" style="display:none;">✏️ Add Text & Save</button>
    <div id="edit-error" class="error-box"></div>
    <div id="edit-result" class="result-box"></div>`;
  }

  setupEvents() {
    setupDropZone('edit-zone','edit-input', files => this.loadFile(files[0]));
  }

  async loadFile(f) {
    if (!f || (!f.name.endsWith('.pdf') && f.type !== 'application/pdf')) { showErr('edit-error','Please select a PDF file.'); return; }
    if (f.size === 0) { showErr('edit-error','File is empty.'); return; }
    clearErr('edit-error');
    this.file = f;
    try {
      await loadScript(PDFLIB);
      const buf = await f.arrayBuffer();
      const doc = await window.PDFLib.PDFDocument.load(buf, { ignoreEncryption: true });
      const count = doc.getPageCount();
      document.getElementById('edit-info').textContent = `📄 ${f.name} — ${count} page(s)`;
      document.getElementById('edit-page').max = count;
      document.getElementById('edit-options').style.display = 'block';
      const btn = document.getElementById('edit-btn');
      btn.style.display = 'inline-flex';
      btn.onclick = () => this.save();
    } catch(e) { showErr('edit-error','Could not read PDF: ' + e.message); }
  }

  hexToRgb(hex) {
    const r = parseInt(hex.slice(1,3),16)/255;
    const g = parseInt(hex.slice(3,5),16)/255;
    const b = parseInt(hex.slice(5,7),16)/255;
    return { r, g, b };
  }

  async save() {
    if (!this.file) return;
    const text = document.getElementById('edit-text').value;
    const pageNum = parseInt(document.getElementById('edit-page').value)-1;
    const fontSize = parseInt(document.getElementById('edit-size').value);
    const x = parseInt(document.getElementById('edit-x').value);
    const y = parseInt(document.getElementById('edit-y').value);
    const color = document.getElementById('edit-color').value;
    if (!text.trim()) { showErr('edit-error','Please enter some text.'); return; }
    setBtn('edit-btn', true); clearErr('edit-error');
    try {
      await loadScript(PDFLIB);
      const { PDFDocument, StandardFonts, rgb } = window.PDFLib;
      const buf = await this.file.arrayBuffer();
      const doc = await PDFDocument.load(buf, { ignoreEncryption: true });
      const pages = doc.getPages();
      if (pageNum >= pages.length) { showErr('edit-error','Page number out of range.'); return; }
      const font = await doc.embedFont(StandardFonts.Helvetica);
      const { r, g, b } = this.hexToRgb(color);
      pages[pageNum].drawText(text, { x, y, size: fontSize, font, color: rgb(r,g,b) });
      const bytes = await doc.save();
      const fname = generateFilename(this.file.name.replace(/\.pdf$/i,'')+'_edited', 'pdf');
      downloadBlob(new Blob([bytes],{type:'application/pdf'}), fname);
      showResult('edit-result',`<p style="font-weight:700;color:#166534;">✅ Text added to page ${pageNum+1}!</p><p style="font-size:.875rem;color:#166534;margin-top:.25rem;">Downloaded: <strong>${fname}</strong></p>`);
    } catch(e) { showErr('edit-error','Edit failed: ' + e.message); }
    finally { setBtn('edit-btn', false, '✏️ Add Text & Save'); }
  }
}
