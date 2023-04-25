<script setup>

import * as Plot from "@observablehq/plot";
import * as d3 from "d3";
import * as topojson from "topojson-client";
import {computed, shallowRef, onMounted} from "vue";

const us = shallowRef(null);
const earthquakes = shallowRef([]);
const walmarts = shallowRef({type: "FeatureCollection", features: []});
const world = shallowRef(null);
const statemesh = computed(() => us.value ? topojson.mesh(us.value, us.value.objects.states, (a, b) => a !== b) : {type: null});
const nation = computed(() => us.value ? topojson.feature(us.value, us.value.objects.nation) : {type: null});
const counties = computed(() => us.value ? topojson.feature(us.value, us.value.objects.counties).features : []);
const land = computed(() => world.value ? topojson.feature(world.value, world.value.objects.land) : {type: null});

onMounted(() => {
  d3.json("https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/2.5_week.geojson").then((data) => (earthquakes.value = data));
  d3.json("../data/countries-110m.json").then((data) => (world.value = data));
  d3.tsv("../data/walmarts.tsv", d3.autoType).then((data) => (walmarts.value = {type: "FeatureCollection", features: data.map((d) => ({type: "Feature", properties: {date: d.date}, geometry: {type: "Point", coordinates: [d.longitude, d.latitude]}}))}));
  Promise.all([
    d3.json("../data/us-counties-10m.json"),
    d3.csv("../data/us-county-unemployment.csv")
  ]).then(([_us, _unemployment]) => {
    const map = new Map(_unemployment.map((d) => [d.id, +d.rate]));
    _us.objects.counties.geometries.forEach((g) => (g.properties.unemployment = map.get(g.id)));
    us.value = _us;
  });
});

</script>

# Geo mark

The **geo mark** draws geographic features—polygons, lines, points, and other geometry—often as thematic maps. It works with Plot’s [projection system](../features/projections.md). For example, the [choropleth map](https://en.wikipedia.org/wiki/Choropleth_map) below shows unemployment by county in the United States.

:::plot defer https://observablehq.com/@observablehq/plot-us-choropleth
```js
Plot.plot({
  projection: "albers-usa",
  color: {
    type: "quantile",
    n: 9,
    scheme: "blues",
    label: "Unemployment (%)",
    legend: true
  },
  marks: [
    Plot.geo(counties, {
      fill: (d) => d.properties.unemployment,
      title: (d) => `${d.properties.name}\n${d.properties.unemployment}%`
    })
  ]
})
```
:::

A geo mark’s data is typically [GeoJSON](https://geojson.org/). You can pass a single GeoJSON object, a feature or geometry collection, or an array or iterable of GeoJSON objects.

The size of Point and MultiPoint geometries is controlled by the **r** option. For example, below we show earthquakes in the last seven days with a magnitude of 2.5 or higher as reported by the [USGS](https://earthquake.usgs.gov/earthquakes/feed/v1.0/geojson.php). As with the [dot mark](./dot.md), the effective radius is controlled by the *r* scale, which is by default a *sqrt* scale such that the area of a point is proportional to its value. And likewise point geometries are by default sorted by descending radius to reduce occlusion, drawing the smallest circles on top. Set the **sort** option to null to use input order instead.

:::plot defer https://observablehq.com/@observablehq/plot-live-earthquake-map
```js
Plot.plot({
  projection: "equirectangular",
  style: "overflow: visible;",
  r: {transform: (r) => Math.pow(10, r)}, // Richter to amplitude
  marks: [
    Plot.geo(land, {fill: "currentColor", fillOpacity: 0.2}),
    Plot.sphere(),
    Plot.geo(earthquakes, {
      r: (d) => d.properties.mag,
      fill: "red",
      fillOpacity: 0.2,
      stroke: "red",
      title: (d) => d.properties.title,
      href: (d) => d.properties.url,
      target: "_blank"
    })
  ]
})
```
:::

:::tip
Click on any of the earthquakes above to see details.
:::

The [graticule](#graticule-options) helper draws a uniform grid of meridians (lines of constant longitude) and parallels (lines of constant latitude) every 10° between ±80° latitude; for the polar regions, meridians are drawn every 90°. The [sphere](#sphere-options) helper draws the outline of the projected sphere.

:::plot https://observablehq.com/@observablehq/plot-sphere-and-graticule
```js
Plot.plot({
  inset: 2,
  projection: {type: "orthographic", rotate: [0, -30, 20]},
  marks: [
    Plot.sphere({fill: "var(--vp-c-bg-alt)", stroke: "currentColor"}),
    Plot.graticule({strokeOpacity: 0.3})
  ]
})
```
:::

The geo mark’s **geometry** channel can be used to generate geometry from a non-GeoJSON data source. For example, below we visualize the shockwave created by the explosion of the [Hunga Tonga–Hunga Haʻapai volcano](https://en.wikipedia.org/wiki/2021–22_Hunga_Tonga–Hunga_Haʻapai_eruption_and_tsunami) on January 15, 2022 with a series of geodesic circles of increasing radius.

:::plot defer https://observablehq.com/@observablehq/plot-shockwave
```js
Plot.plot({
  projection: {
    type: "equal-earth",
    rotate: [90, 0]
  },
  color: {
    legend: true,
    label: "Distance from Tonga (km)",
    transform: (d) => 111.2 * d, // degrees to km
    zero: true
  },
  marks: [
    Plot.geo(land),
    Plot.geo([0.5, 179.5].concat(d3.range(10, 171, 10)), {
      geometry: d3.geoCircle().center([-175.38, -20.57]).radius((r) => r),
      stroke: (r) => r,
      strokeWidth: 2
    }),
    Plot.sphere()
  ]
})
```
:::

The geo mark supports [faceting](../features/facets.md). Below, a comic strip of sorts shows the locations of Walmart store openings in past decades.

:::plot defer https://observablehq.com/@observablehq/plot-map-large-multiples
```js
Plot.plot({
  margin: 0,
  padding: 0,
  projection: "albers",
  fy: {interval: d3.utcYear.every(10)},
  marks: [
    Plot.geo(statemesh, {strokeOpacity: 0.2}),
    Plot.geo(nation),
    Plot.geo(walmarts, {fy: (d) => d.properties.date, r: 1.5, fill: "blue"}),
    Plot.axisFy({frameAnchor: "top", dy: 30, tickFormat: (d) => `${d.getUTCFullYear()}’s`})
  ]
})
```
:::

:::info
This uses the [**interval** scale option](../transforms/interval.md) to bin temporal data into facets by decade.
:::

Lastly, the geo mark is not limited to spherical geometries! [Plot’s projection system](../features/projections.md) includes planar projections, which allow you to work with shapes—such as contours—generated on an arbitrary flat surface.

## Geo options

The **geometry** channel specifies the geometry (GeoJSON object) to draw; if not specified, the mark’s *data* is assumed to be GeoJSON.

In addition to the [standard mark options](../features/marks.md#mark-options), the **r** option controls the size of Point and MultiPoint geometries. It can be specified as either a channel or constant. When **r** is specified as a number, it is interpreted as a constant radius in pixels; otherwise it is interpreted as a channel and the effective radius is controlled by the *r* scale. If the **r** option is not specified it defaults to 3 pixels. Geometries with a nonpositive radius are not drawn. If **r** is a channel, geometries will be sorted by descending radius by default.

## geo(*data*, *options*)

```js
Plot.geo(counties, {fill: (d) => d.properties.rate})
```

Returns a new geo mark with the given *data* and *options*. If *data* is a GeoJSON feature collection, then the mark’s data is *data*.features; if *data* is a GeoJSON geometry collection, then the mark’s data is *data*.geometries; if *data* is some other GeoJSON object, then the mark’s data is the single-element array [*data*]. If the **geometry** option is not specified, *data* is assumed to be a GeoJSON object or an iterable of GeoJSON objects.

## sphere(*options*)

```js
Plot.sphere()
```

Returns a new geo mark with a *Sphere* geometry object and the given *options*.

## graticule(*options*)

```js
Plot.graticule()
```

Returns a new geo mark with a [10° global graticule](https://github.com/d3/d3-geo/blob/main/README.md#geoGraticule10) geometry object and the given *options*.
