import { HomePage } from '../pages/HomePage.js';
import { SEO } from '../seo/SEO.js';

const TOOL_ROUTES = {
  'merge-pdf': () => import('../tools/merge-pdf.js'),
  'split-pdf': () => import('../tools/split-pdf.js'),
  'compress-pdf': () => import('../tools/compress-pdf.js'),
  'rotate-pdf': () => import('../tools/rotate-pdf.js'),
  'crop-pdf': () => import('../tools/crop-pdf.js'),
  'organize-pdf': () => import('../tools/organize-pdf.js'),
  'pdf-to-word': () => import('../tools/pdf-to-word.js'),
  'pdf-to-excel': () => import('../tools/pdf-to-excel.js'),
  'pdf-to-jpg': () => import('../tools/pdf-to-jpg.js'),
  'word-to-pdf': () => import('../tools/word-to-pdf.js'),
  'jpg-to-pdf': () => import('../tools/jpg-to-pdf.js'),
  'html-to-pdf': () => import('../tools/html-to-pdf.js'),
  'pdf-to-ppt': () => import('../tools/pdf-to-ppt.js'),
  'excel-to-pdf': () => import('../tools/excel-to-pdf.js'),
  'ppt-to-pdf': () => import('../tools/ppt-to-pdf.js'),
  'edit-pdf': () => import('../tools/edit-pdf.js'),
  'watermark-pdf': () => import('../tools/watermark-pdf.js'),
  'sign-pdf': () => import('../tools/sign-pdf.js'),
  'add-page-numbers': () => import('../tools/add-page-numbers.js'),
  'redact-pdf': () => import('../tools/redact-pdf.js'),
  'protect-pdf': () => import('../tools/protect-pdf.js'),
  'unlock-pdf': () => import('../tools/unlock-pdf.js'),
  'repair-pdf': () => import('../tools/repair-pdf.js'),
  'ocr-pdf': () => import('../tools/ocr-pdf.js'),
  'compare-pdf': () => import('../tools/compare-pdf.js'),
  'scan-pdf': () => import('../tools/scan-pdf.js'),
  'ai-summarize': () => import('../tools/ai-summarize.js'),
  'translate-pdf': () => import('../tools/translate-pdf.js'),
  'background-remover': () => import('../tools/background-remover.js'),
  'crop-image': () => import('../tools/crop-image.js'),
  'resize-image': () => import('../tools/resize-image.js'),
  'image-filters': () => import('../tools/image-filters.js'),
  'compress-image': () => import('../tools/compress-image.js'),
  'number-to-words': () => import('../tools/number-to-words.js'),
  'currency-converter': () => import('../tools/currency-converter.js'),
  'workflow-builder': () => import('../tools/workflow-builder.js'),
};

const PAGE_ROUTES = {
  'about': () => import('../pages/AboutPage.js'),
  'privacy': () => import('../pages/PrivacyPage.js'),
  'terms': () => import('../pages/TermsPage.js'),
  'disclaimer': () => import('../pages/DisclaimerPage.js'),
  'cookies': () => import('../pages/CookiePage.js'),
  'contact': () => import('../pages/ContactPage.js'),
  'donate': () => import('../pages/DonatePage.js'),
};

function trackRecentTool(slug) {
  try {
    const recent = JSON.parse(localStorage.getItem('recentTools') || '[]');
    const updated = [slug, ...recent.filter(t => t !== slug)].slice(0, 6);
    localStorage.setItem('recentTools', JSON.stringify(updated));
  } catch (e) { /* ignore */ }
}

export class Router {
  init() {
    window.addEventListener('hashchange', () => this.navigate());
    this.navigate();
  }

  async navigate() {
    const hash = location.hash.replace('#', '').trim();
    const main = document.getElementById('mainContent');
    if (!main) return;

    SEO.setPageMeta(hash);

    main.innerHTML = `<div class="container" style="padding-top:2rem;"><div style="display:flex;justify-content:center;padding:4rem 0;"><div class="loading-ring"></div></div></div>`;

    try {
      if (!hash) {
        const home = new HomePage();
        main.innerHTML = home.render();
        return;
      }

      if (TOOL_ROUTES[hash]) {
        trackRecentTool(hash);
        const mod = await TOOL_ROUTES[hash]();
        const ToolClass = Object.values(mod)[0];
        const tool = new ToolClass();
        main.innerHTML = `<div class="container" style="max-width:860px;padding-top:1.5rem;padding-bottom:3rem;">${tool.render()}</div>`;
        if (tool.setupEvents) tool.setupEvents();
        return;
      }

      if (PAGE_ROUTES[hash]) {
        const mod = await PAGE_ROUTES[hash]();
        const PageClass = Object.values(mod)[0];
        const page = new PageClass();
        main.innerHTML = `<div class="container">${page.render()}</div>`;
        if (page.setupEvents) page.setupEvents();
        return;
      }

      SEO.setPageMeta('');
      const home = new HomePage();
      main.innerHTML = home.render();
    } catch (err) {
      console.error('Router error:', err);
      main.innerHTML = `<div class="container" style="text-align:center;padding:4rem 0;">
        <div style="font-size:3rem;margin-bottom:1rem;">⚠️</div>
        <p style="color:#991B1B;font-size:1.1rem;font-weight:600;margin-bottom:1rem;">Failed to load this tool</p>
        <p style="color:#6B7280;font-size:.9rem;margin-bottom:1.5rem;">${err.message}</p>
        <a href="#" style="display:inline-flex;align-items:center;gap:.5rem;background:#7B3FF2;color:white;text-decoration:none;border-radius:10px;padding:.75rem 1.5rem;font-weight:600;">← Back to Home</a>
      </div>`;
    }
  }
}
