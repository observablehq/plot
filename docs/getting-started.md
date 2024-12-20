---
next:
  text: Plots
  link: /features/plots
---

<script setup>

import * as Plot from "@observablehq/plot";
import * as d3 from "d3";

</script>

# Getting started

Observable Plot supports a variety of environments.

## Try Plot online

The fastest way to get started (and get help) with Observable Plot is on [Observable](https://observablehq.com)! Plot is available by default in notebooks as part of Observable’s standard library. To use Plot, simply return the generated plot from a cell like so:

:::plot https://observablehq.com/@observablehq/plot-normal-histogram
```js
Plot.rectY({length: 10000}, Plot.binX({y: "count"}, {x: d3.randomNormal()})).plot()
```
:::

Observable includes a variety of Plot snippets when you click **+** to add a cell, as well as convenient [sample datasets](https://observablehq.com/@observablehq/sample-datasets) to try out Plot features. Or upload a CSV or JSON file to start playing with your data. You can even use [Observable’s chart cell](https://observablehq.com/@observablehq/chart-cell), which uses Plot’s [auto mark](./marks/auto.md) under the hood, to create quick charts without writing code! You can then eject to JavaScript by clicking **+** to see the equivalent Plot code.

<figure>
  <video autoplay loop muted playsinline style="width: 688px; max-width: 100%; aspect-ratio: 688 / 488; border: solid 1px var(--vp-c-text-3); display: inline;">
    <source src="https://videos.ctfassets.net/uklh5xrq1p2j/14CmTWsGQifvA5jZ8s0Usw/6efc7defa063038f8eb65bb269cb3823/Chart_Cell_Demo_Take_2_shorter.mp4" type="video/mp4">
  </video>
  <figcaption>Observable’s chart cell lets you quickly create charts and then eject to Plot code.</figcaption>
</figure>

Observable is free for public use. Sign up for a [Pro account](https://observablehq.com/pricing) to connect to private databases, collaborate on private notebooks, and more.

## Plot in vanilla HTML

In vanilla HTML, you can load Plot from a CDN such as jsDelivr or you can download it locally. We recommend using the CDN-hosted ES module bundle as it automatically loads Plot’s dependency on [D3](https://d3js.org). But for those who need it, we also provide a UMD bundle that exports the `Plot` global when loaded as a plain script.

:::code-group
```html [ESM + CDN]
<!DOCTYPE html>
<div id="myplot"></div>
<script type="module">

import * as Plot from "https://cdn.jsdelivr.net/npm/@observablehq/plot@0.6/+esm";

const plot = Plot.rectY({length: 10000}, Plot.binX({y: "count"}, {x: Math.random})).plot();
const div = document.querySelector("#myplot");
div.append(plot);

</script>
```

```html [UMD + CDN]
<!DOCTYPE html>
<div id="myplot"></div>
<script src="https://cdn.jsdelivr.net/npm/d3@7"></script>
<script src="https://cdn.jsdelivr.net/npm/@observablehq/plot@0.6"></script>
<script type="module">

const plot = Plot.rectY({length: 10000}, Plot.binX({y: "count"}, {x: Math.random})).plot();
const div = document.querySelector("#myplot");
div.append(plot);

</script>
```

```html [UMD + local]
<!DOCTYPE html>
<div id="myplot"></div>
<script src="d3.js"></script>
<script src="plot.js"></script>
<script type="module">

const plot = Plot.rectY({length: 10000}, Plot.binX({y: "count"}, {x: Math.random})).plot();
const div = document.querySelector("#myplot");
div.append(plot);

</script>
```
:::

Plot returns a detached DOM element — either an [SVG](https://developer.mozilla.org/en-US/docs/Web/SVG) or [HTML figure](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/figure) element. In vanilla web development, this means you need to insert the generated plot into the page to see it. Typically this is done by selecting a DOM element (such as a DIV with a unique identifier, like `myplot` above), and then calling [*element*.append](https://developer.mozilla.org/en-US/docs/Web/API/Element/append).

If you’d prefer to run Plot locally (or entirely offline), you can download the UMD bundle of Plot along with its dependency, D3, here:

- <a href="./d3.js" download>d3.js</a>
- <a href="./plot.js" download>plot.js</a>

Then, create an `index.html` file as shown above in the **UMD + local** tab. If you prefer smaller minified files, you can download <a href="./d3.min.js" download>d3.min.js</a> and <a href="./plot.min.js" download>plot.min.js</a>, and then update the `src` attributes above accordingly.

## Installing from npm

If you’re developing a web application using Node, you can install Plot via yarn, npm, pnpm, or your preferred package manager.

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

You can instead import specific symbols if you prefer:

```js
import {barY, groupX} from "@observablehq/plot";
```

Plot includes TypeScript declarations with extensive documentation. We highly recommend using an editor with enhanced code completion such as Visual Studio Code or Observable.

<figure>
  <img style="border: solid 1px var(--vp-c-text-3); display: inline; width: 688px; max-width: 100%; aspect-ratio: 420 / 197;" src="./ts-property.png">
  <figcaption>Modern editors surface documentation and type hints as you write Plot code.</figcaption>
</figure>

## Plot in React

We recommend two approaches for Plot in React depending on your needs.

The first is to server-side render (SSR) plots. This minimizes distracting reflow on page load, improving the user experience. For this approach, use the [**document** plot option](./features/plots.md) to tell Plot to render with React’s virtual DOM. For example, here is a PlotFigure component:

:::code-group
```js [PlotFigure.js]
import * as Plot from "@observablehq/plot";
import {createElement as h} from "react";

export default function PlotFigure({options}) {
  return Plot.plot({...options, document: new Document()}).toHyperScript();
}
```
:::

:::info
For brevity, the virtual `Document` implementation is not shown. You’ll find it linked below.
:::

Then, to use:

:::code-group
```jsx [App.jsx]
import * as Plot from "@observablehq/plot";
import PlotFigure from "./PlotFigure.js";
import penguins from "./penguins.json";

export default function App() {
  return (
    <div>
      <h1>Penguins</h1>
      <PlotFigure
        options={{
          marks: [
            Plot.dot(penguins, {x: "culmen_length_mm", y: "culmen_depth_mm"})
          ]
        }}
      />
    </div>
  );
}
```
:::

See our [Plot + React CodeSandbox](https://codesandbox.io/s/plot-react-f1jetw?file=/src/App.js) for details.

Server-side rendering is only practical for simple plots of small data; complex plots, such as geographic maps or charts with thousands of elements, are better rendered on the client because the serialized SVG is large. For this second approach, use [useRef](https://react.dev/reference/react/useRef) to get a reference to a DOM element, and then [useEffect](https://react.dev/reference/react/useEffect) to generate and insert your plot.

:::code-group
```jsx [App.jsx]
import * as Plot from "@observablehq/plot";
import * as d3 from "d3";
import {useEffect, useRef, useState} from "react";

export default function App() {
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
```
:::

This example also demonstrates asynchronously loading CSV data with [useState](https://react.dev/reference/react/useState). If you want to update your plot, say because your data has changed, simply throw away the old plot using [*element*.remove](https://developer.mozilla.org/en-US/docs/Web/API/Element/remove) and then replace it with a new one. That’s done above in the useEffect’s cleanup function.

## Plot in Vue

As with React, you can use either server- or client-side rendering with Plot and Vue.

For server-side rendering (SSR), use the [**document** plot option](./features/plots.md) to render to Vue’s virtual DOM. For example, here is a PlotFigure component:

:::code-group
```js [PlotFigure.js]
import * as Plot from "@observablehq/plot";
import {h} from "vue";

export default {
  props: {
    options: Object
  },
  render() {
    return Plot.plot({
      ...this.options,
      document: new Document()
    }).toHyperScript();
  }
};
```
:::

:::info
For brevity, the virtual `Document` implementation is not shown. You’ll find it linked below.
:::

Then, to use:

:::code-group
```vue [App.vue]
<script setup>
import * as Plot from "@observablehq/plot";
import PlotFigure from "./components/PlotFigure.js";
import penguins from "./assets/penguins.json";
</script>

<template>
  <h1>Plot + Vue</h1>
  <PlotFigure
    :options="{
      marks: [
        Plot.dot(penguins, {x: 'culmen_length_mm', y: 'culmen_depth_mm'}),
      ],
    }"
  />
</template>
```
:::

See our [Plot + Vue CodeSandbox](https://codesandbox.io/p/sandbox/plot-vue-jlgg2w?file=/src/App.vue) for details.

For client-side rendering, use a [render function](https://vuejs.org/guide/extras/render-function.html) with a [mounted](https://vuejs.org/api/options-lifecycle.html#mounted) lifecycle directive. After the component mounts, render the plot and then insert it into the page.

```js
import * as Plot from "@observablehq/plot";
import {h, withDirectives} from "vue";

export default {
  props: ["options"],
  render() {
    const {options} = this;
    return withDirectives(h("div"), [
      [
        {
          mounted(el) {
            el.append(Plot.plot(options));
          }
        }
      ]
    ]);
  }
};
```

As with React, to update your plot for whatever reason, simply render a new one and replace the old one. You can find more examples on [our GitHub](https://github.com/observablehq/plot/tree/main/docs) as this documentation site is built with VitePress and uses both client- and server-side rendering for plots!

## Plot in Svelte

Here’s an example of client-side rendering in Svelte. For server-side rendering, see [#1759](https://github.com/observablehq/plot/discussions/1759).

:::code-group
```svelte [App.svelte]
<script lang="ts">
  import * as Plot from '@observablehq/plot';
  import * as d3 from 'd3';

  let div: HTMLElement | undefined = $state();
  let data = $state(d3.ticks(-2, 2, 200).map(Math.sin));

  function onMousemove(event: MouseEvent) {
    const [x, y] = d3.pointer(event);
    data = data.slice(-200).concat(Math.atan2(x, y));
  }

  $effect(() => {
    div?.firstChild?.remove(); // remove old chart, if any
    div?.append(Plot.lineY(data).plot({ grid: true })); // add the new chart
  });
</script>

<div onmousemove={onMousemove} bind:this={div} role="img"></div>
```
:::

See our [Plot + Svelte REPL](https://svelte.dev/playground/e65b5c87ae7e44239cef41ec3df28f52?version=5.2.7) for details.

## Plot in Node.js

You can use Plot to server-side render SVG or PNG in Node.js. Use [JSDOM](https://github.com/jsdom/jsdom) for a DOM implementation via the **document** option, then serialize the generated plot using **outerHTML**.

```js
import {readFile} from "node:fs/promises";
import * as Plot from "@observablehq/plot";
import * as d3 from "d3";
import {JSDOM} from "jsdom";

const penguins = d3.csvParse(await readFile("./penguins.csv", "utf-8"), d3.autoType);

const plot = Plot.plot({
  document: new JSDOM("").window.document,
  marks: [
    Plot.dot(penguins, {x: "culmen_length_mm", y: "culmen_depth_mm", stroke: "species"})
  ]
});

plot.setAttributeNS("http://www.w3.org/2000/xmlns/", "xmlns", "http://www.w3.org/2000/svg");
plot.setAttributeNS("http://www.w3.org/2000/xmlns/", "xmlns:xlink", "http://www.w3.org/1999/xlink");

process.stdout.write(plot.outerHTML);
```

To rasterize SVG as PNG, you could use [canvg](https://github.com/canvg/canvg) and [node-canvas](https://github.com/Automattic/node-canvas), or [sharp](https://sharp.pixelplumbing.com/):

```js
process.stdout.write(await sharp(Buffer.from(plot.outerHTML, "utf-8")).png().toBuffer());
```

For better font rendering, consider [Puppeteer](https://pptr.dev/).
