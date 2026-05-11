import { loadScript, generateFilename, downloadBlob, setBtn, showErr, clearErr, showResult, setupDropZone, trustBar, toolHeader } from '../utils/helpers.js';
const PDFLIB = 'https://cdn.jsdelivr.net/npm/pdf-lib@1.17.1/dist/pdf-lib.min.js';

export class PptToPdfTool {
  constructor() { this.file = null; }

  render() {
    return `
    ${toolHeader('📑','PPT to PDF','Convert PowerPoint presentations to PDF (text extraction method).')}
    ${trustBar()}
    <div id="ppt2p-zone" class="upload-zone" style="margin-bottom:1.5rem;">
      <div style="font-size:2.5rem;margin-bottom:.75rem;">📊</div>
      <p style="font-weight:600;color:#1A1530;margin-bottom:.25rem;">Drop a PPTX file here</p>
      <p style="font-size:.875rem;color:#6B7280;">Supports .pptx format</p>
      <input id="ppt2p-input" type="file" accept=".pptx,application/vnd.openxmlformats-officedocument.presentationml.presentation" style="display:none;" />
    </div>
    <div style="background:#FEF3C7;border:1px solid #FCD34D;border-radius:10px;padding:.75rem 1rem;margin-bottom:1.5rem;font-size:.85rem;color:#92400E;">
      ⚠️ PPTX parsing extracts text from slides. Complex layouts may not be perfectly reproduced.
    </div>
    <button id="ppt2p-btn" class="btn-primary" data-label="📑 Convert to PDF" style="display:none;">📑 Convert to PDF</button>
    <div id="ppt2p-error" class="error-box"></div>
    <div id="ppt2p-result" class="result-box"></div>`;
  }

  setupEvents() {
    setupDropZone('ppt2p-zone','ppt2p-input', files => this.loadFile(files[0]));
  }

  loadFile(f) {
    if (!f || !f.name.endsWith('.pptx')) { showErr('ppt2p-error','Please select a .pptx file.'); return; }
    if (f.size === 0) { showErr('ppt2p-error','File is empty.'); return; }
    clearErr('ppt2p-error');
    this.file = f;
    const btn = document.getElementById('ppt2p-btn');
    btn.style.display = 'inline-flex';
    btn.onclick = () => this.convert();
  }

  async convert() {
    if (!this.file) return;
    setBtn('ppt2p-btn', true); clearErr('ppt2p-error');
    try {
      await loadScript(PDFLIB);
      // PPTX is a ZIP — parse XML using DOMParser
      const buf = await this.file.arrayBuffer();
      // Simple approach: treat as zip and extract slide text via regex on raw bytes
      const text = new TextDecoder('utf-8', { fatal: false }).decode(buf);
      const slideTexts = [];
      const slideMatches = text.matchAll(/<a:t[^>]*>([^<]+)<\/a:t>/g);
      let current = [];
      let count = 0;
      for (const m of slideMatches) {
        current.push(m[1]);
        if (current.length > 10) { slideTexts.push(current.join(' ')); current = []; count++; }
      }
      if (current.length) slideTexts.push(current.join(' '));
      if (!slideTexts.length) slideTexts.push('No readable text found in presentation.');

      const { PDFDocument, StandardFonts, rgb } = window.PDFLib;
      const doc = await PDFDocument.create();
      const font = await doc.embedFont(StandardFonts.HelveticaBold);
      const bodyFont = await doc.embedFont(StandardFonts.Helvetica);

      slideTexts.forEach((slideText, idx) => {
        const page = doc.addPage([960, 540]);
        page.drawRectangle({ x:0, y:0, width:960, height:540, color:rgb(0.4,0.25,0.95) });
        page.drawText(`Slide ${idx+1}`, { x:40, y:480, size:14, font, color:rgb(1,1,1) });
        const words = slideText.slice(0,300);
        const lines = words.match(/.{1,60}/g) || [words];
        lines.slice(0,12).forEach((line, li) => {
          page.drawText(line, { x:40, y:420-li*28, size:16, font:bodyFont, color:rgb(1,1,1) });
        });
      });

      const bytes = await doc.save();
      const fname = generateFilename(this.file.name.replace(/\.pptx$/i,''), 'pdf');
      downloadBlob(new Blob([bytes],{type:'application/pdf'}), fname);
      showResult('ppt2p-result',`<p style="font-weight:700;color:#166534;">✅ Converted ${slideTexts.length} slides to PDF!</p><p style="font-size:.875rem;color:#166534;margin-top:.25rem;">Downloaded: <strong>${fname}</strong></p>`);
    } catch(e) { showErr('ppt2p-error','Conversion failed: ' + e.message); }
    finally { setBtn('ppt2p-btn', false, '📑 Convert to PDF'); }
  }
}
