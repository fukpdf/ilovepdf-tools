import { loadScript, setBtn, showErr, clearErr, showResult, trustBar, toolHeader } from '../utils/helpers.js';
const PDFJS_URL = 'https://cdn.jsdelivr.net/npm/pdfjs-dist@3.11.174/build/pdf.min.js';

export class ComparePdfTool {
  constructor() { this.file1 = null; this.file2 = null; }

  render() {
    return `
    ${toolHeader('🔁','Compare PDF','Extract text from two PDFs and show the differences side by side.')}
    ${trustBar()}
    <div style="display:grid;grid-template-columns:1fr 1fr;gap:1rem;margin-bottom:1.5rem;">
      <div>
        <p style="font-weight:600;color:#1A1530;margin-bottom:.5rem;">📄 First PDF</p>
        <div id="cmp-zone1" class="upload-zone" style="padding:1.5rem 1rem;">
          <div style="font-size:1.75rem;margin-bottom:.5rem;">📄</div>
          <p style="font-size:.85rem;color:#6B7280;">Drop or click</p>
          <input id="cmp-input1" type="file" accept=".pdf,application/pdf" style="display:none;" />
        </div>
        <p id="cmp-name1" style="font-size:.85rem;color:#7B3FF2;margin-top:.5rem;min-height:20px;"></p>
      </div>
      <div>
        <p style="font-weight:600;color:#1A1530;margin-bottom:.5rem;">📄 Second PDF</p>
        <div id="cmp-zone2" class="upload-zone" style="padding:1.5rem 1rem;">
          <div style="font-size:1.75rem;margin-bottom:.5rem;">📄</div>
          <p style="font-size:.85rem;color:#6B7280;">Drop or click</p>
          <input id="cmp-input2" type="file" accept=".pdf,application/pdf" style="display:none;" />
        </div>
        <p id="cmp-name2" style="font-size:.85rem;color:#7B3FF2;margin-top:.5rem;min-height:20px;"></p>
      </div>
    </div>
    <button id="cmp-btn" class="btn-primary" data-label="🔁 Compare PDFs">🔁 Compare PDFs</button>
    <div id="cmp-error" class="error-box"></div>
    <div id="cmp-result" class="result-box" style="max-height:500px;overflow-y:auto;"></div>`;
  }

  setupEvents() {
    const setupZone = (zoneId, inputId, num) => {
      const zone = document.getElementById(zoneId);
      const input = document.getElementById(inputId);
      zone.onclick = () => input.click();
      zone.ondragover = e => { e.preventDefault(); zone.classList.add('drag-over'); };
      zone.ondragleave = () => zone.classList.remove('drag-over');
      zone.ondrop = e => { e.preventDefault(); zone.classList.remove('drag-over'); if(e.dataTransfer.files[0]) this.setFile(e.dataTransfer.files[0],num); };
      input.onchange = () => { if(input.files[0]) this.setFile(input.files[0],num); };
    };
    setupZone('cmp-zone1','cmp-input1',1);
    setupZone('cmp-zone2','cmp-input2',2);
    document.getElementById('cmp-btn').onclick = () => this.compare();
  }

  setFile(f, num) {
    if (!f || (!f.name.endsWith('.pdf') && f.type !== 'application/pdf')) { showErr('cmp-error','Please select PDF files.'); return; }
    clearErr('cmp-error');
    if (num===1) { this.file1=f; document.getElementById('cmp-name1').textContent='✓ '+f.name; }
    else { this.file2=f; document.getElementById('cmp-name2').textContent='✓ '+f.name; }
  }

  async extractText(file) {
    await loadScript(PDFJS_URL);
    const pdfjsLib = window['pdfjs-dist/build/pdf'] || window.pdfjsLib;
    if (pdfjsLib && pdfjsLib.GlobalWorkerOptions) pdfjsLib.GlobalWorkerOptions.workerSrc = '';
    const buf = await file.arrayBuffer();
    const pdf = await pdfjsLib.getDocument({ data: new Uint8Array(buf), useWorkerFetch: false, isEvalSupported: false, useSystemFonts: true }).promise;
    let text = '';
    for (let i=1; i<=pdf.numPages; i++) {
      const page = await pdf.getPage(i);
      const content = await page.getTextContent();
      text += content.items.map(item => item.str).join(' ') + '\n';
    }
    return text;
  }

  async compare() {
    if (!this.file1 || !this.file2) { showErr('cmp-error','Please select both PDF files.'); return; }
    setBtn('cmp-btn', true); clearErr('cmp-error');
    try {
      const [text1, text2] = await Promise.all([this.extractText(this.file1), this.extractText(this.file2)]);
      const lines1 = text1.split('\n').filter(l=>l.trim());
      const lines2 = text2.split('\n').filter(l=>l.trim());
      const maxLen = Math.max(lines1.length, lines2.length);
      let same=0, diff=0;
      const rows = [];
      for (let i=0; i<maxLen; i++) {
        const l1 = lines1[i]||'';
        const l2 = lines2[i]||'';
        const match = l1.trim() === l2.trim();
        if (match) same++; else diff++;
        rows.push(`<tr style="background:${match?'white':'#FEF2F2'}">
          <td style="padding:.5rem .75rem;border:1px solid #E5E7EB;font-size:.8rem;vertical-align:top;max-width:300px;word-break:break-word;">${l1||'<em style="color:#9CA3AF">(empty)</em>'}</td>
          <td style="padding:.5rem;text-align:center;border:1px solid #E5E7EB;font-size:.9rem;">${match?'✓':'≠'}</td>
          <td style="padding:.5rem .75rem;border:1px solid #E5E7EB;font-size:.8rem;vertical-align:top;max-width:300px;word-break:break-word;">${l2||'<em style="color:#9CA3AF">(empty)</em>'}</td>
        </tr>`);
      }
      showResult('cmp-result',`
        <div style="display:flex;gap:1rem;margin-bottom:1rem;flex-wrap:wrap;">
          <div style="background:#DCFCE7;border-radius:8px;padding:.5rem 1rem;font-size:.85rem;font-weight:600;color:#166534;">✓ ${same} matching lines</div>
          <div style="background:#FEE2E2;border-radius:8px;padding:.5rem 1rem;font-size:.85rem;font-weight:600;color:#991B1B;">≠ ${diff} different lines</div>
        </div>
        <table style="width:100%;border-collapse:collapse;">
          <thead><tr>
            <th style="padding:.5rem .75rem;background:#F9FAFB;border:1px solid #E5E7EB;text-align:left;font-size:.8rem;">${this.file1.name}</th>
            <th style="padding:.5rem;background:#F9FAFB;border:1px solid #E5E7EB;width:40px;"></th>
            <th style="padding:.5rem .75rem;background:#F9FAFB;border:1px solid #E5E7EB;text-align:left;font-size:.8rem;">${this.file2.name}</th>
          </tr></thead>
          <tbody>${rows.join('')}</tbody>
        </table>`);
    } catch(e) { showErr('cmp-error','Comparison failed: ' + e.message); }
    finally { setBtn('cmp-btn', false, '🔁 Compare PDFs'); }
  }
}
