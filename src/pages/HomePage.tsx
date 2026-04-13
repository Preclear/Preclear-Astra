import React, { useState, useEffect, useCallback } from 'react';
import WorkspaceSection from '../components/workspace/WorkspaceSection';
import PermitModal from '../components/PermitModal';
import { projectTypes } from '../data/projectTypes';
import type { ProjectType, ModalState } from '../types/permit';

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

/** Map typed text → project type for the search bar */
function detectProjectType(text: string): { type: ProjectType; prefill?: string } {
  const t = text.toLowerCase();
  if (/deck|porch/.test(t))                 return { type: 'deck' };
  if (/fence|wall/.test(t))                 return { type: 'fence' };
  if (/roof/.test(t))                       return { type: 'roof' };
  if (/window|door/.test(t))               return { type: 'windows' };
  if (/plumb|pipe|water heater/.test(t))    return { type: 'plumbing' };
  return { type: 'other', prefill: text };
}

export default function HomePage() {
  const [value, setValue] = useState('');
  const [placeholderIndex, setPlaceholderIndex] = useState(0);
  const [fade, setFade] = useState(true);

  // Modal state: null = closed
  const [modalState, setModalState] = useState<ModalState | null>(null);
  const [prefillText, setPrefillText] = useState('');

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

  // Search bar submit
  const handleSubmit = useCallback((e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = value.trim();
    if (!trimmed) return;
    const { type, prefill } = detectProjectType(trimmed);
    setPrefillText(prefill ?? '');
    setModalState({ step: 'questions', projectType: type });
  }, [value]);

  // Chip click → skip straight to questions for that type
  const handleChipClick = useCallback((type: ProjectType) => {
    setPrefillText('');
    setModalState({ step: 'questions', projectType: type });
  }, []);

  // "New Project" card → type-picker step
  const handleNewProject = useCallback(() => {
    setPrefillText('');
    setModalState({ step: 'pick' });
  }, []);

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
              id="hero-search-input"
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
              {projectTypes.map((pt) => {
                const Ico = pt.icon;
                return (
                  <button
                    key={pt.type}
                    type="button"
                    id={`chip-${pt.type}`}
                    className="hero-suggestions__chip"
                    onClick={() => handleChipClick(pt.type)}
                  >
                    <span className="hero-suggestions__icon">
                      <Ico size={14} />
                    </span>
                    <span className="hero-suggestions__text">{pt.label}</span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        <WorkspaceSection onNewProject={handleNewProject} />
      </section>

      {/* Wood table */}
      <div className="hero-table" aria-hidden="true">
        <img src="/images/Home/HeroSection/Hero Wood.png" className="hero-table__surface" />
      </div>

      {/* Permit modal — rendered at root level to escape stacking contexts */}
      <PermitModal
        initialState={modalState}
        onClose={() => setModalState(null)}
        prefillText={prefillText}
      />
    </>
  );
}
