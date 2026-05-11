import { loadScript, generateFilename, downloadBlob, setBtn, showErr, clearErr, showResult, setupDropZone, trustBar, toolHeader } from '../utils/helpers.js';
const PDFLIB = 'https://cdn.jsdelivr.net/npm/pdf-lib@1.17.1/dist/pdf-lib.min.js';

export class JpgToPdfTool {
  constructor() { this.files = []; }

  render() {
    return `
    ${toolHeader('📸','JPG to PDF','Combine multiple images into a single PDF document.')}
    ${trustBar()}
    <div id="i2p-zone" class="upload-zone" style="margin-bottom:1rem;">
      <div style="font-size:2.5rem;margin-bottom:.75rem;">🖼️</div>
      <p style="font-weight:600;color:#1A1530;margin-bottom:.25rem;">Drop images here</p>
      <p style="font-size:.875rem;color:#6B7280;">JPG, PNG, WEBP — select multiple</p>
      <input id="i2p-input" type="file" accept="image/jpeg,image/png,image/webp,image/gif" multiple style="display:none;" />
    </div>
    <div id="i2p-list" style="margin-bottom:1.5rem;display:none;"></div>
    <div id="i2p-options" style="display:none;margin-bottom:1.5rem;">
      <label style="font-weight:600;font-size:.9rem;color:#1A1530;display:block;margin-bottom:.5rem;">Page Size</label>
      <select id="i2p-pagesize" style="max-width:200px;">
        <option value="fit">Fit to image</option>
        <option value="a4">A4 (595×842)</option>
        <option value="letter">Letter (612×792)</option>
      </select>
    </div>
    <button id="i2p-btn" class="btn-primary" data-label="📸 Convert to PDF" style="display:none;">📸 Convert to PDF</button>
    <div id="i2p-error" class="error-box"></div>
    <div id="i2p-result" class="result-box"></div>`;
  }

  setupEvents() {
    setupDropZone('i2p-zone','i2p-input', files => this.addFiles(files));
  }

  addFiles(files) {
    for (const f of files) {
      if (!f.type.startsWith('image/')) { showErr('i2p-error',`"${f.name}" is not an image.`); continue; }
      if (f.size === 0) { showErr('i2p-error',`"${f.name}" is empty.`); continue; }
      this.files.push(f);
    }
    clearErr('i2p-error');
    this.renderList();
    document.getElementById('i2p-options').style.display = 'block';
    document.getElementById('i2p-btn').style.display = 'inline-flex';
    document.getElementById('i2p-btn').onclick = () => this.convert();
  }

  renderList() {
    const el = document.getElementById('i2p-list');
    el.style.display = 'block';
    el.innerHTML = `<p style="font-weight:600;color:#1A1530;margin-bottom:.5rem;">${this.files.length} image(s):</p>
      <div style="display:flex;flex-wrap:wrap;gap:.5rem;">
        ${this.files.map((f,i)=>`
          <div style="display:flex;align-items:center;gap:.5rem;background:#F9FAFB;border:1px solid #E5E7EB;border-radius:8px;padding:.5rem .75rem;">
            <span style="font-size:.85rem;font-weight:500;">🖼️ ${f.name}</span>
            <button onclick="window._i2pRemove(${i})" style="background:none;border:none;cursor:pointer;color:#EF4444;min-width:24px;min-height:24px;">✕</button>
          </div>`).join('')}
      </div>`;
    window._i2pRemove = (i) => { this.files.splice(i,1); this.renderList(); };
  }

  async convert() {
    if (!this.files.length) { showErr('i2p-error','Add at least one image.'); return; }
    setBtn('i2p-btn', true); clearErr('i2p-error');
    const pageSize = document.getElementById('i2p-pagesize').value;
    try {
      await loadScript(PDFLIB);
      const { PDFDocument } = window.PDFLib;
      const doc = await PDFDocument.create();
      for (const f of this.files) {
        const buf = await f.arrayBuffer();
        let img;
        if (f.type === 'image/png') img = await doc.embedPng(buf);
        else img = await doc.embedJpg(buf);
        let w, h;
        if (pageSize === 'a4') { w=595; h=842; }
        else if (pageSize === 'letter') { w=612; h=792; }
        else { w=img.width; h=img.height; }
        const page = doc.addPage([w, h]);
        const scale = Math.min(w/img.width, h/img.height);
        const dw = img.width*scale, dh = img.height*scale;
        page.drawImage(img, { x:(w-dw)/2, y:(h-dh)/2, width:dw, height:dh });
      }
      const bytes = await doc.save();
      const fname = generateFilename(this.files[0].name.replace(/\.[^.]+$/,'')+'_images', 'pdf');
      downloadBlob(new Blob([bytes],{type:'application/pdf'}), fname);
      showResult('i2p-result',`<p style="font-weight:700;color:#166534;">✅ ${this.files.length} image(s) combined into PDF!</p><p style="font-size:.875rem;color:#166534;margin-top:.25rem;">Downloaded: <strong>${fname}</strong></p>`);
    } catch(e) { showErr('i2p-error','Conversion failed: ' + e.message); }
    finally { setBtn('i2p-btn', false, '📸 Convert to PDF'); }
  }
}
