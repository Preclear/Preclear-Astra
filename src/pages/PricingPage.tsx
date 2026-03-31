import { useState } from 'react';
import { Link } from 'react-router-dom';

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

const PRICING_COMPARE_ROWS = [
  {
    title: 'Task management',
    subtitle: 'Stay on top of daily work',
    starter: { type: 'dot' as const },
    pro: { type: 'dot-text' as const, text: '+ AI enhancements' },
  },
  {
    title: 'Shared calendar',
    subtitle: 'Keep events, tasks and shifts aligned',
    starter: { type: 'dot' as const },
    pro: { type: 'dot' as const },
  },
  {
    title: 'File uploads',
    subtitle: 'Attach files to tasks or notes',
    starter: { type: 'text' as const, text: 'Up to 1GB' },
    pro: { type: 'text' as const, text: 'Unlimited' },
  },
  {
    title: 'Insights dashboard',
    subtitle: 'View simple stats at a glance',
    starter: { type: 'dash' as const },
    pro: { type: 'dot' as const },
  },
  {
    title: 'Permissions',
    subtitle: 'Control who sees what',
    starter: { type: 'dash' as const },
    pro: { type: 'dot' as const },
  },
  {
    title: 'Dedicated support',
    subtitle: 'Access to our customer concierge',
    starter: { type: 'dash' as const },
    pro: { type: 'muted-text' as const, text: '24/7, 365' },
  },
] as const;

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

export default function PricingPage() {
  const [proBilling, setProBilling] = useState<'monthly' | 'annual'>('monthly');
  const [openCommonFaq, setOpenCommonFaq] = useState(0);

  return (
    <>
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
                        <path d="M3 7.9l2.3 2.3L12 3.5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
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
                Most Popular
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
                <div className="hiw-pricing__toggle" role="tablist" aria-label="Billing interval">
                  <button
                    type="button"
                    role="tab"
                    aria-selected={proBilling === 'monthly'}
                    className={proBilling === 'monthly' ? 'is-active' : ''}
                    onClick={() => setProBilling('monthly')}
                  >
                    Monthly
                  </button>
                  <button
                    type="button"
                    role="tab"
                    aria-selected={proBilling === 'annual'}
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
                        <path d="M3 7.9l2.3 2.3L12 3.5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
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

      <section className="pricing-compare" aria-label="Compare plans">
        <img src="/images/Home/HeroSection/HeroClip.png" className="hero-deco hero-deco--clip" aria-hidden="true" />
        <img src="/images/Home/HeroSection/HeroPin.png" className="hero-deco hero-deco--pin" aria-hidden="true" />
        <img src="/images/Home/HeroSection/HeroHold.png" className="hero-deco hero-deco--hold" aria-hidden="true" />
        <div className="pricing-compare__inner">
          <div className="pricing-compare__table">
            <div className="pricing-compare__row pricing-compare__row--head">
              <div className="pricing-compare__head-muted">Compare plans</div>
              <div>Starter</div>
              <div>Pro</div>
            </div>

            {PRICING_COMPARE_ROWS.map((row) => (
              <div key={row.title} className="pricing-compare__row">
                <div className="pricing-compare__feature">
                  <div>{row.title}</div>
                  <div className="pricing-compare__feature-sub">{row.subtitle}</div>
                </div>
                <div className="pricing-compare__cell">
                  {row.starter.type === 'dot' && <span className="pricing-compare__dot" aria-hidden />}
                  {row.starter.type === 'dash' && <span className="pricing-compare__dash" aria-hidden />}
                  {row.starter.type === 'text' && row.starter.text}
                </div>
                <div className="pricing-compare__cell">
                  {row.pro.type === 'dot' && <span className="pricing-compare__dot" aria-hidden />}
                  {row.pro.type === 'dash' && <span className="pricing-compare__dash" aria-hidden />}
                  {row.pro.type === 'text' && row.pro.text}
                  {row.pro.type === 'muted-text' && <span className="pricing-compare__muted">{row.pro.text}</span>}
                  {row.pro.type === 'dot-text' && (
                    <span className="pricing-compare__dot-text">
                      <span className="pricing-compare__dot" aria-hidden />
                      <span>{row.pro.text}</span>
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="hiw-cfaq" aria-labelledby="hiw-cfaq-heading">
        <div className="hiw-cfaq__inner">
          <div className="hiw-cfaq__sidebar">
            <p className="hiw-cfaq__eyebrow" aria-hidden="true">FAQ</p>
            <h2 id="hiw-cfaq-heading" className="hiw-cfaq__title">
              Common<br />questions
            </h2>
            <p className="hiw-cfaq__count" aria-hidden="true">
              {COMMON_QUESTIONS.length} topics
            </p>
          </div>

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

      <img
        src="/images/howItWorks/Feature/shadow.png"
        alt=""
        className="hiw__shadow-overlay"
        aria-hidden="true"
      />
    </>
  );
}
