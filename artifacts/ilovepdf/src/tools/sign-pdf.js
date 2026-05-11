import { loadScript, generateFilename, downloadBlob, setBtn, showErr, clearErr, showResult, setupDropZone, trustBar, toolHeader } from '../utils/helpers.js';
const PDFLIB = 'https://cdn.jsdelivr.net/npm/pdf-lib@1.17.1/dist/pdf-lib.min.js';

export class SignPdfTool {
  constructor() { this.file = null; this.drawing = false; this.signData = null; }

  render() {
    return `
    ${toolHeader('🖊️','Sign PDF','Draw your signature and place it on a PDF page.')}
    ${trustBar()}
    <div id="sign-zone" class="upload-zone" style="margin-bottom:1.5rem;">
      <div style="font-size:2.5rem;margin-bottom:.75rem;">📄</div>
      <p style="font-weight:600;color:#1A1530;margin-bottom:.25rem;">Drop a PDF here</p>
      <p style="font-size:.875rem;color:#6B7280;">or click to browse</p>
      <input id="sign-input" type="file" accept=".pdf,application/pdf" style="display:none;" />
    </div>
    <div id="sign-options" style="display:none;margin-bottom:1.5rem;">
      <p id="sign-info" style="font-weight:600;color:#1A1530;margin-bottom:1rem;"></p>
      <label style="font-weight:600;font-size:.9rem;color:#1A1530;display:block;margin-bottom:.5rem;">Draw Your Signature</label>
      <canvas id="sign-canvas" width="500" height="150" style="border:2px solid #7B3FF2;border-radius:12px;background:white;cursor:crosshair;touch-action:none;max-width:100%;display:block;margin-bottom:.75rem;"></canvas>
      <div style="display:flex;gap:.75rem;margin-bottom:1rem;">
        <button id="sign-clear" style="background:#F3F4F6;border:1px solid #E5E7EB;border-radius:8px;padding:.5rem 1rem;cursor:pointer;font-family:'Plus Jakarta Sans',sans-serif;min-height:44px;">Clear</button>
      </div>
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:.75rem;max-width:320px;">
        <div><label style="font-weight:600;font-size:.9rem;color:#1A1530;display:block;margin-bottom:.4rem;">Page</label><input id="sign-page" type="number" min="1" value="1" /></div>
        <div><label style="font-weight:600;font-size:.9rem;color:#1A1530;display:block;margin-bottom:.4rem;">Scale</label><input id="sign-scale" type="number" min="10" max="200" value="100" /></div>
      </div>
    </div>
    <button id="sign-btn" class="btn-primary" data-label="🖊️ Sign & Save PDF" style="display:none;">🖊️ Sign & Save PDF</button>
    <div id="sign-error" class="error-box"></div>
    <div id="sign-result" class="result-box"></div>`;
  }

  setupEvents() {
    setupDropZone('sign-zone','sign-input', files => this.loadFile(files[0]));
  }

  async loadFile(f) {
    if (!f || (!f.name.endsWith('.pdf') && f.type !== 'application/pdf')) { showErr('sign-error','Please select a PDF file.'); return; }
    if (f.size === 0) { showErr('sign-error','File is empty.'); return; }
    clearErr('sign-error');
    this.file = f;
    try {
      await loadScript(PDFLIB);
      const buf = await f.arrayBuffer();
      const doc = await window.PDFLib.PDFDocument.load(buf, { ignoreEncryption: true });
      document.getElementById('sign-info').textContent = `📄 ${f.name} — ${doc.getPageCount()} page(s)`;
      document.getElementById('sign-page').max = doc.getPageCount();
      document.getElementById('sign-options').style.display = 'block';
      this.setupCanvas();
      const btn = document.getElementById('sign-btn');
      btn.style.display = 'inline-flex';
      btn.onclick = () => this.save();
    } catch(e) { showErr('sign-error','Could not read PDF: ' + e.message); }
  }

  setupCanvas() {
    const canvas = document.getElementById('sign-canvas');
    const ctx = canvas.getContext('2d');
    ctx.strokeStyle = '#1a1a2e'; ctx.lineWidth = 2.5; ctx.lineCap = 'round'; ctx.lineJoin = 'round';
    let drawing = false, lastX = 0, lastY = 0;

    const getPos = (e) => {
      const rect = canvas.getBoundingClientRect();
      const scaleX = canvas.width / rect.width;
      const scaleY = canvas.height / rect.height;
      if (e.touches) return [(e.touches[0].clientX - rect.left)*scaleX, (e.touches[0].clientY - rect.top)*scaleY];
      return [(e.clientX - rect.left)*scaleX, (e.clientY - rect.top)*scaleY];
    };

    canvas.addEventListener('mousedown', e => { drawing=true; [lastX,lastY]=getPos(e); });
    canvas.addEventListener('mousemove', e => { if(!drawing) return; const [x,y]=getPos(e); ctx.beginPath(); ctx.moveTo(lastX,lastY); ctx.lineTo(x,y); ctx.stroke(); [lastX,lastY]=[x,y]; });
    canvas.addEventListener('mouseup', () => drawing=false);
    canvas.addEventListener('mouseleave', () => drawing=false);
    canvas.addEventListener('touchstart', e => { e.preventDefault(); drawing=true; [lastX,lastY]=getPos(e); });
    canvas.addEventListener('touchmove', e => { e.preventDefault(); if(!drawing) return; const [x,y]=getPos(e); ctx.beginPath(); ctx.moveTo(lastX,lastY); ctx.lineTo(x,y); ctx.stroke(); [lastX,lastY]=[x,y]; });
    canvas.addEventListener('touchend', () => drawing=false);
    document.getElementById('sign-clear').onclick = () => ctx.clearRect(0,0,canvas.width,canvas.height);
  }

  async save() {
    if (!this.file) return;
    const canvas = document.getElementById('sign-canvas');
    const pageNum = parseInt(document.getElementById('sign-page').value)-1;
    const scale = parseInt(document.getElementById('sign-scale').value)/100;
    setBtn('sign-btn', true); clearErr('sign-error');
    try {
      await loadScript(PDFLIB);
      const { PDFDocument } = window.PDFLib;
      const pngData = canvas.toDataURL('image/png');
      const resp = await fetch(pngData);
      const pngBuf = await resp.arrayBuffer();
      const buf = await this.file.arrayBuffer();
      const doc = await PDFDocument.load(buf, { ignoreEncryption: true });
      const pages = doc.getPages();
      if (pageNum >= pages.length) { showErr('sign-error','Page out of range.'); return; }
      const img = await doc.embedPng(pngBuf);
      const { width, height } = pages[pageNum].getSize();
      const sigW = img.width * scale * 0.3, sigH = img.height * scale * 0.3;
      pages[pageNum].drawImage(img, { x: width/2 - sigW/2, y: 50, width: sigW, height: sigH });
      const bytes = await doc.save();
      const fname = generateFilename(this.file.name.replace(/\.pdf$/i,'')+'_signed', 'pdf');
      downloadBlob(new Blob([bytes],{type:'application/pdf'}), fname);
      showResult('sign-result',`<p style="font-weight:700;color:#166534;">✅ Signature added!</p><p style="font-size:.875rem;color:#166534;margin-top:.25rem;">Downloaded: <strong>${fname}</strong></p>`);
    } catch(e) { showErr('sign-error','Signing failed: ' + e.message); }
    finally { setBtn('sign-btn', false, '🖊️ Sign & Save PDF'); }
  }
}
