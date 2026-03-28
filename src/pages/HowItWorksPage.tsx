import { useRef, useState } from 'react';
import { Link } from 'react-router-dom';

const LOGOS = [1, 2, 3, 4, 5, 6, 7, 8];

const PAIN_POINTS = [
  'You are digging through county websites trying to figure out if your project needs a permit.',
  'You are not sure what documents, drawings, or forms your city requires before submitting.',
  'You start a project and only later discover zoning rules or inspection requirements you did not know about.',
];

/** Matches FAQ accordion order — cardA … cardD in /images/howItWorks/cards/ */
const FAQ_CARD_IMAGES = [
  '/images/howItWorks/cards/cardA.png',
  '/images/howItWorks/cards/cardB.png',
  '/images/howItWorks/cards/cardC.png',
  '/images/howItWorks/cards/cardD.png',
] as const;



const PRICING_STARTER_FEATURES = [
  '3 permit pre-checks per month',
  'Instant yes/no permit determination',
  'Basic county lookup (50+ jurisdictions)',
  'Downloadable PDF checklist',
  'Email support',
] as const;

const PRICING_PRO_FEATURES = [
  'Unlimited permit pre-checks',
  'Full threshold question analysis',
  'Jurisdiction auto-detection',
  'Auto-filled permit application forms',
  'Inspection prep guide per project',
  'Code citation with every result',
  'API access for integrations',
  'Priority email support (next business day)',
  'Project history saved',
] as const;

const SATISFIED_CUSTOMERS: {
  label: string;
  description: string;
  stat: string;
  name: string;
}[] = [
  {
    label: 'On-time payments',
    description:
      'Teams that switched to PreClear report faster quoting cycles and fewer back-and-forth revisions with jurisdictions.',
    stat: '76%',
    name: 'Sarah B. James',
  },
  {
    label: 'Quote turnaround',
    description:
      'Average time from project intake to a shareable permit summary, based on internal beta cohort data.',
    stat: '4x',
    name: 'Marcus T. Chen',
  },
  {
    label: 'Support satisfaction',
    description:
      'Weighted score from post-session surveys where users rated clarity of requirements and next steps.',
    stat: '5.0',
    name: 'Elena V. Ruiz',
  },
  {
    label: 'First-pass completeness',
    description:
      'Share of pre-checks that surfaced every required document for the selected scope before filing.',
    stat: '68%',
    name: 'Jordan K. Patel',
  },
  {
    label: 'Hours saved',
    description:
      'Self-reported median weekly time reclaimed by replacing manual county site research with PreClear.',
    stat: '12 hrs',
    name: 'Alex D. Morgan',
  },
  {
    label: 'Jurisdictions covered',
    description:
      'Active lookup templates and rule packs available for county and municipal permit pre-checks.',
    stat: '50+',
    name: 'Riley N. Foster',
  },
  {
    label: 'Renewal retention',
    description:
      'Professional plan accounts that renewed after the first 90 days during pilot programs.',
    stat: '92%',
    name: 'Taylor S. Brooks',
  },
];

const FAQS = [
  {
    q: 'What is a permit pre-check?',
    a: 'A permit pre-check reviews your project scope, address, and property type against local zoning rules and building codes before you submit. It helps catch problems early and ensures your application is complete.',
  },
  {
    q: 'What documents do I need?',
    a: 'Documents vary by project type. Common requirements include site plans, floor plans, contractor licenses, and proof of ownership. PreClear lists exactly what your jurisdiction requires.',
  },
  {
    q: 'Will my project pass inspection?',
    a: 'We flag known code conflicts and zoning issues before submission so you can resolve them upfront rather than after a failed inspection.',
  },
  {
    q: 'Stop checking permits the old way.',
    a: 'Most homeowners spend hours on county websites only to get rejected on technicalities. PreClear automates the entire compliance lookup in minutes.',
  },
];

const COMMON_QUESTIONS = [
  {
    q: 'What is a permit compliance pre-check?',
    a: 'A pre-check reviews your project details — scope, address, and type — against local zoning codes, building codes, and permit requirements before you submit. It helps you catch problems early and submit complete applications.',
  },
  {
    q: 'Which jurisdictions do you support?',
    a: 'We cover 50+ counties and municipalities today, with new jurisdictions added regularly. Enter your address in PreClear to confirm support for your property.',
  },
  {
    q: 'Is this a substitute for a licensed architect or permit expediter?',
    a: 'No. PreClear is decision-support software. Licensed architects, engineers, and expediters still prepare official drawings and shepherd filings where your jurisdiction requires stamped plans or representation.',
  },
  {
    q: 'How accurate is the code conflict detection?',
    a: 'We flag likely issues from published codes and zoning layers you provide. Accuracy depends on current municipal data and how precisely you describe the project. Always confirm final interpretations with your local authority.',
  },
  {
    q: 'Can I export my pre-check results?',
    a: 'Yes. Paid plans include exportable summaries and PDF checklists you can attach to permit packages or share with contractors and consultants.',
  },
] as const;

export default function HowItWorksPage() {
  const [openFaq, setOpenFaq] = useState(0);
  const [openCommonFaq, setOpenCommonFaq] = useState(0);
  const [proBilling, setProBilling] = useState<'monthly' | 'annual'>('monthly');
  const satisfiedScrollRef = useRef<HTMLDivElement>(null);

  const scrollSatisfied = (dir: -1 | 1) => {
    const el = satisfiedScrollRef.current;
    if (!el) return;
    const card = el.querySelector('.hiw-tcust__card');
    const gap = 22;
    const step = (card instanceof HTMLElement ? card.offsetWidth : 300) + gap;
    el.scrollBy({ left: dir * step, behavior: 'smooth' });
  };

  return (
    <div className="hiw">

      {/* ── Full-viewport fixed shadow overlay ── */}
      <img
        src="/images/howItWorks/Feature/shadow.png"
        alt=""
        className="hiw__shadow-overlay"
        aria-hidden="true"
      />

      {/* ── Hero ── */}
      <section className="hiw__hero">
        <h1 className="hiw__title">
          Stop Guessing.{' '}
          <span className="hiw__title-accent">Start Building.</span>
        </h1>
        <p className="hiw__subtitle">
          Run a permit pre-check before you submit. We compare your project to local zoning
          and building codes so you catch issues in minutes, not weeks. It's like having a local building inspector in your pocket.
        </p>
      </section>

      {/* ── Main two-col ── */}
      <section className="hiw__body">

        {/* Left — project card image (switches with accordion) */}
        <div className="hiw__card-wrap">
          <div className="hiw__project-card hiw__project-card--image">
            <img
              key={openFaq}
              src={FAQ_CARD_IMAGES[openFaq]}
              alt={`PreClear preview — ${FAQS[openFaq].q}`}
              className={`hiw__card-image${openFaq === 3 ? ' hiw__card-image--d' : ''}`}
            />
          </div>
        </div>

        {/* Right — FAQ accordion */}
        <div className="hiw__faq">
          {FAQS.map((item, i) => (
            <div
              key={i}
              className={`hiw__faq-item${openFaq === i ? ' hiw__faq-item--open' : ''}`}
              onClick={() => setOpenFaq(i)}
            >
              <div className="hiw__faq-row">
                <p className="hiw__faq-q">{item.q}</p>
                <span className="hiw__faq-icon">{openFaq === i ? '−' : '+'}</span>
              </div>
              {openFaq === i && <p className="hiw__faq-a">{item.a}</p>}
            </div>
          ))}

        </div>

      </section>

      {/* ── Logo marquee ── */}
      <div className="hiw__marquee-outer">
        <div className="hiw__marquee-wrap">
          <span className="hiw__marquee-label">Businesses using PreClear</span>
          <div className="hiw__marquee-track-wrap">
            <div className="hiw__marquee-fade hiw__marquee-fade--left" />
            <div className="hiw__marquee-track">
              <div className="hiw__marquee-inner">
                {[...LOGOS, ...LOGOS, ...LOGOS].map((n, i) => (
                  <img
                    key={i}
                    src={`/images/howItWorks/PartnerLogos/PLogo${n}.png`}
                    alt={`Partner logo ${n}`}
                    className="hiw__marquee-logo"
                  />
                ))}
              </div>
            </div>
            <div className="hiw__marquee-fade hiw__marquee-fade--right" />
          </div>
        </div>
      </div>

      {/* ── Pain points (deco + checklist + CTA) ── */}
      <section className="hiw-pain" aria-labelledby="hiw-pain-heading">
        <img
          src="/images/Home/HeroSection/HeroClip.png"
          alt=""
          className="hiw-pain__deco hiw-pain__deco--clip"
          aria-hidden="true"
        />
        <img
          src="/images/Home/HeroSection/HeroPin.png"
          alt=""
          className="hiw-pain__deco hiw-pain__deco--pin"
          aria-hidden="true"
        />
        <img
          src="/images/Home/HeroSection/HeroHold.png"
          alt=""
          className="hiw-pain__deco hiw-pain__deco--hold"
          aria-hidden="true"
        />

        <div className="hiw-pain__inner">
            <p className="hiw-pain__stamp">Project pre-check</p>
            <p className="hiw-pain__eyebrow">Sick of settling for makeshift solutions?</p>
            <h2 id="hiw-pain-heading" className="hiw__title hiw-pain__headline">
              If any of these sound familiar,{' '}
              <span className="hiw__title-accent">PreClear will save you hours.</span>
            </h2>

            <ul className="hiw-pain__list">
              {PAIN_POINTS.map((text, i) => (
                <li key={text} className="hiw-pain__item">
                  <span className="hiw-pain__item-num" aria-hidden="true">0{i + 1}</span>
                  <img
                    src="/images/howItWorks/checkmark.png"
                    alt=""
                    className="hiw-pain__check"
                    width={36}
                    height={36}
                  />
                  <span className="hiw-pain__text">{text}</span>
                </li>
              ))}
            </ul>

            <Link to="/" className="hiw-pain__cta">
              Try PreClear
            </Link>
          </div>
      </section>

      {/* ── Benefits grid (below checklist) ── */}
      <section className="hiw-benefits" aria-labelledby="hiw-benefits-heading">
        <img
          src="/images/howItWorks/fram2/measure2.png"
          alt=""
          className="hiw-benefits__ruler-divider"
          aria-hidden="true"
        />
        <div className="hiw-benefits__inner">
          <div className="hiw-benefits__header-row">
            <h2 id="hiw-benefits-heading" className="hiw__title hiw-benefits__headline">
              How PreClear helps you
              <br />
              <span className="hiw__title-accent">build with less friction.</span>
            </h2>
            <Link to="/" className="hiw-benefits__cta-btn">
              Start your pre-check
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
                <path d="M3 8h10M9 4l4 4-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </Link>
          </div>

          <ul className="hiw-benefits__grid">
            {([1,2,3,4] as const).map((n) => (
              <li key={n} className="hiw-benefits__cell">
                <img
                  src={`/images/howItWorks/Feature/Feature${n}.png`}
                  alt={`PreClear feature ${n}`}
                  className="hiw-benefits__feat-img"
                />
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* ── Pricing (dark grid + layered cards) ── */}
      <section className="hiw-pricing" aria-labelledby="hiw-pricing-heading">
        <div className="hiw-pricing__inner">
          <p className="hiw-pricing__eyebrow">Sick of settling for makeshift solutions?</p>
          <h2 id="hiw-pricing-heading" className="hiw-pricing__heading">
            Pricing That Grows With Your Project
          </h2>

          <div className="hiw-pricing__cards">
            <div className="hiw-pricing__shell hiw-pricing__shell--starter">
              <div className="hiw-pricing__card">
                <h3 className="hiw-pricing__tier">Starter</h3>
                <p className="hiw-pricing__subtitle">For homeowners starting their first project</p>
                <p className="hiw-pricing__price hiw-pricing__price--free">Free</p>
                <hr className="hiw-pricing__divider" aria-hidden="true" />
                <ul className="hiw-pricing__features">
                  {PRICING_STARTER_FEATURES.map((line) => (
                    <li key={line} className="hiw-pricing__feature">
                      <svg width="15" height="15" viewBox="0 0 15 15" fill="none" aria-hidden="true" className="hiw-pricing__check">
                        <circle cx="7.5" cy="7.5" r="6.75" stroke="#cbd5e1" strokeWidth="1"/>
                        <path d="M4.5 7.5l2 2 4-4" stroke="#475569" strokeWidth="1.35" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                      <span>{line}</span>
                    </li>
                  ))}
                </ul>
              </div>
              <div className="hiw-pricing__shelf">
                <Link to="/" className="hiw-pricing__cta hiw-pricing__cta--inverse">
                  Get Started
                </Link>
              </div>
            </div>

            <div className="hiw-pricing__shell hiw-pricing__shell--pro">
              <div className="hiw-pricing__pro-badge" aria-label="Most popular plan">
                Most popular
              </div>
              <div className="hiw-pricing__card hiw-pricing__card--pro">
                <h3 className="hiw-pricing__tier">Professional</h3>
                <p className="hiw-pricing__subtitle">For homeowners with complex projects</p>
                <p className="hiw-pricing__price">
                  {proBilling === 'monthly' ? (
                    <>
                      $39<span className="hiw-pricing__price-unit">/month</span>
                    </>
                  ) : (
                    <>
                      $31<span className="hiw-pricing__price-unit">/mo</span>
                      <span className="hiw-pricing__price-note"> billed annually</span>
                    </>
                  )}
                </p>
                <div
                  className="hiw-pricing__toggle"
                  role="group"
                  aria-label="Billing period"
                >
                  <button
                    type="button"
                    className={proBilling === 'monthly' ? 'is-active' : ''}
                    onClick={() => setProBilling('monthly')}
                  >
                    Monthly
                  </button>
                  <button
                    type="button"
                    className={proBilling === 'annual' ? 'is-active' : ''}
                    onClick={() => setProBilling('annual')}
                  >
                    Annually
                  </button>
                </div>
                <hr className="hiw-pricing__divider" aria-hidden="true" />
                <ul className="hiw-pricing__features">
                  {PRICING_PRO_FEATURES.map((line) => (
                    <li key={line} className="hiw-pricing__feature">
                      <svg width="15" height="15" viewBox="0 0 15 15" fill="none" aria-hidden="true" className="hiw-pricing__check">
                        <circle cx="7.5" cy="7.5" r="6.75" stroke="rgba(255,255,255,0.22)" strokeWidth="1"/>
                        <path d="M4.5 7.5l2 2 4-4" stroke="rgba(255,255,255,0.75)" strokeWidth="1.35" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                      <span>{line}</span>
                    </li>
                  ))}
                </ul>
              </div>
              <div className="hiw-pricing__shelf">
                <Link to="/" className="hiw-pricing__cta hiw-pricing__cta--amber">
                  Start Free Trial
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Satisfied customers ── */}
      <section className="hiw-tcust" aria-labelledby="hiw-tcust-heading">
        <div className="hiw-tcust__inner">

          {/* Header row: title left · nav buttons right */}
          <div className="hiw-tcust__header">
            <div className="hiw-tcust__header-text">
              <p className="hiw-tcust__eyebrow" aria-hidden="true">From our community</p>
              <h2 id="hiw-tcust-heading" className="hiw-tcust__heading">
                Results from<br />the field.
              </h2>
            </div>
            <div className="hiw-tcust__nav" role="group" aria-label="Carousel navigation">
              <button
                type="button"
                className="hiw-tcust__nav-btn"
                aria-label="Scroll left"
                onClick={() => scrollSatisfied(-1)}
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                  <path d="M15 6l-6 6 6 6" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </button>
              <button
                type="button"
                className="hiw-tcust__nav-btn"
                aria-label="Scroll right"
                onClick={() => scrollSatisfied(1)}
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                  <path d="M9 6l6 6-6 6" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </button>
            </div>
          </div>

          {/* Carousel */}
          <div
            ref={satisfiedScrollRef}
            className="hiw-tcust__track"
            tabIndex={0}
            role="list"
            aria-label="Customer highlights"
          >
            {SATISFIED_CUSTOMERS.map((item) => (
              <article key={item.label} className="hiw-tcust__card" role="listitem">
                <p className="hiw-tcust__label">{item.label}</p>
                <p className="hiw-tcust__stat">{item.stat}</p>
                <p className="hiw-tcust__desc">{item.description}</p>
                <p className="hiw-tcust__name">{item.name}</p>
              </article>
            ))}
          </div>

        </div>
      </section>

      {/* ── Common questions ── */}
      <section className="hiw-cfaq" aria-labelledby="hiw-cfaq-heading">
        <div className="hiw-cfaq__inner">

          {/* Left: sticky label column */}
          <div className="hiw-cfaq__sidebar">
            <p className="hiw-cfaq__eyebrow" aria-hidden="true">FAQ</p>
            <h2 id="hiw-cfaq-heading" className="hiw-cfaq__title">
              Common<br />questions
            </h2>
            <p className="hiw-cfaq__count" aria-hidden="true">
              {COMMON_QUESTIONS.length} topics
            </p>
          </div>

          {/* Right: accordion list */}
          <div className="hiw-cfaq__list" role="list">
            {COMMON_QUESTIONS.map((item, i) => {
              const isOpen = openCommonFaq === i;
              return (
                <div
                  key={item.q}
                  className={`hiw-cfaq__item${isOpen ? ' hiw-cfaq__item--open' : ''}`}
                  role="listitem"
                >
                  <button
                    type="button"
                    className="hiw-cfaq__trigger"
                    aria-expanded={isOpen}
                    aria-controls={`hiw-cfaq-panel-${i}`}
                    id={`hiw-cfaq-trigger-${i}`}
                    onClick={() => setOpenCommonFaq(isOpen ? -1 : i)}
                  >
                    <span className="hiw-cfaq__q">{item.q}</span>
                    <span className="hiw-cfaq__icon" aria-hidden="true">
                      <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                        <path d="M8 2v12" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"
                          className="hiw-cfaq__icon-v" />
                        <path d="M2 8h12" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
                      </svg>
                    </span>
                  </button>
                  {isOpen && (
                    <div
                      id={`hiw-cfaq-panel-${i}`}
                      className="hiw-cfaq__panel"
                      role="region"
                      aria-labelledby={`hiw-cfaq-trigger-${i}`}
                    >
                      <p className="hiw-cfaq__a">{item.a}</p>
                    </div>
                  )}
                </div>
              );
            })}
          </div>

        </div>
      </section>

      {/* ── Bottom CTA ── */}
      <section className="hiw-bcta" aria-labelledby="hiw-bcta-heading">
        <div className="hiw-bcta__canvas">
          {/* Layered overlay for depth + readability */}
          <div className="hiw-bcta__overlay" aria-hidden="true" />

          {/* All content on top of image */}
          <div className="hiw-bcta__body">

            {/* Top row: eyebrow + aura badge */}
            <div className="hiw-bcta__top-row">
              <p className="hiw-bcta__eyebrow" aria-hidden="true">
                PreClear
              </p>
              <div className="hiw-bcta__aura-badge">
                <span className="hiw-bcta__aura-dot" aria-hidden="true" />
                <span>Meet Aura</span>
              </div>
            </div>

            {/* Main CTA block */}
            <div className="hiw-bcta__main">
              <h2 id="hiw-bcta-heading" className="hiw-bcta__title">
                Build with confidence.<br />
                <span className="hiw-bcta__title-soft">Start your pre-check free.</span>
              </h2>
              <p className="hiw-bcta__sub">
                Know exactly what your project needs before you file — no guesswork, no surprises.
              </p>
              <div className="hiw-bcta__actions">
                <Link to="/" className="hiw-bcta__btn hiw-bcta__btn--primary">
                  Get Started
                </Link>
                <Link to="/" className="hiw-bcta__btn hiw-bcta__btn--ghost">
                  See how it works
                  <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
                    <path d="M2.5 7h9M8 3.5l3.5 3.5L8 10.5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </Link>
              </div>
            </div>

            {/* Bottom-right: Aura detail */}
            <div className="hiw-bcta__aura-detail">
              <p className="hiw-bcta__aura-tagline">Your personal AI agent</p>
              <Link to="/" className="hiw-bcta__learn">
                Learn more →
              </Link>
            </div>

          </div>
        </div>
      </section>
    </div>
  );
}
