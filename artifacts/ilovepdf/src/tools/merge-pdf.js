import { loadScript, generateFilename, downloadBlob, setBtn, showErr, clearErr, showResult, setupDropZone, trustBar, toolHeader } from '../utils/helpers.js';
const PDFLIB = 'https://cdn.jsdelivr.net/npm/pdf-lib@1.17.1/dist/pdf-lib.min.js';

export class MergePdfTool {
  constructor() { this.files = []; }

  render() {
    return `
    ${toolHeader('🔗','Merge PDF','Combine multiple PDF files into a single document. Drag to reorder.')}
    ${trustBar()}
    <div id="merge-zone" class="upload-zone" style="margin-bottom:1rem;">
      <div style="font-size:2.5rem;margin-bottom:.75rem;">📂</div>
      <p style="font-weight:600;color:#1A1530;margin-bottom:.25rem;">Drop PDF files here</p>
      <p style="font-size:.875rem;color:#6B7280;">or click to browse — select multiple files</p>
      <input id="merge-input" type="file" accept=".pdf,application/pdf" multiple style="display:none;" />
    </div>
    <div id="file-list" style="margin-bottom:1.5rem;display:none;"></div>
    <button id="merge-btn" class="btn-primary" data-label="🔗 Merge PDFs" style="display:none;">🔗 Merge PDFs</button>
    <div id="merge-error" class="error-box"></div>
    <div id="merge-result" class="result-box"></div>`;
  }

  setupEvents() {
    setupDropZone('merge-zone','merge-input', files => this.addFiles(files));
  }

  addFiles(files) {
    for (const f of files) {
      if (f.type !== 'application/pdf' && !f.name.endsWith('.pdf')) { showErr('merge-error','Only PDF files allowed.'); return; }
      if (f.size === 0) { showErr('merge-error',`"${f.name}" is empty.`); return; }
      this.files.push(f);
    }
    clearErr('merge-error');
    this.renderList();
    document.getElementById('merge-btn').style.display = 'inline-flex';
    const btn = document.getElementById('merge-btn');
    btn.onclick = () => this.merge();
  }

  renderList() {
    const el = document.getElementById('file-list');
    el.style.display = 'block';
    el.innerHTML = `<p style="font-weight:600;color:#1A1530;margin-bottom:.75rem;">${this.files.length} file(s) — drag to reorder:</p>
      <div id="sortable-list" style="display:flex;flex-direction:column;gap:.5rem;">
        ${this.files.map((f,i)=>`
          <div draggable="true" data-i="${i}" style="display:flex;align-items:center;gap:.75rem;background:#F9FAFB;border:1px solid #E5E7EB;border-radius:10px;padding:.75rem 1rem;cursor:grab;">
            <span style="color:#9CA3AF;cursor:grab;">⠿</span>
            <span style="flex:1;font-size:.9rem;font-weight:500;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;">📄 ${f.name}</span>
            <span style="font-size:.8rem;color:#9CA3AF;">${(f.size/1024).toFixed(0)} KB</span>
            <button onclick="window._mergeRemove(${i})" style="background:none;border:none;cursor:pointer;color:#EF4444;font-size:1.1rem;min-width:32px;min-height:32px;">✕</button>
          </div>`).join('')}
      </div>`;
    window._mergeRemove = (i) => { this.files.splice(i,1); if(!this.files.length) { el.style.display='none'; document.getElementById('merge-btn').style.display='none'; } else this.renderList(); };
    this.setupDrag();
  }

  setupDrag() {
    const list = document.getElementById('sortable-list');
    if (!list) return;
    let dragged = null;
    list.querySelectorAll('[draggable]').forEach(item => {
      item.addEventListener('dragstart', () => { dragged = item; item.style.opacity='.4'; });
      item.addEventListener('dragend', () => { item.style.opacity='1'; dragged = null; });
      item.addEventListener('dragover', e => { e.preventDefault(); if(dragged && dragged!==item) { const idx = parseInt(dragged.dataset.i); const targetIdx = parseInt(item.dataset.i); const moved = this.files.splice(idx,1)[0]; this.files.splice(targetIdx,0,moved); this.renderList(); } });
    });
  }

  async merge() {
    if (this.files.length < 2) { showErr('merge-error','Add at least 2 PDF files.'); return; }
    setBtn('merge-btn', true);
    clearErr('merge-error');
    try {
      await loadScript(PDFLIB);
      const { PDFDocument } = window.PDFLib;
      const merged = await PDFDocument.create();
      for (const file of this.files) {
        const buf = await file.arrayBuffer();
        const doc = await PDFDocument.load(buf, { ignoreEncryption: true });
        const pages = await merged.copyPages(doc, doc.getPageIndices());
        pages.forEach(p => merged.addPage(p));
      }
      const bytes = await merged.save();
      const blob = new Blob([bytes], { type: 'application/pdf' });
      const fname = generateFilename(this.files[0].name.replace(/\.pdf$/i,'')+'_merged','pdf');
      downloadBlob(blob, fname);
      showResult('merge-result',`<p style="font-weight:700;color:#166534;margin-bottom:.5rem;">✅ Merged successfully!</p><p style="font-size:.875rem;color:#166534;">Downloaded: <strong>${fname}</strong></p><p style="font-size:.8rem;color:#15803D;margin-top:.5rem;">${this.files.length} PDFs merged into one document.</p>`);
    } catch(e) { showErr('merge-error','Merge failed: ' + e.message); }
    finally { setBtn('merge-btn', false, '🔗 Merge PDFs'); }
  }
}
