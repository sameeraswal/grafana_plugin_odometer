import React from 'react';
import { render, screen } from '@testing-library/react';
import { FieldType } from '@grafana/data';
import { SimplePanel, getFontSize } from '../components/SimplePanel';
import { DEFAULT_OPTIONS } from '../types';

const odometerProps: any[] = [];
jest.mock('react-odometerjs', () => ({
  __esModule: true,
  default: (props: any) => {
    odometerProps.push(props);
    return <span data-testid="odometer">{props.value}</span>;
  },
}));

const makeProps = (values: number[], options = {}) =>
  ({
    options: { ...DEFAULT_OPTIONS, ...options },
    width: 400,
    height: 200,
    data: {
      series: [
        { length: values.length, fields: [{ name: 'v', type: FieldType.number, config: {}, values: values }] },
      ],
    },
  } as any);

beforeEach(() => (odometerProps.length = 0));

describe('SimplePanel', () => {
  it('renders the latest value with default options', () => {
    render(<SimplePanel {...makeProps([1, 2, 3])} />);
    expect(screen.getByTestId('odometer').textContent).toBe('3');
    const p = odometerProps[0];
    expect(p.animation).toBeUndefined();
    expect(p.format).toBe('d');
    expect(p.duration).toBe(5000);
  });

  it('passes count animation, duration and decimals', () => {
    render(<SimplePanel {...makeProps([1.5], { animationType: 'count', duration: 1000, decimals: 2 })} />);
    const p = odometerProps[0];
    expect(p.animation).toBe('count');
    expect(p.duration).toBe(1000);
    expect(p.format).toBe('(d).dd');
  });

  it('renders 0 when there is no data', () => {
    const props = makeProps([]);
    props.data.series = [];
    render(<SimplePanel {...props} />);
    expect(screen.getByTestId('odometer').textContent).toBe('0');
  });

  it('applies the odometer theme through Emotion (no CSS file import)', () => {
    render(<SimplePanel {...makeProps([5])} />);
    const el = screen.getByTestId('odometer-panel');
    expect(el.className).toMatch(/css-/);
    const injected = Array.from(document.styleSheets)
      .flatMap((sheet) => Array.from(sheet.cssRules))
      .map((rule) => rule.cssText)
      .join('\n');
    expect(injected).toContain('odometer-theme-car');
    expect(injected).toContain(el.className.split(' ').find((c) => c.startsWith('css-')) as string);
  });

  it('sizes the wrapper to the panel', () => {
    render(<SimplePanel {...makeProps([5])} />);
    const el = screen.getByTestId('odometer-panel');
    expect(el.style.width).toBe('400px');
    expect(el.style.height).toBe('200px');
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
});
