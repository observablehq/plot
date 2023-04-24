<script setup>

import * as Plot from "@observablehq/plot";
import * as d3 from "d3";
import * as topojson from "topojson-client";
import {computed, shallowRef, onMounted} from "vue";
import {poisson} from "../components/poisson.js";
import {octave, perlin2} from "../components/perlin.js";

const noise = octave(perlin2, 2);
const wind = shallowRef([{longitude: -9.875, latitude: 45.125}, {longitude: 9.875, latitude: 59.875}, {u: 0, v: 0}, {u: 0, v: 12.184501776503668}]);
const us = shallowRef(null);
const statemesh = computed(() => us.value ? topojson.mesh(us.value, us.value.objects.states) : {type: null});
const counties = computed(() => us.value ? topojson.feature(us.value, us.value.objects.counties).features : []);

onMounted(() => {
  d3.csv("../data/wind.csv", d3.autoType).then((data) => (wind.value = data));
  Promise.all([
    d3.json("../data/us-counties-10m.json"),
    d3.csv("../data/us-county-population.csv")
  ]).then(([_us, _population]) => {
    const map = new Map(_population.map((d) => [d.state + d.county, +d.population]));
    _us.objects.counties.geometries.forEach((g) => (g.properties.population = map.get(g.id)));
    us.value = _us;
  });
});

</script>

# Vector mark

The **vector mark** draws little arrows, typically positioned in **x** and **y** quantitative dimensions, with an optional magnitude (**length**) and direction (**rotate**), as in a vector field. For example, the chart below, based on a [LitVis example](https://github.com/gicentre/litvis/blob/main/examples/windVectors.md), shows wind speed and direction for a section of western Europe.

:::plot defer https://observablehq.com/@observablehq/plot-wind-map
```js
Plot.plot({
  inset: 10,
  aspectRatio: 1,
  color: {label: "Speed (m/s)", zero: true, legend: true},
  marks: [
    Plot.vector(wind, {
      x: "longitude",
      y: "latitude",
      rotate: ({u, v}) => Math.atan2(u, v) * 180 / Math.PI,
      length: ({u, v}) => Math.hypot(u, v),
      stroke: ({u, v}) => Math.hypot(u, v)
    })
  ]
})
```
:::

:::info
Regarding this data, [Remote Sensing Systems](https://www.remss.com/measurements/ccmp/) says: *“Standard U and V coordinates apply, meaning the positive U is to the right and positive V is above the axis. U and V are relative to true north. CCMP winds are expressed using the oceanographic convention, meaning a wind blowing toward the Northeast has a positive U component and a positive V component… Longitude is given in degrees East from 0.125 to 359.875 and latitude is given in degrees North with negative values representing southern locations.”*
:::

The **shape** option controls the vector’s appearance, while the **anchor** option positions the vector relative to its anchor point specified in **x** and **y**. The [spike constructor](#spike-data-options) sets the **shape** to *spike* and the **anchor** to *start*. For example, this can be used to produce a [spike map](https://observablehq.com/@observablehq/plot-spike) of U.S. county population.

:::plot defer https://observablehq.com/@observablehq/plot-spike-map-example
```js
Plot.plot({
  width: 688,
  projection: "albers-usa",
  length: {range: [0, 200]},
  style: "overflow: visible;",
  marks: [
    Plot.geo(statemesh, {strokeOpacity: 0.5}),
    Plot.spike(counties, Plot.geoCentroid({length: (d) => d.properties.population, stroke: "red"}))
  ]
})
```
:::

You can even implement a custom **shape** by supplying an object with a **draw** method. This method takes a *context* for drawing paths and the *length* of the vector. See the [moon phase calendar](https://observablehq.com/@observablehq/plot-phases-of-the-moon) for an example.

Lastly, here is an example showing a Perlin noise field, just because it’s pretty:

:::plot https://observablehq.com/@observablehq/plot-perlin-noise
```js
Plot.plot({
  inset: 6,
  width: 1024,
  aspectRatio: 1,
  axis: null,
  marks: [
    Plot.vector(poisson([0, 0, 2, 2], 4000), {
      length: ([x, y]) => (noise(x + 2, y) + 0.5) * 24,
      rotate: ([x, y]) => noise(x, y) * 360
    })
  ]
})
```
:::

This example uses a noise(*x*, *y*) function defined as:

```js
noise = octave(perlin2, 2)
```

See Mike Bostock’s [Perlin Noise](https://observablehq.com/@mbostock/perlin-noise) and [Poisson Disk Sampling](https://observablehq.com/@mbostock/poisson-disk-sampling) notebooks for source code.

## Vector options

In addition to the [standard mark options](../features/marks.md#mark-options), the following optional channels are supported:

* **x** - the horizontal position; bound to the *x* scale
* **y** - the vertical position; bound to the *y* scale
* **length** - the length in pixels; bound to the *length* scale; defaults to 12
* **rotate** - the rotation angle in degrees clockwise; defaults to 0

If either of the **x** or **y** channels are not specified, the corresponding position is controlled by the **frameAnchor** option.

The following constant options are also supported:

* **shape** - the shape of the vector; defaults to *arrow*
* **r** - a radius in pixels; defaults to 3.5
* **anchor** - one of *start*, *middle*, or *end*; defaults to *middle*
* **frameAnchor** - how to position the vector within the frame; defaults to *middle*

The **shape** option controls the visual appearance (path geometry) of the vector and supports the following values:

* *arrow* (default) - an arrow with head size proportional to its length
* *spike* - an isosceles triangle with open base
* any object with a **draw** method; it receives a *context*, *length*, and *radius*

If the **anchor** is *start*, the arrow will start at the given *xy* position and point in the direction given by the rotation angle. If the **anchor** is *end*, the arrow will maintain the same orientation, but be positioned such that it ends in the given *xy* position. If the **anchor** is *middle*, the arrow will be likewise be positioned such that its midpoint intersects the given *xy* position.

If the **x** channel is not specified, vectors will be horizontally centered in the plot (or facet). Likewise if the **y** channel is not specified, vectors will be vertically centered in the plot (or facet). Typically either *x*, *y*, or both are specified.

The **rotate** and **length** options can be specified as either channels or constants. When specified as a number, it is interpreted as a constant; otherwise it is interpreted as a channel. The length defaults to 12 pixels, and the rotate defaults to 0 degrees (pointing up↑). Vectors with a negative length will be drawn inverted. Positive angles proceed clockwise from noon.

The **stroke** defaults to *currentColor*. The **strokeWidth** defaults to 1.5, and the **strokeLinecap** defaults to *round*.

Vectors are drawn in input order, with the last data drawn on top. If sorting is needed, say to mitigate overplotting by drawing the smallest vectors on top, consider a [sort transform](../transforms/sort.md).

## vector(*data*, *options*)

```js
Plot.vector(wind, {x: "longitude", y: "latitude", length: "speed", rotate: "direction"})
```

Returns a new vector with the given *data* and *options*. If neither the **x** nor **y** options are specified, *data* is assumed to be an array of pairs [[*x₀*, *y₀*], [*x₁*, *y₁*], [*x₂*, *y₂*], …] such that **x** = [*x₀*, *x₁*, *x₂*, …] and **y** = [*y₀*, *y₁*, *y₂*, …].

## vectorX(*data*, *options*)

```js
Plot.vectorX(cars.map((d) => d["economy (mpg)"]))
```

Equivalent to [vector](#vector-data-options) except that if the **x** option is not specified, it defaults to the identity function and assumes that *data* = [*x₀*, *x₁*, *x₂*, …].

## vectorY(*data*, *options*)

```js
Plot.vectorY(cars.map((d) => d["economy (mpg)"]))
```

Equivalent to [vector](#vector-data-options) except that if the **y** option is not specified, it defaults to the identity function and assumes that *data* = [*y₀*, *y₁*, *y₂*, …].

## spike(*data*, *options*)

```js
Plot.spike(counties, Plot.geoCentroid({length: (d) => d.properties.population}))
```

Equivalent to [vector](#vector-data-options) except that the **shape** defaults to *spike*, the **stroke** defaults to *currentColor*, the **strokeWidth** defaults to 1, the **fill** defaults to **stroke**, the **fillOpacity** defaults to 0.3, and the **anchor** defaults to *start*.
