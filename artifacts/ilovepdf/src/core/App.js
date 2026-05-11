import { Header } from '../components/Header.js';
import { Footer } from '../components/Footer.js';
import { Router } from './Router.js';

class App {
  constructor() {
    this.header = new Header();
    this.footer = new Footer();
    this.router = new Router();
  }

  render() {
    const app = document.getElementById('app');
    app.innerHTML = `
      <div id="header-root"></div>
      <main id="mainContent" style="flex:1;padding:2rem 0;min-height:calc(100vh - 64px - 280px);"></main>
      <div id="footer-root"></div>
    `;
    document.getElementById('header-root').innerHTML = this.header.render();
    document.getElementById('footer-root').innerHTML = this.footer.render();
    this.header.setupEvents();
  }

  init() {
    this.render();
    this.router.init();
    this.removeLodingScreen();
    this.setupCookieConsent();
    this.setupTermsModal();
    this.setupScrollToTop();
  }

  removeLodingScreen() {
    const ls = document.getElementById('loading-screen');
    const app = document.getElementById('app');
    if (ls) { ls.style.opacity = '0'; setTimeout(() => ls.remove(), 300); }
    if (app) app.style.display = 'flex';
  }

  setupCookieConsent() {
    const consent = localStorage.getItem('cookie-consent');
    if (!consent) {
      setTimeout(() => {
        const banner = document.getElementById('cookie-banner');
        if (banner) banner.style.display = 'flex';
      }, 1500);
    }
    window.acceptCookies = (type) => {
      localStorage.setItem('cookie-consent', type);
      const banner = document.getElementById('cookie-banner');
      if (banner) banner.style.display = 'none';
    };
  }

  setupTermsModal() {
    const accepted = sessionStorage.getItem('terms-accepted');
    if (!accepted) {
      setTimeout(() => {
        const overlay = document.getElementById('terms-overlay');
        if (overlay) overlay.style.display = 'flex';
      }, 800);
    }
    window.acceptTerms = () => {
      sessionStorage.setItem('terms-accepted', '1');
      const overlay = document.getElementById('terms-overlay');
      if (overlay) overlay.style.display = 'none';
    };
  }

  setupScrollToTop() {
    window.addEventListener('hashchange', () => {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  }
}

const app = new App();
app.init();
