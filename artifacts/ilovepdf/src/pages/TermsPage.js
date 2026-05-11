export class TermsPage {
  render() {
    return `
    <div style="max-width:800px;margin:0 auto;padding:2rem 0;">
      <h1 style="font-size:2.25rem;font-weight:800;color:#1A1530;margin-bottom:.5rem;">Terms of Service</h1>
      <p style="color:#9CA3AF;font-size:.9rem;margin-bottom:2rem;">Last updated: ${new Date().toLocaleDateString('en-US',{year:'numeric',month:'long',day:'numeric'})}</p>

      <div style="background:#EDE9FE;border:1px solid #C4B5FD;border-radius:12px;padding:1.5rem;margin-bottom:2rem;">
        <p style="color:#5B21B6;font-size:.95rem;line-height:1.6;">By using ILovePDF, you agree to these terms. If you disagree, please discontinue use.</p>
      </div>

      ${[
        ['1. Service Description','ILovePDF provides browser-based PDF and image processing tools. All processing occurs on your local device. The service is provided "as is" without warranty of any kind.'],
        ['2. Acceptable Use','You may use ILovePDF for lawful purposes only. You must not use the service to process files containing illegal content, malware, or materials that infringe third-party rights. You are solely responsible for the files you process.'],
        ['3. Intellectual Property','The ILovePDF platform and its source code are proprietary. You may not copy, modify, distribute, or create derivative works of the platform without written permission. This service is independent and not affiliated with ilovepdf.com.'],
        ['4. Disclaimer of Warranties','THE SERVICE IS PROVIDED "AS IS" WITHOUT WARRANTY OF ANY KIND. WE DO NOT GUARANTEE THAT THE SERVICE WILL BE UNINTERRUPTED, ERROR-FREE, OR THAT FILES WILL BE PROCESSED WITHOUT LOSS. USE AT YOUR OWN RISK. ALWAYS KEEP BACKUPS OF IMPORTANT FILES.'],
        ['5. Limitation of Liability','TO THE MAXIMUM EXTENT PERMITTED BY LAW, WE SHALL NOT BE LIABLE FOR ANY INDIRECT, INCIDENTAL, SPECIAL, OR CONSEQUENTIAL DAMAGES ARISING FROM YOUR USE OF THE SERVICE, INCLUDING LOSS OF DATA, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGES.'],
        ['6. Third-Party Libraries','The service uses open-source libraries (pdf-lib, pdfjs-dist, Tesseract.js, etc.) subject to their respective licenses. We make no warranty regarding these third-party components.'],
        ['7. Indemnification','You agree to indemnify and hold ILovePDF harmless from claims, damages, or expenses arising from your use of the service or violation of these terms.'],
        ['8. Governing Law','These terms are governed by applicable law. Disputes shall be resolved through good-faith negotiation before pursuing other remedies.'],
        ['9. Changes to Terms','We reserve the right to modify these terms. Continued use of the service after changes constitutes acceptance of the modified terms.'],
      ].map(([title, content])=>`
        <div style="margin-bottom:1.75rem;">
          <h2 style="font-size:1.05rem;font-weight:700;color:#1A1530;margin-bottom:.6rem;">${title}</h2>
          <p style="color:#374151;line-height:1.7;font-size:.9rem;">${content}</p>
        </div>`).join('')}
    </div>`;
  }
}
