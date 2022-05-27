import {hexbin as Hexbin} from "d3-hexbin"; // TODO inline
// import {sqrt3} from "../symbols.js";
import {sqrt4_3} from "../symbols.js";
import {identity, maybeColorChannel, valueof} from "../options.js";
import {hasOutput, maybeGroup, maybeOutputs, maybeSubgroup} from "./group.js";
import {initialize} from "./initialize.js";

// We don’t want the hexagons to align with the edges of the plot frame, as that
// would cause extreme x-values (the upper bound of the default x-scale domain)
// to be rounded up into a floating bin to the right of the plot. Therefore,
// rather than centering the origin hexagon around ⟨0,0⟩ in screen coordinates,
// we offset slightly to ⟨0.5,0⟩. The hexgrid mark uses the same origin.
export const ox = 0.5, oy = 0;

export function hexbin(outputs = {fill: "count"}, options = {}) {
  const {binWidth, ...rest} = outputs;
  return hexbinn(rest, {binWidth, ...options});
}

// TODO filter e.g. to show empty hexbins?
// TODO disallow x, x1, x2, y, y1, y2 reducers?
function hexbinn(outputs, {binWidth = 20, z, fill, stroke, ...options}) {
  binWidth = +binWidth;
  const [vfill] = maybeColorChannel(fill);
  const [vstroke] = maybeColorChannel(stroke);
  outputs = maybeOutputs(outputs, {z, fill, stroke, ...options});
  return {
    symbol: "hexagon",
    ...!hasOutput(outputs, "r") && {r: binWidth / 2},
    ...!hasOutput(outputs, "fill") && {fill},
    ...((hasOutput(outputs, "fill") || vstroke != null) && stroke === undefined) ? {stroke: "none"} : {stroke},
    ...initialize(options, function(data, facets, {x: X, y: Y}, scales) {
      if (X === undefined) throw new Error("missing channel: x");
      if (Y === undefined) throw new Error("missing channel: y");
      const x = X.scale !== undefined ? scales[X.scale] : identity.transform;
      const y = Y.scale !== undefined ? scales[Y.scale] : identity.transform;
      X = X.value;
      Y = Y.value;
      // X = X.value.map(x); // TODO What if value is e.g. Uint32Array?
      // Y = Y.value.map(y); // TODO What if value is e.g. Uint32Array?
      const binsof = Hexbin().x(i => x(X[i]) - ox).y(i => y(Y[i]) - oy).radius(binWidth / 2 * sqrt4_3);
      const Z = valueof(data, z);
      const F = valueof(data, vfill);
      const S = valueof(data, vstroke);
      const G = maybeSubgroup(outputs, Z, F, S);
      if (Z && !outputs.find(r => r.name === "z")) {
        outputs.push(...maybeOutputs({z: "first"}, {z: Z}));
      }
      if (F && !outputs.find(r => r.name === "fill")) {
        outputs.push(...maybeOutputs({fill: "first"}, {fill: F}));
      }
      if (S && !outputs.find(r => r.name === "stroke")) {
        outputs.push(...maybeOutputs({stroke: "first"}, {stroke: S}));
      }
      const binFacets = [];
      const BX = [];
      const BY = [];
      let i = -1;
      for (const o of outputs) o.initialize(data);
      for (const facet of facets) {
        const binFacet = [];
        for (const o of outputs) o.scope("facet", facet);
        for (const [, index] of maybeGroup(facet, G)) {
          // for (const bin of hbin(index, X, Y, binWidth)) {
          for (const bin of binsof(index)) {
            binFacet.push(++i);
            BX.push(bin.x + ox);
            BY.push(bin.y + oy);
            for (const o of outputs) o.reduce(bin);
          }
        }
        binFacets.push(binFacet);
      }
      const channels = {
        x: {value: BX},
        y: {value: BY},
        ...Z && {z: {value: Z}},
        ...F && {fill: {value: F, scale: true}},
        ...S && {stroke: {value: S, scale: true}},
        ...Object.fromEntries(outputs.map(({name, output}) => [name, {scale: true, binWidth: name === "r" ? binWidth : undefined, value: output.transform()}]))
      };
      if ("r" in channels) {
        const R = channels.r.value;
        binFacets.forEach(index => index.sort((i, j) => R[j] - R[i]));
      }
      return {data, facets: binFacets, channels};
    })
  };
}

// function hbin(I, X, Y, dx) {
//   const dy = dx * sqrt3 / 2;
//   const bins = new Map();
//   for (const i of I) {
//     let px = X[i] / dx;
//     let py = Y[i] / dy;
//     if (isNaN(px) || isNaN(py)) continue;
//     let pj = Math.round(py),
//         pi = Math.round(px = px - (pj & 1) / 2),
//         py1 = py - pj;
//     if (Math.abs(py1) * 3 > 1) {
//       let px1 = px - pi,
//         pi2 = pi + (px < pi ? -1 : 1) / 2,
//         pj2 = pj + (py < pj ? -1 : 1),
//         px2 = px - pi2,
//         py2 = py - pj2;
//       if (px1 * px1 + py1 * py1 > px2 * px2 + py2 * py2) pi = pi2 + (pj & 1 ? 1 : -1) / 2, pj = pj2;
//     }
//     const key = `${pi},${pj}`;
//     let g = bins.get(key);
//     if (g === undefined) {
//       bins.set(key, g = []);
//       g.x = (pi + (pj & 1) / 2) * dx;
//       g.y = pj * dy;
//     }
//     g.push(i);
//   }
//   return bins.values();
// }
