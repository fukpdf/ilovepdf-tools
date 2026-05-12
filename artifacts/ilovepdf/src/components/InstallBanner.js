export class InstallBanner {
  constructor() {
    this.deferredPrompt = null;
    this.shown = false;
  }

  init() {
    if (localStorage.getItem('pwa-installed') || localStorage.getItem('pwa-dismissed')) return;

    const visits = parseInt(localStorage.getItem('visit-count') || '0', 10) + 1;
    localStorage.setItem('visit-count', String(visits));

    window.addEventListener('beforeinstallprompt', (e) => {
      e.preventDefault();
      this.deferredPrompt = e;
      if (visits >= 2 && !this.shown) {
        setTimeout(() => this.show(), 4000);
      }
    });

    window.addEventListener('appinstalled', () => {
      localStorage.setItem('pwa-installed', '1');
      this._remove();
    });
  }

  show() {
    if (this.shown || !this.deferredPrompt) return;
    this.shown = true;

    const el = document.createElement('div');
    el.id = 'pwa-install-banner';
    el.style.cssText = `
      position:fixed;bottom:0;left:0;right:0;z-index:9999;
      background:#fff;border-top:1px solid #E5E7EB;
      box-shadow:0 -4px 24px rgba(0,0,0,.10);
      padding:1rem 1.25rem;
      display:flex;align-items:center;gap:.875rem;
      transform:translateY(100%);transition:transform .35s cubic-bezier(.22,1,.36,1);
      font-family:'Plus Jakarta Sans',sans-serif;
    `;
    el.innerHTML = `
      <div style="width:42px;height:42px;background:linear-gradient(135deg,#7B3FF2,#a855f7);border-radius:10px;display:flex;align-items:center;justify-content:center;flex-shrink:0;font-size:1.4rem;">📄</div>
      <div style="flex:1;min-width:0;">
        <p style="margin:0;font-weight:700;font-size:.95rem;color:#111827;line-height:1.2;">Add ILovePDF to home screen</p>
        <p style="margin:.2rem 0 0;font-size:.8rem;color:#6B7280;line-height:1.3;">Use all 36 tools offline, instantly.</p>
      </div>
      <button id="pwa-install-btn" style="
        background:linear-gradient(135deg,#7B3FF2,#a855f7);
        color:#fff;border:none;border-radius:8px;
        padding:.5rem 1rem;font-size:.85rem;font-weight:600;
        cursor:pointer;white-space:nowrap;
        font-family:'Plus Jakarta Sans',sans-serif;flex-shrink:0;
      ">Install</button>
      <button id="pwa-dismiss-btn" style="
        background:none;border:none;cursor:pointer;
        color:#9CA3AF;padding:.25rem;flex-shrink:0;font-size:1.2rem;line-height:1;
        font-family:'Plus Jakarta Sans',sans-serif;
      " aria-label="Dismiss">×</button>
    `;
    document.body.appendChild(el);
    requestAnimationFrame(() => {
      el.style.transform = 'translateY(0)';
    });

    document.getElementById('pwa-install-btn').addEventListener('click', () => this._install());
    document.getElementById('pwa-dismiss-btn').addEventListener('click', () => this._dismiss());
  }

  async _install() {
    if (!this.deferredPrompt) return;
    this.deferredPrompt.prompt();
    const { outcome } = await this.deferredPrompt.userChoice;
    this.deferredPrompt = null;
    if (outcome === 'accepted') {
      localStorage.setItem('pwa-installed', '1');
    } else {
      localStorage.setItem('pwa-dismissed', '1');
    }
    this._remove();
  }

  _dismiss() {
    localStorage.setItem('pwa-dismissed', '1');
    this._remove();
  }

  _remove() {
    const el = document.getElementById('pwa-install-banner');
    if (!el) return;
    el.style.transform = 'translateY(100%)';
    setTimeout(() => el.remove(), 400);
  }
}
