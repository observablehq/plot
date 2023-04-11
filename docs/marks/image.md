# Image mark

The **image** mark centers an image at the given position in *x* and *y*, similar to the [dot mark](./dot.md). For example, the scatterplot below shows recent [Astronomy Picture of the Day](https://apod.nasa.gov/apod/astropix.html) entries from NASA; *x* represents the date, and *y* represents the date’s weekday.

```js
// https://api.nasa.gov/planetary/apod?api_key=DEMO_KEY&count=100
apod = (await FileAttachment("apod.json").json())
    .filter(d => d.media_type === "image") // only consider images
    .map(({date, ...d}) => ({...d, date: new Date(date)})) // coerce dates
    .sort((a, b) => d3.descending(a.date, b.date)) // chronological
    .map((d, i) => (d.index = i, d)) // add an index.
```

```js
```js
Plot.plot({
  marginLeft: 20,
  x: {inset: 8},
  y: {type: "point", grid: true, tickFormat: Plot.formatWeekday("en", "narrow")},
  marks: [
    Plot.image(apod.slice(0, 40), {x: "date", y: d => d.date.getUTCDay(), src: "url", title: "title"})
  ]
})
```

As another example, the scatterplot below (contributed by [Robert Lesser](https://observablehq.com/@rlesser)) shows the favorability of U.S. presidents over time. Sorry, Nixon! The default size of an image is only 16×16 pixels, but it can be increased if we want to show more detail, at the risk of also increasing occlusion. Images are drawn in input order, and hence the more recent presidents are drawn on top below.

<!-- viewof metric = Inputs.select([
  {
    name: "Net favorability",
    value: (d) =>
      d["Very Favorable %"] +
      d["Somewhat Favorable %"] -
      d["Very Unfavorable %"] -
      d["Somewhat Unfavorable %"]
  },
  {
    name: "Favorable",
    value: (d) =>
      d["Very Favorable %"] +
      d["Somewhat Favorable %"]
  },
  {
    name: "Unfavorable",
    value: (d) =>
      d["Very Unfavorable %"] +
      d["Somewhat Unfavorable %"]
  },
  {
    name: "Undecided",
    value: (d) =>
      d["Don’t know %"] +
      d["Have not heard of them %"]
  },
], {
  format: d => d.name,
  label: "Favorability metric"
}) -->

```js
```js
Plot.plot({
  inset: 30,
  width: 960,
  height: 600,
  x: {
    label: "Date of first inauguration →"
  },
  y: {
    grid: true,
    label: `↑ ${metric.name} (%)`,
    percent: true,
    tickFormat: "+f"
  },
  marks: [
    Plot.ruleY([0]),
    Plot.image(
      favorability,
      {
        x: "First Inauguration Date",
        y: d => metric.value(d) / 100,
        width: 60,
        src: "Portrait URL",
        title: d => `${d.Name}\n${d["First Inauguration Date"].getUTCFullYear()}`
      }
    )
  ]
})
```

Images can also be used in scatterplot to produce categorical symbols:

```js
data = [
  [0.241, "x"],
  [0.367, "x"],
  [0.036, "x"],
  [0.112, "o"],
  [0.382, "x"],
  [0.594, "x"],
  [0.516, "o"],
  [0.634, "o"],
  [0.612, "x"],
  [0.271, "x"],
  [0.241, "x"],
  [0.955, "x"],
  [0.336, "x"],
  [0.307, "o"],
  [0.747, "x"]
]
```

```js
```js
Plot.plot({
  grid: true,
  x: {inset: 8, axis: null},
  y: {domain: [0, 1]},
  marks: [
    Plot.ruleY([0, 1]),
    Plot.image(data, {
      x: (d, i) => i,
      y: ([value]) => value,
      src: ([, type]) => icons[type]
    })
  ]
})
```

```js
// https://feathericons.com/
icons = ({
  o: await FileAttachment("activity.svg").url(),
  x: await FileAttachment("x-square.svg").url()
})
```

A convenient alternative, if the symbols are available as a text font, is to use a [text mark](./text.md), for example with emoji like in the chart below. In the future, we plan on adding a [proportional symbol mark](https://github.com/observablehq/plot/issues/41) to Plot with symbols designed to maximize differentiability.

```js
Plot.plot({
  inset: 8,
  grid: true,
  x: {axis: null},
  height: 280,
  marks: [
    Plot.ruleY([0, 1]),
    Plot.text(data, {
      x: (d, i) => i,
      y: ([y]) => y,
      text: ([, type]) => type === "x" ? "❎" : "💎",
      fontSize: 17
    })
  ]
})
```

Back to images, if we want to scale them, we have to compute their *width* (or *height*) explicitly: there is no *r* channel like for dot marks, and no associated scale. Remember to compute the *width* or *height* with a square root to make the symbol’s *area* proportional to the quantity it describes.

```js
Plot.plot({
  grid: true,
  x: {axis: null, inset: 16},
  y: {domain: [0, 1]},
  marks: [
    Plot.ruleY([0, 1]),
    Plot.image(data, {
      x: (d, i) => i,
      y: ([value]) => value,
      width: ([value]) => Math.sqrt(value) * 30,
      src: ([, type]) => icons[type]
    })
  ]
})
```

Images can be of any format supported by your browser—note that the spec, however, covers only JPEG, PNG and SVG (the behavior for animated GIFs is left to the browser).

Images are referenced by the *src* channel, a string matching one of the following protocols: **https**, **http**, **blob**, **file**, or **data**.

Set the image size with the *width* and *height* options, either as a constant number or a channel. (If only one is specified, *width* defaults to *height* and *vice versa*.)

```js
Plot.image(apod.slice(0, 10), {x: "index", src: "url", height: 120}).plot({height: 160})
```

Control how the image fills the space with the [*preserveAspectRatio*](https://developer.mozilla.org/en-US/docs/Web/SVG/Attribute/preserveAspectRatio) option. A few typical options appear in the following menu below.

<!-- viewof preserveAspectRatio = Inputs.select(
  [
    "none",
    "xMidYMin meet",
    "xMidYMid meet",
    "xMidYMax meet",
    "xMidYMin slice",
    "xMidYMid slice",
    "xMidYMax slice"
  ],
  {
    label: "preserveAspectRatio",
    value: "xMidYMid meet" // default
  }
) -->

```js
Plot.plot({
  marginLeft: 0,
  marginRight: 0,
  x: {type: "point"},
  height: 160,
  marks: [
    Plot.image(apod.slice(0, 10), {
      x: "index",
      src: "url",
      width: 64,
      height: 100,
      preserveAspectRatio
    })
  ]
})
```

As we mentioned above, the *src* channel can be specified with several different protocols. These introduce tiny nuances in the way the image is loaded into the plot, and the browser’s security model might preclude some operations, such as downloading a png copy of the chart. We’ll explore these in details in the following section.

The **http**  protocol is never considered secure (with the possible exception of a server set on localhost). Your browser will probably accept to load the image and display it on the plot, but it will not allow any operation such as the rasterization needed to “download as PNG”.

The **https** protocol is considered secure if the images are hosted on the same server, for example the url of an observable file attachment:

https://science.nasa.gov/southern-jupiter-perijove-3

```js
Plot.image([{ url: junoAttachedUrl }], { x: 0, src: "url", width: 300 }).plot({
  width: 300,
  x: { axis: null },
  height: 250
})
```

However, when an image is hosted on a server with a different domain name (‘cross-origin’), it is considered secure only if it was explicitly called with a crossOrigin: anonymous header and the server allows it. If it doesn’t, you can use a proxy. To see the difference, use the “Download PNG” option on the gallery below, which uses a CORS proxy, and on the gallery above, which takes its images directly from the APOD website.

```js
Plot.image(apod.slice(10, 10 + width / 182), {
  x: (d,i) => i,
  src: d => `https://corsproxy.io/?${encodeURIComponent(d.url)}`,
  width: 182,
  height: 300,
  preserveAspectRatio: "xMidYMid slice",
  //crossOrigin: "anonymous" // this option is not supported by any browser
}).plot({
  width,
  x: { axis: null, type:"point" },
  height: 320,
  marginLeft: 0,
  marginRight: 0
})
```

The **data** protocol allows to use images that are defined as a full URL. This can be handy for SVG images.

<!-- xSquareIconDataUrl = `data:image/svg+xml;utf8,${await FileAttachment("x-square.svg").text()}` -->

<!-- activityIconDataUrl = `data:image/svg+xml;utf8,${await FileAttachment("activity.svg").text()}` -->

```js
Plot.plot({
  marks: [
    Plot.frame(),
    Plot.image(data, {
      src: d => d[1] === "o" ? activityIconDataUrl : xSquareIconDataUrl,
      x: (d, i) => i,
      y: null
    })
  ],
  x: {type: "point"}
})
```

The **blob** protocol allows to use images that have been stored in memory, like the eclipseBlob below:

<!-- eclipseBlob = FileAttachment("eclipse_js.jpg").blob().then(URL.createObjectURL) -->

```js
Plot.image([eclipseBlob], { x: 0, src: (d) => d, width: 300 }).plot({
  width: 300,
  x: { axis: null },
  height: 250
})
```

Finally, the **file** protocol will load images directly from your hard-drive—this works only in a context where Plot is launched from an HTML file that is also loaded directly.

Note that Plot.image will pass the *crossOrigin* option to the generated svg image elements; however browser support for this attribute is, at the time of this writing, [inexistent](https://caniuse.com/?search=svg%20crossorigin). (For more details on this topic, see “[Plot.image and crossOrigin](https://observablehq.com/@observablehq/plot-image-and-crossorigin).”)
