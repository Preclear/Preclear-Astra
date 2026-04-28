import { Fragment, type ReactNode, useMemo, useState } from 'react';
import { Link, useLocation, useParams } from 'react-router-dom';
import { paths } from '../routes';
import { AgentExecutionPlan } from './AgentExecutionPlan';
import '../styles/precheck-report.css';

type ProjectStatus = 'draft' | 'in-review' | 'approved';

type ProjectData = {
  id: string;
  name: string;
  type: string;
  address: string;
  status: ProjectStatus;
  date: string;
  zone?: string;
  valuationDisplay?: string;
};

type ActionTag = { label: string; type: 'doc' | 'link' };

type ActionItem = {
  id: string;
  label: string;
  time: string;
  detail: string;
  tags: ActionTag[];
};

type CitationRow = {
  id: string;
  num: number;
  title: string;
  source: string;
  status: 'review' | 'pass';
  desc: string;
  quote: string;
  meta: { label: string; value: string }[];
};

type DocumentRow = {
  id: string;
  name: string;
  sub: string;
  status: 'ready' | 'gen' | 'missing';
  action: string;
};

type TimelineRow = {
  phase: string;
  days: string;
  sub: string;
  title: string;
  pill: string;
  pillClass: string;
  desc: string;
  sub2: string;
  state: string;
};

type FeeRow = { label: string; sub: string; value: string };

type RiskFactor = { label: string; value: number };

type IssueRow = { sev: 'med' | 'low' | 'high'; count: string; text: string };

const FALLBACK_PROJECTS: ProjectData[] = [
  {
    id: '1',
    name: 'Window Replacement',
    type: 'Renovation',
    address: '412 Elm St, Baltimore, MD',
    status: 'in-review',
    date: 'Mar 8, 2026',
    zone: 'R-6 zone',
    valuationDisplay: 'Val. $14,500',
  },
  {
    id: '2',
    name: 'Detached Garage',
    type: 'New Build',
    address: '88 Maple Ave, Rockville, MD',
    status: 'draft',
    date: 'Mar 10, 2026',
    zone: 'County zone TBD',
    valuationDisplay: 'Val. $42,000',
  },
  {
    id: '3',
    name: 'Solar Panel Install',
    type: 'Electrical',
    address: '21 Oak Rd, Annapolis, MD',
    status: 'approved',
    date: 'Feb 28, 2026',
    zone: 'R-2 zone',
    valuationDisplay: 'Val. $18,900',
  },
];

const ACTION_ITEMS: ActionItem[] = [
  {
    id: 'permit-application',
    label: 'Submit building permit application',
    time: '~15m',
    detail:
      'Complete the Baltimore City jurisdiction form with owner/applicant info, project scope, and valuation. PreClear auto-fills 87% of fields from your intake.',
    tags: [
      { label: 'PERMIT-APP.PDF', type: 'doc' },
      { label: 'BALT-CODE Sec. 301.1.3', type: 'link' },
    ],
  },
  {
    id: 'site-plan',
    label: 'Prepare site plan with setbacks',
    time: '~2h',
    detail:
      'Include lot boundaries, setbacks, existing structures, and exact area of work. Must show scale 1:20, north arrow, dimensions. Your R-6 zone requires 5ft side setback clearance.',
    tags: [
      { label: 'AUTO-GENERATE', type: 'link' },
      { label: 'BALT-ZONING Sec. 14-204', type: 'link' },
    ],
  },
  {
    id: 'construction-drawings',
    label: 'Include construction drawings',
    time: '~4h',
    detail:
      'Attach plan set pages that match your scope: floor/elevation/sections and key notes. Window replacement requires header detail and egress verification per IRC R310.',
    tags: [
      { label: '3 SHEETS REQUIRED', type: 'doc' },
      { label: 'IRC R310.2', type: 'link' },
    ],
  },
  {
    id: 'license-check',
    label: 'Verify contractor license + insurance',
    time: '~5m',
    detail:
      'Confirm active MHIC license, $50k minimum liability insurance, and Baltimore City registration. We will automatically cross-check against MHIC registry.',
    tags: [
      { label: 'MHIC #05-156472', type: 'doc' },
      { label: 'VERIFY NOW', type: 'link' },
    ],
  },
  {
    id: 'fee-payment',
    label: 'Pay permit + plan review fees',
    time: '~3m',
    detail:
      'Baltimore charges a tiered fee based on project valuation. Estimated $312 based on your $14,500 declared value. Fee is non-refundable after submission.',
    tags: [
      { label: '$312.00', type: 'doc' },
      { label: 'BALT-FEES Sec. 32-7', type: 'link' },
    ],
  },
];

const CITATIONS: CitationRow[] = [
  {
    id: 'zoning',
    num: 1,
    title: 'Zoning rules',
    source: 'BALT-ZONE Sec. 14-204.B',
    status: 'review',
    desc: 'Property falls within R-6 residential district. Exterior window replacement in R-6 requires setback verification when window size changes by >10%.',
    quote:
      '"Where a window or door opening is enlarged more than 10% of the original rough opening area, the altered opening shall be reviewed for compliance with side-yard setback and glazing coverage requirements of this section."',
    meta: [
      { label: 'Source', value: 'Baltimore Zoning Code' },
      { label: 'Effective', value: 'Jan 1, 2024' },
      { label: 'Confidence', value: '98%' },
    ],
  },
  {
    id: 'building',
    num: 2,
    title: 'Building code',
    source: 'IRC R310.2.1',
    status: 'review',
    desc: 'Bedroom egress windows must provide minimum 5.7 sq ft openable area, 24" min height, 20" min width, max 44" sill height. Replacement triggers compliance check.',
    quote:
      '"Emergency escape and rescue openings shall have a minimum net clear opening of 5.7 square feet (0.530 m²). The net clear opening dimensions shall be the result of normal operation of the opening."',
    meta: [
      { label: 'Source', value: 'IRC 2021' },
      { label: 'Local Amend.', value: 'None' },
      { label: 'Confidence', value: '100%' },
    ],
  },
  {
    id: 'local',
    num: 3,
    title: 'Local rules & HOA',
    source: 'BALT-EXT Sec. 7-112',
    status: 'pass',
    desc: 'Exterior alteration permit required for any work visible from public right-of-way. HOA check cleared — property is not within a registered covenant.',
    quote:
      '"Any alteration, repair, or replacement of exterior building fenestration visible from a public right-of-way or common area shall require a Type-3 building permit."',
    meta: [
      { label: 'Source', value: 'Balt. Municipal Code' },
      { label: 'HOA', value: 'None on record' },
      { label: 'Confidence', value: '96%' },
    ],
  },
];

const DOCUMENTS: DocumentRow[] = [
  { id: 'permit-app', name: 'Permit Application', sub: 'BLT-FORM-301 · 4 pages', status: 'ready', action: 'View' },
  { id: 'site-plan', name: 'Site Plan', sub: 'Scale 1:20 · with setbacks', status: 'gen', action: 'Generate' },
  { id: 'drawings', name: 'Construction Drawings', sub: '3 sheets · floor/elev/sect', status: 'gen', action: 'Generate' },
  { id: 'egress', name: 'Egress Calculation', sub: 'IRC R310 worksheet', status: 'missing', action: 'Upload' },
  { id: 'license', name: 'MHIC License Proof', sub: 'Auto-verified from registry', status: 'ready', action: 'View' },
  { id: 'insurance', name: 'Liability Insurance COI', sub: '$50k min · current thru 2026', status: 'ready', action: 'View' },
];

const TIMELINE: TimelineRow[] = [
  {
    phase: 'Phase 1',
    days: '2',
    sub: 'days',
    title: 'Application intake',
    pill: 'DONE',
    pillClass: 'done',
    desc: 'Submit permit application + document pack to Baltimore DHCD e-Permit portal. Receipt issued.',
    sub2: 'Target: Apr 20, 2026',
    state: 'done',
  },
  {
    phase: 'Phase 2',
    days: '5-7',
    sub: 'days',
    title: 'Plan review',
    pill: 'NEXT',
    pillClass: 'current',
    desc: 'Zoning + building code review by assigned plan examiner. Corrections round possible (adds 3-5 days).',
    sub2: 'Examiner assigned within 48h',
    state: 'current',
  },
  {
    phase: 'Phase 3',
    days: '1',
    sub: 'day',
    title: 'Permit issued',
    pill: '',
    pillClass: '',
    desc: 'Physical permit card issued. Must be posted on-site before work begins. Valid for 12 months.',
    sub2: 'Inspector: pre-work + final',
    state: '',
  },
  {
    phase: 'Phase 4',
    days: '1-3',
    sub: 'days',
    title: 'Inspections scheduled',
    pill: '',
    pillClass: '',
    desc: 'Schedule rough-in and final inspection via DHCD portal. Required before closing out permit.',
    sub2: '$45 inspection fee included',
    state: '',
  },
];

const FEES: FeeRow[] = [
  { label: 'Base permit fee', sub: 'flat', value: '$125.00' },
  { label: 'Plan review', sub: '$0.0052/sq ft × 2,800', value: '$14.56' },
  { label: 'Zoning review', sub: 'R-6 residential', value: '$85.00' },
  { label: 'Technology surcharge', sub: '4% of base', value: '$5.00' },
  { label: 'Inspection fees', sub: '2 required inspections', value: '$90.00' },
];

const RISK_FACTORS: RiskFactor[] = [
  { label: 'Application completeness', value: 92 },
  { label: 'Contractor license status', value: 100 },
  { label: 'Code compliance (estimated)', value: 78 },
  { label: 'Jurisdiction backlog', value: 64 },
  { label: 'Historical rejection rate', value: 88 },
];

const ISSUES: IssueRow[] = [
  { sev: 'med', count: '#1', text: 'Work near north property line — verify 5 ft side setback on site plan before submission.' },
  { sev: 'med', count: '#2', text: 'Egress calculation missing — required for bedroom window replacement under IRC R310.' },
  { sev: 'low', count: '#3', text: 'Declared valuation ($14,500) may trigger plan examiner review above $10k threshold.' },
];

const ACTIVITY: { time: string; tag: string; msg: ReactNode }[] = [
  { time: '11:04 AM', tag: 'CHECK', msg: <>Zoning rules verified against <code>BALT-ZONE Sec. 14-204</code></> },
  { time: '11:04 AM', tag: 'CHECK', msg: <>Building code compliance run — <code>IRC R310.2</code> flagged</> },
  { time: '11:03 AM', tag: 'MATCH', msg: <>Parcel matched: <code>412 ELM ST, BALTIMORE MD 21224</code></> },
  { time: '11:03 AM', tag: 'SCAN', msg: <>3 applicable code sections found for scope <code>window-replacement</code></> },
  { time: '11:02 AM', tag: 'INIT', msg: <>Pre-check session <code>PCR-A4F2-9821</code> opened</> },
];

const SESSION_REF = 'PCR-A4F2-9821';

const STATUS_AGENT_HANDLES = [
  'Permit application forms · auto-filled from intake',
  'Site plan generation at code-compliant scale',
  'Zoning + building code compliance validation',
  'Contractor license + insurance verification',
] as const;

const STATUS_YOU_HANDLE = [
  'Upload 2 bedroom rough-opening measurements',
  'Confirm contractor details are current',
  'Approve document pack before submission',
  'Be on-site for pre-work + final inspections',
] as const;

const STATUS_FEED_PREVIEW = [
  {
    id: 7,
    state: 'wait',
    action: 'Waiting on egress measurements',
    tag: 'IRC R310 WORKSHEET',
    detail: 'Need bedroom rough-opening height × width to finalize egress compliance check.',
  },
  {
    id: 8,
    state: 'running',
    action: 'Drafting plan-review responses',
    tag: '2 PRE-EMPTIVE MEMOS',
    detail: 'Preparing examiner answers for setback tolerance + valuation threshold questions.',
  },
  {
    id: 6,
    state: 'done',
    action: 'Drafted construction drawings',
    tag: '3 SHEETS',
    detail: 'Floor / elevation / section with IRC R310 header detail rendered from intake dimensions.',
  },
  {
    id: 9,
    state: 'queued',
    action: 'Will submit to DHCD e-portal',
    tag: 'BALT-EPERMIT',
    detail: 'Packet bundle will be filed within 90s of your approval — session authenticated.',
  },
] as const;

const Icon = {
  check: (p: React.SVGProps<SVGSVGElement>) => (
    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" {...p}>
      <path d="M5 13l4 4L19 7" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  ),
  chev: (p: React.SVGProps<SVGSVGElement>) => (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" {...p}>
      <path d="M6 9l6 6 6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  ),
  ext: (p: React.SVGProps<SVGSVGElement>) => (
    <svg width="10" height="10" viewBox="0 0 24 24" fill="none" {...p}>
      <path d="M14 5h5v5M19 5l-9 9M5 12v7h7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  ),
  download: (p: React.SVGProps<SVGSVGElement>) => (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" {...p}>
      <path d="M12 3v13m0 0l-5-5m5 5l5-5M4 21h16" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  ),
  share: (p: React.SVGProps<SVGSVGElement>) => (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" {...p}>
      <path d="M4 12v8a2 2 0 002 2h12a2 2 0 002-2v-8M16 6l-4-4-4 4M12 2v13" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  ),
  plus: (p: React.SVGProps<SVGSVGElement>) => (
    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" {...p}>
      <path d="M12 5v14M5 12h14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  ),
  sparkle: (p: React.SVGProps<SVGSVGElement>) => (
    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" {...p}>
      <path
        d="M12 3l2 5 5 2-5 2-2 5-2-5-5-2 5-2 2-5z"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinejoin="round"
      />
    </svg>
  ),
};

function scopeImageFromProject(project: ProjectData): string {
  const name = project.name.toLowerCase();
  if (name.includes('window')) return '/images/onborading/window.png';
  if (name.includes('garage')) return '/images/onborading/Garage%20or%20carport.png';
  if (name.includes('solar')) return '/images/onborading/electricalWork.png';
  return '/images/onborading/somethingelse.png';
}

function addressHeadline(address: string): string {
  const m = address.match(/^(.+),\s*([^,]+),\s*([A-Z]{2})\s*$/);
  if (m) return `${m[1]}, ${m[2]} ${m[3]}`;
  return address;
}

function projectDetailLine(project: ProjectData): string {
  const zone = project.zone?.trim() || '—';
  const val = project.valuationDisplay?.trim() || '—';
  return `${zone} · ${project.type} · ${val}`;
}

/** Portal label for execution-plan step titles (demo copy). */
function portalLabelFromAddress(address: string): string {
  const a = address.toLowerCase();
  if (a.includes('baltimore')) return 'Baltimore DHCD';
  if (a.includes('rockville') || a.includes('maple')) return 'Montgomery County';
  if (a.includes('annapolis') || a.includes('oak')) return 'Annapolis';
  return 'Local AHJ';
}

/** Fills optional demo fields when opening from Home/workspace (same id as fallbacks). */
function projectForDisplay(p: ProjectData): ProjectData {
  const fb = FALLBACK_PROJECTS.find((x) => x.id === p.id);
  return {
    ...p,
    zone: p.zone ?? fb?.zone,
    valuationDisplay: p.valuationDisplay ?? fb?.valuationDisplay,
  };
}

function ChecklistItem({
  item,
  index,
  checked,
  open,
  onToggle,
  onToggleOpen,
}: {
  item: ActionItem;
  index: number;
  checked: boolean;
  open: boolean;
  onToggle: () => void;
  onToggleOpen: () => void;
}) {
  return (
    <div className={`check-item ${checked ? 'done' : ''} ${open ? 'open' : ''}`}>
      <div className="check-item__row" onClick={onToggleOpen} onKeyDown={(e) => e.key === 'Enter' && onToggleOpen()} role="button" tabIndex={0}>
        <span className="check-item__num">{String(index + 1).padStart(2, '0')}</span>
        <span
          className="check-item__box"
          onClick={(e) => {
            e.stopPropagation();
            onToggle();
          }}
          onKeyDown={(e) => e.key === 'Enter' && (e.stopPropagation(), onToggle())}
          role="checkbox"
          aria-checked={checked}
          tabIndex={0}
        >
          <Icon.check />
        </span>
        <span className="check-item__label">{item.label}</span>
        <span className="check-item__time">{item.time}</span>
        <span className="check-item__chev" aria-hidden>
          <Icon.chev />
        </span>
      </div>
      <div className="check-item__detail">
        <div className="check-item__detail-inner">
          <p>{item.detail}</p>
          <div className="check-item__detail-tags">
            {item.tags.map((t) => (
              <span key={t.label} className={`tag tag--${t.type}`}>
                {t.type === 'link' ? <Icon.ext /> : null}
                {t.label}
              </span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function CitationBlock({
  c,
  open,
  onToggle,
}: {
  c: CitationRow;
  open: boolean;
  onToggle: () => void;
}) {
  return (
    <article className={`citation ${open ? 'open' : ''}`}>
      <div className="citation__head" onClick={onToggle} role="button" tabIndex={0} onKeyDown={(e) => e.key === 'Enter' && onToggle()}>
        <div className="citation__num">{c.num}</div>
        <div className="citation__title-wrap">
          <div className="citation__title">
            {c.title}
            <span className="citation__source">{c.source}</span>
          </div>
          <p className="citation__desc">{c.desc}</p>
        </div>
        <div className={`citation__status ${c.status === 'pass' ? 'pass' : ''}`}>{c.status === 'pass' ? 'Passed' : 'Review'}</div>
        <div className="citation__chev" aria-hidden>
          <Icon.chev />
        </div>
      </div>
      <div className="citation__body">
        <div className="citation__body-inner">
          <div className="citation__quote">{c.quote}</div>
          <div className="citation__meta">
            {c.meta.map((m) => (
              <span key={m.label}>
                <strong>{m.label}:</strong> {m.value}
              </span>
            ))}
          </div>
          <div className="citation__links">
            <span className="tag tag--link">
              <Icon.ext /> View full section
            </span>
            <span className="tag tag--link">
              <Icon.ext /> See similar approved cases
            </span>
          </div>
        </div>
      </div>
    </article>
  );
}

const StatusIconUpload = (p: React.SVGProps<SVGSVGElement>) => (
  <svg width="11" height="11" viewBox="0 0 24 24" fill="none" {...p}>
    <path d="M12 16V4m0 0l-4 4m4-4l4 4M4 20h16" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

function FeedItem({ e }: { e: (typeof STATUS_FEED_PREVIEW)[number] }) {
  const badge =
    e.state === 'running' ? (
      <span className="feed__badge feed__badge--running">
        <span className="feed__badge-dot" aria-hidden />
        Now
      </span>
    ) : e.state === 'wait' ? (
      <span className="feed__badge feed__badge--wait">Action needed</span>
    ) : e.state === 'queued' ? (
      <span className="feed__badge feed__badge--queued">Queued</span>
    ) : null;

  return (
    <li className={`feed__row feed__row--${e.state}`}>
      <span className={`feed__pip feed__pip--${e.state}`} aria-hidden />
      <div className="feed__row-body">
        <div className="feed__row-top">
          <div className="feed__row-heading">
            <span className="feed__row-title">{e.action}</span>
            <span className="feed__row-tag">{e.tag}</span>
          </div>
          {badge}
        </div>
        <p className="feed__row-detail">{e.detail}</p>
        {e.state === 'wait' && (
          <button type="button" className="feed__row-cta">
            <StatusIconUpload /> Upload measurements
          </button>
        )}
        {e.state === 'running' && (
          <button type="button" className="feed__row-ghost">View draft →</button>
        )}
        {e.state === 'done' && (
          <button type="button" className="feed__row-ghost">View output →</button>
        )}
      </div>
    </li>
  );
}

function StatusTab() {
  return (
    <div className="tab-panel status-tab">
      <div className="resp-grid">
        {/* ── Agent panel ── */}
        <div className="resp resp--agent">
          <div className="resp__header">
            <span className="resp__title">Handled by PreClear</span>
            <span className="resp__count">4 tasks</span>
          </div>
          <ul className="resp__rows">
            {STATUS_AGENT_HANDLES.map((t, i) => (
              <li key={i} className="resp__row">
                {/* green filled check — all PreClear tasks are done */}
                <svg className="resp__row-icon" width="22" height="22" viewBox="0 0 22 22" fill="none">
                  <circle cx="11" cy="11" r="10" fill="#22c55e" />
                  <path d="M6.5 11.5l3 3 6-6" stroke="#fff" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
                <span className="resp__row-text">{t}</span>
                <svg className="resp__row-chev" width="7" height="12" viewBox="0 0 7 12" fill="none">
                  <path d="M1 1l5 5-5 5" stroke="#c8d0da" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </li>
            ))}
          </ul>
        </div>

        {/* ── User panel ── */}
        <div className="resp resp--user">
          <div className="resp__header">
            <span className="resp__title">You handle</span>
            <span className="resp__count resp__count--user">4 touches</span>
          </div>
          <ul className="resp__rows">
            {STATUS_YOU_HANDLE.map((t, i) => (
              <li key={i} className="resp__row">
                {/* pending — orange dashed circle */}
                <svg className="resp__row-icon" width="22" height="22" viewBox="0 0 22 22" fill="none">
                  <circle cx="11" cy="11" r="9.5" stroke="#f59e0b" strokeWidth="1.6" strokeDasharray="3.5 2.5" strokeLinecap="round" />
                </svg>
                <span className="resp__row-text">{t}</span>
                <svg className="resp__row-chev" width="7" height="12" viewBox="0 0 7 12" fill="none">
                  <path d="M1 1l5 5-5 5" stroke="#c8d0da" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div className="feed-fee-layout">
        <section className="feed-card">
          <div className="feed-card__head">
            <div className="feed-card__title-group">
              <span className="feed-card__eyebrow">Right now</span>
              <span className="feed-card__live">
                <span className="feed-card__live-dot" aria-hidden />
                Live
              </span>
            </div>
            <button type="button" className="feed-card__all-link">
              Full activity →
            </button>
          </div>
          <p className="feed-card__sub">Agent&apos;s last four moves</p>
          <ul className="feed">
            {STATUS_FEED_PREVIEW.map((e) => (
              <FeedItem key={e.id} e={e} />
            ))}
          </ul>
        </section>

        <aside className="feed-fee-layout__aside">
          <section className="panel panel--fee-estimate">
            <div className="panel__head">
              <h2 className="panel__title">Fee estimate</h2>
            </div>
            <p className="panel__sub">Paid automatically on submission</p>
            <div className="fees">
              {FEES.map((f) => (
                <div key={f.label} className="fee-row">
                  <div>
                    <span className="fee-row__label">{f.label}</span>
                    <span className="fee-row__sub">· {f.sub}</span>
                  </div>
                  <span className="fee-row__value">{f.value}</span>
                </div>
              ))}
              <div className="fee-row fee-row--total">
                <span className="fee-row__label">Agent will charge</span>
                <span className="fee-row__value">$319.56</span>
              </div>
            </div>
          </section>
        </aside>
      </div>
    </div>
  );
}

function AgentBanner({
  paused,
  onPause,
  runtime,
  mode = 'Semi-Auto',
}: {
  paused: boolean;
  onPause: () => void;
  runtime: string;
  mode?: string;
}) {
  return (
    <div className="agent-banner">
      <div className="agent-banner__avatar">
        <img src="/images/Logo/PCWhiteLogo.png" alt="PreClear logo" className="agent-banner__logo" />
      </div>

      <div className="agent-banner__body">
        <div className="agent-banner__title">
          <span className="agent-name">preclear-agent</span> is handling your permit
        </div>
        <div className="agent-banner__task">
          {paused ? 'Paused — resume to continue' : 'Drafting plan-review memos for examiner'}
          {!paused && (
            <span className="typing">
              <span />
              <span />
              <span />
            </span>
          )}
          <span className="agent-banner__mode">· {mode}</span>
        </div>
      </div>

      <div className="agent-banner__right">
        <button type="button" className="agent-banner__pause" onClick={onPause}>
          {paused ? 'Resume' : '■ Pause'}
        </button>
        <div className="agent-banner__runtime">runtime {runtime}</div>
      </div>
    </div>
  );
}

export default function ProjectPage() {
  const { projectId } = useParams();
  const location = useLocation();
  const stateProject = (location.state as { project?: ProjectData } | null)?.project ?? null;
  const project = stateProject ?? FALLBACK_PROJECTS.find((p) => p.id === projectId) ?? FALLBACK_PROJECTS[0];
  const imageSrc = scopeImageFromProject(project);

  const [tab, setTab] = useState<'status' | 'plan' | 'activity' | 'documents' | 'process'>('status');
  const [completed, setCompleted] = useState<string[]>([]);
  const [openChecklistId, setOpenChecklistId] = useState<string | null>('site-plan');
  const [openCitation, setOpenCitation] = useState<string | null>('zoning');
  const [paused, setPaused] = useState(false);
  const [runtime] = useState('00:13:31');

  const readiness = useMemo(() => {
    const base = 25;
    const actionWeight = 65 * (completed.length / ACTION_ITEMS.length);
    return Math.round(base + actionWeight);
  }, [completed]);

  const toggleDone = (id: string) => {
    setCompleted((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));
  };

  const openCount = ACTION_ITEMS.length - completed.length;
  const displayProject = projectForDisplay(project);
  const feedCount = 9;
  const contentTab =
    tab === 'documents' ? 'documents' :
    tab === 'process' ? 'timeline' :
    tab === 'status' ? 'status' :
    tab === 'plan' ? 'agentPlan' :
    'verdict';

  return (
    <div className="app-questionnaire">
      <div className="app-questionnaire__main app-questionnaire__main--configure">
        <div className="questionnaire-step-enter">
          <div className="precheck-report">
            <div className="page">
              <aside className="left">
                <Link to={paths.app} className="back">
                  ← All projects
                </Link>

                <div className="left__hero-stack">
                  <div className="project-card project-card--hero">
                    <div className="project-thumb project-thumb--contain">
                      <img src={imageSrc} alt="" className="project-thumb__img" decoding="async" />
                    </div>
                  </div>

                  <div className="verdict">
                    <div className="verdict__body">
                      <div className="verdict__result">
                        <span className="glyph">!</span>
                        Likely Required
                      </div>
                      <p className="verdict__sub">
                        Based on your project scope and location, a building permit is likely required. Complete open actions and documents to improve submission readiness.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="meter">
                  <div className="meter__head">
                    <span className="meter__title">Submission readiness</span>
                    <span className="meter__pct">{readiness}%</span>
                  </div>
                  <div className="meter__track">
                    <div className="meter__fill" style={{ width: `${readiness}%` }} />
                  </div>
                  <div className="meter__ticks">
                    {[
                      { n: '01', l: 'Intake' },
                      { n: '02', l: 'Docs' },
                      { n: '03', l: 'Review' },
                      { n: '04', l: 'Submit' },
                    ].map((t, i) => {
                      const threshold = (i + 1) * 25;
                      const cls = readiness >= threshold ? 'done' : readiness >= threshold - 25 ? 'active' : '';
                      return (
                        <div key={t.n} className={`meter__tick ${cls}`}>
                          <span className="meter__tick-num">{t.n}</span>
                          <span className="meter__tick-label">{t.l}</span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </aside>

              <main className="right">
                <div className="right__head">
                  <div className="right__title-wrap">
                    <div className="label-xs" style={{ marginBottom: 4 }}>
                      Pre-check report · {project.date}
                    </div>
                    <h1>{project.name}</h1>
                    <div className="right__title-meta">
                      <span>{addressHeadline(displayProject.address)}</span>
                      <span className="dot" aria-hidden>
                        ·
                      </span>
                      <span>{projectDetailLine(displayProject)}</span>
                    </div>
                  </div>
                  <div className="right__actions">
                    <button type="button" className="btn">
                      <Icon.share /> Share with contractor
                    </button>
                    <button type="button" className="btn">
                      <Icon.download /> Export PDF
                    </button>
                    <button type="button" className="btn btn--primary">
                      <Icon.plus /> Submit to portal
                    </button>
                  </div>
                </div>

                <AgentBanner paused={paused} runtime={runtime} onPause={() => setPaused((p) => !p)} />

                <div className="tabs">
                  {(
                    [
                      { id: 'status' as const, label: 'Status', badge: 'LIVE' },
                      { id: 'plan' as const, label: 'Agent plan', badge: '6' },
                      { id: 'activity' as const, label: 'Activity', badge: String(feedCount) },
                      { id: 'documents' as const, label: 'Documents', badge: '6' },
                      { id: 'process' as const, label: 'Live process', badge: null },
                    ] as const
                  ).map((t) => (
                    <button key={t.id} type="button" className={`tab ${tab === t.id ? 'active' : ''}`} onClick={() => setTab(t.id)}>
                      {t.label}
                      {t.badge ? <span className="tab__badge">{t.badge}</span> : null}
                    </button>
                  ))}
                  <div className="tabs__meta">
                    <span className="tabs__live">Streaming</span>
                    <span>v2.3</span>
                  </div>
                </div>

                {contentTab === 'status' && <StatusTab />}

                {contentTab === 'agentPlan' && (
                  <AgentExecutionPlan portalName={portalLabelFromAddress(displayProject.address)} stepCount={6} />
                )}

                {contentTab === 'verdict' && (
                  <div className="tab-panel">
                    <div className="panel-grid">
                      <section className="panel">
                        <div className="panel__head">
                          <h2 className="panel__title">
                            What to do next
                            <span className="num">{openCount} open</span>
                          </h2>
                          <button type="button" className="panel__action">
                            Expand all →
                          </button>
                        </div>
                        <p className="panel__sub">Ordered by dependency · check off as you complete</p>
                        <div className="checklist">
                          {ACTION_ITEMS.map((item, i) => (
                            <ChecklistItem
                              key={item.id}
                              item={item}
                              index={i}
                              checked={completed.includes(item.id)}
                              open={openChecklistId === item.id}
                              onToggle={() => toggleDone(item.id)}
                              onToggleOpen={() => setOpenChecklistId(openChecklistId === item.id ? null : item.id)}
                            />
                          ))}
                        </div>
                      </section>

                      <div className="side-stack">
                        <section className="panel">
                          <div className="panel__head">
                            <h2 className="panel__title">
                              Potential issues <span className="num">3</span>
                            </h2>
                          </div>
                          <p className="panel__sub">Flagged before submission</p>
                          <ul className="issues-list">
                            {ISSUES.map((row, idx) => (
                              <li key={idx}>
                                <span className={`sev ${row.sev === 'high' ? 'high' : ''}`}>{row.sev.toUpperCase()}</span>
                                <span>{row.text}</span>
                                <span className="count">{row.count}</span>
                              </li>
                            ))}
                          </ul>
                        </section>

                        <section className="panel">
                          <div className="panel__head">
                            <h2 className="panel__title">Who can apply</h2>
                          </div>
                          <p className="panel__sub">Applicant eligibility</p>
                          <ul className="issues-list" style={{ marginTop: 0 }}>
                            <li style={{ borderLeftColor: 'var(--ok)' }}>
                              <span
                                className="sev"
                                style={{ background: 'var(--ok-soft)', color: 'var(--ok)', borderColor: '#cbdbc9' }}
                              >
                                OK
                              </span>
                              <span>Licensed contractor may pull this permit when registered for your jurisdiction.</span>
                              <span className="count">—</span>
                            </li>
                            <li style={{ borderLeftColor: 'var(--bad)' }}>
                              <span className="sev high">BLOCK</span>
                              <span>Homeowner self-permits may not be allowed for this work type — confirm with local AHJ.</span>
                              <span className="count">—</span>
                            </li>
                          </ul>
                        </section>
                      </div>
                    </div>

                    <hr className="hr" />

                    <div className="panel-grid" style={{ gridTemplateColumns: '1.5fr 1fr' }}>
                      <section className="panel">
                        <div className="panel__head">
                          <h2 className="panel__title">
                            Why this is required
                            <span className="num">3 checks</span>
                          </h2>
                          <button type="button" className="panel__action">
                            Open in policy view →
                          </button>
                        </div>
                        <p className="panel__sub">Jurisdiction-specific code citations</p>
                        <div className="citations">
                          {CITATIONS.map((c) => (
                            <CitationBlock
                              key={c.id}
                              c={c}
                              open={openCitation === c.id}
                              onToggle={() => setOpenCitation(openCitation === c.id ? null : c.id)}
                            />
                          ))}
                        </div>
                      </section>

                      <section className="panel">
                        <div className="panel__head">
                          <h2 className="panel__title">Fee breakdown</h2>
                        </div>
                        <p className="panel__sub">Illustrative estimate for demo projects</p>
                        <div className="fees">
                          {FEES.map((f) => (
                            <div key={f.label} className="fee-row">
                              <div>
                                <span className="fee-row__label">{f.label}</span>
                                <span className="fee-row__sub">· {f.sub}</span>
                              </div>
                              <span className="fee-row__value">{f.value}</span>
                            </div>
                          ))}
                          <div className="fee-row fee-row--total">
                            <span className="fee-row__label">Estimated total</span>
                            <span className="fee-row__value">$319.56</span>
                          </div>
                        </div>
                      </section>
                    </div>
                  </div>
                )}

                {contentTab === 'documents' && (
                  <div className="tab-panel">
                    <div className="panel-grid" style={{ gridTemplateColumns: '1.5fr 1fr' }}>
                      <section className="panel">
                        <div className="panel__head">
                          <h2 className="panel__title">
                            Document pack
                            <span className="num">3 of 6 ready</span>
                          </h2>
                          <button type="button" className="panel__action">
                            + Add custom doc
                          </button>
                        </div>
                        <p className="panel__sub">Generated and matched to typical submission requirements</p>
                        <div className="docs-grid">
                          {DOCUMENTS.map((d) => (
                            <div key={d.id} className={`doc doc--${d.status}`}>
                              <div className="doc__head">
                                <div className="doc__icon" />
                                <span className={`doc__status ${d.status === 'ready' ? 'ready' : d.status === 'gen' ? 'gen' : ''}`}>
                                  {d.status === 'ready' ? 'Ready' : d.status === 'gen' ? 'Auto-gen' : 'Missing'}
                                </span>
                              </div>
                              <div>
                                <p className="doc__name">{d.name}</p>
                                <p className="doc__sub">{d.sub}</p>
                              </div>
                              <div className="doc__bottom">
                                <span>PDF · A4</span>
                                <button type="button" className={`doc__btn ${d.status === 'gen' ? 'doc__btn--primary' : ''}`}>
                                  {d.action}
                                </button>
                              </div>
                            </div>
                          ))}
                        </div>
                      </section>

                      <section className="panel">
                        <div className="panel__head">
                          <h2 className="panel__title">Smart generation</h2>
                        </div>
                        <p className="panel__sub">Auto-fill from your intake + parcel data</p>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginTop: 8 }}>
                          <div className="fee-row">
                            <div>
                              <span className="fee-row__label">Fields auto-filled</span>
                              <span className="fee-row__sub">· across all docs</span>
                            </div>
                            <span className="fee-row__value">87%</span>
                          </div>
                          <div className="fee-row">
                            <div>
                              <span className="fee-row__label">Parcel data matched</span>
                              <span className="fee-row__sub">· sample</span>
                            </div>
                            <span className="fee-row__value">12 fields</span>
                          </div>
                          <div className="fee-row">
                            <div>
                              <span className="fee-row__label">Code references</span>
                              <span className="fee-row__sub">· inline citations</span>
                            </div>
                            <span className="fee-row__value">14</span>
                          </div>
                          <div className="fee-row">
                            <div>
                              <span className="fee-row__label">Time saved</span>
                              <span className="fee-row__sub">· vs manual</span>
                            </div>
                            <span className="fee-row__value">~6h 20m</span>
                          </div>
                        </div>

                        <div
                          style={{
                            marginTop: 18,
                            padding: 12,
                            background: 'var(--surface-2)',
                            border: '1px solid var(--rule)',
                            borderRadius: 6,
                          }}
                        >
                          <div className="label-xs" style={{ marginBottom: 6 }}>
                            Next action
                          </div>
                          <p style={{ margin: '0 0 10px', fontSize: 13, color: 'var(--ink-2)' }}>
                            Generate Site Plan + Construction Drawings from your intake. Takes ~45 seconds.
                          </p>
                          <button type="button" className="btn btn--primary" style={{ width: '100%', justifyContent: 'center' }}>
                            <Icon.sparkle /> Generate remaining 2 documents
                          </button>
                        </div>
                      </section>
                    </div>
                  </div>
                )}

                {contentTab === 'timeline' && (
                  <div className="tab-panel">
                    <div className="panel-grid" style={{ gridTemplateColumns: '1.5fr 1fr' }}>
                      <section className="panel">
                        <div className="panel__head">
                          <h2 className="panel__title">
                            Estimated timeline
                            <span className="num">8–11 days</span>
                          </h2>
                          <button type="button" className="panel__action">
                            Compare jurisdictions →
                          </button>
                        </div>
                        <p className="panel__sub">Based on similar permits for your scope and zone (illustrative)</p>
                        <div className="timeline">
                          {TIMELINE.map((t) => (
                            <Fragment key={t.phase}>
                              <div className="timeline__phase">
                                <div className="timeline__days">{t.days}</div>
                                <span>{t.sub}</span>
                                <small>{t.phase}</small>
                              </div>
                              <div className={`timeline__item ${t.state}`}>
                                <h3 className="timeline__title">
                                  {t.title}
                                  {t.pill ? <span className={`timeline__pill ${t.pillClass}`}>{t.pill}</span> : null}
                                </h3>
                                <p className="timeline__desc">{t.desc}</p>
                                <div className="timeline__sub">
                                  <span>{t.sub2}</span>
                                </div>
                              </div>
                            </Fragment>
                          ))}
                        </div>
                      </section>

                      <div className="side-stack">
                        <section className="panel">
                          <div className="panel__head">
                            <h2 className="panel__title">Rejection risk</h2>
                          </div>
                          <p className="panel__sub">Model v2.3 · updated weekly</p>
                          <div className="risk">
                            <div className="risk__gauge">
                              <svg viewBox="0 0 100 100">
                                <circle cx="50" cy="50" r="42" className="risk__gauge-track" />
                                <circle
                                  cx="50"
                                  cy="50"
                                  r="42"
                                  className="risk__gauge-fill"
                                  strokeDasharray={`${2 * Math.PI * 42}`}
                                  strokeDashoffset={`${2 * Math.PI * 42 * (1 - 0.17)}`}
                                />
                              </svg>
                              <div className="risk__gauge-label">
                                <div className="risk__gauge-num">
                                  17<span style={{ fontSize: 14, color: 'var(--ink-4)' }}>%</span>
                                </div>
                              </div>
                            </div>
                            <div className="risk__factors">
                              {RISK_FACTORS.map((f) => (
                                <div key={f.label} className="risk-factor">
                                  <span className="risk-factor__label">{f.label}</span>
                                  <div className="risk-factor__bar">
                                    <div className="risk-factor__bar-fill" style={{ width: `${f.value}%` }} />
                                  </div>
                                  <span className="risk-factor__val">{f.value}%</span>
                                </div>
                              ))}
                            </div>
                          </div>
                        </section>

                        <section className="panel">
                          <div className="panel__head">
                            <h2 className="panel__title">Benchmark</h2>
                          </div>
                          <p className="panel__sub">Your scope vs. jurisdiction median</p>
                          <div className="fees" style={{ marginTop: 0 }}>
                            <div className="fee-row">
                              <div>
                                <span className="fee-row__label">Your approval ETA</span>
                                <span className="fee-row__sub">· 8–11d</span>
                              </div>
                              <span className="fee-row__value" style={{ color: 'var(--ok)' }}>
                                −3d
                              </span>
                            </div>
                            <div className="fee-row">
                              <div>
                                <span className="fee-row__label">Local median</span>
                                <span className="fee-row__sub">· residential</span>
                              </div>
                              <span className="fee-row__value">13d</span>
                            </div>
                            <div className="fee-row">
                              <div>
                                <span className="fee-row__label">National median</span>
                                <span className="fee-row__sub">· similar scope</span>
                              </div>
                              <span className="fee-row__value">17d</span>
                            </div>
                            <div className="fee-row">
                              <div>
                                <span className="fee-row__label">First-submit approval rate</span>
                                <span className="fee-row__sub">· w/ PreClear</span>
                              </div>
                              <span className="fee-row__value">94%</span>
                            </div>
                          </div>
                        </section>
                      </div>
                    </div>

                    <hr className="hr" />

                    <section className="panel">
                      <div className="panel__head">
                        <h2 className="panel__title">Pre-check activity log</h2>
                        <span className="label-xs">{SESSION_REF}</span>
                      </div>
                      <p className="panel__sub">Every check run against your scope, timestamped</p>
                      <div className="activity__entries" style={{ marginTop: 8 }}>
                        {ACTIVITY.map((a, i) => (
                          <div key={i} className="activity-row">
                            <span className="activity-row__time">{a.time}</span>
                            <span className="activity-row__tag">{a.tag}</span>
                            <span className="activity-row__msg">{a.msg}</span>
                          </div>
                        ))}
                      </div>
                    </section>
                  </div>
                )}
              </main>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
