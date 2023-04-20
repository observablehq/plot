<script setup>

import * as Plot from "@observablehq/plot";
import * as d3 from "d3";
import penguins from "../data/penguins.ts";

</script>

# Hexgrid mark

The **hexgrid mark** draws a hexagonal grid spanning the frame. It can be used with the [hexbin transform](../transforms/hexbin.md) to show how points are binned. The **binWidth** option specifies the distance between centers of neighboring hexagons in pixels; it defaults to 20, matching the hexbin transform.

:::plot https://observablehq.com/@observablehq/plot-hexgrid-example
```js
Plot.plot({
  marks: [
    Plot.hexgrid(),
    Plot.dot(penguins, Plot.hexbin({r: "count"}, {x: "culmen_length_mm", y: "culmen_depth_mm", fill: "currentColor"}))
  ]
})
```
:::

## Hexgrid options

The hexgrid mark supports the [standard mark options](../features/marks.md#mark-options). It does not accept any data or support channels. The default **stroke** is *currentColor*, the default **strokeOpacity** is 0.1, and the default **clip** is true. The **binWidth** defaults to 20, matching the [hexbin transform](../transforms/hexbin.md). The **fill** option is not supported, but a [frame mark](./frame.md) can be used to the same effect.

## hexgrid(*options*)

```js
Plot.hexgrid({stroke: "red"})
```

Returns a new hexgrid mark with the specified *options*.
