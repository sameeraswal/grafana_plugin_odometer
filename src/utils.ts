import { AnimationType, DEFAULT_OPTIONS } from './types';

/**
 * Builds the odometer.js format string, e.g. decimals=2 -> "(d).dd", with thousands separator "(,ddd).dd".
 * odometer.js needs the parentheses to find the radix.
 */
export function getFormat(decimals: number | undefined, thousandsSeparator = false): string {
  const n = Math.min(Math.max(Math.trunc(Number(decimals)) || 0, 0), 10);
  const whole = thousandsSeparator ? ',ddd' : 'd';
  return n === 0 ? (thousandsSeparator ? '(,ddd)' : 'd') : `(${whole}).${'d'.repeat(n)}`;
}

/**
 * Maps the stored option to the odometer.js `animation` prop. 'count' is the only
 * special value; everything else (including legacy saved values such as the
 * string 'undefined') means the default rolling odometer.
 */
export function getAnimation(type: AnimationType | string | undefined): 'count' | undefined {
  return type === 'count' ? 'count' : undefined;
}

/** Returns a positive duration in ms, falling back to the default. */
export function getDuration(duration: number | undefined): number {
  const d = Number(duration);
  return Number.isFinite(d) && d >= 0 ? d : DEFAULT_OPTIONS.duration;
}
