import { loadScript, generateFilename, downloadBlob, setBtn, showErr, clearErr, showResult, setupDropZone, trustBar, toolHeader } from '../utils/helpers.js';
const XLSX_URL = 'https://cdn.jsdelivr.net/npm/xlsx@0.18.5/dist/xlsx.full.min.js';
const PDFLIB = 'https://cdn.jsdelivr.net/npm/pdf-lib@1.17.1/dist/pdf-lib.min.js';

export class ExcelToPdfTool {
  constructor() { this.file = null; }

  render() {
    return `
    ${toolHeader('📈','Excel to PDF','Convert Excel spreadsheets (XLSX/CSV) to PDF documents.')}
    ${trustBar()}
    <div id="e2p-zone" class="upload-zone" style="margin-bottom:1.5rem;">
      <div style="font-size:2.5rem;margin-bottom:.75rem;">📊</div>
      <p style="font-weight:600;color:#1A1530;margin-bottom:.25rem;">Drop an Excel or CSV file</p>
      <p style="font-size:.875rem;color:#6B7280;">Supports .xlsx, .xls, .csv</p>
      <input id="e2p-input" type="file" accept=".xlsx,.xls,.csv,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet,text/csv" style="display:none;" />
    </div>
    <button id="e2p-btn" class="btn-primary" data-label="📈 Convert to PDF" style="display:none;">📈 Convert to PDF</button>
    <div id="e2p-error" class="error-box"></div>
    <div id="e2p-result" class="result-box"></div>`;
  }

  setupEvents() {
    setupDropZone('e2p-zone','e2p-input', files => this.loadFile(files[0]));
  }

  loadFile(f) {
    if (!f) { showErr('e2p-error','Please select a file.'); return; }
    if (f.size === 0) { showErr('e2p-error','File is empty.'); return; }
    clearErr('e2p-error');
    this.file = f;
    const btn = document.getElementById('e2p-btn');
    btn.style.display = 'inline-flex';
    btn.onclick = () => this.convert();
  }

  async convert() {
    if (!this.file) return;
    setBtn('e2p-btn', true); clearErr('e2p-error');
    try {
      await Promise.all([loadScript(XLSX_URL), loadScript(PDFLIB)]);
      const buf = await this.file.arrayBuffer();
      const wb = window.XLSX.read(buf, { type: 'array' });
      const sheetName = wb.SheetNames[0];
      const sheet = wb.Sheets[sheetName];
      const data = window.XLSX.utils.sheet_to_json(sheet, { header: 1 });

      const { PDFDocument, StandardFonts, rgb } = window.PDFLib;
      const doc = await PDFDocument.create();
      const font = await doc.embedFont(StandardFonts.Helvetica);
      const boldFont = await doc.embedFont(StandardFonts.HelveticaBold);

      const pageW = 842, pageH = 595, margin = 40, rowH = 20, colW = 120, fontSize = 9;
      let page = doc.addPage([pageW, pageH]);
      let y = pageH - margin;
      const maxCols = Math.min(Math.floor((pageW - margin*2) / colW), data[0]?.length || 1);

      for (let ri=0; ri<data.length; ri++) {
        if (y < margin + rowH) { page = doc.addPage([pageW, pageH]); y = pageH - margin; }
        const row = data[ri] || [];
        const isHeader = ri === 0;
        if (isHeader) { page.drawRectangle({ x:margin, y:y-rowH+4, width:pageW-margin*2, height:rowH, color:rgb(0.48,0.25,0.95) }); }
        for (let ci=0; ci<maxCols; ci++) {
          const text = String(row[ci]||'').slice(0,18);
          page.drawText(text, { x: margin + ci*colW + 4, y: y-rowH+8, size: fontSize, font: isHeader?boldFont:font, color: isHeader?rgb(1,1,1):rgb(0,0,0) });
        }
        y -= rowH;
      }

      const bytes = await doc.save();
      const fname = generateFilename(this.file.name.replace(/\.[^.]+$/,''), 'pdf');
      downloadBlob(new Blob([bytes],{type:'application/pdf'}), fname);
      showResult('e2p-result',`<p style="font-weight:700;color:#166534;">✅ Converted ${data.length} rows from sheet "${sheetName}"!</p><p style="font-size:.875rem;color:#166534;margin-top:.25rem;">Downloaded: <strong>${fname}</strong></p>`);
    } catch(e) { showErr('e2p-error','Conversion failed: ' + e.message); }
    finally { setBtn('e2p-btn', false, '📈 Convert to PDF'); }
  }
}
