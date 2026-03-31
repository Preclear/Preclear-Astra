import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { paths } from '../routes';

const DEMO_ADDRESS = '123 Main St, Baltimore, MD 21201';

const PROJECT_OPTIONS = [
  'Deck',
  'Room Addition',
  'Kitchen Remodel',
  'Fence',
  'ADU / Guest House',
  'Window Replacement',
] as const;

/* Frame 3 — deep results panel */
const CHECKS = [
  { label: 'Location identified',      detail: 'Baltimore City, MD'   },
  { label: 'Zoning rules loaded',      detail: 'R-6 Residential Zone' },
  { label: 'Permit triggers detected', detail: '3 requirements found' },
  { label: 'Code checks complete',     detail: 'IBC 2021 applied'     },
] as const;

const HIW4_DOCS = [
  'Site plan',
  'Structural drawings',
  'Permit application form',
  'Lot survey / plat',
] as const;

const HIW4_FLAGS = [
  'Setback requirement applies',
  'Inspection required after framing',
] as const;

const HIW4_CODES = [
  'IBC 2021 Section XYZ',
  'Local zoning ordinance',
] as const;

/** Decorative PNGs — `/public/images/howItWorks/ObjAsset` (F2: 3, F3: 2, F4: 3) */
const HIW_OBJ = '/images/howItWorks/ObjAsset' as const;
// Map slots: ladder left; toolbox + blueprint stacked on right (top / bottom).
const HIW_FRAME2_OBJ = [
  `${HIW_OBJ}/Ladder.png`,
  `${HIW_OBJ}/Toolbox.png`,
  `${HIW_OBJ}/Blueprint.png`,
] as const;
const HIW_FRAME3_OBJ = [
  `${HIW_OBJ}/Drill.png`,
  `${HIW_OBJ}/Hammer.png`,
] as const;
const HIW_FRAME4_OBJ = [
  `${HIW_OBJ}/Hardhat.png`,
  `${HIW_OBJ}/Wrench.png`,
  `${HIW_OBJ}/Yellowtape.png`,
] as const;

type Phase = 'idle' | 'typing' | 'typed' | 'dropdown' | 'selected' | 'cta';

export default function HowItWorksPage() {
  // ── Frame 1 ──────────────────────────────────────────────────────────────
  const [phase, setPhase]                     = useState<Phase>('idle');
  const [displayAddress, setDisplayAddress]   = useState('');
  const [dropdownOpen, setDropdownOpen]       = useState(false);
  const [selectedProject, setSelectedProject] = useState('');
  const [ctaActive, setCtaActive]             = useState(false);
  const idsRef = useRef<ReturnType<typeof setTimeout>[]>([]);

  useEffect(() => {
    function schedule(fn: () => void, ms: number) {
      const id = setTimeout(fn, ms);
      idsRef.current.push(id);
    }
    function run() {
      idsRef.current = [];
      setPhase('idle');
      setDisplayAddress('');
      setDropdownOpen(false);
      setSelectedProject('');
      setCtaActive(false);

      schedule(() => {
        setPhase('typing');
        let i = 0;
        function typeChar() {
          i++;
          setDisplayAddress(DEMO_ADDRESS.slice(0, i));
          if (i < DEMO_ADDRESS.length) {
            schedule(typeChar, 78 + Math.random() * 36);
          } else {
            setPhase('typed');
            schedule(() => {
              setDropdownOpen(true);
              setPhase('dropdown');
              schedule(() => {
                setSelectedProject('Deck');
                setDropdownOpen(false);
                setPhase('selected');
                schedule(() => {
                  setCtaActive(true);
                  setPhase('cta');
                  schedule(() => {
                    setCtaActive(false);
                    schedule(run, 2800);
                  }, 2200);
                }, 1000);
              }, 1750);
            }, 1200);
          }
        }
        typeChar();
      }, 1500);
    }
    run();
    return () => { idsRef.current.forEach(clearTimeout); };
  }, []);

  const addressActive =
    phase === 'typing' || phase === 'typed' ||
    phase === 'dropdown' || phase === 'selected' || phase === 'cta';
  const selectActive = phase === 'dropdown' || phase === 'selected' || phase === 'cta';

  // ── Frame 3 — deep results panel ─────────────────────────────────────────
  const s3Ref    = useRef<HTMLElement>(null);
  const s3IdsRef = useRef<ReturnType<typeof setTimeout>[]>([]);
  const [s3Active,   setS3Active]   = useState(false);
  const [s3Checking, setS3Checking] = useState(-1);
  const [s3Checked,  setS3Checked]  = useState(0);
  const [s3Progress, setS3Progress] = useState(0);
  const [s3Complete, setS3Complete] = useState(false);

  useEffect(() => {
    const el = s3Ref.current;
    if (!el) return;

    function s3Schedule(fn: () => void, ms: number) {
      const id = setTimeout(fn, ms);
      s3IdsRef.current.push(id);
    }
    function runS3() {
      s3IdsRef.current.forEach(clearTimeout);
      s3IdsRef.current = [];
      setS3Active(false);
      setS3Checking(-1);
      setS3Checked(0);
      setS3Progress(0);
      setS3Complete(false);

      s3Schedule(() => { setS3Active(true);    setS3Progress(5);   }, 300);
      s3Schedule(() => { setS3Checking(0);     setS3Progress(22);  }, 700);
      s3Schedule(() => { setS3Checked(1); setS3Checking(1); setS3Progress(42); }, 1250);
      s3Schedule(() => { setS3Checked(2); setS3Checking(2); setS3Progress(64); }, 1900);
      s3Schedule(() => { setS3Checked(3); setS3Checking(3); setS3Progress(86); }, 2600);
      s3Schedule(() => { setS3Checked(4); setS3Checking(-1); setS3Progress(100); }, 3250);
      s3Schedule(() => { setS3Complete(true); }, 3900);
      s3Schedule(runS3, 6400);
    }

    const observer = new IntersectionObserver(
      (entries) => { if (entries[0].isIntersecting) runS3(); },
      { threshold: 0.2 },
    );
    observer.observe(el);
    return () => {
      observer.disconnect();
      s3IdsRef.current.forEach(clearTimeout);
    };
  }, []);

  return (
    <>
      {/* ═══════════════════════════════════════════
          FRAME 1 — Enter Your Project
      ═══════════════════════════════════════════ */}
      <div className="hiw1">
        <p className="hiw1__step-label">Step 1 of 4 — Enter Your Project</p>
        <h1 className="hiw1__headline">
          Start your permit check<br />
          <em className="hiw1__headline-em">in under 60 seconds</em>
        </h1>

        {/* ── Browser mockup frame ── */}
        <div className="hiw1__browser">
          <div className="hiw1__chrome" aria-hidden="true">
            <div className="hiw1__traffic">
              <span className="hiw1__tdot hiw1__tdot--r" />
              <span className="hiw1__tdot hiw1__tdot--y" />
              <span className="hiw1__tdot hiw1__tdot--g" />
            </div>
            <div className="hiw1__url-bar">
              <svg width="9" height="9" viewBox="0 0 24 24" fill="none"
                stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
                <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
              </svg>
              app.preclear.io/check
            </div>
          </div>

          {/* Address */}
          <div className={`hiw1__row${addressActive ? ' hiw1__row--active' : ''}`}>
            <span className="hiw1__icon" aria-hidden="true">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none"
                stroke="currentColor" strokeWidth="1.85" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z"/>
                <circle cx="12" cy="9" r="2.5"/>
              </svg>
            </span>
            <div className="hiw1__row-body">
              <span className="hiw1__row-label">Property address</span>
              <div className="hiw1__row-value">
                {displayAddress
                  ? <span className="hiw1__val">{displayAddress}</span>
                  : <span className="hiw1__ph">Enter property address</span>
                }
                {phase === 'typing' && <span className="hiw1__caret" aria-hidden="true" />}
              </div>
            </div>
          </div>

          <div className="hiw1__divider" aria-hidden="true" />

          {/* Project type */}
          <div className={`hiw1__row hiw1__row--select${selectActive ? ' hiw1__row--active' : ''}`}>
            <span className="hiw1__icon" aria-hidden="true">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none"
                stroke="currentColor" strokeWidth="1.85" strokeLinecap="round" strokeLinejoin="round">
                <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
                <polyline points="9 22 9 12 15 12 15 22"/>
              </svg>
            </span>
            <div className="hiw1__row-body">
              <span className="hiw1__row-label">Project type</span>
              <div className="hiw1__row-value">
                {selectedProject
                  ? <span className="hiw1__val">{selectedProject}</span>
                  : <span className="hiw1__ph">Select project type</span>
                }
              </div>
            </div>
            <span className={`hiw1__chevron${dropdownOpen ? ' hiw1__chevron--open' : ''}`} aria-hidden="true">
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none"
                stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M6 9l6 6 6-6"/>
              </svg>
            </span>
            {dropdownOpen && (
              <ul className="hiw1__dropdown" role="listbox" aria-label="Project type options">
                {PROJECT_OPTIONS.map((opt) => (
                  <li key={opt} role="option" aria-selected={opt === selectedProject}
                    className={`hiw1__dropdown-item${opt === 'Deck' ? ' hiw1__dropdown-item--hi' : ''}`}>
                    {opt}
                  </li>
                ))}
              </ul>
            )}
          </div>

          <div className="hiw1__divider" aria-hidden="true" />

          {/* Description */}
          <div className="hiw1__row hiw1__row--desc">
            <span className="hiw1__icon hiw1__icon--top" aria-hidden="true">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none"
                stroke="currentColor" strokeWidth="1.85" strokeLinecap="round" strokeLinejoin="round">
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                <polyline points="14 2 14 8 20 8"/>
                <line x1="16" y1="13" x2="8" y2="13"/>
                <line x1="16" y1="17" x2="8" y2="17"/>
              </svg>
            </span>
            <div className="hiw1__row-body">
              <span className="hiw1__row-label">
                Description <span className="hiw1__opt">(optional)</span>
              </span>
              <span className="hiw1__ph hiw1__ph--sm">Briefly describe your project</span>
            </div>
          </div>

          {/* CTA */}
          <div className="hiw1__cta-area">
            <button type="button"
              className={`hiw1__cta-btn${ctaActive ? ' hiw1__cta-btn--active' : ''}`}>
              Start Pre-Check
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none"
                stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
                aria-hidden="true">
                <line x1="5" y1="12" x2="19" y2="12"/>
                <polyline points="12 5 19 12 12 19"/>
              </svg>
            </button>
            <p className="hiw1__trust">
              <svg width="11" height="11" viewBox="0 0 24 24" fill="none"
                stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
                aria-hidden="true">
                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
              </svg>
              Works across 50+ local jurisdictions
            </p>
          </div>
        </div>

        <p className="hiw1__sub">
          Instantly check permits, zoning rules, and required documents before you submit.
        </p>
        <div className="hiw1__flow-cue" aria-hidden="true">
          <svg className="hiw1__flow-arrow" width="16" height="16" viewBox="0 0 24 24" fill="none"
            stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="12" y1="5" x2="12" y2="19"/>
            <polyline points="19 12 12 19 5 12"/>
          </svg>
          <span className="hiw1__flow-text">Next: We analyze your local codes</span>
        </div>
      </div>

      {/* ═══════════════════════════════════════════
          FRAME 2 — Behind-the-scenes analysis diagram
      ═══════════════════════════════════════════ */}
      <section className="hiw2" aria-label="Step 2: Analyze your property">
        {HIW_FRAME2_OBJ.map((src, i) => (
          <img
            key={src}
            src={src}
            alt=""
            className={`hiw2__obj hiw2__obj--${i + 1}`}
            aria-hidden="true"
          />
        ))}
        <p className="hiw2__step-label">Step 2 of 4 — Analyze Your Property</p>

        <h2 className="hiw2__headline">
          We check every layer<br />
          <em className="hiw2__headline-em">of your project</em>
        </h2>

        <p className="hiw2__sub">
          PreClear compares your address and project scope against zoning rules,
          permit triggers, and building code requirements.
        </p>

        {/* ── Analysis diagram ── */}
        <div className="hiw2__diagram">

          {/* 3 source blocks */}
          <div className="hiw2__sources">

            <div className="hiw2__source">
              <div className="hiw2__source-head">
                <span className="hiw2__source-ico" aria-hidden="true">
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none"
                    stroke="currentColor" strokeWidth="1.85" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z"/>
                    <circle cx="12" cy="9" r="2.5"/>
                  </svg>
                </span>
                <span className="hiw2__source-title">Property details</span>
              </div>
              <ul className="hiw2__source-list">
                <li>Address</li>
                <li>Project type</li>
                <li>Parcel context</li>
              </ul>
            </div>

            <div className="hiw2__source">
              <div className="hiw2__source-head">
                <span className="hiw2__source-ico" aria-hidden="true">
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none"
                    stroke="currentColor" strokeWidth="1.85" strokeLinecap="round" strokeLinejoin="round">
                    <polygon points="12 2 2 7 12 12 22 7 12 2"/>
                    <polyline points="2 17 12 22 22 17"/>
                    <polyline points="2 12 12 17 22 12"/>
                  </svg>
                </span>
                <span className="hiw2__source-title">Local zoning</span>
              </div>
              <ul className="hiw2__source-list">
                <li>Setbacks</li>
                <li>Lot coverage</li>
                <li>Use restrictions</li>
              </ul>
            </div>

            <div className="hiw2__source">
              <div className="hiw2__source-head">
                <span className="hiw2__source-ico" aria-hidden="true">
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none"
                    stroke="currentColor" strokeWidth="1.85" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                    <polyline points="14 2 14 8 20 8"/>
                    <line x1="16" y1="13" x2="8" y2="13"/>
                    <line x1="16" y1="17" x2="8" y2="17"/>
                  </svg>
                </span>
                <span className="hiw2__source-title">Permit + code</span>
              </div>
              <ul className="hiw2__source-list">
                <li>Permit triggers</li>
                <li>Inspection stages</li>
                <li>Required documents</li>
              </ul>
            </div>

          </div>

          {/* SVG connector lines — fan from 3 sources into engine */}
          <div className="hiw2__connector-area" aria-hidden="true">
            <svg
              className="hiw2__connector-svg"
              viewBox="0 0 600 60"
              preserveAspectRatio="none"
              fill="none"
            >
              <path className="hiw2__cpath hiw2__cpath--l"
                d="M 100 0 C 100 30 300 30 300 60"
                stroke="#c7d2fe" strokeWidth="1.5"/>
              <path className="hiw2__cpath hiw2__cpath--c"
                d="M 300 0 L 300 60"
                stroke="#c7d2fe" strokeWidth="1.5"/>
              <path className="hiw2__cpath hiw2__cpath--r"
                d="M 500 0 C 500 30 300 30 300 60"
                stroke="#c7d2fe" strokeWidth="1.5"/>
            </svg>
          </div>

          {/* Engine block */}
          <div className="hiw2__engine">
            <div className="hiw2__engine-icon" aria-hidden="true">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none"
                stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="3"/>
                <path d="M19.07 4.93l-1.41 1.41M4.93 4.93l1.41 1.41M12 2v2M12 20v2M2 12H4M20 12h2M19.07 19.07l-1.41-1.41M4.93 19.07l1.41-1.41"/>
              </svg>
            </div>
            <strong className="hiw2__engine-label">PreClear Analysis Engine</strong>
            <span className="hiw2__engine-sub">Analyzes everything together</span>
          </div>

        </div>

        <div className="hiw2__flow-cue" aria-hidden="true">
          <svg className="hiw2__flow-arrow" width="16" height="16" viewBox="0 0 24 24" fill="none"
            stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="12" y1="5" x2="12" y2="19"/>
            <polyline points="19 12 12 19 5 12"/>
          </svg>
          <span className="hiw2__flow-text">Next: See your permit requirements</span>
        </div>
      </section>

      {/* ═══════════════════════════════════════════
          FRAME 3 — Deep results panel
      ═══════════════════════════════════════════ */}
      <section className="hiw3" ref={s3Ref} aria-label="Step 3: Your permit requirements">
        {HIW_FRAME3_OBJ.map((src, i) => (
          <img
            key={src}
            src={src}
            alt=""
            className={`hiw3__obj hiw3__obj--${i + 1}`}
            aria-hidden="true"
          />
        ))}
        <p className="hiw3__step-label">Step 3 of 4 — Your Results</p>

        <h2 className="hiw3__headline">
          Know exactly what<br />
          <em className="hiw3__headline-em">your project requires</em>
        </h2>

        <p className="hiw3__sub">
          No more guessing. See every rule your project must follow —
          zoning, setbacks, permits, and code requirements.
        </p>

        {/* ── Results card ── */}
        <div className={`hiw3__card${s3Complete ? ' hiw3__card--done' : ''}`}>

          {/* Context bar */}
          <div className="hiw3__context">
            <span className="hiw3__context-item">
              <svg width="11" height="11" viewBox="0 0 24 24" fill="none"
                stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
                aria-hidden="true">
                <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z"/>
                <circle cx="12" cy="9" r="2.5"/>
              </svg>
              Baltimore, MD 21201
            </span>
            <span className="hiw3__context-dot" aria-hidden="true">·</span>
            <span className="hiw3__context-item">
              <svg width="11" height="11" viewBox="0 0 24 24" fill="none"
                stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
                aria-hidden="true">
                <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
                <polyline points="9 22 9 12 15 12 15 22"/>
              </svg>
              Deck
            </span>
          </div>

          <div className="hiw3__rule" aria-hidden="true" />

          {/* Status + live progress */}
          <div className="hiw3__status">
            <span className={`hiw3__status-dot${
              s3Complete ? ' hiw3__status-dot--done'
              : s3Active  ? ' hiw3__status-dot--active'
              : ''}`}
              aria-hidden="true"
            />
            <span className="hiw3__status-text" aria-live="polite">
              {s3Complete
                ? 'Analysis complete'
                : s3Active
                  ? 'Analyzing your project…'
                  : 'Ready to analyze'}
            </span>
            {s3Active && !s3Complete && (
              <span className="hiw3__status-pct" aria-hidden="true">{s3Progress}%</span>
            )}
            {s3Complete && <span className="hiw3__status-badge">Done</span>}
          </div>

          {/* Progress bar */}
          <div className="hiw3__progress-track" aria-hidden="true">
            <div className="hiw3__progress-bar" style={{ width: `${s3Progress}%` }} />
          </div>

          {/* Checklist */}
          <ul className="hiw3__checklist" aria-label="Analysis steps">
            {CHECKS.map((check, i) => {
              const checked  = i < s3Checked;
              const checking = s3Checking === i;
              const visible  = checked || checking;
              return (
                <li key={check.label}
                  className={`hiw3__item${visible ? ' hiw3__item--visible' : ''}`}>
                  <span className={`hiw3__item-icon${
                    checked   ? ' hiw3__item-icon--checked'
                    : checking ? ' hiw3__item-icon--checking'
                    : ''}`}
                    aria-hidden="true"
                  >
                    {checked ? (
                      <svg width="9" height="9" viewBox="0 0 12 12" fill="none"
                        stroke="currentColor" strokeWidth="2.2"
                        strokeLinecap="round" strokeLinejoin="round">
                        <polyline points="2 6.5 4.5 9 10 3"/>
                      </svg>
                    ) : checking ? (
                      <span className="hiw3__spin-arc" />
                    ) : (
                      <span className="hiw3__dot-pending" />
                    )}
                  </span>
                  <div className="hiw3__item-body">
                    <span className="hiw3__item-label">{check.label}</span>
                    <span className={`hiw3__item-sub${
                      checking ? ' hiw3__item-sub--checking'
                      : !checked ? ' hiw3__item-sub--ghost'
                      : ''}`}>
                      {checking ? 'Verifying…' : check.detail}
                    </span>
                  </div>
                </li>
              );
            })}
          </ul>

          {/* Completion CTA */}
          <div className={`hiw3__summary${s3Complete ? ' hiw3__summary--visible' : ''}`}
            aria-live="polite">
            <span className="hiw3__summary-text">See My Permit Requirements</span>
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none"
              stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"
              aria-hidden="true">
              <line x1="5" y1="12" x2="19" y2="12"/>
              <polyline points="12 5 19 12 12 19"/>
            </svg>
          </div>

        </div>

        {/* Flow cue */}
        <div className="hiw3__flow-cue" aria-hidden="true">
          <svg className="hiw3__flow-arrow" width="16" height="16" viewBox="0 0 24 24" fill="none"
            stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="12" y1="5" x2="12" y2="19"/>
            <polyline points="19 12 12 19 5 12"/>
          </svg>
          <span className="hiw3__flow-text">Next: Move forward with confidence</span>
        </div>
      </section>

      {/* ═══════════════════════════════════════════
          FRAME 4 — Deliverable / confidence
      ═══════════════════════════════════════════ */}
      <section className="hiw4" aria-label="Step 4: Move forward with confidence">
        {HIW_FRAME4_OBJ.map((src, i) => (
          <img
            key={src}
            src={src}
            alt=""
            className={`hiw4__obj hiw4__obj--${i + 1}`}
            aria-hidden="true"
          />
        ))}
        <p className="hiw4__step-label">Step 4 of 4 — Move Forward With Confidence</p>

        <h2 className="hiw4__headline">
          Move forward with<br />
          <em className="hiw4__headline-em">everything you need</em>
        </h2>

        <p className="hiw4__sub">
          Get a complete checklist, required documents, and code references — ready for submission.
        </p>

        {/* Document-style output mock */}
        <div className="hiw4__mock">

          {/* Title bar */}
          <div className="hiw4__mock-bar" aria-hidden="true">
            <div className="hiw4__mock-dots">
              <span className="hiw4__mock-dot hiw4__mock-dot--r" />
              <span className="hiw4__mock-dot hiw4__mock-dot--y" />
              <span className="hiw4__mock-dot hiw4__mock-dot--g" />
            </div>
            <span className="hiw4__mock-title">preclear_checklist — Deck.pdf</span>
            <span className="hiw4__mock-status">Ready to export</span>
          </div>

          {/* Two-column body: paper stack left, preview right */}
          <div className="hiw4__mock-body">

            {/* Left: fanned paper stack */}
            <aside className="hiw4__stack-col" aria-hidden="true">
              <div className="hiw4__paper-stack">
                <div className="hiw4__sheet hiw4__sheet--back2" />
                <div className="hiw4__sheet hiw4__sheet--back1" />
                <div className="hiw4__sheet hiw4__sheet--front">
                  <span className="hiw4__sheet-kicker">PROJECT PACKAGE</span>
                  <span className="hiw4__sheet-title">Deck Permit Pre-Check</span>
                  <span className="hiw4__sheet-meta">Baltimore, MD 21201</span>
                </div>
              </div>
              <p className="hiw4__stack-caption">3 documents ready</p>
            </aside>

            {/* Right: preview content */}
            <div className="hiw4__preview-col">

              {/* Stat chips */}
              <div className="hiw4__stat-rail" aria-label="Project summary">
                <div className="hiw4__stat-chip">
                  <span className="hiw4__stat-chip-k">Permit</span>
                  <span className="hiw4__stat-chip-v">Required</span>
                </div>
                <div className="hiw4__stat-chip">
                  <span className="hiw4__stat-chip-k">Documents</span>
                  <span className="hiw4__stat-chip-v">4 items</span>
                </div>
                <div className="hiw4__stat-chip hiw4__stat-chip--accent">
                  <span className="hiw4__stat-chip-k">Zoning</span>
                  <span className="hiw4__stat-chip-v">Verified</span>
                </div>
              </div>

              <div className="hiw4__doc-rule" aria-hidden="true" />

              {/* Document list */}
              <p className="hiw4__doc-section-label">Required documents</p>
              <ul className="hiw4__doc-list">
                {HIW4_DOCS.map((d) => (
                  <li key={d} className="hiw4__doc-row">
                    <span className="hiw4__doc-check" aria-hidden="true">
                      <svg width="9" height="9" viewBox="0 0 12 12" fill="none"
                        stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                        <polyline points="2 6.5 4.5 9 10 3"/>
                      </svg>
                    </span>
                    {d}
                  </li>
                ))}
              </ul>

              <div className="hiw4__doc-rule" aria-hidden="true" />

              {/* Flag + code inline */}
              <div className="hiw4__doc-footer-row">
                <div className="hiw4__doc-flag">
                  <svg width="11" height="11" viewBox="0 0 24 24" fill="none"
                    stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
                    aria-hidden="true">
                    <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/>
                    <line x1="12" y1="9" x2="12" y2="13"/>
                    <line x1="12" y1="17" x2="12.01" y2="17"/>
                  </svg>
                  {HIW4_FLAGS[0]}
                </div>
                <code className="hiw4__doc-code">{HIW4_CODES[0]}</code>
              </div>

            </div>
          </div>

          {/* CTA strip */}
          <div className="hiw4__cta-wrap">
            <button type="button" className="hiw4__download-text">
              Download Full Checklist
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none"
                stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"
                aria-hidden="true">
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
                <polyline points="7 10 12 15 17 10"/>
                <line x1="12" y1="15" x2="12" y2="3"/>
              </svg>
            </button>
            <ul className="hiw4__trust" aria-label="Trust signals">
              <li>Ready for submission</li>
              <li>No surprises at review</li>
              <li>50+ jurisdictions</li>
            </ul>
          </div>

        </div>

        <div className="hiw4__divider" aria-hidden="true">
          <span className="hiw4__divider-label">Ready to start?</span>
        </div>

        <div className="hiw4__final">
          <p className="hiw4__headline hiw4__headline--final">
            Start your first pre-check<br />
            <em className="hiw4__headline-em">Free</em>
          </p>
          <p className="hiw4__final-sub">No credit card. Results in under a minute.</p>
          <Link to={paths.signUp} className="hiw4__final-btn">
            Get Started
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none"
              stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"
              aria-hidden="true">
              <line x1="5" y1="12" x2="19" y2="12"/>
              <polyline points="12 5 19 12 12 19"/>
            </svg>
          </Link>
        </div>
      </section>

      {/* Full-viewport shadow — last in tree + highest z-index so it sits above all HIW images */}
      <img
        src="/images/howItWorks/Feature/shadow.png"
        alt=""
        className="hiw__shadow-overlay"
        aria-hidden="true"
      />
    </>
  );
}
