import { DataFrame, DisplayValue, Field, FieldType, ThresholdsMode } from '@grafana/data';

export interface FieldSpec {
  name?: string;
  type?: FieldType;
  values: any[];
  display?: (v: any) => Partial<DisplayValue> & { text: string };
  config?: Field['config'];
  getLinks?: Field['getLinks'];
}

export const makeField = (spec: FieldSpec): Field =>
  ({
    name: spec.name ?? 'value',
    type: spec.type ?? FieldType.number,
    config: spec.config ?? {},
    values: spec.values,
    display: spec.display ? (v: any) => ({ numeric: Number(v), ...spec.display!(v) }) : undefined,
    getLinks: spec.getLinks,
  } as unknown as Field);

export const makeFrame = (fields: FieldSpec[], refId = 'A'): DataFrame =>
  ({ refId, length: fields[0]?.values.length ?? 0, fields: fields.map(makeField) } as unknown as DataFrame);

export const thresholds = (steps: Array<{ value: number; color: string }>, mode = ThresholdsMode.Absolute) => ({
  mode,
  steps: steps.map((s, i) => ({ ...s, value: i === 0 ? (-Infinity as number) : s.value })),
});
