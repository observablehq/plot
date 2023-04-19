<script setup>

import * as Plot from "@observablehq/plot";
import * as d3 from "d3";
import * as topojson from "topojson-client";
import {computed, shallowRef, onMounted} from "vue";

const us = shallowRef(null);
const earthquakes = shallowRef([]);
const world = shallowRef(null);
const counties = computed(() => us.value ? topojson.feature(us.value, us.value.objects.counties).features : []);
const land = computed(() => world.value ? topojson.feature(world.value, world.value.objects.land) : {type: null});

onMounted(() => {
  d3.json("https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/2.5_week.geojson").then((data) => (earthquakes.value = data));
  d3.json("../data/countries-110m.json").then((data) => (world.value = data));
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

:::plot defer
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

:::danger TODO
Can we demonstrate using the geo mark *without* a projection, but with *x* and *y* scales?
:::

:::plot
```js
Plot.plot({
  x: {domain: [new Date("2020-01-01"), new Date("2021-01-01")]},
  y: {domain: [0, 2]},
  marks: [
    Plot.geo({
      type: "Polygon",
      coordinates: [[
        [new Date("2020-01-01"), 0],
        [new Date("2020-02-01"), 2],
        [new Date("2020-03-01"), 1],
        [new Date("2020-01-01"), 0]
      ]]
    })
  ]
})
```
:::

The radius of Point and MultiPoint geometries is specified via the **r** option. It can be a constant number in pixels (as with London above), or a channel. If it a channel, geometries are sorted by descending radius, and the effective radius is controlled by the _r_ scale, which defaults to _sqrt_ such that the area of a point is proportional to its value. Points with a negative radius are not rendered.

:::plot defer
```js
Plot.plot({
  projection: "equirectangular",
  style: "overflow: visible;",
  color: {zero: true, legend: true},
  marks: [
    Plot.geo(land, {fill: "currentColor", fillOpacity: 0.2}),
    Plot.sphere(),
    Plot.geo(earthquakes, {r: (d) => Math.exp(d.properties.mag), fill: (d) => (d.properties.sig), fillOpacity: 0.2, stroke: (d) => (d.properties.sig), title: (d) => d.properties.title, href: (d) => d.properties.url, target: "_blank"})
  ]
})
```
:::

Like other marks, the geo mark supports both constant and channel values for the standard mark options such as **fill** and **stroke**. The constant <span style="border-bottom: solid 2px red;">red</span> color above allowed us to style the Point representing London. A variable channel, in turn, produces a different color for each geometry based on the associated datum.

The [graticule](#graticule-options) helper draws a uniform grid of meridians (constant longitude) and parallels (constant latitude) every 10° between ±80° latitude (for the polar regions, meridians every 90°). The [sphere](#sphere-options) helper draws the outline of the projected sphere.

:::plot
```js
Plot.plot({
  inset: 2,
  projection: {type: "orthographic", rotate: [0, -30, 20]},
  marks: [Plot.graticule({strokeOpacity: 0.3}), Plot.sphere()]
})
```
:::

As an alternative to Plot.geo with point geometries, you can pass longitude and latitude to Plot.dot’s _x_ and _y_ channels, and indeed many of Plot’s basic marks can be projected (like we did with the [line](./line.md) mark for the _Beagle_’s route). You can even mix the two types of marks, depending on how your dataset is structured! Maps often layer several marks, as the [Mapping with Plot](../features/projections.md) notebook illustrates.

:::danger TODO
The above paragraph should move to the projections guide since it’s not about the geo mark.
:::

The geo mark’s _geometry_ channel can be used to generate geometry from a non-GeoJSON data source. For example, to visualize the shockwave created by the explosion of the Hunga Tonga–Hunga Haʻapai volcano on January 15, 2022 with a series of geodesic circles of increasing radius:

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
    nice: true
  },
  marks: [
    Plot.geo(land),
    Plot.geo(radii, {
      geometry: d3
        .geoCircle()
        .center(tonga)
        .radius((r) => r),
      stroke: (r) => r,
      strokeWidth: 2
    }),
    Plot.geo({ type: "Point", coordinates: tonga }, { fill: "red", r: 4 }),
    Plot.sphere()
  ]
})
```

```js
radii = d3.range(10, 171, 10) // degrees radii of circles to be centered around Tonga
```

```js
tonga = [-175.38, -20.57]
```

Lastly, Plot.geo is not limited to spherical geometries. [Plot’s projection system](../features/projections.md) includes planar projections, which allow you to work with shapes—such as contours—generated on an arbitrary flat surface.

## Geo options

The **geometry** channel specifies the geometry (GeoJSON object) to draw; if not specified, the mark’s *data* is assumed to be GeoJSON.

## geo(*data*, *options*)

```js
Plot.geo(counties, {fill: (d) => d.properties.rate})
```

Returns a new geo mark with the given *data* and *options*. If *data* is a GeoJSON feature collection, then the mark’s data is *data*.features; if *data* is a GeoJSON geometry collection, then the mark’s data is *data*.geometries; if *data* is some other GeoJSON object, then the mark’s data is the single-element array [*data*]. If the **geometry** option is not specified, *data* is assumed to be a GeoJSON object or an iterable of GeoJSON objects.

In addition to the [standard mark options](../features/marks.md#mark-options), the **r** option controls the size of Point and MultiPoint geometries. It can be specified as either a channel or constant. When **r** is specified as a number, it is interpreted as a constant radius in pixels; otherwise it is interpreted as a channel and the effective radius is controlled by the *r* scale. (As with [dots](#dot), the *r* scale defaults to a *sqrt* scale such that the visual area of a point is proportional to its associated value.) If the **r** option is not specified it defaults to 3 pixels. Geometries with a nonpositive radius are not drawn. If **r** is a channel, geometries will be sorted by descending radius by default.

## sphere(*options*)

```js
Plot.sphere()
```

Returns a new geo mark with a *Sphere* geometry object and the given *options*.

## graticule(*options*)

```js
Plot.graticule()
```

Returns a new geo mark with a [default 10° global graticule](https://github.com/d3/d3-geo/blob/main/README.md#geoGraticule10) geometry object and the given *options*.
