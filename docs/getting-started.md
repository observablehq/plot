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

Plot returns a detached DOM element—either an [SVG](https://developer.mozilla.org/en-US/docs/Web/SVG) or [HTML figure](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/figure) element. In vanilla web development, this means you need to insert the generated plot into the page to see it. Typically this is done by selecting a DOM element (such as a DIV with a unique identifier, like `myplot` above), and then calling [*element*.append](https://developer.mozilla.org/en-US/docs/Web/API/Element/append).

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

See our [Plot + Vue CodeSandbox](https://codesandbox.io/p/sandbox/plot-vue-jlgg2w?file=/src/App.vue) for details. You can also find more examples on [our GitHub](https://github.com/observablehq/plot/tree/main/docs), as this documentation site is built with Vue and VitePress, and makes extensive use of both client- and server-side rendering for plots!

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

As with React, if you need to update your plot for whatever reason, you can throw away the old one and replace it with a new one.
