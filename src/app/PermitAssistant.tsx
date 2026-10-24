import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { paths } from '../routes';
import './permitAssistant.css';

type Rule = { id: string; requirement: string; source_url: string; code_citation: string };
type Lookup = { status: string; missing_attributes: string[]; rules: Rule[] };
type Message = { role: 'user' | 'assistant'; content: string; lookups?: Lookup[] };
type Readiness = 'checking' | 'limited' | 'signin' | 'empty' | 'ready' | 'error';
const accessEmail = 'mailto:d.asfaw10@gmail.com?subject=PreClear%20access%20request';
const starters = ['Do I need a permit to replace my windows?', 'What permits might I need to build a deck?', 'What should I check before remodeling my kitchen?'];

async function request(path: string, signal: AbortSignal, body?: object) {
  const session = supabase ? (await supabase.auth.getSession()).data.session : null;
  if (!session) throw new Error('Your session has ended. Please sign in again.');
  const response = await fetch(`/api/${path}`, {
    method: body ? 'POST' : 'GET', signal,
    headers: { Authorization: `Bearer ${session.access_token}`, 'Content-Type': 'application/json' },
    ...(body ? { body: JSON.stringify(body) } : {}),
  });
  const data = await response.json();
  if (!response.ok) {
    if (response.status === 401) throw new Error('Your session has ended. Please sign in again.');
    if (response.status === 503) throw new Error('Permit research is temporarily unavailable. Your question is saved below; please try again later.');
    throw new Error('We could not complete this lookup. Please try again.');
  }
  return data;
}

export default function PermitAssistant({ onClose, scopeLabel }: { onClose?: () => void; scopeLabel?: string }) {
  const [jurisdictions, setJurisdictions] = useState<{ id: string; name: string }[]>([]);
  const [jurisdiction, setJurisdiction] = useState('');
  const [draft, setDraft] = useState(() => new URLSearchParams(window.location.search).get('question') || (scopeLabel ? `What permits may be required for ${scopeLabel.toLowerCase()}?` : ''));
  const [messages, setMessages] = useState<Message[]>([]);
  const [error, setError] = useState('');
  const [readiness, setReadiness] = useState<Readiness>('checking');
  const [signedIn, setSignedIn] = useState(false);
  const [checkVersion, setCheckVersion] = useState(0);
  const [sending, setSending] = useState(false);
  const [pendingQuestion, setPendingQuestion] = useState('');
  const active = useRef<AbortController | null>(null);
  const mounted = useRef(true);
  const conversationEnd = useRef<HTMLDivElement>(null);
  const previousUser = useRef<string | null | undefined>(undefined);

  useEffect(() => {
    mounted.current = true;
    const subscription = supabase?.auth.onAuthStateChange((_event, session) => {
      const userId = session?.user.id ?? null;
      setSignedIn(Boolean(session));
      if (previousUser.current !== userId) {
        previousUser.current = userId;
        active.current?.abort();
        setMessages([]); setJurisdiction(''); setCheckVersion(v => v + 1);
      }
    });
    return () => { mounted.current = false; active.current?.abort(); subscription?.data.subscription.unsubscribe(); };
  }, []);

  useEffect(() => {
    let current = true;
    const controller = new AbortController();
    const timeout = window.setTimeout(() => controller.abort(), 15000);
    setReadiness('checking'); setError(''); setJurisdictions([]);
    async function check() {
      try {
        const response = await fetch('/api/health', { signal: controller.signal });
        if (!response.ok) throw new Error('Service check failed');
        const health = await response.json();
        const session = supabase ? (await supabase.auth.getSession()).data.session : null;
        if (controller.signal.aborted) return;
        setSignedIn(Boolean(session));
        if (!health.lookup_configured || !health.chat_configured || health.auth_configured === false || !supabase) {
          setReadiness('limited'); return;
        }
        if (!session) { setReadiness('signin'); return; }
        const data = await request('jurisdictions', controller.signal);
        if (controller.signal.aborted) return;
        setJurisdictions(data);
        setJurisdiction(current => data.some((item: {id: string}) => item.id === current) ? current : '');
        setReadiness(data.length ? 'ready' : 'empty');
      } catch {
        if (current && mounted.current) setReadiness('error');
      } finally { window.clearTimeout(timeout);
      }
    }
    void check();
    return () => { current = false; controller.abort(); window.clearTimeout(timeout); };
  }, [checkVersion]);

  useEffect(() => { conversationEnd.current?.scrollIntoView({ block: 'nearest', behavior: 'smooth' }); }, [messages, sending]);

  async function send() {
    if (!draft.trim() || !jurisdiction || sending || readiness !== 'ready') return;
    const question = draft.trim();
    const controller = new AbortController(); active.current = controller;
    const timer = window.setTimeout(() => controller.abort(), 115000);
    setError(''); setSending(true); setPendingQuestion(question); setDraft('');
    // Commit a user/assistant pair only after a successful response; failed retries never duplicate history.
    try {
      const result = await request('chat', controller.signal, { jurisdiction_id: jurisdiction, question,
        history: messages.slice(-12).map(({ role, content }) => ({ role, content })) });
      if (controller.signal.aborted) throw new Error('Lookup stopped.');
      if (mounted.current) setMessages(prev => [...prev, { role: 'user', content: question }, { role: 'assistant', content: result.answer, lookups: result.lookups }]);
    } catch (e) {
      if (mounted.current) {
        setError(controller.signal.aborted ? 'Lookup stopped. Your question is ready to try again.' : (e instanceof Error ? e.message : 'Lookup failed. Please try again.'));
        setDraft(question);
      }
    } finally { window.clearTimeout(timer); if (mounted.current) setSending(false); active.current = null; }
  }

  const returnPath = `/permit-agent${draft ? `?question=${encodeURIComponent(draft)}` : ''}`;
  const signInPath = `${paths.signIn}?returnTo=${encodeURIComponent(returnPath)}`;
  const status = {
    checking: ['Checking availability', 'We’re checking the connection to permit research.'],
    limited: ['Aura is in limited preview', 'Live research access is currently limited. Contact Daniel to request access or arrange a project walkthrough.'],
    signin: ['Sign in to start your research', 'Use your PreClear account to access reviewed municipal requirements. Your question will come with you.'],
    empty: ['No reviewed jurisdictions are available yet', 'Please confirm requirements directly with your municipality while reviewed sources are being added.'],
    ready: ['Connected to permit research', 'Choose your jurisdiction so Aura can look up the rules that apply to your project.'],
    error: ['We couldn’t connect to permit research', 'Check your connection and try again. Your question stays here.'],
  }[readiness];
  const hint = readiness !== 'ready' ? (readiness === 'limited' ? 'You can draft a question here. Contact Daniel for live access.' : readiness === 'signin' ? 'Sign in to send your question.' : readiness === 'checking' ? 'Checking your connection before sending.' : 'Sending is paused until permit research is connected.') : !jurisdiction ? 'Select a jurisdiction before sending.' : 'Describe the work, dimensions, and anything you plan to change.';

  return <section className="permit-assistant" aria-labelledby="aura-heading">
    <header className="permit-assistant__header">
      {onClose ? <button className="permit-assistant__text-button" onClick={onClose} type="button">← Back</button> : <Link className="permit-assistant__brand" to={paths.home}>PreClear<span> / Permit research</span></Link>}
      {signedIn ? <span className="permit-assistant__session">Signed in</span> : <Link className="permit-assistant__sign-in" to={signInPath}>Sign in <span aria-hidden="true">↗</span></Link>}
    </header>
    <div className="permit-assistant__body">
      <div className="permit-assistant__intro"><span className="permit-assistant__eyebrow">YOUR PROJECT. YOUR LOCAL RULES.</span><h1 id="aura-heading">Let’s make permits clearer.</h1><p>Meet Aura, your permit research assistant. Describe what you’re planning, then explore reviewed requirements with links to the municipal sources.</p></div>
      <div className={`permit-assistant__status permit-assistant__status--${readiness}`} role="status">
        <span className="permit-assistant__status-dot" aria-hidden="true"/>
        <div className="permit-assistant__status-copy">
          {readiness === 'limited' && <span className="permit-assistant__access-label">PERSONAL PROJECT · LIMITED ACCESS</span>}
          <strong>{status[0]}</strong><p>{status[1]}</p>
          {readiness === 'limited' && <p className="permit-assistant__capacity">Live answers depend on available municipal data and service capacity.</p>}
        </div>
        <div className="permit-assistant__status-actions">
          {readiness === 'limited' && <a className="permit-assistant__access" href={accessEmail}>Contact for access <span aria-hidden="true">↗</span></a>}
          {readiness === 'signin' ? <Link className="permit-assistant__secondary" to={signInPath}>Sign in</Link> : readiness !== 'ready' && <button className="permit-assistant__secondary" type="button" disabled={readiness === 'checking'} onClick={() => setCheckVersion(v => v + 1)}>{readiness === 'checking' ? 'Checking…' : 'Check again'}</button>}
        </div>
      </div>
      <div className="permit-assistant__location"><div><label htmlFor="permit-jurisdiction">Where is your project?</label><p>Requirements vary by municipality.</p></div><select id="permit-jurisdiction" value={jurisdiction} disabled={sending || readiness !== 'ready'} onChange={e => { setJurisdiction(e.target.value); setMessages([]); setError(''); }}><option value="">Select a jurisdiction</option>{jurisdictions.map(j => <option key={j.id} value={j.id}>{j.name}</option>)}</select></div>
      <div className="permit-assistant__conversation" role="log" aria-live="polite" aria-label="Permit conversation">
        {!messages.length && <div className="permit-assistant__welcome"><span className="permit-assistant__avatar" aria-hidden="true">A</span><div><h2>What are you planning?</h2><p>{readiness === 'limited' ? 'Explore a starting question or write your own. Live research becomes available when access and municipal sources are enabled.' : 'Start with your project in everyday words. I’ll help identify what needs checking and where the information comes from.'}</p><div className="permit-assistant__starters">{starters.map(question => <button type="button" disabled={sending} key={question} onClick={() => { setDraft(question); document.getElementById('permit-question')?.focus(); }}>{question}<span aria-hidden="true">↗</span></button>)}</div></div></div>}
        {messages.map((message, i) => <article key={i} className={`permit-assistant__message permit-assistant__message--${message.role}`}><strong>{message.role === 'user' ? 'You' : 'Aura'}</strong><p>{message.content}</p>{message.lookups?.map((lookup, k) => <div className="permit-assistant__sources" key={k}><span className="permit-assistant__eyebrow">{lookup.status.replace(/_/g, ' ')}</span>{lookup.missing_attributes.length > 0 && <p>Details needed: {lookup.missing_attributes.join(', ')}</p>}{lookup.rules.map(rule => <div className="permit-assistant__source" key={rule.id}><p>{rule.requirement}</p>{/^(https?):\/\//i.test(rule.source_url) && <a href={rule.source_url} target="_blank" rel="noreferrer">{rule.code_citation || 'Read municipal source'} ↗</a>}</div>)}</div>)}</article>)}
        {sending && <><article className="permit-assistant__message permit-assistant__message--user"><strong>You</strong><p>{pendingQuestion}</p></article><p className="permit-assistant__loading">Aura is looking up reviewed requirements…</p></>}<div ref={conversationEnd}/>
      </div>
      {error && <p className="permit-assistant__error" role="alert">{error}</p>}
      <form className="permit-assistant__composer" onSubmit={e => { e.preventDefault(); void send(); }}><label htmlFor="permit-question">Tell Aura about your project</label><textarea id="permit-question" value={draft} disabled={sending} maxLength={4000} rows={3} aria-describedby="permit-hint" placeholder="For example, I’m replacing three windows without changing the openings…" onChange={e => setDraft(e.target.value)}/><div className="permit-assistant__composer-bottom"><p id="permit-hint">{hint}{readiness === 'limited' && <> <a href={accessEmail}>Request access ↗</a></>}</p>{sending ? <button className="permit-assistant__submit" type="button" onClick={() => active.current?.abort()}>Stop lookup</button> : <button className="permit-assistant__submit" type="submit" disabled={readiness !== 'ready' || !jurisdiction || !draft.trim()}>Ask Aura <span aria-hidden="true">↑</span></button>}</div></form>
      <p className="permit-assistant__disclaimer">Research support, not permit approval. Confirm missing or conflicting requirements with your jurisdiction.</p>
    </div>
  </section>;
}
