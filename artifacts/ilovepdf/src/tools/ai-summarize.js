import { loadScript, generateFilename, downloadBlob, setBtn, showErr, clearErr, showResult, setupDropZone, trustBar, toolHeader } from '../utils/helpers.js';
const PDFJS_URL = 'https://cdn.jsdelivr.net/npm/pdfjs-dist@3.11.174/build/pdf.min.js';

export class AiSummarizeTool {
  constructor() { this.file = null; }

  render() {
    return `
    ${toolHeader('🤖','AI Summarize','Extract and summarize PDF content using browser-based NLP analysis.')}
    ${trustBar()}
    <div id="sum-zone" class="upload-zone" style="margin-bottom:1.5rem;">
      <div style="font-size:2.5rem;margin-bottom:.75rem;">📄</div>
      <p style="font-weight:600;color:#1A1530;margin-bottom:.25rem;">Drop a PDF here</p>
      <p style="font-size:.875rem;color:#6B7280;">or click to browse</p>
      <input id="sum-input" type="file" accept=".pdf,application/pdf" style="display:none;" />
    </div>
    <div id="sum-options" style="display:none;margin-bottom:1.5rem;">
      <p id="sum-info" style="font-weight:600;color:#1A1530;margin-bottom:1rem;"></p>
      <label style="font-weight:600;font-size:.9rem;color:#1A1530;display:block;margin-bottom:.5rem;">Summary Length</label>
      <select id="sum-length" style="max-width:200px;">
        <option value="short">Short (3-5 points)</option>
        <option value="medium" selected>Medium (5-8 points)</option>
        <option value="long">Detailed (10+ points)</option>
      </select>
    </div>
    <button id="sum-btn" class="btn-primary" data-label="🤖 Summarize" style="display:none;">🤖 Summarize</button>
    <div id="sum-error" class="error-box"></div>
    <div id="sum-result" class="result-box"></div>`;
  }

  setupEvents() {
    setupDropZone('sum-zone','sum-input', files => this.loadFile(files[0]));
  }

  async loadFile(f) {
    if (!f || (!f.name.endsWith('.pdf') && f.type !== 'application/pdf')) { showErr('sum-error','Please select a PDF file.'); return; }
    if (f.size === 0) { showErr('sum-error','File is empty.'); return; }
    clearErr('sum-error');
    this.file = f;
    document.getElementById('sum-info').textContent = `📄 ${f.name} — ${(f.size/1024).toFixed(1)} KB`;
    document.getElementById('sum-options').style.display = 'block';
    const btn = document.getElementById('sum-btn');
    btn.style.display = 'inline-flex';
    btn.onclick = () => this.summarize();
  }

  summarizeText(text, length) {
    // Basic extractive summarization: split into sentences, score by word frequency
    const sentences = text.match(/[^.!?]+[.!?]+/g) || [text];
    const words = text.toLowerCase().split(/\W+/);
    const stopWords = new Set(['the','a','an','and','or','but','in','on','at','to','for','of','with','by','from','is','are','was','were','be','been','have','has','had','do','does','did','will','would','could','should','may','might']);
    const freq = {};
    words.forEach(w => { if(w.length>3 && !stopWords.has(w)) freq[w]=(freq[w]||0)+1; });
    const scored = sentences.map(s => {
      const score = s.toLowerCase().split(/\W+/).reduce((sum,w) => sum+(freq[w]||0), 0);
      return { s, score };
    });
    scored.sort((a,b)=>b.score-a.score);
    const numPoints = length==='short'?4:length==='long'?10:7;
    const top = scored.slice(0,numPoints).sort((a,b)=>sentences.indexOf(a.s)-sentences.indexOf(b.s));

    // Key statistics
    const wordCount = words.filter(w=>w.length>0).length;
    const pageEst = Math.ceil(wordCount/250);
    const topWords = Object.entries(freq).sort((a,b)=>b[1]-a[1]).slice(0,8).map(([w])=>w);

    return { points: top.map(t=>t.s.trim()), wordCount, pageEst, topWords };
  }

  async summarize() {
    if (!this.file) return;
    setBtn('sum-btn', true); clearErr('sum-error');
    try {
      await loadScript(PDFJS_URL);
      const pdfjsLib = window['pdfjs-dist/build/pdf'] || window.pdfjsLib;
      if (pdfjsLib && pdfjsLib.GlobalWorkerOptions) pdfjsLib.GlobalWorkerOptions.workerSrc = '';
      const buf = await this.file.arrayBuffer();
      const pdf = await pdfjsLib.getDocument({ data: new Uint8Array(buf), useWorkerFetch: false, isEvalSupported: false, useSystemFonts: true }).promise;
      let fullText = '';
      for (let i=1; i<=Math.min(pdf.numPages, 20); i++) {
        const page = await pdf.getPage(i);
        const content = await page.getTextContent();
        fullText += content.items.map(item => item.str).join(' ') + ' ';
      }
      if (!fullText.trim()) throw new Error('No text found. Use OCR for scanned PDFs.');
      const length = document.getElementById('sum-length').value;
      const { points, wordCount, pageEst, topWords } = this.summarizeText(fullText, length);
      const summary = `Summary of: ${this.file.name}\n\nKey Points:\n${points.map((p,i)=>`${i+1}. ${p}`).join('\n\n')}\n\nDocument Stats:\n- Words: ${wordCount}\n- Estimated pages: ${pageEst}\n- Key topics: ${topWords.join(', ')}`;
      downloadBlob(new Blob([summary],{type:'text/plain'}), generateFilename(this.file.name.replace(/\.pdf$/i,'')+'_summary','txt'));
      showResult('sum-result',`
        <p style="font-weight:700;color:#166534;margin-bottom:1rem;">✅ Summary Generated</p>
        <div style="background:white;border-radius:10px;padding:1.25rem;margin-bottom:1rem;">
          <h3 style="font-size:1rem;font-weight:700;color:#1A1530;margin-bottom:.75rem;">Key Points:</h3>
          <ol style="padding-left:1.25rem;display:flex;flex-direction:column;gap:.6rem;">
            ${points.map(p=>`<li style="font-size:.9rem;line-height:1.5;color:#374151;">${p}</li>`).join('')}
          </ol>
        </div>
        <div style="display:flex;flex-wrap:wrap;gap:.5rem;">
          <span style="background:#EDE9FE;color:#7B3FF2;padding:.25rem .75rem;border-radius:20px;font-size:.8rem;font-weight:600;">${wordCount} words</span>
          ${topWords.map(w=>`<span style="background:#F3F4F6;color:#6B7280;padding:.25rem .75rem;border-radius:20px;font-size:.8rem;">${w}</span>`).join('')}
        </div>
        <p style="font-size:.875rem;color:#166534;margin-top:1rem;">Summary downloaded as text file.</p>`);
    } catch(e) { showErr('sum-error','Summarization failed: ' + e.message); }
    finally { setBtn('sum-btn', false, '🤖 Summarize'); }
  }
}
