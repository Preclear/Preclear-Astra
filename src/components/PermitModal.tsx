import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  X,
  ChevronDown,
  ChevronUp,
  ExternalLink,
  CheckCircle2,
} from 'lucide-react';
import type {
  ProjectType,
  ModalState,
  PermitAdviceResponse,
  FreeTextResponse,
  PermitAdviceRequest,
} from '../types/permit';
import { projectTypes } from '../data/projectTypes';
import { fetchPermitAdvice, fetchFreeTextAnswer, sendFeedback } from '../lib/permitApi';

// ─── Generic pill-toggle question ────────────────────────────────────────────

interface PillGroupProps {
  label: string;
  options: { value: string; label: string }[];
  value: string;
  onChange: (v: string) => void;
}

function PillGroup({ label, options, value, onChange }: PillGroupProps) {
  return (
    <div className="pm-question">
      <p className="pm-question__label">{label}</p>
      <div className="pm-question__pills">
        {options.map((opt) => (
          <button
            key={opt.value}
            type="button"
            className={`pm-pill${value === opt.value ? ' pm-pill--selected' : ''}`}
            onClick={() => onChange(opt.value)}
          >
            {opt.label}
          </button>
        ))}
      </div>
    </div>
  );
}

// ─── Per-project question sets ────────────────────────────────────────────────

type Answers = Record<string, string>;

interface QuestionConfig {
  key: string;
  label: string;
  options: { value: string; label: string }[];
}

const DECK_QUESTIONS: QuestionConfig[] = [
  { key: 'attached',     label: 'Attached to your house?',   options: [{ value: 'yes', label: 'Yes' }, { value: 'no', label: 'No' }] },
  { key: 'height',       label: 'Height above grade',        options: [{ value: 'under-30in', label: 'Under 30"' }, { value: '30in-6ft', label: '30" to 6ft' }, { value: 'over-6ft', label: 'Over 6ft' }] },
  { key: 'size',         label: 'Approximate size',          options: [{ value: 'under-200', label: 'Under 200 sqft' }, { value: '200-400', label: '200–400 sqft' }, { value: 'over-400', label: 'Over 400 sqft' }] },
  { key: 'covered',      label: 'Covered or roofed?',        options: [{ value: 'yes', label: 'Yes' }, { value: 'no', label: 'No' }] },
  { key: 'story_below',  label: 'Story or basement below?',  options: [{ value: 'yes', label: 'Yes' }, { value: 'no', label: 'No' }] },
];

const FENCE_QUESTIONS: QuestionConfig[] = [
  { key: 'location',    label: 'Location on property',  options: [{ value: 'front', label: 'Front Yard' }, { value: 'back', label: 'Back Yard' }, { value: 'side', label: 'Side Yard' }] },
  { key: 'height',      label: 'Fence height',          options: [{ value: 'under-4ft', label: 'Under 4ft' }, { value: '4-6ft', label: '4–6ft' }, { value: 'over-6ft', label: 'Over 6ft' }] },
  { key: 'corner_lot',  label: 'Corner lot?',           options: [{ value: 'yes', label: 'Yes' }, { value: 'no', label: 'No' }] },
  { key: 'pool',        label: 'Pool on the property?', options: [{ value: 'yes', label: 'Yes' }, { value: 'no', label: 'No' }] },
];

const ROOF_QUESTIONS: QuestionConfig[] = [
  { key: 'scope',       label: 'Scope of work',             options: [{ value: 'full', label: 'Full Replacement' }, { value: 'partial', label: 'Partial Repair' }] },
  { key: 'to_deck',     label: 'Removing to the roof deck?', options: [{ value: 'yes', label: 'Yes' }, { value: 'no', label: 'No' }] },
  { key: 'structural',  label: 'Any structural changes?',   options: [{ value: 'yes', label: 'Yes' }, { value: 'no', label: 'No' }] },
  { key: 'skylights',   label: 'Adding skylights?',         options: [{ value: 'yes', label: 'Yes' }, { value: 'no', label: 'No' }] },
];

const WINDOWS_QUESTIONS: QuestionConfig[] = [
  { key: 'opening_size', label: 'Opening size changing?',     options: [{ value: 'same', label: 'Same Size' }, { value: 'resizing', label: 'Resizing' }] },
  { key: 'count',        label: 'Number of openings',         options: [{ value: '1-2', label: '1–2' }, { value: '3-5', label: '3–5' }, { value: '6+', label: '6+' }] },
  { key: 'egress',       label: 'Egress windows involved?',   options: [{ value: 'yes', label: 'Yes' }, { value: 'no', label: 'No' }, { value: 'not-sure', label: 'Not Sure' }] },
  { key: 'structural',   label: 'Structural framing changes?', options: [{ value: 'yes', label: 'Yes' }, { value: 'no', label: 'No' }] },
];

const PLUMBING_QUESTIONS: QuestionConfig[] = [
  { key: 'work_type',    label: 'Type of work',               options: [{ value: 'new', label: 'New Fixture' }, { value: 'replacing', label: 'Replacing' }, { value: 'relocating', label: 'Relocating' }] },
  { key: 'water_heater', label: 'Water heater involved?',     options: [{ value: 'yes', label: 'Yes' }, { value: 'no', label: 'No' }] },
  { key: 'underground',  label: 'Underground or sewer work?', options: [{ value: 'yes', label: 'Yes' }, { value: 'no', label: 'No' }] },
  { key: 'renovation',   label: 'Part of larger renovation?', options: [{ value: 'yes', label: 'Yes' }, { value: 'no', label: 'No' }] },
];

const QUESTIONS_MAP: Record<Exclude<ProjectType, 'other'>, QuestionConfig[]> = {
  deck:     DECK_QUESTIONS,
  fence:    FENCE_QUESTIONS,
  roof:     ROOF_QUESTIONS,
  windows:  WINDOWS_QUESTIONS,
  plumbing: PLUMBING_QUESTIONS,
};

// ─── Loading skeleton ─────────────────────────────────────────────────────────

function LoadingSkeleton() {
  return (
    <div className="pm-loading">
      <div className="pm-skeleton pm-skeleton--lg" />
      <div className="pm-skeleton pm-skeleton--md" />
      <div className="pm-skeleton pm-skeleton--sm" />
      <div className="pm-skeleton pm-skeleton--cite-lg" style={{ marginTop: '1.5rem' }} />
      <div className="pm-skeleton pm-skeleton--cite-sm" />
      <p className="pm-loading__text">Searching Baltimore County municipal code…</p>
    </div>
  );
}

// ─── Results ─────────────────────────────────────────────────────────────────

interface ResultsProps {
  projectType: ProjectType;
  response: PermitAdviceResponse | FreeTextResponse;
  onStartNew: () => void;
}

function Results({ projectType, response, onStartNew }: ResultsProps) {
  const [queryOpen, setQueryOpen] = useState(false);
  const [feedback, setFeedback] = useState<'none' | 'given'>('none');
  const [expandedCitations, setExpandedCitations] = useState<Set<number>>(new Set());

  const config = projectTypes.find((p) => p.type === projectType)!;
  const Icon = config.icon;

  // Normalise response for rendering
  const answer = 'rag_answer' in response ? response.rag_answer : response.answer;
  const questionBuilt = 'question_built' in response ? response.question_built : response.question_built;
  const { citations, chunks_retrieved, latency_ms } = response;

  const showWarning =
    answer.includes('do not directly address') ||
    answer.includes('not found in the provided');

  // Split on double newline → paragraphs; replace [Source N] or [N] with superscripts
  function renderAnswer(text: string) {
    const paras = text.split(/\n\n+/);
    return paras.map((para, i) => {
      const parts = para.split(/\[(?:Source\s*)?(\d+)\]/g);
      const nodes: React.ReactNode[] = parts.map((part, j) => {
        if (j % 2 === 1) {
          // Odd indices are captured citation numbers
          const n = parseInt(part, 10);
          return (
            <sup
              key={j}
              className="pm-citation-sup"
              onClick={() => {
                const el = document.getElementById(`pm-cite-${n}`);
                if (el) el.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
              }}
            >
              {n}
            </sup>
          );
        }
        return part;
      });
      return <p key={i} className="pm-answer__para">{nodes}</p>;
    });
  }

  function handleFeedback(signal: 'thumbs_up' | 'thumbs_down') {
    sendFeedback(signal);
    setFeedback('given');
  }

  return (
    <div className="pm-results">
      {/* Jurisdiction + type pills */}
      <div className="pm-results__pills">
        <span className="pm-pill-tag pm-pill-tag--blue">Baltimore County, MD</span>
        <span className="pm-pill-tag pm-pill-tag--gray">
          <Icon size={12} style={{ display: 'inline', verticalAlign: 'middle', marginRight: 4 }} />
          {config.label}
        </span>
      </div>

      {/* Collapsible query */}
      {questionBuilt && (
        <div className="pm-query-toggle">
          <button
            type="button"
            className="pm-query-toggle__btn"
            onClick={() => setQueryOpen((v) => !v)}
          >
            Search query
            {queryOpen ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
          </button>
          {queryOpen && (
            <pre className="pm-query-toggle__content">{questionBuilt}</pre>
          )}
        </div>
      )}

      {/* Answer card */}
      <div className="pm-answer-card">
        <div className="pm-answer__body">{renderAnswer(answer)}</div>

        {showWarning && (
          <div className="pm-warning">
            ⚠ No direct code match found — results may be partial. Consider contacting
            Baltimore County DPS for confirmation.
          </div>
        )}
      </div>

      {/* Code references */}
      {citations.length > 0 && (
        <div className="pm-citations">
          <p className="pm-citations__label">CODE REFERENCES</p>
          {citations.map((c, idx) => {
            const expanded = expandedCitations.has(idx);
            const short = c.excerpt.length > 200 ? c.excerpt.slice(0, 200) + '…' : c.excerpt;
            return (
              <div key={idx} id={`pm-cite-${idx + 1}`} className="pm-cite-card">
                <p className="pm-cite-card__section">{c.section}</p>
                <p className="pm-cite-card__excerpt">
                  {expanded ? c.excerpt : short}
                  {c.excerpt.length > 200 && (
                    <button
                      type="button"
                      className="pm-cite-card__toggle"
                      onClick={() =>
                        setExpandedCitations((prev) => {
                          const next = new Set(prev);
                          expanded ? next.delete(idx) : next.add(idx);
                          return next;
                        })
                      }
                    >
                      {expanded ? ' Show less' : ' Show more'}
                    </button>
                  )}
                </p>
                {c.url && (
                  <a href={c.url} target="_blank" rel="noopener noreferrer" className="pm-cite-card__link">
                    View Source <ExternalLink size={12} />
                  </a>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Metadata */}
      <p className="pm-meta">
        {chunks_retrieved} sections reviewed · {latency_ms}ms
      </p>

      {/* Action row */}
      <div className="pm-results__actions">
        <button type="button" className="pm-btn pm-btn--ghost" onClick={onStartNew}>
          ← Start New Check
        </button>
        <div className="pm-feedback">
          {feedback === 'none' ? (
            <>
              <span className="pm-feedback__label">Was this helpful?</span>
              <button
                type="button"
                className="pm-feedback__btn"
                onClick={() => handleFeedback('thumbs_up')}
                aria-label="Thumbs up"
              >
                👍
              </button>
              <button
                type="button"
                className="pm-feedback__btn"
                onClick={() => handleFeedback('thumbs_down')}
                aria-label="Thumbs down"
              >
                👎
              </button>
            </>
          ) : (
            <span className="pm-feedback__thanks">
              <CheckCircle2 size={14} style={{ color: '#10B981', marginRight: 4, verticalAlign: 'middle' }} />
              Thanks for your feedback ✓
            </span>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── Main PermitModal component ───────────────────────────────────────────────

interface PermitModalProps {
  /** null = modal is closed */
  initialState: ModalState | null;
  onClose: () => void;
  /** Optional pre-filled text for the 'other' free-text box */
  prefillText?: string;
}

export default function PermitModal({ initialState, onClose, prefillText }: PermitModalProps) {
  const [state, setState] = useState<ModalState>(initialState ?? { step: 'pick' });
  const [answers, setAnswers] = useState<Answers>({});
  const [freeText, setFreeText] = useState(prefillText ?? '');
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const backdropRef = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);

  // Sync initialState → internal state when modal opens
  useEffect(() => {
    if (initialState) {
      setState(initialState);
      setAnswers({});
      setFreeText(prefillText ?? '');
      // Trigger CSS enter animation
      requestAnimationFrame(() => setVisible(true));
    } else {
      setVisible(false);
    }
  }, [initialState, prefillText]);

  // Close on Escape
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') handleClose();
    }
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  });

  function handleClose() {
    setVisible(false);
    setTimeout(onClose, 200); // let animation finish
  }

  function handleBackdropClick(e: React.MouseEvent<HTMLDivElement>) {
    if (e.target === backdropRef.current) handleClose();
  }

  // Auto-resize textarea
  function handleTextareaInput(e: React.ChangeEvent<HTMLTextAreaElement>) {
    setFreeText(e.target.value);
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
    }
  }

  // ── Submit handler ──────────────────────────────────────────────────────────

  const handleSubmit = useCallback(async () => {
    if (state.step !== 'questions') return;
    const { projectType } = state;

    const doFetch = async () => {
      setState({ step: 'loading', projectType });
      try {
        if (projectType === 'other') {
          const resp = await fetchFreeTextAnswer(freeText.trim());
          setState({ step: 'results', projectType, response: resp });
        } else {
          const payload: PermitAdviceRequest = {
            project_type: projectType,
            jurisdiction_slug: 'md-baltimore-county',
            parameters: answers as never,
          };
          const resp = await fetchPermitAdvice(payload);
          setState({ step: 'results', projectType, response: resp });
        }
      } catch (err) {
        const message = err instanceof Error ? err.message : 'An unexpected error occurred.';
        setState({ step: 'error', message, retry: doFetch });
      }
    };

    await doFetch();
  }, [state, freeText, answers]);

  // ── Progress bar ────────────────────────────────────────────────────────────
  const progress =
    state.step === 'pick'
      ? 15
      : state.step === 'questions'
      ? 50
      : 100;

  // ── Derived values for current display ─────────────────────────────────────
  const currentProjectType: ProjectType | null =
    state.step === 'questions' || state.step === 'loading' || state.step === 'results'
      ? state.projectType
      : null;
  const config = currentProjectType ? projectTypes.find((p) => p.type === currentProjectType) : null;
  const Icon = config?.icon ?? null;

  // Question completeness check
  let allAnswered = false;
  if (state.step === 'questions') {
    if (state.projectType === 'other') {
      allAnswered = freeText.trim().length >= 30;
    } else {
      const qs = QUESTIONS_MAP[state.projectType as Exclude<ProjectType, 'other'>];
      allAnswered = qs.every((q) => !!answers[q.key]);
    }
  }

  if (!initialState) return null;

  return (
    <div
      ref={backdropRef}
      className={`pm-backdrop${visible ? ' pm-backdrop--visible' : ''}`}
      onClick={handleBackdropClick}
      role="dialog"
      aria-modal="true"
      aria-label="Permit check"
    >
      <div className={`pm-modal${visible ? ' pm-modal--visible' : ''}`}>

        {/* ── Sticky header ─────────────────────────────────────────────── */}
        <div className="pm-header">
          <div className="pm-header__left">
            {Icon && (
              <span className="pm-header__icon">
                <Icon size={18} />
              </span>
            )}
            <span className="pm-header__title">
              {config ? config.label : 'New Permit Check'}
            </span>
          </div>
          <div className="pm-header__right">
            <span className="pm-jurisdiction-pill">Baltimore County, MD</span>
            <button
              type="button"
              className="pm-close-btn"
              onClick={handleClose}
              aria-label="Close"
            >
              <X size={18} />
            </button>
          </div>
        </div>

        {/* Progress bar */}
        <div className="pm-progress">
          <div className="pm-progress__bar" style={{ width: `${progress}%` }} />
        </div>

        {/* ── Body ──────────────────────────────────────────────────────── */}
        <div className="pm-body">

          {/* PICK step */}
          {state.step === 'pick' && (
            <div>
              <p className="pm-pick__heading">Select a project type</p>
              <div className="pm-pick__grid">
                {projectTypes.map((pt) => {
                  const PtIcon = pt.icon;
                  return (
                    <button
                      key={pt.type}
                      type="button"
                      className="pm-type-card"
                      onClick={() => setState({ step: 'questions', projectType: pt.type })}
                    >
                      <span className="pm-type-card__icon"><PtIcon size={22} /></span>
                      <span className="pm-type-card__title">{pt.label}</span>
                      <span className="pm-type-card__desc">{pt.description}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* QUESTIONS step — structured */}
          {state.step === 'questions' && state.projectType !== 'other' && (
            <div>
              <p className="pm-questions__heading">{config?.label} Details</p>
              <p className="pm-questions__sub">A few quick questions for accurate results.</p>
              {QUESTIONS_MAP[state.projectType as Exclude<ProjectType, 'other'>].map((q) => (
                <PillGroup
                  key={q.key}
                  label={q.label}
                  options={q.options}
                  value={answers[q.key] ?? ''}
                  onChange={(v) => setAnswers((prev) => ({ ...prev, [q.key]: v }))}
                />
              ))}
            </div>
          )}

          {/* QUESTIONS step — free text */}
          {state.step === 'questions' && state.projectType === 'other' && (
            <div>
              <p className="pm-questions__heading">Describe your project</p>
              <p className="pm-questions__sub">
                Include what you're building, size, and location on your property.
              </p>
              <div className="pm-textarea-wrap">
                <textarea
                  ref={textareaRef}
                  className="pm-textarea"
                  rows={5}
                  maxLength={500}
                  placeholder={`e.g. I want to add a 12x14 deck attached to the back of my house, about 3 feet above grade, no cover, in Baltimore County…`}
                  value={freeText}
                  onChange={handleTextareaInput}
                />
                <p className="pm-char-count">{freeText.length} / 500</p>
              </div>
              <p className="pm-tip">Tip: More detail = more accurate permit guidance.</p>
            </div>
          )}

          {/* LOADING step */}
          {state.step === 'loading' && <LoadingSkeleton />}

          {/* RESULTS step */}
          {state.step === 'results' && (
            <Results
              projectType={state.projectType}
              response={state.response}
              onStartNew={() => setState({ step: 'pick' })}
            />
          )}

          {/* ERROR step */}
          {state.step === 'error' && (
            <div className="pm-error">
              <p className="pm-error__msg">{state.message}</p>
              <button
                type="button"
                className="pm-btn pm-btn--primary"
                onClick={state.retry}
              >
                Try Again
              </button>
            </div>
          )}
        </div>

        {/* ── Sticky footer (only during questions step) ─────────────────── */}
        {state.step === 'questions' && (
          <div className="pm-footer">
            <button
              type="button"
              className="pm-btn pm-btn--ghost"
              onClick={() => setState({ step: 'pick' })}
            >
              ← Back
            </button>
            <button
              type="button"
              className={`pm-btn pm-btn--primary${allAnswered ? '' : ' pm-btn--disabled'}`}
              disabled={!allAnswered}
              onClick={handleSubmit}
            >
              Check Requirements →
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
