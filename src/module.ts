import { FieldConfigProperty, PanelPlugin } from '@grafana/data';
import { DEFAULT_OPTIONS, SimpleOptions } from './types';
import { SimplePanel } from './components/SimplePanel';

/**
 * Plugin <=1.1.x had a custom "decimals" panel option; it is now Grafana's standard
 * "Decimals" field option. Move any saved value across so existing dashboards look the same.
 */
export function migrateOptions(panel: {
  options?: Partial<SimpleOptions>;
  fieldConfig?: { defaults?: { decimals?: number | null } };
}): Partial<SimpleOptions> {
  const { decimals, showAdvancedOptions, ...rest } = (panel.options ?? {}) as Partial<SimpleOptions>;
  void showAdvancedOptions;
  if (decimals !== undefined && panel.fieldConfig?.defaults && panel.fieldConfig.defaults.decimals == null) {
    panel.fieldConfig.defaults.decimals = decimals;
  }
  return rest;
}

export const plugin = new PanelPlugin<SimpleOptions>(SimplePanel)
  .setMigrationHandler(migrateOptions)
  // Standard options give units, decimals, thresholds, value mappings, links, "No value" and min/max.
  .useFieldConfig({
    standardOptions: {
      [FieldConfigProperty.Decimals]: { defaultValue: 0 },
    },
  })
  .setPanelOptions((builder) => {
    return builder
      // ---- Display -------------------------------------------------------------
      .addRadio({
        path: 'layout',
        name: 'Layout',
        description: 'One odometer for the first numeric field, or one per numeric field.',
        category: ['Display'],
        defaultValue: DEFAULT_OPTIONS.layout,
        settings: {
          options: [
            { value: 'single', label: 'Single' },
            { value: 'grid', label: 'Grid (all fields)' },
          ],
        },
      })
      .addSelect({
        path: 'reduce',
        name: 'Value',
        description: 'How a series is reduced to the number shown.',
        category: ['Display'],
        defaultValue: DEFAULT_OPTIONS.reduce,
        settings: {
          options: [
            { value: 'lastNotNull', label: 'Last (not null)' },
            { value: 'last', label: 'Last' },
            { value: 'first', label: 'First' },
            { value: 'mean', label: 'Mean' },
            { value: 'sum', label: 'Total' },
            { value: 'min', label: 'Min' },
            { value: 'max', label: 'Max' },
          ],
        },
      })
      .addSelect({
        path: 'theme',
        name: 'Theme',
        category: ['Display'],
        defaultValue: DEFAULT_OPTIONS.theme,
        settings: {
          options: [
            { value: 'car', label: 'Car (white on black)' },
            { value: 'light', label: 'Light card (black on white)' },
            { value: 'digital', label: 'Digital (LED)' },
            { value: 'minimal', label: 'Minimal (no frame)' },
          ],
        },
      })
      .addRadio({
        path: 'digitStyle',
        name: 'Digit style',
        description:
          'Classic: theme default (Car highlights the last digit). Uniform: every digit looks the same, like a counter. Decimals: digits after the decimal point use the contrasting colours.',
        category: ['Display'],
        defaultValue: DEFAULT_OPTIONS.digitStyle,
        settings: {
          options: [
            { value: 'classic', label: 'Classic' },
            { value: 'uniform', label: 'Uniform' },
            { value: 'decimals', label: 'Decimals' },
          ],
        },
      })
      .addBooleanSwitch({
        path: 'thousandsSeparator',
        name: 'Thousands separator',
        category: ['Display'],
        defaultValue: DEFAULT_OPTIONS.thousandsSeparator,
      })
      .addBooleanSwitch({
        path: 'showSparkline',
        name: 'Show sparkline',
        description: 'A small trend line under the value.',
        category: ['Display'],
        defaultValue: DEFAULT_OPTIONS.showSparkline,
      })
      // ---- Animation -----------------------------------------------------------
      .addRadio({
        path: 'animationType',
        name: 'Animation type',
        category: ['Animation'],
        defaultValue: DEFAULT_OPTIONS.animationType,
        settings: {
          options: [
            { value: 'odometer', label: 'Odometer' },
            { value: 'count', label: 'Counter' },
          ],
        },
      })
      .addNumberInput({
        path: 'duration',
        name: 'Animation duration (ms)',
        category: ['Animation'],
        defaultValue: DEFAULT_OPTIONS.duration,
        settings: { min: 0, integer: true },
      })
      // ---- Thresholds & effects ------------------------------------------------
      .addBooleanSwitch({
        path: 'colorByThresholds',
        name: 'Color by thresholds',
        description: 'Tint the odometer using the Thresholds / Color scheme standard options.',
        category: ['Thresholds & effects'],
        defaultValue: DEFAULT_OPTIONS.colorByThresholds,
      })
      .addBooleanSwitch({
        path: 'pulseWhenCritical',
        name: 'Pulse when critical',
        description: 'Glow while the value is in the highest threshold step.',
        category: ['Thresholds & effects'],
        defaultValue: DEFAULT_OPTIONS.pulseWhenCritical,
      })
      .addBooleanSwitch({
        path: 'flashOnChange',
        name: 'Flash on change',
        category: ['Thresholds & effects'],
        defaultValue: DEFAULT_OPTIONS.flashOnChange,
      })
      // ---- Target --------------------------------------------------------------
      .addBooleanSwitch({
        path: 'showTarget',
        name: 'Show target & delta',
        category: ['Target'],
        defaultValue: DEFAULT_OPTIONS.showTarget,
      })
      .addNumberInput({
        path: 'target',
        name: 'Target value',
        description: 'In the same unit as the value.',
        category: ['Target'],
        defaultValue: DEFAULT_OPTIONS.target,
        showIf: (c) => c.showTarget,
      })
      .addRadio({
        path: 'targetMode',
        name: 'Target mode',
        description: 'Pro-rated spreads the target over the dashboard time range and compares with where you should be by now.',
        category: ['Target'],
        defaultValue: DEFAULT_OPTIONS.targetMode,
        settings: {
          options: [
            { value: 'fixed', label: 'Fixed' },
            { value: 'prorated', label: 'Pro-rated' },
          ],
        },
        showIf: (c) => c.showTarget,
      })
      .addRadio({
        path: 'deltaFormat',
        name: 'Delta format',
        category: ['Target'],
        defaultValue: DEFAULT_OPTIONS.deltaFormat,
        settings: {
          options: [
            { value: 'absolute', label: 'Amount' },
            { value: 'percent', label: '%' },
            { value: 'both', label: 'Both' },
          ],
        },
        showIf: (c) => c.showTarget,
      })
      .addBooleanSwitch({
        path: 'lowerIsBetter',
        name: 'Lower is better',
        description: 'Flip the good/bad colours, e.g. for latency or error counts.',
        category: ['Target'],
        defaultValue: DEFAULT_OPTIONS.lowerIsBetter,
        showIf: (c) => c.showTarget,
      })
      .addBooleanSwitch({
        path: 'showProgress',
        name: 'Show progress bar',
        category: ['Target'],
        defaultValue: DEFAULT_OPTIONS.showProgress,
        showIf: (c) => c.showTarget,
      })
      // ---- Stale data ----------------------------------------------------------
      .addBooleanSwitch({
        path: 'showStale',
        name: 'Warn on stale data',
        description: 'Needs a time field in the data.',
        category: ['Stale data'],
        defaultValue: DEFAULT_OPTIONS.showStale,
      })
      .addNumberInput({
        path: 'staleMinutes',
        name: 'Stale after (minutes)',
        category: ['Stale data'],
        defaultValue: DEFAULT_OPTIONS.staleMinutes,
        settings: { min: 1, integer: true },
        showIf: (c) => c.showStale,
      });
  });
