import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { paths } from '../../routes';

type ProjectStatus = 'draft' | 'in-review' | 'approved';

type Project = {
  id: string;
  name: string;
  type: string;
  address: string;
  status: ProjectStatus;
  date: string;
};

const STATUS_CONFIG: Record<ProjectStatus, { label: string; color: string }> = {
  draft:       { label: 'Draft',     color: '#94a3b8' },
  'in-review': { label: 'In Review', color: '#d97706' },
  approved:    { label: 'Approved',  color: '#16a34a' },
};

const SAMPLE_PROJECTS: Project[] = [
  { id: '1', name: 'Window Replacement', type: 'Renovation',  address: '412 Elm St, Baltimore, MD',    status: 'in-review', date: 'Mar 8, 2026'  },
  { id: '2', name: 'Detached Garage',    type: 'New Build',   address: '88 Maple Ave, Rockville, MD',  status: 'draft',     date: 'Mar 10, 2026' },
  { id: '3', name: 'Solar Panel Install',type: 'Electrical',  address: '21 Oak Rd, Annapolis, MD',     status: 'approved',  date: 'Feb 28, 2026' },
];

type WorkspaceSectionProps = {
  /** When set, “New Project” opens this route (e.g. questionnaire) instead of the inline form. */
  newProjectHref?: string;
};

export default function WorkspaceSection({ newProjectHref }: WorkspaceSectionProps) {
  const [projects, setProjects] = useState<Project[]>(SAMPLE_PROJECTS);
  const [showNew, setShowNew] = useState(false);
  const [newName, setNewName] = useState('');
  const [newAddress, setNewAddress] = useState('');
  const useQuestionnaire = Boolean(newProjectHref);

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim()) return;
    setProjects([{
      id: Date.now().toString(),
      name: newName,
      type: 'General',
      address: newAddress || '—',
      status: 'draft',
      date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
    }, ...projects]);
    setNewName('');
    setNewAddress('');
    setShowNew(false);
  };

  return (
    <div className="workspace">
      <div className="workspace__header">
        <div className="workspace__heading-group">
          <h2 className="workspace__heading">Your Projects</h2>
          <p className="workspace__subheading">Save and track each permit project in one place.</p>
        </div>
        <button className="workspace__new-btn">View All</button>
      </div>

      {showNew && (
        <form className="workspace__create-card" onSubmit={handleCreate}>
          <p className="workspace__create-title">New project</p>
          <input className="workspace__create-input" placeholder="Project name — e.g. Garage Build" value={newName} onChange={(e) => setNewName(e.target.value)} autoFocus />
          <input className="workspace__create-input" placeholder="Address (optional)" value={newAddress} onChange={(e) => setNewAddress(e.target.value)} />
          <div className="workspace__create-actions">
            <button type="button" className="workspace__create-cancel" onClick={() => setShowNew(false)}>Cancel</button>
            <button type="submit" className="workspace__create-submit">Create</button>
          </div>
        </form>
      )}

      <div className="workspace__grid">

        {/* Add card — equal width, left */}
        {useQuestionnaire && newProjectHref ? (
          <Link to={newProjectHref} className="workspace__card workspace__card--add">
            <div className="workspace__card-add-body">
              <div className="workspace__card-add-ring">
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                  <path d="M8 2v12M2 8h12" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round"/>
                </svg>
              </div>
              <div>
                <p className="workspace__card-add-label">New Project</p>
                <p className="workspace__card-add-hint">Start a permit pre-check</p>
              </div>
            </div>
          </Link>
        ) : (
          <button type="button" className="workspace__card workspace__card--add" onClick={() => setShowNew(true)}>
            <div className="workspace__card-add-body">
              <div className="workspace__card-add-ring">
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                  <path d="M8 2v12M2 8h12" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round"/>
                </svg>
              </div>
              <div>
                <p className="workspace__card-add-label">New Project</p>
                <p className="workspace__card-add-hint">Start a permit pre-check</p>
              </div>
            </div>
          </button>
        )}

        {/* Project cards */}
        {projects.map((p) => {
          const s = STATUS_CONFIG[p.status];
          return (
            <Link
              key={p.id}
              to={`${paths.app}/projects/${p.id}`}
              state={{ project: p }}
              className="workspace__card workspace__card--project-link"
            >
              <div className="workspace__card-top">
                <span className="workspace__card-type">{p.type}</span>
                <span className="workspace__card-status" style={{ color: s.color }}>
                  <span className="workspace__card-dot" style={{ background: s.color }} />
                  {s.label}
                </span>
              </div>
              <h3 className="workspace__card-name">{p.name}</h3>
              <p className="workspace__card-address">{p.address}</p>
              <div className="workspace__card-footer">
                <span className="workspace__card-date">{p.date}</span>
                <span className="workspace__card-open">Open →</span>
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
