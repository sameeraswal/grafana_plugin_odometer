export type AnimationType = 'odometer' | 'count';

export interface SimpleOptions {
  showAdvancedOptions: boolean;
  animationType: AnimationType;
  /** Animation duration in milliseconds. */
  duration: number;
  /** Number of digits shown after the decimal point. */
  decimals: number;
}

export const DEFAULT_OPTIONS: SimpleOptions = {
  showAdvancedOptions: false,
  animationType: 'odometer',
  duration: 5000,
  decimals: 0,
};
