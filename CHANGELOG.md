# Observable Plot - Changelog

Year: **Current** · [2025](./CHANGELOG-2025.md) · [2024](./CHANGELOG-2024.md) · [2023](./CHANGELOG-2023.md) · [2022](./CHANGELOG-2022.md) · [2021](./CHANGELOG-2021.md)

## 0.6.18

[Released November 3, 2026.](https://github.com/observablehq/plot/releases/tag/v0.6.18)

The [area mark](https://observablehq.com/plot/marks/area) now supports a **line** option: when true, a stroked line is drawn on top of the filled area, removing the need for a separate line mark and allowing lines and areas to interleave as in the ridgeline plot below; when **line** is true, **fillOpacity** defaults to 0.3 and stroke options (**strokeWidth**, *etc.*) apply only to the line.

<img src="./img/ridgeline.png" width="928" alt="a ridgeline plot of traffic patterns by location, with stroked lines on top of filled areas">

```js
Plot.plot({
  height: 300,
  marks: [
    Plot.areaY(traffic, {
      x: "date",
      y: "vehicles",
      fy: "location",
      fill: "#eee",
      line: true,
      fillOpacity: 1,
      curve: "basis"
    })
  ]
})
```

The [raster mark](https://observablehq.com/plot/marks/raster) now supports a **colorSpace** option, allowing interpolation in wide-gamut color spaces such as *display-p3*. For example, the raster plot of penguin body mass vs. flipper length below encodes the *island* channel with vivid P3 colors:

<img src="./img/raster-p3.png" width="640" alt="three clusters of penguins rendered as blurred color fields in vivid lime, orange, and violet">

```js
Plot.plot({
  color: {range: ["oklch(90% 0.4 135)", "oklch(75% 0.3 55)", "oklch(65% 0.35 305)"]},
  marks: [
    Plot.raster(penguins, {
      x: "body_mass_g",
      y: "flipper_length_mm",
      fill: "island",
      interpolate: "random-walk",
      blur: 8,
      colorSpace: "display-p3"
    })
  ]
})
```

[Pointer tips](https://observablehq.com/plot/interactions/pointer) are now exclusive by default: when multiple pointer-driven marks overlap, only the point closest to the pointer is shown. This prevents overlapping tips by default. Pointer exclusivity is controlled by the new **pool** [mark option](https://observablehq.com/plot/features/marks#mark-options), which defaults to true for tip marks; set **pool** to false to restore the previous (non-exclusive) behavior.

The new top-level [**legend** plot option](https://observablehq.com/plot/features/legends) provides a convenient shorthand for requesting a legend for all scales that support them (such as *color* and *symbol*).

```js
Plot.plot({
  legend: true,
  color: {type: "ordinal", domain: "ABCDEFGHIJ"},
  marks: [Plot.cellX("ABCDEFGHIJ")]
})
```

The [*plot*.scale method](https://observablehq.com/plot/features/plots#plot_scale) can now be passed *projection* to return the plot’s [materialized projection](https://observablehq.com/plot/features/projections#materialized-projection), allowing advanced uses. The returned object supports *apply* and *invert* for converting between geographic and pixel coordinates, and can be passed as the **projection** option of another plot.

```js
const plot1 = Plot.plot({projection: "mercator", marks: [Plot.graticule()]});
const projection = plot1.scale("projection");
const plot2 = Plot.plot({projection, marks: [Plot.geo(countries)]}));
display(projection.apply([-1.55, 47.22])); // [316.7, 224.2]
```

The [*opacity* scale](https://observablehq.com/plot/features/scales) and associated legend now support *ordinal* and *threshold* types.

```js
Plot.plot({
  opacity: {
    type: "threshold", 
    legend: true, 
    domain: [2, 5, 8], 
    range: [0.2, 0.4, 0.6, 0.8]
  },
  marks: [
    Plot.cellX(d3.range(10), {fill: "red", opacity: Plot.identity})
  ]
})
```

Plot now supports the [`light-dark(…)` CSS color syntax](https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/Values/color_value/light-dark) for defining colors that adapt to the user’s preferred color scheme. Color and opacity legends also render correctly with `light-dark(…)`, `currentColor`, and P3 colors.

```js
Plot.barX(alphabet, {x: "frequency", y: "letter", fill: "light-dark(steelblue, orange)"})
```

Plot is now published to npm as a bundled ES module (`dist/plot.js`, and minified as `dist/plot.min.js`) instead of unbundled source files. The package now declares `sideEffects: false`, which lets bundlers remove unused code and lets [esm.sh](https://esm.sh) bundle Plot more efficiently. The UMD bundle (`dist/plot.umd.min.js`) is unchanged.

This release includes several more bug fixes and improvements:

The [tick format](https://observablehq.com/plot/features/scales) now defaults to a comma-less format when tick values are likely year integers.

<img src="./img/axisYears.png" width="640" alt="before and after comparison of year tick labels, showing commas removed">

The [stack transform](https://observablehq.com/plot/transforms/stack) now preserves NaN values instead of coercing them to zero. The [dodge transform](https://observablehq.com/plot/transforms/dodge) no longer crashes when the radius is negative. The [area mark](https://observablehq.com/plot/marks/area) now respects the **reduce** option when using the [interval transform](https://observablehq.com/plot/transforms/interval).

For line and area marks, the *z* channel now defaults to null when the color channel is redundant with the position channel (*e.g.*, `lineY(data, {y: "value", stroke: "value"})`), preventing the line from being split into single-point series. The default offset in windowless environments (*e.g.* server-side rendering) is now zero, prioritizing high-density displays. The default colors for the [box mark](https://observablehq.com/plot/marks/box) and [tree transform](https://observablehq.com/plot/transforms/tree) now support dark mode.

The [tip mark](https://observablehq.com/plot/marks/tip) no longer crashes when the title channel contains null; it now ignores the contours channel and literal symbols; and the tip arrow is smaller when using a corner anchor. [Markers](https://observablehq.com/plot/features/markers) no longer inherit `strokeDasharray`. The [pointer transform](https://observablehq.com/plot/interactions/pointer) now allows `pointerdown` event propagation.

The type definitions of the [mark classes](https://observablehq.com/plot/features/marks) (`Plot.Rect`, `Plot.Dot`, `Plot.Line`, *etc.*) now declare constructors and the **render** method method, avoiding a type error when extending a built-in mark and calling `super.render()`. For example, this subclass of the rect mark rotates each rectangle:

[<img src="./img/rect-rotate.png" width="330" alt="ten rounded squares in different colors, each rotated 10° more than the previous one, with an arrow showing the rotation">](https://observablehq.com/@observablehq/plot-extend-mark)

```ts
class RotatedRect extends Plot.Rect {
  render(...args: Parameters<Plot.Rect["render"]>) {
    const g = super.render(...args);
    let i = 0;
    for (const rect of g?.querySelectorAll("rect") ?? []) {
      const x = +rect.getAttribute("x")! + +rect.getAttribute("width")! / 2;
      const y = +rect.getAttribute("y")! + +rect.getAttribute("height")! / 2;
      rect.setAttribute("transform", `rotate(${i++ * 10}, ${x}, ${y})`);
    }
    return g;
  }
}
```

Various type fixes and documentation improvements; thanks @gka and @jsoref!

---

For earlier changes, continue to the [2025 CHANGELOG](./CHANGELOG-2025.md).
