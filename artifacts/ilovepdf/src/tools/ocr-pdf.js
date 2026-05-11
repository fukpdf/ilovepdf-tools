import { loadScript, generateFilename, downloadBlob, setBtn, showErr, clearErr, showResult, setupDropZone, trustBar, toolHeader } from '../utils/helpers.js';
const TESSERACT = 'https://cdn.jsdelivr.net/npm/tesseract.js@5/dist/tesseract.min.js';
const PDFJS_URL = 'https://cdn.jsdelivr.net/npm/pdfjs-dist@3.11.174/build/pdf.min.js';

export class OcrPdfTool {
  constructor() { this.file = null; }

  render() {
    return `
    ${toolHeader('🔎','OCR PDF','Extract text from scanned PDFs using Tesseract.js OCR engine.')}
    ${trustBar()}
    <div id="ocr-zone" class="upload-zone" style="margin-bottom:1.5rem;">
      <div style="font-size:2.5rem;margin-bottom:.75rem;">📄</div>
      <p style="font-weight:600;color:#1A1530;margin-bottom:.25rem;">Drop a PDF here</p>
      <p style="font-size:.875rem;color:#6B7280;">or click to browse — works best on scanned PDFs</p>
      <input id="ocr-input" type="file" accept=".pdf,application/pdf,image/*" style="display:none;" />
    </div>
    <div id="ocr-options" style="display:none;margin-bottom:1.5rem;">
      <p id="ocr-info" style="font-weight:600;color:#1A1530;margin-bottom:1rem;"></p>
      <label style="font-weight:600;font-size:.9rem;color:#1A1530;display:block;margin-bottom:.5rem;">Language</label>
      <select id="ocr-lang" style="max-width:200px;">
        <option value="eng">English</option>
        <option value="fra">French</option>
        <option value="deu">German</option>
        <option value="spa">Spanish</option>
        <option value="ita">Italian</option>
      </select>
      <div id="ocr-progress" style="margin-top:1rem;display:none;">
        <div style="background:#E5E7EB;border-radius:6px;height:8px;"><div id="ocr-bar" style="background:#7B3FF2;height:8px;border-radius:6px;width:0%;transition:width .3s;"></div></div>
        <p id="ocr-status" style="font-size:.875rem;color:#7B3FF2;margin-top:.5rem;"></p>
      </div>
    </div>
    <button id="ocr-btn" class="btn-primary" data-label="🔎 Run OCR" style="display:none;">🔎 Run OCR</button>
    <div id="ocr-error" class="error-box"></div>
    <div id="ocr-result" class="result-box"></div>`;
  }

  setupEvents() {
    setupDropZone('ocr-zone','ocr-input', files => this.loadFile(files[0]));
  }

  async loadFile(f) {
    if (!f) { showErr('ocr-error','Please select a file.'); return; }
    if (f.size === 0) { showErr('ocr-error','File is empty.'); return; }
    clearErr('ocr-error');
    this.file = f;
    const isImg = f.type.startsWith('image/');
    document.getElementById('ocr-info').textContent = `${isImg?'🖼️':'📄'} ${f.name} — ${(f.size/1024).toFixed(1)} KB`;
    document.getElementById('ocr-options').style.display = 'block';
    const btn = document.getElementById('ocr-btn');
    btn.style.display = 'inline-flex';
    btn.onclick = () => this.run();
  }

  async run() {
    if (!this.file) return;
    setBtn('ocr-btn', true); clearErr('ocr-error');
    const prog = document.getElementById('ocr-progress');
    const bar = document.getElementById('ocr-bar');
    const status = document.getElementById('ocr-status');
    prog.style.display = 'block';
    try {
      await loadScript(TESSERACT);
      const lang = document.getElementById('ocr-lang').value;
      let imageData;
      if (this.file.type.startsWith('image/')) {
        imageData = this.file;
      } else {
        // Render first page of PDF to canvas
        await loadScript(PDFJS_URL);
        const pdfjsLib = window['pdfjs-dist/build/pdf'] || window.pdfjsLib;
        if (pdfjsLib && pdfjsLib.GlobalWorkerOptions) pdfjsLib.GlobalWorkerOptions.workerSrc = '';
        const buf = await this.file.arrayBuffer();
        const pdf = await pdfjsLib.getDocument({ data: new Uint8Array(buf), useWorkerFetch: false, isEvalSupported: false, useSystemFonts: true }).promise;
        const page = await pdf.getPage(1);
        const vp = page.getViewport({ scale: 2 });
        const canvas = document.createElement('canvas');
        canvas.width = vp.width; canvas.height = vp.height;
        await page.render({ canvasContext: canvas.getContext('2d'), viewport: vp }).promise;
        imageData = canvas;
      }
      status.textContent = 'Initializing OCR engine...';
      const worker = await window.Tesseract.createWorker(lang, 1, {
        logger: m => {
          if (m.progress) { bar.style.width = (m.progress*100)+'%'; status.textContent = m.status + '...'; }
        }
      });
      const { data: { text } } = await worker.recognize(imageData);
      await worker.terminate();
      prog.style.display = 'none';
      const fname = generateFilename(this.file.name.replace(/\.[^.]+$/,'')+'_ocr', 'txt');
      downloadBlob(new Blob([text],{type:'text/plain'}), fname);
      showResult('ocr-result',`
        <p style="font-weight:700;color:#166534;margin-bottom:.75rem;">✅ OCR Complete!</p>
        <textarea readonly style="width:100%;height:200px;border:1px solid #BBF7D0;border-radius:8px;padding:.75rem;font-size:.85rem;font-family:monospace;resize:vertical;background:white;">${text.slice(0,2000)}</textarea>
        <p style="font-size:.875rem;color:#166534;margin-top:.75rem;">Downloaded: <strong>${fname}</strong></p>`);
    } catch(e) { showErr('ocr-error','OCR failed: ' + e.message); prog.style.display='none'; }
    finally { setBtn('ocr-btn', false, '🔎 Run OCR'); }
  }
}
