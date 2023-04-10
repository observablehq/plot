<script setup>

import * as Plot from "@observablehq/plot";
import * as d3 from "d3";

</script>

# Getting started

## Try Plot online

The fastest way to get started (and get help) with Plot is on [Observable](https://observablehq.com)! Plot is available by default in all Observable notebooks as part of the standard library. To use Plot on Observable, simply return the generated plot from a cell like so:

:::plot
```js
Plot.rectY({length: 10000}, Plot.binX({y: "count"}, {x: d3.randomNormal()})).plot()
```
:::

[Edit this on Observable →](https://observablehq.com/d/80126d030307e0ef)

This code uses *mark*.plot shorthand, which is convenient for plots with only a single mark. To layer multiple marks, use Plot.plot instead.

:::plot
```js
Plot.plot({
  marks: [
    Plot.ruleY([0]),
    Plot.lineY({length: 10000}, Plot.mapY("cumsum", {y: d3.randomNormal()}))
  ]
})
```
:::

[Edit this on Observable →](https://observablehq.com/d/c61f5404cd713543)

Observable includes a variety of Plot snippets when you click **+** to add a cell, as well as convenient [sample datasets](https://observablehq.com/@observablehq/sample-datasets) to try out Plot features. Or upload a CSV or JSON file to start playing with your data. You can even use [Observable’s chart cell](https://observablehq.com/@observablehq/chart-cell), which uses Plot’s [auto mark](./auto) under the hood, to create quick charts without writing code! You can then eject to JavaScript by clicking **+** to see the equivalent Plot code.

<figure>
  <video autoplay="" loop="" muted="" style="border: solid 1px var(--vp-c-text-3); display: inline;"><source src="https://videos.ctfassets.net/uklh5xrq1p2j/14CmTWsGQifvA5jZ8s0Usw/6efc7defa063038f8eb65bb269cb3823/Chart_Cell_Demo_Take_2_shorter.mp4" type="video/mp4"></video>
  <figcaption>Observable’s chart cell lets you quickly create charts and then eject to Plot code.</figcaption>
</figure>

Observable is free for public use. You can sign up for a [Pro account](https://observablehq.com/pricing) to connect to private databases, collaborate on private notebooks, and more.

## Loading Plot from a CDN

In vanilla HTML, you can load Plot from a CDN such as jsDelivr.

:::code-group

```html [ES module]
<script type="module">

import * as Plot from "https://cdn.jsdelivr.net/npm/@observablehq/plot@0.6/+esm";

</script>
```

```html [UMD]
<script src="https://cdn.jsdelivr.net/npm/d3@7"></script>
<script src="https://cdn.jsdelivr.net/npm/@observablehq/plot@0.6"></script>
```

:::

 We recommend using the ES module bundle as it automatically loads Plot’s dependency on D3, and because ES modules are the modern way. But for those you need it, the provided UMD bundle is AMD-compatible and exports the `Plot` global when loaded as a plain script.

## Installing Plot locally

If you’re developing a web application using Node, you can install Plot via npm, yarn, pnpm, or your preferred package manager.

:::code-group

```bash [yarn]
yarn add @observablehq/plot
```

```bash [npm]
npm install @observablehq/plot
```

```bash [pnpm]
pnpm add @observablehq/plot
```

:::

You can then load Plot into your app as:

```js
import * as Plot from "@observablehq/plot";
```

To optimize tree-shaking, you can instead import specific symbols:

```js
import {barX, barY} from "@observablehq/plot";
```

## First light with Plot

Plot.plot (or *mark*.plot when using shorthand) returns a DOM element—typically an SVG element. In Observable, you can simply return this element from your cell and Observable will display it for you.

Outside of Observable, you have to connect a few dots yourself. Typically this involves selecting a DOM element from the page (such as a DIV with a unique identifier, like *myplot* below), and then inserting your generated plot into it. For example, in vanilla HTML:

```html
<div id="myplot"></div>
<script type="module">

import * as Plot from "https://cdn.jsdelivr.net/npm/@observablehq/plot@0.6/+esm";

const plot = Plot.rectY({length: 10000}, Plot.binX({y: "count"}, {x: Math.random})).plot();
const div = document.querySelector("#myplot");
div.append(plot);

</script>
```

In React, you can use [useRef](https://react.dev/reference/react/useRef) to get a reference to a DOM element, and then [useEffect](https://react.dev/reference/react/useEffect) to generate and insert your plot. The example below also demonstrates asynchronously loading CSV data with [useState](https://react.dev/reference/react/useState).

```jsx
import * as Plot from "@observablehq/plot";
import * as d3 from "d3";
import {useEffect, useRef, useState} from "react";

function App() {
  const containerRef = useRef();
  const [data, setData] = useState();

  useEffect(() => {
    d3.csv("/gistemp.csv", d3.autoType).then(setData);
  }, []);

  useEffect(() => {
    if (data === undefined) return;
    const plot = Plot.plot({
      y: {grid: true},
      color: {scheme: "burd"},
      marks: [
        Plot.ruleY([0]),
        Plot.dot(data, {x: "Date", y: "Anomaly", stroke: "Anomaly"})
      ]
    });
    containerRef.current.append(plot);
    return () => plot.remove();
  }, [data]);

  return <div ref={containerRef} />;
}

export default App;
```

If you want to update your plot, say because your data has changed, simply throw away the old plot using [*element*.remove](https://developer.mozilla.org/en-US/docs/Web/API/Element/remove) and then replace it with a new one. That’s done above in the useEffect’s cleanup function.
