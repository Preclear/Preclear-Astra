import {
  FormEvent,
  WheelEvent,
  useCallback,
  useEffect,
  useId,
  useMemo,
  useRef,
  useState,
  type CSSProperties,
} from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { fetchAddressSuggestions } from '../../lib/addressAutocomplete';
import { paths } from '../../routes';
import ConfigureWindowAuraChat from './ConfigureWindowAuraChat';

type BuildIntent = 'new-build' | 'renovation';

const BASE_STEP_LABELS = ['Name', 'Goal', 'Site', 'Property', 'Work', 'Scope'] as const;

const INTENT_OPTIONS: {
  id: BuildIntent;
  label: string;
  imageSrc: string;
}[] = [
  {
    id: 'new-build',
    label: 'A new build',
    imageSrc: '/images/onborading/newBuild.png',
  },
  {
    id: 'renovation',
    label: 'Renovating an existing build',
    imageSrc: '/images/onborading/rennovation.png',
  },
];

type PropertyCategory = 'single-family' | 'multifamily' | 'commercial';
type PropertySpecial = 'corner' | 'hoa' | 'none';

const PROPERTY_TYPE_OPTIONS: {
  id: PropertyCategory;
  label: string;
  imageSrc: string;
}[] = [
  { id: 'single-family', label: 'Single Family', imageSrc: '/images/onborading/singleFamily.png' },
  { id: 'multifamily', label: 'Multifamily', imageSrc: '/images/onborading/multiFamily.png' },
  { id: 'commercial', label: 'Commercial', imageSrc: '/images/onborading/Commerical.png' },
];

const PROPERTY_SPECIAL_OPTIONS: { id: PropertySpecial; label: string }[] = [
  { id: 'corner', label: 'Corner lot' },
  { id: 'hoa', label: 'Part of an HOA' },
  { id: 'none', label: 'None of these' },
];

type WorkResponsible = 'diy' | 'hired-contractor' | 'contractor' | 'planning';

/** Full-screen view within the Work step (does not advance the global step). */
type WorkSubView = 'main' | 'diy' | 'hired' | 'contractor';
type OwnLiveAnswer = 'yes' | 'no';
type PermitPulledBy = 'contractor' | 'homeowner' | 'not-sure';
type ContractorInsurance = 'yes' | 'no' | 'pending';

const WORK_RESPONSIBLE_OPTIONS: {
  id: WorkResponsible;
  label: string;
  imageSrc: string;
}[] = [
  { id: 'diy', label: "I'm doing the work myself", imageSrc: '/images/onborading/myself.png' },
  { id: 'hired-contractor', label: 'I hired a contractor', imageSrc: '/images/onborading/HireContractor.png' },
  { id: 'contractor', label: 'I am the contractor', imageSrc: '/images/onborading/iamContractor.png' },
  { id: 'planning', label: 'Just planning / exploring', imageSrc: '/images/onborading/justPlanning.png' },
];

const DIY_OWN_LIVE_OPTIONS: { id: OwnLiveAnswer; label: string; imageSrc: string }[] = [
  { id: 'yes', label: 'Yes', imageSrc: '/images/onborading/liveInIt.png' },
  { id: 'no', label: 'No', imageSrc: '/images/onborading/doesNotLiveInIt.png' },
];

const PERMIT_PULLED_OPTIONS: { id: PermitPulledBy; label: string; imageSrc: string }[] = [
  { id: 'contractor', label: 'Contractor', imageSrc: '/images/onborading/iamContractor.png' },
  { id: 'homeowner', label: 'Me (homeowner)', imageSrc: '/images/onborading/myself.png' },
  { id: 'not-sure', label: 'Not sure', imageSrc: '/images/onborading/questionmark.png' },
];

const CONTRACTOR_INSURANCE_OPTIONS: { id: ContractorInsurance; label: string; imageSrc: string }[] = [
  { id: 'yes', label: 'Yes', imageSrc: '/images/onborading/haveLicense.png' },
  { id: 'no', label: 'No', imageSrc: '/images/onborading/dontHaveLicense.png' },
  { id: 'pending', label: 'Pending', imageSrc: '/images/onborading/pendingLicense.png' },
];

/** Placeholder list — swap for CMS / per-jurisdiction routes later; ids stay stable for branching. */
const WORK_SCOPE_OPTIONS: { id: string; category: string; label: string; emoji?: string; imageSrc?: string }[] = [
  { id: 'windows', category: 'Renovation', label: 'Window replacement', imageSrc: '/images/onborading/window.png' },
  { id: 'kitchen', category: 'Renovation', label: 'Kitchen remodel', imageSrc: '/images/onborading/kitchenRemodel.png' },
  { id: 'bath', category: 'Renovation', label: 'Bathroom remodel', imageSrc: '/images/onborading/bathroomRemodel.png' },
  /* Filenames include a leading space on disk */
  { id: 'flooring', category: 'Interior', label: 'Flooring', imageSrc: '/images/onborading/%20Flooring.png' },
  { id: 'electrical', category: 'Trades', label: 'Electrical work', imageSrc: '/images/onborading/electricalWork.png' },
  { id: 'plumbing', category: 'Trades', label: 'Plumbing', imageSrc: '/images/onborading/Plumbing.png' },
  { id: 'hvac', category: 'Trades', label: 'HVAC', imageSrc: '/images/onborading/HAVC.png' },
  { id: 'roofing', category: 'Exterior', label: 'Roofing', imageSrc: '/images/onborading/%20Roofing.png' },
  {
    id: 'deck',
    category: 'Exterior',
    label: 'Deck or patio',
    imageSrc: '/images/onborading/Deck%20or%20patio.png',
  },
  {
    id: 'addition',
    category: 'Structural',
    label: 'Addition or bump-out',
    imageSrc: '/images/onborading/Addition%20or%20bump-out.png',
  },
  {
    id: 'garage',
    category: 'Structural',
    label: 'Garage or carport',
    imageSrc: '/images/onborading/Garage%20or%20carport.png',
  },
  {
    id: 'planning',
    category: 'Planning',
    label: 'Planning / feasibility only',
    imageSrc: '/images/onborading/Planning.png',
  },
  { id: 'other', category: 'Other', label: 'Something else', imageSrc: '/images/onborading/somethingelse.png' },
];

type WindowCountId = 'single' | 'two' | 'many';

const WINDOW_COUNT_OPTIONS: { id: WindowCountId; label: string }[] = [
  { id: 'single', label: 'Single window' },
  { id: 'two', label: 'Two windows' },
  { id: 'many', label: 'More than three' },
];

const WINDOW_STYLE_OPTIONS: { id: string; label: string }[] = [
  { id: 'single-hung', label: 'Single-hung' },
  { id: 'double-hung', label: 'Double-hung' },
  { id: 'sliding', label: 'Sliding' },
];

const SCOPE_STAGE_OPTIONS = [
  { id: 'exploring', label: 'Exploring options' },
  { id: 'ready-soon', label: 'Ready in 1-3 months' },
  { id: 'starting-now', label: 'Starting now' },
] as const;

const SCOPE_COMPLEXITY_OPTIONS = [
  { id: 'light', label: 'Light update' },
  { id: 'moderate', label: 'Moderate scope' },
  { id: 'full', label: 'Full remodel / major work' },
] as const;

const FORM_ID = 'questionnaire-step-form';

const NAME_TYPEWRITER_EXAMPLES = [
  'Garage build',
  'Kitchen remodel',
  'Back deck',
  'Basement finish',
  'ADU addition',
] as const;

function WindowCountGlyph({ variant }: { variant: WindowCountId }) {
  if (variant === 'single') {
    return (
      <svg viewBox="0 0 48 48" className="questionnaire-configure__glyph" aria-hidden>
        <rect x="11" y="13" width="26" height="22" rx="2" fill="none" stroke="currentColor" strokeWidth="2" />
        <path d="M24 13v22" stroke="currentColor" strokeWidth="1.5" />
      </svg>
    );
  }
  if (variant === 'two') {
    return (
      <svg viewBox="0 0 48 48" className="questionnaire-configure__glyph" aria-hidden>
        <rect x="9" y="14" width="17" height="21" rx="2" fill="none" stroke="currentColor" strokeWidth="2" />
        <rect x="20" y="12" width="17" height="21" rx="2" fill="none" stroke="currentColor" strokeWidth="2" />
      </svg>
    );
  }
  return (
    <svg viewBox="0 0 48 48" className="questionnaire-configure__glyph" aria-hidden>
      <rect x="7" y="16" width="12" height="17" rx="1.5" fill="none" stroke="currentColor" strokeWidth="1.75" />
      <rect x="16" y="14" width="12" height="17" rx="1.5" fill="none" stroke="currentColor" strokeWidth="1.75" />
      <rect x="25" y="12" width="12" height="17" rx="1.5" fill="none" stroke="currentColor" strokeWidth="1.75" />
    </svg>
  );
}

export default function NewProjectQuestionnairePage() {
  const navigate = useNavigate();
  const [step, setStep] = useState(0);

  const [intent, setIntent] = useState<BuildIntent | null>(null);
  const [projectName, setProjectName] = useState('');
  const [address, setAddress] = useState('');
  const [propertyCategory, setPropertyCategory] = useState<PropertyCategory | null>(null);
  const [propertySpecial, setPropertySpecial] = useState<PropertySpecial | null>(null);
  const [workResponsible, setWorkResponsible] = useState<WorkResponsible | null>(null);
  const [ownLiveProperty, setOwnLiveProperty] = useState<OwnLiveAnswer | null>(null);
  const [permitPulledBy, setPermitPulledBy] = useState<PermitPulledBy | null>(null);
  const [contractorInsurance, setContractorInsurance] = useState<ContractorInsurance | null>(null);
  const [workSubView, setWorkSubView] = useState<WorkSubView>('main');
  const [workScopeId, setWorkScopeId] = useState<string | null>(null);
  const [windowCount, setWindowCount] = useState<WindowCountId | null>(null);
  const [windowStyleId, setWindowStyleId] = useState<string | null>(null);
  const [scopeStageId, setScopeStageId] = useState<string | null>(null);
  const [scopeComplexityId, setScopeComplexityId] = useState<string | null>(null);
  const [addressSuggestionsOpen, setAddressSuggestionsOpen] = useState(false);
  const [addressSuggestions, setAddressSuggestions] = useState<string[]>([]);
  const [addressSearchLoading, setAddressSearchLoading] = useState(false);
  const [addressNoResults, setAddressNoResults] = useState(false);
  const [nameFieldFocused, setNameFieldFocused] = useState(false);
  const [nameTypewriter, setNameTypewriter] = useState('');
  const addressComboRef = useRef<HTMLDivElement>(null);
  const addressAbortRef = useRef<AbortController | null>(null);
  const scopeOptionsScrollRef = useRef<HTMLDivElement | null>(null);
  const addressListId = useId();

  /** Same step: swap form ↔ Aura chat (does not change questionnaire step index). */
  const [configureAuraOpen, setConfigureAuraOpen] = useState(false);

  useEffect(() => {
    if (!import.meta.env.DEV) return;
    const params = new URLSearchParams(window.location.search);
    const preview = params.get('preview');
    if (!preview) return;

    // Dev-only fast preview so UI tweaks don't require stepping through onboarding.
    setIntent('renovation');
    setProjectName('Window replacement');
    setAddress('123 Main St');
    setPropertyCategory('single-family');
    setPropertySpecial('none');
    setWorkResponsible('planning');
    setWorkSubView('main');

    if (preview === 'scope') {
      setWorkScopeId(null);
      setStep(5);
      return;
    }

    if (preview === 'configure') {
      setWorkScopeId('windows');
      setWindowCount('single');
      setWindowStyleId('single-hung');
      setStep(6);
      if (params.get('aura') === '1') {
        setConfigureAuraOpen(true);
      }
      return;
    }

    if (preview === 'review') {
      setWorkScopeId('windows');
      setWindowCount('single');
      setWindowStyleId('single-hung');
      setStep(7);
    }
  }, []);

  useEffect(() => {
    if (step !== 6 || workScopeId !== 'windows') {
      setConfigureAuraOpen(false);
    }
  }, [step, workScopeId]);

  useEffect(() => {
    if (step !== 0 || projectName.trim().length > 0 || nameFieldFocused) {
      setNameTypewriter('');
      return;
    }

    const examples = NAME_TYPEWRITER_EXAMPLES;
    let ex = 0;
    let i = 0;
    let phase: 'type' | 'pause' | 'erase' = 'type';
    let pauseUntil = 0;

    const id = window.setInterval(() => {
      const full = examples[ex % examples.length];
      const now = Date.now();

      if (phase === 'pause') {
        if (now >= pauseUntil) phase = 'erase';
        return;
      }

      if (phase === 'type') {
        if (i < full.length) {
          i += 1;
          setNameTypewriter(full.slice(0, i));
        } else {
          phase = 'pause';
          pauseUntil = now + 2200;
        }
        return;
      }

      if (i > 0) {
        i -= 1;
        setNameTypewriter(full.slice(0, i));
      } else {
        ex += 1;
        phase = 'type';
      }
    }, 48);

    return () => window.clearInterval(id);
  }, [step, projectName, nameFieldFocused]);

  useEffect(() => {
    if (step !== 2) {
      setAddressSuggestions([]);
      setAddressSearchLoading(false);
      setAddressNoResults(false);
      return;
    }

    const q = address.trim();
    if (q.length < 3) {
      setAddressSuggestions([]);
      setAddressSearchLoading(false);
      setAddressNoResults(false);
      return;
    }

    addressAbortRef.current?.abort();
    const ac = new AbortController();
    addressAbortRef.current = ac;

    const t = window.setTimeout(() => {
      setAddressSearchLoading(true);
      setAddressNoResults(false);
      setAddressSuggestions([]);
      fetchAddressSuggestions(q, ac.signal)
        .then((rows) => {
          if (!ac.signal.aborted) {
            setAddressSuggestions(rows);
            setAddressNoResults(rows.length === 0);
          }
        })
        .catch(() => {
          if (!ac.signal.aborted) {
            setAddressSuggestions([]);
            setAddressNoResults(true);
          }
        })
        .finally(() => {
          if (!ac.signal.aborted) setAddressSearchLoading(false);
        });
    }, 380);

    return () => {
      window.clearTimeout(t);
      ac.abort();
    };
  }, [address, step]);

  useEffect(() => {
    const onDocDown = (e: MouseEvent) => {
      if (!addressComboRef.current?.contains(e.target as Node)) {
        setAddressSuggestionsOpen(false);
      }
    };
    document.addEventListener('mousedown', onDocDown);
    return () => document.removeEventListener('mousedown', onDocDown);
  }, []);

  const pickAddress = useCallback((value: string) => {
    setAddress(value);
    setAddressSuggestionsOpen(false);
  }, []);

  const selectIntent = (id: BuildIntent) => {
    setIntent(id);
  };

  const selectPropertyCategory = (id: PropertyCategory) => {
    setPropertyCategory(id);
    setPropertySpecial(null);
  };

  const selectWorkResponsible = (id: WorkResponsible) => {
    setWorkResponsible(id);
    setOwnLiveProperty(null);
    setPermitPulledBy(null);
    setContractorInsurance(null);
    if (id === 'planning') {
      setWorkSubView('main');
      return;
    }
    if (id === 'diy') setWorkSubView('diy');
    else if (id === 'hired-contractor') setWorkSubView('hired');
    else if (id === 'contractor') setWorkSubView('contractor');
  };

  const canNextName = projectName.trim().length > 0;
  const canNextGoal = intent !== null;
  const canNextSite = address.trim().length > 0;
  const canNextProperty = propertyCategory !== null && propertySpecial !== null;

  const canNextWork =
    workResponsible !== null &&
    (workResponsible === 'planning' ||
      (workResponsible === 'diy' && ownLiveProperty !== null) ||
      (workResponsible === 'hired-contractor' && permitPulledBy !== null) ||
      (workResponsible === 'contractor' && contractorInsurance !== null));

  const canNextScope = workScopeId !== null;

  const canNextWindowConfigure =
    workScopeId === 'windows' && windowCount !== null && windowStyleId !== null;

  const canNextGenericConfigure =
    workScopeId !== null && workScopeId !== 'windows' && scopeStageId !== null && scopeComplexityId !== null;

  const canNextConfigure = canNextWindowConfigure || canNextGenericConfigure;

  const progressLabels = useMemo(() => [...BASE_STEP_LABELS, 'Configure', 'Review'] as const, []);

  const maxStepIndex = progressLabels.length - 1;

  useEffect(() => {
    if (workScopeId !== 'windows') {
      setWindowCount(null);
      setWindowStyleId(null);
    }
  }, [workScopeId]);

  useEffect(() => {
    if (workScopeId === 'windows') {
      setScopeStageId(null);
      setScopeComplexityId(null);
    } else if (workScopeId === null) {
      setScopeStageId(null);
      setScopeComplexityId(null);
    }
  }, [workScopeId]);

  useEffect(() => {
    if (step !== 4) setWorkSubView('main');
  }, [step]);

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    navigate(paths.app, { replace: true });
  };

  const goNext = () => {
    if (step === 0 && !canNextName) return;
    if (step === 1 && !canNextGoal) return;
    if (step === 2 && !canNextSite) return;
    if (step === 3 && !canNextProperty) return;
    if (step === 4 && !canNextWork) return;
    if (step === 5 && !canNextScope) return;
    if (step === 6 && !canNextConfigure) return;
    if (step < maxStepIndex) setStep((s) => s + 1);
  };

  const goBack = () => {
    if (step === 4 && workSubView !== 'main') {
      setWorkSubView('main');
      return;
    }
    if (step > 0) setStep((s) => s - 1);
    else navigate(paths.app);
  };

  const intentLabel = intent ? INTENT_OPTIONS.find((o) => o.id === intent)?.label ?? '—' : '—';

  const propertyCategoryLabel = propertyCategory
    ? PROPERTY_TYPE_OPTIONS.find((o) => o.id === propertyCategory)?.label ?? '—'
    : '—';

  const propertySpecialLabel = propertySpecial
    ? PROPERTY_SPECIAL_OPTIONS.find((o) => o.id === propertySpecial)?.label ?? '—'
    : '—';

  const workResponsibleLabel = workResponsible
    ? WORK_RESPONSIBLE_OPTIONS.find((o) => o.id === workResponsible)?.label ?? '—'
    : '—';

  const ownLiveLabel =
    ownLiveProperty === 'yes' ? 'Yes' : ownLiveProperty === 'no' ? 'No' : '—';

  const permitPulledLabel = permitPulledBy
    ? PERMIT_PULLED_OPTIONS.find((o) => o.id === permitPulledBy)?.label ?? '—'
    : '—';

  const contractorInsuranceLabel = contractorInsurance
    ? CONTRACTOR_INSURANCE_OPTIONS.find((o) => o.id === contractorInsurance)?.label ?? '—'
    : '—';

  const workScopeLabel = workScopeId
    ? WORK_SCOPE_OPTIONS.find((o) => o.id === workScopeId)?.label ?? '—'
    : '—';

  const windowCountLabel = windowCount
    ? WINDOW_COUNT_OPTIONS.find((o) => o.id === windowCount)?.label ?? '—'
    : '—';

  const windowStyleLabel = windowStyleId
    ? WINDOW_STYLE_OPTIONS.find((o) => o.id === windowStyleId)?.label ?? '—'
    : '—';

  const scopeStageLabel = scopeStageId
    ? SCOPE_STAGE_OPTIONS.find((o) => o.id === scopeStageId)?.label ?? '—'
    : '—';

  const scopeComplexityLabel = scopeComplexityId
    ? SCOPE_COMPLEXITY_OPTIONS.find((o) => o.id === scopeComplexityId)?.label ?? '—'
    : '—';

  const selectedScopeOption = workScopeId ? WORK_SCOPE_OPTIONS.find((o) => o.id === workScopeId) ?? null : null;
  const selectedScopeLabel = selectedScopeOption?.label ?? 'Project scope';
  const selectedScopeImage = selectedScopeOption?.imageSrc ?? '/images/onborading/somethingelse.png';

  const continueDisabled =
    (step === 0 && !canNextName) ||
    (step === 1 && !canNextGoal) ||
    (step === 2 && !canNextSite) ||
    (step === 3 && !canNextProperty) ||
    (step === 4 && !canNextWork) ||
    (step === 5 && !canNextScope) ||
    (step === 6 && !canNextConfigure);

  const footerBar = (
    <footer className="questionnaire-footer-bar">
      <div className="questionnaire-footer-bar__sheet">
        <div className="questionnaire-footer-bar__inner">
          <div className="questionnaire-footer__left">
            <button
              type="button"
              className="questionnaire-footer-back"
              onClick={goBack}
              aria-label={
                step === 4 && workSubView !== 'main' ? 'Back to main question' : 'Go back'
              }
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden>
                <path
                  d="M15 18l-6-6 6-6"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </button>
            <Link to={paths.app} className="questionnaire-footer-projects">
              <span className="questionnaire-footer-projects__label">Projects</span>
              <svg className="questionnaire-footer-projects__arrow" width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden>
                <path d="M9 18l6-6-6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </Link>
          </div>

          <div className="questionnaire-footer__mid">
            <div
              className="questionnaire-footer-progress"
              role="progressbar"
              aria-valuenow={step + 1}
              aria-valuemin={1}
              aria-valuemax={progressLabels.length}
              aria-label={`Step ${step + 1} of ${progressLabels.length}`}
            >
              <div className="questionnaire-footer-segments">
                {progressLabels.map((label, i) => (
                  <div
                    key={label}
                    className={
                      i < step
                        ? 'questionnaire-footer-segments__seg questionnaire-footer-segments__seg--done'
                        : i === step
                          ? 'questionnaire-footer-segments__seg questionnaire-footer-segments__seg--current'
                          : 'questionnaire-footer-segments__seg'
                    }
                    title={label}
                  />
                ))}
              </div>
            </div>
          </div>

          <div className="questionnaire-footer__right">
            {step === maxStepIndex ? (
              <button
                type="submit"
                form={FORM_ID}
                className="questionnaire-footer-cta questionnaire-footer-cta--primary"
              >
                Create project
              </button>
            ) : (
              <button
                type="button"
                className="questionnaire-footer-cta questionnaire-footer-cta--primary"
                onClick={goNext}
                disabled={continueDisabled}
              >
                Continue
                <svg className="questionnaire-footer-cta__chev" width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden>
                  <path d="M9 18l6-6-6-6" stroke="currentColor" strokeWidth="2.25" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </button>
            )}
          </div>
        </div>
      </div>
    </footer>
  );

  const mainChromeClass =
    step === 0 || step === 1 || step === 2 || step === 3 || step === 4 || step === 5
      ? 'app-questionnaire__main app-questionnaire__main--between-chrome'
      : step === 6
        ? 'app-questionnaire__main app-questionnaire__main--configure'
        : 'app-questionnaire__main';
  const isAuraChatView = step === 6 && configureAuraOpen;
  const showFooterBar = !isAuraChatView;
  const handleScopeFormWheel = (e: WheelEvent<HTMLFormElement>) => {
    const scroller = scopeOptionsScrollRef.current;
    if (!scroller) return;

    const target = e.target as Node | null;
    if (target && scroller.contains(target)) return;
    if (scroller.scrollHeight <= scroller.clientHeight) return;

    scroller.scrollTop += e.deltaY;
    e.preventDefault();
  };

  return (
    <div className={isAuraChatView ? 'app-questionnaire app-questionnaire--aura-open' : 'app-questionnaire'}>
      <div className={mainChromeClass}>
        <div key={step} className="questionnaire-step-enter">
          {step === 0 ? (
            <div className="questionnaire questionnaire--details-centered">
              <form
                id={FORM_ID}
                className="questionnaire__form questionnaire__form--details"
                onSubmit={(e) => e.preventDefault()}
              >
                <div className="questionnaire-details">
                  <header className="questionnaire-details__header">
                    <h1 className="questionnaire-details__title">What&apos;s your project called?</h1>
                    <p className="questionnaire-details__lede">
                      This is the name you&apos;ll see in your workspace. Keep it short—you can change it
                      later.
                    </p>
                  </header>
                  <div className="questionnaire-details__stack">
                    <div className="questionnaire-details__field questionnaire-details__field--name-only">
                      <div className="qd-search qd-search--no-btn questionnaire-name-search">
                        <div className="questionnaire-name-search__inner">
                          <input
                            id="qd-project-name"
                            className="qd-search__input questionnaire-name-search__input"
                            type="text"
                            value={projectName}
                            onChange={(e) => setProjectName(e.target.value)}
                            onFocus={() => setNameFieldFocused(true)}
                            onBlur={() => setNameFieldFocused(false)}
                            placeholder=""
                            autoComplete="off"
                            aria-label="Name your project"
                            autoFocus
                          />
                          {!projectName && !nameFieldFocused && (
                            <span className="questionnaire-name-search__ghost" aria-hidden>
                              <span className="questionnaire-name-search__ghost-text">{nameTypewriter}</span>
                              <span className="questionnaire-name-search__caret" />
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </form>
            </div>
          ) : step === 1 ? (
            <div className="questionnaire-split questionnaire-split--two-col">
              <div className="questionnaire-split__left">
                <h1 className="questionnaire-split__headline">What are you trying to do?</h1>
                <p className="questionnaire-split__lede">
                  Choose the path that best matches your project. We&apos;ll tune the permit pre-check
                  and document list for new construction versus work on an existing structure.
                </p>
              </div>
              <div className="questionnaire-split__right">
                <div className="questionnaire-split__tiles" role="group" aria-label="Project goal">
                  {INTENT_OPTIONS.map((opt) => {
                    const selected = intent === opt.id;
                    return (
                      <button
                        key={opt.id}
                        type="button"
                        onClick={() => selectIntent(opt.id)}
                        aria-pressed={selected}
                        className={
                          selected
                            ? 'questionnaire-tile questionnaire-tile--row questionnaire-tile--selected'
                            : 'questionnaire-tile questionnaire-tile--row'
                        }
                      >
                        <span className="questionnaire-tile__media questionnaire-tile__media--photo">
                          <img src={opt.imageSrc} alt="" width={96} height={96} decoding="async" />
                        </span>
                        <span className="questionnaire-tile__label questionnaire-tile__label--row">{opt.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          ) : step === 2 ? (
            <div className="questionnaire questionnaire--details-centered questionnaire--details-wide">
              <form
                id={FORM_ID}
                className="questionnaire__form questionnaire__form--details"
                onSubmit={(e) => e.preventDefault()}
              >
                <div className="questionnaire-details">
                  <header className="questionnaire-details__header">
                    <h1 className="questionnaire-details__title">Where&apos;s the site?</h1>
                    <p className="questionnaire-details__lede questionnaire-details__lede--wide">
                      Enter the property address. We use it to match zoning overlays and the right
                      permit checklist—so your pre-check lines up with what reviewers actually see.
                    </p>
                  </header>

                  <div className="questionnaire-details__stack questionnaire-details__stack--site">
                    <div className="questionnaire-details__field questionnaire-details__field--name-only">
                      <div ref={addressComboRef} className="questionnaire-combo questionnaire-combo--site">
                        <div className="qd-search qd-search--no-btn">
                          <input
                            id="qd-address"
                            className="qd-search__input"
                            type="text"
                            role="combobox"
                            aria-expanded={
                              addressSuggestionsOpen &&
                              address.trim().length >= 3 &&
                              (addressSearchLoading ||
                                addressSuggestions.length > 0 ||
                                addressNoResults)
                            }
                            aria-controls={addressListId}
                            aria-autocomplete="list"
                            autoComplete="street-address"
                            spellCheck={false}
                            value={address}
                            onChange={(e) => {
                              setAddress(e.target.value);
                              setAddressSuggestionsOpen(true);
                            }}
                            onFocus={() => setAddressSuggestionsOpen(true)}
                            onKeyDown={(e) => {
                              if (e.key === 'Escape') setAddressSuggestionsOpen(false);
                            }}
                            placeholder="Start typing an address…"
                            aria-label="Property address"
                            autoFocus
                          />
                        </div>
                        {addressSuggestionsOpen &&
                          address.trim().length >= 3 &&
                          (addressSearchLoading ||
                            addressSuggestions.length > 0 ||
                            addressNoResults) && (
                            <ul
                              id={addressListId}
                              className="questionnaire-combo__list"
                              role="listbox"
                              aria-label="Address suggestions"
                            >
                              {addressSearchLoading && addressSuggestions.length === 0 ? (
                                <li className="questionnaire-combo__status" role="presentation">
                                  Searching…
                                </li>
                              ) : addressNoResults && addressSuggestions.length === 0 ? (
                                <li className="questionnaire-combo__status" role="presentation">
                                  No matching addresses
                                </li>
                              ) : (
                                addressSuggestions.map((line) => (
                                  <li key={line} role="presentation">
                                    <button
                                      type="button"
                                      role="option"
                                      className="questionnaire-combo__option"
                                      onMouseDown={(e) => e.preventDefault()}
                                      onClick={() => pickAddress(line)}
                                    >
                                      {line}
                                    </button>
                                  </li>
                                ))
                              )}
                            </ul>
                          )}
                      </div>
                    </div>
                  </div>
                </div>
              </form>
            </div>
          ) : step === 3 ? (
            <form
              id={FORM_ID}
              className="questionnaire-property-step-form"
              onSubmit={(e) => e.preventDefault()}
            >
              <div className="questionnaire-split questionnaire-split--two-col questionnaire-split--property">
                <div className="questionnaire-split__left">
                  <h1 className="questionnaire-split__headline">Property type</h1>
                  <p className="questionnaire-split__lede">
                    Choose what best describes the parcel. We use this to align setbacks, density, and
                    use rules with how jurisdictions classify the site.
                  </p>
                </div>
                <div className="questionnaire-split__right questionnaire-split__right--property">
                  <div className="questionnaire-split__tiles" role="group" aria-label="Property type">
                    {PROPERTY_TYPE_OPTIONS.map((opt) => {
                      const selected = propertyCategory === opt.id;
                      return (
                        <button
                          key={opt.id}
                          type="button"
                          onClick={() => selectPropertyCategory(opt.id)}
                          aria-pressed={selected}
                          className={
                            selected
                              ? 'questionnaire-tile questionnaire-tile--row questionnaire-tile--property questionnaire-tile--selected'
                              : 'questionnaire-tile questionnaire-tile--row questionnaire-tile--property'
                          }
                        >
                          <span className="questionnaire-tile__media questionnaire-tile__media--photo questionnaire-tile__media--property">
                            <img src={opt.imageSrc} alt="" width={120} height={120} decoding="async" />
                          </span>
                          <span className="questionnaire-tile__label questionnaire-tile__label--row">{opt.label}</span>
                        </button>
                      );
                    })}
                  </div>

                  {propertyCategory && (
                    <div className="questionnaire-property-sub">
                      <p className="questionnaire-property-sub__title" id="property-sub-heading">
                        Anything special about your property?
                      </p>
                      <div
                        className="questionnaire-property-sub__options"
                        role="group"
                        aria-labelledby="property-sub-heading"
                      >
                        {PROPERTY_SPECIAL_OPTIONS.map((opt) => {
                          const on = propertySpecial === opt.id;
                          return (
                            <button
                              key={opt.id}
                              type="button"
                              onClick={() => setPropertySpecial(opt.id)}
                              aria-pressed={on}
                              className={
                                on
                                  ? 'questionnaire-property-sub__chip questionnaire-property-sub__chip--selected'
                                  : 'questionnaire-property-sub__chip'
                              }
                            >
                              {opt.label}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </form>
          ) : step === 4 ? (
            <form
              id={FORM_ID}
              className="questionnaire-work-step-form"
              onSubmit={(e) => e.preventDefault()}
            >
              <div className="questionnaire-split questionnaire-split--two-col questionnaire-split--work">
                {workSubView === 'main' && (
                  <>
                    <div className="questionnaire-split__left">
                      <h1 className="questionnaire-split__headline">Who&apos;s responsible for the work?</h1>
                      <p className="questionnaire-split__lede">
                        This shapes permit roles, liability, and who we expect on the plan set.
                      </p>
                    </div>
                    <div className="questionnaire-split__right questionnaire-split__right--work">
                      <div className="questionnaire-split__tiles" role="group" aria-label="Who is responsible">
                        {WORK_RESPONSIBLE_OPTIONS.map((opt) => {
                          const selected = workResponsible === opt.id;
                          return (
                            <button
                              key={opt.id}
                              type="button"
                              onClick={() => selectWorkResponsible(opt.id)}
                              aria-pressed={selected}
                              className={
                                selected
                                  ? 'questionnaire-tile questionnaire-tile--row questionnaire-tile--work questionnaire-tile--selected'
                                  : 'questionnaire-tile questionnaire-tile--row questionnaire-tile--work'
                              }
                            >
                              <span
                                className="questionnaire-tile__media questionnaire-tile__media--emoji questionnaire-tile__media--work-role questionnaire-tile__media--work-responsible"
                                aria-hidden
                              >
                                <img
                                  src={opt.imageSrc}
                                  alt=""
                                  decoding="async"
                                  className={
                                    opt.id === 'contractor' || opt.id === 'planning'
                                      ? 'questionnaire-tile__media-img questionnaire-tile__media-img--slightly-smaller'
                                      : 'questionnaire-tile__media-img'
                                  }
                                />
                              </span>
                              <span className="questionnaire-tile__label questionnaire-tile__label--row">{opt.label}</span>
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  </>
                )}

                {workSubView === 'diy' && (
                  <>
                    <div className="questionnaire-split__left">
                      <h1 className="questionnaire-split__headline">Do you own and live in this property?</h1>
                      <p className="questionnaire-split__lede">
                        Owner-occupants and homestead rules can change which exemptions and forms apply in
                        your jurisdiction.
                      </p>
                    </div>
                    <div className="questionnaire-split__right questionnaire-split__right--work">
                      <div
                        className="questionnaire-split__tiles questionnaire-work-sub__tiles"
                        role="group"
                        aria-label="Ownership"
                      >
                        {DIY_OWN_LIVE_OPTIONS.map((opt) => {
                          const sel = ownLiveProperty === opt.id;
                          return (
                            <button
                              key={opt.id}
                              type="button"
                              onClick={() => setOwnLiveProperty(opt.id)}
                              aria-pressed={sel}
                              className={
                                sel
                                  ? 'questionnaire-tile questionnaire-tile--row questionnaire-tile--sub questionnaire-tile--selected'
                                  : 'questionnaire-tile questionnaire-tile--row questionnaire-tile--sub'
                              }
                            >
                              <span
                                className="questionnaire-tile__media questionnaire-tile__media--emoji questionnaire-tile__media--work-role questionnaire-tile__media--own-live"
                                aria-hidden
                              >
                                <img
                                  src={opt.imageSrc}
                                  alt=""
                                  decoding="async"
                                  className={
                                    opt.id === 'yes'
                                      ? 'questionnaire-tile__media-img questionnaire-tile__media-img--own-live-yes'
                                      : 'questionnaire-tile__media-img'
                                  }
                                />
                              </span>
                              <span className="questionnaire-tile__label questionnaire-tile__label--row">{opt.label}</span>
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  </>
                )}

                {workSubView === 'hired' && (
                  <>
                    <div className="questionnaire-split__left">
                      <h1 className="questionnaire-split__headline">Who will pull the permit?</h1>
                      <p className="questionnaire-split__lede">
                        The applicant of record affects signatures, inspections, and who the jurisdiction
                        contacts first.
                      </p>
                    </div>
                    <div className="questionnaire-split__right questionnaire-split__right--work">
                      <div
                        className="questionnaire-split__tiles questionnaire-work-sub__tiles"
                        role="group"
                        aria-label="Permit applicant"
                      >
                        {PERMIT_PULLED_OPTIONS.map((opt) => {
                          const sel = permitPulledBy === opt.id;
                          return (
                            <button
                              key={opt.id}
                              type="button"
                              onClick={() => setPermitPulledBy(opt.id)}
                              aria-pressed={sel}
                              className={
                                sel
                                  ? 'questionnaire-tile questionnaire-tile--row questionnaire-tile--sub questionnaire-tile--selected'
                                  : 'questionnaire-tile questionnaire-tile--row questionnaire-tile--sub'
                              }
                            >
                              <span
                                className="questionnaire-tile__media questionnaire-tile__media--emoji questionnaire-tile__media--work-role questionnaire-tile__media--permit-pulled"
                                aria-hidden
                              >
                                <img
                                  src={opt.imageSrc}
                                  alt=""
                                  decoding="async"
                                  className={
                                    opt.id === 'contractor'
                                      ? 'questionnaire-tile__media-img questionnaire-tile__media-img--slightly-smaller'
                                      : 'questionnaire-tile__media-img'
                                  }
                                />
                              </span>
                              <span className="questionnaire-tile__label questionnaire-tile__label--row">{opt.label}</span>
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  </>
                )}

                {workSubView === 'contractor' && (
                  <>
                    <div className="questionnaire-split__left">
                      <h1 className="questionnaire-split__headline">Do you have active insurance?</h1>
                      <p className="questionnaire-split__lede">
                        Coverage on file helps us align liability and trade requirements before submission.
                      </p>
                    </div>
                    <div className="questionnaire-split__right questionnaire-split__right--work">
                      <div
                        className="questionnaire-split__tiles questionnaire-work-sub__tiles"
                        role="group"
                        aria-label="Insurance status"
                      >
                        {CONTRACTOR_INSURANCE_OPTIONS.map((opt) => {
                          const sel = contractorInsurance === opt.id;
                          return (
                            <button
                              key={opt.id}
                              type="button"
                              onClick={() => setContractorInsurance(opt.id)}
                              aria-pressed={sel}
                              className={
                                sel
                                  ? 'questionnaire-tile questionnaire-tile--row questionnaire-tile--sub questionnaire-tile--selected'
                                  : 'questionnaire-tile questionnaire-tile--row questionnaire-tile--sub'
                              }
                            >
                              <span
                                className="questionnaire-tile__media questionnaire-tile__media--emoji questionnaire-tile__media--work-role questionnaire-tile__media--contractor-insurance"
                                aria-hidden
                              >
                                <img
                                  src={opt.imageSrc}
                                  alt=""
                                  decoding="async"
                                  className="questionnaire-tile__media-img"
                                />
                              </span>
                              <span className="questionnaire-tile__label questionnaire-tile__label--row">{opt.label}</span>
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  </>
                )}
              </div>
            </form>
          ) : step === 5 ? (
            <form
              id={FORM_ID}
              className="questionnaire-scope-step-form"
              onWheel={handleScopeFormWheel}
              onSubmit={(e) => e.preventDefault()}
            >
              <div className="questionnaire-scope-sheet">
                <div className="questionnaire-scope-copy">
                  <h1 className="questionnaire-split__headline">What kind of work is this?</h1>
                  <p className="questionnaire-split__lede">
                    Pick the closest match. Each path gets its own checklist and reviewer notes—scroll the list for
                    every trade we support in your area.
                  </p>
                </div>
                <div className="questionnaire-split__right questionnaire-split__right--scope">
                  <div className="questionnaire-scope-options-wrap">
                    <div
                      className="questionnaire-scope-options-scroll"
                      ref={scopeOptionsScrollRef}
                      role="region"
                      aria-label="Work scope options"
                    >
                      <div className="questionnaire-scope-list" role="group">
                        {WORK_SCOPE_OPTIONS.map((opt, i) => {
                          const selected = workScopeId === opt.id;
                          return (
                            <button
                              key={opt.id}
                              type="button"
                              onClick={() => setWorkScopeId(opt.id)}
                              aria-pressed={selected}
                              style={{ '--scope-i': i } as CSSProperties}
                              className={
                                selected
                                  ? 'questionnaire-tile questionnaire-tile--row questionnaire-tile--scope questionnaire-tile--selected'
                                  : 'questionnaire-tile questionnaire-tile--row questionnaire-tile--scope'
                              }
                            >
                              <span
                                className={
                                  opt.imageSrc
                                    ? 'questionnaire-tile__media questionnaire-tile__media--emoji questionnaire-tile__media--scope-ico questionnaire-tile__media--work-role'
                                    : 'questionnaire-tile__media questionnaire-tile__media--emoji questionnaire-tile__media--scope-ico'
                                }
                                aria-hidden
                              >
                                {opt.imageSrc ? (
                                  <img
                                    src={opt.imageSrc}
                                    alt=""
                                    decoding="async"
                                    className="questionnaire-tile__media-img questionnaire-tile__media-img--scope"
                                  />
                                ) : (
                                  opt.emoji
                                )}
                              </span>
                              <span className="questionnaire-tile__stack questionnaire-tile__stack--scope">
                                <span className="questionnaire-tile__kicker">{opt.category}</span>
                                <span className="questionnaire-tile__title-line">{opt.label}</span>
                              </span>
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </form>
          ) : step === 6 ? (
            <form
              id={FORM_ID}
              className="questionnaire-configure-form"
              onSubmit={(e) => e.preventDefault()}
            >
              <div
                className={
                  configureAuraOpen
                    ? 'questionnaire-configure questionnaire-configure--aura'
                    : 'questionnaire-configure'
                }
              >
                <div className="questionnaire-configure__visual">
                  <div className="questionnaire-configure__visual-inner">
                    <img
                      src={selectedScopeImage}
                      alt=""
                      width={520}
                      height={520}
                      decoding="async"
                      className="questionnaire-configure__hero-img"
                    />
                  </div>
                  {configureAuraOpen ? (
                    <div className="questionnaire-configure__visual-copy">
                      <h2 className="questionnaire-configure__visual-title">{selectedScopeLabel}</h2>
                      <p className="questionnaire-configure__visual-blurb">
                        We&apos;ll help map the permit path and checklist for this scope based on your answers.
                        You can adjust details anytime before submission.
                      </p>
                    </div>
                  ) : (
                    <button
                      type="button"
                      className="questionnaire-configure__visual-hint questionnaire-configure__visual-hint--btn"
                      onClick={() => setConfigureAuraOpen(true)}
                    >
                      <span className="questionnaire-configure__visual-hint-lead">Not sure?</span>{' '}
                      <span className="questionnaire-configure__visual-hint-ai">
                        Ask your personal AI agent.
                      </span>
                    </button>
                  )}
                </div>
                {configureAuraOpen ? (
                  <div className="questionnaire-configure__panel questionnaire-configure__panel--aura">
                    <ConfigureWindowAuraChat
                      onClose={() => setConfigureAuraOpen(false)}
                      scopeLabel={selectedScopeLabel}
                    />
                  </div>
                ) : (
                  <div className="questionnaire-configure__panel">
                    {workScopeId === 'windows' ? (
                      <>
                        <h1 className="questionnaire-configure__title">Configure window replacement</h1>
                        <p className="questionnaire-configure__lede">
                          Tell us how many openings you&apos;re replacing and the style you&apos;re planning.
                          We&apos;ll match the right permit path and checklist—more detail will attach to each
                          scope as we connect jurisdictions.
                        </p>

                        <section className="questionnaire-configure__section" aria-labelledby="cfg-win-count">
                          <h2 className="questionnaire-configure__section-title" id="cfg-win-count">
                            Number of windows
                          </h2>
                          <div className="questionnaire-configure__pick-row" role="group" aria-label="Number of windows">
                            {WINDOW_COUNT_OPTIONS.map((opt) => {
                              const selected = windowCount === opt.id;
                              return (
                                <button
                                  key={opt.id}
                                  type="button"
                                  onClick={() => setWindowCount(opt.id)}
                                  aria-pressed={selected}
                                  className={
                                    selected
                                      ? 'questionnaire-configure__pick questionnaire-configure__pick--selected'
                                      : 'questionnaire-configure__pick'
                                  }
                                >
                                  <span className="questionnaire-configure__pick-icon" aria-hidden>
                                    <WindowCountGlyph variant={opt.id} />
                                  </span>
                                  <span className="questionnaire-configure__pick-label">{opt.label}</span>
                                </button>
                              );
                            })}
                          </div>
                        </section>

                        <section className="questionnaire-configure__section" aria-labelledby="cfg-win-style">
                          <h2 className="questionnaire-configure__section-title" id="cfg-win-style">
                            Window style
                          </h2>
                          <div className="questionnaire-configure__pick-row" role="group" aria-label="Window style">
                            {WINDOW_STYLE_OPTIONS.map((opt) => {
                              const selected = windowStyleId === opt.id;
                              return (
                                <button
                                  key={opt.id}
                                  type="button"
                                  onClick={() => setWindowStyleId(opt.id)}
                                  aria-pressed={selected}
                                  className={
                                    selected
                                      ? 'questionnaire-configure__pick questionnaire-configure__pick--selected'
                                      : 'questionnaire-configure__pick'
                                  }
                                >
                                  <span
                                    className="questionnaire-configure__pick-icon questionnaire-configure__pick-icon--blank"
                                    aria-hidden
                                  />
                                  <span className="questionnaire-configure__pick-label">{opt.label}</span>
                                </button>
                              );
                            })}
                          </div>
                        </section>
                      </>
                    ) : (
                      <>
                        <h1 className="questionnaire-configure__title">Configure {selectedScopeLabel.toLowerCase()}</h1>
                        <p className="questionnaire-configure__lede">
                          Tell us where this project stands so we can tailor checklist depth, review notes,
                          and permit routing for this scope.
                        </p>

                        <section className="questionnaire-configure__section" aria-labelledby="cfg-scope-stage">
                          <h2 className="questionnaire-configure__section-title" id="cfg-scope-stage">
                            Project stage
                          </h2>
                          <div className="questionnaire-configure__pick-row" role="group" aria-label="Project stage">
                            {SCOPE_STAGE_OPTIONS.map((opt) => {
                              const selected = scopeStageId === opt.id;
                              return (
                                <button
                                  key={opt.id}
                                  type="button"
                                  onClick={() => setScopeStageId(opt.id)}
                                  aria-pressed={selected}
                                  className={
                                    selected
                                      ? 'questionnaire-configure__pick questionnaire-configure__pick--selected'
                                      : 'questionnaire-configure__pick'
                                  }
                                >
                                  <span
                                    className="questionnaire-configure__pick-icon questionnaire-configure__pick-icon--blank"
                                    aria-hidden
                                  />
                                  <span className="questionnaire-configure__pick-label">{opt.label}</span>
                                </button>
                              );
                            })}
                          </div>
                        </section>

                        <section className="questionnaire-configure__section" aria-labelledby="cfg-scope-complexity">
                          <h2 className="questionnaire-configure__section-title" id="cfg-scope-complexity">
                            Work intensity
                          </h2>
                          <div className="questionnaire-configure__pick-row" role="group" aria-label="Work intensity">
                            {SCOPE_COMPLEXITY_OPTIONS.map((opt) => {
                              const selected = scopeComplexityId === opt.id;
                              return (
                                <button
                                  key={opt.id}
                                  type="button"
                                  onClick={() => setScopeComplexityId(opt.id)}
                                  aria-pressed={selected}
                                  className={
                                    selected
                                      ? 'questionnaire-configure__pick questionnaire-configure__pick--selected'
                                      : 'questionnaire-configure__pick'
                                  }
                                >
                                  <span
                                    className="questionnaire-configure__pick-icon questionnaire-configure__pick-icon--blank"
                                    aria-hidden
                                  />
                                  <span className="questionnaire-configure__pick-label">{opt.label}</span>
                                </button>
                              );
                            })}
                          </div>
                        </section>
                      </>
                    )}
                  </div>
                )}
              </div>
            </form>
          ) : step === 7 ? (
            <div className="questionnaire questionnaire--narrow">
              <h1 className="questionnaire__title">Review</h1>
              <p className="questionnaire__subtitle">
                Confirm everything looks right before we create your workspace project.
              </p>

              <form id={FORM_ID} className="questionnaire__form" onSubmit={handleSubmit}>
                <div className="questionnaire__summary">
                  <dl className="questionnaire__dl">
                    <dt>Goal</dt>
                    <dd>{intentLabel}</dd>
                    <dt>Name</dt>
                    <dd>{projectName || '—'}</dd>
                    <dt>Address</dt>
                    <dd>{address || '—'}</dd>
                    <dt>Property type</dt>
                    <dd>{propertyCategoryLabel}</dd>
                    <dt>Property details</dt>
                    <dd>{propertySpecialLabel}</dd>
                    <dt>Who&apos;s responsible</dt>
                    <dd>{workResponsibleLabel}</dd>
                    {workResponsible === 'diy' && (
                      <>
                        <dt>Own and live on property</dt>
                        <dd>{ownLiveLabel}</dd>
                      </>
                    )}
                    {workResponsible === 'hired-contractor' && (
                      <>
                        <dt>Who pulls the permit</dt>
                        <dd>{permitPulledLabel}</dd>
                      </>
                    )}
                    {workResponsible === 'contractor' && (
                      <>
                        <dt>Active insurance</dt>
                        <dd>{contractorInsuranceLabel}</dd>
                      </>
                    )}
                    <dt>Work scope</dt>
                    <dd>
                      {workScopeId ? (
                        <>
                          <span className="questionnaire__dd-kicker">
                            {WORK_SCOPE_OPTIONS.find((o) => o.id === workScopeId)?.category}
                          </span>{' '}
                          {workScopeLabel}
                        </>
                      ) : (
                        '—'
                      )}
                    </dd>
                    {workScopeId === 'windows' && (
                      <>
                        <dt>Windows</dt>
                        <dd>
                          {windowCountLabel} · {windowStyleLabel}
                        </dd>
                      </>
                    )}
                    {workScopeId !== null && workScopeId !== 'windows' && (
                      <>
                        <dt>Project stage</dt>
                        <dd>{scopeStageLabel}</dd>
                        <dt>Work intensity</dt>
                        <dd>{scopeComplexityLabel}</dd>
                      </>
                    )}
                  </dl>
                  <p className="questionnaire__hint">
                    You can edit your project and add documents after it appears in your workspace.
                  </p>
                </div>
              </form>
            </div>
          ) : null}
        </div>
      </div>
      {showFooterBar ? footerBar : null}
    </div>
  );
}
