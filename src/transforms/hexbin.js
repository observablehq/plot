import {coerceNumbers} from "../scales.js";
import {sqrt3} from "../symbols.js";
import {identity, isNoneish, number, valueof} from "../options.js";
import {initializer} from "./basic.js";
import {hasOutput, maybeGroup, maybeOutputs, maybeSubgroup} from "./group.js";

// We don’t want the hexagons to align with the edges of the plot frame, as that
// would cause extreme x-values (the upper bound of the default x-scale domain)
// to be rounded up into a floating bin to the right of the plot. Therefore,
// rather than centering the origin hexagon around ⟨0,0⟩ in screen coordinates,
// we offset slightly to ⟨0.5,0⟩. The hexgrid mark uses the same origin.
export const ox = 0.5,
  oy = 0;

/**
 * Aggregates the given input channels into hexagonal bins, creating output
 * channels with the reduced data. The *options* must specify the **x** and
 * **y** channels. The **binWidth** option (default 20) defines the distance
 * between centers of neighboring hexagons in pixels. If any of **z**, **fill**,
 * or **stroke** is a channel, the first of these channels will be used to
 * subdivide bins. The *outputs* options are similar to the [bin
 * transform](https://github.com/observablehq/plot/blob/main/README.md#bin);
 * each output channel receives as input, for each hexagon, the subset of the
 * data which has been matched to its center. The outputs object specifies the
 * aggregation method for each output channel.
 *
 * The following aggregation methods are supported:
 *
 * * *first* - the first value, in input order
 * * *last* - the last value, in input order
 * * *count* - the number of elements (frequency)
 * * *distinct* - the number of distinct values
 * * *sum* - the sum of values
 * * *proportion* - the sum proportional to the overall total (weighted
 *   frequency)
 * * *proportion-facet* - the sum proportional to the facet total
 * * *min* - the minimum value
 * * *min-index* - the zero-based index of the minimum value
 * * *max* - the maximum value
 * * *max-index* - the zero-based index of the maximum value
 * * *mean* - the mean value (average)
 * * *median* - the median value
 * * *deviation* - the standard deviation
 * * *variance* - the variance per [Welford’s
 *   algorithm](https://en.wikipedia.org/wiki/Algorithms_for_calculating_variance#Welford's_online_algorithm)
 * * *mode* - the value with the most occurrences
 * * a function to be passed the array of values for each bin and the extent of
 *   the bin
 * * an object with a *reduce* method
 *
 * See also the
 * [hexgrid](https://github.com/observablehq/plot/blob/main/README.md#hexgrid)
 * mark.
 */
export function hexbin(outputs = {fill: "count"}, options = {}) {
  // TODO filter e.g. to show empty hexbins?
  // TODO disallow x, x1, x2, y, y1, y2 reducers?
  let {binWidth, ...remainingOptions} = options;
  binWidth = binWidth === undefined ? 20 : number(binWidth);
  outputs = maybeOutputs(outputs, remainingOptions);

  // A fill output means a fill channel, and hence the stroke should default to
  // none (assuming a mark that defaults to fill and no stroke, such as dot).
  // Note that it’s safe to mutate options here because we just created it with
  // the rest operator above.
  const {z, fill, stroke} = remainingOptions;
  if (stroke === undefined && isNoneish(fill) && hasOutput(outputs, "fill")) remainingOptions.stroke = "none";

  // Populate default values for the r and symbol options, as appropriate.
  if (remainingOptions.symbol === undefined) remainingOptions.symbol = "hexagon";
  if (remainingOptions.r === undefined && !hasOutput(outputs, "r")) remainingOptions.r = binWidth / 2;

  return initializer(remainingOptions, (data, facets, {x: X, y: Y, z: Z, fill: F, stroke: S, symbol: Q}, scales) => {
    if (X === undefined) throw new Error("missing channel: x");
    if (Y === undefined) throw new Error("missing channel: y");

    // Coerce the X and Y channels to numbers (so that null is properly treated
    // as an undefined value rather than being coerced to zero).
    X = coerceNumbers(valueof(X.value, scales[X.scale] || identity));
    Y = coerceNumbers(valueof(Y.value, scales[Y.scale] || identity));

    // Extract the values for channels that are eligible for grouping; not all
    // marks define a z channel, so compute one if it not already computed. If z
    // was explicitly set to null, ensure that we don’t subdivide bins.
    Z = Z ? Z.value : valueof(data, z);
    F = F?.value;
    S = S?.value;
    Q = Q?.value;

    // Group on the first of z, fill, stroke, and symbol. Implicitly reduce
    // these channels using the first corresponding value for each bin.
    const G = maybeSubgroup(outputs, {z: Z, fill: F, stroke: S, symbol: Q});
    const GZ = Z && [];
    const GF = F && [];
    const GS = S && [];
    const GQ = Q && [];

    // Construct the hexbins and populate the output channels.
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
          if (Q) GQ.push(G === Q ? f : Q[bin[0]]);
          for (const o of outputs) o.reduce(bin);
        }
      }
      binFacets.push(binFacet);
    }

    // Construct the output channels, and populate the radius scale hint.
    const channels = {
      x: {value: BX},
      y: {value: BY},
      ...(Z && {z: {value: GZ}}),
      ...(F && {fill: {value: GF, scale: true}}),
      ...(S && {stroke: {value: GS, scale: true}}),
      ...(Q && {symbol: {value: GQ, scale: true}}),
      ...Object.fromEntries(
        outputs.map(({name, output}) => [
          name,
          {scale: true, radius: name === "r" ? binWidth / 2 : undefined, value: output.transform()}
        ])
      )
    };

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
    let pj = Math.round((py = (py - oy) / dy)),
      pi = Math.round((px = (px - ox) / dx - (pj & 1) / 2)),
      py1 = py - pj;
    if (Math.abs(py1) * 3 > 1) {
      let px1 = px - pi,
        pi2 = pi + (px < pi ? -1 : 1) / 2,
        pj2 = pj + (py < pj ? -1 : 1),
        px2 = px - pi2,
        py2 = py - pj2;
      if (px1 * px1 + py1 * py1 > px2 * px2 + py2 * py2) (pi = pi2 + (pj & 1 ? 1 : -1) / 2), (pj = pj2);
    }
    const key = `${pi},${pj}`;
    let bin = bins.get(key);
    if (bin === undefined) {
      bins.set(key, (bin = []));
      bin.x = (pi + (pj & 1) / 2) * dx + ox;
      bin.y = pj * dy + oy;
    }
    bin.push(i);
  }
  return bins.values();
}
