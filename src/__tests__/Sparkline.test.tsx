import React from 'react';
import { render, screen } from '@testing-library/react';
import { Sparkline, sparklinePoints } from '../components/Sparkline';

describe('sparklinePoints', () => {
  it('returns nothing for fewer than 2 points', () => {
    expect(sparklinePoints([])).toBe('');
    expect(sparklinePoints([5])).toBe('');
  });
  it('spans the full width and scales min/max to the edges', () => {
    const pts = sparklinePoints([0, 10], 100, 30, 2).split(' ');
    expect(pts[0]).toBe('0.00,28.00'); // min at the bottom
    expect(pts[1]).toBe('100.00,2.00'); // max at the top
  });
  it('draws a flat series in the middle-ish without NaN', () => {
    expect(sparklinePoints([5, 5, 5])).not.toContain('NaN');
  });
});

describe('<Sparkline />', () => {
  it('renders an svg polyline', () => {
    render(<Sparkline values={[1, 3, 2]} color="red" />);
    const svg = screen.getByTestId('odometer-sparkline');
    expect(svg.querySelector('polyline')?.getAttribute('stroke')).toBe('red');
  });
  it('renders nothing for too little data', () => {
    const { container } = render(<Sparkline values={[1]} />);
    expect(container).toBeEmptyDOMElement();
  });
});
