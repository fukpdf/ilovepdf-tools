export class PrivacyPage {
  render() {
    return `
    <div style="max-width:800px;margin:0 auto;padding:2rem 0;">
      <h1 style="font-size:2.25rem;font-weight:800;color:#1A1530;margin-bottom:.5rem;">Privacy Policy</h1>
      <p style="color:#9CA3AF;font-size:.9rem;margin-bottom:2rem;">Last updated: ${new Date().toLocaleDateString('en-US',{year:'numeric',month:'long',day:'numeric'})}</p>

      <div style="background:#F0FDF4;border:1px solid #BBF7D0;border-radius:12px;padding:1.5rem;margin-bottom:2rem;">
        <h2 style="font-size:1.1rem;font-weight:700;color:#166534;margin-bottom:.75rem;">🔒 The Short Version</h2>
        <p style="color:#166534;font-size:.95rem;line-height:1.6;"><strong>Your files never leave your browser.</strong> All PDF processing, compression, conversion, and editing happens locally on your device using JavaScript. We do not upload, store, or transmit your files to any server.</p>
      </div>

      ${[
        ['1. File Processing','ILovePDF processes all files entirely within your web browser using client-side JavaScript libraries (pdf-lib, pdfjs-dist, Tesseract.js, etc.). Files are read from your device into browser memory, processed, and the result is made available for download — all without any network transmission of your file data. When you close the tab or navigate away, all processed data is automatically cleared from browser memory.'],
        ['2. Information We Collect','We may collect anonymous analytics data including: page views, tool usage counts (no file content), browser type, and general geographic region. This data is used solely to improve the service and is never associated with your identity or file content. We use localStorage to remember your preferences (cookie consent, theme) and sessionStorage for session state (terms acceptance).'],
        ['3. Cookies','We use minimal cookies and browser storage for: (1) storing your preference settings, (2) analytics (if you consent), and (3) session state. No advertising cookies. No cross-site tracking. You can opt out of analytics cookies when shown the consent banner.'],
        ['4. Third-Party Services','We load JavaScript libraries from CDN providers (jsdelivr.net) to enable PDF processing in your browser. These CDNs may log access requests (IP address, timestamp) in accordance with their own privacy policies. We use the MyMemory API (mymemory.translated.net) for the translate feature — text is transmitted to their servers. We use open.er-api.com for currency rates — no personal data is transmitted.'],
        ['5. Children\'s Privacy','ILovePDF is not directed to children under 13. We do not knowingly collect personal information from children.'],
        ['6. Changes','We may update this Privacy Policy. Changes will be noted with an updated "Last updated" date. Continued use after changes constitutes acceptance.'],
        ['7. Contact','For privacy questions, use our <a href="#contact" style="color:#7B3FF2;">Contact page</a>.'],
      ].map(([title, content])=>`
        <div style="margin-bottom:2rem;">
          <h2 style="font-size:1.1rem;font-weight:700;color:#1A1530;margin-bottom:.75rem;">${title}</h2>
          <p style="color:#374151;line-height:1.7;font-size:.95rem;">${content}</p>
        </div>`).join('')}
    </div>`;
  }
}
