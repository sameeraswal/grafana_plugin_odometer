import { getAnimation, getDuration, getFormat } from '../utils';

describe('getFormat', () => {
  it.each([
    [0, false, 'd'],
    [undefined, false, 'd'],
    [-3, false, 'd'],
    [2, false, '(d).dd'],
    [2.9, false, '(d).dd'],
    [99, false, '(d).dddddddddd'],
    [0, true, '(,ddd)'],
    [2, true, '(,ddd).dd'],
  ])('decimals %p, thousands %p -> %p', (decimals, thousands, expected) => {
    expect(getFormat(decimals as any, thousands)).toBe(expected);
  });
});

describe('getAnimation', () => {
  it('maps count to count', () => expect(getAnimation('count')).toBe('count'));
  it('maps odometer, undefined and legacy "undefined" to undefined', () => {
    expect(getAnimation('odometer')).toBeUndefined();
    expect(getAnimation(undefined)).toBeUndefined();
    expect(getAnimation('undefined')).toBeUndefined();
  });
});

describe('getDuration', () => {
  it('passes through valid values', () => {
    expect(getDuration(1200)).toBe(1200);
    expect(getDuration(0)).toBe(0);
  });
  it('falls back to default for invalid values', () => {
    expect(getDuration(undefined)).toBe(5000);
    expect(getDuration(-1)).toBe(5000);
    expect(getDuration(NaN)).toBe(5000);
  });
});
