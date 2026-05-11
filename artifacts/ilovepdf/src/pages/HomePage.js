export class HomePage {
  render() {
    const tools = [
      {slug:'merge-pdf',icon:'🔗',name:'Merge PDF',desc:'Combine multiple PDFs',color:'#7B3FF2'},
      {slug:'split-pdf',icon:'✂️',name:'Split PDF',desc:'Extract pages or split by range',color:'#EF4444'},
      {slug:'compress-pdf',icon:'📦',name:'Compress PDF',desc:'Reduce file size',color:'#F59E0B'},
      {slug:'rotate-pdf',icon:'🔄',name:'Rotate PDF',desc:'Rotate pages freely',color:'#10B981'},
      {slug:'pdf-to-word',icon:'📝',name:'PDF to Word',desc:'Convert to editable document',color:'#3B82F6'},
      {slug:'pdf-to-excel',icon:'📊',name:'PDF to Excel',desc:'Extract tables to CSV',color:'#059669'},
      {slug:'pdf-to-jpg',icon:'🖼️',name:'PDF to JPG',desc:'Convert pages to images',color:'#F97316'},
      {slug:'jpg-to-pdf',icon:'📸',name:'JPG to PDF',desc:'Images to single PDF',color:'#8B5CF6'},
      {slug:'word-to-pdf',icon:'📄',name:'Word to PDF',desc:'Convert DOCX to PDF',color:'#2563EB'},
      {slug:'protect-pdf',icon:'🔐',name:'Protect PDF',desc:'Password protect your PDF',color:'#DC2626'},
      {slug:'unlock-pdf',icon:'🔓',name:'Unlock PDF',desc:'Remove PDF password',color:'#D97706'},
      {slug:'watermark-pdf',icon:'💧',name:'Watermark PDF',desc:'Add custom watermark',color:'#0EA5E9'},
      {slug:'sign-pdf',icon:'🖊️',name:'Sign PDF',desc:'Place signature on PDF',color:'#7C3AED'},
      {slug:'edit-pdf',icon:'✏️',name:'Edit PDF',desc:'Annotate and add text',color:'#BE185D'},
      {slug:'ocr-pdf',icon:'🔎',name:'OCR PDF',desc:'Extract text from scans',color:'#0D9488'},
      {slug:'compress-image',icon:'🗜️',name:'Compress Image',desc:'Reduce image file size',color:'#9333EA'},
      {slug:'resize-image',icon:'📐',name:'Resize Image',desc:'Change dimensions',color:'#1D4ED8'},
      {slug:'crop-image',icon:'✂️',name:'Crop Image',desc:'Crop and trim images',color:'#C2410C'},
      {slug:'image-filters',icon:'🎞️',name:'Image Filters',desc:'Brightness, contrast, saturation',color:'#B45309'},
      {slug:'background-remover',icon:'🎨',name:'Remove Background',desc:'Canvas-based BG removal',color:'#6D28D9'},
      {slug:'ai-summarize',icon:'🤖',name:'AI Summarize',desc:'Summarize PDF content',color:'#0F766E'},
      {slug:'translate-pdf',icon:'🌍',name:'Translate PDF',desc:'Translate extracted text',color:'#15803D'},
      {slug:'add-page-numbers',icon:'🔢',name:'Page Numbers',desc:'Add numbering to pages',color:'#7C2D12'},
      {slug:'redact-pdf',icon:'⬛',name:'Redact PDF',desc:'Hide sensitive content',color:'#1F2937'},
      {slug:'repair-pdf',icon:'🔧',name:'Repair PDF',desc:'Fix corrupted PDF files',color:'#92400E'},
      {slug:'scan-pdf',icon:'📷',name:'Scan to PDF',desc:'Camera capture to PDF',color:'#1E3A5F'},
      {slug:'compare-pdf',icon:'🔁',name:'Compare PDF',desc:'Diff two PDF documents',color:'#5B21B6'},
      {slug:'organize-pdf',icon:'📋',name:'Organize PDF',desc:'Reorder and remove pages',color:'#065F46'},
      {slug:'crop-pdf',icon:'🪟',name:'Crop PDF',desc:'Trim page margins',color:'#7E22CE'},
      {slug:'html-to-pdf',icon:'🌐',name:'HTML to PDF',desc:'Convert HTML content to PDF',color:'#1D4ED8'},
      {slug:'pdf-to-ppt',icon:'📊',name:'PDF to PPT',desc:'Extract to presentation',color:'#C2410C'},
      {slug:'excel-to-pdf',icon:'📈',name:'Excel to PDF',desc:'Convert spreadsheet to PDF',color:'#065F46'},
      {slug:'ppt-to-pdf',icon:'📑',name:'PPT to PDF',desc:'Convert slides to PDF',color:'#9D174D'},
      {slug:'currency-converter',icon:'💱',name:'Currency Converter',desc:'Live currency rates',color:'#0369A1'},
      {slug:'number-to-words',icon:'💬',name:'Number to Words',desc:'Convert numbers to text',color:'#7C3AED'},
      {slug:'workflow-builder',icon:'⚙️',name:'Workflow Builder',desc:'Chain multiple tools',color:'#374151'},
    ];

    let recentSection = '';
    try {
      const recentSlugs = JSON.parse(localStorage.getItem('recentTools') || '[]');
      const recentTools = recentSlugs.map(slug => tools.find(t => t.slug === slug)).filter(Boolean);
      if (recentTools.length) {
        recentSection = `
        <div class="container" style="padding-top:2rem;padding-bottom:0;">
          <h2 style="font-size:1.1rem;font-weight:700;color:#1A1530;margin-bottom:1rem;">🕐 Recently Used</h2>
          <div style="display:flex;gap:.75rem;flex-wrap:wrap;margin-bottom:.5rem;">
            ${recentTools.map(t => `
              <a href="#${t.slug}" style="display:inline-flex;align-items:center;gap:.5rem;background:white;border:1px solid #E5E7EB;border-radius:10px;padding:.5rem 1rem;text-decoration:none;color:#1A1530;font-size:.875rem;font-weight:600;transition:all .2s;white-space:nowrap;" onmouseover="this.style.borderColor='#7B3FF2';this.style.color='#7B3FF2'" onmouseout="this.style.borderColor='#E5E7EB';this.style.color='#1A1530'">
                <span>${t.icon}</span>${t.name}
              </a>`).join('')}
          </div>
        </div>`;
      }
    } catch (e) { /* localStorage might be unavailable */ }

    return `
    <div>
      <div style="text-align:center;padding:4rem 1rem 3rem;background:linear-gradient(180deg,#F3EEFF 0%,#fff 100%);">
        <div style="display:inline-flex;align-items:center;gap:.5rem;background:#EDE9FE;color:#7B3FF2;border-radius:20px;padding:.4rem 1rem;font-size:.85rem;font-weight:600;margin-bottom:1.5rem;">🔒 100% Browser-based • Zero uploads</div>
        <h1 style="font-size:clamp(2rem,5vw,3.5rem);font-weight:800;color:#1A1530;margin-bottom:1rem;line-height:1.15;">
          Every PDF Tool You Need.<br/>
          <span style="background:linear-gradient(135deg,#7B3FF2,#9B6BF5);-webkit-background-clip:text;-webkit-text-fill-color:transparent;">Free & Private.</span>
        </h1>
        <p style="font-size:1.1rem;color:#6B7280;max-width:540px;margin:0 auto 2rem;line-height:1.6;">Merge, split, compress, convert PDFs and images — all processed instantly in your browser. Your files never leave your device.</p>
        <div style="display:flex;align-items:center;justify-content:center;gap:1.5rem;flex-wrap:wrap;font-size:.9rem;color:#6B7280;">
          <span>⚡ Instant processing</span>
          <span>🔒 Files stay local</span>
          <span>🆓 Always free</span>
        </div>
      </div>

      ${recentSection}

      <div class="container" style="padding-top:2rem;">
        <h2 style="font-size:1.5rem;font-weight:700;color:#1A1530;margin-bottom:1.5rem;">All Tools <span style="font-size:1rem;font-weight:500;color:#6B7280;">(${tools.length})</span></h2>
        <div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(180px,1fr));gap:1rem;">
          ${tools.map(t => `
            <a href="#${t.slug}" class="tool-card" style="display:flex;flex-direction:column;gap:.75rem;">
              <div style="width:48px;height:48px;border-radius:12px;background:${t.color}15;display:flex;align-items:center;justify-content:center;font-size:1.5rem;">${t.icon}</div>
              <div>
                <div style="font-weight:700;font-size:.95rem;color:#1A1530;">${t.name}</div>
                <div style="font-size:.8rem;color:#6B7280;margin-top:.2rem;">${t.desc}</div>
              </div>
            </a>
          `).join('')}
        </div>

        <div style="margin-top:4rem;display:grid;grid-template-columns:repeat(auto-fit,minmax(160px,1fr));gap:1.5rem;text-align:center;padding:2.5rem;background:#F9FAFB;border-radius:20px;">
          <div><div style="font-size:2rem;font-weight:800;color:#7B3FF2;">${tools.length}+</div><div style="color:#6B7280;font-size:.9rem;">PDF Tools</div></div>
          <div><div style="font-size:2rem;font-weight:800;color:#7B3FF2;">100%</div><div style="color:#6B7280;font-size:.9rem;">Free Forever</div></div>
          <div><div style="font-size:2rem;font-weight:800;color:#7B3FF2;">0</div><div style="color:#6B7280;font-size:.9rem;">Files Uploaded</div></div>
          <div><div style="font-size:2rem;font-weight:800;color:#7B3FF2;">∞</div><div style="color:#6B7280;font-size:.9rem;">Uses Allowed</div></div>
        </div>
      </div>
    </div>`;
  }
}
