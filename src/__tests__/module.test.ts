jest.mock('react-odometerjs', () => ({ __esModule: true, default: () => null }));

import { migrateOptions, plugin } from '../module';
import { DEFAULT_OPTIONS, withDefaults } from '../types';

describe('migrateOptions', () => {
  it('moves the legacy decimals option to the standard field option', () => {
    const panel = { options: { decimals: 2, animationType: 'count' } as any, fieldConfig: { defaults: {} as any } };
    const out = migrateOptions(panel);
    expect(panel.fieldConfig.defaults.decimals).toBe(2);
    expect(out).not.toHaveProperty('decimals');
    expect(out.animationType).toBe('count');
  });

  it('does not overwrite decimals already set on the field', () => {
    const panel = { options: { decimals: 2 } as any, fieldConfig: { defaults: { decimals: 4 } } };
    migrateOptions(panel);
    expect(panel.fieldConfig.defaults.decimals).toBe(4);
  });

  it('maps the 1.0.0 animationType "undefined" to "odometer"', () => {
    const out = migrateOptions({ options: { animationType: 'undefined', duration: 3000 } as any });
    expect(out.animationType).toBe('odometer');
    expect(out.duration).toBe(3000);
  });

  it('maps an empty animationType to "odometer" but leaves valid values and absent keys alone', () => {
    expect(migrateOptions({ options: { animationType: null } as any }).animationType).toBe('odometer');
    expect(migrateOptions({ options: { animationType: 'count' } as any }).animationType).toBe('count');
    expect(migrateOptions({ options: { animationType: 'odometer' } as any }).animationType).toBe('odometer');
    expect(migrateOptions({ options: { duration: 100 } as any })).not.toHaveProperty('animationType');
  });

  it('migrates a complete 1.0.0 panel', () => {
    const panel = {
      options: { showAdvancedOptions: true, animationType: 'undefined' } as any,
      fieldConfig: { defaults: {} as any },
    };
    expect(migrateOptions(panel)).toEqual({ animationType: 'odometer' });
  });

  it('drops the legacy showAdvancedOptions flag and tolerates missing fieldConfig', () => {
    const out = migrateOptions({ options: { showAdvancedOptions: true, duration: 100 } as any });
    expect(out).toEqual({ duration: 100 });
    expect(migrateOptions({})).toEqual({});
  });
});

describe('withDefaults', () => {
  it('fills options missing from older dashboards', () => {
    expect(withDefaults({ animationType: 'count' })).toEqual({ ...DEFAULT_OPTIONS, animationType: 'count' });
    expect(withDefaults(undefined)).toEqual(DEFAULT_OPTIONS);
  });
});

describe('plugin', () => {
  it('registers the standard field config and a migration handler', () => {
    expect(plugin.meta).toBeDefined();
    expect(plugin.fieldConfigRegistry).toBeDefined();
    expect(typeof (plugin as any).onPanelMigration).toBe('function');
  });
});
