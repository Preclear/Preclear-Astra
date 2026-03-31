import { useEffect, useState } from 'react';
import { Link, NavLink } from 'react-router-dom';
import { paths } from '../../routes';

type HeaderProps = {
  variant?: 'light' | 'dark';
  /** Collapse Maryland promo strip after scroll (used with sticky Product page header). */
  hideBannerOnScroll?: boolean;
  /** Minimal mode: hide banner + nav, show only logo and auth buttons (sign-up page). */
  minimal?: boolean;
};

export default function Header({
  variant = 'light',
  hideBannerOnScroll = false,
  minimal = false,
}: HeaderProps) {
  const isDark = variant === 'dark';
  const [bannerHidden, setBannerHidden] = useState(false);

  useEffect(() => {
    if (!hideBannerOnScroll) {
      setBannerHidden(false);
      return;
    }
    const onScroll = () => {
      setBannerHidden(window.scrollY > 12);
    };
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, [hideBannerOnScroll]);

  if (minimal) {
    return (
      <header className="site-header site-header--dark site-header--minimal">
        <div className="site-header__banner">
          <p className="site-header__banner-text">
            Permits for the State of Maryland are now live
          </p>
        </div>
        <div className="site-header__inner">
          <Link to={paths.home} className="site-header__brand">
            <img
              src="/images/Logo/PCBlackLogo.png"
              alt="PreClear logo"
              className="site-header__logo"
            />
            <span className="site-header__brand-text">PreClear</span>
          </Link>
          <div className="site-header__actions">
            <Link to={paths.signIn} className="site-header__link site-header__link--secondary">
              Sign In
            </Link>
            <Link to={paths.signUp} className="site-header__link site-header__link--primary">
              Sign Up
            </Link>
          </div>
        </div>
      </header>
    );
  }

  return (
    <header
      className={`site-header${isDark ? ' site-header--dark' : ''}${
        hideBannerOnScroll ? ' site-header--collapsible-banner' : ''
      }${hideBannerOnScroll && bannerHidden ? ' site-header--banner-hidden' : ''}`}
    >
      <div className="site-header__banner">
        <p className="site-header__banner-text">
          Permits for the State of Maryland are now live
        </p>
      </div>
      <div className="site-header__inner">
        <Link to={paths.home} className="site-header__brand">
          <img
            src={isDark ? '/images/Logo/PCBlackLogo.png' : '/images/Logo/PCWhiteLogo.png'}
            alt="PreClear logo"
            className="site-header__logo"
          />
          <span className="site-header__brand-text">PreClear</span>
        </Link>
        <nav className="site-header__nav" aria-label="Primary">
          <NavLink
            to={paths.howItWorks}
            className={({ isActive }) =>
              `site-header__link site-header__link--featured${isActive ? ' site-header__link--active' : ''}`
            }
          >
            How It Works
          </NavLink>
          <NavLink
            to={paths.product}
            className={({ isActive }) =>
              `site-header__link${isActive ? ' site-header__link--active' : ''}`
            }
          >
            Product
          </NavLink>
          <NavLink
            to={paths.features}
            className={({ isActive }) =>
              `site-header__link${isActive ? ' site-header__link--active' : ''}`
            }
          >
            Features
          </NavLink>
          <NavLink
            to={paths.pricing}
            className={({ isActive }) =>
              `site-header__link${isActive ? ' site-header__link--active' : ''}`
            }
          >
            Pricing
          </NavLink>
          <NavLink
            to={paths.guides}
            className={({ isActive }) =>
              `site-header__link${isActive ? ' site-header__link--active' : ''}`
            }
          >
            Guides
          </NavLink>
        </nav>
        <div className="site-header__actions">
          <Link to={paths.signIn} className="site-header__link site-header__link--secondary">
            Sign In
          </Link>
          <Link to={paths.signUp} className="site-header__link site-header__link--primary">
            Sign Up
          </Link>
        </div>
      </div>
    </header>
  );
}
