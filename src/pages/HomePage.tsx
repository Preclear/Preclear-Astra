import React, { useState, useEffect } from 'react';
import WorkspaceSection from '../components/workspace/WorkspaceSection';

const PLACEHOLDERS = [
  'Changing windows...',
  'Interior painting...',
  'Adding a deck...',
  'Replacing a roof...',
  'Building an ADU...',
  'Remodeling a kitchen...',
  'Installing solar panels...',
  'Finishing a basement...',
];

const SUGGESTIONS = [
  { icon: '🪟', label: 'Changing windows' },
  { icon: '🎨', label: 'Interior painting' },
  { icon: '🏗️', label: 'Adding a deck' },
  { icon: '🏠', label: 'Replacing a roof' },
  { icon: '🏡', label: 'Building an ADU' },
  { icon: '🍳', label: 'Kitchen remodel' },
  { icon: '☀️', label: 'Solar panels' },
  { icon: '🔧', label: 'Plumbing work' },
];

export default function HomePage() {
  const [value, setValue] = useState('');
  const [placeholderIndex, setPlaceholderIndex] = useState(0);
  const [fade, setFade] = useState(true);

  useEffect(() => {
    const interval = setInterval(() => {
      setFade(false);
      setTimeout(() => {
        setPlaceholderIndex((i) => (i + 1) % PLACEHOLDERS.length);
        setFade(true);
      }, 300);
    }, 2400);
    return () => clearInterval(interval);
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
  };

  return (
    <>
    <section className="home">
      {/* Decorative layer */}
      <img src="/images/Home/HeroSection/HeroClip.png" className="hero-deco hero-deco--clip" aria-hidden="true" />
      <img src="/images/Home/HeroSection/HeroPin.png"  className="hero-deco hero-deco--pin"  aria-hidden="true" />
      <img src="/images/Home/HeroSection/HeroHold.png" className="hero-deco hero-deco--hold" aria-hidden="true" />

      <div className="home__content">
        <h1 className="home__title">Is Your Project Permit Ready?</h1>
        <p className="home__subtitle">
          Run a permit compliance pre-check before you submit. Catch zoning issues,
          missing documents, and code conflicts in minutes, not weeks.
        </p>

        <form className="hero-search" onSubmit={handleSubmit}>
          <input
            className="hero-search__input"
            type="text"
            placeholder={PLACEHOLDERS[placeholderIndex]}
            style={{ opacity: fade ? 1 : 0, transition: 'opacity 0.3s ease' } as React.CSSProperties}
            value={value}
            onChange={(e) => setValue(e.target.value)}
          />
          <button className="hero-search__btn" type="submit" aria-label="Check permit">
            <svg width="16" height="16" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M9 13V5M6 8L9 5L12 8" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>
        </form>

        <div className="hero-suggestions">
          <span className="hero-suggestions__label">Try</span>
          <div className="hero-suggestions__list">
            {SUGGESTIONS.map((s) => (
              <button
                key={s.label}
                type="button"
                className="hero-suggestions__chip"
                onClick={() => setValue(s.label)}
              >
                <span className="hero-suggestions__icon">{s.icon}</span>
                <span className="hero-suggestions__text">{s.label}</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      <WorkspaceSection />
    </section>

    {/* Wood table */}
    <div className="hero-table" aria-hidden="true">
      <img src="/images/Home/HeroSection/Hero Wood.png" className="hero-table__surface" />
    </div>
    </>
  );
}
