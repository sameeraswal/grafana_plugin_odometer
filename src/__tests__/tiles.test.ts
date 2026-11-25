import { FieldType } from '@grafana/data';
import { buildTile, collectTiles, decimalsOf, parseDisplayNumber, reduceValues, sampleSparkline } from '../tiles';
import { makeField, makeFrame, thresholds } from '../testHelpers';

describe('parseDisplayNumber / decimalsOf', () => {
  it('parses formatted numbers', () => {
    expect(parseDisplayNumber('1,234.50')).toBe(1234.5);
    expect(parseDisplayNumber('-12')).toBe(-12);
    expect(parseDisplayNumber('12 345')).toBe(12345);
  });
  it('returns undefined for text', () => {
    expect(parseDisplayNumber('OK')).toBeUndefined();
    expect(parseDisplayNumber('')).toBeUndefined();
    expect(parseDisplayNumber('1.5 GB')).toBeUndefined();
  });
  it('counts decimals', () => {
    expect(decimalsOf('3.14')).toBe(2);
    expect(decimalsOf('1,234')).toBe(0);
    expect(decimalsOf('1,234.5')).toBe(1);
  });
});

describe('reduceValues', () => {
  const f = makeField({ values: [4, 2, null, 10, null] });
  it.each([
    ['lastNotNull', 10, 3],
    ['last', 0, 4], // last row is null -> 0
    ['first', 4, 0],
    ['mean', 5.333333333333333, 3],
    ['sum', 16, 3],
    ['min', 2, 3],
    ['max', 10, 3],
  ] as const)('%s', (reducer, value, row) => {
    const r = reduceValues(f.values, f, reducer);
    expect(r.value).toBeCloseTo(value);
    expect(r.row).toBe(row);
  });

  it('returns 0 for empty / non-numeric data', () => {
    const e = makeField({ values: [] });
    expect(reduceValues(e.values, e, 'lastNotNull').value).toBe(0);
    expect(reduceValues(e.values, e, 'mean').value).toBe(0);
    const n = makeField({ values: [null, null] });
    expect(reduceValues(n.values, n, 'first').value).toBe(0);
  });
});

describe('sampleSparkline', () => {
  it('drops non-numbers and keeps short series as is', () => {
    expect(sampleSparkline([1, null, 3, NaN, 5])).toEqual([1, 3, 5]);
  });
  it('downsamples long series keeping first and last', () => {
    const v = Array.from({ length: 1000 }, (_, i) => i);
    const out = sampleSparkline(v, 50);
    expect(out).toHaveLength(50);
    expect(out[0]).toBe(0);
    expect(out[49]).toBe(999);
  });
});

describe('buildTile', () => {
  it('uses the display processor for number, prefix, suffix and colour', () => {
    const frame = makeFrame([
      {
        values: [1, 1234.5],
        display: (v) => ({ text: '1,234.50', prefix: '₹', suffix: ' k', color: 'red' }),
      },
    ]);
    const t = buildTile(frame, frame.fields[0], [frame], 'lastNotNull');
    expect(t.value).toBe(1234.5);
    expect(t.decimals).toBe(2);
    expect(t.prefix).toBe('₹');
    expect(t.suffix).toBe(' k');
    expect(t.color).toBe('red');
    expect(t.raw).toBe(1234.5);
    expect(t.text).toBeUndefined();
  });

  it('shows mapped text instead of digits', () => {
    const frame = makeFrame([{ values: [3], display: () => ({ text: 'Degraded', color: 'orange' }) }]);
    const t = buildTile(frame, frame.fields[0], [frame], 'last');
    expect(t.text).toBe('Degraded');
    expect(t.value).toBe(3);
  });

  it('renders negatives as a minus prefix with the absolute value', () => {
    const frame = makeFrame([{ values: [-7], display: () => ({ text: '-7' }) }]);
    const t = buildTile(frame, frame.fields[0], [frame], 'last');
    expect(t.value).toBe(7);
    expect(t.prefix).toBe('-');
  });

  it('falls back to the raw value and configured decimals without a display processor', () => {
    const frame = makeFrame([{ values: [3.14159], config: { decimals: 2 } }]);
    const t = buildTile(frame, frame.fields[0], [frame], 'last');
    expect(t.value).toBeCloseTo(3.14159);
    expect(t.decimals).toBe(2);
  });

  it('flags the highest threshold step as critical', () => {
    const config = {
      thresholds: thresholds([
        { value: 0, color: 'green' },
        { value: 50, color: 'orange' },
        { value: 80, color: 'red' },
      ]),
    };
    const crit = makeFrame([{ values: [90], config }]);
    const ok = makeFrame([{ values: [60], config }]);
    expect(buildTile(crit, crit.fields[0], [crit], 'last').critical).toBe(true);
    expect(buildTile(ok, ok.fields[0], [ok], 'last').critical).toBe(false);
  });

  it('is never critical with a single step or percentage thresholds', () => {
    const single = makeFrame([{ values: [99], config: { thresholds: thresholds([{ value: 0, color: 'green' }]) } }]);
    expect(buildTile(single, single.fields[0], [single], 'last').critical).toBe(false);
    const pct = makeFrame([
      {
        values: [99],
        config: {
          thresholds: thresholds(
            [
              { value: 0, color: 'green' },
              { value: 80, color: 'red' },
            ],
            'percentage' as any
          ),
        },
      },
    ]);
    expect(buildTile(pct, pct.fields[0], [pct], 'last').critical).toBe(false);
  });

  it('picks up the last timestamp and links', () => {
    const getLinks = jest.fn().mockReturnValue([{ href: '/x', title: 'Runbook', target: '_blank', origin: {} }]);
    const frame = makeFrame([
      { name: 'time', type: FieldType.time, values: [1000, 2000, 3000] },
      { values: [1, 2, 3], getLinks },
    ]);
    const t = buildTile(frame, frame.fields[1], [frame], 'lastNotNull');
    expect(t.lastTimestamp).toBe(3000);
    expect(getLinks).toHaveBeenCalledWith({ valueRowIndex: 2 });
    expect(t.links).toHaveLength(1);
  });

  it('survives a throwing getLinks', () => {
    const frame = makeFrame([
      {
        values: [1],
        getLinks: () => {
          throw new Error('boom');
        },
      },
    ]);
    expect(buildTile(frame, frame.fields[0], [frame], 'last').links).toEqual([]);
  });
});

describe('collectTiles', () => {
  const frames = [
    makeFrame([
      { name: 'time', type: FieldType.time, values: [1, 2] },
      { name: 'a', values: [1, 2] },
      { name: 'b', values: [3, 4] },
    ]),
    makeFrame([{ name: 'c', values: [5, 6] }], 'B'),
  ];
  it('returns only the first numeric field in single mode', () => {
    const t = collectTiles(frames, 'lastNotNull', false);
    expect(t).toHaveLength(1);
    expect(t[0].raw).toBe(2);
  });
  it('returns every numeric field in grid mode', () => {
    const t = collectTiles(frames, 'lastNotNull', true);
    expect(t.map((x) => x.raw)).toEqual([2, 4, 6]);
    expect(new Set(t.map((x) => x.key)).size).toBe(3);
  });
  it('returns nothing without numeric data', () => {
    expect(collectTiles(undefined, 'last', true)).toEqual([]);
    expect(collectTiles([makeFrame([{ type: FieldType.string, values: ['x'] }])], 'last', true)).toEqual([]);
  });
});
