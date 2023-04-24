<script setup>

import * as Plot from "@observablehq/plot";
import * as d3 from "d3";
import * as topojson from "topojson-client";
import {computed, ref, shallowRef, onMounted} from "vue";
import {useDark} from "../components/useDark.js";

const longitude = ref(90);
const radius = ref(30);
const circle = computed(() => d3.geoCircle().center([9, 34]).radius(radius.value).precision(2)());
const projection = ref("equirectangular");
const dark = useDark();
const westport = shallowRef({type: null});
const earthquakes = shallowRef([]);
const walmarts = shallowRef([]);
const world = shallowRef(null);
const land = computed(() => world.value ? topojson.feature(world.value, world.value.objects.land) : {type: null});
const us = shallowRef(null);
const nation = computed(() => us.value ? topojson.feature(us.value, us.value.objects.nation) : {type: null});
const statemesh = computed(() => us.value ? topojson.mesh(us.value, us.value.objects.states, (a, b) => a !== b) : {type: null});

onMounted(() => {
  d3.json("https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/2.5_week.geojson").then((data) => (earthquakes.value = data.features.map((f) => ({longitude: f.geometry.coordinates[0], latitude: f.geometry.coordinates[1], magnitude: f.properties.mag}))));
  d3.json("../data/countries-110m.json").then((data) => (world.value = data));
  d3.tsv("../data/walmarts.tsv", d3.autoType).then((data) => (walmarts.value = data));
  d3.json("../data/westport-house.json").then((data) => (westport.value = data));
  d3.json("../data/us-counties-10m.json").then((data) => (us.value = data));
});

</script>

# Projections

:::danger TODO
This guide is still under construction. 🚧 Please come back when it’s finished.
:::

A **projection** maps abstract coordinates in *x* and *y* to pixel positions on screen. Most often, abstract coordinates are spherical (degrees longitude and latitude), as when rendering a geographic map. For example, below we show earthquakes in the last seven days with a magnitude of 2.5 or higher as reported by the [USGS](https://earthquake.usgs.gov/earthquakes/feed/v1.0/geojson.php). Use the slider to adjust the *orthographic* projection’s center of longitude.

<p>
  <label class="label-input">
    Longitude:
    <input type="range" v-model.number="longitude" min="-180" max="180" step="1">
    <span style="font-variant-numeric: tabular-nums;">{{longitude}}°</span>
  </label>
</p>

:::plot defer
```js
Plot.plot({
  style: "overflow: visible;",
  projection: {type: "orthographic", rotate: [-longitude, -30]},
  r: {transform: (d) => Math.pow(10, d)}, // Richter scale
  marks: [
    Plot.sphere(),
    Plot.geo(land, {fill: "currentColor", fillOpacity: 0.2}),
    Plot.dot(earthquakes, {x: "longitude", y: "latitude", r: "magnitude", stroke: "red", fill: "red", fillOpacity: 0.2})
  ]
})
```
:::

Above, a [geo mark](../marks/geo.md) draws polygons representing land and a [sphere mark](../marks/geo.md#sphere-options) draws the outline of the globe. A [dot mark](../marks/dot.md) draws earthquakes as circles sized by magnitude.

While the geo mark is “projection aware” so that it can handle all the nuances of projecting spherical polygons to the screen—leaning on [d3-geo](https://github.com/d3/d3-geo) to provide [adaptive sampling](https://observablehq.com/@d3/adaptive-sampling) with configurable precision, [antimeridian cutting](https://observablehq.com/@d3/antimeridian-cutting), and clipping—the dot mark is not. Instead, Plot applies the projection in place of the *x* and *y* scales. This means that each mark implementation decides whether to handle projections specially or to treat the projection as any other position scale. (For example, the [line mark](../marks/line.md) is also projection-aware.)

:::info
Marks that require *band* scales (bars, cells, and ticks) cannot be used with projections. Likewise one-dimensional marks such as rules cannot be used, though see [#1164](https://github.com/observablehq/plot/issues/1164).
:::

Plot provides a variety of built-in projections. And as above, all world projections can be rotated to show a different aspect.

<p>
  <label class="label-input">
    Projection:
    <select v-model="projection">
      <!-- <option>albers-usa</option> -->
      <option>albers</option>
      <option>azimuthal-equal-area</option>
      <option>azimuthal-equidistant</option>
      <!-- <option>conic-conformal</option> -->
      <option>conic-equal-area</option>
      <option>conic-equidistant</option>
      <option>equal-earth</option>
      <option>equirectangular</option>
      <option>gnomonic</option>
      <!-- <option>identity</option> -->
      <!-- <option>reflect-y</option> -->
      <option>mercator</option>
      <option>orthographic</option>
      <option>stereographic</option>
      <option>transverse-mercator</option>
    </select>
  </label>
</p>

:::plot defer
```js-vue
Plot.plot({
  projection: "{{projection}}",
  marks: [
    Plot.graticule(),
    Plot.geo(land, {fill: "currentColor"}),
    Plot.sphere()
  ]
})
```
:::

Why so many? Each projection has its strengths and weaknesses:

- _conformal_ projections preserve angles and local shape,
- _equal-area_ projections preserve area (use these for choropleths),
- _equidistant_ projections preserve distance from one (or two) points,
- _azimuthal_ projections expand radially from a central feature,
- _cylindrical_ projections have symmetry around the axis of rotation,
- the _stereographic_ projection preserves circles, and
- the _gnomonic_ projection displays all great circles as straight lines!

No single projection is the best at everything. It is impossible, for example, for a projection to be both conformal and equal-area.

In addition to world projections, Plot provides the U.S.-centric *albers-usa* conic equal-area projection with an inset of Alaska and Hawaii. (Note that the scale for Alaska is diminished: it is projected at 0.35× its true relative area.)

:::plot defer
```js
Plot.plot({
  projection: "albers-usa",
  marks: [
    Plot.geo(nation),
    Plot.geo(statemesh, {strokeOpacity: 0.2})
  ]
})
```
:::

:::tip
Use the *albers-usa* projection for U.S.-centric choropleth maps.
:::

For maps that focus on a specific region, use the **domain** option to zoom in. This object should be a GeoJSON object. For example, you can use [d3.geoCircle](https://github.com/d3/d3-geo/blob/main/README.md#geoCircle) to generate a circle of a given radius centered at a given longitude and latitude. You can also use the **inset** options for a bit of padding around the **domain**.

<p>
  <label class="label-input">
    Radius:
    <input type="range" v-model.number="radius" min="10" max="50" step="0.1">
    <span style="font-variant-numeric: tabular-nums;">{{radius.toFixed(1)}}°</span>
  </label>
</p>

:::plot defer
```js
Plot.plot({
  projection: {
    type: "azimuthal-equidistant",
    rotate: [-9, -34],
    domain: circle,
    inset: 10
  },
  marks: [
    Plot.graticule(),
    Plot.geo(land, {fill: "currentColor", fillOpacity: 0.3}),
    Plot.geo(circle, {stroke: "red", strokeWidth: 2}),
    Plot.frame()
  ]
})
```

```js
circle = d3.geoCircle().center([9, 34]).radius(radius).precision(2)()
```

TODO Using a D3 projection.

:::plot defer
```js
Plot.plot({
  width: 688,
  height: 688,
  projection: ({width, height}) => d3.geoAzimuthalEquidistant()
    .rotate([0, 90])
    .translate([width / 2, height / 2])
    .scale(width)
    .clipAngle(40),
  marks: [
    Plot.graticule(),
    Plot.geo(land, {fill: "currentColor"}),
    Plot.frame()
  ]
})
```
:::

While this notebook mostly details spherical projections, sometimes geometry is already on the plane. For this, use the *identity* projection. For example, below we draw a schematic of the second floor of the [Westport House](https://en.wikipedia.org/wiki/Westport_House) in Dundee, Ireland.

:::plot defer
```js
Plot.geo(westport).plot({projection: {type: "identity", domain: westport}})
```
:::

:::tip
There’s also a *reflect-y* projection in case *y* points up↑.
:::

TODO Facets. A comic strip plotting the new Walmart stores opened in each decade.

:::plot defer
```js
Plot.plot({
  marginLeft: 0,
  marginRight: 0,
  projection: "albers",
  fx: {
    interval: d3.utcYear.every(10),
    tickFormat: (d) => `${d.getUTCFullYear()}’s`,
    label: null
  },
  marks: [
    Plot.geo(statemesh, {strokeOpacity: 0.1}),
    Plot.geo(nation),
    Plot.dot(walmarts, {fx: "date", x: "longitude", y: "latitude", r: 1, fill: "currentColor"})
  ]
})
```
:::

:::info
This uses the [**interval** scale option](../transforms/interval.md) to bin temporal data into facets by decade.
:::

Projections can work with any mark that consumes continuous *x* and *y* channels—as well as marks that use *x1* and *y1*, *x2* and *y2*. Use the [image](../marks/image.md) mark to center an image at the given location. The [arrow](../marks/arrow.md) and [link](../marks/link.md) marks connect two points, and can be used in thematic mapping to express, say, trade flows between countries. The [rect](../marks/rect.md) mark creates a rectangle from two opposite corners, and can be used to draw a selection (brush), an inset, a bounding-box…

:::info
To learn more about this topic, see our hands-on tutorials: [Build your first map with Observable Plot](https://observablehq.com/@observablehq/build-your-first-map-with-observable-plot), and [Build your first choropleth map with Observable Plot](https://observablehq.com/@observablehq/build-your-first-choropleth-map-with-observable-plot).
:::

## Projection options

The top-level **projection** option applies a two-dimensional (often geographic) projection in place of *x* and *y* scales. It is typically used in conjunction with a [geo mark](../marks/geo.md) to produce a map, but can be used with any mark that supports *x* and *y* channels, such as [dot](../marks/dot.md), [text](../marks/text.md), [arrow](../marks/arrow.md), and [rect](../marks/rect.md). For marks that use *x1*, *y1*, *x2*, and *y2* channels, the two projected points are ⟨*x1*, *y1*⟩ and ⟨*x2*, *y2*⟩; otherwise, the projected point is ⟨*x*, *y*⟩. The following built-in named projections are supported:

* *equirectangular* - the equirectangular, or *plate carrée*, projection
* *orthographic* - the orthographic projection
* *stereographic* - the stereographic projection
* *mercator* - the Mercator projection
* *equal-earth* - the [Equal Earth projection](https://en.wikipedia.org/wiki/Equal_Earth_projection) by Šavrič *et al.*
* *azimuthal-equal-area* - the azimuthal equal-area projection
* *azimuthal-equidistant* - the azimuthal equidistant projection
* *conic-conformal* - the conic conformal projection
* *conic-equal-area* - the conic equal-area projection
* *conic-equidistant* - the conic equidistant projection
* *gnomonic* - the gnomonic projection
* *transverse-mercator* - the transverse Mercator projection
* *albers* - the Albers’ conic equal-area projection
* *albers-usa* - a composite Albers conic equal-area projection suitable for the United States
* *identity* - the identity projection for planar geometry
* *reflect-y* - like the identity projection, but *y* points up
* null (default) - the null projection for pre-projected geometry in screen coordinates

In addition to these named projections, the **projection** option may be specified as a [D3 projection](https://github.com/d3/d3-geo/blob/main/README.md#projections), or any custom projection that implements [*projection*.stream](https://github.com/d3/d3-geo/blob/main/README.md#projection_stream), or a function that receives a configuration object ({width, height, ...options}) and returns such a projection. In the last case, the width and height represent the frame dimensions minus any insets.

If the **projection** option is specified as an object, the following additional projection options are supported:

* projection.**type** - one of the projection names above
* projection.**parallels** - the [standard parallels](https://github.com/d3/d3-geo/blob/main/README.md#conic_parallels) (for conic projections only)
* projection.**precision** - the [sampling threshold](https://github.com/d3/d3-geo/blob/main/README.md#projection_precision)
* projection.**rotate** - a two- or three- element array of Euler angles to rotate the sphere
* projection.**domain** - a GeoJSON object to fit in the center of the (inset) frame
* projection.**inset** - inset by the given amount in pixels when fitting to the frame (default zero)
* projection.**insetLeft** - inset from the left edge of the frame (defaults to inset)
* projection.**insetRight** - inset from the right edge of the frame (defaults to inset)
* projection.**insetTop** - inset from the top edge of the frame (defaults to inset)
* projection.**insetBottom** - inset from the bottom edge of the frame (defaults to inset)
* projection.**clip** - the projection clipping method

The following projection clipping methods are supported for projection.**clip**:

* *frame* or true (default) - clip to the extent of the frame (including margins but not insets)
* a number - clip to a great circle of the given radius in degrees centered around the origin
* null or false - do not clip

Whereas the mark.**clip** option is implemented using SVG clipping, the projection.**clip** option affects the generated geometry and typically produces smaller SVG output.
