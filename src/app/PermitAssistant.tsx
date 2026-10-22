import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { paths } from '../routes';
import './questionnaire/configureAuraChat.css';

type Rule = { id: string; requirement: string; source_url: string; code_citation: string };
type Lookup = { status: string; missing_attributes: string[]; rules: Rule[] };
type Message = { role: 'user' | 'assistant'; content: string; lookups?: Lookup[] };

async function request(path: string, signal: AbortSignal, body?: object) {
  const session = supabase ? (await supabase.auth.getSession()).data.session : null;
  if (!session) throw new Error('Please sign in to use permit lookup.');
  const response = await fetch(`/api/${path}`, {
    method: body ? 'POST' : 'GET', signal,
    headers: { Authorization: `Bearer ${session.access_token}`, 'Content-Type': 'application/json' },
    ...(body ? { body: JSON.stringify(body) } : {}),
  });
  const data = await response.json();
  if (!response.ok) throw new Error(typeof data.detail === 'string' ? data.detail : 'Permit lookup is unavailable.');
  return data;
}

export default function PermitAssistant({ onClose, scopeLabel }: { onClose?: () => void; scopeLabel?: string }) {
  const [jurisdictions, setJurisdictions] = useState<{id: string; name: string}[]>([]);
  const [jurisdiction, setJurisdiction] = useState('');
  const [draft, setDraft] = useState(() => new URLSearchParams(window.location.search).get('question') || (scopeLabel ? `What permits may be required for ${scopeLabel.toLowerCase()}?` : ''));
  const [messages, setMessages] = useState<Message[]>([]);
  const [error, setError] = useState('');
  const [sending, setSending] = useState(false);
  const active = useRef<AbortController | null>(null);
  useEffect(() => {
    const controller = new AbortController();
    request('jurisdictions', controller.signal).then(data => {
      setJurisdictions(data);
      if (!data.length) setError('No reviewed jurisdictions are available yet. Confirm requirements with your municipality.');
    }).catch(e => { if (!controller.signal.aborted) setError(e.message); });
    return () => { controller.abort(); active.current?.abort(); };
  }, []);

  async function send() {
    if (!draft.trim() || !jurisdiction || sending) return;
    const question = draft.trim();
    const controller = new AbortController(); active.current = controller;
    const timer = window.setTimeout(() => controller.abort(), 115000);
    setError(''); setSending(true); setDraft('');
    setMessages(prev => [...prev, { role: 'user', content: question }]);
    try {
      const result = await request('chat', controller.signal, { jurisdiction_id: jurisdiction, question,
        history: messages.slice(-12).map(({role, content}) => ({role, content})) });
      if (!controller.signal.aborted) setMessages(prev => [...prev, {role: 'assistant', content: result.answer, lookups: result.lookups}]);
    } catch (e) {
      setError(controller.signal.aborted ? 'Lookup stopped. You can try again.' : (e instanceof Error ? e.message : 'Lookup failed.'));
      setDraft(question);
    } finally { window.clearTimeout(timer); setSending(false); active.current = null; }
  }

  return <section className="configure-aura" style={{maxWidth: 960, margin: '0 auto', padding: 24}}>
    <header className="configure-aura__top">
      {onClose ? <button onClick={onClose} type="button">Back</button> : <Link to={paths.home}>PreClear</Link>}
      <h1>Homeowner Permit Compliance Checker</h1>
      <Link to={paths.signIn}>Sign in</Link>
    </header>
    <p>Ask Aura about your project. Answers use reviewed municipal rules and link to their sources. Missing or conflicting rules require verification with your jurisdiction.</p>
    <label>Jurisdiction <select value={jurisdiction} disabled={sending} onChange={e => {setJurisdiction(e.target.value); setMessages([]); setError('');}}>
      <option value="">Select a jurisdiction</option>
      {jurisdictions.map(j => <option key={j.id} value={j.id}>{j.name}</option>)}
    </select></label>
    {error && <p role="alert">{error}</p>}
    <div role="log" aria-live="polite" aria-label="Permit conversation" style={{minHeight: 200, padding: '24px 0'}}>
      {messages.map((message, i) => <article key={i} style={{marginBottom: 24}}>
        <strong>{message.role === 'user' ? 'You' : 'Aura'}</strong>
        <p style={{whiteSpace: 'pre-wrap'}}>{message.content}</p>
        {message.lookups?.map((lookup, k) => <div key={k}>
          <p>{lookup.status.replace(/_/g, ' ')}</p>
          {lookup.missing_attributes.length > 0 && <p>Details needed: {lookup.missing_attributes.join(', ')}</p>}
          <ul>{lookup.rules.map(rule => <li key={rule.id}>{rule.requirement}{' '}
            {/^(https?):\/\//i.test(rule.source_url) && <a href={rule.source_url} target="_blank" rel="noreferrer">{rule.code_citation || 'Municipal source'}</a>}
          </li>)}</ul>
        </div>)}
      </article>)}
      {sending && <p>Looking up reviewed requirements…</p>}
    </div>
    <form onSubmit={e => {e.preventDefault(); void send();}}>
      <label htmlFor="permit-question">Your project question</label>
      <textarea id="permit-question" value={draft} maxLength={4000} rows={3} style={{display:'block', width:'100%', margin:'12px 0'}} onChange={e => setDraft(e.target.value)} />
      <button type="submit" disabled={sending || !jurisdiction || !draft.trim()}>Ask Aura</button>{' '}
      {sending && <button type="button" onClick={() => active.current?.abort()}>Stop</button>}
    </form>
    <p>Research support only. PreClear does not issue permits or guarantee approval.</p>
  </section>;
}
