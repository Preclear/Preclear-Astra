import React from 'react';
import Header from './Header';
import Footer from './Footer';

type LayoutProps = {
  children: React.ReactNode;
  headerVariant?: 'light' | 'dark';
};

export default function Layout({ children, headerVariant = 'light' }: LayoutProps) {
  return (
    <div className="layout">
      <Header variant={headerVariant} />
      <main className="layout__main">{children}</main>
      <Footer />
    </div>
  );
}
