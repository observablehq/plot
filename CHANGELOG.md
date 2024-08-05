# Observable Plot - Changelog

Year: **Current (2024)** · [2023](./CHANGELOG-2023.md) · [2022](./CHANGELOG-2022.md) · [2021](./CHANGELOG-2021.md)

## 0.6.16

[Released August TK, 2024.](https://github.com/observablehq/plot/releases/tag/v0.6.16)

Add waffle mark. 🧇

Add support for Apache Arrow as native data, improving performance and shorthand. Fix detection of date columns with Apache Arrow data.

Add support for GeoJSON data and GeoJSON property shorthand to all marks.

Add support for the tip option to the geo mark (via an implicit centroid transform)

Add per-side and per-corner rounding options (r, rx1, ry1, etc.) to rect-like marks.

Improve the default plot height when a projection domain is set.

Fix marker options on lines with variable aesthetics.

## 0.6.15

[Released June 11, 2024.](https://github.com/observablehq/plot/releases/tag/v0.6.15)

## 0.6.14

[Released March 12, 2024.](https://github.com/observablehq/plot/releases/tag/v0.6.14)

Changes the default categorical color scheme to *Observable10*.

The group transform now preserves the input order of groups by default, making it easier to sort groups by using the **sort** option. The group and bin transforms now support the *z* reducer.

Improves the accessibility of axes by hidding tick marks and grid lines from the accessibility tree.

Upgrades D3 to 7.9.0.

---

For earlier changes, continue to the [2023 CHANGELOG](./CHANGELOG-2023.md).
