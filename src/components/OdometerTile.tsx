import React, { useEffect, useRef, useState } from 'react';
import Odometer from 'react-odometerjs';
import { css, cx, keyframes } from '@emotion/css';
import { GrafanaTheme2 } from '@grafana/data';
import { useTheme2 } from '@grafana/ui';
import { SimpleOptions } from '../types';
import { Tile } from '../tiles';
import { getAnimation, getDuration, getFormat } from '../utils';
import {
  computeDelta,
  deltaStatus,
  expectedValue,
  formatPercent,
  formatAge,
  isStale,
  progressPercent,
} from '../target';
import { getThemeCss } from './themes';
import { Sparkline } from './Sparkline';

/** Rough width of one digit relative to the font size, used to fit the value in the panel. */
const DIGIT_WIDTH_RATIO = 0.8;
const MAX_FONT_SIZE = 100;
const MIN_FONT_SIZE = 12;

export function getFontSize(value: number, format: string, width: number, height: number, extraChars = 0): number {
  const decimals = format.includes('.') ? format.split('.')[1].length + 1 : 0;
  const chars = Math.max(String(Math.trunc(Math.abs(value))).length + decimals + extraChars, 1);
  const byWidth = width / (chars * DIGIT_WIDTH_RATIO);
  const size = Math.min(MAX_FONT_SIZE, byWidth, height * 0.8);
  return Math.max(MIN_FONT_SIZE, Math.floor(size));
}

const pulse = keyframes`
  0%, 100% { filter: drop-shadow(0 0 0 transparent); }
  50% { filter: drop-shadow(0 0 0.3em var(--odo-accent, #f2495c)); }
`;
const flash = keyframes`
  0% { filter: brightness(1.9); }
  100% { filter: brightness(1); }
`;

const themeClassCache = new Map<string, string>();
const themeClass = (name: string) => {
  let c = themeClassCache.get(name);
  if (!c) {
    c = css(getThemeCss(name));
    themeClassCache.set(name, c);
  }
  return c;
};

const styles = {
  tile: css({
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
    textAlign: 'center',
    gap: 4,
    boxSizing: 'border-box',
  }),
  row: css({ display: 'flex', alignItems: 'center', justifyContent: 'center', maxWidth: '100%' }),
  pulsing: css({
    animation: `${pulse} 1.6s ease-in-out infinite`,
    '@media (prefers-reduced-motion: reduce)': { animation: 'none' },
  }),
  flashing: css({
    animation: `${flash} 0.9s ease-out`,
    '@media (prefers-reduced-motion: reduce)': { animation: 'none' },
  }),
  small: css({ fontSize: 12, lineHeight: 1.3, opacity: 0.9 }),
  links: css({ display: 'flex', flexWrap: 'wrap', gap: 8, justifyContent: 'center', fontSize: 12 }),
  bar: css({ width: '80%', height: 6, borderRadius: 3, background: 'rgba(127,127,127,0.3)', overflow: 'hidden' }),
};

interface Props {
  tile: Tile;
  options: SimpleOptions;
  width: number;
  height: number;
  now: number;
  /** Dashboard time range in ms, for pro-rated targets. */
  from: number;
  to: number;
  showLabel: boolean;
}

function formatAmount(tile: Tile, amount: number): string {
  const abs = Math.abs(amount);
  if (typeof tile.field.display === 'function') {
    const d = tile.field.display(abs);
    return `${d.prefix ?? ''}${d.text}${d.suffix ?? ''}`;
  }
  return abs.toFixed(tile.decimals);
}

export const OdometerTile: React.FC<Props> = ({ tile, options, width, height, now, from, to, showLabel }) => {
  const theme: GrafanaTheme2 = useTheme2();

  // flash briefly whenever the value changes (not on first render)
  const prev = useRef<number | undefined>(undefined);
  const [flashKey, setFlashKey] = useState(0);
  useEffect(() => {
    if (prev.current !== undefined && prev.current !== tile.value) {
      setFlashKey((k) => k + 1);
    }
    prev.current = tile.value;
  }, [tile.value]);

  const animation = getAnimation(options.animationType);
  const duration = getDuration(options.duration);
  const format = getFormat(tile.decimals, options.thousandsSeparator);
  const accent = options.colorByThresholds ? tile.color : undefined;

  // target / delta
  let deltaLine: React.ReactNode = null;
  let progress: number | undefined;
  if (options.showTarget) {
    const expected = expectedValue(options.target, options.targetMode, from, to, now);
    const { amount, percent } = computeDelta(tile.raw, expected);
    const status = deltaStatus(amount, options.lowerIsBetter);
    const color = status === 'good' ? theme.colors.success.text : theme.colors.error.text;
    const arrow = amount === 0 ? '' : amount > 0 ? '▲' : '▼';
    const abs = `${amount > 0 ? '+' : amount < 0 ? '-' : ''}${formatAmount(tile, amount)}`;
    const parts: string[] = [];
    if (options.deltaFormat !== 'percent') {
      parts.push(abs);
    }
    if (options.deltaFormat !== 'absolute' && percent !== undefined) {
      parts.push(formatPercent(percent));
    }
    const label = options.targetMode === 'prorated' ? 'vs pace' : 'vs target';
    deltaLine = (
      <div data-testid="odometer-delta" data-status={status} className={styles.small} style={{ color }}>
        {arrow} {parts.join(' · ')} <span style={{ opacity: 0.7 }}>{label}</span>
      </div>
    );
    if (options.showProgress) {
      progress = progressPercent(tile.raw, expected);
    }
  }

  const stale = options.showStale && isStale(tile.lastTimestamp, now, options.staleMinutes);

  const extras =
    (showLabel ? 18 : 0) +
    (options.showTarget ? 22 + (options.showProgress ? 10 : 0) : 0) +
    (options.showSparkline ? 32 : 0) +
    (stale ? 20 : 0) +
    (tile.links.length ? 20 : 0);
  const digitsHeight = Math.max(height - extras - 16, 24);
  const extraChars = (tile.prefix.length + tile.suffix.length) * 0.5;
  const fontSize = getFontSize(tile.value, format, width - 16, digitsHeight, extraChars);

  const odometerClass = themeClass(options.theme);
  const effectClass = cx(
    options.pulseWhenCritical && tile.critical && styles.pulsing,
    options.flashOnChange && flashKey > 0 && styles.flashing
  );

  return (
    <div
      data-testid="odometer-panel"
      data-critical={tile.critical ? 'true' : undefined}
      className={cx(styles.tile, odometerClass, `odo-${options.digitStyle}`)}
      style={{ width, height, ['--odo-accent' as string]: accent }}
    >
      {showLabel && <div className={styles.small}>{tile.label}</div>}
      <div key={flashKey} className={cx(styles.row, effectClass)} style={{ fontSize }}>
        {tile.prefix && <span style={{ fontSize: fontSize * 0.45, color: accent }}>{tile.prefix}</span>}
        {tile.text !== undefined ? (
          <span data-testid="odometer-text" style={{ color: accent }}>
            {tile.text}
          </span>
        ) : (
          <Odometer
            key={`${options.theme}-${animation}-${format}-${duration}`}
            theme={options.theme}
            animation={animation}
            format={format}
            duration={duration}
            value={tile.value}
            style={{ fontSize }}
          />
        )}
        {tile.suffix && <span style={{ fontSize: fontSize * 0.45, color: accent }}>{tile.suffix}</span>}
      </div>
      {deltaLine}
      {progress !== undefined && (
        <div className={styles.bar} data-testid="odometer-progress" data-value={progress.toFixed(0)}>
          <div style={{ width: `${progress}%`, height: '100%', background: accent ?? theme.colors.primary.main }} />
        </div>
      )}
      {options.showSparkline && (
        <div style={{ width: '80%' }}>
          <Sparkline values={tile.sparkline} color={accent ?? theme.colors.text.secondary} />
        </div>
      )}
      {stale && tile.lastTimestamp !== undefined && (
        <div data-testid="odometer-stale" className={styles.small} style={{ color: theme.colors.warning.text }}>
          ⚠ No new data for {formatAge(tile.lastTimestamp, now)}
        </div>
      )}
      {tile.links.length > 0 && (
        <div className={styles.links}>
          {tile.links.map((l) => (
            <a
              key={l.href + l.title}
              href={l.href}
              target={l.target}
              rel="noreferrer"
              onClick={(e) => l.onClick?.(e, l.origin)}
            >
              {l.title}
            </a>
          ))}
        </div>
      )}
    </div>
  );
};
