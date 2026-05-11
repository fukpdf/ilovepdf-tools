import { setBtn, showErr, clearErr, trustBar, toolHeader } from '../utils/helpers.js';

export class CurrencyConverterTool {
  constructor() { this.rates = null; }

  render() {
    return `
    ${toolHeader('💱','Currency Converter','Live currency conversion using open exchange rates API.')}
    ${trustBar()}
    <div style="max-width:480px;">
      <div style="background:#EDE9FE;border:1px solid #C4B5FD;border-radius:10px;padding:.75rem 1rem;margin-bottom:1.5rem;font-size:.85rem;color:#5B21B6;" id="cc-rate-status">
        ⏳ Loading live exchange rates...
      </div>
      <div style="display:grid;gap:1rem;margin-bottom:1.5rem;">
        <div>
          <label style="font-weight:600;color:#1A1530;font-size:.9rem;display:block;margin-bottom:.5rem;">Amount</label>
          <input id="cc-amount" type="number" value="1" min="0" step="any" placeholder="Amount to convert" oninput="window._ccConvert()" />
        </div>
        <div style="display:grid;grid-template-columns:1fr auto 1fr;gap:.75rem;align-items:center;">
          <div>
            <label style="font-weight:600;color:#1A1530;font-size:.9rem;display:block;margin-bottom:.5rem;">From</label>
            <select id="cc-from" onchange="window._ccConvert()" style="width:100%;"></select>
          </div>
          <button id="cc-swap" onclick="window._ccSwap()" style="background:#F3EEFF;border:1px solid #C4B5FD;border-radius:8px;padding:.5rem;cursor:pointer;font-size:1.25rem;min-width:44px;min-height:44px;margin-top:1.5rem;">⇄</button>
          <div>
            <label style="font-weight:600;color:#1A1530;font-size:.9rem;display:block;margin-bottom:.5rem;">To</label>
            <select id="cc-to" onchange="window._ccConvert()" style="width:100%;"></select>
          </div>
        </div>
      </div>
      <div id="cc-result-box" style="background:#F3EEFF;border:1px solid #C4B5FD;border-radius:16px;padding:1.5rem;text-align:center;display:none;">
        <div id="cc-result-main" style="font-size:2rem;font-weight:800;color:#7B3FF2;margin-bottom:.5rem;"></div>
        <div id="cc-result-rate" style="font-size:.9rem;color:#6B7280;"></div>
      </div>
      <div style="margin-top:1.5rem;">
        <h3 style="font-weight:600;color:#1A1530;font-size:.9rem;margin-bottom:.75rem;">Quick Conversions</h3>
        <div id="cc-multi" style="display:grid;gap:.5rem;"></div>
      </div>
    </div>
    <div id="cc-error" class="error-box"></div>`;
  }

  async setupEvents() {
    clearErr('cc-error');
    try {
      const resp = await fetch('https://open.er-api.com/v6/latest/USD');
      const data = await resp.json();
      if (!data.rates) throw new Error('Invalid response');
      this.rates = data.rates;
      const currencies = Object.keys(data.rates).sort();
      const from = document.getElementById('cc-from');
      const to = document.getElementById('cc-to');
      const common = ['USD','EUR','GBP','JPY','CAD','AUD','CHF','CNY','INR','MXN','BRL','KRW','SGD','HKD','SEK','NOK','DKK','NZD','ZAR','SAR'];
      const allOptions = [...common.filter(c=>currencies.includes(c)), '---', ...currencies.filter(c=>!common.includes(c))];
      const makeOpts = (sel) => {
        allOptions.forEach(c => {
          if (c==='---') { const o=document.createElement('option'); o.disabled=true; o.text='──────'; sel.add(o); }
          else { const o=new Option(`${c}`,c); sel.add(o); }
        });
      };
      makeOpts(from); makeOpts(to);
      from.value = 'USD'; to.value = 'EUR';
      document.getElementById('cc-rate-status').innerHTML = `✅ Live rates from open.er-api.com (base: USD, updated: ${new Date(data.time_last_update_utc).toLocaleDateString()})`;
      document.getElementById('cc-rate-status').style.background = '#F0FDF4';
      document.getElementById('cc-rate-status').style.borderColor = '#BBF7D0';
      document.getElementById('cc-rate-status').style.color = '#166534';
      window._ccConvert = () => this.convert();
      window._ccSwap = () => { const v=from.value; from.value=to.value; to.value=v; this.convert(); };
      this.convert();
    } catch(e) {
      document.getElementById('cc-rate-status').innerHTML = `⚠️ Could not load live rates. Check internet connection.`;
      document.getElementById('cc-rate-status').style.background = '#FEF2F2';
      document.getElementById('cc-rate-status').style.borderColor = '#FECACA';
      document.getElementById('cc-rate-status').style.color = '#991B1B';
    }
  }

  convert() {
    if (!this.rates) return;
    const amount = parseFloat(document.getElementById('cc-amount').value)||0;
    const from = document.getElementById('cc-from').value;
    const to = document.getElementById('cc-to').value;
    if (!from || !to || from==='---' || to==='---') return;
    const fromRate = this.rates[from]||1;
    const toRate = this.rates[to]||1;
    const result = amount * (toRate/fromRate);
    const rate = toRate/fromRate;
    document.getElementById('cc-result-box').style.display = 'block';
    document.getElementById('cc-result-main').textContent = `${amount.toLocaleString()} ${from} = ${result.toLocaleString(undefined,{minimumFractionDigits:2,maximumFractionDigits:4})} ${to}`;
    document.getElementById('cc-result-rate').textContent = `1 ${from} = ${rate.toFixed(4)} ${to} | 1 ${to} = ${(1/rate).toFixed(4)} ${from}`;
    const targets = ['EUR','GBP','JPY','CAD','AUD','CHF','INR','CNY'].filter(c=>c!==from&&c!==to);
    document.getElementById('cc-multi').innerHTML = targets.map(c => {
      const r = this.rates[c]/fromRate;
      return `<div style="display:flex;justify-content:space-between;padding:.5rem .75rem;background:#F9FAFB;border-radius:8px;font-size:.875rem;"><span style="color:#6B7280;">1 ${from} → ${c}</span><span style="font-weight:600;color:#1A1530;">${r.toFixed(4)} ${c}</span></div>`;
    }).join('');
  }
}
