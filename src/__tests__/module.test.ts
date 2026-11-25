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
