import type { TransitionAnimation, TransitionDirectionalAnimations } from 'astro';

/**
 * Global motion tokens for page transitions.
 *
 * The animation matches the shared motion language of the app:
 * - Duration: 400ms (within the 350-450ms window)
 * - Easing: cubic-bezier(0.22, 1, 0.36, 1)
 * - Fill mode: both (keeps the first keyframe applied before the animation starts)
 *
 * Only `opacity` and `transform` are animated (GPU-friendly), never layout
 * properties.
 */
export const PAGE_TRANSITION_DURATION = 400;
export const PAGE_TRANSITION_EASING = 'cubic-bezier(0.22, 1, 0.36, 1)';

const enter: TransitionAnimation = {
  name: 'pageEnter',
  duration: PAGE_TRANSITION_DURATION,
  easing: PAGE_TRANSITION_EASING,
  fillMode: 'both',
};

const exit: TransitionAnimation = {
  name: 'pageExit',
  duration: PAGE_TRANSITION_DURATION,
  easing: PAGE_TRANSITION_EASING,
  fillMode: 'both',
};

/**
 * Astro view transition animation for a single page.
 *
 * `forwards` plays when navigating forward (outgoing exits with `pageExit`,
 * incoming enters with `pageEnter`); `backwards` plays symmetrically for
 * browser back/forward navigations.
 */
export const pageTransition: TransitionDirectionalAnimations = {
  forwards: {
    old: exit,
    new: enter,
  },
  backwards: {
    old: exit,
    new: enter,
  },
};
