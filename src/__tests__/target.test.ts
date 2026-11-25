import {
  computeDelta,
  deltaStatus,
  expectedValue,
  formatAge,
  formatPercent,
  isStale,
  minutesAgo,
  progressPercent,
} from '../target';

describe('expectedValue', () => {
  it('fixed mode returns the target', () => {
    expect(expectedValue(100, 'fixed', 0, 1000, 500)).toBe(100);
  });
  it('prorated mode spreads the target over the range', () => {
    expect(expectedValue(100, 'prorated', 0, 1000, 250)).toBe(25);
    expect(expectedValue(100, 'prorated', 0, 1000, 1000)).toBe(100);
  });
  it('prorated mode clamps outside the range and handles an empty range', () => {
    expect(expectedValue(100, 'prorated', 0, 1000, -50)).toBe(0);
    expect(expectedValue(100, 'prorated', 0, 1000, 5000)).toBe(100);
    expect(expectedValue(100, 'prorated', 10, 10, 10)).toBe(100);
  });
});

describe('computeDelta', () => {
  it('returns amount and percent', () => {
    expect(computeDelta(120, 100)).toEqual({ amount: 20, percent: 20 });
    expect(computeDelta(80, 100)).toEqual({ amount: -20, percent: -20 });
  });
  it('has no percent when expected is 0', () => {
    expect(computeDelta(5, 0)).toEqual({ amount: 5, percent: undefined });
  });
});

describe('deltaStatus', () => {
  it('higher is better by default', () => {
    expect(deltaStatus(10, false)).toBe('good');
    expect(deltaStatus(-10, false)).toBe('bad');
  });
  it('flips when lower is better', () => {
    expect(deltaStatus(10, true)).toBe('bad');
    expect(deltaStatus(-10, true)).toBe('good');
  });
  it('exactly on target is good', () => {
    expect(deltaStatus(0, false)).toBe('good');
    expect(deltaStatus(0, true)).toBe('good');
  });
});

describe('progressPercent', () => {
  it('is clamped to 0..100', () => {
    expect(progressPercent(50, 200)).toBe(25);
    expect(progressPercent(500, 200)).toBe(100);
    expect(progressPercent(-5, 200)).toBe(0);
  });
  it('is 0 without a positive target', () => {
    expect(progressPercent(5, 0)).toBe(0);
  });
});

describe('formatPercent', () => {
  it('adds a sign and one decimal', () => {
    expect(formatPercent(12.345)).toBe('+12.3%');
    expect(formatPercent(-5)).toBe('-5.0%');
    expect(formatPercent(0)).toBe('0.0%');
  });
  it('is empty for undefined / non-finite', () => {
    expect(formatPercent(undefined)).toBe('');
    expect(formatPercent(Infinity)).toBe('');
  });
});

describe('isStale / minutesAgo', () => {
  const now = 10 * 60_000;
  it('is stale only past the threshold', () => {
    expect(isStale(0, now, 5)).toBe(true); // 10 min old, threshold 5
    expect(isStale(now - 2 * 60_000, now, 5)).toBe(false);
  });
  it('is not stale without a timestamp', () => {
    expect(isStale(undefined, now, 5)).toBe(false);
    expect(isStale(NaN, now, 5)).toBe(false);
  });
  it('minutesAgo rounds and never goes negative', () => {
    expect(minutesAgo(now - 7 * 60_000, now)).toBe(7);
    expect(minutesAgo(now + 5000, now)).toBe(0);
  });
});

describe('formatAge', () => {
  const now = 1_000_000_000_000;
  it('uses minutes, hours then days', () => {
    expect(formatAge(now - 7 * 60_000, now)).toBe('7 min');
    expect(formatAge(now - 3 * 3_600_000, now)).toBe('3 h');
    expect(formatAge(now - 47 * 3_600_000, now)).toBe('47 h');
    expect(formatAge(now - 5 * 86_400_000, now)).toBe('5 days');
  });
});
