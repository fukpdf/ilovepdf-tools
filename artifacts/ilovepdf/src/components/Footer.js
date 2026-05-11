export class Footer {
  render() {
    return `
    <footer>
      <div class="container">
        <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(180px,1fr));gap:2.5rem;margin-bottom:3rem;">
          <div>
            <div style="display:flex;align-items:center;gap:.5rem;margin-bottom:1rem;">
              <span style="font-size:1.25rem;">📄</span>
              <span style="font-size:1.1rem;font-weight:800;background:linear-gradient(135deg,#9B6BF5,#C4A2F7);-webkit-background-clip:text;-webkit-text-fill-color:transparent;">ILovePDF</span>
            </div>
            <p style="font-size:.85rem;line-height:1.6;color:#9CA3AF;">Free browser-based PDF tools. No uploads. No servers. 100% private processing.</p>
          </div>

          <div>
            <h4 style="font-weight:700;color:white;margin-bottom:1rem;font-size:.9rem;text-transform:uppercase;letter-spacing:.05em;">PDF Tools</h4>
            <ul style="list-style:none;display:flex;flex-direction:column;gap:.6rem;">
              ${[['Merge PDF','merge-pdf'],['Split PDF','split-pdf'],['Compress PDF','compress-pdf'],['Rotate PDF','rotate-pdf'],['Organize PDF','organize-pdf'],['Edit PDF','edit-pdf']].map(([n,s])=>`<li><a href="#${s}" style="color:#9CA3AF;text-decoration:none;font-size:.875rem;" onmouseover="this.style.color='#C4B5FD'" onmouseout="this.style.color='#9CA3AF'">${n}</a></li>`).join('')}
            </ul>
          </div>

          <div>
            <h4 style="font-weight:700;color:white;margin-bottom:1rem;font-size:.9rem;text-transform:uppercase;letter-spacing:.05em;">Convert</h4>
            <ul style="list-style:none;display:flex;flex-direction:column;gap:.6rem;">
              ${[['PDF to Word','pdf-to-word'],['PDF to JPG','pdf-to-jpg'],['Word to PDF','word-to-pdf'],['JPG to PDF','jpg-to-pdf'],['PDF to Excel','pdf-to-excel'],['HTML to PDF','html-to-pdf']].map(([n,s])=>`<li><a href="#${s}" style="color:#9CA3AF;text-decoration:none;font-size:.875rem;" onmouseover="this.style.color='#C4B5FD'" onmouseout="this.style.color='#9CA3AF'">${n}</a></li>`).join('')}
            </ul>
          </div>

          <div>
            <h4 style="font-weight:700;color:white;margin-bottom:1rem;font-size:.9rem;text-transform:uppercase;letter-spacing:.05em;">Security</h4>
            <ul style="list-style:none;display:flex;flex-direction:column;gap:.6rem;">
              ${[['Protect PDF','protect-pdf'],['Unlock PDF','unlock-pdf'],['Watermark PDF','watermark-pdf'],['Sign PDF','sign-pdf'],['Redact PDF','redact-pdf']].map(([n,s])=>`<li><a href="#${s}" style="color:#9CA3AF;text-decoration:none;font-size:.875rem;" onmouseover="this.style.color='#C4B5FD'" onmouseout="this.style.color='#9CA3AF'">${n}</a></li>`).join('')}
            </ul>
          </div>

          <div>
            <h4 style="font-weight:700;color:white;margin-bottom:1rem;font-size:.9rem;text-transform:uppercase;letter-spacing:.05em;">Company</h4>
            <ul style="list-style:none;display:flex;flex-direction:column;gap:.6rem;">
              ${[['About Us','about'],['Privacy Policy','privacy'],['Terms of Service','terms'],['Disclaimer','disclaimer'],['Cookie Policy','cookies'],['Contact','contact'],['Donate','donate']].map(([n,s])=>`<li><a href="#${s}" style="color:#9CA3AF;text-decoration:none;font-size:.875rem;" onmouseover="this.style.color='#C4B5FD'" onmouseout="this.style.color='#9CA3AF'">${n}</a></li>`).join('')}
            </ul>
          </div>
        </div>

        <div style="border-top:1px solid #374151;padding-top:1.5rem;display:flex;align-items:center;justify-content:space-between;flex-wrap:wrap;gap:1rem;">
          <p style="font-size:.8rem;color:#6B7280;">© ${new Date().getFullYear()} ILovePDF. All rights reserved. This site is an independent tool and is not affiliated with ilovepdf.com.</p>
          <p style="font-size:.8rem;color:#6B7280;">🔒 All processing happens in your browser</p>
        </div>
      </div>
    </footer>`;
  }
}
