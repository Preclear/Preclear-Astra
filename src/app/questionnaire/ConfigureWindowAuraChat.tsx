import { useEffect, useRef, useState } from 'react';
import './configureAuraChat.css';

type Props = {
  onClose: () => void;
  scopeLabel?: string;
};

type ChatMessage = {
  id: number;
  role: 'user' | 'ai';
  text: string;
  showCards?: boolean;
};

function buildPreviewResponse(scopeLabel: string) {
  const scope = scopeLabel.toLowerCase();
  return `Here's a concise pre-check outline for ${scope}: verify zoning overlays, confirm code and product compliance for the planned work, and align inspections with your jurisdiction's review path. I can tailor this to your exact address next.`;
}

/* ── Icon primitives ──────────────────────────────────────────────────── */

function IconChevron() {
  return (
    <svg width="10" height="17" viewBox="0 0 10 17" fill="none" aria-hidden>
      <path d="M8.5 1.5 1.5 8.5l7 7" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function IconArrowUp() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path d="M12 19V5M5 12l7-7 7 7" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function IconCopy() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" aria-hidden>
      <rect x="9" y="9" width="13" height="13" rx="2" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" />
      <path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" />
    </svg>
  );
}

function IconThumbUp() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path d="M14 9V5a3 3 0 00-3-3l-4 9v11h11.28a2 2 0 002-1.7l1.38-9a2 2 0 00-2-2.3H14zM7 22H4a2 2 0 01-2-2v-7a2 2 0 012-2h3" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function IconThumbDown() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path d="M10 15v4a3 3 0 003 3l4-9V2H5.72a2 2 0 00-2 1.7l-1.38 9a2 2 0 002 2.3H10zM17 2h2.67A2.31 2.31 0 0122 4v7a2.31 2.31 0 01-2.33 2H17" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function IconStop() {
  return (
    <svg width="12" height="12" viewBox="0 0 12 12" fill="none" aria-hidden>
      <rect x="2" y="2" width="8" height="8" rx="1.5" fill="currentColor" />
    </svg>
  );
}

function IconPaperclip() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        d="M21.44 11.05l-9.19 9.19a6 6 0 01-8.49-8.49l9.19-9.19a4 4 0 015.66 5.66l-9.2 9.19a2 2 0 01-2.83-2.83l8.49-8.48"
        stroke="currentColor"
        strokeWidth="1.75"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function IconMic() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        d="M12 15a3 3 0 0 0 3-3V7a3 3 0 1 0-6 0v5a3 3 0 0 0 3 3ZM19 11a7 7 0 0 1-14 0M12 18v4M8 22h8"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function IconSpark() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
    </svg>
  );
}

function IconMapPin() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        d="M12 22s7-5.7 7-12a7 7 0 1 0-14 0c0 6.3 7 12 7 12Z"
        stroke="currentColor"
        strokeWidth="1.75"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <circle cx="12" cy="10" r="2.4" stroke="currentColor" strokeWidth="1.75" />
    </svg>
  );
}

function IconChecklist() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path d="M9 6h11M9 12h11M9 18h11" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" />
      <path d="m3.5 6 1.2 1.2 2.1-2.1M3.5 12l1.2 1.2 2.1-2.1M3.5 18l1.2 1.2 2.1-2.1" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function IconBook() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        d="M4 5.5A2.5 2.5 0 0 1 6.5 3H20v16H6.5A2.5 2.5 0 0 0 4 21.5v-16Z"
        stroke="currentColor"
        strokeWidth="1.75"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path d="M8 7h7M8 11h9M8 15h6" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" />
    </svg>
  );
}

/* ── Component ─────────────────────────────────────────────────────────── */

export default function ConfigureWindowAuraChat({ onClose, scopeLabel = 'Window replacement' }: Props) {
  const scope = scopeLabel.toLowerCase();
  const aiPreviewResponse = buildPreviewResponse(scopeLabel);
  const [draft, setDraft] = useState('');
  const [sending, setSending] = useState(false);
  const [aiLiked, setAiLiked] = useState<boolean | null>(null);
  const [aiCopied, setAiCopied] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 1,
      role: 'user',
      text: `I'm planning a ${scope} project in a single-family home. Can you tell me the likely permit path before I submit?`,
      showCards: true,
    },
    {
      id: 2,
      role: 'ai',
      text: `Great question. For many jurisdictions, a ${scope} project is reviewed as an alteration permit (not new construction). The exact path usually depends on structural changes, mechanical/electrical/plumbing impact, and local code triggers.`,
    },
    {
      id: 3,
      role: 'user',
      text: "No structural changes. Same rough openings. I am switching to dual-pane low-E units. Do I still need plan review or just over-the-counter approval?",
    },
    {
      id: 4,
      role: 'ai',
      text: `If the work stays within existing conditions, many cities allow a simplified residential alteration review. You may still need to document product specs, safety notes, and code callouts required for ${scope}.`,
    },
    {
      id: 5,
      role: 'user',
      text: "Can you give me a practical checklist so I do not get correction notices?",
    },
    {
      id: 6,
      role: 'ai',
      text: `Absolutely. Pre-submit checklist: (1) clear scope note for ${scope}, (2) product/spec sheets where applicable, (3) plan notes for any code triggers, (4) contractor/license info or owner-builder declaration, and (5) existing-condition photos. With this package, first-pass approval odds are usually much higher.`,
    },
  ]);
  const nextMessageIdRef = useRef(7);
  const aiReplyTimeoutRef = useRef<number | null>(null);
  const threadRef = useRef<HTMLDivElement | null>(null);

  const canSend = draft.trim().length > 0 && !sending;
  const lastAiIndex = messages.map((message) => message.role).lastIndexOf('ai');
  const lastAiMessage = [...messages].reverse().find((message) => message.role === 'ai') ?? null;

  function handleKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      if (canSend) handleSend();
    }
  }

  function handleSend() {
    if (!canSend) return;
    const userText = draft.trim();
    const userId = nextMessageIdRef.current;
    nextMessageIdRef.current += 1;
    const aiId = nextMessageIdRef.current;
    nextMessageIdRef.current += 1;

    setMessages((prev) => [
      ...prev,
      {
        id: userId,
        role: 'user',
        text: userText,
      },
    ]);
    setSending(true);
    setDraft('');
    setAiLiked(null);
    setAiCopied(false);

    aiReplyTimeoutRef.current = window.setTimeout(() => {
      setMessages((prev) => [
        ...prev,
        {
          id: aiId,
          role: 'ai',
          text: aiPreviewResponse,
        },
      ]);
      setSending(false);
      aiReplyTimeoutRef.current = null;
    }, 1800);
  }

  function handleStopThinking() {
    if (aiReplyTimeoutRef.current !== null) {
      window.clearTimeout(aiReplyTimeoutRef.current);
      aiReplyTimeoutRef.current = null;
    }
    setSending(false);
  }

  function handleCopyAiResponse() {
    if (!lastAiMessage) return;
    void navigator.clipboard.writeText(lastAiMessage.text);
    setAiCopied(true);
    setTimeout(() => setAiCopied(false), 1800);
  }

  useEffect(
    () => () => {
      if (aiReplyTimeoutRef.current !== null) {
        window.clearTimeout(aiReplyTimeoutRef.current);
      }
    },
    [],
  );

  useEffect(() => {
    const threadEl = threadRef.current;
    if (!threadEl) return;
    threadEl.scrollTo({
      top: threadEl.scrollHeight,
      behavior: 'smooth',
    });
  }, [messages.length, sending]);

  return (
    <div className="configure-aura">

      {/* ── Premium nav header ───────────────────────────────── */}
      <header className="configure-aura__top">
        <button type="button" className="configure-aura__back" onClick={onClose} aria-label="Back">
          <IconChevron />
          <span>Configure</span>
        </button>

        <div className="configure-aura__brand">
          <span className="configure-aura__brand-name">Aura</span>
          <span className="configure-aura__brand-status" aria-hidden>
            <span className="configure-aura__brand-status-dot" />
            <span className="configure-aura__brand-status-label">active now</span>
          </span>
        </div>

        <div aria-hidden className="configure-aura__top-end" />
      </header>

      <div className="configure-aura__main">
        <aside className="configure-aura__toolbar" aria-label="Quick actions">
          <button type="button" className="configure-aura__toolbar-btn" aria-label="Assistant mode">
            <IconSpark />
          </button>
          <div className="configure-aura__toolbar-pill" role="group" aria-label="Assistant tools">
            <button type="button" className="configure-aura__toolbar-btn" aria-label="Jurisdiction lookup">
              <IconMapPin />
            </button>
            <button type="button" className="configure-aura__toolbar-btn" aria-label="Permit checklist">
              <IconChecklist />
            </button>
            <button type="button" className="configure-aura__toolbar-btn" aria-label="Code reference">
              <IconBook />
            </button>
          </div>
        </aside>

        <div className="configure-aura__main-divider" aria-hidden />

        <div className="configure-aura__chat-column">
      {/* ── Message thread ───────────────────────────────────── */}
      <div ref={threadRef} className="configure-aura__thread" role="log" aria-label="Chat" aria-live="polite">
        {messages.map((message, index) => {
          const isUser = message.role === 'user';
          const isLastAiMessage = !isUser && index === lastAiIndex;

          return (
            <div
              key={message.id}
              className={`configure-aura__group ${
                isUser ? 'configure-aura__group--user' : 'configure-aura__group--ai'
              } ${isLastAiMessage ? 'configure-aura__group--last' : ''}`}
            >
              <div
                className={`configure-aura__msg-row ${
                  isUser ? 'configure-aura__msg-row--user' : 'configure-aura__msg-row--ai'
                }`}
              >
                {!isUser ? (
                  <div className="configure-aura__avatar configure-aura__avatar--ai" aria-hidden>
                    <span>A</span>
                  </div>
                ) : null}
                <div
                  className={`configure-aura__bubble ${
                    isUser ? 'configure-aura__bubble--user' : 'configure-aura__bubble--ai'
                  }`}
                >
                  {message.text}
                </div>
                {isUser ? (
                  <div className="configure-aura__avatar configure-aura__avatar--user" aria-hidden>
                    <span>Y</span>
                  </div>
                ) : null}
              </div>

              {isUser && message.showCards ? (
                <div className="configure-aura__cards" aria-hidden>
                  <img className="configure-aura__card-img" src="/images/onborading/chatSampleWindow.jpeg" alt="" decoding="async" />
                  <img className="configure-aura__card-img" src="/images/onborading/chatSampleWindow1.jpeg" alt="" decoding="async" />
                  <img className="configure-aura__card-img" src="/images/onborading/chatSampleWindow2.jpeg" alt="" decoding="async" />
                </div>
              ) : null}

              {!isUser && isLastAiMessage ? (
                <div className="configure-aura__actions configure-aura__actions--ai">
                  <button
                    className={aiCopied ? 'configure-aura__action-btn configure-aura__action-btn--active-copy' : 'configure-aura__action-btn'}
                    type="button"
                    aria-label="Copy"
                    onClick={handleCopyAiResponse}
                  >
                    <IconCopy />
                  </button>
                  <button
                    className={aiLiked === true ? 'configure-aura__action-btn configure-aura__action-btn--active-like' : 'configure-aura__action-btn'}
                    type="button"
                    aria-label="Good response"
                    onClick={() => setAiLiked(true)}
                  >
                    <IconThumbUp />
                  </button>
                  <button
                    className={aiLiked === false ? 'configure-aura__action-btn configure-aura__action-btn--active-dislike' : 'configure-aura__action-btn'}
                    type="button"
                    aria-label="Poor response"
                    onClick={() => setAiLiked(false)}
                  >
                    <IconThumbDown />
                  </button>
                </div>
              ) : null}
            </div>
          );
        })}

        {/* — loading indicator — */}
        {sending && (
          <div className="configure-aura__group configure-aura__group--ai">
            <div className="configure-aura__dots" aria-label="Aura is thinking">
              <span /><span /><span />
            </div>
          </div>
        )}
      </div>

      {/* ── Prompt-input composer ────────────────────────────── */}
      <div className="configure-aura__composer-wrap">
        <button type="button" className="configure-aura__attach-link" aria-label="Attach files">
          <IconPaperclip />
        </button>
        <div className="configure-aura__composer">
          <div className="configure-aura__composer-bar">
            {draft.trim().length === 0 ? (
              <span className="configure-aura__shimmer-placeholder" aria-hidden>
                Ask anything about your project
              </span>
            ) : null}
            <textarea
              className="configure-aura__textarea"
              rows={1}
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder=""
              aria-label="Message Aura"
            />
          </div>
          <div className="configure-aura__composer-trailing">
            <button type="button" className="configure-aura__composer-btn" aria-label="Start dictation">
              <IconMic />
            </button>
            <button
              type="button"
              className="configure-aura__send"
              aria-label={sending ? 'Stop' : 'Send'}
              disabled={!sending && !draft.trim()}
              onClick={sending ? handleStopThinking : handleSend}
            >
              {sending ? <IconStop /> : <IconArrowUp />}
            </button>
          </div>
        </div>
      </div>
        </div>
      </div>

    </div>
  );
}
