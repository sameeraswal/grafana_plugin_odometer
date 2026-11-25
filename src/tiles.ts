import {
  DataFrame,
  Field,
  FieldType,
  ReducerID,
  LinkModel,
  getActiveThreshold,
  getFieldDisplayName,
  reduceField,
  ThresholdsMode,
} from '@grafana/data';
import { ReducerOption } from './types';

const MAX_SPARK_POINTS = 60;

export interface Tile {
  key: string;
  label: string;
  /** The (already formatted/rounded) number the odometer animates to. */
  value: number;
  decimals: number;
  prefix: string;
  suffix: string;
  /** Set when a value mapping (or noValue) produced non-numeric text to show instead of digits. */
  text?: string;
  /** Colour from the field's thresholds / colour scheme (CSS colour). */
  color?: string;
  /** True when the value is in the highest threshold step (needs >1 step, absolute mode). */
  critical: boolean;
  /** Raw (unformatted) reduced value, used for target maths. */
  raw: number;
  sparkline: number[];
  /** Timestamp (ms) of the last row, from the frame's time field. */
  lastTimestamp?: number;
  links: LinkModel[];
  field: Field;
}

const isFiniteNumber = (v: unknown): v is number => typeof v === 'number' && Number.isFinite(v);

/** Parses a formatted display string such as "1,234.50" -> 1234.5. Returns undefined for non-numeric text. */
export function parseDisplayNumber(text: string): number | undefined {
  const cleaned = text.replace(/[,\s]/g, '');
  return /^[+-]?\d+(\.\d+)?$/.test(cleaned) ? Number(cleaned) : undefined;
}

export function decimalsOf(text: string): number {
  const frac = text.replace(/,/g, '').split('.')[1];
  return Math.min(frac ? frac.length : 0, 10);
}

/** Reduces a field to one value and the row it came from (for data links). */
export function reduceValues(values: ArrayLike<unknown>, field: Field, reducer: ReducerOption): { value: number; row: number } {
  const n = values.length;
  const lastIndex = (skipNull: boolean) => {
    for (let i = n - 1; i >= 0; i--) {
      if (!skipNull || isFiniteNumber(values[i])) {
        return i;
      }
    }
    return -1;
  };

  if (reducer === 'last' || reducer === 'lastNotNull') {
    const i = lastIndex(reducer === 'lastNotNull');
    return { value: i >= 0 && isFiniteNumber(values[i]) ? (values[i] as number) : 0, row: Math.max(i, 0) };
  }
  if (reducer === 'first') {
    const i = Array.from({ length: n }, (_, k) => k).find((k) => isFiniteNumber(values[k])) ?? -1;
    return { value: i >= 0 ? (values[i] as number) : 0, row: Math.max(i, 0) };
  }
  const id = { mean: ReducerID.mean, sum: ReducerID.sum, min: ReducerID.min, max: ReducerID.max }[reducer];
  const calcs = reduceField({ field, reducers: [id] });
  const v = calcs[id];
  return { value: isFiniteNumber(v) ? v : 0, row: Math.max(lastIndex(true), 0) };
}

export function sampleSparkline(values: ArrayLike<unknown>, maxPoints = MAX_SPARK_POINTS): number[] {
  const nums: number[] = [];
  for (let i = 0; i < values.length; i++) {
    if (isFiniteNumber(values[i])) {
      nums.push(values[i] as number);
    }
  }
  if (nums.length <= maxPoints) {
    return nums;
  }
  const out: number[] = [];
  for (let i = 0; i < maxPoints; i++) {
    out.push(nums[Math.round((i * (nums.length - 1)) / (maxPoints - 1))]);
  }
  return out;
}

function isCritical(raw: number, field: Field): boolean {
  const t = field.config?.thresholds;
  if (!t || t.mode === ThresholdsMode.Percentage || !t.steps || t.steps.length < 2) {
    return false;
  }
  const active = getActiveThreshold(raw, t.steps);
  return active === t.steps[t.steps.length - 1];
}

export function buildTile(frame: DataFrame, field: Field, series: DataFrame[], reducer: ReducerOption): Tile {
  const { value: raw, row } = reduceValues(field.values, field, reducer);

  let value = raw;
  let decimals = Math.min(Math.max(Number(field.config?.decimals) || 0, 0), 10);
  let prefix = '';
  let suffix = '';
  let text: string | undefined;
  let color: string | undefined;

  if (typeof field.display === 'function') {
    const d = field.display(raw);
    prefix = d.prefix ?? '';
    suffix = d.suffix ?? '';
    color = d.color;
    const parsed = parseDisplayNumber(d.text ?? '');
    if (parsed === undefined) {
      text = d.text;
    } else {
      value = parsed;
      decimals = decimalsOf(d.text);
    }
  }
  if (value < 0) {
    // odometer.js cannot render a minus sign inside the rolling digits
    prefix = `-${prefix}`;
    value = Math.abs(value);
  }

  const timeField = frame.fields.find((f) => f.type === FieldType.time);
  const lastTs = timeField && timeField.values.length ? Number(timeField.values[timeField.values.length - 1]) : undefined;

  let links: LinkModel[] = [];
  try {
    links = field.getLinks ? field.getLinks({ valueRowIndex: row }) : [];
  } catch {
    links = [];
  }

  return {
    key: `${frame.refId ?? ''}-${getFieldDisplayName(field, frame, series)}`,
    label: getFieldDisplayName(field, frame, series),
    value,
    decimals,
    prefix,
    suffix,
    text,
    color,
    critical: isCritical(raw, field),
    raw,
    sparkline: sampleSparkline(field.values),
    lastTimestamp: Number.isFinite(lastTs) ? lastTs : undefined,
    links,
    field,
  };
}

/**
 * One tile per numeric field (grid layout) or just the first numeric field (single layout).
 * Returns an empty list when there is no numeric data.
 */
export function collectTiles(series: DataFrame[] | undefined, reducer: ReducerOption, all: boolean): Tile[] {
  const frames = series ?? [];
  const tiles: Tile[] = [];
  for (const frame of frames) {
    for (const field of frame.fields) {
      if (field.type !== FieldType.number) {
        continue;
      }
      tiles.push(buildTile(frame, field, frames, reducer));
      if (!all) {
        return tiles;
      }
    }
  }
  return tiles;
}
