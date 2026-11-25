import { TargetMode } from './types';

export type DeltaStatus = 'good' | 'bad' | 'neutral';

const clamp = (n: number, min: number, max: number) => Math.min(Math.max(n, min), max);

/**
 * The value we expect to have reached by `now`.
 * - fixed: the target itself.
 * - prorated: the target spread evenly over the time range, so a monthly target
 *   mid-month is compared with "where we should be today".
 */
export function expectedValue(target: number, mode: TargetMode, from: number, to: number, now: number): number {
  if (mode !== 'prorated') {
    return target;
  }
  const span = to - from;
  if (!(span > 0)) {
    return target;
  }
  return target * clamp((now - from) / span, 0, 1);
}

export interface Delta {
  /** value - expected */
  amount: number;
  /** amount relative to expected, in percent; undefined when expected is 0 */
  percent?: number;
}

export function computeDelta(value: number, expected: number): Delta {
  const amount = value - expected;
  return { amount, percent: expected === 0 ? undefined : (amount / Math.abs(expected)) * 100 };
}

export function deltaStatus(amount: number, lowerIsBetter: boolean): DeltaStatus {
  if (amount === 0) {
    return 'good';
  }
  const ahead = amount > 0;
  return ahead !== lowerIsBetter ? 'good' : 'bad';
}

/** Progress towards the target as 0..100 (clamped). */
export function progressPercent(value: number, expected: number): number {
  if (!(expected > 0)) {
    return 0;
  }
  return clamp((value / expected) * 100, 0, 100);
}

export function formatPercent(percent: number | undefined): string {
  if (percent === undefined || !Number.isFinite(percent)) {
    return '';
  }
  const sign = percent > 0 ? '+' : percent < 0 ? '-' : '';
  return `${sign}${Math.abs(percent).toFixed(1)}%`;
}

export function isStale(lastTimestamp: number | undefined, now: number, staleMinutes: number): boolean {
  if (lastTimestamp === undefined || !Number.isFinite(lastTimestamp)) {
    return false;
  }
  return now - lastTimestamp > Math.max(staleMinutes, 0) * 60_000;
}

export function minutesAgo(timestamp: number, now: number): number {
  return Math.max(0, Math.round((now - timestamp) / 60_000));
}

/** "7 min", "3 h" or "12 days" - keeps the stale warning readable for very old data. */
export function formatAge(timestamp: number, now: number): string {
  const min = minutesAgo(timestamp, now);
  if (min < 60) {
    return `${min} min`;
  }
  const hours = Math.round(min / 60);
  if (hours < 48) {
    return `${hours} h`;
  }
  return `${Math.round(hours / 24)} days`;
}
