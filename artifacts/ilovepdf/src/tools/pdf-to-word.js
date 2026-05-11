import { loadScript, generateFilename, downloadBlob, setBtn, showErr, clearErr, showResult, setupDropZone, trustBar, toolHeader } from '../utils/helpers.js';
const PDFJS_URL = 'https://cdn.jsdelivr.net/npm/pdfjs-dist@3.11.174/build/pdf.min.js';

export class PdfToWordTool {
  constructor() { this.file = null; }

  render() {
    return `
    ${toolHeader('📝','PDF to Word','Extract text content from your PDF as an editable document.')}
    ${trustBar()}
    <div id="p2w-zone" class="upload-zone" style="margin-bottom:1.5rem;">
      <div style="font-size:2.5rem;margin-bottom:.75rem;">📄</div>
      <p style="font-weight:600;color:#1A1530;margin-bottom:.25rem;">Drop a PDF here</p>
      <p style="font-size:.875rem;color:#6B7280;">or click to browse</p>
      <input id="p2w-input" type="file" accept=".pdf,application/pdf" style="display:none;" />
    </div>
    <div style="background:#FEF3C7;border:1px solid #FCD34D;border-radius:10px;padding:.75rem 1rem;margin-bottom:1.5rem;font-size:.85rem;color:#92400E;">
      ⚠️ Browser-based extraction works best with text-based PDFs. Scanned PDFs may need the OCR tool instead.
    </div>
    <button id="p2w-btn" class="btn-primary" data-label="📝 Extract Text" style="display:none;">📝 Extract Text</button>
    <div id="p2w-error" class="error-box"></div>
    <div id="p2w-result" class="result-box"></div>`;
  }

  setupEvents() {
    setupDropZone('p2w-zone','p2w-input', files => this.loadFile(files[0]));
  }

  loadFile(f) {
    if (!f || (!f.name.endsWith('.pdf') && f.type !== 'application/pdf')) { showErr('p2w-error','Please select a PDF file.'); return; }
    if (f.size === 0) { showErr('p2w-error','File is empty.'); return; }
    clearErr('p2w-error');
    this.file = f;
    const btn = document.getElementById('p2w-btn');
    btn.style.display = 'inline-flex';
    btn.onclick = () => this.extract();
  }

  async extract() {
    if (!this.file) return;
    setBtn('p2w-btn', true); clearErr('p2w-error');
    try {
      await loadScript(PDFJS_URL);
      const pdfjsLib = window['pdfjs-dist/build/pdf'] || window.pdfjsLib || window.pdfjs;
      if (pdfjsLib && pdfjsLib.GlobalWorkerOptions) pdfjsLib.GlobalWorkerOptions.workerSrc = '';
      const buf = await this.file.arrayBuffer();
      const pdf = await (pdfjsLib || window.pdfjsLib).getDocument({ data: new Uint8Array(buf), useWorkerFetch: false, isEvalSupported: false, useSystemFonts: true }).promise;
      let fullText = '';
      for (let i=1; i<=pdf.numPages; i++) {
        const page = await pdf.getPage(i);
        const content = await page.getTextContent();
        const pageText = content.items.map(item => item.str).join(' ');
        fullText += `\n--- Page ${i} ---\n${pageText}\n`;
      }
      if (!fullText.trim()) throw new Error('No text found. Try the OCR tool for scanned PDFs.');
      const blob = new Blob([fullText], { type: 'text/plain' });
      const fname = generateFilename(this.file.name.replace(/\.pdf$/i,''), 'txt');
      downloadBlob(blob, fname);
      showResult('p2w-result',`
        <p style="font-weight:700;color:#166534;margin-bottom:.75rem;">✅ Text extracted!</p>
        <textarea readonly style="width:100%;height:200px;border:1px solid #BBF7D0;border-radius:8px;padding:.75rem;font-size:.85rem;font-family:monospace;resize:vertical;background:white;">${fullText.slice(0,2000)}${fullText.length>2000?'...(truncated)':''}</textarea>
        <p style="font-size:.875rem;color:#166534;margin-top:.75rem;">Downloaded as text file: <strong>${fname}</strong></p>`);
    } catch(e) { showErr('p2w-error','Extraction failed: ' + e.message); }
    finally { setBtn('p2w-btn', false, '📝 Extract Text'); }
  }
}
