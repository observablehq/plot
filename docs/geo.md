# Geo

The **geo** mark draws geographic features and other polygonal geometry, often as maps. It works with Plot’s flexible [geographic projection system](https://observablehq.com/@observablehq/plot-projections${location.search}).

```js
Plot.geo(counties, {fill: (d) => d.properties.unemployment}).plot({
  projection: "albers-usa",
  color: {
    type: "quantile",
    n: 8,
    scheme: "blues",
    label: "Unemployment (%)",
    legend: true
  }
})
```

The [choropleth map](https://en.wikipedia.org/wiki/Choropleth_map) above shows county-level unemployment rates for the contiguous United States. To create it, we join a collection of county polygons (a GeoJSON file) with a table of unemployment rates (a CSV file): the _fill_ function looks up the unemployment rate for the given county. The data is prepared and explained in the [appendix below](#appendix).

A geo mark’s data is typically [GeoJSON](https://geojson.org/). You can pass a single GeoJSON object, a feature or geometry collection, or an array or iterable of GeoJSON objects. The map below combines Point, LineString, and MultiPolygon geometries to track Charles Darwin’s voyage on HMS _Beagle_. (Data via [Benjamin Schmidt](https://observablehq.com/@bmschmidt/data-driven-projections-darwins-world).)

```js
land = FileAttachment("land.json").json() // multi-polygon representing land area
```

```js
beagle = FileAttachment("beagle.json").json() // line representing the Beagle’s route
```

```js
london = ({type: "Point", coordinates: [-0.13, 51.5]}) // London’s longitude and latitude
```

```js
Plot.geo([land, beagle, london]).plot({projection: "equirectangular"})
```

To improve this map, we can fill the land, thicken the line, increase the point size, add a bit of color to the [line](./line.md) mark, and a caption. We can also adopt the [Equal Earth](https://equal-earth.com/equal-earth-projection.html) projection designed by Bojan Šavrič, Bernhard Jenny, and Tom Patterson.

```js
Plot.plot({
  projection: "equal-earth",
  marks: [
    Plot.geo(land, {fill: "currentColor"}),
    Plot.graticule(),
    Plot.line(beagle.coordinates, {stroke: (d, i) => i, z: null, strokeWidth: 2}),
    Plot.geo(london, {fill: "red", r: 5}),
    Plot.sphere()
  ],
  caption: htl.html`The voyage of Charles Darwin aboard HMS <i>Beagle</i>, 1831–1836.`
})
```

Note how the line uses the default _auto_ **curve** option, which interpolates by using the shortest path which, on the sphere, follows the great circle. Try and change the code above to specify curve: "linear" on the line mark, and see the difference!

The convenience helper Plot.**graticule** draws a uniform grid of meridians (constant longitude) and parallels (constant latitude) every 10° between ±80° latitude (for the polar regions, meridians every 90°). Plot.**sphere**, for its part, draws the outline of the projected sphere.

```js
Plot.plot({
  inset: 4,
  height: 400,
  projection: {type: "orthographic", rotate: [0, -35, 20]},
  marks: [Plot.graticule({strokeOpacity: 0.5}), Plot.sphere()]
})
```

Like all marks, geo accepts both constant and channel values for the common mark options (such as fill, stroke, opacity…). The constant <b style="color: red;">red</b> color above allowed us to style the Point representing London. A variable channel, in turn, produces a different color for each geometry based on the associated datum.

The radius of Point and MultiPoint geometries is specified via the *r* option. It can be a constant number in pixels (as with London above), or a channel. If it a channel, geometries are sorted by descending radius, and the effective radius is controlled by the _r_ scale, which defaults to _sqrt_ such that the area of a point is proportional to its value. Points with a negative radius are not rendered.

earthquakes = (await fetch("https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_day.geojson")).json()

```js
Plot.plot({
  projection: "equirectangular",
  marks: [
    Plot.graticule(),
    Plot.geo(land, {fill: "#ccc"}),
    Plot.geo(earthquakes, {r: d => Math.exp(d.properties.mag)}),
    Plot.sphere()
  ]
})
```

As an alternative to Plot.geo with point geometries, you can pass longitude and latitude to Plot.dot’s _x_ and _y_ channels, and indeed many of Plot’s basic marks can be projected (like we did with the [line](./line.md) mark for the _Beagle_’s route). You can even mix the two types of marks, depending on how your dataset is structured! Maps often layer several marks, as the [Mapping with Plot](./mapping.md) notebook illustrates.

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

Lastly, Plot.geo is not limited to spherical geometries. [Plot’s projection system](./maps.md) includes planar projections, which allow you to work with shapes—such as contours—generated on an arbitrary flat surface.

---

## Appendix

### GeoJSON, TopoJSON and other formats for geographic information

The GeoJSON format is a common way to represent geographic shapes: it can be used to specify geometries such as points (Point and MultiPoint), lines (LineString, MultiLineString), and areas (Polygon, MultiPolygon). Geometries can also be assembled and connected to properties (such as names, values…), to create Features.

For various reasons, features are often stored in a different format than GeoJSON. A common format is TopoJSON, which both offers a more compact representation (faster loading times), and facilitates topological operations such as merging polygons, computing meshes of edges, etc. Before feeding these to Plot.geo, you have to convert them to GeoJSON with the [topojson-client](https://github.com/topojson/topojson-client) library—automatically available in Observable notebooks. Other libraries exist that can read various formats used to encode geographic shapes—such as shapefiles, geoparquet, _etc._ In all cases, there exists a way to create a GeoJSON representation from these files, that we can pass to Plot.geo.

In fact, in the case of TopoJSON files, the code that does the job is shorter than our explanation! See below how we extract the *nation* feature, aggregate the edges between states in *statemesh*, and retrieve the counties as a FeatureCollection, all from a single file *us-counties-10m.json*, saved as a TopoJSON file attachment.

```js
us = FileAttachment("us-counties-10m.json").json()
```

```js
nation = topojson.feature(us, us.objects.nation)
```

```js
statemesh = topojson.mesh(us, us.objects.states, (a, b) => a !== b)
```

```js
counties = {
  const rate = new Map(unemployment.map(({id, rate}) => [id, rate]));
  const counties = topojson.feature(us, us.objects.counties);
  for (const county of counties.features) county.properties.unemployment = rate.get(county.id);
  return counties;
}
```

### Tabular data

The dataset below contains the 2016 unemployment rates for each county from the [U.S. Bureau of Labor Statistics](https://www.bls.gov/lau/tables.htm). Above, we index them by the county’s [FIPS code](https://en.wikipedia.org/wiki/FIPS_county_code) for faster access when joining them with the geometries.

```js
unemployment = (await FileAttachment("us-county-unemployment.csv").csv()).map(({rate, ...rest}) => ({...rest, rate: +rate}))
```
