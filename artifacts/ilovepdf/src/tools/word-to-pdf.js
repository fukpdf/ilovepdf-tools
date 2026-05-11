import { loadScript, generateFilename, downloadBlob, setBtn, showErr, clearErr, showResult, setupDropZone, trustBar, toolHeader } from '../utils/helpers.js';
const MAMMOTH = 'https://cdn.jsdelivr.net/npm/mammoth@1.6.0/mammoth.browser.min.js';
const PDFLIB = 'https://cdn.jsdelivr.net/npm/pdf-lib@1.17.1/dist/pdf-lib.min.js';

export class WordToPdfTool {
  constructor() { this.file = null; }

  render() {
    return `
    ${toolHeader('📄','Word to PDF','Convert DOCX documents to PDF format via browser processing.')}
    ${trustBar()}
    <div id="w2p-zone" class="upload-zone" style="margin-bottom:1.5rem;">
      <div style="font-size:2.5rem;margin-bottom:.75rem;">📝</div>
      <p style="font-weight:600;color:#1A1530;margin-bottom:.25rem;">Drop a DOCX file here</p>
      <p style="font-size:.875rem;color:#6B7280;">or click to browse (.docx files only)</p>
      <input id="w2p-input" type="file" accept=".docx,application/vnd.openxmlformats-officedocument.wordprocessingml.document" style="display:none;" />
    </div>
    <button id="w2p-btn" class="btn-primary" data-label="📄 Convert to PDF" style="display:none;">📄 Convert to PDF</button>
    <div id="w2p-error" class="error-box"></div>
    <div id="w2p-result" class="result-box"></div>`;
  }

  setupEvents() {
    setupDropZone('w2p-zone','w2p-input', files => this.loadFile(files[0]));
  }

  loadFile(f) {
    if (!f || !f.name.endsWith('.docx')) { showErr('w2p-error','Please select a .docx file.'); return; }
    if (f.size === 0) { showErr('w2p-error','File is empty.'); return; }
    clearErr('w2p-error');
    this.file = f;
    const btn = document.getElementById('w2p-btn');
    btn.style.display = 'inline-flex';
    btn.onclick = () => this.convert();
  }

  async convert() {
    if (!this.file) return;
    setBtn('w2p-btn', true); clearErr('w2p-error');
    try {
      await Promise.all([loadScript(MAMMOTH), loadScript(PDFLIB)]);
      const buf = await this.file.arrayBuffer();
      const result = await window.mammoth.convertToHtml({ arrayBuffer: buf });
      const html = result.value;

      // Convert HTML to PDF using pdf-lib with extracted text
      const { PDFDocument, StandardFonts, rgb } = window.PDFLib;
      const doc = await PDFDocument.create();
      const font = await doc.embedFont(StandardFonts.Helvetica);

      // Parse HTML to plain text
      const div = document.createElement('div');
      div.innerHTML = html;
      const text = div.innerText || div.textContent || '';
      const lines = text.split('\n').filter(l => l.trim());

      const pageWidth = 595, pageHeight = 842, margin = 60, lineH = 18, fontSize = 11;
      let page = doc.addPage([pageWidth, pageHeight]);
      let y = pageHeight - margin;

      for (const line of lines) {
        if (y < margin + lineH) { page = doc.addPage([pageWidth, pageHeight]); y = pageHeight - margin; }
        const chunks = line.match(/.{1,80}/g) || [line];
        for (const chunk of chunks) {
          if (y < margin + lineH) { page = doc.addPage([pageWidth, pageHeight]); y = pageHeight - margin; }
          page.drawText(chunk, { x: margin, y, size: fontSize, font, color: rgb(0,0,0) });
          y -= lineH;
        }
        y -= 4;
      }

      const bytes = await doc.save();
      const fname = generateFilename(this.file.name.replace(/\.docx$/i,''), 'pdf');
      downloadBlob(new Blob([bytes],{type:'application/pdf'}), fname);
      showResult('w2p-result',`<p style="font-weight:700;color:#166534;">✅ Converted to PDF!</p><p style="font-size:.875rem;color:#166534;margin-top:.25rem;">Downloaded: <strong>${fname}</strong></p>`);
    } catch(e) { showErr('w2p-error','Conversion failed: ' + e.message); }
    finally { setBtn('w2p-btn', false, '📄 Convert to PDF'); }
  }
}
