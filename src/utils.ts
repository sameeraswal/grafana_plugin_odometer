import { DataFrame } from '@grafana/data';
import { AnimationType, DEFAULT_OPTIONS } from './types';

/**
 * Returns the last finite value of the first numeric field found in the series,
 * or 0 when there is no usable data.
 */
export function getLatestValue(series: DataFrame[] | undefined): number {
  for (const frame of series ?? []) {
    const field = frame.fields.find((f) => f.type === 'number');
    if (!field) {
      continue;
    }
    for (let i = field.values.length - 1; i >= 0; i--) {
      const value = field.values[i];
      if (typeof value === 'number' && Number.isFinite(value)) {
        return value;
      }
    }
  }
  return 0;
}

/** Builds the odometer.js format string, e.g. decimals=2 -> "(d).dd" (odometer.js needs the parentheses to find the radix). */
export function getFormat(decimals: number | undefined): string {
  const n = Math.min(Math.max(Math.trunc(Number(decimals)) || 0, 0), 10);
  return n === 0 ? 'd' : `(d).${'d'.repeat(n)}`;
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
