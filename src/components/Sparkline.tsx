import React from 'react';

interface Props {
  values: number[];
  color?: string;
  height?: number;
}

/** Builds the SVG polyline points for values scaled into a 100 x 30 box. */
export function sparklinePoints(values: number[], w = 100, h = 30, pad = 2): string {
  if (values.length < 2) {
    return '';
  }
  const min = Math.min(...values);
  const max = Math.max(...values);
  const span = max - min || 1;
  return values
    .map((v, i) => {
      const x = (i / (values.length - 1)) * w;
      const y = h - pad - ((v - min) / span) * (h - pad * 2);
      return `${x.toFixed(2)},${y.toFixed(2)}`;
    })
    .join(' ');
}

export const Sparkline: React.FC<Props> = ({ values, color = 'currentColor', height = 28 }) => {
  const points = sparklinePoints(values);
  if (!points) {
    return null;
  }
  return (
    <svg
      data-testid="odometer-sparkline"
      viewBox="0 0 100 30"
      preserveAspectRatio="none"
      width="100%"
      height={height}
      role="img"
      aria-label="Trend"
    >
      <polyline points={points} fill="none" stroke={color} strokeWidth={2} vectorEffect="non-scaling-stroke" />
    </svg>
  );
};
