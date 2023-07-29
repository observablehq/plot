<script setup>

import * as Plot from "@observablehq/plot";
import * as d3 from "d3";
import * as topojson from "topojson-client";
import {computed, shallowRef, onMounted} from "vue";

const us = shallowRef(null);
const statemesh = computed(() => us.value ? topojson.mesh(us.value, us.value.objects.states) : {type: null});
const states = computed(() => us.value ? topojson.feature(us.value, us.value.objects.states).features : []);
const counties = computed(() => us.value ? topojson.feature(us.value, us.value.objects.counties).features : []);
const nation = computed(() => us.value ? topojson.feature(us.value, us.value.objects.nation) : []);

onMounted(() => {
  d3.json("../data/us-counties-10m.json").then((data) => (us.value = data));
});

</script>

# Centroid transform

Plot offers two transforms that derive centroids from GeoJSON geometries: [centroid](#centroid) and [geoCentroid](#geoCentroid). These transforms can be used by any mark that accepts **x** and **y** channels. Below, a [text mark](../marks/text.md) labels the U.S. states.

:::plot defer https://observablehq.com/@observablehq/plot-state-labels
```js
Plot.plot({
  projection: "albers-usa",
  marks: [
    Plot.geo(statemesh),
    Plot.text(states, Plot.centroid({text: (d) => d.properties.name, fill: "currentColor", stroke: "var(--vp-c-bg)"}))
  ]
})
```
:::

For fun, we can pass county centroids to the [voronoi mark](../marks/delaunay.md).

:::plot defer https://observablehq.com/@observablehq/plot-centroid-voronoi
```js
Plot.voronoi(counties, Plot.centroid()).plot({projection: "albers"})
```
:::

While the centroid transform computes the centroid of a geometry _after_ projection, the geoCentroid transform computes it _before_ projection, then projects the resulting coordinates. This difference has a few implications, as follows.

As an [initializer](../features/transforms.md#custom-initializers), the centroid transform operates _after_ the geometries have been projected to screen coordinates. The resulting **x** and **y** channels reference the pixel coordinates of the planar centroid of the _projected_ shapes. No assumption is made about the geometries: they can be in any coordinate system, and the returned value is in the frame — as long as the projected geometry returns at least one visible point.

:::plot defer https://observablehq.com/@observablehq/plot-centroid-dot
```js
Plot.dot(counties, Plot.centroid()).plot({projection: "albers-usa"})
```
:::


The geoCentroid transform is more specialized as the **x** and **y** channels it derives represent the longitudes and latitudes of the centroids of the given GeoJSON geometries, before projection. It expects the geometries to be specified in _spherical_ coordinates. It is more correct, in a geospatial sense — for example, the spherical centroid always represents the center of mass of the original shape, and it will be rotated exactly in line with the projection’s rotate argument. However, this also means that it might land outside the frame if only a part of the land mass is visible, and might be clipped by the projection. In practice, the difference is generally imperceptible.

:::plot defer https://observablehq.com/@observablehq/plot-centroid-dot
```js
Plot.dot(counties, Plot.geoCentroid()).plot({projection: "albers-usa"})
```
:::

The geoCentroid transform is slightly faster than the centroid initializer — which might be useful if you have tens of thousands of features and want to show their density on a [hexbin map](../transforms/hexbin.md):

:::plot defer https://observablehq.com/@observablehq/plot-centroid-hexbin
```js
Plot.dot(counties, Plot.hexbin({r:"count"}, Plot.geoCentroid())).plot({projection: "albers"})
```
:::

Combined with the [pointer transform](../interactions/pointer.md), the centroid transform can add [interactive tips](../marks/tip.md) on a map:

:::plot defer https://observablehq.com/@observablehq/plot-state-centroids
```js
Plot.plot({
  projection: "albers-usa",
  marks: [
    Plot.geo(statemesh, {strokeOpacity: 0.2}),
    Plot.geo(nation),
    Plot.dot(states, Plot.centroid({fill: "red", stroke: "var(--vp-c-bg-alt)"})),
    Plot.tip(states, Plot.pointer(Plot.centroid({title: (d) => d.properties.name})))
  ]
})
```
:::

## centroid(*options*) {#centroid}

```js
Plot.centroid({geometry: Plot.identity})
```

The centroid initializer derives **x** and **y** channels representing the planar (projected) centroids for the given GeoJSON geometry. If the **geometry** option is not specified, the mark’s data is assumed to be GeoJSON objects.

## geoCentroid(*options*) {#geoCentroid}

```js
Plot.geoCentroid({geometry: Plot.identity})
```

The geoCentroid transform derives **x** and **y** channels representing the spherical centroids for the given GeoJSON geometry. If the **geometry** option is not specified, the mark’s data is assumed to be GeoJSON objects.
