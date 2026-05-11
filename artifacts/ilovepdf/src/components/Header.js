export class Header {
  render() {
    return `
    <header>
      <div class="container" style="height:100%;display:flex;align-items:center;justify-content:space-between;gap:1rem;">
        <a href="#" style="text-decoration:none;display:flex;align-items:center;gap:.5rem;flex-shrink:0;">
          <span style="font-size:1.5rem;">📄</span>
          <span style="font-size:1.25rem;font-weight:800;background:linear-gradient(135deg,#7B3FF2,#9B6BF5);-webkit-background-clip:text;-webkit-text-fill-color:transparent;">ILovePDF</span>
        </a>

        <div id="search-container" style="flex:1;max-width:400px;position:relative;display:flex;align-items:center;">
          <span style="position:absolute;left:.75rem;font-size:1rem;color:#9CA3AF;">🔍</span>
          <input id="search-input" type="search" placeholder="Search tools..." style="width:100%;border:1px solid #E5E7EB;border-radius:20px;padding:.5rem 1rem .5rem 2.25rem;font-family:'Plus Jakarta Sans',sans-serif;font-size:.9rem;outline:none;transition:border-color .2s;background:#F9FAFB;" onfocus="this.style.borderColor='#7B3FF2'" onblur="this.style.borderColor='#E5E7EB'" />
          <div id="search-results" style="position:absolute;top:calc(100% + 8px);left:0;right:0;background:white;border:1px solid #E5E7EB;border-radius:12px;box-shadow:0 8px 30px rgba(0,0,0,.12);display:none;z-index:200;max-height:320px;overflow-y:auto;"></div>
        </div>

        <div style="display:flex;align-items:center;gap:.75rem;flex-shrink:0;">
          <a href="#donate" style="background:linear-gradient(135deg,#F59E0B,#EF4444);color:white;text-decoration:none;border-radius:20px;padding:.45rem 1.1rem;font-weight:600;font-size:.875rem;display:flex;align-items:center;gap:.35rem;min-height:44px;white-space:nowrap;">❤️ Donate</a>
          <button id="mobile-menu-btn" style="display:none;background:none;border:none;cursor:pointer;font-size:1.5rem;min-width:44px;min-height:44px;" aria-label="Menu">☰</button>
        </div>
      </div>
    </header>
    `;
  }

  setupEvents() {
    const input = document.getElementById('search-input');
    const results = document.getElementById('search-results');
    if (!input || !results) return;

    const allTools = [
      {slug:'merge-pdf',name:'Merge PDF',icon:'🔗',desc:'Combine multiple PDFs into one'},
      {slug:'split-pdf',name:'Split PDF',icon:'✂️',desc:'Extract pages from a PDF'},
      {slug:'compress-pdf',name:'Compress PDF',icon:'📦',desc:'Reduce PDF file size'},
      {slug:'rotate-pdf',name:'Rotate PDF',icon:'🔄',desc:'Rotate pages in a PDF'},
      {slug:'crop-pdf',name:'Crop PDF',icon:'🪟',desc:'Crop page margins'},
      {slug:'organize-pdf',name:'Organize PDF',icon:'📋',desc:'Reorder PDF pages'},
      {slug:'pdf-to-word',name:'PDF to Word',icon:'📝',desc:'Convert PDF to editable text'},
      {slug:'pdf-to-excel',name:'PDF to Excel',icon:'📊',desc:'Extract tables as CSV'},
      {slug:'pdf-to-jpg',name:'PDF to JPG',icon:'🖼️',desc:'Convert pages to images'},
      {slug:'word-to-pdf',name:'Word to PDF',icon:'📄',desc:'Convert DOCX to PDF'},
      {slug:'jpg-to-pdf',name:'JPG to PDF',icon:'📸',desc:'Convert images to PDF'},
      {slug:'html-to-pdf',name:'HTML to PDF',icon:'🌐',desc:'Convert HTML to PDF'},
      {slug:'pdf-to-ppt',name:'PDF to PPT',icon:'📊',desc:'Convert PDF to PPTX'},
      {slug:'excel-to-pdf',name:'Excel to PDF',icon:'📈',desc:'Convert XLSX to PDF'},
      {slug:'ppt-to-pdf',name:'PPT to PDF',icon:'📑',desc:'Convert PPTX to PDF'},
      {slug:'edit-pdf',name:'Edit PDF',icon:'✏️',desc:'Add text to PDF'},
      {slug:'watermark-pdf',name:'Watermark PDF',icon:'💧',desc:'Add watermark to PDF'},
      {slug:'sign-pdf',name:'Sign PDF',icon:'🖊️',desc:'Place signature on PDF'},
      {slug:'add-page-numbers',name:'Add Page Numbers',icon:'🔢',desc:'Number PDF pages'},
      {slug:'redact-pdf',name:'Redact PDF',icon:'⬛',desc:'Redact sensitive content'},
      {slug:'protect-pdf',name:'Protect PDF',icon:'🔐',desc:'Password protect PDF'},
      {slug:'unlock-pdf',name:'Unlock PDF',icon:'🔓',desc:'Remove PDF password'},
      {slug:'repair-pdf',name:'Repair PDF',icon:'🔧',desc:'Fix corrupted PDF'},
      {slug:'ocr-pdf',name:'OCR PDF',icon:'🔎',desc:'Extract text from scanned PDF'},
      {slug:'compare-pdf',name:'Compare PDF',icon:'🔁',desc:'Compare two PDFs'},
      {slug:'scan-pdf',name:'Scan to PDF',icon:'📷',desc:'Capture with camera'},
      {slug:'ai-summarize',name:'AI Summarize',icon:'🤖',desc:'Summarize PDF content'},
      {slug:'translate-pdf',name:'Translate PDF',icon:'🌍',desc:'Translate PDF text'},
      {slug:'background-remover',name:'Remove Background',icon:'🎨',desc:'Remove image background'},
      {slug:'crop-image',name:'Crop Image',icon:'✂️',desc:'Crop and trim images'},
      {slug:'resize-image',name:'Resize Image',icon:'📐',desc:'Change image dimensions'},
      {slug:'image-filters',name:'Image Filters',icon:'🎞️',desc:'Apply image filters'},
      {slug:'compress-image',name:'Compress Image',icon:'🗜️',desc:'Reduce image file size'},
      {slug:'number-to-words',name:'Number to Words',icon:'💬',desc:'Convert numbers to text'},
      {slug:'currency-converter',name:'Currency Converter',icon:'💱',desc:'Live currency conversion'},
      {slug:'workflow-builder',name:'Workflow Builder',icon:'⚙️',desc:'Chain PDF tools together'},
    ];

    let debounceTimer;
    input.addEventListener('input', () => {
      clearTimeout(debounceTimer);
      debounceTimer = setTimeout(() => {
        const q = input.value.trim().toLowerCase();
        if (!q) { results.style.display = 'none'; return; }
        const matches = allTools.filter(t => t.name.toLowerCase().includes(q) || t.desc.toLowerCase().includes(q)).slice(0, 8);
        if (!matches.length) { results.style.display = 'none'; return; }
        results.innerHTML = matches.map(t => `
          <a href="#${t.slug}" style="display:flex;align-items:center;gap:.75rem;padding:.75rem 1rem;text-decoration:none;color:#1A1530;border-bottom:1px solid #F3F4F6;" onmouseover="this.style.background='#F9FAFB'" onmouseout="this.style.background=''" onclick="document.getElementById('search-input').value='';document.getElementById('search-results').style.display='none';">
            <span style="font-size:1.25rem;">${t.icon}</span>
            <div><div style="font-weight:600;font-size:.9rem;">${t.name}</div><div style="font-size:.8rem;color:#6B7280;">${t.desc}</div></div>
          </a>`).join('');
        results.style.display = 'block';
      }, 200);
    });

    document.addEventListener('click', (e) => {
      if (!document.getElementById('search-container').contains(e.target)) {
        results.style.display = 'none';
      }
    });
  }
}
