import { PanelPlugin } from '@grafana/data';
import { SimpleOptions } from './types';
import { SimplePanel } from './components/SimplePanel';

export const plugin = new PanelPlugin<SimpleOptions>(SimplePanel).setPanelOptions((builder) => {
  return builder
    .addBooleanSwitch({
      path: 'showAdvancedOptions',
      name: 'Advanced Options',
      defaultValue: false,
    })
    .addRadio({
      path: 'animationType',
      defaultValue: 'undefined',
      name: 'Animation type',
      settings: {
        options: [
          {
            value: 'undefined',
            label: 'Odometer',
          },
          {
            value: 'count',
            label: 'Counter',
          },
        ],
      },
      showIf: (config) => config.showAdvancedOptions,
    })
});
