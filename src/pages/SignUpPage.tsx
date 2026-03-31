import { FormEvent, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  supabase,
  supabaseAnonKey,
  supabaseUrl,
  isSupabaseConfigured,
} from '../lib/supabase';

const emailSignupUrl = isSupabaseConfigured
  ? `${supabaseUrl}/functions/v1/email-signup`
  : '';

const LOGOS = [1, 2, 3, 4, 5, 6, 7, 8] as const;

export default function SignUpPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [honeypot, setHoneypot] = useState('');
  const [googleError, setGoogleError] = useState<string | null>(null);
  const [emailError, setEmailError] = useState<string | null>(null);
  const [emailSuccess, setEmailSuccess] = useState<string | null>(null);
  const [emailSubmitting, setEmailSubmitting] = useState(false);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setEmailError(null);
    setEmailSuccess(null);
    setEmailSubmitting(true);
    try {
      const response = await fetch(emailSignupUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${supabaseAnonKey}`,
          apikey: supabaseAnonKey,
        },
        body: JSON.stringify({ email, password, website: honeypot }),
      });
      const data: { error?: string; message?: string } =
        await response.json().catch(() => ({}));
      if (!response.ok) {
        setEmailError(data.error ?? 'Something went wrong. Please try again.');
        return;
      }
      setEmailSuccess(data.message ?? 'Check your email for next steps.');
    } catch {
      setEmailError('Network error. Check your connection and try again.');
    } finally {
      setEmailSubmitting(false);
    }
  };

  const handleGoogleSignUp = async () => {
    setGoogleError(null);
    if (!supabase) return;
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/sign-up`,
        queryParams: { prompt: 'select_account' },
      },
    });
    if (error) setGoogleError(error.message);
  };

  return (
    <section className="signup-page">
      <div className="signup-page__shell">

        {/* Heading */}
        <div className="signup-page__intro">
          <h1 className="signup-page__title">Create your account</h1>
          <p className="signup-page__subtitle">
            Get paid the same day — no matter how your clients pays.
          </p>
        </div>

        {/* Auth block — no card wrapper */}
        <div className="signup-page__auth">

          {/* Google button */}
          <button
            type="button"
            onClick={handleGoogleSignUp}
            className="signup-page__google-btn"
          >
            <img
              src="https://img.clerk.com/static/google.svg?width=160"
              alt=""
              aria-hidden="true"
              className="signup-page__google-icon"
            />
            Continue with Google
          </button>

          {googleError && <p className="signup-page__error">{googleError}</p>}

          {/* Divider */}
          <div className="signup-page__divider">
            <span className="signup-page__divider-line" />
            <span className="signup-page__divider-text">or</span>
            <span className="signup-page__divider-line" />
          </div>

          {/* Form */}
          {emailSuccess ? (
            <p className="signup-page__success" role="status">{emailSuccess}</p>
          ) : (
            <form onSubmit={handleSubmit} className="signup-page__form">
              <input
                type="text"
                name="website"
                value={honeypot}
                onChange={(e) => setHoneypot(e.target.value)}
                tabIndex={-1}
                autoComplete="off"
                aria-hidden
                className="signup-page__honeypot"
              />

              <div className="signup-page__field">
                <label htmlFor="su-email" className="signup-page__label">
                  Email address
                </label>
                <input
                  id="su-email"
                  type="email"
                  placeholder="Enter your email address"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="signup-page__input"
                />
              </div>

              <div className="signup-page__field">
                <label htmlFor="su-password" className="signup-page__label">
                  Password
                </label>
                <div className="signup-page__input-wrap">
                  <input
                    id="su-password"
                    type={showPassword ? 'text' : 'password'}
                    placeholder="Enter your password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    autoComplete="new-password"
                    className="signup-page__input signup-page__input--padded"
                  />
                  <button
                    type="button"
                    className="signup-page__eye-btn"
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                    onClick={() => setShowPassword((v) => !v)}
                  >
                    {showPassword ? (
                      <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
                        <path d="M8 9.607c.421 0 .825-.17 1.123-.47a1.617 1.617 0 0 0 0-2.273 1.578 1.578 0 0 0-2.246 0 1.617 1.617 0 0 0 0 2.272c.298.302.702.471 1.123.471Z"/>
                        <path fillRule="evenodd" clipRule="evenodd" d="M2.07 8.38a1.073 1.073 0 0 1 0-.763 6.42 6.42 0 0 1 2.334-2.99A6.302 6.302 0 0 1 8 3.5c2.704 0 5.014 1.71 5.93 4.12.094.246.093.518 0 .763a6.418 6.418 0 0 1-2.334 2.99A6.301 6.301 0 0 1 8 12.5c-2.704 0-5.013-1.71-5.93-4.12ZM10.54 8c0 .682-.267 1.336-.743 1.818A2.526 2.526 0 0 1 8 10.571c-.674 0-1.32-.27-1.796-.753A2.587 2.587 0 0 1 5.459 8c0-.682.268-1.336.745-1.818A2.525 2.525 0 0 1 8 5.429c.674 0 1.32.27 1.797.753.476.482.744 1.136.744 1.818Z"/>
                      </svg>
                    ) : (
                      <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
                        <path d="M2 2l12 12M6.5 6.59a2.57 2.57 0 0 0 2.91 2.91M4.52 4.53A6.3 6.3 0 0 0 2.07 7.62a1.07 1.07 0 0 0 0 .76 6.3 6.3 0 0 0 9.47 2.6M7.05 3.54A6.3 6.3 0 0 1 8 3.5c2.7 0 5.01 1.71 5.93 4.12.09.25.09.52 0 .76a6.37 6.37 0 0 1-1.48 2.24"/>
                      </svg>
                    )}
                  </button>
                </div>
              </div>

              {emailError && <p className="signup-page__error" role="alert">{emailError}</p>}

              <button
                type="submit"
                disabled={emailSubmitting}
                className="signup-page__submit-btn"
              >
                {emailSubmitting ? 'Creating account…' : (
                  <>
                    Continue
                    <svg width="10" height="10" viewBox="0 0 10 10" fill="currentColor" aria-hidden="true" style={{ marginLeft: 8, opacity: 0.62 }}>
                      <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="m7.25 5-3.5-2.25v4.5L7.25 5Z"/>
                    </svg>
                  </>
                )}
              </button>
            </form>
          )}
        </div>

        {/* Footer link */}
        <div className="signup-page__footer">
          <span className="signup-page__footer-text">Already have an account?</span>
          <Link to="/" className="signup-page__footer-link">Sign in</Link>
        </div>

        {/* Logo marquee */}
        <div className="signup-page__marquee-wrap">
          <p className="signup-page__marquee-label">
            Join 1,200+ businesses &amp; freelancers in 129+ countries
          </p>
          <div className="signup-page__marquee-track-wrap">
            <div className="signup-page__marquee-track">
              <div className="signup-page__marquee-inner">
                {[...LOGOS, ...LOGOS, ...LOGOS].map((n, i) => (
                  <span key={i} className="signup-page__marquee-slot">
                    <img
                      src={`/images/howItWorks/PartnerLogos/PLogo${n}.png`}
                      alt={`Partner logo ${n}`}
                      className="signup-page__marquee-logo"
                    />
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>

      </div>

      {/* Decorative object images */}
      <img src="/images/howItWorks/ObjAsset/Blueprintfull.png" aria-hidden="true" className="su-deco su-deco--1" />
      <img src="/images/howItWorks/ObjAsset/Hardhat.png"      aria-hidden="true" className="su-deco su-deco--6" />
      <img src="/images/howItWorks/ObjAsset/Toolbox.png"       aria-hidden="true" className="su-deco su-deco--2" />
      <img src="/images/howItWorks/ObjAsset/Hammer.png"        aria-hidden="true" className="su-deco su-deco--7" />
      <img src="/images/howItWorks/ObjAsset/Wrench.png"         aria-hidden="true" className="su-deco su-deco--8" />
      <img src="/images/howItWorks/ObjAsset/Ladder.png"    aria-hidden="true" className="su-deco su-deco--3" />
      <img src="/images/howItWorks/ObjAsset/Paperplans.png"    aria-hidden="true" className="su-deco su-deco--4" />
      <img src="/images/howItWorks/ObjAsset/Lever.png"         aria-hidden="true" className="su-deco su-deco--5" />

      {/* Shadow overlay */}
      <img
        src="/images/howItWorks/Feature/shadow.png"
        alt=""
        className="hiw__shadow-overlay"
        aria-hidden="true"
      />
    </section>
  );
}
