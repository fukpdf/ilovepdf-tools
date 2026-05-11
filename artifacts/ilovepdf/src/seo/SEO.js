const TOOL_META = {
  'merge-pdf': { title:'Merge PDF Online Free | ILovePDF', desc:'Combine multiple PDF files into one document online. Free, fast, and 100% in your browser. No uploads required.' },
  'split-pdf': { title:'Split PDF Online Free | ILovePDF', desc:'Extract pages or split PDF files by page range. Browser-based processing — no file uploads needed.' },
  'compress-pdf': { title:'Compress PDF Online Free | ILovePDF', desc:'Reduce PDF file size online for free. Adjust quality and compression level. All processing in your browser.' },
  'rotate-pdf': { title:'Rotate PDF Online Free | ILovePDF', desc:'Rotate PDF pages by 90°, 180°, or 270°. Free online tool with no file size limits.' },
  'crop-pdf': { title:'Crop PDF Online Free | ILovePDF', desc:'Crop PDF page margins online. Specify crop values in points for precise trimming.' },
  'organize-pdf': { title:'Organize PDF Pages | ILovePDF', desc:'Reorder and delete PDF pages with drag-and-drop. Free browser-based PDF organizer.' },
  'pdf-to-word': { title:'PDF to Word Converter | ILovePDF', desc:'Convert PDF to editable Word text online. Extract text content from any PDF file.' },
  'pdf-to-excel': { title:'PDF to Excel Converter | ILovePDF', desc:'Convert PDF to CSV/Excel spreadsheet. Extract tables and data from PDF files.' },
  'pdf-to-jpg': { title:'PDF to JPG Converter | ILovePDF', desc:'Convert PDF pages to JPG images online. High-quality image export directly in your browser.' },
  'word-to-pdf': { title:'Word to PDF Converter | ILovePDF', desc:'Convert DOCX Word documents to PDF online. Free and fast conversion in your browser.' },
  'jpg-to-pdf': { title:'JPG to PDF Converter | ILovePDF', desc:'Convert JPG and other images to PDF online. Combine multiple images into one PDF.' },
  'html-to-pdf': { title:'HTML to PDF Converter | ILovePDF', desc:'Convert HTML content to PDF online. Paste HTML or content and download as PDF.' },
  'pdf-to-ppt': { title:'PDF to PowerPoint | ILovePDF', desc:'Convert PDF to presentation format online. Extract content and create slides from PDF.' },
  'excel-to-pdf': { title:'Excel to PDF Converter | ILovePDF', desc:'Convert Excel spreadsheets to PDF online. Supports XLSX, XLS, and CSV files.' },
  'ppt-to-pdf': { title:'PowerPoint to PDF | ILovePDF', desc:'Convert PPTX presentations to PDF online. Free browser-based conversion.' },
  'edit-pdf': { title:'Edit PDF Online Free | ILovePDF', desc:'Add text annotations to PDF files online. Edit PDFs directly in your browser.' },
  'watermark-pdf': { title:'Add Watermark to PDF | ILovePDF', desc:'Add text watermark to every PDF page online. Customize color, opacity, and rotation.' },
  'sign-pdf': { title:'Sign PDF Online Free | ILovePDF', desc:'Draw and place your signature on PDF files online. Free digital signature tool.' },
  'add-page-numbers': { title:'Add Page Numbers to PDF | ILovePDF', desc:'Add page numbering to PDF files online. Customize position, format, and start number.' },
  'redact-pdf': { title:'Redact PDF Online | ILovePDF', desc:'Redact and hide sensitive content in PDF files. Draw black boxes over any area.' },
  'protect-pdf': { title:'Protect PDF with Password | ILovePDF', desc:'Add password protection to PDF files online. Secure your PDF documents.' },
  'unlock-pdf': { title:'Unlock PDF Online Free | ILovePDF', desc:'Remove password from PDF files online. Unlock password-protected PDFs.' },
  'repair-pdf': { title:'Repair PDF Online | ILovePDF', desc:'Fix corrupted or damaged PDF files online. Rebuild PDF structure in your browser.' },
  'ocr-pdf': { title:'OCR PDF Online Free | ILovePDF', desc:'Extract text from scanned PDFs using OCR. Powered by Tesseract.js browser OCR engine.' },
  'compare-pdf': { title:'Compare PDF Files Online | ILovePDF', desc:'Compare two PDF documents side by side online. Find differences between PDF files.' },
  'scan-pdf': { title:'Scan Document to PDF | ILovePDF', desc:'Use your camera to scan documents and save as PDF. Mobile-friendly document scanner.' },
  'ai-summarize': { title:'AI PDF Summarizer | ILovePDF', desc:'Summarize PDF content using browser-based AI analysis. Extract key points from documents.' },
  'translate-pdf': { title:'Translate PDF Online | ILovePDF', desc:'Translate PDF text to other languages online. Free PDF translation tool.' },
  'background-remover': { title:'Remove Image Background | ILovePDF', desc:'Remove background from images online. Canvas-based background removal tool.' },
  'crop-image': { title:'Crop Image Online Free | ILovePDF', desc:'Crop and trim images online. Specify pixel dimensions for precise cropping.' },
  'resize-image': { title:'Resize Image Online Free | ILovePDF', desc:'Resize images online. Change dimensions while maintaining aspect ratio.' },
  'image-filters': { title:'Image Filters Online | ILovePDF', desc:'Apply brightness, contrast, saturation, and blur filters to images online.' },
  'compress-image': { title:'Compress Image Online | ILovePDF', desc:'Reduce image file size online. JPEG quality compression with canvas rendering.' },
  'number-to-words': { title:'Number to Words Converter | ILovePDF', desc:'Convert numbers to English words online. Convert any number to its word representation.' },
  'currency-converter': { title:'Currency Converter Online | ILovePDF', desc:'Convert currencies with live exchange rates. Free online currency conversion tool.' },
  'workflow-builder': { title:'PDF Workflow Builder | ILovePDF', desc:'Chain multiple PDF tools together in a workflow. Automate PDF processing steps.' },
  '': { title:'ILovePDF — Free Browser PDF Tools', desc:'Free online PDF tools. Merge, split, compress, convert PDFs — all processed in your browser. No uploads, 100% private.' },
  'about': { title:'About ILovePDF | Free Browser PDF Tools', desc:'Learn about ILovePDF — a free, privacy-first browser-based PDF tools platform.' },
  'privacy': { title:'Privacy Policy | ILovePDF', desc:'ILovePDF privacy policy. Learn how we protect your data and why we never upload your files.' },
  'terms': { title:'Terms of Service | ILovePDF', desc:'ILovePDF terms of service. Read our terms for using the free PDF tools platform.' },
  'contact': { title:'Contact ILovePDF | Support', desc:'Contact ILovePDF for support, bug reports, or feature requests.' },
  'donate': { title:'Donate to ILovePDF | Support Free PDF Tools', desc:'Support ILovePDF to keep PDF tools free for everyone.' },
};

export class SEO {
  static setPageMeta(slug) {
    const meta = TOOL_META[slug] || TOOL_META[''];
    document.title = meta.title;
    const setMeta = (name, content, prop=false) => {
      let el = document.querySelector(prop?`meta[property="${name}"]`:`meta[name="${name}"]`);
      if (!el) { el = document.createElement('meta'); if(prop) el.setAttribute('property',name); else el.setAttribute('name',name); document.head.appendChild(el); }
      el.setAttribute('content', content);
    };
    setMeta('description', meta.desc);
    setMeta('og:title', meta.title, true);
    setMeta('og:description', meta.desc, true);
    setMeta('twitter:title', meta.title);
    setMeta('twitter:description', meta.desc);
    // JSON-LD
    let ld = document.getElementById('ld-json');
    if (!ld) { ld = document.createElement('script'); ld.id='ld-json'; ld.type='application/ld+json'; document.head.appendChild(ld); }
    ld.textContent = JSON.stringify({
      '@context':'https://schema.org',
      '@type': slug && TOOL_META[slug] ? 'SoftwareApplication' : 'WebSite',
      'name': meta.title.split(' | ')[0],
      'description': meta.desc,
      'applicationCategory': 'Productivity',
      'operatingSystem': 'Web Browser',
      'offers': { '@type':'Offer', 'price':'0', 'priceCurrency':'USD' }
    });
  }
}
