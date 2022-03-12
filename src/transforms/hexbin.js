import {hexbin as Hexbin} from "d3-hexbin"; // TODO inline
import {sqrt4_3} from "../symbols.js";
import {basic} from "./basic.js";
import {hasOutput, maybeOutputs} from "./group.js";

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
    ...basic(options, (data, facets) => {
      for (const o of outputs) o.initialize(data);
      return {data, facets};
    }),
    initialize(facets, {x: X, y: Y}, {x, y}) {
      if (X === undefined) throw new Error("missing channel: x");
      if (Y === undefined) throw new Error("missing channel: y");
      ({value: X} = X);
      ({value: Y} = Y);
      const binsof = Hexbin().x(i => x(X[i])).y(i => y(Y[i])).radius(radius * sqrt4_3);
      const binFacets = [];
      const BX = [];
      const BY = [];
      let i = 0;
      for (const facet of facets) {
        const binFacet = [];
        for (const o of outputs) o.scope("facet", facet);
        for (const bin of binsof(facet)) {
          binFacet.push(i++);
          BX.push(bin.x);
          BY.push(bin.y);
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
