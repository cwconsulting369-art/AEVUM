/**
 * Premium animation primitives — CSS-driven, zero JS-runtime cost.
 * Pair with tailwind keyframes defined in tailwind.config.js.
 */

/** Stagger inline-style delay (returns React style object). 50ms default rhythm. */
export function stagger(index: number, stepMs = 60, baseMs = 40): React.CSSProperties {
  return { animationDelay: `${baseMs + index * stepMs}ms` };
}

/** Composable class strings for common motion patterns. */
export const motion = {
  fadeUp: 'animate-fade-up',
  fadeIn: 'animate-fade-in',
  scaleIn: 'animate-scale-in',
  slideUp: 'animate-slide-up'
} as const;

/** Combine classes safely. */
export function cls(...parts: Array<string | false | null | undefined>) {
  return parts.filter(Boolean).join(' ');
}
