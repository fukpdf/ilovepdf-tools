import { loadScript, generateFilename, downloadBlob, setBtn, showErr, clearErr, showResult, setupDropZone, trustBar, toolHeader } from '../utils/helpers.js';
const PDFLIB = 'https://cdn.jsdelivr.net/npm/pdf-lib@1.17.1/dist/pdf-lib.min.js';
const PDFJS = 'https://cdn.jsdelivr.net/npm/pdfjs-dist@4.0.379/build/pdf.min.mjs';

export class OrganizePdfTool {
  constructor() { this.file = null; this.pageOrder = []; this.pageCount = 0; }

  render() {
    return `
    ${toolHeader('📋','Organize PDF','Drag to reorder pages, or delete pages you don\'t need.')}
    ${trustBar()}
    <div id="org-zone" class="upload-zone" style="margin-bottom:1.5rem;">
      <div style="font-size:2.5rem;margin-bottom:.75rem;">📄</div>
      <p style="font-weight:600;color:#1A1530;margin-bottom:.25rem;">Drop a PDF here</p>
      <p style="font-size:.875rem;color:#6B7280;">or click to browse</p>
      <input id="org-input" type="file" accept=".pdf,application/pdf" style="display:none;" />
    </div>
    <div id="org-pages" style="display:none;margin-bottom:1.5rem;"></div>
    <button id="org-btn" class="btn-primary" data-label="📋 Save Organized PDF" style="display:none;">📋 Save Organized PDF</button>
    <div id="org-error" class="error-box"></div>
    <div id="org-result" class="result-box"></div>`;
  }

  setupEvents() {
    setupDropZone('org-zone','org-input', files => this.loadFile(files[0]));
  }

  async loadFile(f) {
    if (!f || (!f.name.endsWith('.pdf') && f.type !== 'application/pdf')) { showErr('org-error','Please select a PDF file.'); return; }
    if (f.size === 0) { showErr('org-error','File is empty.'); return; }
    clearErr('org-error');
    this.file = f;
    try {
      await loadScript(PDFLIB);
      const buf = await f.arrayBuffer();
      const doc = await window.PDFLib.PDFDocument.load(buf, { ignoreEncryption: true });
      this.pageCount = doc.getPageCount();
      this.pageOrder = Array.from({length: this.pageCount}, (_,i) => i);
      this.renderPages();
      const btn = document.getElementById('org-btn');
      btn.style.display = 'inline-flex';
      btn.onclick = () => this.save();
    } catch(e) { showErr('org-error','Could not read PDF: ' + e.message); }
  }

  renderPages() {
    const el = document.getElementById('org-pages');
    el.style.display = 'block';
    el.innerHTML = `
      <p style="font-weight:600;color:#1A1530;margin-bottom:.75rem;">${this.pageOrder.length} page(s) — drag to reorder, ✕ to remove:</p>
      <div id="org-list" style="display:grid;grid-template-columns:repeat(auto-fill,minmax(110px,1fr));gap:.75rem;">
        ${this.pageOrder.map((origIdx, pos) => `
          <div draggable="true" data-pos="${pos}" data-orig="${origIdx}" style="background:#F9FAFB;border:2px solid #E5E7EB;border-radius:10px;padding:.75rem;text-align:center;cursor:grab;position:relative;transition:all .15s;">
            <div style="font-size:1.75rem;margin-bottom:.4rem;">📄</div>
            <div style="font-size:.8rem;font-weight:600;color:#1A1530;">Page ${origIdx+1}</div>
            <button onclick="window._orgRemove(${pos})" style="position:absolute;top:4px;right:4px;background:#EF4444;color:white;border:none;border-radius:50%;width:20px;height:20px;cursor:pointer;font-size:.7rem;line-height:1;display:flex;align-items:center;justify-content:center;">✕</button>
          </div>`).join('')}
      </div>`;
    window._orgRemove = (pos) => { this.pageOrder.splice(pos,1); this.renderPages(); if(!this.pageOrder.length) document.getElementById('org-btn').style.display='none'; };
    this.setupDrag();
  }

  setupDrag() {
    const list = document.getElementById('org-list');
    if (!list) return;
    let dragged = null;
    list.querySelectorAll('[draggable]').forEach(item => {
      item.addEventListener('dragstart', () => { dragged = item; item.style.opacity='.4'; });
      item.addEventListener('dragend', () => { item.style.opacity='1'; dragged=null; });
      item.addEventListener('dragover', e => { e.preventDefault(); if(dragged && dragged!==item){ const from=parseInt(dragged.dataset.pos), to=parseInt(item.dataset.pos); const moved=this.pageOrder.splice(from,1)[0]; this.pageOrder.splice(to,0,moved); this.renderPages(); }});
    });
  }

  async save() {
    if (!this.file || !this.pageOrder.length) return;
    setBtn('org-btn', true); clearErr('org-error');
    try {
      await loadScript(PDFLIB);
      const { PDFDocument } = window.PDFLib;
      const srcBuf = await this.file.arrayBuffer();
      const srcDoc = await PDFDocument.load(srcBuf, { ignoreEncryption: true });
      const newDoc = await PDFDocument.create();
      const pages = await newDoc.copyPages(srcDoc, this.pageOrder);
      pages.forEach(p => newDoc.addPage(p));
      const bytes = await newDoc.save();
      const fname = generateFilename(this.file.name.replace(/\.pdf$/i,'')+'_organized', 'pdf');
      downloadBlob(new Blob([bytes],{type:'application/pdf'}), fname);
      showResult('org-result',`<p style="font-weight:700;color:#166534;">✅ PDF organized!</p><p style="font-size:.875rem;color:#166534;margin-top:.25rem;">${this.pageOrder.length} pages saved<br/>Downloaded: <strong>${fname}</strong></p>`);
    } catch(e) { showErr('org-error','Save failed: ' + e.message); }
    finally { setBtn('org-btn', false, '📋 Save Organized PDF'); }
  }
}
