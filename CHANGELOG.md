# Changelog

## 1.2.0 (Unreleased)

- Added: themes (Car, Minimal, Digital, Light card) and a Digit style option (Classic, Uniform, Decimals) so all digits can share one colour scheme or the decimals can contrast.
- Added: use Grafana's standard Unit, Decimals, Thresholds, Value mappings, No value and Data links options. The old "Decimals" panel option is migrated automatically.
- Added: choose how a series is reduced (last, first, mean, total, min, max) and an optional thousands separator.
- Added: colour by thresholds, pulse when critical, flash on change.
- Added: typed target with delta (amount, percent or both), progress bar, pro-rated targets and "lower is better".
- Added: stale-data warning, sparkline and a grid layout with one odometer per numeric field.
- Removed: the "Advanced Options" switch; the animation settings are always visible.

## 1.1.1

- Fixed: replaced the direct CSS import with CSS-in-JS (Emotion), as required by the Grafana plugin review.
- Fixed: filled in the copyright holder and year in the LICENSE file.
- Changed: the odometer theme no longer loads a font from Google Fonts; it falls back to a system font.

## 1.1.0

- Fixed: animation option values; dashboards saved with the old value keep working.
- Fixed: the panel shows the latest numeric value and falls back to 0 when there is no data.
- Added: animation duration and decimal places options.
- Changed: the panel font scales with the panel size.
- Changed: updated to the latest Grafana plugin tooling (Grafana 12/13, React 19).

## 1.0.0

Initial release.
