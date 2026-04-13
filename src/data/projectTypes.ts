import type { ElementType } from 'react';
import type { ProjectType } from '../types/permit';
import {
  Hammer,
  Home,
  AppWindow,
  Wrench,
  Fence,
  MessageSquare,
} from 'lucide-react';

export interface ProjectTypeConfig {
  type: ProjectType;
  icon: ElementType;
  label: string;
  /** Short description shown in the project-picker card grid */
  description: string;
}

/** Single source of truth for chips, picker cards, and modal header. */
export const projectTypes: ProjectTypeConfig[] = [
  {
    type: 'deck',
    icon: Hammer,
    label: 'Deck / Porch',
    description: 'Attached or free-standing deck, patio slab, or porch addition.',
  },
  {
    type: 'roof',
    icon: Home,
    label: 'Roof',
    description: 'Full replacement or partial repair of an existing roof system.',
  },
  {
    type: 'windows',
    icon: AppWindow,
    label: 'Windows / Doors',
    description: 'New, replaced, or resized window and door openings.',
  },
  {
    type: 'plumbing',
    icon: Wrench,
    label: 'Plumbing',
    description: 'Fixture installs, water heater replacement, or pipe work.',
  },
  {
    type: 'fence',
    icon: Fence,
    label: 'Fence / Wall',
    description: 'Privacy fence, retaining wall, or boundary enclosure.',
  },
  {
    type: 'other',
    icon: MessageSquare,
    label: 'Other / Custom',
    description: 'Describe any project for free-text permit guidance.',
  },
];
