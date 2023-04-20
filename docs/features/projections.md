<script setup>

import * as Plot from "@observablehq/plot";
import * as d3 from "d3";
import * as topojson from "topojson-client";
import {computed, shallowRef, onMounted} from "vue";

const elections = shallowRef([]);
const walmarts = shallowRef([]);
const us = shallowRef(null);
const nation = computed(() => us.value ? topojson.feature(us.value, us.value.objects.nation) : {type: null});
const states = computed(() => us.value ? topojson.feature(us.value, us.value.objects.states).features : []);
const statemesh = computed(() => us.value ? topojson.mesh(us.value, us.value.objects.states, (a, b) => a !== b) : {type: null});
const counties = computed(() => us.value ? topojson.feature(us.value, us.value.objects.counties).features : []);
const lookup = computed(() => counties.value ? d3.index(counties.value, (d) => +d.id) : null); // TODO fix type coercion

onMounted(() => {
  d3.csv("../data/us-presidential-election-2020.csv", d3.autoType).then((data) => (elections.value = data));
  d3.tsv("../data/walmarts.tsv", d3.autoType).then((data) => (walmarts.value = data));
  d3.json("../data/us-counties-10m.json").then((data) => (us.value = data));
});

</script>

# Projections

:::danger TODO
This guide is still under construction. 🚧 Please come back when it’s finished.
:::

Plot’s projection system opens the door for all kinds of geographic maps (and more). Once set, the top-level **projection** option takes over the *x* and *y* [scales](../features/scales.md) and considers associated channels as _jointly_ describing a location on a surface, typically the globe of the Earth.

Projections apply to any point-based mark, but are most commonly used with the [geo mark](../marks/geo.md). Below, we create a [composite mark](./marks.md#marks-marks) consisting of three geos: a graticule showing lines of constant latitude and longitude, a set of polygons showing land area, and the outline of the sphere.

```js
globe = Plot.marks([Plot.graticule(), Plot.geo(land, {fill: "currentColor"}), Plot.sphere()])
```

We can now conveniently render a globe centered over the contiguous United States using a rotated orthographic projection. This projection corresponds to a camera looking at the Earth from far away (say, from the Moon). Only one hemisphere is visible.

```js
globe.plot({height: 640, inset: 1, projection: {type: "orthographic", rotate: [100, -30]}})
```

The **rotate** option is an array of two (or three) angles—called Euler angles—that determine how to rotate the globe, or, equivalently, where the camera is situated. The animation below shows the construction of the aspect of the orthographic projection pictured above, by going from the default aspect, centered on latitude and longitude ⟨0, 0⟩ to the US-centered aspect ⟨100, −30⟩.

```js
globe.plot({width: 240, height: 245, projection: {type: "orthographic", rotate}})
```

<!-- viewof rotate = Inputs.form([
  Inputs.range([-180, 180], {step: 0.1, label: "λ"}),
  Inputs.range([-90, 90], {step: 0.1, label: "φ"}),
  Inputs.range([-180, 180], {step: 0.1, label: "γ"})
]) -->

```js
play = {
  let frame;
  const button = Inputs.button("Play", {reduce: animate});
  visibility().then(animate);
  function animate() {
    if (frame) cancelAnimationFrame(frame);
    let i = 0;
    const n = 400;
    const rotate = d3.piecewise([[0, 0, 0], [100, 0, 0], [100, -30, 0]]);
    viewof rotate.addEventListener("mousedown", () => cancelAnimationFrame(frame));
    (function tick() {
      if (!(++i <= n && button.isConnected)) return;
      viewof rotate.value = rotate(i / n);
      viewof rotate.dispatchEvent(new Event("input"));
      frame = requestAnimationFrame(tick);
    })();
  }
  return button;
}
```

In the first phase (first angle, λ), we turn the globe around its natural axis of rotation, and by 100°. In the second phase (φ), we rotate it “down”—or, equivalently, move our camera “up”—by 30° to face the region of interest. A third phase (γ) is possible, by tilting the camera… we don’t need it in the aspect of the map above, and it is often ignored (it defaults to 0). But if you pushed the γ slider completely to the right, you will have seen the startling effect!

## Built-in projections

Plot provides a variety of built-in world projections. These expect coordinates to be pairs of ⟨_longitude_, _latitude_⟩ values in degrees. The longitude is usually a number in the interval [−180, +180], but this interval is periodic (with a period of 360°). The latitude is comprised between −90 (the South Pole) and +90 (the North Pole). The maps below show their default aspect, before any scaling or rotation is applied. (All projections can be rotated.)

<!-- <div style="display: flex; flex-wrap: wrap; align-items: end;">
  ${globe.plot({
    projection: "equirectangular",
    width: 300,
    height: 180,
    caption: htl.html`<div style="text-align: center;">equirectangular (<i>plate carrée</i>)</div>`
  })}
  ${globe.plot({
    projection: "orthographic",
    width: 300,
    height: 180,
    caption: htl.html`<div style="text-align: center;">orthographic</div>`
  })}
  ${globe.plot({
    projection: "stereographic",
    width: 300,
    height: 180,
    caption: htl.html`<div style="text-align: center;">stereographic</div>`
  })}
  ${globe.plot({
    projection: "mercator",
    width: 300,
    height: 180,
    caption: htl.html`<div style="text-align: center;">Mercator</div>`
  })}
  ${globe.plot({
    projection: "equal-earth",
    width: 300,
    height: 150,
    caption: htl.html`<div style="text-align: center;">Equal Earth</div>`
  })}
  ${globe.plot({
    projection: "azimuthal-equal-area",
    width: 300,
    height: 180,
    caption: htl.html`<div style="text-align: center;">azimuthal equal-area</div>`
  })}
  ${globe.plot({
    projection: "gnomonic",
    width: 300,
    height: 180,
    caption: htl.html`<div style="text-align: center;">gnomonic</div>`
  })}
  ${globe.plot({
    projection: "transverse-mercator",
    width: 300,
    height: 180,
    caption: htl.html`<div style="text-align: center;">Transverse Mercator</div>`
  })}
  ${globe.plot({
    projection: "azimuthal-equidistant",
    width: 300,
    height: 180,
    caption: htl.html`<div style="text-align: center;">azimuthal equidistant</div>`
  })}
</div> -->

Why so many? Each projection has its own history, issues, and benefits—some would say raison d’être. _Conformal_ projections preserve angles and are used when we want shapes to be locally accurate. _Equal-area_ (also called equivalent) projections preserve the proportion between surface areas, and are preferable when comparing statistical properties over, say, land use. _Equidistant_ projections allow parallels—or meridians—to be equally spaced. _Azimuthal_ projections expand radially from a center, which might be the central feature of your map. _Cylindrical_ projections are symmetric around the globe’s axis. The _stereographic_ projection preserves circles, the _gnomonic_ projection displays all great circles as straight lines… All these have pros, and cons. No projection from sphere to plane is ever going to be the most accurate, or exempt from distortions: the curvature of the Earth makes it impossible for a projection to be, for instance, at once conformal and equal-area.

## Fitting a domain to the frame

Before we proceed to more projection types, we need a way to center and zoom our projection on a certain region. We don’t always need to make a map of the whole world, but often want to focus on a city, a country, a region of interest.

All the built-in projections come with a default domain that they aim to represent. Usually, the domain is the whole sphere, but there are some exceptions. For instance, the stereographic projection would extend to infinity if it had to show the whole sphere, and it is clipped to the hemisphere; likewise, the Mercator projection [extends indefinitely](https://observablehq.com/@fil/truth-mercator) to the North and to the South, and is generally clipped at 85° in both directions, to fit a square.

To set up a projection to show a given region, specify a GeoJSON object as the **domain** that must be included in the frame. This object can be a geometry, such as a MultiPolygon or Polygon describing the shape contour of what needs to be included. It can also be a Feature (or a FeatureCollection). In the examples below, we often use a MultiPoint geometry that contains a handful extremal points of the region (continent or country) we want to represent.

When a domain has been specified, Plot scales and translates the projection to make the whole domain fit exactly in the frame. Or rather, one axis fits exactly, with the domain touching either both top and bottom, or both left and right. The orthogonal axis generally has a bit of wiggle room, and the extra space is distributed evenly, effectively centering the domain.

(Note that, in cases where Plot is unable to fit the projection to the domain, it defaults back to the projection’s original aspect.)

### Insets

When trying to fit a specific shape to the frame, we often don’t want the shape to exactly touch the frame. Similarly to scales, the **inset** option adds some padding space on all sides of the frame before fitting to the domain. You can also individually specify **insetLeft**, **insetRight**, **insetTop** and **insetBottom**, which default to inset.

The interactive below shows all these options:

<!-- viewof fitOptions = Inputs.form({
  width: Inputs.range([200, 928], {step:1, label:"width", value: 960}),
  radius: Inputs.range([5, 179], {step:1, label:"domain’s radius", value: 20}),
  ...useInsets ?
  {  insetLeft: Inputs.range([0, 150], {step:1, label:"insetLeft", value: 0}),
  insetRight: Inputs.range([0, 150], {step:1, label:"insetRight", value: 0}),
  insetTop: Inputs.range([0, 150], {step:1, label:"insetTop", value: 0}),
  insetBottom: Inputs.range([0, 150], {step:1, label:"insetBottom", value: 0})} : {inset: Inputs.range([0, 150], {step:1, label:"inset", value: 0})},
}) -->

<!-- viewof useInsets = Inputs.toggle({label:"individual insets"}) -->

```js
{
  const domain = d3.geoCircle().center([9, 34]).radius(fitOptions.radius)();
  return globeF(Plot.geo(domain, { stroke: "red" })).plot({
    width: fitOptions.width,
    height: 400,
    projection: {
      type: "azimuthal-equidistant",
      rotate: [-9, -34],
      domain,
      insetLeft: fitOptions.insetLeft ?? fitOptions.inset,
      insetRight: fitOptions.insetRight ?? fitOptions.inset,
      insetTop: fitOptions.insetTop ?? fitOptions.inset,
      insetBottom: fitOptions.insetBottom ?? fitOptions.inset,
    },
    marks: [Plot.frame()]
  });
}
```

It is also possible to clip a projection (usually an azimuthal projection) at a certain angular distance from its center. For a map of Antarctica:

```js
globe.plot({
  width: 360,
  projection: {
    type: "azimuthal-equidistant",
    rotate: [0, 90],
    clip: 30, // 🇦🇶 comment this line out
    domain: d3.geoCircle().center([0, -90]).radius(30)(),
    inset: 2
  }
})
```

## Aside: planar projections

While this notebook mostly details _spherical_ projections, you sometimes have data whose coordinates live on an arbitrary plane, and not a spherical world of longitudes and latitudes. Some of the rules that apply on the sphere, do not apply any more. For example, the _x_ coordinate does not wrap between &minus;180 and &plus;180, and the _y_ coordinate does not stop at the poles at +90 and −90.

This data can come from different places. Here are the three planar projections that Plot supports, with some use cases.

1. The _null_ projection. You might have already projected your spherical data to screen coordinates, or the shapes are not geographical, but correspond to something that the user has drawn on the very same screen. In this case, you can use the _null_ projection, which acts as a pass-thru. This coordinate system is expressed in pixels: it has its origin in the top-left corner of the frame, with *x* denoting the distance to the right, and *y* the distance down. It is the fastest method, but as a drawback it cannot be used to fit the projection to the frame.

2. The **identity** projection follows a similar coordinate system, with *x* pointing right → and *y* pointing down ↓. However, it allows the projection to be translated and scaled to fit the frame. You should use it if the data has already projected to screen coordinates, but you need to focus on a certain region.

3. The **reflect-y** projection is like the identity projection, but *y* points up ↑. It is commonly used with geographic data expressed in any planar Coordinate reference system (CRS) where *x* is the _easting_ (number of kilometers to the east from a reference point) and *y* the northing (distance in the direction of the north). If east points right, north points up, we need to reflect the *y* direction to avoid inverted maps.

For example, you might want to draw a floor plan, which comes as a geometry that is not anchored to a specific location on our good planet. Like the schematic plan of the second floor of the [Westport House](https://en.wikipedia.org/wiki/Westport_House) in Dundee, Ireland (see Appendix).

```js
Plot.plot({
  projection: { type: "identity", domain: westport },
  marks: [Plot.geo(westport)]
})
```

## Conic projections

In addition to the projections listed above, Plot also provides three generic _conic_ projections. These are typically used to represent a specific region (rather than the whole globe), by setting their parallels and a rotation in a way that minimizes the distortion over the region of interest. If you use them directly, the map of the whole globe is ready to be wrapped in the shape of a cone. (Pretty bad, of course—except for teaching.)

<!-- <div style="display: flex; flex-wrap: wrap; align-items: end; justify-content: space-between;">
  ${globe.plot({
    projection: "conic-conformal",
    width: 300,
    height: 180,
    caption: htl.html`<div style="text-align: center;">conic-conformal</div>`
  })}
  ${globe.plot({
    projection: "conic-equal-area",
    width: 300,
    height: 180,
    caption: htl.html`<div style="text-align: center;">conic-equal-area</div>`
  })}
  ${globe.plot({
    projection: "conic-equidistant",
    width: 300,
    height: 180,
    caption: htl.html`<div style="text-align: center;">conic-equidistant</div>`
  })}
</div> -->

The common use case for these conic projections is for map that focus on a specific region. For example, here is the South America Lambert conformal projection ([ESRI:102015](https://epsg.io/102015)):

```js
globe.plot({
  width: 350,
  height: 454,
  projection: {
    type: "conic-conformal",
    rotate: [60, 0],
    parallels: [-5, -42],
    domain: {type: "MultiPoint", coordinates: [[-90, 0], [-30, 0], [-60, 15], [-60, -60]]}
  }, marks: [Plot.frame()]
})
```

## US Albers

For maps of the United States, the go-to projection is Albers’ conic equal-area projection, which could be expressed as:

```js
Plot.plot({
  width: 320,
  height: 200,
  projection: {
    type: "conic-equal-area",
    rotate: [96, 0],
    parallels: [29.5, 45.5],
    domain: states48
  },
  marks: [Plot.geo(states48, { strokeWidth: 1.5 })]
})
```

Don’t worry, there is no need to memorize these numbers: Plot has a convenient **albers** shorthand name for this projection. It is optimized for an aspect ratio of 1.6 (_e.g._ 975×610 pixels) that neatly fits the 48 contiguous states:

```js
Plot.plot({
  width: 320,
  height: 200,
  projection: "albers",
  marks: [
    Plot.geo(statesMesh, { strokeOpacity: 0.5 }), // see appendix for statesMesh and nation
    Plot.geo(states48, { strokeWidth: 1.5 })
  ]
})
```

To include the Alaska and Hawaii, use the composite **albers-usa** projection instead. Note that the projection is not equal-area anymore: surfaces are still comparable across the contiguous 48 states, but the huge state of Alaska has been scaled down.

```js
Plot.plot({
  width: 1152,
  projection: "albers-usa",
  marks: [
    Plot.geo(countiesMesh, { strokeOpacity: 0.15 }),
    Plot.geo(statesMesh, { strokeOpacity: 0.5 }),
    Plot.geo(nation, {
      strokeWidth: 1.5
    })
  ]
})
```

## A few other regions

European statistics are often presented on the official Lambert azimuthal equal-area reference [ETRS89/LAEA](https://spatialreference.org/ref/epsg/etrs89-etrs-laea/):

```js
globe.plot({
  width: 454,
  height: 454,
  projection: {
    type: "azimuthal-equal-area",
    rotate: [-10, -52],
    domain: {type: "MultiPoint", coordinates: [[-16, 52], [42, 52], [10, 32], [10, 70]]}
  }, marks: [Plot.frame()]
})
```

The projection below applies the Mercator projection to Australia. For regions that are more elongated in the North-South direction than in the West-East direction, the transverse Mercator is recommended to limit area distortion.

```js
globe.plot({
  width: 454,
  height: 454,
  marginBottom: 2,
  projection: {
    type: "mercator",
    rotate: [-133, 27],
    domain: {type: "MultiPoint", coordinates: [[113, -24], [154, -28], [141, -10.5], [146, -44]]}
  }, marks: [Plot.frame()]
})
```

The plate carrée projection (equirectangular) works well for the African continent, which is harmoniously laid out on both sides of the Equator.

```js
globe.plot({
  width: 454,
  height: 454,
  projection:
  {
    type: "equirectangular",
    domain: {
      type: "MultiPoint",
      coordinates: [
        [54, 12],
        [21, -36],
        [-19, 14],
        [10, 39]
      ]
    }
  }
})
```

An azimuthal projection is the obvious choice for polar regions (here, we choose the equidistant version, with its constant intervals between the parallels):

<!-- <div style="display: flex;">
  ${globeF().plot({
  width: 454,
  height: 454,
  projection: {
    type: "azimuthal-equidistant",
    rotate: [0, -90],
    domain: {type:"MultiPoint", coordinates: [[-90, 65], [90, 65]]},
  }
})}
  ${globeF().plot({
  width: 474,
  height: 454,
  marginLeft: 20,
  projection: {
    type: "azimuthal-equidistant",
    rotate: [0, 90],
    domain: {type:"MultiPoint", coordinates: [[-90, -65], [90, -65]]},
  }
})}
</div> -->

When you work with large-scale maps, for example at the level of a city, and the data hasn’t already been projected (if, in other words, coordinates are longitudes and latitudes), then by all means use the Mercator projection. The Mercator is locally accurate, and makes your map compatible with tile-based systems. (What Mercator does _not_ allow—and has been vilified for—is to compare different areas of the globe if they are not at the same latitude.)

However, as soon as the region to be displayed extends beyond a certain area, the choices open up, and there are no hard rules to follow. All map projections present trade-offs, and you’ll want to select a projection that most accurately reflects the data you want to display, at the expense of less important features. For example, if you work on land cover, you will want an equal-area projection, even if the distortion in angles is a bit more visible; but if you are showing a regular grid, you might prefer a conformal map that doesn’t introduce shearing.

Many projections seek a certain balance between the distortions; for that reason, they are called compromise projections. The built-in Equal-Earth projection belongs to that rather large family.

As you learn more about projections, you should also let your sense of aesthetics guide you, in particular as you explore the extended palette of possibilities offered by D3 projections: they can all be used within Plot. Check out the [Extended Projections](https://observablehq.com/@observablehq/plot-extended-projections) notebook and see them in action!

## Line sampling

As a final note, all the spherical projections have a configurable **precision**, that varies the number of interpolation points when doing line sampling (see [details](https://github.com/d3/d3-geo/blob/main/README.md#projection_precision)). Again, it’s a trade-off: the more precise the map, the slower it gets to render. The default precision is fine for most purposes, but you can refine it if you plan to export the map for printing. The map below has markers on the control points of several (interpolated) lines:

<!-- viewof projection = Inputs.select(["stereographic", "mercator", "orthographic", "equal-earth"], {label:"projection"}) -->

<!-- viewof precision = Inputs.range([0.005, 1], {label:"precision", step: 0.005, value: 0.2}) -->

```js
Plot.plot({
  marginBottom: 3,
  projection: { type: projection, precision },
  marks: [
    Plot.graticule(),
    Plot.line(
      [
        [-10, -20],
        [80, 50],
        [-90, 20],
        [-10, -20]
      ],
      {
        marker: "dot",
        stroke: ["a", "b", "c", "a"],
        z: null
      }
    ),
    Plot.sphere()
  ]
})
```

<!-- world = FileAttachment("land-110m.json").json() -->

<!-- land = topojson.feature(world, world.objects.land) -->

<!-- us = FileAttachment("us-counties-10m.json").json() -->

<!-- nation = topojson.feature(us, us.objects.nation) -->

<!-- counties48 = us.objects.counties.geometries.filter(
  ({ id }) =>
    !["02", "15", "60", "66", "69", "72", "78"].includes(id.slice(0, 2)) // removes Alaska, Hawaii etc.
) -->

<!-- states48 = topojson.merge(us, counties48) -->

<!-- statesMesh = topojson.mesh(us, us.objects.states, (a, b) => a !== b) -->

<!-- countiesMesh = topojson.mesh(us, us.objects.counties, (a, b) => a !== b) -->

<!-- Floor plan, adapted from [wrld3d](https://github.com/wrld3d/wrld-indoor-maps-api): -->

<!-- westport = FileAttachment("westport-house.json").json() -->

<!-- // a version of globe that clips to the frame
globeF = (marks) =>
  Plot.marks([
    Plot.graticule({ clip: "frame" }),
    Plot.geo(land, { fill: "currentColor", clip: "frame" }),
    Plot.sphere(),
    marks
  ]) -->

## Maps

To make a map, follow the order of things described by the painter Wassily Kandinsky in _Point and Line to Plane_ ([1926](https://www.wassilykandinsky.net/book-117.php)): lay out your planes (areas, filled polygons), draw lines above them (contours, arrows), then finally put dots on top. (You can add labels, too.)

Plot’s **projection** option is going to be your paint tool. Where classic charts are concerned, the **x** and **y** axes are independent, and generally represent different dimensions of the data, with different types of scales. Once a projection is set in Plot, though, it takes over the x and y dimensions, which now _jointly_ represent a location on a surface (flat, or spherical). For any location on that surface, the projection function will indicate the corresponding position on the map.

In practice, the ⟨_x_, _y_⟩ pair denotes the horizontal and vertical coordinates of a point, for planar geometries; and for spherical geometries, it corresponds to the _longitude_ and _latitude_, in degrees. The projection you select will determine where and how geometries in that space will be drawn on the screen.

## Geometries

The [**geo**](../marks/geo.md) mark draws geographic features, such as polygons and lines, connecting points through the shortest path (which, on the sphere, is not a straight line, but a geodesic or “great circle” line). We use this mark to show the outline of the contiguous United States—the canvas on which we’ll make maps in this notebook.

:::plot defer
```js
Plot.plot({
  projection: "albers",
  marks: [Plot.geo(nation), Plot.geo(statemesh, { strokeOpacity: 0.2 })]
})
```
:::

## Everything is spatial

As they flow through the same projection, all the point-based marks work in unison. Whether you are using the **geo** mark, the **dot**, **text**, and **image** marks, a given location will be represented in the same position. The **line** mark will work too, connecting dots in a straight (or curved) line. Even complex marks such as **density**, **hexbin**, **voronoi**… operate on the projected coordinates. Marks such as **arrow**, **link** or **rect**, that work with pairs of coordinates x1, x2, y1, and y2, are also supported.

_Note:_ Marks that expect _x_ or _y_ to be ordinal scales, such as bars, cells, or ticks, cannot be used in conjunction with projections.

## Dots (& symbols)

To plot locations as dots on a map, use [the dot mark](../marks/dot.md), passing longitudes as the **x** channel and latitudes as the **y** channel. All the options of dot can be used, like for example the **stroke** color for each dot, or the **symbol** channel. The map below represents the opening year of every Walmart store in the contiguous United States.

:::plot defer
```js
Plot.plot({
  width: 960,
  height: 600,
  projection: "albers",
  color: {
    legend: true,
    label: "Opening year"
  },
  marks: [
    Plot.geo(nation),
    Plot.geo(statemesh, {strokeOpacity: 0.2}),
    Plot.dot(walmarts, {x: "longitude", y: "latitude", stroke: "date", symbol: "square"})
  ]
})
```
:::

## Facets

In conjunction with facets, the dot mark tells the same story as a comic strip (“small multiples”), where each facet plots the new stores opened in every decade:

:::plot defer
```js
Plot.plot({
  width: 960,
  height: 150,
  marginLeft: 0,
  marginRight: 0,
  projection: "albers",
  fx: { tickFormat: (d) => `${d}’s`, padding: 0 },
  facet: { data: walmarts, x: (d) => Math.floor(d.date.getUTCFullYear() / 10) * 10 },
  marks: [
    Plot.geo(statemesh, { clip: "frame", strokeOpacity: 0.1 }),
    Plot.dot(walmarts, { x: "longitude", y: "latitude", r: 1, fill: "currentColor" }),
    Plot.geo(nation, { clip: "frame" })
  ]
})
```
:::

## Voronoi

The
[Plot.voronoi and Plot.delaunay marks](https://observablehq.com/@observablehq/plot-voronoi)
happily consume the projected coordinates (in screen/pixel space). For example,
this voronoiMesh mark draws the catchment area of each store:

:::plot defer
```js
Plot.plot({
  width: 960,
  height: 600,
  projection: "albers",
  marks: [
    Plot.geo(nation),
    Plot.dot(walmarts, {x: "longitude", y: "latitude", fill: "currentColor", r: 1}),
    Plot.voronoiMesh(walmarts, {x: "longitude", y: "latitude"})
  ]
})
```
:::

_A note for purists (including us)._ Distances between projected points are
not—and cannot be—exactly proportional to the corresponding distances on the
sphere. This creates a discrepancy between the planar Voronoi diagram and its
spherical counterpart. For more accuracy, you may want to try
[d3-geo-voronoi](https://github.com/Fil/d3-geo-voronoi)—and let Plot.geo draw
its outputs (see [Planar vs. Spherical Voronoi](https://observablehq.com/@observablehq/planar-vs-spherical-voronoi) for details).


### Hexbin

Hexagonal bins, based on the projected coordinates. See [Plot.hexbin](../transforms/hexbin.md) for details. Hexbins have a great visual appeal, but be aware that the underlying statistics are usually to be taken with a grain of salt. At any scale, geographic binning suffers from the [MAUP](https://en.wikipedia.org/wiki/Modifiable_areal_unit_problem). On a small scale map, this is compounded by the Earth’s curvature, which makes it impossible to create an accurate and regular grid. At any rate, prefer an equal-area projection to makes the different regions of the map comparable.

:::plot defer
```js
Plot.plot({
  width: 975,
  projection: "albers",
  r: {
    range: [0, 20]
  },
  color: {
    legend: true,
    label: "First year opened",
    scheme: "spectral"
  },
  marks: [
    Plot.geo(statemesh, { strokeOpacity: 0.25 }),
    Plot.geo(nation),
    Plot.dot(
      walmarts,
      Plot.hexbin(
        { r: "count", fill: "min" },
        { x: "longitude", y: "latitude", fill: "date" }
      )
    )
  ]
})
```
:::

### Density

Plot.density… just works. See [Plot.density](../marks/density.md) for details. On a small-scale map showing the whole globe, you might have to clip the results. And, because the density is computed on the projected coordinates, it is recommended to use an equal-area projection to limit distortion.

:::plot defer
```js
Plot.plot({
  width: 960,
  height: 600,
  projection: "albers",
  color: {
    scheme: "blues"
  },
  marks: [
    Plot.density(walmarts, {
      x: "longitude",
      y: "latitude",
      bandwidth: 12,
      fill: "density"
    }),
    Plot.dot(walmarts, {
      x: "longitude",
      y: "latitude",
      r: 1,
      fill: "currentColor"
    }),
    Plot.geo(statemesh, { strokeOpacity: 0.3 }),
    Plot.geo(nation)
  ]
})
```
:::

## Text

Use the **text** mark to draw labels. The _stroke_ option helps to detach the text from the background noise, and the _textAnchor_ and _dx_, _dy_ options to adjust their placement. Here, we use the [centroid](https://observablehq.com/@observablehq/plot-centroid) transform to position the text labels in the middle of each feature.

:::plot defer
```js
Plot.plot({
  projection: "albers",
  marks: [
    Plot.geo(statemesh, { clip: "frame", strokeOpacity: 0.1 }),
    Plot.geo(nation, { clip: "frame" }),
    Plot.text(
      states,
      Plot.centroid({
        text: (d) => d.properties.name,
        textAnchor: "middle",
        stroke: "white",
        fill: "black"
      })
    )
  ]
})
```
:::

## Vectors

Did we mention [vectors](../marks/vector.md)? The map below shows the margin by which the winner of the US presidential election of 2020 won the vote in each county. The arrow’s length encodes the difference in votes, and the orientation and color show who won (<svg width=12 height=12 viewBox="-11 -11 12 12" style="display: inline-block"><path d="M0,0l-10,-6m1,3.28l-1,-3.28l3.28,-1" stroke="blue"></path></svg> for the Democratic candidate, and <svg width=12 height=12 viewBox="0 -11 12 12" style="display: inline-block"><path d="M0,0l10,-6m-1,3.28l1,-3.28l-3.28,-1" stroke="red"></path></svg> for the Republican candidate).

:::plot defer
```js
Plot.plot({
  projection: "albers-usa",
  width: 975,
  marks: [
    Plot.geo(statemesh, {strokeWidth: 0.75}),
    Plot.geo(nation),
    Plot.vector(
      elections,
      Plot.centroid({
        filter: (d) => d.votes > 0,
        anchor: "start",
        geometry: (d) => lookup.get(d.fips),
        sort: (d) => Math.abs(+d.results_trumpd - +d.results_bidenj),
        stroke: (d) => +d.results_trumpd > +d.results_bidenj ? "red" : "blue",
        length: (d) => Math.sqrt(Math.abs(+d.margin2020 * +d.votes)),
        rotate: (d) => (+d.results_bidenj < +d.results_trumpd ? 60 : -60)
      })
    )
  ]
})
```
:::

## More marks: image, rect, link, arrow, line

Projections can work with any mark that consumes continuous *x* and *y* channels—as well as marks that use *x1* and *y1*, *x2* and *y2*. Use the [image](../marks/image.md) mark to center an image at the given location. The [arrow](../marks/arrow.md) and [link](../marks/link.md) marks connect two points, and can be used in thematic mapping to express, say, trade flows between countries. The [rect](../marks/rect.md) mark creates a rectangle from two opposite corners, and can be used to draw a selection (brush), an inset, a bounding-box…

## Appendix

To learn more about this topic, see our hands-on tutorials: [Build your first map with Observable Plot](https://observablehq.com/@observablehq/build-your-first-map-with-observable-plot), and [Build your first choropleth map with Observable Plot](https://observablehq.com/@observablehq/build-your-first-choropleth-map-with-observable-plot).

The datasets used on this page respectively contain the locations and opening dates of all the Walmart stores in the contiguous US; and the winner and margin in each county in the U.S. presidential election of 2020. We load and process a TopoJSON file describing the counties and states.

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
