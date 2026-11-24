import { PanelPlugin } from '@grafana/data';
import { DEFAULT_OPTIONS, SimpleOptions } from './types';
import { SimplePanel } from './components/SimplePanel';

export const plugin = new PanelPlugin<SimpleOptions>(SimplePanel).setPanelOptions((builder) => {
  return builder
    .addBooleanSwitch({
      path: 'showAdvancedOptions',
      name: 'Advanced Options',
      defaultValue: DEFAULT_OPTIONS.showAdvancedOptions,
    })
    .addRadio({
      path: 'animationType',
      defaultValue: DEFAULT_OPTIONS.animationType,
      name: 'Animation type',
      settings: {
        options: [
          { value: 'odometer', label: 'Odometer' },
          { value: 'count', label: 'Counter' },
        ],
      },
      showIf: (config) => config.showAdvancedOptions,
    })
    .addNumberInput({
      path: 'duration',
      name: 'Animation duration (ms)',
      defaultValue: DEFAULT_OPTIONS.duration,
      settings: { min: 0, integer: true },
      showIf: (config) => config.showAdvancedOptions,
    })
    .addNumberInput({
      path: 'decimals',
      name: 'Decimal places',
      defaultValue: DEFAULT_OPTIONS.decimals,
      settings: { min: 0, max: 10, integer: true },
      showIf: (config) => config.showAdvancedOptions,
    });
});
