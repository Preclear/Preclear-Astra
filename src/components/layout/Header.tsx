import { Link } from 'react-router-dom';

type HeaderProps = {
  variant?: 'light' | 'dark';
};

export default function Header({ variant = 'light' }: HeaderProps) {
  const isDark = variant === 'dark';
  return (
    <header className={`site-header${isDark ? ' site-header--dark' : ''}`}>
      <div className="site-header__banner">
        <p className="site-header__banner-text">
          Permits for the State of Maryland are now live
        </p>
      </div>
      <div className="site-header__inner">
        <div className="site-header__brand">
          <img
            src={isDark ? '/images/Logo/PCBlackLogo.png' : '/images/Logo/PCWhiteLogo.png'}
            alt="PreClear logo"
            className="site-header__logo"
          />
          <span className="site-header__brand-text">PreClear</span>
        </div>
        <nav className="site-header__nav">
          <a href="/how-it-works" className="site-header__link site-header__link--featured">
            How It Works
          </a>
          <a href="#" className="site-header__link">Pricing</a>
          <a href="#" className="site-header__link">Features</a>
          <a href="#" className="site-header__link">Guides</a>
        </nav>
        <div className="site-header__actions">
          <a href="#" className="site-header__link site-header__link--secondary">
            Sign In
          </a>
          <Link to="/sign-up" className="site-header__link site-header__link--primary">
            Sign Up
          </Link>
        </div>
      </div>
    </header>
  );
}
