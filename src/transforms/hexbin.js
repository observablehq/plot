import {group} from "d3";
import {sqrt3} from "../symbols.js";
import {maybeChannel, maybeColorChannel, valueof} from "../options.js";
import {hasOutput, maybeOutputs} from "./group.js";

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
function hexbinn(outputs, {binWidth = 20, fill, stroke, z, ...options}) {
  binWidth = +binWidth;
  const [GZ, setGZ] = maybeChannel(z);
  const [vfill] = maybeColorChannel(fill);
  const [vstroke] = maybeColorChannel(stroke);
  const [GF = fill, setGF] = maybeChannel(vfill);
  const [GS = stroke, setGS] = maybeChannel(vstroke);
  outputs = maybeOutputs({
    ...setGF && {fill: "first"},
    ...setGS && {stroke: "first"},
    ...outputs
  }, {fill, stroke, ...options});
  return {
    symbol: "hexagon",
    ...!hasOutput(outputs, "r") && {r: binWidth / 2},
    ...!setGF && {fill},
    ...((hasOutput(outputs, "fill") || setGF) && stroke === undefined) ? {stroke: "none"} : {stroke},
    ...options,
    initialize(data, facets, {x: X, y: Y}, {x, y}) {
      if (setGF) setGF(valueof(data, vfill));
      if (setGS) setGS(valueof(data, vstroke));
      if (setGZ) setGZ(valueof(data, z));
      for (const o of outputs) o.initialize(data);
      if (X === undefined) throw new Error("missing channel: x");
      if (Y === undefined) throw new Error("missing channel: y");
      X = X.value.map(x);
      Y = Y.value.map(y);
      const F = setGF && GF.transform();
      const S = setGS && GS.transform();
      const Z = setGZ ? GZ.transform() : (F || S);
      const binFacets = [];
      const BX = [];
      const BY = [];
      let i = -1;
      for (const facet of facets) {
        const binFacet = [];
        for (const o of outputs) o.scope("facet", facet);
        for (const index of Z ? group(facet, i => Z[i]).values() : [facet]) {
          for (const bin of hbin(index, X, Y, binWidth)) {
            binFacet.push(++i);
            BX.push(bin.x);
            BY.push(bin.y);
            for (const o of outputs) o.reduce(bin);
          }
        }
        binFacets.push(binFacet);
      }
      const channels = {
        x: {value: BX},
        y: {value: BY},
        ...Object.fromEntries(outputs.map(({name, output}) => [name, {scale: true, binWidth: name === "r" ? binWidth : undefined, value: output.transform()}]))
      };
      if ("r" in channels) {
        const R = channels.r.value;
        binFacets.forEach(index => index.sort((i, j) => R[j] - R[i]));
      }
      return {facets: binFacets, channels};
    }
  };
}

function hbin(I, X, Y, dx) {
  const dy = dx * sqrt3 / 2;
  const bins = new Map();
  for (const i of I) {
    let px = X[i] / dx;
    let py = Y[i] / dy;
    if (isNaN(px) || isNaN(py)) continue;
    let pj = Math.round(py),
        pi = Math.round(px = px - (pj & 1) / 2),
        py1 = py - pj;
    if (Math.abs(py1) * 3 > 1) {
      let px1 = px - pi,
        pi2 = pi + (px < pi ? -1 : 1) / 2,
        pj2 = pj + (py < pj ? -1 : 1),
        px2 = px - pi2,
        py2 = py - pj2;
      if (px1 * px1 + py1 * py1 > px2 * px2 + py2 * py2) pi = pi2 + (pj & 1 ? 1 : -1) / 2, pj = pj2;
    }
    const key = `${pi},${pj}`;
    let g = bins.get(key);
    if (g === undefined) {
      bins.set(key, g = []);
      g.x = (pi + (pj & 1) / 2) * dx;
      g.y = pj * dy;
    }
    g.push(i);
  }
  return bins.values();
}
