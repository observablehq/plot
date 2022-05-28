import {descendingDefined} from "../defined.js";
import {coerceNumbers} from "../scales.js";
import {sqrt3} from "../symbols.js";
import {identity, isNoneish, number, valueof} from "../options.js";
import {hasOutput, maybeGroup, maybeOutputs, maybeSubgroup} from "./group.js";
import {initialize} from "./initialize.js";

// We don’t want the hexagons to align with the edges of the plot frame, as that
// would cause extreme x-values (the upper bound of the default x-scale domain)
// to be rounded up into a floating bin to the right of the plot. Therefore,
// rather than centering the origin hexagon around ⟨0,0⟩ in screen coordinates,
// we offset slightly to ⟨0.5,0⟩. The hexgrid mark uses the same origin.
export const ox = 0.5, oy = 0;

// TODO filter e.g. to show empty hexbins?
// TODO disallow x, x1, x2, y, y1, y2 reducers?
export function hexbin(outputs = {fill: "count"}, inputs = {}) {
  let {binWidth, ...options} = inputs;
  binWidth = binWidth === undefined ? 20 : number(binWidth);
  outputs = maybeOutputs(outputs, options);

  // A fill output means a fill channel, and hence the stroke should default to
  // none (assuming a mark that defaults to fill and no stroke, such as dot).
  // Note that it’s safe to mutate options here because we just created it with
  // the rest operator above.
  const {z, fill, stroke} = options;
  if (stroke === undefined && isNoneish(fill) && hasOutput(outputs, "fill")) options.stroke = "none";

  // Populate default values for the r and symbol options, as appropriate.
  if (options.symbol === undefined) options.symbol = "hexagon";
  if (options.r === undefined && !hasOutput(outputs, "r")) options.r = binWidth / 2;

  return initialize(options, (data, facets, {x: X, y: Y, z: Z, fill: F, stroke: S}, scales) => {
    if (X === undefined) throw new Error("missing channel: x");
    if (Y === undefined) throw new Error("missing channel: y");
    X = coerceNumbers(valueof(X.value, X.scale !== undefined ? scales[X.scale] : identity));
    Y = coerceNumbers(valueof(Y.value, Y.scale !== undefined ? scales[Y.scale] : identity));
    Z = Z?.value;
    F = F?.value;
    S = S?.value;
    const G = maybeSubgroup(outputs, z === null ? null : Z, fill === null ? null : F, stroke === null ? null : S);
    const GZ = Z && [];
    const GF = F && [];
    const GS = S && [];
    const binFacets = [];
    const BX = [];
    const BY = [];
    let i = -1;
    for (const o of outputs) o.initialize(data);
    for (const facet of facets) {
      const binFacet = [];
      for (const o of outputs) o.scope("facet", facet);
      for (const [f, I] of maybeGroup(facet, G)) {
        for (const bin of hbin(I, X, Y, binWidth)) {
          binFacet.push(++i);
          BX.push(bin.x);
          BY.push(bin.y);
          if (Z) GZ.push(G === Z ? f : Z[bin[0]]);
          if (F) GF.push(G === F ? f : F[bin[0]]);
          if (S) GS.push(G === S ? f : S[bin[0]]);
          for (const o of outputs) o.reduce(bin);
        }
      }
      binFacets.push(binFacet);
    }
    const channels = {
      x: {value: BX},
      y: {value: BY},
      ...Z && {z: {value: GZ}},
      ...F && {fill: {value: GF, scale: true}},
      ...S && {stroke: {value: GS, scale: true}},
      ...Object.fromEntries(outputs.map(({name, output}) => [name, {scale: true, radius: name === "r" ? binWidth / 2 : undefined, value: output.transform()}]))
    };
    if ("r" in channels) {
      const R = channels.r.value;
      for (const binFacet of binFacets) {
        binFacet.sort((i, j) => descendingDefined(R[i], R[j])); // TODO make this configurable
      }
    }
    return {data, facets: binFacets, channels};
  });
}

function hbin(I, X, Y, dx) {
  const dy = dx * (1.5 / sqrt3);
  const bins = new Map();
  for (const i of I) {
    let px = X[i],
        py = Y[i];
    if (isNaN(px) || isNaN(py)) continue;
    let pj = Math.round(py = (py - oy) / dy),
        pi = Math.round(px = (px - ox) / dx - (pj & 1) / 2),
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
    let bin = bins.get(key);
    if (bin === undefined) {
      bins.set(key, bin = []);
      bin.x = (pi + (pj & 1) / 2) * dx + ox;
      bin.y = pj * dy + oy;
    }
    bin.push(i);
  }
  return bins.values();
}
