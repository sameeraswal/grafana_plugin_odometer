import { readFileSync, readdirSync, statSync } from 'fs';
import { join } from 'path';
import { odometerCss } from '../components/odometerStyles';

describe('odometerCss', () => {
  it('contains the car theme rules', () => {
    expect(odometerCss).toContain('.odometer.odometer-theme-car');
    expect(odometerCss).toContain('.odometer-digit');
    expect(odometerCss).toContain('.odometer-ribbon-inner');
  });

  it('does not pull in external resources or IE-only hacks', () => {
    expect(odometerCss).not.toContain('@import');
    expect(odometerCss).not.toContain('fonts.googleapis.com');
    expect(odometerCss).not.toMatch(/^\s*\*[a-z-]+:/m);
  });

  it('has balanced braces', () => {
    const open = (odometerCss.match(/{/g) ?? []).length;
    const close = (odometerCss.match(/}/g) ?? []).length;
    expect(open).toBe(close);
    expect(open).toBeGreaterThan(0);
  });
});

describe('source rules required by Grafana plugin review', () => {
  const walk = (dir: string): string[] =>
    readdirSync(dir).flatMap((name) => {
      const p = join(dir, name);
      if (name === '__tests__') {
        return [];
      }
      return statSync(p).isDirectory() ? walk(p) : [p];
    });

  it('has no .css files and no direct CSS imports in src', () => {
    const files = walk(join(__dirname, '..'));
    expect(files.filter((f) => f.endsWith('.css'))).toEqual([]);
    const offenders = files
      .filter((f) => /\.(ts|tsx)$/.test(f))
      .filter((f) => /import\s+['"][^'"]+\.(css|scss|sass)['"]/.test(readFileSync(f, 'utf8')));
    expect(offenders).toEqual([]);
  });
});
