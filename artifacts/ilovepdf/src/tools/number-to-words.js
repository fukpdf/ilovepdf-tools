import { trustBar, toolHeader } from '../utils/helpers.js';

export class NumberToWordsTool {
  render() {
    return `
    ${toolHeader('💬','Number to Words','Convert any number to its English word representation.')}
    ${trustBar()}
    <div style="max-width:480px;">
      <label style="font-weight:600;color:#1A1530;display:block;margin-bottom:.75rem;">Enter a Number</label>
      <input id="n2w-input" type="number" placeholder="e.g. 1234567" style="font-size:1.25rem;font-weight:600;margin-bottom:1rem;" oninput="window._n2wConvert()" />
      <div id="n2w-result-box" style="background:#F3EEFF;border:1px solid #C4B5FD;border-radius:12px;padding:1.25rem;display:none;margin-bottom:1rem;">
        <p style="font-size:.8rem;font-weight:600;color:#7B3FF2;margin-bottom:.5rem;text-transform:uppercase;letter-spacing:.05em;">In Words:</p>
        <p id="n2w-output" style="font-size:1.1rem;font-weight:600;color:#1A1530;line-height:1.5;"></p>
      </div>
      <div id="n2w-ordinal-box" style="background:#F0FDF4;border:1px solid #BBF7D0;border-radius:12px;padding:1.25rem;display:none;margin-bottom:1rem;">
        <p style="font-size:.8rem;font-weight:600;color:#166534;margin-bottom:.5rem;text-transform:uppercase;letter-spacing:.05em;">Ordinal:</p>
        <p id="n2w-ordinal" style="font-size:1.1rem;font-weight:600;color:#1A1530;"></p>
      </div>
      <div style="display:flex;gap:.75rem;flex-wrap:wrap;margin-top:1rem;">
        ${[0,1,10,100,1000,1000000,1000000000].map(n=>`<button onclick="document.getElementById('n2w-input').value=${n};window._n2wConvert()" style="background:#F9FAFB;border:1px solid #E5E7EB;border-radius:8px;padding:.4rem .9rem;cursor:pointer;font-size:.85rem;min-height:36px;font-family:'Plus Jakarta Sans',sans-serif;">${n.toLocaleString()}</button>`).join('')}
      </div>
    </div>`;
  }

  setupEvents() {
    const ones = ['','one','two','three','four','five','six','seven','eight','nine','ten','eleven','twelve','thirteen','fourteen','fifteen','sixteen','seventeen','eighteen','nineteen'];
    const tens = ['','','twenty','thirty','forty','fifty','sixty','seventy','eighty','ninety'];

    function toWords(n) {
      if (n === 0) return 'zero';
      if (n < 0) return 'negative ' + toWords(-n);
      if (n < 20) return ones[n];
      if (n < 100) return tens[Math.floor(n/10)] + (n%10?' '+ones[n%10]:'');
      if (n < 1000) return ones[Math.floor(n/100)] + ' hundred' + (n%100?' '+toWords(n%100):'');
      if (n < 1e6) return toWords(Math.floor(n/1000)) + ' thousand' + (n%1000?' '+toWords(n%1000):'');
      if (n < 1e9) return toWords(Math.floor(n/1e6)) + ' million' + (n%1e6?' '+toWords(n%1e6):'');
      if (n < 1e12) return toWords(Math.floor(n/1e9)) + ' billion' + (n%1e9?' '+toWords(n%1e9):'');
      return toWords(Math.floor(n/1e12)) + ' trillion' + (n%1e12?' '+toWords(n%1e12):'');
    }

    function toOrdinal(n) {
      const w = toWords(n);
      if (w.endsWith('one')) return w.slice(0,-3)+'first';
      if (w.endsWith('two')) return w.slice(0,-3)+'second';
      if (w.endsWith('three')) return w.slice(0,-5)+'third';
      if (w.endsWith('ve')) return w.slice(0,-2)+'fth';
      if (w.endsWith('t')) return w+'h';
      if (w.endsWith('e')) return w.slice(0,-1)+'th';
      return w+'th';
    }

    window._n2wConvert = () => {
      const val = document.getElementById('n2w-input').value;
      const n = parseInt(val);
      const rb = document.getElementById('n2w-result-box');
      const ob = document.getElementById('n2w-ordinal-box');
      if (!val || isNaN(n)) { rb.style.display='none'; ob.style.display='none'; return; }
      const words = toWords(Math.abs(n));
      const result = n<0?'negative '+words:words;
      document.getElementById('n2w-output').textContent = result.charAt(0).toUpperCase() + result.slice(1);
      document.getElementById('n2w-ordinal').textContent = toOrdinal(Math.abs(n)).charAt(0).toUpperCase() + toOrdinal(Math.abs(n)).slice(1);
      rb.style.display='block'; ob.style.display='block';
    };
  }
}
