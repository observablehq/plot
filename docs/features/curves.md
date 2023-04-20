<script setup>

import * as Plot from "@observablehq/plot";
import * as d3 from "d3";
import {ref} from "vue";

const curve = ref("catmull-rom");
const numbers = d3.range(20).map(d3.randomLcg(42));

</script>

# Curves

A curve defines how to turn a discrete representation of a line as a sequence of points [[*x₀*, *y₀*], [*x₁*, *y₁*], [*x₂*, *y₂*], …] into a continuous path; *i.e.*, how to interpolate between points. Curves are used by the [line](../marks/line.md), [area](../marks/area.md), and [link](../marks/link.md) marks, and are implemented by [d3-shape](https://github.com/d3/d3-shape/blob/main/README.md#curves).

<p>
  <label class="label-input">
    Curve:
    <select v-model="curve">
      <option>basis</option>
      <option>basis-open</option>
      <option>basis-closed</option>
      <option>bump-x</option>
      <option>bump-y</option>
      <option>bundle</option>
      <option>cardinal</option>
      <option>cardinal-open</option>
      <option>cardinal-closed</option>
      <option>catmull-rom</option>
      <option>catmull-rom-open</option>
      <option>catmull-rom-closed</option>
      <option>linear</option>
      <option>linear-closed</option>
      <option>monotone-x</option>
      <option>monotone-y</option>
      <option>natural</option>
      <option>step</option>
      <option>step-after</option>
      <option>step-before</option>
    </select>
  </label>
</p>

:::plot
```js-vue
Plot.plot({
  marks: [
    Plot.lineY(numbers, {curve: "{{curve}}"}),
    Plot.dotY(numbers, {x: (d, i) => i})
  ]
})
```
:::

The supported curve options are:

* **curve** - the curve method, either a string or a function
* **tension** - the curve tension (for fine-tuning)

The following named curve methods are supported:

* *basis* - a cubic basis spline (repeating the end points)
* *basis-open* - an open cubic basis spline
* *basis-closed* - a closed cubic basis spline
* *bump-x* - a Bézier curve with horizontal tangents
* *bump-y* - a Bézier curve with vertical tangents
* *bundle* - a straightened cubic basis spline (suitable for lines only, not areas)
* *cardinal* - a cubic cardinal spline (with one-sided differences at the ends)
* *cardinal-open* - an open cubic cardinal spline
* *cardinal-closed* - an closed cubic cardinal spline
* *catmull-rom* - a cubic Catmull–Rom spline (with one-sided differences at the ends)
* *catmull-rom-open* - an open cubic Catmull–Rom spline
* *catmull-rom-closed* - a closed cubic Catmull–Rom spline
* *linear* - a piecewise linear curve (*i.e.*, straight line segments)
* *linear-closed* - a closed piecewise linear curve (*i.e.*, straight line segments)
* *monotone-x* - a cubic spline that preserves monotonicity in *x*
* *monotone-y* - a cubic spline that preserves monotonicity in *y*
* *natural* - a natural cubic spline
* *step* - a piecewise constant function where *y* changes at the midpoint of *x*
* *step-after* - a piecewise constant function where *y* changes after *x*
* *step-before* - a piecewise constant function where *x* changes after *y*
* *auto* - like *linear*, but use the (possibly spherical) [projection](./projections.md), if any

If **curve** is a function, it will be invoked with a given *context* in the same fashion as a [D3 curve factory](https://github.com/d3/d3-shape/blob/main/README.md#custom-curves). The *auto* curve is only available for the [line mark](../marks/line.md) and [link mark](../marks/link.md) and is typically used in conjunction with a spherical [projection](./projections.md) to interpolate along [geodesics](https://en.wikipedia.org/wiki/Geodesic).

The tension option only has an effect on bundle, cardinal and Catmull–Rom splines (*bundle*, *cardinal*, *cardinal-open*, *cardinal-closed*, *catmull-rom*, *catmull-rom-open*, and *catmull-rom-closed*). For bundle splines, it corresponds to [beta](https://github.com/d3/d3-shape/blob/main/README.md#curveBundle_beta); for cardinal splines, [tension](https://github.com/d3/d3-shape/blob/main/README.md#curveCardinal_tension); for Catmull–Rom splines, [alpha](https://github.com/d3/d3-shape/blob/main/README.md#curveCatmullRom_alpha).
