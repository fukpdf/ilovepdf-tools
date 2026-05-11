export class DisclaimerPage {
  render() {
    return `
    <div style="max-width:800px;margin:0 auto;padding:2rem 0;">
      <h1 style="font-size:2.25rem;font-weight:800;color:#1A1530;margin-bottom:1.5rem;">Disclaimer</h1>

      <div style="background:#FEF3C7;border:1px solid #FCD34D;border-radius:12px;padding:1.5rem;margin-bottom:2rem;">
        <h2 style="font-weight:700;color:#92400E;margin-bottom:.75rem;">⚠️ Independence & Brand Notice</h2>
        <p style="color:#92400E;line-height:1.6;margin-bottom:.75rem;">This website is <strong>independently developed by Muhammad Safdar</strong> as a free, open, browser-based PDF tools platform.</p>
        <p style="color:#92400E;line-height:1.6;"><strong>ILovePDF (this site) is NOT affiliated, associated, authorized, endorsed by, or in any way officially connected with iLovePDF S.L., ilovepdf.com, or any of their subsidiaries or affiliates.</strong> The name "ILovePDF" is used descriptively to indicate the purpose of the service. All trademarks, logos, and brand names belong to their respective owners.</p>
      </div>

      ${[
        ['General Disclaimer','The information and tools provided on this website are for general informational and utility purposes only. While we strive to provide accurate and reliable PDF processing tools, we make no representations or warranties of any kind, express or implied, about the completeness, accuracy, reliability, suitability, or availability of the tools or the information contained on the website.'],
        ['No Professional Advice','Nothing on this site constitutes legal, financial, medical, or professional advice. Do not rely on this site for any decision that requires professional expertise.'],
        ['File Processing Accuracy','Browser-based PDF processing has inherent limitations. Complex PDF layouts, encrypted files, or corrupted documents may not process correctly. Always verify processed files and keep backups of originals. We are not responsible for data loss or file corruption.'],
        ['Third-Party APIs','Some tools use third-party APIs (MyMemory for translation, open.er-api.com for currency rates). We do not control these services and are not responsible for their availability, accuracy, or terms of use.'],
        ['Limitation of Liability','To the fullest extent permitted by applicable law, the developer (Muhammad Safdar) and ILovePDF disclaim all liability for any direct, indirect, incidental, special, consequential, or exemplary damages arising from the use of this service.'],
        ['External Links','This site may contain links to external websites. We have no control over the content or practices of those sites and accept no responsibility for them.'],
      ].map(([title, content])=>`
        <div style="margin-bottom:1.75rem;">
          <h2 style="font-size:1.05rem;font-weight:700;color:#1A1530;margin-bottom:.6rem;">${title}</h2>
          <p style="color:#374151;line-height:1.7;font-size:.9rem;">${content}</p>
        </div>`).join('')}
    </div>`;
  }
}
