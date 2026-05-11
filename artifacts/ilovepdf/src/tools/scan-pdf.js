import { loadScript, generateFilename, downloadBlob, setBtn, showErr, clearErr, showResult, trustBar, toolHeader } from '../utils/helpers.js';
const PDFLIB = 'https://cdn.jsdelivr.net/npm/pdf-lib@1.17.1/dist/pdf-lib.min.js';

export class ScanPdfTool {
  constructor() { this.captures = []; this.stream = null; }

  render() {
    return `
    ${toolHeader('📷','Scan to PDF','Use your camera to capture documents and save them as a PDF.')}
    ${trustBar()}
    <div style="display:grid;gap:1.5rem;margin-bottom:1.5rem;">
      <div>
        <button id="scan-start" class="btn-primary" style="margin-bottom:1rem;">📷 Open Camera</button>
        <video id="scan-video" style="display:none;width:100%;max-width:500px;border-radius:12px;background:#000;" autoplay playsinline></video>
        <canvas id="scan-canvas" style="display:none;"></canvas>
      </div>
      <div id="scan-controls" style="display:none;gap:.75rem;display:none;">
        <button id="scan-capture" class="btn-primary">📸 Capture</button>
        <button id="scan-stop" style="background:#F3F4F6;border:1px solid #E5E7EB;border-radius:10px;height:56px;padding:0 1.5rem;cursor:pointer;font-family:'Plus Jakarta Sans',sans-serif;font-weight:600;min-height:44px;">Stop Camera</button>
      </div>
      <div id="scan-previews" style="display:flex;flex-wrap:wrap;gap:.75rem;"></div>
    </div>
    <button id="scan-save" class="btn-primary" data-label="💾 Save as PDF" style="display:none;">💾 Save as PDF</button>
    <div id="scan-error" class="error-box"></div>
    <div id="scan-result" class="result-box"></div>`;
  }

  setupEvents() {
    document.getElementById('scan-start').onclick = () => this.startCamera();
    document.getElementById('scan-capture').onclick = () => this.capture();
    document.getElementById('scan-stop').onclick = () => this.stopCamera();
    document.getElementById('scan-save').onclick = () => this.save();
  }

  async startCamera() {
    clearErr('scan-error');
    try {
      this.stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } });
      const video = document.getElementById('scan-video');
      video.srcObject = this.stream;
      video.style.display = 'block';
      document.getElementById('scan-controls').style.display = 'flex';
      document.getElementById('scan-start').style.display = 'none';
    } catch(e) { showErr('scan-error','Camera access denied: ' + e.message); }
  }

  capture() {
    const video = document.getElementById('scan-video');
    const canvas = document.getElementById('scan-canvas');
    canvas.width = video.videoWidth || 640;
    canvas.height = video.videoHeight || 480;
    canvas.getContext('2d').drawImage(video, 0, 0);
    const dataUrl = canvas.toDataURL('image/jpeg', 0.92);
    this.captures.push(dataUrl);
    const previews = document.getElementById('scan-previews');
    const idx = this.captures.length - 1;
    const div = document.createElement('div');
    div.style.cssText = 'position:relative;display:inline-block;';
    div.innerHTML = `<img src="${dataUrl}" style="width:120px;height:90px;object-fit:cover;border-radius:8px;border:2px solid #E5E7EB;" />
      <button onclick="window._scanRemove(${idx})" style="position:absolute;top:-6px;right:-6px;background:#EF4444;color:white;border:none;border-radius:50%;width:20px;height:20px;cursor:pointer;font-size:.7rem;">✕</button>`;
    previews.appendChild(div);
    document.getElementById('scan-save').style.display = 'inline-flex';
    window._scanRemove = (i) => { this.captures[i]=null; div.remove(); };
  }

  stopCamera() {
    if (this.stream) { this.stream.getTracks().forEach(t=>t.stop()); this.stream=null; }
    document.getElementById('scan-video').style.display = 'none';
    document.getElementById('scan-controls').style.display = 'none';
    document.getElementById('scan-start').style.display = 'inline-flex';
  }

  async save() {
    const imgs = this.captures.filter(Boolean);
    if (!imgs.length) { showErr('scan-error','Capture at least one photo.'); return; }
    setBtn('scan-save', true); clearErr('scan-error');
    try {
      await loadScript(PDFLIB);
      const { PDFDocument } = window.PDFLib;
      const doc = await PDFDocument.create();
      for (const dataUrl of imgs) {
        const resp = await fetch(dataUrl);
        const buf = await resp.arrayBuffer();
        const img = await doc.embedJpg(buf);
        const page = doc.addPage([img.width, img.height]);
        page.drawImage(img, { x:0, y:0, width:img.width, height:img.height });
      }
      const bytes = await doc.save();
      const fname = generateFilename('scan_'+Date.now(), 'pdf');
      downloadBlob(new Blob([bytes],{type:'application/pdf'}), fname);
      showResult('scan-result',`<p style="font-weight:700;color:#166534;">✅ ${imgs.length} photo(s) saved as PDF!</p><p style="font-size:.875rem;color:#166534;margin-top:.25rem;">Downloaded: <strong>${fname}</strong></p>`);
    } catch(e) { showErr('scan-error','Save failed: ' + e.message); }
    finally { setBtn('scan-save', false, '💾 Save as PDF'); }
  }
}
