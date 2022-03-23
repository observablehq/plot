import {hexbin as Hexbin} from "d3-hexbin"; // TODO inline
import {sqrt4_3} from "../symbols.js";
import {hasOutput, maybeOutputs} from "./group.js";

// We don’t want the hexagons to align with the edges of the plot frame, as that
// would cause extreme x-values (the upper bound of the default x-scale domain)
// to be rounded up into a floating bin to the right of the plot. Therefore,
// rather than centering the origin hexagon around ⟨0,0⟩ in screen coordinates,
// we offset slightly to ⟨0.5,0⟩. The hexgrid mark uses the same origin.
export const ox = 0.5, oy = 0;

export function hexbin(outputs = {fill: "count"}, options = {}) {
  const {radius, ...rest} = outputs;
  return hexbinn(rest, {radius, ...options});
}

// TODO group by (implicit) z
// TODO filter e.g. to show empty hexbins?
// TODO data output with sort and reverse?
// TODO disallow x, x1, x2, y, y1, y2 reducers?
function hexbinn(outputs, {radius = 10, ...options}) {
  radius = +radius;
  outputs = maybeOutputs(outputs, options);
  return {
    symbol: "hexagon",
    ...!hasOutput(outputs, "r") && {r: radius},
    ...hasOutput(outputs, "fill") && {stroke: "none"},
    ...options,
    initialize(data, facets, {x: X, y: Y}, {x, y}) {
      if (X === undefined) throw new Error("missing channel: x");
      if (Y === undefined) throw new Error("missing channel: y");
      ({value: X} = X);
      ({value: Y} = Y);
      const binsof = Hexbin().x(i => x(X[i]) - ox).y(i => y(Y[i]) - oy).radius(radius * sqrt4_3);
      const binFacets = [];
      const BX = [];
      const BY = [];
      let i = 0;
      for (const o of outputs) o.initialize(data);
      for (const facet of facets) {
        const binFacet = [];
        for (const o of outputs) o.scope("facet", facet);
        for (const bin of binsof(facet)) {
          binFacet.push(i++);
          BX.push(bin.x + ox);
          BY.push(bin.y + oy);
          for (const o of outputs) o.reduce(bin);
        }
        binFacets.push(binFacet);
      }
      return {
        facets: binFacets,
        channels: {
          x: {value: BX},
          y: {value: BY},
          ...Object.fromEntries(outputs.map(({name, output}) => [name, {scale: true, radius: name === "r" ? radius : undefined, value: output.transform()}]))
        }
      };
    }
  };
}
