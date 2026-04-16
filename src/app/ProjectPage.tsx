import { useState } from 'react';
import { Link, useLocation, useParams } from 'react-router-dom';
import { paths } from '../routes';

type ProjectStatus = 'draft' | 'in-review' | 'approved';

type ProjectData = {
  id: string;
  name: string;
  type: string;
  address: string;
  status: ProjectStatus;
  date: string;
};

const FALLBACK_PROJECTS: ProjectData[] = [
  { id: '1', name: 'Window Replacement', type: 'Renovation', address: '412 Elm St, Baltimore, MD', status: 'in-review', date: 'Mar 8, 2026' },
  { id: '2', name: 'Detached Garage', type: 'New Build', address: '88 Maple Ave, Rockville, MD', status: 'draft', date: 'Mar 10, 2026' },
  { id: '3', name: 'Solar Panel Install', type: 'Electrical', address: '21 Oak Rd, Annapolis, MD', status: 'approved', date: 'Feb 28, 2026' },
];

function scopeImageFromProject(project: ProjectData): string {
  const name = project.name.toLowerCase();
  if (name.includes('window')) return '/images/onborading/window.png';
  if (name.includes('garage')) return '/images/onborading/Garage%20or%20carport.png';
  if (name.includes('solar')) return '/images/onborading/electricalWork.png';
  return '/images/onborading/somethingelse.png';
}

export default function ProjectPage() {
  const { projectId } = useParams();
  const location = useLocation();
  const stateProject = (location.state as { project?: ProjectData } | null)?.project ?? null;
  const project = stateProject ?? FALLBACK_PROJECTS.find((p) => p.id === projectId) ?? FALLBACK_PROJECTS[0];
  const imageSrc = scopeImageFromProject(project);
  const [completedActionIds, setCompletedActionIds] = useState<string[]>([]);

  const actionItems = [
    {
      id: 'permit-application',
      label: 'Submit building permit application',
      detail:
        'Complete the jurisdiction form with owner/applicant info, project scope, and valuation. Verify parcel and contractor details before submission.',
    },
    {
      id: 'site-plan',
      label: 'Prepare site plan',
      detail:
        'Include lot boundaries, setbacks, existing structures, and the exact area of work. Add scale, north arrow, and dimensions required by your city/county.',
    },
    {
      id: 'construction-drawings',
      label: 'Include construction drawings',
      detail:
        'Attach plan set pages that match your scope: floor/elevation/sections and key notes. Keep sheet naming and revisions consistent.',
    },
    {
      id: 'license-check',
      label: 'Ensure contractor license is valid',
      detail:
        'Confirm active trade license, insurance coverage, and any local registration requirements. Save license number and expiration for packet review.',
    },
  ];

  const toggleActionItem = (id: string) => {
    setCompletedActionIds((prev) =>
      prev.includes(id) ? prev.filter((value) => value !== id) : [...prev, id]
    );
  };

  return (
    <div className="app-questionnaire">
      <div className="app-questionnaire__main app-questionnaire__main--configure">
        <div className="questionnaire-step-enter">
          <div className="questionnaire-configure questionnaire-configure--report">
            <div className="questionnaire-configure__visual">
              <Link to={paths.home} className="qreport__back-link qreport__back-link--visual">
                <span aria-hidden>←</span> Back
              </Link>
              <div className="questionnaire-configure__visual-inner">
                <img
                  src={imageSrc}
                  alt=""
                  width={520}
                  height={520}
                  decoding="async"
                  className="questionnaire-configure__hero-img"
                />
              </div>
              <section className="project-verdict" aria-label="Permit verdict">
                <div className="project-verdict__card">
                  <span className="project-verdict__pill" aria-hidden>
                    Your Permit Status
                  </span>
                  <p className="project-verdict__result">⚠️  Likely Required</p>
                  <p className="project-verdict__subtext">
                    Based on your project and location, a permit is required for this work.
                  </p>
                </div>
              </section>
            </div>

            <div className="questionnaire-configure__panel questionnaire-configure__panel--report questionnaire-configure__panel--project">
              <div className="qreport">
                <div className="qreport__head">
                  <div className="qreport__head-copy">
                    <p className="qreport__eyebrow">Pre-check report</p>
                    <h1 className="qreport__name">{project.name}</h1>
                    <p className="qreport__meta">{project.address} · {project.type} scope</p>
                  </div>
                  <span className="qreport__badge">{project.status.replace('-', ' ')}</span>
                </div>

                <div className="qreport__actions">
                  <div className="qreport__actions-row">
                    <div className="qreport__actions-card">
                      <h2 className="qreport__actions-title">What to do next</h2>
                      <div className="qreport__todo-list">
                        {actionItems.map((item) => {
                          const checked = completedActionIds.includes(item.id);
                          return (
                            <details key={item.id} className="qreport__todo-item">
                              <summary className="qreport__todo-summary">
                                <label className="qreport__todo-check-wrap" onClick={(e) => e.stopPropagation()}>
                                  <input
                                    type="checkbox"
                                    className="qreport__todo-check"
                                    checked={checked}
                                    onChange={() => toggleActionItem(item.id)}
                                  />
                                  <span className="qreport__todo-check-ui" aria-hidden />
                                </label>
                                <span className="qreport__todo-label">{item.label}</span>
                                <span className="qreport__todo-chevron" aria-hidden>
                                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                                    <path d="M6 9l6 6 6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                  </svg>
                                </span>
                              </summary>
                              <p className="qreport__todo-detail">{item.detail}</p>
                            </details>
                          );
                        })}
                      </div>
                    </div>

                    <div className="qreport__side-stack">
                      <aside className="qreport__flags qreport__flags--standalone">
                        <h3 className="qreport__flags-title">Potential Issues</h3>
                        <ul className="qreport__flags-list">
                          <li>Work near property line may require zoning review</li>
                          <li>HOA approval may be required before submission</li>
                          <li>Unlicensed contractor may delay approval</li>
                        </ul>
                      </aside>

                      <section className="qreport__compliance">
                        <h3 className="qreport__compliance-title">Who can apply</h3>
                        <ul className="qreport__compliance-list">
                          <li>Permit must be pulled by licensed contractor</li>
                          <li>Homeowner permits not allowed for this work</li>
                        </ul>
                      </section>
                    </div>
                  </div>
                </div>

                <hr className="qreport__rule" />

                <div className="qreport__requirements">
                  <div className="qreport__requirements-layout">
                    <section className="qreport__requirements-main">
                      <h3 className="qreport__requirements-title">Why this is required</h3>
                      <p className="qreport__requirements-sub">3 checks to review</p>
                      <div className="qreport__requirements-steps">
                        <article className="qreport__requirement-step qreport__requirement-step--active">
                          <span className="qreport__requirement-step-num" aria-hidden>1</span>
                          <div className="qreport__requirement-step-body">
                            <p className="qreport__requirement-step-title">Zoning rules</p>
                            <p className="qreport__requirement-step-desc">
                              Deck exceeds height threshold. Must meet setback requirements.
                            </p>
                          </div>
                        </article>
                        <article className="qreport__requirement-step">
                          <span className="qreport__requirement-step-num" aria-hidden>2</span>
                          <div className="qreport__requirement-step-body">
                            <p className="qreport__requirement-step-title">Building code</p>
                            <p className="qreport__requirement-step-desc">
                              Structural modification detected. Inspection required.
                            </p>
                          </div>
                        </article>
                        <article className="qreport__requirement-step">
                          <span className="qreport__requirement-step-num" aria-hidden>3</span>
                          <div className="qreport__requirement-step-body">
                            <p className="qreport__requirement-step-title">Local rules</p>
                            <p className="qreport__requirement-step-desc">
                              County requires permit for exterior work.
                            </p>
                          </div>
                        </article>
                      </div>
                    </section>

                    <section className="qreport__docs">
                      <h3 className="qreport__docs-title">Required documents</h3>
                      <p className="qreport__docs-missing">You&apos;re missing 2 of 3</p>
                      <div className="qreport__docs-grid">
                        <article className="qreport__doc-card">
                          <img
                            src="/images/onborading/docuemnt.png"
                            alt=""
                            width={60}
                            height={60}
                            decoding="async"
                            className="qreport__doc-thumb"
                          />
                          <p className="qreport__doc-name">Site Plan</p>
                        </article>
                        <article className="qreport__doc-card">
                          <img
                            src="/images/onborading/docuemnt.png"
                            alt=""
                            width={60}
                            height={60}
                            decoding="async"
                            className="qreport__doc-thumb"
                          />
                          <p className="qreport__doc-name">Construction Drawings</p>
                        </article>
                        <article className="qreport__doc-card qreport__doc-card--present">
                          <img
                            src="/images/onborading/docuemnt.png"
                            alt=""
                            width={60}
                            height={60}
                            decoding="async"
                            className="qreport__doc-thumb"
                          />
                          <p className="qreport__doc-name">Permit Application</p>
                        </article>
                      </div>
                    </section>
                  </div>
                </div>

              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
