import { DataFrame, FieldType } from '@grafana/data';
import { getAnimation, getDuration, getFormat, getLatestValue } from '../utils';

const frame = (fields: Array<{ type: FieldType; values: any[] }>): DataFrame =>
  ({
    length: 0,
    fields: fields.map((f, i) => ({ name: `f${i}`, type: f.type, config: {}, values: f.values })),
  } as unknown as DataFrame);

describe('getLatestValue', () => {
  it('returns the last value of the first numeric field', () => {
    const s = frame([
      { type: FieldType.time, values: [1, 2, 3] },
      { type: FieldType.number, values: [10, 20, 30] },
    ]);
    expect(getLatestValue([s])).toBe(30);
  });

  it('returns 0 for undefined, empty, or non-numeric series', () => {
    expect(getLatestValue(undefined)).toBe(0);
    expect(getLatestValue([])).toBe(0);
    expect(getLatestValue([frame([{ type: FieldType.string, values: ['a'] }])])).toBe(0);
  });

  it('skips trailing null / NaN values', () => {
    const s = frame([{ type: FieldType.number, values: [5, 7, null, NaN] }]);
    expect(getLatestValue([s])).toBe(7);
  });

  it('uses the first series that has a numeric field', () => {
    const a = frame([{ type: FieldType.string, values: ['x'] }]);
    const b = frame([{ type: FieldType.number, values: [42] }]);
    const c = frame([{ type: FieldType.number, values: [99] }]);
    expect(getLatestValue([a, b, c])).toBe(42);
  });

  it('keeps zero as a valid value', () => {
    expect(getLatestValue([frame([{ type: FieldType.number, values: [3, 0] }])])).toBe(0);
  });
});

describe('getFormat', () => {
  it.each([
    [0, 'd'],
    [undefined, 'd'],
    [-3, 'd'],
    [2, '(d).dd'],
    [2.9, '(d).dd'],
    [99, '(d).dddddddddd'],
  ])('decimals %p -> %p', (input, expected) => {
    expect(getFormat(input as any)).toBe(expected);
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
