import { useState } from 'react';

export type AgentExecStepState = 'done' | 'in_progress' | 'waiting' | 'locked';

export type AgentExecStep = {
  id: string;
  index: number;
  title: string;
  meta: string;
  description: string;
  state: AgentExecStepState;
  /** 0–100 fill on the progress track */
  progress: number;
};

type AgentExecutionPlanProps = {
  portalName: string;
  stepCount?: number;
};

/** Aligns with Status tab `feed__row--*` + `feed__pip--*`. */
function feedVisualState(state: AgentExecStepState): 'done' | 'running' | 'wait' | 'queued' {
  switch (state) {
    case 'done':
      return 'done';
    case 'in_progress':
      return 'running';
    case 'waiting':
      return 'wait';
    case 'locked':
      return 'queued';
    default:
      return 'queued';
  }
}

function badgeLabel(state: AgentExecStepState): string {
  switch (state) {
    case 'done':
      return 'Done';
    case 'in_progress':
      return 'In progress';
    case 'waiting':
      return 'Waiting on you';
    case 'locked':
      return 'Locked';
    default:
      return '';
  }
}

function padStep(n: number): string {
  return String(n).padStart(2, '0');
}

function badgeClass(state: AgentExecStepState): string {
  switch (state) {
    case 'in_progress':
      return 'feed__badge feed__badge--running';
    case 'waiting':
      return 'feed__badge feed__badge--wait';
    case 'locked':
      return 'feed__badge feed__badge--queued';
    case 'done':
    default:
      return 'feed__badge feed__badge--wait';
  }
}

export function buildAgentExecutionSteps(portalName: string): AgentExecStep[] {
  return [
    {
      id: 'intake',
      index: 1,
      title: 'Scope & jurisdiction intake',
      meta: 'completed 11:03',
      description: 'Parse project, identify jurisdiction, load applicable code ruleset.',
      state: 'done',
      progress: 100,
    },
    {
      id: 'compliance',
      index: 2,
      title: 'Code compliance validation',
      meta: 'completed 11:04',
      description: 'Run zoning, building, and local rules against your scope. Cite everything.',
      state: 'done',
      progress: 100,
    },
    {
      id: 'docs',
      index: 3,
      title: 'Generate & validate document pack',
      meta: '4 of 6 complete',
      description: 'Auto-generate site plan, drawings, forms. Validate each against the rubric.',
      state: 'in_progress',
      progress: Math.round((4 / 6) * 100),
    },
    {
      id: 'resolve',
      index: 4,
      title: 'Resolve flagged issues',
      meta: '1 blocker · user input',
      description: 'Finalize egress calculation once bedroom measurements are uploaded.',
      state: 'waiting',
      progress: 0,
    },
    {
      id: 'submit',
      index: 5,
      title: `Submit to ${portalName} portal`,
      meta: 'awaiting step 4',
      description: 'Authenticate, upload packet, pay fees, capture receipt number.',
      state: 'locked',
      progress: 0,
    },
    {
      id: 'monitor',
      index: 6,
      title: 'Monitor & respond to corrections',
      meta: 'phase 2 of review',
      description: 'Watch examiner queue, draft responses to correction notices, keep you in the loop.',
      state: 'locked',
      progress: 0,
    },
  ];
}

export function AgentExecutionPlan({ portalName, stepCount = 6 }: AgentExecutionPlanProps) {
  const [expanded, setExpanded] = useState(false);
  const steps = buildAgentExecutionSteps(portalName);

  return (
    <div className={`tab-panel status-tab agent-exec-plan${expanded ? ' agent-exec-plan--expanded' : ''}`}>
      <section className="feed-card">
        <div className="feed-card__head">
          <div className="feed-card__title-group">
            <h2 className="feed-card__eyebrow">Agent execution plan</h2>
            <span className="feed__row-tag">
              {stepCount} {stepCount === 1 ? 'step' : 'steps'}
            </span>
          </div>
          <button type="button" className="feed-card__all-link" onClick={() => setExpanded((v) => !v)}>
            {expanded ? 'Collapse all →' : 'Expand all →'}
          </button>
        </div>
        <p className="feed-card__sub">Not a checklist — a pipeline the agent runs end-to-end</p>

        <ol className="feed">
          {steps.map((step) => {
            const fv = feedVisualState(step.state);
            return (
              <li
                key={step.id}
                className={`feed__row feed__row--${fv}${expanded ? ' agent-exec-plan__row--open' : ''}`}
              >
                <span className={`feed__pip feed__pip--${fv}`} aria-hidden />
                <div className="feed__row-body">
                  <div className="feed__row-top">
                    <div className="feed__row-heading">
                      <span className="feed__row-title">
                        <span className="agent-exec-plan__ix">{padStep(step.index)}</span>
                        {step.title}
                      </span>
                      <span className="feed__row-tag">{step.meta}</span>
                    </div>
                    <span className={badgeClass(step.state)}>{badgeLabel(step.state)}</span>
                  </div>
                  <p className="feed__row-detail">{step.description}</p>
                  <div className="agent-exec-plan__track-row">
                    <div className="agent-exec-plan__track" aria-hidden>
                      <div className="agent-exec-plan__fill" style={{ width: `${step.progress}%` }} />
                    </div>
                    <span className="agent-exec-plan__track-pct">{step.progress}%</span>
                  </div>
                </div>
              </li>
            );
          })}
        </ol>
      </section>
    </div>
  );
}
