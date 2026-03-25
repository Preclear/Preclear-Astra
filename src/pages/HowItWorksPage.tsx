import { useState } from 'react';

const LOGOS = [1, 2, 3, 4, 5, 6, 7, 8];

/** Matches FAQ accordion order — cardA … cardD in /images/howItWorks/cards/ */
const FAQ_CARD_IMAGES = [
  '/images/howItWorks/cards/cardA.png',
  '/images/howItWorks/cards/cardB.png',
  '/images/howItWorks/cards/cardC.png',
  '/images/howItWorks/cards/cardD.png',
] as const;

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

export default function HowItWorksPage() {
  const [openFaq, setOpenFaq] = useState(0);

  return (
    <div className="hiw">

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

      {/* ── Main two-col ── */}
      <section className="hiw__body">

        {/* Left — project card image (switches with accordion) */}
        <div className="hiw__card-wrap">
          <div className="hiw__project-card hiw__project-card--image">
            <img
              key={openFaq}
              src={FAQ_CARD_IMAGES[openFaq]}
              alt={`PreClear preview — ${FAQS[openFaq].q}`}
              className="hiw__card-image"
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

          {/* Pre-check CTA block */}
          <div className="hiw__cta-card">
            <div className="hiw__cta-stat">
              <span className="hiw__cta-stat-n">94<sup>%</sup></span>
              <span className="hiw__cta-stat-l">of permit issues caught before submission — not after rejection.</span>
            </div>
            <div className="hiw__cta-rule" />
            <div className="hiw__cta-stat">
              <span className="hiw__cta-stat-n">3<sup>min</sup></span>
              <span className="hiw__cta-stat-l">average time to complete a full pre-check. No review queue.</span>
            </div>
            <div className="hiw__cta-rule" />
            <div className="hiw__cta-action">
              <p className="hiw__cta-action-copy">Free. No account required.</p>
              <a href="#" className="hiw__cta-btn">
                Run my pre-check
                <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                  <path d="M1.5 6h9M7 2.5L10.5 6 7 9.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </a>
            </div>
          </div>
        </div>

      </section>
    </div>
  );
}
