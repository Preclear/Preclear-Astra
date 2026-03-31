import type { ReactNode } from 'react';
import Header from './Header';
import Footer from './Footer';

type LayoutProps = {
  children: ReactNode;
  headerVariant?: 'light' | 'dark';
  /** Sticky header at top while scrolling (e.g. Product page). */
  stickyHeader?: boolean;
  /** How It Works: use HIW hero webp with same frame as home layout background. */
  hiwHeroBackground?: boolean;
  /** Features page: solid off-white canvas (no home hero bg image). */
  featuresPage?: boolean;
  /** Pricing page: same neutral canvas so gaps between sections are not the blue hero. */
  pricingPage?: boolean;
  /** Sign-up page: white canvas centered auth form. */
  signUpPage?: boolean;
  /** Sign-up page: show minimal header (logo + auth buttons only, no nav). */
  minimalHeader?: boolean;
};

export default function Layout({
  children,
  headerVariant = 'light',
  stickyHeader = false,
  hiwHeroBackground = false,
  featuresPage = false,
  pricingPage = false,
  signUpPage = false,
  minimalHeader = false,
}: LayoutProps) {
  return (
    <div
      className={`layout${stickyHeader ? ' layout--sticky-header' : ''}${
        hiwHeroBackground ? ' layout--hiw-hero' : ''
      }${featuresPage ? ' layout--features' : ''}${pricingPage ? ' layout--pricing' : ''}${
        signUpPage ? ' layout--signup' : ''
      }`}
    >
      <Header variant={headerVariant} hideBannerOnScroll={stickyHeader} minimal={minimalHeader} />
      <main className="layout__main">{children}</main>
      <Footer />
    </div>
  );
}
