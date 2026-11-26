# Odometer

A Grafana panel that shows a number as an animated odometer (rolling digits) or counter. It adds a lively element to dashboards: numbers roll to their new value like the digits of a mechanical meter.

## Features

- **Two animations:** *Odometer* (rolling digits) or *Counter* (counts up or down), with a configurable duration.
- **Four themes:** Car (white on black), Light card (black on white), Digital (LED) and Minimal (no frame).
- **Digit style:** Classic, *Uniform* (every digit looks the same, like a plain counter) or *Decimals* (digits after the decimal point use the contrasting colours, e.g. 49.5 shows the 5 in contrast).
- **Units, decimals and "No value"** from Grafana's standard options, plus an optional thousands separator.
- **Value reduction:** show the last, first, mean, total, min or max of a series.
- **Thresholds to colour:** tint the odometer by the standard Thresholds / Color scheme options, optionally pulsing while the value is in the highest (critical) range. Value mappings can show text such as "OK" or "Down".
- **Target and delta:** type in a target and see the difference as an amount, a percentage or both, with a progress bar and good/bad colouring ("lower is better" supported). A *pro-rated* target compares you with where you should be by now, across the dashboard time range.
- **Stale data warning** when no new data has arrived for a number of minutes.
- **Flash on change**, a **sparkline** under the value, and Grafana **data links**.
- **Grid layout:** one odometer per numeric field.

Every feature has its own switch in the panel options, and all are off by default except the basics, so existing dashboards look the same.

## Usage

1. Add a panel and choose the **Odometer** visualization.
2. Pick a data source and a query that returns a numeric field.
3. Use the **Display**, **Animation**, **Thresholds & effects**, **Target** and **Stale data** option groups. The standard Unit, Decimals, Thresholds, Value mappings and Data links options work as in other panels.

## Notes

- Targets are typed in the same unit as the value.
- The stale-data warning needs a time field in the query result.
- Alerts themselves are created with Grafana alert rules on the same query; use the same numbers as the panel's thresholds so the colours match.
