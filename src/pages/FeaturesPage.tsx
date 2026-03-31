import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { COHERENCE_PILL_PATHS } from '../data/coherencePillPaths';
import { paths } from '../routes';

type CoherencePathKey = keyof typeof COHERENCE_PILL_PATHS;

const COHERENCE_ROW1: { label: string; pathKey: CoherencePathKey }[] = [
  { label: 'Location tracking', pathKey: 'location' },
  { label: 'Automated billing', pathKey: 'bolt' },
  { label: 'Task management', pathKey: 'calendar' },
  { label: 'Payments', pathKey: 'payment' },
];

const COHERENCE_ROW2: { label: string; pathKey: CoherencePathKey }[] = [
  { label: 'Manage anywhere', pathKey: 'manageAnywhere' },
  { label: 'Smart contracts', pathKey: 'smartContracts' },
  { label: 'Approvals', pathKey: 'approvals' },
];

function FeatBudgetPill({ label, pathKey }: { label: string; pathKey: CoherencePathKey }) {
  return (
    <div className="feat-budget__pill">
      <span className="feat-budget__pill-ico">
        <svg viewBox="0 0 30 30" width={24} height={24} aria-hidden>
          <path d={COHERENCE_PILL_PATHS[pathKey]} fill="currentColor" />
        </svg>
      </span>
      <span>{label}</span>
    </div>
  );
}

function FeatBudgetMarqueeStrip({
  reverse,
  items,
}: {
  reverse?: boolean;
  items: { label: string; pathKey: CoherencePathKey }[];
}) {
  return (
    <div className={`feat-budget__marquee${reverse ? ' feat-budget__marquee--reverse' : ''}`}>
      <div className="feat-budget__marquee-track">
        <div className="feat-budget__marquee-inner">
          <div className="feat-budget__marquee-group">
            {items.map((item) => (
              <FeatBudgetPill key={item.label} label={item.label} pathKey={item.pathKey} />
            ))}
          </div>
          <div className="feat-budget__marquee-group" aria-hidden>
            {items.map((item) => (
              <FeatBudgetPill key={`${item.label}-b`} label={item.label} pathKey={item.pathKey} />
            ))}
          </div>
        </div>
      </div>
      <div className="feat-budget__marquee-fade" aria-hidden />
    </div>
  );
}

const HELP_WORDS: { w: string; bold?: true }[] = [
  { w: 'Build' }, { w: 'your' }, { w: 'own' },
  { w: 'business' }, { w: 'OS.' },
  { w: 'Not' }, { w: 'loud,' }, { w: 'flashy' }, { w: 'software.' },
  { w: 'Not' }, { w: 'bloated' }, { w: 'platforms' }, { w: 'pretending' },
  { w: 'to' }, { w: 'be' }, { w: 'all' }, { w: 'things' }, { w: 'to' },
  { w: 'all' }, { w: 'people.' }, { w: 'Just' }, { w: 'simple' },
  { w: 'systems' }, { w: 'that' }, { w: 'help' }, { w: 'people' },
  { w: 'run' }, { w: 'real' }, { w: 'businesses.' },
];

type FeatTab = 'paperwork' | 'project' | 'inspection';

const FEAT_PILL = '/images/howItWorks/Feature/FeaturePill' as const;
const HIW_OBJ = '/images/howItWorks/ObjAsset' as const;
/** Decorative props — spread around the page (same asset folder as How It Works frames) */
const FEAT_DECO_OBJ = [
  `${HIW_OBJ}/Lever.png`,
  `${HIW_OBJ}/Whitetape.png`,
  `/images/Home/HeroSection/HeroHold.png`,
] as const;

const FEAT_ANCHOR_DECO: readonly string[] = [];

const FEAT_BUDGET_DECO = [
  `${HIW_OBJ}/Blueprint.png`,
  `${HIW_OBJ}/Drill.png`,
  `${HIW_OBJ}/Hardhat.png`,
] as const;

const FEAT_PILL_PAIR: Record<FeatTab, { left: string; right: string }> = {
  paperwork: { left: `${FEAT_PILL}/L3.png`, right: `${FEAT_PILL}/R3.png` },
  project: { left: `${FEAT_PILL}/L2.png`, right: `${FEAT_PILL}/R2.png` },
  inspection: { left: `${FEAT_PILL}/L1.png`, right: `${FEAT_PILL}/R1.png` },
};

type FeatAnchorIconKind = 'communication' | 'task' | 'calendar' | 'team';

/** One row × four columns below the two anchor cards */
const FEAT_ANCHOR_FEATURES: { title: string; body: string; icon: FeatAnchorIconKind }[] = [
  {
    title: 'Communication',
    body: 'Keep the whole team in sync. Everything stays organized by project, customer, or topic.',
    icon: 'communication',
  },
  {
    title: 'Task tracking',
    body: 'Stay on top of progress at a glance with visual boards and deadline alerts.',
    icon: 'task',
  },
  {
    title: 'Shared calendar',
    body: 'A unified calendar that shows schedules, deadlines, availability, and upcoming milestones.',
    icon: 'calendar',
  },
  {
    title: 'Team check-ins',
    body: 'Quick status checks, no micromanaging with daily or weekly updates.',
    icon: 'team',
  },
];

const FEAT_NUMBERS_CARDS = [
  { value: '+97%', label: 'Increase in overall productivity' },
  { value: '+39.5', label: 'Uplift in customer sentiment' },
  { value: '6,000+', label: 'Year-on-year increase in number' },
];

const FEAT_ADDITIONAL_FEATURES: {
  title: string;
  body: string;
  pathKey: CoherencePathKey;
  href: string;
}[] = [
  {
    title: 'Easy quoting',
    body: 'Build and send clean, clear quotes in minutes',
    pathKey: 'smartContracts',
    href: '/features-1',
  },
  {
    title: 'Safe permissions',
    body: 'Keep sensitive info secured and where it belongs',
    pathKey: 'payment',
    href: '/features-1',
  },
  {
    title: 'Track revenue',
    body: "See what's coming in, overdue, and what's next",
    pathKey: 'manageAnywhere',
    href: '/features-1',
  },
  {
    title: 'Shared calendar',
    body: 'Plan once, share it with everyone',
    pathKey: 'calendar',
    href: '/features-1',
  },
];

function FeatAnchorFeatureIcon({ kind }: { kind: FeatAnchorIconKind }) {
  const common = { width: 24, height: 24, fill: 'none' as const, xmlns: 'http://www.w3.org/2000/svg', 'aria-hidden': true };
  switch (kind) {
    case 'communication':
      return (
        <svg {...common} viewBox="0 0 30 30">
          <path
            d="M1.25 2.5V20H5V23.75H5.9375C7.75375 23.75 9.87051 22.465 10.708 20H20V2.5H1.25ZM21.875 8.75V21.875H12.5V25H19.292C20.1307 27.465 22.2463 28.75 24.0625 28.75H25V25H28.75V8.75H21.875Z"
            fill="currentColor"
          />
        </svg>
      );
    case 'task':
      return (
        <svg {...common} viewBox="0 0 30 30">
          <path
            d="M3.5 22 L10 12.5 16 17 22.5 8 27 13.5"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            fill="none"
          />
          <circle cx="10" cy="12.5" r="2.25" fill="currentColor" />
          <circle cx="22.5" cy="8" r="2.25" fill="currentColor" />
        </svg>
      );
    case 'calendar':
      return (
        <svg {...common} viewBox="0 0 30 30">
          <rect x="5" y="7" width="20" height="20" rx="2" stroke="currentColor" strokeWidth="1.75" />
          <line x1="5" y1="14" x2="25" y2="14" stroke="currentColor" strokeWidth="1.75" />
          <rect x="10" y="4" width="2.5" height="5" rx="0.5" fill="currentColor" />
          <rect x="17.5" y="4" width="2.5" height="5" rx="0.5" fill="currentColor" />
          <circle cx="15" cy="20" r="1.75" fill="currentColor" />
        </svg>
      );
    case 'team':
      return (
        <svg {...common} viewBox="0 0 30 30">
          <circle cx="9" cy="9.5" r="3" fill="currentColor" />
          <circle cx="21" cy="9.5" r="3" fill="currentColor" />
          <circle cx="15" cy="16.5" r="3.5" fill="currentColor" />
          <path
            d="M4 23.5c1-3 3.5-4.5 5.5-4.5M26 23.5c-1-3-3.5-4.5-5.5-4.5M10 23.5h10"
            stroke="currentColor"
            strokeWidth="1.75"
            strokeLinecap="round"
            fill="none"
          />
        </svg>
      );
    default:
      return null;
  }
}

export default function FeaturesPage() {
  const [activeTab, setActiveTab] = useState<FeatTab>('paperwork');
  const pair = FEAT_PILL_PAIR[activeTab];

  // Scroll-driven word fill — tracks how far the help paragraph has been scrolled past
  const helpFrameRef = useRef<HTMLDivElement | null>(null);
  const [filledCount, setFilledCount] = useState(0);

  useEffect(() => {
    const onScroll = () => {
      const el = helpFrameRef.current;
      if (!el) return;
      const rect = el.getBoundingClientRect();
      const winH = window.innerHeight;
      // start filling when element's top crosses 75% of viewport height
      // finish when element's bottom crosses 35% of viewport height
      const start = rect.top - winH * 0.75;
      const end   = rect.bottom - winH * 0.35;
      const range = end - start;
      const progress = range > 0 ? Math.max(0, Math.min(1, -start / range)) : 0;
      setFilledCount(Math.round(progress * HELP_WORDS.length));
    };

    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <>
      <div className="feat-page">
        {FEAT_DECO_OBJ.map((src, i) => (
          <img
            key={src}
            src={src}
            alt=""
            className={`feat-deco feat-deco--${i + 1}`}
            aria-hidden
            draggable={false}
          />
        ))}
        <section className="feat-hero" aria-label="Features">
        <h1 className="hiw2__headline feat-hero__headline">
          Everything you need to get your permit right the first time
        </h1>
        <p className="hiw__subtitle">
          All the tools to check, prepare, and submit your project without delays or surprises.
        </p>
        <Link to={paths.signUp} className="feat-hero__cta">
          Get started now
        </Link>

        <div className="feat-tabs" role="tablist" aria-label="Product areas">
          <button
            type="button"
            role="tab"
            id="feat-tab-paperwork"
            aria-controls="feat-showcase-panel"
            aria-selected={activeTab === 'paperwork'}
            className={`feat-tab${activeTab === 'paperwork' ? ' feat-tab--active' : ''}`}
            onClick={() => setActiveTab('paperwork')}
          >
            <span className="feat-tab__icon" aria-hidden>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                <polyline points="14 2 14 8 20 8" />
                <line x1="8" y1="13" x2="16" y2="13" />
                <line x1="8" y1="17" x2="14" y2="17" />
              </svg>
            </span>
            <span className="feat-tab__label">Paperwork</span>
          </button>
          <button
            type="button"
            role="tab"
            id="feat-tab-project"
            aria-controls="feat-showcase-panel"
            aria-selected={activeTab === 'project'}
            className={`feat-tab${activeTab === 'project' ? ' feat-tab--active' : ''}`}
            onClick={() => setActiveTab('project')}
          >
            <span className="feat-tab__icon" aria-hidden>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
                <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z" />
              </svg>
            </span>
            <span className="feat-tab__label">Project</span>
          </button>
          <button
            type="button"
            role="tab"
            id="feat-tab-inspection"
            aria-controls="feat-showcase-panel"
            aria-selected={activeTab === 'inspection'}
            className={`feat-tab${activeTab === 'inspection' ? ' feat-tab--active' : ''}`}
            onClick={() => setActiveTab('inspection')}
          >
            <span className="feat-tab__icon" aria-hidden>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
                <path d="M9 11l3 3L22 4" />
                <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11" />
              </svg>
            </span>
            <span className="feat-tab__label">Inspection</span>
          </button>
        </div>
      </section>

      <section
        id="feat-showcase-panel"
        className="feat-showcase"
        role="tabpanel"
        aria-labelledby={`feat-tab-${activeTab}`}
      >
        <div className="feat-showcase__grid" key={activeTab}>
          <div className="feat-showcase__cell feat-showcase__cell--left">
            <img
              src={pair.left}
              alt=""
              className="feat-showcase__img"
              decoding="async"
              draggable={false}
            />
          </div>
          <div className="feat-showcase__cell feat-showcase__cell--right">
            <img
              src={pair.right}
              alt=""
              className="feat-showcase__img"
              decoding="async"
              draggable={false}
            />
          </div>
        </div>

        <div className="feat-showcase__bar">
          <p className="feat-showcase__bar-text">
            <span className="feat-showcase__bar-dot" aria-hidden />
            Need help? Our team is standing by
          </p>
          <Link to={paths.signUp} className="feat-showcase__bar-btn">
            Speak to Sales
          </Link>
        </div>
      </section>
    </div>

    {/* Shadow overlay belongs to the top frame */}
    <img
      src="/images/howItWorks/Feature/shadow.png"
      alt=""
      className="hiw__shadow-overlay"
      aria-hidden
    />

    {/* ── Manifesto frame — fully independent section below the top frame ── */}
    <section className="feat-manifesto" aria-label="About PreClear">
      <div ref={helpFrameRef} className="feat-manifesto__inner">
        <p className="feat-manifesto__text">
          {HELP_WORDS.map((word, i) => (
            <span key={i} className={`feat-help-word${i < filledCount ? ' is-filled' : ''}`}>
              {word.w}{' '}
            </span>
          ))}
        </p>
      </div>

      {/* ── Two-column anchor images ── */}
      <div className="feat-anchor">
        {FEAT_ANCHOR_DECO.map((src, i) => (
          <img
            key={`anchor-deco-${src}`}
            src={src}
            alt=""
            className={`feat-anchor__deco feat-anchor__deco--${i + 1}`}
            aria-hidden
            draggable={false}
          />
        ))}

        <div className="feat-anchor__col">
          <p className="feat-anchor__label">Manage everything</p>
          <p className="feat-anchor__sub">Put an end to mindless busywork</p>
          <div className="feat-anchor__card">
            <img
              src="/images/howItWorks/Feature/FeaturePill/Anchorf1.png"
              alt="Permit Granted dashboard"
              className="feat-anchor__img"
              draggable={false}
              decoding="async"
            />
          </div>
        </div>
        <div className="feat-anchor__col">
          <p className="feat-anchor__label">Create anything</p>
          <p className="feat-anchor__sub">Tools for all your everyday tasks</p>
          <div className="feat-anchor__card">
            <img
              src="/images/howItWorks/Feature/FeaturePill/Anchorf2.png"
              alt="Document checklist dashboard"
              className="feat-anchor__img"
              draggable={false}
              decoding="async"
            />
          </div>
        </div>

        <div className="feat-anchor__features feat-anchor__features--row">
          {FEAT_ANCHOR_FEATURES.map((item) => (
            <div key={item.title} className="feat-anchor__feature">
              <div className="feat-anchor__feature-ico" aria-hidden>
                <FeatAnchorFeatureIcon kind={item.icon} />
              </div>
              <div className="feat-anchor__feature-body">
                <div className="feat-anchor__feature-title">{item.title}</div>
                <div className="feat-anchor__feature-desc">{item.body}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>

    {/* ── Smart budgets + Built for coherence — shared grey band ── */}
    <section className="feat-budget" aria-label="Product features">
      {FEAT_BUDGET_DECO.map((src, i) => (
        <img
          key={`budget-deco-${src}-${i}`}
          src={src}
          alt=""
          className={`feat-budget__deco feat-budget__deco--${i + 1}`}
          aria-hidden
          draggable={false}
        />
      ))}

      <div className="feat-budget__inner">
        <div className="feat-budget__section-head">
          <h2 className="feat-budget__section-title">
            The antidote to over-designed SMB software
          </h2>
        </div>

        <div className="feat-budget__row">
          <div className="feat-budget__copy">
            <div className="feat-budget__lead">
              <h2 className="feat-budget__title">Smart budgets</h2>
              <p className="feat-budget__subtitle">
                Gain insight and make financial decisions with confidence.
              </p>
            </div>
            <ul className="feat-budget__list">
              <li>Track active and inactive suppliers</li>
              <li>Store contracts, contact details and key documents</li>
              <li>Set preferred suppliers by category</li>
            </ul>
          </div>

          <div className="feat-budget__visual">
            <div className="feat-budget__mock" aria-hidden>
              <div className="feat-budget__mock-head">
                <span className="feat-budget__mock-title">Performance</span>
                <span className="feat-budget__mock-kicker">Revenue</span>
              </div>
              <div className="feat-budget__mock-chart">
                {[
                  { m: 'J', h: 24, dark: false },
                  { m: 'A', h: 48, dark: false },
                  { m: 'S', h: 72, dark: false },
                  { m: 'O', h: 54, dark: false },
                  { m: 'N', h: 96, dark: true },
                  { m: 'D', h: 84, dark: false },
                ].map(({ m, h, dark }) => (
                  <div key={m} className="feat-budget__mock-col">
                    <div
                      className={`feat-budget__mock-bar${dark ? ' feat-budget__mock-bar--dark' : ''}`}
                      style={{ height: `${h}px` }}
                    />
                    <span className="feat-budget__mock-month">{m}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="feat-budget__row feat-budget__row--flip">
          <div className="feat-budget__visual feat-budget__visual--coherence">
            <img
              className="feat-budget__texture feat-budget__texture--align-bl"
              src="/images/Home/HeroSection/Hero Wood.png"
              alt=""
              aria-hidden
              draggable={false}
              decoding="async"
            />
            <div className="feat-budget__mock feat-budget__mock--email" aria-hidden>
              <div className="feat-budget__mock-email-title">Email scheduled</div>
              <div className="feat-budget__mock-fields">
                <div className="feat-budget__mock-field">
                  <div className="feat-budget__mock-field-k">Template</div>
                  <div className="feat-budget__mock-field-v">Welcome</div>
                </div>
                <div className="feat-budget__mock-field">
                  <div className="feat-budget__mock-field-k">Trigger</div>
                  <div className="feat-budget__mock-field-v">1 day before event</div>
                </div>
              </div>
            </div>
          </div>

          <div className="feat-budget__copy feat-budget__copy--coherence">
            <div className="feat-budget__lead">
              <h2 className="feat-budget__title">Built for coherence</h2>
              <p className="feat-budget__subtitle">
                Keep every product accounted for without extra spreadsheets.
              </p>
            </div>
            <div className="feat-budget__marquees">
              <FeatBudgetMarqueeStrip items={COHERENCE_ROW1} />
              <FeatBudgetMarqueeStrip reverse items={COHERENCE_ROW2} />
            </div>
          </div>
        </div>
      </div>
    </section>

    <section className="feat-numbers" aria-label="Numbers to crow home about">
      <div className="feat-numbers__inner">
        <div className="feat-numbers__head">
          <h2 className="feat-numbers__title">Numbers to crow home about</h2>
        </div>
        <div className="feat-numbers__grid">
          {FEAT_NUMBERS_CARDS.map((item) => (
            <article key={item.value} className="feat-numbers__card">
              <div className="feat-numbers__value">{item.value}</div>
              <div className="feat-numbers__label">{item.label}</div>
            </article>
          ))}
        </div>

        <div className="feat-additional">
          <div className="feat-additional__label-wrap">
            <h3 className="feat-additional__label">Additional features</h3>
          </div>

          <div className="feat-additional__list-wrap">
            <div className="feat-additional__list">
              {FEAT_ADDITIONAL_FEATURES.map((item, index) => (
                <a
                  key={item.title}
                  href={item.href}
                  className={`feat-additional__item${
                    index !== FEAT_ADDITIONAL_FEATURES.length - 1 ? ' feat-additional__item--lined' : ''
                  }`}
                >
                  <span className="feat-additional__item-ico" aria-hidden>
                    <svg viewBox="0 0 30 30" width={30} height={30}>
                      <path d={COHERENCE_PILL_PATHS[item.pathKey]} fill="currentColor" />
                    </svg>
                  </span>
                  <span className="feat-additional__item-copy">
                    <span className="feat-additional__item-title">{item.title}</span>
                    <span className="feat-additional__item-body">{item.body}</span>
                  </span>
                  <span className="feat-additional__item-arrow" aria-hidden>
                    <svg viewBox="0 0 24 24" width={24} height={24}>
                      <path d="M14 4.92969L12.5 6.42969L17.0703 11H3V13H17.0703L12.5 17.5703L14 19.0703L21.0703 12L14 4.92969Z" fill="currentColor" />
                    </svg>
                  </span>
                </a>
              ))}
            </div>
          </div>
        </div>

        <section className="feat-cta" aria-label="CTA conclusion">
          <img
            className="feat-cta__bg"
            src="/images/howItWorks/Feature/FeaturePill/R1.png"
            alt="Smiling young man with dreadlocks wearing a green sweater sitting at a round table using a laptop."
            loading="lazy"
            decoding="async"
          />
          <div className="feat-cta__overlay">
            <div className="feat-cta__headline">
              <span>Meet PreClear</span>
              <span>Built for Accounting</span>
            </div>

            <a href="/contact" className="feat-cta__pill">
              <span className="feat-cta__pill-icon">
                <img src="/images/Logo/PCBlackLogo.png" alt="" aria-hidden loading="lazy" decoding="async" />
              </span>
              <span className="feat-cta__pill-copy">
                <span className="feat-cta__pill-title">Start today</span>
                <span className="feat-cta__pill-sub">PreClear onboarding</span>
              </span>
            </a>
          </div>
        </section>
      </div>
    </section>
    </>
  );
}
