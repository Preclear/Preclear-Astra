import React, { useState } from 'react';

export default function Footer() {
  const [email, setEmail] = useState('');

  return (
    <footer className="site-footer">
      <div className="site-footer__top">
        <div className="site-footer__cols">

          <div className="site-footer__col">
            <p className="site-footer__col-heading">PRODUCT</p>
            <a href="#" className="site-footer__link">Overview</a>
            <a href="#" className="site-footer__link">Consumers</a>
            <a href="#" className="site-footer__link">Enterprise</a>
            <a href="#" className="site-footer__link">Platform</a>
          </div>

          <div className="site-footer__col">
            <p className="site-footer__col-heading">COMPANY</p>
            <a href="#" className="site-footer__link">About us</a>
            <a href="#" className="site-footer__link">Career</a>
            <a href="#" className="site-footer__link">FAQ</a>
            <a href="#" className="site-footer__link">Blog</a>
          </div>

          <div className="site-footer__col">
            <p className="site-footer__col-heading">LEGAL</p>
            <a href="#" className="site-footer__link">Terms</a>
            <a href="#" className="site-footer__link">Privacy Policy</a>
            <a href="#" className="site-footer__link">Disclosure</a>
          </div>

          <div className="site-footer__col site-footer__col--newsletter">
            <p className="site-footer__col-heading">Newsletter</p>
            <p className="site-footer__newsletter-desc">
              Keep in the loop with our bi-monthly update. Spam-free guarantee.
            </p>
            <form
              className="site-footer__email-form"
              onSubmit={(e) => e.preventDefault()}
            >
              <input
                type="email"
                className="site-footer__email-input"
                placeholder="Email address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
              <button type="submit" className="site-footer__email-btn" aria-label="Subscribe">
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                  <path d="M3 8h10M9 4l4 4-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </button>
            </form>
            <p className="site-footer__email-note">We never share your details.</p>
          </div>

        </div>
      </div>

      <div className="site-footer__bottom">
        <div className="site-footer__brand">
          <img src="/images/Logo/PCBlackLogo.png" alt="PreClear logo" className="site-footer__logo" />
          <span className="site-footer__brand-name">PreClear</span>
        </div>
        <a href="#" className="site-footer__copyright">© Copyright PreClear, Inc</a>
      </div>
    </footer>
  );
}
