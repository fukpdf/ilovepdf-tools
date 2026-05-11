import { loadScript, generateFilename, downloadBlob, setBtn, showErr, clearErr, showResult, setupDropZone, trustBar, toolHeader } from '../utils/helpers.js';
const PDFJS_URL = 'https://cdn.jsdelivr.net/npm/pdfjs-dist@3.11.174/build/pdf.min.js';

export class PdfToPptTool {
  constructor() { this.file = null; }

  render() {
    return `
    ${toolHeader('📊','PDF to PPT','Extract PDF content and generate a downloadable PPTX-like HTML presentation.')}
    ${trustBar()}
    <div id="p2ppt-zone" class="upload-zone" style="margin-bottom:1.5rem;">
      <div style="font-size:2.5rem;margin-bottom:.75rem;">📄</div>
      <p style="font-weight:600;color:#1A1530;margin-bottom:.25rem;">Drop a PDF here</p>
      <p style="font-size:.875rem;color:#6B7280;">or click to browse</p>
      <input id="p2ppt-input" type="file" accept=".pdf,application/pdf" style="display:none;" />
    </div>
    <button id="p2ppt-btn" class="btn-primary" data-label="📊 Convert to Slides" style="display:none;">📊 Convert to Slides</button>
    <div id="p2ppt-error" class="error-box"></div>
    <div id="p2ppt-result" class="result-box"></div>`;
  }

  setupEvents() {
    setupDropZone('p2ppt-zone','p2ppt-input', files => this.loadFile(files[0]));
  }

  loadFile(f) {
    if (!f || (!f.name.endsWith('.pdf') && f.type !== 'application/pdf')) { showErr('p2ppt-error','Please select a PDF file.'); return; }
    if (f.size === 0) { showErr('p2ppt-error','File is empty.'); return; }
    clearErr('p2ppt-error');
    this.file = f;
    const btn = document.getElementById('p2ppt-btn');
    btn.style.display = 'inline-flex';
    btn.onclick = () => this.convert();
  }

  async convert() {
    if (!this.file) return;
    setBtn('p2ppt-btn', true); clearErr('p2ppt-error');
    try {
      await loadScript(PDFJS_URL);
      const pdfjsLib = window['pdfjs-dist/build/pdf'] || window.pdfjsLib;
      if (pdfjsLib && pdfjsLib.GlobalWorkerOptions) pdfjsLib.GlobalWorkerOptions.workerSrc = '';
      const buf = await this.file.arrayBuffer();
      const pdf = await pdfjsLib.getDocument({ data: new Uint8Array(buf), useWorkerFetch: false, isEvalSupported: false, useSystemFonts: true }).promise;
      const slides = [];
      for (let i=1; i<=pdf.numPages; i++) {
        const page = await pdf.getPage(i);
        const content = await page.getTextContent();
        const text = content.items.map(item => item.str).join(' ').trim();
        slides.push({ page: i, text });
      }
      // Build HTML presentation
      const html = `<!DOCTYPE html><html><head><meta charset="UTF-8"/><title>Presentation - ${this.file.name}</title>
        <style>body{font-family:sans-serif;margin:0;padding:0;background:#1a1a2e;}
        .slide{width:960px;height:540px;background:linear-gradient(135deg,#667eea,#764ba2);color:white;display:flex;align-items:center;justify-content:center;margin:20px auto;border-radius:12px;padding:60px;box-sizing:border-box;font-size:18px;line-height:1.6;text-align:center;page-break-after:always;}
        .slide-num{position:absolute;bottom:20px;right:20px;font-size:12px;opacity:.7;}
        .slide{position:relative;}
        </style></head><body>
        ${slides.map(s=>`<div class="slide"><div><p>${s.text||'(No text on this page)'}</p><span class="slide-num">Slide ${s.page}</span></div></div>`).join('')}
        </body></html>`;
      const fname = generateFilename(this.file.name.replace(/\.pdf$/i,'')+'_slides', 'html');
      downloadBlob(new Blob([html],{type:'text/html'}), fname);
      showResult('p2ppt-result',`<p style="font-weight:700;color:#166534;">✅ Converted ${slides.length} slides!</p><p style="font-size:.875rem;color:#166534;margin-top:.25rem;">Downloaded HTML presentation: <strong>${fname}</strong></p><p style="font-size:.8rem;color:#15803D;margin-top:.5rem;">Open in any browser. Use File → Print → Save as PDF to get a PPTX-like PDF.</p>`);
    } catch(e) { showErr('p2ppt-error','Conversion failed: ' + e.message); }
    finally { setBtn('p2ppt-btn', false, '📊 Convert to Slides'); }
  }
}
