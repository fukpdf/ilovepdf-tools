import { loadScript, generateFilename, downloadBlob, setBtn, showErr, clearErr, showResult, setupDropZone, trustBar, toolHeader } from '../utils/helpers.js';
const PDFJS_URL = 'https://cdn.jsdelivr.net/npm/pdfjs-dist@3.11.174/build/pdf.min.js';

export class TranslatePdfTool {
  constructor() { this.file = null; }

  render() {
    return `
    ${toolHeader('🌍','Translate PDF','Extract text from your PDF and translate it using the MyMemory free API.')}
    ${trustBar()}
    <div id="trans-zone" class="upload-zone" style="margin-bottom:1.5rem;">
      <div style="font-size:2.5rem;margin-bottom:.75rem;">📄</div>
      <p style="font-weight:600;color:#1A1530;margin-bottom:.25rem;">Drop a PDF here</p>
      <p style="font-size:.875rem;color:#6B7280;">or click to browse</p>
      <input id="trans-input" type="file" accept=".pdf,application/pdf" style="display:none;" />
    </div>
    <div id="trans-options" style="display:none;margin-bottom:1.5rem;">
      <p id="trans-info" style="font-weight:600;color:#1A1530;margin-bottom:1rem;"></p>
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:1rem;max-width:400px;">
        <div>
          <label style="font-weight:600;font-size:.9rem;color:#1A1530;display:block;margin-bottom:.4rem;">From Language</label>
          <select id="trans-from" style="width:100%">
            <option value="en">English</option><option value="fr">French</option><option value="de">German</option>
            <option value="es">Spanish</option><option value="it">Italian</option><option value="pt">Portuguese</option>
            <option value="ar">Arabic</option><option value="zh">Chinese</option><option value="ja">Japanese</option>
          </select>
        </div>
        <div>
          <label style="font-weight:600;font-size:.9rem;color:#1A1530;display:block;margin-bottom:.4rem;">To Language</label>
          <select id="trans-to" style="width:100%">
            <option value="fr">French</option><option value="en">English</option><option value="de">German</option>
            <option value="es">Spanish</option><option value="it">Italian</option><option value="pt">Portuguese</option>
            <option value="ar">Arabic</option><option value="zh">Chinese</option><option value="ja">Japanese</option>
          </select>
        </div>
      </div>
    </div>
    <button id="trans-btn" class="btn-primary" data-label="🌍 Translate" style="display:none;">🌍 Translate</button>
    <div id="trans-error" class="error-box"></div>
    <div id="trans-result" class="result-box"></div>`;
  }

  setupEvents() {
    setupDropZone('trans-zone','trans-input', files => this.loadFile(files[0]));
  }

  async loadFile(f) {
    if (!f || (!f.name.endsWith('.pdf') && f.type !== 'application/pdf')) { showErr('trans-error','Please select a PDF file.'); return; }
    if (f.size === 0) { showErr('trans-error','File is empty.'); return; }
    clearErr('trans-error');
    this.file = f;
    document.getElementById('trans-info').textContent = `📄 ${f.name}`;
    document.getElementById('trans-options').style.display = 'block';
    const btn = document.getElementById('trans-btn');
    btn.style.display = 'inline-flex';
    btn.onclick = () => this.translate();
  }

  async translate() {
    if (!this.file) return;
    const from = document.getElementById('trans-from').value;
    const to = document.getElementById('trans-to').value;
    if (from === to) { showErr('trans-error','Source and target language must be different.'); return; }
    setBtn('trans-btn', true); clearErr('trans-error');
    try {
      await loadScript(PDFJS_URL);
      const pdfjsLib = window['pdfjs-dist/build/pdf'] || window.pdfjsLib;
      if (pdfjsLib && pdfjsLib.GlobalWorkerOptions) pdfjsLib.GlobalWorkerOptions.workerSrc = '';
      const buf = await this.file.arrayBuffer();
      const pdf = await pdfjsLib.getDocument({ data: new Uint8Array(buf), useWorkerFetch: false, isEvalSupported: false, useSystemFonts: true }).promise;
      let text = '';
      for (let i=1; i<=Math.min(pdf.numPages, 5); i++) {
        const page = await pdf.getPage(i);
        const content = await page.getTextContent();
        text += content.items.map(item => item.str).join(' ') + '\n';
      }
      const chunk = text.slice(0, 800);
      const resp = await fetch(`https://api.mymemory.translated.net/get?q=${encodeURIComponent(chunk)}&langpair=${from}|${to}`);
      const data = await resp.json();
      const translated = data.responseData?.translatedText || 'Translation unavailable.';
      const fname = generateFilename(this.file.name.replace(/\.pdf$/i,'')+'_translated', 'txt');
      downloadBlob(new Blob([`Original:\n${chunk}\n\n---\n\nTranslated (${from}→${to}):\n${translated}`],{type:'text/plain'}), fname);
      showResult('trans-result',`
        <p style="font-weight:700;color:#166534;margin-bottom:.75rem;">✅ Translation complete!</p>
        <div style="background:white;border-radius:10px;padding:1rem;margin-bottom:.75rem;">
          <p style="font-size:.8rem;color:#9CA3AF;font-weight:600;margin-bottom:.5rem;">TRANSLATED (${from} → ${to}):</p>
          <p style="font-size:.9rem;line-height:1.6;color:#374151;">${translated}</p>
        </div>
        <p style="font-size:.8rem;color:#15803D;">Note: Free API limited to ~500 chars. Downloaded full result: <strong>${fname}</strong></p>`);
    } catch(e) { showErr('trans-error','Translation failed: ' + e.message + '. Check internet connection.'); }
    finally { setBtn('trans-btn', false, '🌍 Translate'); }
  }
}
