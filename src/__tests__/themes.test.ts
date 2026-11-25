import { readFileSync, readdirSync, statSync } from 'fs';
import { join } from 'path';
import { getThemeCss, structuralCss, THEME_CSS } from '../components/themes';

describe('themes', () => {
  it('has the shared structure rules', () => {
    expect(structuralCss).toContain('.odometer .odometer-digit');
    expect(structuralCss).toContain('.odometer-ribbon-inner');
  });

  it.each(Object.keys(THEME_CSS))('%s theme is scoped to its own class', (name) => {
    expect(THEME_CSS[name as keyof typeof THEME_CSS]).toContain(`.odometer.odometer-theme-${name}`);
  });

  it('every theme uses the accent variable', () => {
    for (const css of Object.values(THEME_CSS)) {
      expect(css).toContain('var(--odo-accent');
    }
  });

  it('combines structure and theme, falling back to car for unknown names', () => {
    expect(getThemeCss('digital')).toContain(structuralCss);
    expect(getThemeCss('digital')).toContain('odometer-theme-digital');
    expect(getThemeCss('nope')).toContain('odometer-theme-car');
    expect(getThemeCss(undefined)).toContain('odometer-theme-car');
  });

  it('does not pull in external resources or IE-only hacks', () => {
    for (const css of [structuralCss, ...Object.values(THEME_CSS)]) {
      expect(css).not.toContain('@import');
      expect(css).not.toContain('fonts.googleapis.com');
      expect(css).not.toContain('odometer-auto-theme');
      expect(css).not.toMatch(/^\s*\*[a-z-]+:/m);
      expect((css.match(/{/g) ?? []).length).toBe((css.match(/}/g) ?? []).length);
    }
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
