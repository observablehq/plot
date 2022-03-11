import {hexbin as Hexbin} from "d3-hexbin";
import {maybeOutputs} from "./group.js";

export function hexbin(outputs, options) {
  // todo: z
  let radius, symbol;
  ({radius = 10, symbol = "hexagon", ...options} = options);
  const rescales = {
    r: {scale: "r", radius},
    fill: {scale: "color"},
    stroke: {scale: "color"},
    fillOpacity: {scale: "opacity"},
    strokeOpacity: {scale: "opacity"},
    symbol: {scale: "symbol"}
  };
  for (const reduce of Object.values(outputs)) {
    if (typeof reduce === "string"
    && !reduce.match(/^(first|last|count|distinct|sum|deviation|min|min-index|max|max-index|mean|median|variance|mode|proportion|proportion-facet)$/i))
      throw new Error(`invalid reduce ${reduce}`);
  }
  outputs = maybeOutputs({x: { reduce: bin => bin.x }, y: { reduce: bin => bin.y }, ...outputs}, {symbol, ...options});
  return {
    initialize(index, {x: xi, y: yi}, {x, y}) {
      if (xi == null) throw new Error("missing channel: x");
      if (yi == null) throw new Error("missing channel: y");
      const {value: X} = xi;
      const {value: Y} = yi;
      const facets = [];
      const channels = {};
      for (const o of outputs) {
        o.initialize(this.data); // todo: https://github.com/observablehq/plot/pull/775/files#r818957322
        channels[o.name] = {...rescales[o.name], value: []};
      }
      let n = 0;
      for (const I of index) {
        const bins = Hexbin().x(i => x(X[i])).y(i => y(Y[i])).radius(radius)(I);
        for (const o of outputs) o.scope("facet", I);
        for (const bin of bins) for (const o of outputs) o.reduce(bin);
        const facet = Uint32Array.from(bins, () => n++);
        facets.push(facet);
        for (const o of outputs) {
          const values = o.output.transform();
          for (const i of facet) channels[o.name].value[i] = values[i];
        }
      }
      return {facets, channels};
    },
    r: radius,
    symbol,
    ...options
  };
}
