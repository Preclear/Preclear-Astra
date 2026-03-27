import { FormEvent, useState } from 'react';
import { supabase, supabaseAnonKey, supabaseUrl } from '../lib/supabase';

const EMAIL_SIGNUP_URL = `${supabaseUrl}/functions/v1/email-signup`;

const PASSWORD_HINT =
  'Use 10–72 characters with upper and lower case, a number, and a symbol.';

export default function SignUpPage() {
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [userType, setUserType] = useState('homeowner');
  const [agreeToTerms, setAgreeToTerms] = useState(false);
  const [honeypot, setHoneypot] = useState('');
  const [googleError, setGoogleError] = useState<string | null>(null);
  const [emailError, setEmailError] = useState<string | null>(null);
  const [emailSuccess, setEmailSuccess] = useState<string | null>(null);
  const [emailSubmitting, setEmailSubmitting] = useState(false);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setEmailError(null);
    setEmailSuccess(null);

    if (password !== confirmPassword) {
      setEmailError('Passwords do not match.');
      return;
    }

    setEmailSubmitting(true);
    try {
      const response = await fetch(EMAIL_SIGNUP_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${supabaseAnonKey}`,
          apikey: supabaseAnonKey,
        },
        body: JSON.stringify({
          email,
          password,
          firstName,
          lastName,
          userType,
          agreeToTerms,
          website: honeypot,
        }),
      });

      const data: { error?: string; message?: string; ok?: boolean } = await response.json().catch(
        () => ({}),
      );

      if (!response.ok) {
        setEmailError(data.error ?? 'Something went wrong. Please try again.');
        return;
      }

      setEmailSuccess(
        data.message ??
          'If eligible, check your email for next steps.',
      );
    } catch {
      setEmailError('Network error. Check your connection and try again.');
    } finally {
      setEmailSubmitting(false);
    }
  };

  const handleGoogleSignUp = async () => {
    setGoogleError(null);
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/sign-up`,
        queryParams: {
          prompt: 'select_account',
        },
      },
    });

    if (error) {
      setGoogleError(error.message);
    }
  };

  return (
    <section style={{ maxWidth: 420, margin: '64px auto', padding: '0 16px' }}>
      <h1 style={{ marginBottom: 8 }}>Create account</h1>
      <button
        type="button"
        onClick={handleGoogleSignUp}
        style={{
          width: '100%',
          marginBottom: 12,
          padding: '10px 12px',
          borderRadius: 8,
          border: '1px solid #d1d5db',
          background: '#fff',
          cursor: 'pointer',
          fontWeight: 500,
        }}
      >
        Sign up with Google
      </button>
      {googleError ? (
        <p style={{ margin: '0 0 12px', color: '#dc2626', fontSize: 13 }}>{googleError}</p>
      ) : null}
      <p style={{ textAlign: 'center', margin: '0 0 12px', color: '#666', fontSize: 13 }}>
        or sign up with email
      </p>
      {emailSuccess ? (
        <p style={{ margin: '0 0 12px', color: '#15803d', fontSize: 14 }} role="status">
          {emailSuccess}
        </p>
      ) : null}
      {emailError ? (
        <p style={{ margin: '0 0 12px', color: '#dc2626', fontSize: 13 }} role="alert">
          {emailError}
        </p>
      ) : null}
      <form onSubmit={handleSubmit} style={{ display: 'grid', gap: 12 }}>
        <input
          type="text"
          name="website"
          value={honeypot}
          onChange={(event) => setHoneypot(event.target.value)}
          tabIndex={-1}
          autoComplete="off"
          aria-hidden
          style={{
            position: 'absolute',
            width: 1,
            height: 1,
            padding: 0,
            margin: -1,
            overflow: 'hidden',
            clip: 'rect(0,0,0,0)',
            whiteSpace: 'nowrap',
            border: 0,
          }}
        />
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
          <label style={{ display: 'grid', gap: 6 }}>
            First name
            <input
              type="text"
              value={firstName}
              onChange={(event) => setFirstName(event.target.value)}
              required
            />
          </label>

          <label style={{ display: 'grid', gap: 6 }}>
            Last name
            <input
              type="text"
              value={lastName}
              onChange={(event) => setLastName(event.target.value)}
              required
            />
          </label>
        </div>

        <label style={{ display: 'grid', gap: 6 }}>
          Email
          <input
            type="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            required
          />
        </label>

        <label style={{ display: 'grid', gap: 6 }}>
          Password
          <input
            type="password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            required
            minLength={10}
            maxLength={72}
            autoComplete="new-password"
            title={PASSWORD_HINT}
          />
          <span style={{ fontSize: 12, color: '#666' }}>{PASSWORD_HINT}</span>
        </label>

        <label style={{ display: 'grid', gap: 6 }}>
          Confirm password
          <input
            type="password"
            value={confirmPassword}
            onChange={(event) => setConfirmPassword(event.target.value)}
            required
            minLength={10}
            maxLength={72}
            autoComplete="new-password"
            title={PASSWORD_HINT}
          />
        </label>

        <label style={{ display: 'grid', gap: 6 }}>
          I am a
          <select
            value={userType}
            onChange={(event) => setUserType(event.target.value)}
          >
            <option value="homeowner">Homeowner</option>
            <option value="contractor">Contractor</option>
            <option value="architect">Architect</option>
            <option value="other">Other</option>
          </select>
        </label>

        <label style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <input
            type="checkbox"
            checked={agreeToTerms}
            onChange={(event) => setAgreeToTerms(event.target.checked)}
            required
          />
          I agree to the Terms and Privacy Policy
        </label>

        <button type="submit" disabled={emailSubmitting}>
          {emailSubmitting ? 'Creating account…' : 'Sign up'}
        </button>
      </form>
    </section>
  );
}
