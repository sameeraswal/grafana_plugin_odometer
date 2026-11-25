/**
 * Odometer themes. The structure rules are shared; each theme only adds visuals.
 * Colours come from the CSS variable --odo-accent (set from the field's thresholds when
 * "Color by thresholds" is on) with a sensible default per theme.
 *
 * "car" is adapted from HubSpot/odometer (MIT):
 * https://github.com/HubSpot/odometer/blob/master/themes/odometer-theme-car.css
 * Kept as strings and applied with Emotion's `css` because Grafana plugins must not
 * import .css files directly. No Google Fonts @import and no IE6/7 `*` hacks.
 */
import { ThemeName } from '../types';

const FONT = '"Arimo", "Helvetica Neue", Arial, sans-serif';

export const structuralCss = `
.odometer {
  display: inline-block;
  vertical-align: middle;
  position: relative;
}
.odometer .odometer-digit {
  display: inline-block;
  vertical-align: middle;
  position: relative;
}
.odometer .odometer-digit .odometer-digit-spacer {
  display: inline-block;
  vertical-align: middle;
  visibility: hidden;
}
.odometer .odometer-digit .odometer-digit-inner {
  text-align: left;
  display: block;
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  overflow: hidden;
}
.odometer .odometer-digit .odometer-ribbon {
  display: block;
}
.odometer .odometer-digit .odometer-ribbon-inner {
  display: block;
  -webkit-backface-visibility: hidden;
}
.odometer .odometer-digit .odometer-value {
  display: block;
  -webkit-transform: translateZ(0);
}
.odometer .odometer-digit .odometer-value.odometer-last-value {
  position: absolute;
}
.odometer.odometer-animating-up .odometer-ribbon-inner {
  -webkit-transition: -webkit-transform 2s;
  -moz-transition: -moz-transform 2s;
  -ms-transition: -ms-transform 2s;
  -o-transition: -o-transform 2s;
  transition: transform 2s;
}
.odometer.odometer-animating-up.odometer-animating .odometer-ribbon-inner {
  -webkit-transform: translateY(-100%);
  -moz-transform: translateY(-100%);
  -ms-transform: translateY(-100%);
  -o-transform: translateY(-100%);
  transform: translateY(-100%);
}
.odometer.odometer-animating-down .odometer-ribbon-inner {
  -webkit-transform: translateY(-100%);
  -moz-transform: translateY(-100%);
  -ms-transform: translateY(-100%);
  -o-transform: translateY(-100%);
  transform: translateY(-100%);
}
.odometer.odometer-animating-down.odometer-animating .odometer-ribbon-inner {
  -webkit-transition: -webkit-transform 2s;
  -moz-transition: -moz-transform 2s;
  -ms-transition: -ms-transform 2s;
  -o-transition: -o-transform 2s;
  transition: transform 2s;
  -webkit-transform: translateY(0);
  -moz-transform: translateY(0);
  -ms-transform: translateY(0);
  -o-transform: translateY(0);
  transform: translateY(0);
}
`;

const carCss = `
.odometer.odometer-theme-car {
  -moz-border-radius: 0.34em;
  -webkit-border-radius: 0.34em;
  border-radius: 0.34em;
  font-family: "Arimo", "Helvetica Neue", Arial, sans-serif;
  padding: 0.15em;
  background: var(--odo-accent, #000);
  color: #eee0d3;
}
.odometer.odometer-theme-car .odometer-digit {
  -moz-box-shadow: inset 0 0 0.3em rgba(0, 0, 0, 0.8);
  -webkit-box-shadow: inset 0 0 0.3em rgba(0, 0, 0, 0.8);
  box-shadow: inset 0 0 0.3em rgba(0, 0, 0, 0.8);
  background-image: url('data:image/svg+xml;base64,PD94bWwgdmVyc2lvbj0iMS4wIiBlbmNvZGluZz0idXRmLTgiPz4gPHN2ZyB2ZXJzaW9uPSIxLjEiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PGxpbmVhckdyYWRpZW50IGlkPSJncmFkIiBncmFkaWVudFVuaXRzPSJvYmplY3RCb3VuZGluZ0JveCIgeDE9IjAuNSIgeTE9IjAuMCIgeDI9IjAuNSIgeTI9IjEuMCI+PHN0b3Agb2Zmc2V0PSIwJSIgc3RvcC1jb2xvcj0iIzMzMzMzMyIvPjxzdG9wIG9mZnNldD0iNDAlIiBzdG9wLWNvbG9yPSIjMzMzMzMzIi8+PHN0b3Agb2Zmc2V0PSI2MCUiIHN0b3AtY29sb3I9IiMxMDEwMTAiLz48c3RvcCBvZmZzZXQ9IjgwJSIgc3RvcC1jb2xvcj0iIzMzMzMzMyIvPjxzdG9wIG9mZnNldD0iMTAwJSIgc3RvcC1jb2xvcj0iIzMzMzMzMyIvPjwvbGluZWFyR3JhZGllbnQ+PC9kZWZzPjxyZWN0IHg9IjAiIHk9IjAiIHdpZHRoPSIxMDAlIiBoZWlnaHQ9IjEwMCUiIGZpbGw9InVybCgjZ3JhZCkiIC8+PC9zdmc+IA==');
  background-size: 100%;
  background-image: -webkit-gradient(linear, 50% 0%, 50% 100%, color-stop(0%, #333333), color-stop(40%, #333333), color-stop(60%, #101010), color-stop(80%, #333333), color-stop(100%, #333333));
  background-image: -moz-linear-gradient(top, #333333 0%, #333333 40%, #101010 60%, #333333 80%, #333333 100%);
  background-image: -webkit-linear-gradient(top, #333333 0%, #333333 40%, #101010 60%, #333333 80%, #333333 100%);
  background-image: linear-gradient(to bottom, #333333 0%, #333333 40%, #101010 60%, #333333 80%, #333333 100%);
  padding: 0 0.15em;
}
.odometer.odometer-theme-car .odometer-digit:first-child {
  -moz-border-radius: 0.2em 0 0 0.2em;
  -webkit-border-radius: 0.2em;
  border-radius: 0.2em 0 0 0.2em;
}
.odometer.odometer-theme-car .odometer-digit:last-child {
  -moz-border-radius: 0 0.2em 0.2em 0;
  -webkit-border-radius: 0;
  border-radius: 0 0.2em 0.2em 0;
  background-image: url('data:image/svg+xml;base64,PD94bWwgdmVyc2lvbj0iMS4wIiBlbmNvZGluZz0idXRmLTgiPz4gPHN2ZyB2ZXJzaW9uPSIxLjEiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PGxpbmVhckdyYWRpZW50IGlkPSJncmFkIiBncmFkaWVudFVuaXRzPSJvYmplY3RCb3VuZGluZ0JveCIgeDE9IjAuNSIgeTE9IjAuMCIgeDI9IjAuNSIgeTI9IjEuMCI+PHN0b3Agb2Zmc2V0PSIwJSIgc3RvcC1jb2xvcj0iI2VlZTBkMyIvPjxzdG9wIG9mZnNldD0iNDAlIiBzdG9wLWNvbG9yPSIjZWVlMGQzIi8+PHN0b3Agb2Zmc2V0PSI2MCUiIHN0b3AtY29sb3I9IiNiYmFhOWEiLz48c3RvcCBvZmZzZXQ9IjgwJSIgc3RvcC1jb2xvcj0iI2VlZTBkMyIvPjxzdG9wIG9mZnNldD0iMTAwJSIgc3RvcC1jb2xvcj0iI2VlZTBkMyIvPjwvbGluZWFyR3JhZGllbnQ+PC9kZWZzPjxyZWN0IHg9IjAiIHk9IjAiIHdpZHRoPSIxMDAlIiBoZWlnaHQ9IjEwMCUiIGZpbGw9InVybCgjZ3JhZCkiIC8+PC9zdmc+IA==');
  background-size: 100%;
  background-image: -webkit-gradient(linear, 50% 0%, 50% 100%, color-stop(0%, #eee0d3), color-stop(40%, #eee0d3), color-stop(60%, #bbaa9a), color-stop(80%, #eee0d3), color-stop(100%, #eee0d3));
  background-image: -moz-linear-gradient(top, #eee0d3 0%, #eee0d3 40%, #bbaa9a 60%, #eee0d3 80%, #eee0d3 100%);
  background-image: -webkit-linear-gradient(top, #eee0d3 0%, #eee0d3 40%, #bbaa9a 60%, #eee0d3 80%, #eee0d3 100%);
  background-image: linear-gradient(to bottom, #eee0d3 0%, #eee0d3 40%, #bbaa9a 60%, #eee0d3 80%, #eee0d3 100%);
  background-color: #eee0d3;
  color: #000;
}
.odometer.odometer-theme-car .odometer-digit .odometer-digit-inner {
  left: 0.15em;
}
.odometer.odometer-theme-car.odometer-animating-up .odometer-ribbon-inner, .odometer.odometer-theme-car.odometer-animating-down.odometer-animating .odometer-ribbon-inner {
  -webkit-transition-timing-function: linear;
  -moz-transition-timing-function: linear;
  -ms-transition-timing-function: linear;
  -o-transition-timing-function: linear;
  transition-timing-function: linear;
}
`;

const minimalCss = `
.odometer.odometer-theme-minimal {
  font-family: ${FONT};
  color: var(--odo-accent, inherit);
  line-height: 1;
}
.odometer.odometer-theme-minimal .odometer-digit {
  padding: 0 0.02em;
}
.odometer.odometer-theme-minimal .odometer-digit .odometer-digit-inner {
  left: 0.02em;
}
`;

const digitalCss = `
.odometer.odometer-theme-digital {
  font-family: "Courier New", Courier, monospace;
  background: #050805;
  color: var(--odo-accent, #39ff14);
  padding: 0.12em 0.16em;
  border-radius: 0.14em;
  text-shadow: 0 0 0.22em currentColor;
  box-shadow: inset 0 0 0.4em rgba(0, 0, 0, 0.9);
}
.odometer.odometer-theme-digital .odometer-digit {
  padding: 0 0.05em;
}
.odometer.odometer-theme-digital .odometer-digit .odometer-digit-inner {
  left: 0.05em;
}
`;

const lightCss = `
.odometer.odometer-theme-light {
  font-family: ${FONT};
  background: #ffffff;
  color: var(--odo-accent, #111111);
  padding: 0.08em 0.14em;
  border-radius: 0.2em;
  box-shadow: 0 0.03em 0.18em rgba(0, 0, 0, 0.3);
}
.odometer.odometer-theme-light .odometer-digit {
  padding: 0 0.06em;
  border-right: 1px solid rgba(0, 0, 0, 0.08);
}
.odometer.odometer-theme-light .odometer-digit:last-child {
  border-right: 0;
}
.odometer.odometer-theme-light .odometer-digit .odometer-digit-inner {
  left: 0.06em;
}
`;

export const THEME_CSS: Record<ThemeName, string> = {
  car: carCss,
  minimal: minimalCss,
  digital: digitalCss,
  light: lightCss,
};

/** Shared structure + the chosen theme's visuals (falls back to "car" for unknown names). */
export function getThemeCss(theme: ThemeName | string | undefined): string {
  return structuralCss + (THEME_CSS[theme as ThemeName] ?? THEME_CSS.car);
}
