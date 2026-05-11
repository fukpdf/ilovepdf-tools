export class DonatePage {
  constructor() { this.selected = 5; }

  render() {
    return `
    <div style="max-width:600px;margin:0 auto;padding:2rem 0;text-align:center;">
      <div style="font-size:3rem;margin-bottom:1rem;">❤️</div>
      <h1 style="font-size:2.25rem;font-weight:800;color:#1A1530;margin-bottom:1rem;">Support ILovePDF</h1>
      <p style="color:#6B7280;font-size:1.05rem;line-height:1.6;margin-bottom:2rem;max-width:480px;margin-left:auto;margin-right:auto;">ILovePDF is free and will always be free. If it saves you time, consider buying us a coffee to keep it running and improving.</p>

      <div style="background:#F9FAFB;border:1px solid #E5E7EB;border-radius:20px;padding:2rem;margin-bottom:2rem;">
        <h2 style="font-size:1.1rem;font-weight:700;color:#1A1530;margin-bottom:1.25rem;">Choose an amount</h2>
        <div style="display:flex;gap:.75rem;justify-content:center;flex-wrap:wrap;margin-bottom:1.5rem;">
          ${[2,5,10,25,50].map(amt=>`
            <button class="donate-amt" data-amt="${amt}" onclick="window._donateSelect(${amt})" style="border:2px solid ${amt===5?'#7B3FF2':'#E5E7EB'};background:${amt===5?'#F3EEFF':'white'};color:${amt===5?'#7B3FF2':'#1A1530'};border-radius:12px;padding:.75rem 1.5rem;font-size:1.1rem;font-weight:700;cursor:pointer;min-width:80px;min-height:56px;font-family:'Plus Jakarta Sans',sans-serif;transition:all .2s;">
              $${amt}
            </button>`).join('')}
        </div>
        <div style="margin-bottom:1.5rem;">
          <label style="font-weight:600;font-size:.9rem;color:#6B7280;display:block;margin-bottom:.5rem;">Or enter custom amount:</label>
          <div style="display:flex;align-items:center;gap:.5rem;max-width:200px;margin:0 auto;">
            <span style="font-size:1.25rem;font-weight:700;color:#6B7280;">$</span>
            <input id="donate-custom" type="number" min="1" placeholder="Custom" oninput="window._donateCustom(this.value)" style="font-size:1.1rem;font-weight:700;text-align:center;" />
          </div>
        </div>

        <div style="border-top:1px solid #E5E7EB;padding-top:1.5rem;">
          <div id="donate-summary" style="font-size:1.5rem;font-weight:800;color:#1A1530;margin-bottom:1rem;">Donate $5</div>
          <button onclick="window._donateSubmit()" class="btn-primary" style="width:100%;justify-content:center;font-size:1.1rem;height:60px;">
            ❤️ Donate Now
          </button>
          <p style="font-size:.8rem;color:#9CA3AF;margin-top:.75rem;">Secure payment via Stripe. You'll be redirected to complete the payment.</p>
        </div>
      </div>

      <div style="display:grid;grid-template-columns:repeat(3,1fr);gap:1rem;margin-bottom:2rem;">
        ${[['$2','☕ Coffee','A small thank-you'],['$5','🍕 Pizza','Keeps us going'],['$25','🚀 Booster','Powers new features']].map(([amt,icon,desc])=>`
          <div style="background:#F9FAFB;border-radius:12px;padding:1rem;text-align:center;">
            <div style="font-size:1.5rem;margin-bottom:.4rem;">${icon}</div>
            <div style="font-weight:700;font-size:.9rem;color:#7B3FF2;">${amt}</div>
            <div style="font-size:.8rem;color:#6B7280;margin-top:.25rem;">${desc}</div>
          </div>`).join('')}
      </div>

      <div id="donate-thanks" style="display:none;background:#F0FDF4;border:1px solid #BBF7D0;border-radius:16px;padding:2rem;">
        <div style="font-size:3rem;margin-bottom:1rem;">🎉</div>
        <h3 style="font-weight:700;color:#166534;margin-bottom:.5rem;">Thank you so much!</h3>
        <p style="color:#166534;">Your support means the world to us and helps keep ILovePDF free for everyone.</p>
      </div>
    </div>`;
  }

  setupEvents() {
    window._donateSelect = (amt) => {
      this.selected = amt;
      document.querySelectorAll('.donate-amt').forEach(btn => {
        const isSelected = parseInt(btn.dataset.amt) === amt;
        btn.style.borderColor = isSelected?'#7B3FF2':'#E5E7EB';
        btn.style.background = isSelected?'#F3EEFF':'white';
        btn.style.color = isSelected?'#7B3FF2':'#1A1530';
      });
      document.getElementById('donate-summary').textContent = `Donate $${amt}`;
    };
    window._donateCustom = (val) => {
      if (val) { this.selected = parseFloat(val); document.getElementById('donate-summary').textContent = `Donate $${val}`; }
    };
    window._donateSubmit = () => {
      const thanks = document.getElementById('donate-thanks');
      thanks.style.display = 'block';
      thanks.scrollIntoView({ behavior: 'smooth' });
      alert(`Thank you for your $${this.selected} donation! Payment integration coming soon. Your support is deeply appreciated. ❤️`);
    };
  }
}
