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
        ['1. Service Description','ILovePDF provides browser-based PDF and image processing tools. All processing occurs on your local device using client-side JavaScript. The service is provided "as is" without warranty of any kind.'],
        ['2. User Responsibilities','You are solely responsible for the files you process. You must not use the service to process files containing illegal content, malware, or materials that infringe third-party rights. You agree not to attempt to reverse-engineer, exploit, or abuse the service infrastructure.'],
        ['3. Liability Limitations','ILovePDF makes no guarantee of compatibility for all file types, browsers, or devices. Some files may fail to process correctly due to encryption, corruption, or browser limitations. Failed conversions may result in partial or empty output. We are not liable for data loss or file corruption. Always keep backups of important files.'],
        ['4. Acceptable Use Policy','ILovePDF is for personal and commercial legal use only. Processing copyrighted material you do not have rights to, obscene content, or material designed to harm others is strictly prohibited. Abuse or illegal usage is prohibited and may be reported to relevant authorities.'],
        ['5. Disclaimer of Warranties','THE SERVICE IS PROVIDED "AS IS" WITHOUT WARRANTY OF ANY KIND. WE DO NOT GUARANTEE THAT THE SERVICE WILL BE UNINTERRUPTED OR ERROR-FREE. USE AT YOUR OWN RISK.'],
        ['6. Limitation of Liability','TO THE MAXIMUM EXTENT PERMITTED BY LAW, WE SHALL NOT BE LIABLE FOR ANY INDIRECT, INCIDENTAL, SPECIAL, OR CONSEQUENTIAL DAMAGES ARISING FROM YOUR USE OF THE SERVICE, INCLUDING LOSS OF DATA, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGES.'],
        ['7. Third-Party Libraries','The service uses open-source libraries (pdf-lib, pdfjs-dist, Tesseract.js, etc.) subject to their respective licenses. We make no warranty regarding these third-party components.'],
        ['8. Indemnification','You agree to indemnify and hold ILovePDF and its developer harmless from claims, damages, or expenses arising from your use of the service or violation of these terms.'],
        ['9. Governing Law','These terms are governed by applicable law. Disputes shall be resolved through good-faith negotiation before pursuing other remedies.'],
        ['10. Changes to Terms','We reserve the right to modify these terms. Continued use of the service after changes constitutes acceptance of the modified terms.'],
        ['11. Contact','For legal enquiries, contact us at <a href="mailto:legal@ilovepdf.cyou" style="color:#7B3FF2;">legal@ilovepdf.cyou</a>.'],
      ].map(([title, content])=>`
        <div style="margin-bottom:1.75rem;">
          <h2 style="font-size:1.05rem;font-weight:700;color:#1A1530;margin-bottom:.6rem;">${title}</h2>
          <p style="color:#374151;line-height:1.7;font-size:.9rem;">${content}</p>
        </div>`).join('')}
    </div>`;
  }
}
