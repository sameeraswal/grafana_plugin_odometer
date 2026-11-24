# Changelog

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
