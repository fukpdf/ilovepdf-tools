export class AboutPage {
  render() {
    return `
    <div style="max-width:800px;margin:0 auto;padding:2rem 0;">
      <h1 style="font-size:2.25rem;font-weight:800;color:#1A1530;margin-bottom:1rem;">About ILovePDF</h1>
      <p style="color:#6B7280;font-size:1.1rem;line-height:1.7;margin-bottom:2rem;">
        ILovePDF is a free, browser-based PDF tools platform built with privacy as the first principle.
        Every operation — merging, splitting, compressing, converting — happens entirely in your browser.
        Your files never leave your device.
      </p>

      <div style="background:#F3EEFF;border-radius:16px;padding:2rem;margin-bottom:2rem;">
        <h2 style="font-size:1.25rem;font-weight:700;color:#1A1530;margin-bottom:1rem;">Our Philosophy</h2>
        <ul style="list-style:none;display:flex;flex-direction:column;gap:1rem;">
          ${[
            ['🔒','Privacy First','We process files entirely in your browser using JavaScript. No server uploads, no data retention, no tracking of your documents.'],
            ['🆓','Free Forever','All tools are free to use without limits. We believe essential productivity tools should be accessible to everyone.'],
            ['⚡','Fast & Local','Browser-based processing means instant results without upload delays. Your internet speed doesn\'t affect processing.'],
            ['🌐','Works Everywhere','No installation required. ILovePDF works on any modern browser on any device.']
          ].map(([icon,title,desc])=>`
            <li style="display:flex;gap:1rem;align-items:flex-start;">
              <span style="font-size:1.5rem;flex-shrink:0;">${icon}</span>
              <div><div style="font-weight:700;color:#1A1530;margin-bottom:.25rem;">${title}</div><div style="font-size:.9rem;color:#6B7280;line-height:1.5;">${desc}</div></div>
            </li>`).join('')}
        </ul>
      </div>

      <div style="margin-bottom:2rem;">
        <h2 style="font-size:1.25rem;font-weight:700;color:#1A1530;margin-bottom:1rem;">How We Compare</h2>
        <div style="overflow-x:auto;">
          <table style="width:100%;border-collapse:collapse;font-size:.9rem;">
            <thead>
              <tr style="background:#7B3FF2;color:white;">
                <th style="padding:.75rem 1rem;text-align:left;border-radius:8px 0 0 0;">Feature</th>
                <th style="padding:.75rem 1rem;text-align:center;">ILovePDF</th>
                <th style="padding:.75rem 1rem;text-align:center;">Other Online Tools</th>
                <th style="padding:.75rem 1rem;text-align:center;border-radius:0 8px 0 0;">Desktop Software</th>
              </tr>
            </thead>
            <tbody>
              ${[
                ['No file uploads required','✅','❌','✅'],
                ['Free to use','✅','Partial','Rarely'],
                ['No account needed','✅','Often required','Sometimes'],
                ['Works offline (PWA)','✅','❌','✅'],
                ['Instant processing','✅','Slow uploads','✅'],
                ['No file size limits','✅','Often limited','✅'],
                ['Mobile friendly','✅','Partial','❌'],
              ].map(([feat,...vals])=>`
                <tr style="border-bottom:1px solid #E5E7EB;">
                  <td style="padding:.75rem 1rem;font-weight:600;color:#1A1530;">${feat}</td>
                  ${vals.map(v=>`<td style="padding:.75rem 1rem;text-align:center;color:${v==='✅'?'#059669':v==='❌'?'#DC2626':'#9CA3AF'};">${v}</td>`).join('')}
                </tr>`).join('')}
            </tbody>
          </table>
        </div>
      </div>

      <div style="background:#1A1530;border-radius:16px;padding:2rem;color:white;text-align:center;">
        <h2 style="font-size:1.25rem;font-weight:700;margin-bottom:.75rem;">Support the Project</h2>
        <p style="color:#9CA3AF;margin-bottom:1.5rem;">If ILovePDF saves you time, consider supporting its development.</p>
        <a href="#donate" class="btn-primary" style="display:inline-flex;">❤️ Donate</a>
      </div>
    </div>`;
  }
}
