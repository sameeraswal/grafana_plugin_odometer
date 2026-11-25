export type AnimationType = 'odometer' | 'count';
export type DigitStyle = 'classic' | 'uniform' | 'decimals';
export type ThemeName = 'car' | 'minimal' | 'digital' | 'light';
export type ReducerOption = 'lastNotNull' | 'last' | 'first' | 'mean' | 'sum' | 'min' | 'max';
export type LayoutMode = 'single' | 'grid';
export type TargetMode = 'fixed' | 'prorated';
export type DeltaFormat = 'absolute' | 'percent' | 'both';

export interface SimpleOptions {
  /** Legacy (<=1.1.x): gated the animation options. Kept so saved dashboards still load. */
  showAdvancedOptions?: boolean;
  /** Legacy (<=1.1.x): now the standard "Decimals" field option. Migrated on load. */
  decimals?: number;

  // Display
  layout: LayoutMode;
  reduce: ReducerOption;
  theme: ThemeName;
  /** classic: theme default (car highlights the last digit); uniform: all digits alike; decimals: digits after the decimal point contrast. */
  digitStyle: DigitStyle;
  thousandsSeparator: boolean;
  showSparkline: boolean;

  // Animation
  animationType: AnimationType;
  /** Animation duration in milliseconds. */
  duration: number;

  // Thresholds & effects
  colorByThresholds: boolean;
  pulseWhenCritical: boolean;
  flashOnChange: boolean;

  // Target
  showTarget: boolean;
  target: number;
  targetMode: TargetMode;
  deltaFormat: DeltaFormat;
  lowerIsBetter: boolean;
  showProgress: boolean;

  // Stale data
  showStale: boolean;
  staleMinutes: number;
}

export const DEFAULT_OPTIONS: SimpleOptions = {
  layout: 'single',
  reduce: 'lastNotNull',
  theme: 'car',
  digitStyle: 'classic',
  thousandsSeparator: false,
  showSparkline: false,

  animationType: 'odometer',
  duration: 5000,

  colorByThresholds: false,
  pulseWhenCritical: false,
  flashOnChange: false,

  showTarget: false,
  target: 0,
  targetMode: 'fixed',
  deltaFormat: 'absolute',
  lowerIsBetter: false,
  showProgress: true,

  showStale: false,
  staleMinutes: 15,
};

/** Fills in defaults for options missing from older saved dashboards. */
export function withDefaults(options: Partial<SimpleOptions> | undefined): SimpleOptions {
  return { ...DEFAULT_OPTIONS, ...(options ?? {}) };
}
