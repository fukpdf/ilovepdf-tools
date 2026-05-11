export class CookiePage {
  render() {
    return `
    <div style="max-width:800px;margin:0 auto;padding:2rem 0;">
      <h1 style="font-size:2.25rem;font-weight:800;color:#1A1530;margin-bottom:.5rem;">Cookie Policy</h1>
      <p style="color:#9CA3AF;font-size:.9rem;margin-bottom:2rem;">Last updated: ${new Date().toLocaleDateString('en-US',{year:'numeric',month:'long',day:'numeric'})}</p>

      <div style="background:#F0FDF4;border:1px solid #BBF7D0;border-radius:12px;padding:1.5rem;margin-bottom:2rem;">
        <p style="color:#166534;line-height:1.6;">We use minimal browser storage and cookies. We do <strong>not</strong> use advertising cookies, cross-site tracking cookies, or any cookies that identify you personally.</p>
      </div>

      <div style="margin-bottom:2rem;">
        <h2 style="font-size:1.1rem;font-weight:700;color:#1A1530;margin-bottom:1rem;">What We Store</h2>
        <div style="overflow-x:auto;">
          <table style="width:100%;border-collapse:collapse;font-size:.875rem;">
            <thead>
              <tr style="background:#F9FAFB;">
                <th style="padding:.75rem;text-align:left;border:1px solid #E5E7EB;">Name</th>
                <th style="padding:.75rem;text-align:left;border:1px solid #E5E7EB;">Type</th>
                <th style="padding:.75rem;text-align:left;border:1px solid #E5E7EB;">Purpose</th>
                <th style="padding:.75rem;text-align:left;border:1px solid #E5E7EB;">Expires</th>
              </tr>
            </thead>
            <tbody>
              ${[
                ['cookie-consent','localStorage','Stores your cookie preference','Permanent'],
                ['terms-accepted','sessionStorage','Tracks if you\'ve accepted terms this session','Session'],
                ['Analytics cookies','Cookie (optional)','Anonymous usage analytics','30 days'],
              ].map(([name,type,purpose,exp])=>`
                <tr>
                  <td style="padding:.75rem;border:1px solid #E5E7EB;font-family:monospace;font-size:.8rem;color:#7B3FF2;">${name}</td>
                  <td style="padding:.75rem;border:1px solid #E5E7EB;">${type}</td>
                  <td style="padding:.75rem;border:1px solid #E5E7EB;">${purpose}</td>
                  <td style="padding:.75rem;border:1px solid #E5E7EB;color:#6B7280;">${exp}</td>
                </tr>`).join('')}
            </tbody>
          </table>
        </div>
      </div>

      <div style="margin-bottom:2rem;">
        <h2 style="font-size:1.1rem;font-weight:700;color:#1A1530;margin-bottom:.75rem;">Your Choices</h2>
        <p style="color:#374151;line-height:1.7;margin-bottom:1rem;">You can clear all stored data at any time by clearing your browser's localStorage and cookies for this site. You can also change your cookie preference using the button below.</p>
        <div style="display:flex;gap:.75rem;flex-wrap:wrap;">
          <button onclick="localStorage.removeItem('cookie-consent');alert('Cookie preference cleared. The banner will reappear.')" style="background:#F3F4F6;border:1px solid #E5E7EB;border-radius:8px;padding:.75rem 1.5rem;cursor:pointer;font-family:'Plus Jakarta Sans',sans-serif;font-weight:600;min-height:44px;">Reset Cookie Preference</button>
          <button onclick="localStorage.clear();sessionStorage.clear();alert('All stored data cleared!')" style="background:#FEF2F2;border:1px solid #FECACA;border-radius:8px;padding:.75rem 1.5rem;cursor:pointer;font-family:'Plus Jakarta Sans',sans-serif;font-weight:600;color:#DC2626;min-height:44px;">Clear All Data</button>
        </div>
      </div>

      <div>
        <h2 style="font-size:1.1rem;font-weight:700;color:#1A1530;margin-bottom:.75rem;">Third-Party Cookies</h2>
        <p style="color:#374151;line-height:1.7;">CDN providers (jsdelivr.net) used to serve JavaScript libraries may set their own cookies or log requests. Please refer to their respective privacy policies for details.</p>
      </div>
    </div>`;
  }
}
