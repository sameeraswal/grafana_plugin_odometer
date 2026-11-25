import React from 'react';
import { render, screen, within } from '@testing-library/react';
import { FieldType } from '@grafana/data';
import { SimplePanel, getFontSize, gridDimensions } from '../components/SimplePanel';
import { DEFAULT_OPTIONS, SimpleOptions } from '../types';
import { makeFrame, thresholds } from '../testHelpers';

const odometerProps: any[] = [];
jest.mock('react-odometerjs', () => ({
  __esModule: true,
  default: (props: any) => {
    odometerProps.push(props);
    return <span data-testid="odometer">{props.value}</span>;
  },
}));

const NOW = 1_000_000_000_000;

const makeProps = (frames: any[], options: Partial<SimpleOptions> = {}, extra: any = {}) =>
  ({
    options: { ...DEFAULT_OPTIONS, ...options },
    width: 400,
    height: 200,
    data: { series: frames },
    timeRange: { from: { valueOf: () => NOW - 1000 }, to: { valueOf: () => NOW + 1000 } },
    fieldConfig: { defaults: {}, overrides: [] },
    ...extra,
  } as any);

const nums = (values: number[], spec: any = {}) => makeFrame([{ values, ...spec }]);

beforeEach(() => {
  odometerProps.length = 0;
  jest.useFakeTimers().setSystemTime(NOW);
});
afterEach(() => jest.useRealTimers());

describe('SimplePanel basics', () => {
  it('renders the latest value with default options', () => {
    render(<SimplePanel {...makeProps([nums([1, 2, 3])])} />);
    expect(screen.getByTestId('odometer').textContent).toBe('3');
    const p = odometerProps[0];
    expect(p.animation).toBeUndefined();
    expect(p.format).toBe('d');
    expect(p.duration).toBe(5000);
    expect(p.theme).toBe('car');
  });

  it('passes count animation, duration and theme', () => {
    render(<SimplePanel {...makeProps([nums([1])], { animationType: 'count', duration: 1000, theme: 'digital' })} />);
    const p = odometerProps[0];
    expect(p.animation).toBe('count');
    expect(p.duration).toBe(1000);
    expect(p.theme).toBe('digital');
  });

  it('derives decimals from the field display (standard decimals option)', () => {
    const frame = nums([3.14159], { display: () => ({ text: '3.14' }) });
    render(<SimplePanel {...makeProps([frame])} />);
    expect(odometerProps[0].format).toBe('(d).dd');
    expect(odometerProps[0].value).toBe(3.14);
  });

  it('applies the thousands separator', () => {
    render(<SimplePanel {...makeProps([nums([12345])], { thousandsSeparator: true })} />);
    expect(odometerProps[0].format).toBe('(,ddd)');
  });

  it('uses the reduce option', () => {
    render(<SimplePanel {...makeProps([nums([1, 2, 3, 10])], { reduce: 'sum' })} />);
    expect(screen.getByTestId('odometer').textContent).toBe('16');
  });

  it('shows prefix and suffix from the unit', () => {
    const frame = nums([42], { display: () => ({ text: '42', prefix: '₹', suffix: '%' }) });
    render(<SimplePanel {...makeProps([frame])} />);
    expect(screen.getByText('₹')).toBeInTheDocument();
    expect(screen.getByText('%')).toBeInTheDocument();
  });

  it('renders mapped text instead of digits', () => {
    const frame = nums([3], { display: () => ({ text: 'Degraded' }) });
    render(<SimplePanel {...makeProps([frame])} />);
    expect(screen.getByTestId('odometer-text').textContent).toBe('Degraded');
    expect(screen.queryByTestId('odometer')).toBeNull();
  });

  it('renders 0 with no data, or the standard "No value" text', () => {
    const { unmount } = render(<SimplePanel {...makeProps([])} />);
    expect(screen.getByTestId('odometer').textContent).toBe('0');
    unmount();
    render(<SimplePanel {...makeProps([], {}, { fieldConfig: { defaults: { noValue: 'N/A' }, overrides: [] } })} />);
    expect(screen.getByTestId('odometer-text').textContent).toBe('N/A');
  });

  it('sizes the wrapper to the panel and applies the theme class through Emotion', () => {
    render(<SimplePanel {...makeProps([nums([5])], { theme: 'digital' })} />);
    const el = screen.getByTestId('odometer-panel');
    expect(el.style.width).toBe('400px');
    expect(el.style.height).toBe('200px');
    const injected = Array.from(document.styleSheets)
      .flatMap((s) => Array.from(s.cssRules))
      .map((r) => r.cssText)
      .join('\n');
    expect(injected).toContain('odometer-theme-digital');
  });

  it('tolerates older dashboards with missing options', () => {
    const props = makeProps([nums([7])]);
    props.options = { animationType: 'count' };
    render(<SimplePanel {...props} />);
    expect(screen.getByTestId('odometer').textContent).toBe('7');
  });
});

describe('thresholds & effects', () => {
  const config = {
    thresholds: thresholds([
      { value: 0, color: 'green' },
      { value: 80, color: 'red' },
    ]),
  };
  const colored = (v: number) => nums([v], { config, display: () => ({ text: String(v), color: v >= 80 ? 'red' : 'green' }) });

  it('tints with the threshold colour only when enabled', () => {
    const { unmount } = render(<SimplePanel {...makeProps([colored(90)], { colorByThresholds: true })} />);
    expect(screen.getByTestId('odometer-panel').style.getPropertyValue('--odo-accent')).toBe('red');
    unmount();
    render(<SimplePanel {...makeProps([colored(90)], { colorByThresholds: false })} />);
    expect(screen.getByTestId('odometer-panel').style.getPropertyValue('--odo-accent')).toBe('');
  });

  it('marks the tile critical in the highest step', () => {
    const { unmount } = render(<SimplePanel {...makeProps([colored(90)])} />);
    expect(screen.getByTestId('odometer-panel')).toHaveAttribute('data-critical', 'true');
    unmount();
    render(<SimplePanel {...makeProps([colored(10)])} />);
    expect(screen.getByTestId('odometer-panel')).not.toHaveAttribute('data-critical');
  });

  it('renders with pulse and flash enabled and re-renders on a new value', () => {
    const props = makeProps([colored(90)], { pulseWhenCritical: true, flashOnChange: true });
    const { rerender } = render(<SimplePanel {...props} />);
    rerender(<SimplePanel {...makeProps([colored(95)], { pulseWhenCritical: true, flashOnChange: true })} />);
    expect(screen.getByTestId('odometer').textContent).toBe('95');
  });
});

describe('target & delta', () => {
  it('is hidden unless enabled', () => {
    render(<SimplePanel {...makeProps([nums([120])], { target: 100 })} />);
    expect(screen.queryByTestId('odometer-delta')).toBeNull();
    expect(screen.queryByTestId('odometer-progress')).toBeNull();
  });

  it('shows the delta above target as good', () => {
    render(<SimplePanel {...makeProps([nums([120])], { showTarget: true, target: 100 })} />);
    const d = screen.getByTestId('odometer-delta');
    expect(d).toHaveAttribute('data-status', 'good');
    expect(d.textContent).toContain('+20');
    expect(d.textContent).toContain('vs target');
  });

  it('shows the delta below target as bad, and flips for lower-is-better', () => {
    const { unmount } = render(<SimplePanel {...makeProps([nums([80])], { showTarget: true, target: 100 })} />);
    expect(screen.getByTestId('odometer-delta')).toHaveAttribute('data-status', 'bad');
    expect(screen.getByTestId('odometer-delta').textContent).toContain('-20');
    unmount();
    render(<SimplePanel {...makeProps([nums([80])], { showTarget: true, target: 100, lowerIsBetter: true })} />);
    expect(screen.getByTestId('odometer-delta')).toHaveAttribute('data-status', 'good');
  });

  it('supports percent and both formats', () => {
    const { unmount } = render(
      <SimplePanel {...makeProps([nums([120])], { showTarget: true, target: 100, deltaFormat: 'percent' })} />
    );
    expect(screen.getByTestId('odometer-delta').textContent).toContain('+20.0%');
    expect(screen.getByTestId('odometer-delta').textContent).not.toContain('+20 ');
    unmount();
    render(<SimplePanel {...makeProps([nums([120])], { showTarget: true, target: 100, deltaFormat: 'both' })} />);
    expect(screen.getByTestId('odometer-delta').textContent).toContain('+20');
    expect(screen.getByTestId('odometer-delta').textContent).toContain('+20.0%');
  });

  it('formats the delta with the field unit', () => {
    const frame = nums([120], { display: (v: number) => ({ text: String(v), suffix: ' kg' }) });
    render(<SimplePanel {...makeProps([frame], { showTarget: true, target: 100 })} />);
    expect(screen.getByTestId('odometer-delta').textContent).toContain('+20 kg');
  });

  it('shows progress and can hide it', () => {
    const { unmount } = render(<SimplePanel {...makeProps([nums([50])], { showTarget: true, target: 200 })} />);
    expect(screen.getByTestId('odometer-progress')).toHaveAttribute('data-value', '25');
    unmount();
    render(<SimplePanel {...makeProps([nums([50])], { showTarget: true, target: 200, showProgress: false })} />);
    expect(screen.queryByTestId('odometer-progress')).toBeNull();
  });

  it('pro-rates the target over the time range', () => {
    // range is [NOW-1000, NOW+1000] and now is NOW -> halfway, so expected = 50 of 100
    render(
      <SimplePanel {...makeProps([nums([60])], { showTarget: true, target: 100, targetMode: 'prorated' })} />
    );
    const d = screen.getByTestId('odometer-delta');
    expect(d.textContent).toContain('+10');
    expect(d.textContent).toContain('vs pace');
  });
});

describe('stale data, links and sparkline', () => {
  const withTime = (lastTs: number, spec: any = {}) =>
    makeFrame([
      { name: 'time', type: FieldType.time, values: [lastTs - 1000, lastTs] },
      { values: [1, 2], ...spec },
    ]);

  it('warns when data is older than the threshold', () => {
    render(<SimplePanel {...makeProps([withTime(NOW - 20 * 60_000)], { showStale: true, staleMinutes: 15 })} />);
    expect(screen.getByTestId('odometer-stale').textContent).toContain('20 min');
  });

  it('shows very old data in days', () => {
    render(<SimplePanel {...makeProps([withTime(NOW - 3 * 86_400_000)], { showStale: true })} />);
    expect(screen.getByTestId('odometer-stale').textContent).toContain('3 days');
  });

  it('does not warn when fresh or when disabled', () => {
    const { unmount } = render(
      <SimplePanel {...makeProps([withTime(NOW - 60_000)], { showStale: true, staleMinutes: 15 })} />
    );
    expect(screen.queryByTestId('odometer-stale')).toBeNull();
    unmount();
    render(<SimplePanel {...makeProps([withTime(NOW - 60 * 60_000)], { showStale: false })} />);
    expect(screen.queryByTestId('odometer-stale')).toBeNull();
  });

  it('renders the field data links', () => {
    const getLinks = () => [{ href: '/runbook', title: 'Runbook', target: '_blank', origin: {} }];
    render(<SimplePanel {...makeProps([nums([1, 2], { getLinks })])} />);
    const a = screen.getByRole('link', { name: 'Runbook' });
    expect(a).toHaveAttribute('href', '/runbook');
  });

  it('shows the sparkline only when enabled', () => {
    const { unmount } = render(<SimplePanel {...makeProps([nums([1, 3, 2])], { showSparkline: true })} />);
    expect(screen.getByTestId('odometer-sparkline')).toBeInTheDocument();
    unmount();
    render(<SimplePanel {...makeProps([nums([1, 3, 2])])} />);
    expect(screen.queryByTestId('odometer-sparkline')).toBeNull();
  });
});

describe('grid layout', () => {
  const frames = [
    makeFrame([
      { name: 'orders', values: [1, 2] },
      { name: 'refunds', values: [3, 4] },
    ]),
    makeFrame([{ name: 'visits', values: [5, 6] }], 'B'),
  ];

  it('renders one labelled tile per numeric field', () => {
    render(<SimplePanel {...makeProps(frames, { layout: 'grid' })} />);
    const grid = screen.getByTestId('odometer-grid');
    expect(within(grid).getAllByTestId('odometer-panel')).toHaveLength(3);
    ['orders', 'refunds', 'visits'].forEach((l) => expect(within(grid).getByText(l)).toBeInTheDocument());
  });

  it('single layout shows just the first field', () => {
    render(<SimplePanel {...makeProps(frames, { layout: 'single' })} />);
    expect(screen.queryByTestId('odometer-grid')).toBeNull();
    expect(screen.getAllByTestId('odometer')).toHaveLength(1);
  });
});

describe('gridDimensions', () => {
  it('handles 0/1 tiles', () => {
    expect(gridDimensions(0, 400, 200)).toEqual({ cols: 1, rows: 1 });
    expect(gridDimensions(1, 400, 200)).toEqual({ cols: 1, rows: 1 });
  });
  it('prefers more columns on wide panels and more rows on tall ones', () => {
    expect(gridDimensions(4, 1200, 200).cols).toBeGreaterThan(gridDimensions(4, 200, 1200).cols);
    const { cols, rows } = gridDimensions(5, 800, 400);
    expect(cols * rows).toBeGreaterThanOrEqual(5);
  });
});

describe('getFontSize', () => {
  it('caps at the maximum and respects a minimum', () => {
    expect(getFontSize(1, 'd', 2000, 2000)).toBe(100);
    expect(getFontSize(123456789, 'd', 10, 10)).toBe(12);
  });
  it('shrinks for wider values and smaller panels', () => {
    expect(getFontSize(1234567, 'd', 300, 200)).toBeLessThan(getFontSize(1, 'd', 300, 200));
    expect(getFontSize(1, 'd', 2000, 50)).toBeLessThan(100);
  });
  it('accounts for decimals and extra characters', () => {
    expect(getFontSize(1, '(d).dd', 300, 200)).toBeLessThan(getFontSize(1, 'd', 300, 200));
    expect(getFontSize(1, 'd', 300, 200, 4)).toBeLessThan(getFontSize(1, 'd', 300, 200));
  });
});
