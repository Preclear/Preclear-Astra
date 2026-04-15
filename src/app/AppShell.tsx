import { useEffect, useState } from 'react';
import type { User } from '@supabase/supabase-js';
import { Link, Outlet } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { paths } from '../routes';

function initialsFromUser(user: User | null): string {
  if (!user) return '';
  const meta = user.user_metadata as Record<string, string | undefined> | undefined;
  const full = meta?.full_name?.trim() || meta?.name?.trim();
  if (full) {
    const parts = full.split(/\s+/).filter(Boolean);
    if (parts.length >= 2) {
      return `${parts[0][0] ?? ''}${parts[1][0] ?? ''}`.toUpperCase().slice(0, 2);
    }
    return full.slice(0, 2).toUpperCase();
  }
  const email = user.email ?? '';
  if (!email) return '·';
  const local = email.split('@')[0] ?? '';
  if (local.length >= 2) return local.slice(0, 2).toUpperCase();
  return email.slice(0, 1).toUpperCase();
}

function IconGear({ className }: { className?: string }) {
  return (
    <svg className={className} width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        d="M12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6Z"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1Z"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function IconSparkle({ className }: { className?: string }) {
  return (
    <svg className={className} width="15" height="15" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      <path d="M12 2l1.09 4.26L17.35 7.35l-4.26 1.09L12 12.7l-1.09-4.26L6.65 7.35l4.26-1.09L12 2zM19 13l.55 2.12L21.67 16l-2.12.55L19 18.67l-.55-2.12L16.33 16l2.12-.55L19 13zM5 15l.73 2.82L8.55 19l-2.82.73L5 22.55l-.73-2.82L1.45 19l2.82-.73L5 15z" />
    </svg>
  );
}

export default function AppShell() {
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    if (!supabase) {
      setUser(null);
      return;
    }
    supabase.auth.getUser().then(({ data: { user: u } }) => setUser(u));
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });
    return () => subscription.unsubscribe();
  }, []);

  const initials = initialsFromUser(user);
  const displayInitials = initials || 'You';

  return (
    <div className="app-shell">
      <header className="app-shell__header">
        <div className="app-shell__header-inner">
          <Link to={paths.home} className="app-shell__brand" aria-label="PreClear home">
            <img
              src="/images/Logo/PCBlackLogo.png"
              alt=""
              className="app-shell__logo-mark"
              width={36}
              height={36}
            />
            <span className="app-shell__wordmark">PreClear</span>
          </Link>

          <div className="app-shell__tray" role="toolbar" aria-label="Account">
            <div className="app-shell__premium">
              <IconSparkle className="app-shell__premium-icon" />
              <span className="app-shell__premium-text">Premium</span>
            </div>

            <button type="button" className="app-shell__avatar" aria-label="Profile" title="Profile">
              <span className="app-shell__avatar-ring">
                <span className="app-shell__avatar-inner">{displayInitials}</span>
              </span>
            </button>

            <button type="button" className="app-shell__icon-btn" aria-label="Settings">
              <IconGear />
            </button>
          </div>
        </div>
      </header>
      <main className="app-shell__main">
        <Outlet />
      </main>
    </div>
  );
}
