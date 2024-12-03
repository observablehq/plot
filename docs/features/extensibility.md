<script setup>

import * as Plot from "@observablehq/plot";
import * as d3 from "d3";
import * as htl from "htl";
import {geoAirocean} from "d3-geo-polygon";
import alphabet from "../data/alphabet.ts";
import penguins from "../data/penguins.ts";
import sftemp from "../data/sf-temperatures.ts";
import * as topojson from "topojson-client";
import {computed, ref, shallowRef, onMounted} from "vue";

const world = shallowRef(null);
const land = computed(() => world.value ? topojson.feature(world.value, world.value.objects.land) : {type: null});
const toCelsius = (f) => (f - 32) * (5 / 9);
const oleron = d3.piecewise(Array.from("#192659#1b275b#1d295c#1e2a5e#202c5f#212d61#232f62#243064#263265#273367#293568#2a376a#2c386b#2d3a6d#2f3b6f#303d70#323e72#344073#354275#374376#384578#3a467a#3b487b#3d4a7d#3f4b7e#404d80#424e82#445083#455285#475387#485588#4a578a#4c588c#4d5a8d#4f5c8f#515d91#525f92#546194#566296#586497#596699#5b689b#5d699d#5e6b9e#606da0#626ea2#6470a3#6572a5#6774a7#6975a9#6b77aa#6c79ac#6e7bae#707cb0#727eb2#7380b3#7582b5#7784b7#7985b9#7a87ba#7c89bc#7e8bbe#808dc0#828ec2#8390c3#8592c5#8794c7#8996c9#8b97cb#8d99cd#8e9bce#909dd0#929fd2#94a1d4#96a3d6#98a4d7#99a6d9#9ba8db#9daadd#9facde#a1aee0#a3afe2#a5b1e4#a6b3e5#a8b5e7#aab7e8#acb9ea#aebaeb#afbcec#b1beed#b3bfee#b4c1f0#b6c3f0#b8c4f1#b9c6f2#bbc7f3#bcc9f4#becaf4#bfccf5#c0cdf5#c2cff6#c3d0f6#c5d1f7#c6d3f7#c7d4f8#c9d5f8#cad7f8#cbd8f9#cdd9f9#cedbf9#cfdcfa#d1ddfa#d2dffb#d3e0fb#d5e1fb#d6e3fc#d7e4fc#d9e5fc#dae7fd#dbe8fd#dde9fd#deebfe#dfecfe#e1edfe#e2efff#e3f0ff#e5f1ff#e6f3ff#194c00#1c4d00#1f4e00#224e00#244f00#275000#295100#2c5100#2e5200#315300#335300#355400#375500#395500#3c5600#3e5700#405700#425800#445900#465900#485a00#4a5b00#4d5b01#4f5c01#515d01#535e02#555f03#575f03#5a6004#5c6105#5e6207#606308#63640a#65650c#67670e#6a6810#6c6912#6e6a14#716c16#736d18#756e1a#78701c#7a711e#7c7221#7e7423#817525#837627#85782a#87792c#8a7b2e#8c7c30#8e7d33#907f35#928037#948239#97833c#99843e#9b8640#9d8742#9f8945#a18a47#a48c49#a68d4c#a88f4e#aa9050#ac9252#af9455#b19557#b39759#b5985c#b89a5e#ba9c60#bc9e62#bf9f65#c1a167#c3a369#c5a56c#c8a66e#caa871#ccaa73#cfac75#d1ae78#d3af7a#d5b17c#d8b37f#dab581#dcb784#deb986#e0ba89#e2bc8b#e4be8e#e6c090#e8c293#e9c495#ebc698#ecc89a#eec99d#efcb9f#f0cda2#f1cfa4#f2d1a7#f3d2a9#f4d4ac#f4d6ae#f5d7b0#f6d9b3#f6dbb5#f7dcb7#f7deba#f7e0bc#f8e1be#f8e3c0#f9e4c3#f9e6c5#f9e8c7#f9e9ca#faebcc#faecce#faeed1#fbf0d3#fbf1d5#fbf3d8#fcf5da#fcf6dc#fcf8df#fdfae1#fdfbe4#fdfde6".matchAll(/#\w+/g), ([d]) => d));
const replayFadeIn = ref(0);

function interpolateDistance(index, width, height, X, Y, V) {
  // Instantiate a spatial index with d3-quadtree, for faster lookups
  const quadtree = d3.quadtree()
    .x((i) => X[i])
    .y((i) => Y[i])
    .addAll(index);
  // Create the output raster
  const R = new Float32Array(width * height);
  // For each point in the raster…
  for (let x = 0; x < width; ++x) {
    for (let y = 0; y < height; ++y) {
      // …find the closest sample…
      const i = quadtree.find(x, y);
      // …and save the distance from the pixel to the closest sample
      R[x + y * width] = Math.hypot(X[i] - x, Y[i] - y);
    }
  }
  return R;
}


onMounted(() => {
  d3.json("../data/countries-110m.json").then((data) => (world.value = data));
});

function envelopes(data, options) {
  return d3.ticks(-1, 1, 21).map((j) => Plot.lineY(data, Plot.map(
    { y: Plot.bollinger({ k: 1.5 * j, n: 20 }) },
    { strokeWidth: 1 - 0.95 * Math.abs(j) ** 0.7, ...options })
  ));
}

</script>

# Extensibility

Observable Plot is highly configurable, with a myriad of options covering many common use cases in the most concise way. These options — often represented as simple strings — encode standard and well-tested methods, with the goal of helping anyone go from zero to chart as quickly as possible.

Plot is also highly extensible, for when you need to go beyond these built-in behaviors and create unique features. Most of its options can be specified freely by writing JavaScript.

You can think of this as an escape hatch for when none of the pre-programmed choices fits your use case. You can also picture this as creating space for experimentation with advanced techniques, or as a general mechanism to “hack and customize” Plot, for example to create new mark types or plugins. It is also a way to make use of [extended map projections](https://github.com/d3/d3-geo-projection), which we wouldn’t want to bundle in with Plot.

The API for each of these options is minimal, in the sense that the JavaScript code you write is invoked with the data it needs. For example, a custom reducer only receives its input values (_e.g._ a window into a series in a facet). This ensures that your code focuses on its purpose, and that it will not need to be modified when new features are added. It also generally helps make things faster and more reliable.

If you have a use case for an extension that could be useful to more people, please open a [feature request](https://github.com/observablehq/plot/issues) describing what you’re trying to achieve. Someone in the community might also need this — or might already have built it!

Plot’s typescript declarations document the inputs and expected outputs of these options. When in doubt, please open a [GitHub discussion](https://github.com/observablehq/plot/discussions) or post a question [in the Observable forum](https://talk.observablehq.com/).

Below is an overview of the many places where writing custom JavaScript code allows you to go beyond the presets. Some sections are labeled with spices indicating a higher difficulty level.

## Chart definitions

### Tick format {#tickFormat}

The [tickFormat](./scales.md#position-scale-options) scale option can be specified as a function that takes as input the tick value, and returns a string. For custom abbreviations of day names:

:::plot
~~~js
Plot.plot({
  x: {tickFormat: (d) => ["*", "M", "Tu", "W", "Th", "F", "Sa"][d.getUTCDay()]},
  marks: [Plot.dotX(sftemp.slice(-12), {x: "date"})]
})
~~~
:::

### Title, subtitle, and caption {#title}

The **title**, **subtitle**, and **caption** options all accept DOM nodes (as well as strings), allowing you to get as funky as you want with tools that generate HTML such as [htl.html](https://github.com/observablehq/htl) and [md](https://github.com/observablehq/stdlib#markdown).

<figure style="max-width: initial; padding-left: 1em; border-left: solid 2px #ccc;"><h3 id="_who-cares-about-the-actual-chart-_"><em>Who cares about the actual chart?</em></h3><p>when it has a <em style="border-bottom: 2px solid red">good</em> title</p><svg fill="currentColor" font-family="system-ui, sans-serif" font-size="10" text-anchor="middle" width="400" height="60" viewBox="0 0 400 60"><rect aria-label="frame" fill="none" stroke="currentColor" x="0.5" y="0.5" width="399" height="59"></rect></svg><figcaption><p>👆 Notice <i>anything</i> missing?</p></figcaption></figure>

~~~js
Plot.plot({
  title: md`## _Who cares about the actual chart?_`,
  subtitle: htl.html`<p>when it has a <em style="border-bottom: 2px…`,
  marks: [Plot.frame()],
  caption: md`👆 Notice <i>anything</i> missing?`
})
~~~

### Projection {#projection}

You can render your [maps](./projections.md) with any of D3’s extended projections from [d3-geo-projection](https://github.com/d3/d3-geo-projection), or from any other module; for instance, [Fuller’s AirOcean](https://observablehq.com/@d3/fullers-airocean) projection:

:::plot
~~~js
// import {geoAirocean} from "d3-geo-polygon";
Plot.plot({
  projection: (options) => geoAirocean()
    .fitSize([options.width, options.height], {type: "Sphere"}),
  marks: [
    Plot.graticule(),
    Plot.sphere(),
    Plot.geo(land, {fill: "currentColor"})
  ]
})
~~~
:::

Writing a custom projection can also be fun, for example if you want a base for an [isometric perspective projection](https://observablehq.com/@fil/isometric-projection) or for [ternary plots](https://observablehq.com/@fil/ternary-plot). **TODO** publish and add to the Plot gallery.

### Style and className {#className}

You can use Plot’s **style** and **className** options to target the chart’s constituents with CSS. The corresponding CSS styles can be defined from inside the chart definition, using the style option, if they target the chart’s svg. They can be defined with a more complex stylesheet, that is either returned as a render function mark, or added as an external stylesheet to the document. (Note that each mark can have its own aria label, that can also be used to target a specific mark in the chart.)

### Post-processing techniques {#post-processing}

Plot returns an HTML figure element, or a raw SVG element containing the chart. Before you return the chart and add it to the DOM, you can manipulate it however you like. For example, make the dots fade in with:

:::plot hidden defer
~~~js
Plot.plot({
  height: 400,
  replayFadeIn,
  marks: [
    () => d3.select(Plot.dot(penguins, {
    x: "culmen_length_mm",
    y: "culmen_depth_mm",
    fill: "species",
    stroke: "white",
  }).plot()).call(chart => chart
      .selectAll("circle")
      .attr("stroke-width", 0)
      .attr("r", 0)
      .transition()
      .delay(replayFadeIn ? 500 : 4000)
      .duration(1500)
      .ease(d3.easeQuadIn)
      .attr("r", 6)
      .attr("stroke-width", 1.5)
    ).node()
  ]
})
:::

<button @click="replayFadeIn++">Replay</button>

~~~js
const chart = Plot.dot(penguins, {
  x: "culmen_length_mm",
  y: "culmen_depth_mm",
  fill: "species",
  stroke: "white"
}).plot();

d3.select(chart)
    .selectAll("circle")
    .attr("r", 0)
  .transition()
    .delay(500)
    .duration(1500)
    .attr("r", 6);
~~~

This type of post-processing can be as elaborated as you need!


### document 🌶 {#document}

The *context* argument of the render transform has a document property, which defaults to the browser document, and allows to create new nodes. This is useful in specific environments — such as server-side-rendering; for examples, see this [implementation of a trellis plot on val.town](https://www.val.town/v/fil.beckerBarley), or the [PlotRender](https://github.com/observablehq/plot/blob/main/docs/components/PlotRender.js) component we use to render the charts on this very website.

## Data transformations

### Channel value {#channel-value}

A [channel](./marks.md#marks-have-channels) can be specified as an **accessor function**. For example, this [candlestick chart](https://observablehq.com/@observablehq/plot-candlestick-chart?intent=fork) draws a vertical link between the opening and closing values of a stock ticker with a color showing whether the value has increased or decreased:

~~~js
stroke: (d) => Math.sign(d.Close - d.Open)
~~~

The function receives as arguments *d* the current datum, and *i* its index in the mark’s data.


### Filter {#filter}

The [filter transform](../transforms/filter.md#filter-transform) expects a channel, and works exactly as above. To keep only days when a stock’s closing value is higher than its opening value:

~~~js
filter: (d) => d.Close > d.Open
~~~

### Literal color {#literal-color}

Sometimes you will want to apply two color scales, but Plot only accepts one scale at the moment. Don't worry, you can opt out of scales for one mark, and apply literal colors (that might be obtained by applying your own custom scale) to the other. Since scales can be exported from a chart and reused in another one, you can even build the two scales in different plots, then apply them individually on each mark:

~~~js
chartSpecies = Plot.tickX(penguins, {
  x: "body_mass_g",
  stroke: "species"
}).plot({ color: { scheme: "Category10", legend: true } })

chartMass = Plot.tickX(penguins, {x: "body_mass_g", stroke: "body_mass_g"}).plot({color: {scheme: "Reds", legend: true}})

combined = {
  const colorMass = chartMass.scale("color").apply;
  const colorSpecies = chartSpecies.scale("color").apply;
  return Plot.plot({
    marginLeft: 80,
    marks: [
      Plot.dot(penguins, {
        x: "body_mass_g",
        y: "species",
        fill: (d) => colorSpecies(d["species"]),
        dy: -3
      }),
      Plot.dot(penguins, {
        x: "body_mass_g",
        y: "species",
        fill: (d) => colorMass(d["body_mass_g"]),
        dy: 3
      })
    ]
  });
}
~~~


### Channel transform  {#channel-transform}

A [channel](./marks.md#marks-have-channels) can be specified as an object with a **transform** method. For example, to standardize temperatures:

~~~js
Plot.line(sftemp, {
  x: "date",
  y: {
    transform: (data) => {
      const values = Plot.valueof(data, "high");
      const mean = d3.mean(values);
      const deviation = d3.deviation(values);
      return values.map((d) => (d - mean) / deviation);
    }
  },
  stroke: "steelblue"
}).plot({
  y: { grid: true, label: "σ" },
  marks: [Plot.ruleY([0])]
})
~~~

:::tip
This operates on the whole dataset; if you have multiple series and want to standardize each series independently, consider a map transform.
:::

### Map method {#map}

The example below shows a custom [map](../transforms/map.md) method that implements a standardization of the *y* channel series by series (**TODO** there is only one series, though).

:::plot
~~~js
Plot.plot({
  y: { grid: true, label: "σ" },
  marks: [
    Plot.ruleY([0]),
      Plot.lineY(sftemp, Plot.mapY((values) => {
        const mean = d3.mean(values);
        const deviation = d3.deviation(values);
        return values.map((d) => (d - mean) / deviation);
      }, {x: "date", y: "high", stroke: "steelblue"})
    )
  ]
})

~~~
:::



### Interval {#interval}

Plot has a lot of built-in [intervals](../transforms/interval.md), that you can invoke with strings such as "week" or even "2 days", and use in several options transforms (such as the bin transform), or even as a scale transform. If this is not enough, you can try a custom interval, say to map numbers to a symmetric segment around the integer part of the number — and help draw a histogram chart where each bin is centered on the closest integer:

:::plot
~~~js
Plot.rectY(
  Array.from({length: 400}, d3.randomNormal(0, 3)),
  Plot.binX(
    {y: "count"},
    {
      interval: {
        floor: (d) => Math.floor(d + 0.5) - 0.5,
        offset: (d, n = 1) => d + n,
        range: d3.range
      }
    }
  )
).plot()
~~~
:::

A custom interval must provide the floor, offset and range methods, and the floor function _f_ must be idempotent, so that _f_(_f_(x)) = _f_(x). For another example of a custom range, see the [extended interval](https://observablehq.com/@recifs/plot-extended-interval) notebook.


### Bin and group reducer {#bin-reducer}

The [bin](../transforms/bin.md) and [group](../transforms/group.md) transforms aggregate values that share a common trait, reducing them to a single value. The reducer can be a function, that receives for each group the input values (if an input channel is defined), or else the input data.

:::plot
~~~js
Plot.barX(penguins, Plot.groupY({
    x: (groupData) => new Set(groupData).size // equivalent of "distinct"
  },
  { x: "island", y: "species" })
).plot({width: 320, marginLeft: 80})
~~~
:::

This is useful when creating a detailed title for [interactive tips](./marks.md#mark-options).

:::plot
~~~js
Plot.plot({
  width: 500,
  marginLeft: 80,
  marks: [
    Plot.barX(
      penguins,
      Plot.groupY({
        x: "count",
        title: (data) => `Islands: ${[...new Set(data)].join(", ")}`
      },
      { x: "island", y: "species", tip: true })
    )
  ]
})
~~~
:::

The same is true for the bin transform; in addition, the reducer function receives an object describing the bin’s extent, as the second argument:

:::plot
~~~js
Plot.barX(
  penguins,
  Plot.binX(
    {
      fill: "count",
      title: (data, {x1, x2}) =>
        `The ${x1}—${x2} bin\nincludes ${data.length} penguins.`
    },
    { x: "body_mass_g", tip: true }
  )
).plot({color: {scheme: "Blues"}, marginBottom: 35})
~~~
:::

Both these transforms also accept an object implementing the reduceIndex method, that receives as arguments an index I into the values (or data) S. This is used internally for performance reasons (since it avoids copying the data), but it can also be, say, to compare the median of each group (or bin) with the median of its out-group:

~~~js
Plot.rectY(
  penguins,
  Plot.binX({
    fill: "count",
    y: {
      reduceIndex: (I, S) => {
        const index = new Set(I); // for fast look-ups
        return (
          d3.median(I, (i) => S[i]) /
          d3.median(S, (d, i) => (index.has(i) ? NaN : d))
        );
      }
    }
  },
  { x: "body_mass_g", y: "body_mass_g" })
).plot()
~~~

### Map and window reducer {#map-reducer}

The [window transform](../transforms/window.md) takes a moving window of *n* values in the series, and reduces it to a single value. This allows to compute a moving average, maximum, minimum, etc. When you have more specific asks, you can write a custom reducer as a function. There are three flavor of custom reducers for the map and window transforms.

In the first example, we’ll use the simplest one: a function that reads the values belonging to the window (or series, in the case of the map transform). To get a better estimate of a moving average over noisy data, our analyst wants to discard the four outermost values (the two highest and the two lowest) before computing the mean. In the chart below, this makes the blue line — where outliers have been removed — more regular than the red line, which uses the usual "mean" reducer.

:::plot
~~~js
Plot.plot({
  y: { grid: true, nice: true },
  marks: [
    Plot.dot(sftemp, {x: "date", y: "high", fill: "currentColor", r: 1.5}),
    Plot.line(
      sftemp,
      Plot.windowY({
        k: 10,
        x: "date",
        y: "high",
        stroke: "red",
        strokeWidth: 0.8
      })
    ),
    Plot.line(
      sftemp,
      Plot.windowY({
        k: 10,
        reduce: (values) => d3.mean(d3.sort(values).slice(2, -2)),
        x: "date",
        y: "high",
        stroke: "steelblue"
      })
    )
  ]
})
~~~
:::

The map and window transforms can also receive a function to be passed an index and array of channel values, returning new values. This is used internally mostly for performance purposes (since the array of channel values is now the same for all the calls, avoiding thrashing memory); as such, the reducer above could be written as:

~~~js
reduce: (I, V) => d3.mean(d3.sort(I, (i) => V[i]).slice(2, -2), (i) => V[i]),
~~~

Finally, a map reducer can be written as an object that implements the mapIndex method, receiving an index, an array of channel values, and a target array; for instance the _cumsum_ map reducer is designed as a loop though each series I, that adds each (valid) number in turn and fills the target array:

~~~js
{
  mapIndex(I, S, T) {
    let sum = 0;
    for (const i of I) T[i] = sum += S[i];
  }
}
~~~

If you wanted to count, say, the number of positive minus the number of negative values, you could adapt this function like so:

~~~js
{
  mapIndex(I, S, T) {
    let sum = 0;
    for (const i of I) T[i] = sum += Math.sign(S[i]);
  }
}
~~~

### Transform, initializer 🌶 {#transform}

The [transform](./transforms.md) option is a generic entry point through which Plot operates on the mark’s data — for grouping, binning, sorting, stacking, etc. It can be specified as a custom function of the *data* and *facets*, as well as the top-level *options*, as documented [here](./transforms.md#custom-transforms). This is not something that you will usually do when developing a particular chart, but rather if you are working on a new feature for Plot. Transforms operate in data space, before the scales are computed.

By contrast, the [initializer](./transforms.md#initializer) option is called after the scales are computed. It can create new channels, and it can also ask Plot to generate new scales. This is typically where an options transform such as [hexbin](../transforms/hexbin.md) operates: it reads scaled values of x and y, and generates counts (for example) of the data values that belong to each hexagon. These counts can then be encoded with a new color scale, or radius scale, to create hexagonal bins. Writing a custom initializer is not easy, and will be mostly used by developers who want to create elaborate transformations on scaled data, akin to the [dodge](../transforms/dodge.md) or hexbin transforms.




## Visual encoding

### Scale transform  {#scale-transform}

A [scale transform](../features/scales.md#scale-transforms) can be any function mapping the actual data domain to the scale’s domain. For example, multiplying by 100 to transform a ratio (in the [0, 1] interval) into a percentage; or, if the data has temperatures in Fahrenheit (°F), to have a scale use Celsius (°C) instead.

~~~js
const toCelsius = (f) => (f - 32) * (5 / 9);
~~~

Note in particular how the ticks, grid, etc. and even the tip contents reflect the transformed values:

:::plot defer
~~~js
Plot.plot({
  y: {grid: true, transform: toCelsius, label: "temp. (high, °C)"},
  color: {legend: true, transform: toCelsius, label: "temp. (low, °C)"},
  marks: [Plot.dot(sftemp, {x: "date", y: "high", fill: "low", tip: true})]
})
~~~
:::

Another typical use case of the scale’s transform option is when you want to facet countries by continent. Here’s a toy example:

:::plot
~~~js
Plot.plot({
  marginLeft: 80,
  fy: {
    transform: country =>
      ["Peru", "Ecuador"].includes(country) ? "Americas" : "Africa"
  },
  marks: [
    Plot.barX(
      [
        {country: "Nigeria", value: 8},
        {country: "South Africa", value: 14},
        {country: "Zimbabwe", value: 19},
        {country: "Ecuador", value: 4},
        {country: "Peru", value: 17}
      ],
      { fy: "country", fill: "country", x: "value" }
    )
  ]
})
~~~
:::

Plot doesn’t yet allow the creation of custom scales — they must be one of the pre-programmed types. However, when you need a specific scale, it is often the case that it can be mapped to a linear scale with a transform function. For example, to create a [logit scale](https://en.wikipedia.org/wiki/Logit), you would map a linear domain to the logistic domain with:

~~~js
const logit = (p) => Math.log(p / (1 - p));
// x: {transform: logit}
~~~

Let’s also mention that an interval’s floor function can be used as a scale transform, here aligning all the dots on the start of each week. (However, it is better in that case to use the [interval](./scales.md#scale-transforms) scale option instead, which passes more information to the scale.)

~~~js
Plot.plot({
  x: { transform: d3.utcWeek },
  marks: [Plot.dot(sftemp.slice(-90, -10), { x: "date", y: "high" })]
})
~~~

### Color interpolator {#color-interpolator}

Plot cannot incorporate all the color palettes in the universe as built-in color schemes. But does this mean we’re missing out on great color palettes, such as Fabio Crameri’s [scientific color maps](https://www.fabiocrameri.ch/colourmaps/)? No!, because we can always load those and make a custom color interpolator. For example, the code below creates a function which associates the diverging _oleron_ color map to any number between 0 and 1, with [d3.piecewise](https://d3js.org/d3-interpolate/value#piecewise) (but it could be any custom function):

~~~js
const oleron = d3.piecewise(Array.from("#192659#1b275b#1d295c#1e2a5e#202c5f#212d61#232f62#243064#263265#273367#293568#2a376a#2c386b#2d3a6d#2f3b6f#303d70#323e72#344073#354275#374376#384578#3a467a#3b487b#3d4a7d#3f4b7e#404d80#424e82#445083#455285#475387#485588#4a578a#4c588c#4d5a8d#4f5c8f#515d91#525f92#546194#566296#586497#596699#5b689b#5d699d#5e6b9e#606da0#626ea2#6470a3#6572a5#6774a7#6975a9#6b77aa#6c79ac#6e7bae#707cb0#727eb2#7380b3#7582b5#7784b7#7985b9#7a87ba#7c89bc#7e8bbe#808dc0#828ec2#8390c3#8592c5#8794c7#8996c9#8b97cb#8d99cd#8e9bce#909dd0#929fd2#94a1d4#96a3d6#98a4d7#99a6d9#9ba8db#9daadd#9facde#a1aee0#a3afe2#a5b1e4#a6b3e5#a8b5e7#aab7e8#acb9ea#aebaeb#afbcec#b1beed#b3bfee#b4c1f0#b6c3f0#b8c4f1#b9c6f2#bbc7f3#bcc9f4#becaf4#bfccf5#c0cdf5#c2cff6#c3d0f6#c5d1f7#c6d3f7#c7d4f8#c9d5f8#cad7f8#cbd8f9#cdd9f9#cedbf9#cfdcfa#d1ddfa#d2dffb#d3e0fb#d5e1fb#d6e3fc#d7e4fc#d9e5fc#dae7fd#dbe8fd#dde9fd#deebfe#dfecfe#e1edfe#e2efff#e3f0ff#e5f1ff#e6f3ff#194c00#1c4d00#1f4e00#224e00#244f00#275000#295100#2c5100#2e5200#315300#335300#355400#375500#395500#3c5600#3e5700#405700#425800#445900#465900#485a00#4a5b00#4d5b01#4f5c01#515d01#535e02#555f03#575f03#5a6004#5c6105#5e6207#606308#63640a#65650c#67670e#6a6810#6c6912#6e6a14#716c16#736d18#756e1a#78701c#7a711e#7c7221#7e7423#817525#837627#85782a#87792c#8a7b2e#8c7c30#8e7d33#907f35#928037#948239#97833c#99843e#9b8640#9d8742#9f8945#a18a47#a48c49#a68d4c#a88f4e#aa9050#ac9252#af9455#b19557#b39759#b5985c#b89a5e#ba9c60#bc9e62#bf9f65#c1a167#c3a369#c5a56c#c8a66e#caa871#ccaa73#cfac75#d1ae78#d3af7a#d5b17c#d8b37f#dab581#dcb784#deb986#e0ba89#e2bc8b#e4be8e#e6c090#e8c293#e9c495#ebc698#ecc89a#eec99d#efcb9f#f0cda2#f1cfa4#f2d1a7#f3d2a9#f4d4ac#f4d6ae#f5d7b0#f6d9b3#f6dbb5#f7dcb7#f7deba#f7e0bc#f8e1be#f8e3c0#f9e4c3#f9e6c5#f9e8c7#f9e9ca#faebcc#faecce#faeed1#fbf0d3#fbf1d5#fbf3d8#fcf5da#fcf6dc#fcf8df#fdfae1#fdfbe4#fdfde6".matchAll(/#\w+/g), ([d]) => d));

oleron(0.333); // a light blue color, at 1/3 of the [0, 1] domain
~~~

This function can be passed as a color interpolator:

:::plot defer
~~~js
Plot.plot({
  width: 500,
  aspectRatio: 1,
  color: {
    interpolate: oleron,
    type: "diverging",
    legend: true,
    ticks: 5
  },
  marks: [
    Plot.contour({
      x1: -1.5, x2: 1.5, y1: 2, y2: 0,
      fill: (x, y) => 0.05 + Math.atan2(y, x) * (y - x * x),
      thresholds: 30
    })
  ]
})
~~~

### Gradients and patterns  {#gradients}

To stroke or fill a shape with a gradient, a pattern, or an image, specify the **stroke** or **fill** option as a [funciri](https://developer.mozilla.org/en-US/docs/Web/SVG/Content_type#funciri) that reference another element anywhere in the document. If you want to create that element within the chart, you can use the render function:

:::plot defer https://observablehq.com/@observablehq/plot-gradient-bars
```js
Plot.plot({
  marks: [
    () => htl.svg`<defs>
      <linearGradient id="gradient" gradientTransform="rotate(90)">
        <stop offset="15%" stop-color="purple" />
        <stop offset="75%" stop-color="red" />
        <stop offset="100%" stop-color="gold" />
      </linearGradient>
    </defs>`,
    Plot.barY(alphabet, {x: "letter", y: "frequency", fill: "url(#gradient)"}),
    Plot.ruleY([0])
  ]
})
```
:::

The [gradient encoding](https://observablehq.com/@observablehq/plot-gradient-encoding?intent=fork) notebook shows how to create a gradient informed by the chart’s scales, for consistent encoding. Funciri can also be used in the range of an ordinal scale, as in [this notebook](https://observablehq.com/@observablehq/cheysson-plot).


### Symbol 🌶 {#symbol}

A custom dot [symbol](../marks/dot.md#dot-options) can be specified as an object with a draw method; for instance, the "circle" symbol is equivalent to:

~~~js
{draw: (context, r) => context.arc(0, 0, Math.sqrt(r), 0, 2 * Math.PI)}
~~~

The context accepts [turtle commands](https://observablehq.com/@d3/d3-path). Now, if we want flowers:

:::plot
~~~js
Plot.dot(penguins.slice(120, 180), {
  x: "body_mass_g",
  y: "culmen_length_mm",
  strokeWidth: 0.5,
  stroke: "species",
  r: 14,
  symbol: {
    draw: (context, size) => {
      const r = Math.sqrt(size / Math.PI);
      context.moveTo(0, 0);
      let i;
      for (i = 1; i < 50; ++i) { 
        const a = (i * Math.PI) / 25;
        const rho = r * Math.abs(Math.sin(5 * a / 2));
        context.lineTo(rho * Math.cos(a), rho * Math.sin(a));
      }
      context.closePath();
    }
  }
}).plot({inset: 20, nice: true})
~~~
:::

### Marker 🌶 {#marker}

[Markers](./markers.md#markers) are similar to symbols (they can draw a shape at a certain location), but their API is quite different, expecting a color and returning a SVG [marker element](https://developer.mozilla.org/en-US/docs/Web/SVG/Element/marker):

:::plot defer
~~~js
Plot.plot({
  marks: [
    Plot.line(sftemp.slice(-90, -10), {
      x: "date",
      y: "high",
      stroke: "red",
      marker: (color) => htl.svg`<marker
          viewBox="-4 -4 8 8"
          style="overflow: visible; fill-opacity: 0.2;"
        ><ellipse rx=20 ry=8 stroke="${color}" fill="${color}">`
    }),
  ]
})
~~~
:::

### Vector shape 🌶 {#vector-shape}

Custom [vector shapes](../marks/vector.md#vector-options) are similar to symbols: their draw method is passed a context, length, and radius, and applies [turtle commands](https://observablehq.com/@d3/d3-path) to the context. If you use anchor: start, the shape’s coordinate system’s origin is at the point’s location. The radius parameter allows to create shapes with a secondary dimension (like the base of the triangle for the spike shape).

:::plot
~~~js
Plot.plot({
  marks: [
    Plot.vector(sftemp.slice(-90, -10), {
      x: "date",
      y: "high",
      length: 20,
      anchor: "start",
      r: 4,
      shape: {
        draw: (context, length, radius) => {
          context.moveTo(0, -length / 2);
          context.lineTo(0, length / 2);
          context.arc(0, 0, radius, Math.PI / 2, 2.5 * Math.PI/2)
        }
      }
    })
  ]
})
~~~
:::

### Curve 🌶 {#curve}

Custom [curves](./curves.md#curves) can be written exactly as with [d3-shape](https://d3js.org/d3-shape/curve#custom-curves); creating a new curve from scratch is beyond the scope of this page, though.

## Mark rendering

### Composite marks {#composite-marks}

The [marks](./plots.md#marks-option) option is an array of marks, possibly nested. A function that reads *data* and *options*, then prepares the data, sets some options, and returns an array of (sub-) marks thus fits in. For instance, here is a [composite mark](./marks.md#marks) that uses the [bollinger map method](https://observablehq.com/plot/marks/bollinger#bollinger) to return 21 line marks expressing the uncertainty of a signal:

~~~js
function envelopes(data, options) {
  return d3.ticks(-1, 1, 21).map((j) => Plot.lineY(data, Plot.map(
    { y: Plot.bollinger({ k: 1.5 * j, n: 20 }) },
    { strokeWidth: 1 - 0.95 * Math.abs(j) ** 0.7, ...options })
  ));
}
~~~

:::plot
~~~js
Plot.plot({
  marks: [
    Plot.frame(),
    envelopes(sftemp, {x: "date", y: "high"}),
    Plot.dot(sftemp, {fill: "brown", r: 1.5, x: "date", y: "high"})
  ]
})
~~~
:::

### Conditional marks {#conditional-marks}

Null(ish) marks are also accepted, and do… nothing. This quite dull feature allows a developer to create conditional marks that kick in or are ignored when an arbitrary criterion is met. For example, the [bollingerY](https://github.com/observablehq/plot/blob/main/src/marks/bollinger.js) composite mark usually returns an area mark to denote the uncertainty band, and a line mark to denote the trailing average of the value. However when the _fill_ option is set to none, it returns null instead of the area mark, and similarly when the _stroke_ option is set to none, it returns null instead of the line mark — thus avoiding unnecessary computations.


### Spatial interpolator 🌶 {#spatial-interpolator}

[Spatial interpolators](../marks/raster.md#spatial-interpolators) power the raster and contour marks. They attribute a value to every pixel on a grid, based on an array of samples that have x and y coordinates and a value. The built-in interpolators allow to evaluate a pixel based on the nearest neighbor, or through a random walk that returns the first match, for example. However these built-ins are far from covering the whole extent of spatial interpolators that exist in the scientific literature. Programming a custom interpolator can be a fun challenge. Once you do it, it will be available to derive contours and rasters alike, across the diverse landscape of Plot use-cases (including map projections, faceting, etc.). The only thing you need to care about is to fill the output, which is an array representing a grid of pixels.

In the following example, we’ll color each pixel by its distance to the closest sample, up to 15 pixels. To make the look-ups fast enough, we’ll first build a spatial index (with [d3-quadtree](https://d3js.org/d3-quadtree); note however that with a bit of optimization, [delaunay.find](https://d3js.org/d3-delaunay/delaunay#delaunay_find) is faster when, like here, we compute _every_ pixel).

:::plot hidden defer
~~~js
Plot.raster(penguins, {
    x: "body_mass_g",
    y: "culmen_length_mm",
    fill: 1,
    interpolate: interpolateDistance
  }
).plot({
  color: { scheme: "Cool", legend: true, domain: [0, 60], clamp: true }
})
~~~
:::

~~~js
Plot.raster(penguins, {
    x: "body_mass_g",
    y: "culmen_length_mm",
    fill: 1,
    interpolate: function (index, width, height, X, Y, V) {
      // Instantiate a spatial index with d3-quadtree, for faster lookups
      const quadtree = d3.quadtree()
        .x((i) => X[i])
        .y((i) => Y[i])
        .addAll(index);

      // Create the output raster
      const R = new Float32Array(width * height);

      // For each point in the raster…
      for (let x = 0; x < width; ++x) {
        for (let y = 0; y < height; ++y) {
          // …find the closest sample…
          const i = quadtree.find(x, y);
          // …and save the distance from the pixel to the closest sample
          R[x + y * width] = Math.hypot(X[i] - x, Y[i] - y);
        }
      }
      return R;
    }
  }
).plot({
  color: { scheme: "Cool", legend: true, domain: [0, 60], clamp: true }
})
~~~

:::tip
Plot’s built-in interpolators are also JavaScript functions, that can be used as a first step to build a different interpolator, or to compute rasters meant to be used outside of Plot!
:::

#### Random number generator {#random}

The built-in spatial interpolators also accept a custom random number generator (they default to a fixed-seed randomLcg, for reproducible results). Why should we care about customizing the random numbers? First of all, we might want a non-fixed seed random generator, for charts that vary (slightly) on each run. Another use case is to base the randomness of spatial interpolators on _blue noise_, which has good properties. Creating a blue-noise generator is out of scope for this page, though.

### Custom marks 🌶  {#marks}

[Marks](./marks.md) are class objects with various methods that Plot calls in sequence to:
1. _construct_ the mark: define its constant options and its channels.
2. _initialize_ (apply the transforms and gather the channels)
3. re-initialize with the scales, if an initializer is present in the options
4. _scale_ the values, _project_ the points if a projection is present
5. _filter_ out invalid values
6. _render_ a svg fragment to append to the current facet

Each of these steps can be modified in JavaScript by extending the default [Mark class](https://github.com/observablehq/plot/blob/main/src/mark.js). (It is often easier to extend a built-in mark class — for example Text if the mark you want to create is similar to a text mark.)

A custom mark can be as simple as changing a default option, for example the [hexagon](https://observablehq.com/plot/marks/dot#hexagon) mark just [sets](https://github.com/observablehq/plot/blob/8b9016a5da5b3e26c5ab0ebf934553e8e20f0d03/src/marks/dot.js#L150) the **symbol** option to “hexagon”. On the other end of the spectrum, a mark can overload all the methods.

The example below shows how to extend the Dot mark with a custom filter method that spiks circles whose _scaled_ radius is less than 3 pixels. (Note that this is different from the [filter transform](../transforms/filter.md#filter-transform) which operates in data space.)

~~~js
class DotFiltered extends Plot.Dot {
  filter(index, channels, values) {
    return index.filter((i) => values.r[i] > 3);
  }
}

new DotFiltered(sftemp, {
  x: "date",
  y: "high",
  r: "low"
}).plot();
~~~

### Render functions  {#render-function}

A minimalist mark can be specified as a function that renders a SVG fragment. Such a mark doesn’t participate in settings the scales, etc. For example, to add a watermark or a logo to a chart, using the hypertext literal library [htl](https://github.com/observablehq/htl):

~~~js
Plot.plot({
  marks: [
    Plot.frame(),
    () => htl.svg`<image x="530" y="30" width="80" height="80"
        xlink:href="https://example.tld/logo.png">`
  ]
})
~~~

The arguments passed to the render function contain enough information to allow us to position the image with resspect to the scales and the frame’s dimensions. These arguments are fully documented with the [marks feature](./marks.md). For example: 

::: plot
~~~js
Plot.plot({
  marks: [
    Plot.frame(),
    Plot.dot(sftemp, {
      x: "date",
      y: "high",
      fill: "gray"
    }),

    // position a logo wrt the frame’s dimensions
    (index, scales, values, dimensions, context) => {
      const size = 80; // logo image size
      const inset = 10; // separation between logo and frame
      const x = dimensions.width - dimensions.marginRight;
      const y = dimensions.marginTop;
      const g = context.document.createElementNS("http://www.w3.org/2000/svg", "g");
      g.innerHTML = `<image x=${x - size - inset} y=${y + inset} width=${size} height=${size} xlink:href="https://upload.wikimedia.org/wikipedia/commons/2/22/SVG_Simple_Logo.svg">`;
      return g;
    },

    // position the annotation wrt the scales
    (index, scales, values, dimensions, context) => {
      const x = scales.x(new Date("2011-04-01"));
      const y = scales.y(45.5);
      const g = context.document.createElementNS("http://www.w3.org/2000/svg", "g");
      g.innerHTML = `<g transform="translate(${x},${y})"><text text-anchor="start" font-size=20>👈 YOU ARE HERE`;
      return g;
    }
  ]
})
~~~
:::

Note that an SVG image is a perfectly legal SVG child element inside another SVG image. This allows to create a [plot of plots](https://observablehq.com/@observablehq/plot-of-plots).

### Render transforms 🌶 {#render-transforms}

Render transforms take over the last stage of the process: rendering the processed data to the screen. This power can be used modestly, for example to tweak the usual representation by adding a fade-in effect. You can also totally replace the usual render method with a different technique — for example to render to a canvas image appended to a [foreignObject](https://developer.mozilla.org/en-US/docs/Web/SVG/Element/foreignObject), if you need to draw hundred of thousands of dots. This is where you can plug custom [interactions](./interactions.md), invoke the [SVG animation API](https://developer.mozilla.org/en-US/docs/Web/SVG/Element/animate), or add asynchronous functions for delayed rendering. The [marks feature](./marks.md#custom-marks) **TODO** PR [#1811](https://github.com/observablehq/plot/pull/1811) page goes through the complete API, and details a few examples.

:::tip
Render transforms are so powerful that it is tempting to use them as a go-to _hook_ to modify a mark; keep in mind however that it is not always the best approach!
:::
