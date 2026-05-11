import { loadScript, generateFilename, setBtn, showErr, clearErr, showResult, trustBar, toolHeader } from '../utils/helpers.js';
const HTML2PDF = 'https://cdn.jsdelivr.net/npm/html2pdf.js@0.10.1/dist/html2pdf.bundle.min.js';

export class HtmlToPdfTool {
  render() {
    return `
    ${toolHeader('🌐','HTML to PDF','Paste HTML content or a URL and convert it to a PDF document.')}
    ${trustBar()}
    <div style="margin-bottom:1.5rem;">
      <label style="font-weight:600;color:#1A1530;font-size:.9rem;display:block;margin-bottom:.5rem;">HTML Content</label>
      <textarea id="html-content" style="width:100%;height:200px;resize:vertical;font-family:monospace;font-size:.85rem;" placeholder="<h1>Hello World</h1><p>Your HTML content here...</p>"><h1 style="color:#7B3FF2;">Sample Document</h1><p>This is a sample HTML to PDF conversion. Replace this with your own HTML content.</p><ul><li>Item 1</li><li>Item 2</li><li>Item 3</li></ul></textarea>
    </div>
    <div style="margin-bottom:1.5rem;display:grid;grid-template-columns:1fr 1fr;gap:1rem;max-width:400px;">
      <div>
        <label style="font-weight:600;font-size:.9rem;color:#1A1530;display:block;margin-bottom:.4rem;">Page Size</label>
        <select id="html-pagesize" style="width:100%"><option value="a4">A4</option><option value="letter">Letter</option></select>
      </div>
      <div>
        <label style="font-weight:600;font-size:.9rem;color:#1A1530;display:block;margin-bottom:.4rem;">Orientation</label>
        <select id="html-orient" style="width:100%"><option value="portrait">Portrait</option><option value="landscape">Landscape</option></select>
      </div>
    </div>
    <button id="html-btn" class="btn-primary" data-label="🌐 Convert to PDF">🌐 Convert to PDF</button>
    <div id="html-error" class="error-box"></div>
    <div id="html-result" class="result-box"></div>`;
  }

  setupEvents() {
    document.getElementById('html-btn').onclick = () => this.convert();
  }

  async convert() {
    const html = document.getElementById('html-content').value.trim();
    if (!html) { showErr('html-error','Please enter some HTML content.'); return; }
    const pageSize = document.getElementById('html-pagesize').value;
    const orientation = document.getElementById('html-orient').value;
    setBtn('html-btn', true); clearErr('html-error');
    try {
      await loadScript(HTML2PDF);
      const container = document.createElement('div');
      container.innerHTML = html;
      container.style.cssText = 'font-family:sans-serif;padding:20px;';
      document.body.appendChild(container);
      const fname = generateFilename('html-document', 'pdf');
      await window.html2pdf().set({
        margin: 10,
        filename: fname,
        image: { type: 'jpeg', quality: 0.92 },
        html2canvas: { scale: 2, useCORS: true },
        jsPDF: { unit: 'mm', format: pageSize, orientation }
      }).from(container).save();
      document.body.removeChild(container);
      showResult('html-result',`<p style="font-weight:700;color:#166534;">✅ Converted and downloaded!</p><p style="font-size:.875rem;color:#166534;margin-top:.25rem;">File: <strong>${fname}</strong></p>`);
    } catch(e) { showErr('html-error','Conversion failed: ' + e.message); }
    finally { setBtn('html-btn', false, '🌐 Convert to PDF'); }
  }
}
