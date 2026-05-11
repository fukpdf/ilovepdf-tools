export class ContactPage {
  render() {
    return `
    <div style="max-width:640px;margin:0 auto;padding:2rem 0;">
      <h1 style="font-size:2.25rem;font-weight:800;color:#1A1530;margin-bottom:.5rem;">Contact Us</h1>
      <p style="color:#6B7280;font-size:1rem;line-height:1.6;margin-bottom:.75rem;">Have a question, found a bug, or want to suggest a new tool?</p>
      <div style="background:#F0FDF4;border:1px solid #BBF7D0;border-radius:10px;padding:1rem 1.25rem;margin-bottom:2rem;display:flex;align-items:center;gap:1rem;flex-wrap:wrap;">
        <span style="color:#166534;font-size:.9rem;">📧 Email: <a href="mailto:support@ilovepdf.cyou" style="color:#7B3FF2;font-weight:600;">support@ilovepdf.cyou</a></span>
        <span style="color:#6B7280;font-size:.875rem;">⏱️ Usually within 24 hours</span>
      </div>

      <div style="background:#F9FAFB;border:1px solid #E5E7EB;border-radius:16px;padding:2rem;margin-bottom:2rem;">
        <form id="contact-form" onsubmit="window._contactSubmit(event)">
          <div style="display:grid;gap:1.25rem;">
            <div>
              <label style="font-weight:600;font-size:.9rem;color:#1A1530;display:block;margin-bottom:.5rem;">Name</label>
              <input id="cf-name" type="text" placeholder="Your name" required />
            </div>
            <div>
              <label style="font-weight:600;font-size:.9rem;color:#1A1530;display:block;margin-bottom:.5rem;">Email</label>
              <input id="cf-email" type="email" placeholder="your@email.com" required />
            </div>
            <div>
              <label style="font-weight:600;font-size:.9rem;color:#1A1530;display:block;margin-bottom:.5rem;">Subject</label>
              <select id="cf-subject">
                <option>Bug Report</option>
                <option>Feature Request</option>
                <option>General Question</option>
                <option>Privacy Concern</option>
                <option>Other</option>
              </select>
            </div>
            <div>
              <label style="font-weight:600;font-size:.9rem;color:#1A1530;display:block;margin-bottom:.5rem;">Message</label>
              <textarea id="cf-message" rows="5" placeholder="Describe your issue or question..." required style="resize:vertical;"></textarea>
            </div>
            <button type="submit" class="btn-primary" style="width:100%;justify-content:center;">Send Message</button>
          </div>
        </form>
        <div id="cf-success" style="display:none;text-align:center;padding:2rem;">
          <div style="font-size:3rem;margin-bottom:1rem;">✅</div>
          <h3 style="font-weight:700;color:#166534;margin-bottom:.5rem;">Message Sent!</h3>
          <p style="color:#6B7280;">Thank you for reaching out. We typically reply within 24 hours at <strong>support@ilovepdf.cyou</strong>.</p>
        </div>
      </div>

      <div style="display:grid;grid-template-columns:1fr 1fr;gap:1rem;">
        <div style="background:#F3EEFF;border-radius:12px;padding:1.25rem;text-align:center;">
          <div style="font-size:1.75rem;margin-bottom:.5rem;">🐛</div>
          <h3 style="font-weight:700;color:#1A1530;font-size:.9rem;margin-bottom:.25rem;">Report a Bug</h3>
          <p style="font-size:.8rem;color:#6B7280;">Found something broken? Let us know!</p>
        </div>
        <div style="background:#F0FDF4;border-radius:12px;padding:1.25rem;text-align:center;">
          <div style="font-size:1.75rem;margin-bottom:.5rem;">💡</div>
          <h3 style="font-weight:700;color:#1A1530;font-size:.9rem;margin-bottom:.25rem;">Request a Feature</h3>
          <p style="font-size:.8rem;color:#6B7280;">Have an idea for a new tool?</p>
        </div>
      </div>
    </div>`;
  }

  setupEvents() {
    window._contactSubmit = (e) => {
      e.preventDefault();
      document.getElementById('contact-form').style.display = 'none';
      document.getElementById('cf-success').style.display = 'block';
    };
  }
}
