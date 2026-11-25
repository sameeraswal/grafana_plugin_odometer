import React, { useEffect, useMemo, useState } from 'react';
import { PanelProps } from '@grafana/data';
import { SimpleOptions, withDefaults } from 'types';
import { collectTiles, Tile } from 'tiles';
import { OdometerTile } from './OdometerTile';

export { getFontSize } from './OdometerTile';

interface Props extends PanelProps<SimpleOptions> {}

/** Re-renders every `intervalMs` so time-based features (stale data, pro-rated targets) stay current. */
function useNow(intervalMs: number, enabled: boolean): number {
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    if (!enabled) {
      return;
    }
    const id = setInterval(() => setNow(Date.now()), intervalMs);
    return () => clearInterval(id);
  }, [intervalMs, enabled]);
  return now;
}

/** Rows/columns for the grid layout, aiming for tiles that are roughly as wide as they are tall. */
export function gridDimensions(count: number, width: number, height: number): { cols: number; rows: number } {
  if (count <= 1) {
    return { cols: 1, rows: 1 };
  }
  const aspect = Math.max(width, 1) / Math.max(height, 1);
  const cols = Math.min(count, Math.max(1, Math.round(Math.sqrt(count * aspect))));
  return { cols, rows: Math.ceil(count / cols) };
}

export const SimplePanel: React.FC<Props> = ({ options: rawOptions, data, width, height, timeRange, fieldConfig }) => {
  const options = withDefaults(rawOptions);
  const now = useNow(30_000, options.showStale || (options.showTarget && options.targetMode === 'prorated'));

  const grid = options.layout === 'grid';
  const tiles: Tile[] = useMemo(
    () => collectTiles(data?.series, options.reduce, grid),
    [data?.series, options.reduce, grid]
  );

  const from = timeRange?.from?.valueOf?.() ?? 0;
  const to = timeRange?.to?.valueOf?.() ?? 0;

  // No numeric data: show the standard "No value" text if set, otherwise 0 (as before).
  const noValue = fieldConfig?.defaults?.noValue;
  const shown: Tile[] = tiles.length
    ? tiles
    : [
        {
          key: 'empty',
          label: '',
          value: 0,
          decimals: 0,
          prefix: '',
          suffix: '',
          text: noValue ? String(noValue) : undefined,
          critical: false,
          raw: 0,
          sparkline: [],
          links: [],
          field: { name: '', type: 'number', config: {}, values: [] } as any,
        },
      ];

  const { cols, rows } = grid ? gridDimensions(shown.length, width, height) : { cols: 1, rows: 1 };
  const tileW = Math.floor(width / cols);
  const tileH = Math.floor(height / rows);

  if (!grid) {
    return (
      <OdometerTile
        tile={shown[0]}
        options={options}
        width={width}
        height={height}
        now={now}
        from={from}
        to={to}
        showLabel={false}
      />
    );
  }

  return (
    <div
      data-testid="odometer-grid"
      style={{ width, height, display: 'grid', gridTemplateColumns: `repeat(${cols}, ${tileW}px)`, gridAutoRows: `${tileH}px` }}
    >
      {shown.map((tile) => (
        <OdometerTile
          key={tile.key}
          tile={tile}
          options={options}
          width={tileW}
          height={tileH}
          now={now}
          from={from}
          to={to}
          showLabel
        />
      ))}
    </div>
  );
};
