import {map, number, valueof} from "../options.js";
import {applyPosition} from "../projection.js";
import {sqrt3} from "../symbol.js";
import {initializer} from "./basic.js";
import {hasOutput, maybeGroup, maybeGroupOutputs, maybeSubgroup} from "./group.js";

// We don’t want the hexagons to align with the edges of the plot frame, as that
// would cause extreme x-values (the upper bound of the default x-scale domain)
// to be rounded up into a floating bin to the right of the plot. Therefore,
// rather than centering the origin hexagon around ⟨0,0⟩ in screen coordinates,
// we offset slightly to ⟨0.5,0⟩. The hexgrid mark uses the same origin.
export const ox = 0.5,
  oy = 0;

export function hexbin(outputs = {fill: "count"}, {binWidth, ...options} = {}) {
  const {z} = options;

  // TODO filter e.g. to show empty hexbins?
  binWidth = binWidth === undefined ? 20 : number(binWidth);
  outputs = maybeGroupOutputs(outputs, options);

  // A fill output means a fill channel; declaring the channel here instead of
  // waiting for the initializer allows the mark constructor to determine that
  // the stroke should default to none (assuming a mark that defaults to fill
  // and no stroke, such as dot). Note that it’s safe to mutate options here
  // because we just created it with the rest operator above.
  if (hasOutput(outputs, "fill")) options.channels = {...options.channels, fill: {value: []}};

  // Populate default values for the r and symbol options, as appropriate.
  if (options.symbol === undefined) options.symbol = "hexagon";
  if (options.r === undefined && !hasOutput(outputs, "r")) options.r = binWidth / 2;

  return initializer(options, (data, facets, channels, scales, _, context) => {
    let {x: X, y: Y, z: Z, fill: F, stroke: S, symbol: Q} = channels;
    if (X === undefined) throw new Error("missing channel: x");
    if (Y === undefined) throw new Error("missing channel: y");

    // Get the (either scaled or projected) xy channels.
    ({x: X, y: Y} = applyPosition(channels, scales, context));

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
        for (const {index: b, extent} of hbin(data, I, X, Y, binWidth)) {
          binFacet.push(++i);
          BX.push(extent.x);
          BY.push(extent.y);
          if (Z) GZ.push(G === Z ? f : Z[b[0]]);
          if (F) GF.push(G === F ? f : F[b[0]]);
          if (S) GS.push(G === S ? f : S[b[0]]);
          if (Q) GQ.push(G === Q ? f : Q[b[0]]);
          for (const o of outputs) o.reduce(b, extent);
        }
      }
      binFacets.push(binFacet);
    }

    // Construct the output channels, and populate the radius scale hint.
    const sx = channels.x.scale;
    const sy = channels.y.scale;
    const binChannels = {
      x: {value: BX, source: scales[sx] ? {value: map(BX, scales[sx].invert), scale: sx} : null},
      y: {value: BY, source: scales[sy] ? {value: map(BY, scales[sy].invert), scale: sy} : null},
      ...(Z && {z: {value: GZ}}),
      ...(F && {fill: {value: GF, scale: "auto"}}),
      ...(S && {stroke: {value: GS, scale: "auto"}}),
      ...(Q && {symbol: {value: GQ, scale: "auto"}}),
      ...Object.fromEntries(
        outputs.map(({name, output}) => [
          name,
          {
            scale: "auto",
            label: output.label,
            radius: name === "r" ? binWidth / 2 : undefined,
            value: output.transform()
          }
        ])
      )
    };

    return {data, facets: binFacets, channels: binChannels};
  });
}

function hbin(data, I, X, Y, dx) {
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
      bin = {index: [], extent: {data, x: (pi + (pj & 1) / 2) * dx + ox, y: pj * dy + oy}};
      bins.set(key, bin);
    }
    bin.index.push(i);
  }
  return bins.values();
}
