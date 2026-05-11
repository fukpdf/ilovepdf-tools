import { loadScript, generateFilename, downloadBlob, setBtn, showErr, clearErr, showResult, setupDropZone, trustBar, toolHeader } from '../utils/helpers.js';
const PDFLIB = 'https://cdn.jsdelivr.net/npm/pdf-lib@1.17.1/dist/pdf-lib.min.js';

export class RedactPdfTool {
  constructor() { this.file = null; this.redactions = []; this.pageCount = 1; }

  render() {
    return `
    ${toolHeader('⬛','Redact PDF','Draw black rectangles over sensitive content in your PDF.')}
    ${trustBar()}
    <div id="redact-zone" class="upload-zone" style="margin-bottom:1.5rem;">
      <div style="font-size:2.5rem;margin-bottom:.75rem;">📄</div>
      <p style="font-weight:600;color:#1A1530;margin-bottom:.25rem;">Drop a PDF here</p>
      <p style="font-size:.875rem;color:#6B7280;">or click to browse</p>
      <input id="redact-input" type="file" accept=".pdf,application/pdf" style="display:none;" />
    </div>
    <div id="redact-options" style="display:none;margin-bottom:1.5rem;">
      <p id="redact-info" style="font-weight:600;color:#1A1530;margin-bottom:.75rem;"></p>
      <p style="color:#6B7280;font-size:.875rem;margin-bottom:1rem;">Specify areas to redact using PDF point coordinates (origin is bottom-left of page).</p>
      <div id="redact-list" style="display:flex;flex-direction:column;gap:.75rem;margin-bottom:1rem;"></div>
      <button id="add-redact" style="background:#F3F4F6;border:1px solid #E5E7EB;border-radius:8px;padding:.5rem 1rem;cursor:pointer;font-family:'Plus Jakarta Sans',sans-serif;font-weight:600;min-height:44px;">+ Add Redaction</button>
    </div>
    <button id="redact-btn" class="btn-primary" data-label="⬛ Apply Redactions" style="display:none;">⬛ Apply Redactions</button>
    <div id="redact-error" class="error-box"></div>
    <div id="redact-result" class="result-box"></div>`;
  }

  setupEvents() {
    setupDropZone('redact-zone','redact-input', files => this.loadFile(files[0]));
  }

  async loadFile(f) {
    if (!f || (!f.name.endsWith('.pdf') && f.type !== 'application/pdf')) { showErr('redact-error','Please select a PDF file.'); return; }
    if (f.size === 0) { showErr('redact-error','File is empty.'); return; }
    clearErr('redact-error');
    this.file = f;
    try {
      await loadScript(PDFLIB);
      const buf = await f.arrayBuffer();
      const doc = await window.PDFLib.PDFDocument.load(buf, { ignoreEncryption: true });
      this.pageCount = doc.getPageCount();
      document.getElementById('redact-info').textContent = `📄 ${f.name} — ${this.pageCount} page(s)`;
      document.getElementById('redact-options').style.display = 'block';
      document.getElementById('add-redact').onclick = () => this.addRedaction();
      this.addRedaction();
      const btn = document.getElementById('redact-btn');
      btn.style.display = 'inline-flex';
      btn.onclick = () => this.apply();
    } catch(e) { showErr('redact-error','Could not read PDF: ' + e.message); }
  }

  addRedaction() {
    const id = Date.now();
    this.redactions.push({ id, page:1, x:100, y:100, w:200, h:30 });
    this.renderList();
  }

  renderList() {
    const el = document.getElementById('redact-list');
    el.innerHTML = this.redactions.map(r => `
      <div style="background:#F9FAFB;border:1px solid #E5E7EB;border-radius:10px;padding:.75rem;margin-bottom:.25rem;">
        <div style="display:flex;align-items:center;gap:.5rem;margin-bottom:.5rem;">
          <span style="font-size:.8rem;color:#6B7280;font-weight:600;flex-shrink:0;">Page</span>
          <input type="number" value="${r.page}" min="1" max="${this.pageCount}" onchange="window._redactUpdate(${r.id},'page',this.value)" style="width:70px;font-size:.85rem;" />
          <button onclick="window._redactRemove(${r.id})" style="margin-left:auto;background:none;border:none;cursor:pointer;color:#EF4444;min-width:32px;min-height:32px;font-size:1rem;">✕</button>
        </div>
        <div style="display:grid;grid-template-columns:1fr 1fr;gap:.5rem;">
          <div><span style="font-size:.75rem;color:#9CA3AF;display:block;">X (pts)</span><input type="number" value="${r.x}" onchange="window._redactUpdate(${r.id},'x',this.value)" style="font-size:.85rem;" /></div>
          <div><span style="font-size:.75rem;color:#9CA3AF;display:block;">Y (pts)</span><input type="number" value="${r.y}" onchange="window._redactUpdate(${r.id},'y',this.value)" style="font-size:.85rem;" /></div>
          <div><span style="font-size:.75rem;color:#9CA3AF;display:block;">Width (pts)</span><input type="number" value="${r.w}" onchange="window._redactUpdate(${r.id},'w',this.value)" style="font-size:.85rem;" /></div>
          <div><span style="font-size:.75rem;color:#9CA3AF;display:block;">Height (pts)</span><input type="number" value="${r.h}" onchange="window._redactUpdate(${r.id},'h',this.value)" style="font-size:.85rem;" /></div>
        </div>
      </div>`).join('');
    window._redactUpdate = (id, key, val) => { const r = this.redactions.find(r=>r.id===id); if(r) r[key]=Number(val); };
    window._redactRemove = (id) => { this.redactions = this.redactions.filter(r=>r.id!==id); this.renderList(); };
  }

  async apply() {
    if (!this.file || !this.redactions.length) { showErr('redact-error','Add at least one redaction area.'); return; }
    setBtn('redact-btn', true); clearErr('redact-error');
    try {
      await loadScript(PDFLIB);
      const { PDFDocument, rgb } = window.PDFLib;
      const buf = await this.file.arrayBuffer();
      const doc = await PDFDocument.load(buf, { ignoreEncryption: true });
      const pages = doc.getPages();
      this.redactions.forEach(r => {
        const pg = pages[r.page-1];
        if (!pg) return;
        pg.drawRectangle({ x:r.x, y:r.y, width:r.w, height:r.h, color:rgb(0,0,0) });
      });
      const bytes = await doc.save();
      const fname = generateFilename(this.file.name.replace(/\.pdf$/i,'')+'_redacted', 'pdf');
      downloadBlob(new Blob([bytes],{type:'application/pdf'}), fname);
      showResult('redact-result',`<p style="font-weight:700;color:#166534;">✅ ${this.redactions.length} area(s) redacted!</p><p style="font-size:.875rem;color:#166534;margin-top:.25rem;">Downloaded: <strong>${fname}</strong></p>`);
    } catch(e) { showErr('redact-error','Redaction failed: ' + e.message); }
    finally { setBtn('redact-btn', false, '⬛ Apply Redactions'); }
  }
}
