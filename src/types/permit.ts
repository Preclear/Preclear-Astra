// ---------------------------------------------------------------------------
// Permit types — shared throughout the permit wizard feature
// ---------------------------------------------------------------------------

export type ProjectType = 'deck' | 'fence' | 'roof' | 'windows' | 'plumbing' | 'other';

// ─── Per-project parameter shapes ────────────────────────────────────────────

export interface DeckParams {
  attached: 'yes' | 'no';
  height: 'under-30in' | '30in-6ft' | 'over-6ft';
  size: 'under-200' | '200-400' | 'over-400';
  covered: 'yes' | 'no';
  story_below: 'yes' | 'no';
}

export interface FenceParams {
  location: 'front' | 'back' | 'side';
  height: 'under-4ft' | '4-6ft' | 'over-6ft';
  corner_lot: 'yes' | 'no';
  pool: 'yes' | 'no';
}

export interface RoofParams {
  scope: 'full' | 'partial';
  to_deck: 'yes' | 'no';
  structural: 'yes' | 'no';
  skylights: 'yes' | 'no';
}

export interface WindowParams {
  opening_size: 'same' | 'resizing';
  count: '1-2' | '3-5' | '6+';
  egress: 'yes' | 'no' | 'not-sure';
  structural: 'yes' | 'no';
}

export interface PlumbingParams {
  work_type: 'new' | 'replacing' | 'relocating';
  water_heater: 'yes' | 'no';
  underground: 'yes' | 'no';
  renovation: 'yes' | 'no';
}

// ─── Discriminated-union request body ────────────────────────────────────────

export type PermitAdviceRequest =
  | { project_type: 'deck';     jurisdiction_slug: string; parameters: DeckParams }
  | { project_type: 'fence';    jurisdiction_slug: string; parameters: FenceParams }
  | { project_type: 'roof';     jurisdiction_slug: string; parameters: RoofParams }
  | { project_type: 'windows';  jurisdiction_slug: string; parameters: WindowParams }
  | { project_type: 'plumbing'; jurisdiction_slug: string; parameters: PlumbingParams };

export interface FreeTextRequest {
  question: string;
  jurisdiction_slug: string;
}

// ─── Response shapes ─────────────────────────────────────────────────────────

export interface Citation {
  section: string;
  url: string;
  excerpt: string;
}

export interface PermitAdviceResponse {
  project_type: string;
  question_built: string;
  jurisdiction: string;
  rag_answer: string;
  citations: Citation[];
  chunks_retrieved: number;
  latency_ms: number;
}

export interface FreeTextResponse {
  answer: string;
  citations: Citation[];
  chunks_retrieved: number;
  latency_ms: number;
  /** Normalised so the Results step can always use `question_built` */
  question_built?: string;
}

// ─── Modal multi-step state ───────────────────────────────────────────────────

export type ModalState =
  | { step: 'pick' }
  | { step: 'questions'; projectType: ProjectType }
  | { step: 'loading';   projectType: ProjectType }
  | { step: 'results';   projectType: ProjectType; response: PermitAdviceResponse | FreeTextResponse }
  | { step: 'error';     message: string; retry: () => void };
