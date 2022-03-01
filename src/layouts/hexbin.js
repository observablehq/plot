import {group} from "d3";
import {layout} from "./index.js";
import {basic} from "../transforms/basic.js";
import {maybeOutputs} from "../transforms/group.js";
import {defined} from "../defined.js";
import {take} from "../options.js";

// width factor (allows the hexbin transform to work with circular dots!)
const w0 = Math.sin(Math.PI / 3);

// TODO Avoid the overhead of d3.group and inline it here instead?
// https://github.com/d3/d3-hexbin/blob/master/src/hexbin.js
function hbin(I, X, Y, r) {
  const dx = r * 2 * w0;
  const dy = r * 1.5;

  function ij(px, py) {
    let pj = Math.round(py = py / dy),
        pi = Math.round(px = px / dx - (pj & 1) / 2),
        py1 = py - pj;
    if (Math.abs(py1) * 3 > 1) {
      let px1 = px - pi,
          pi2 = pi + (px < pi ? -1 : 1) / 2,
          pj2 = pj + (py < pj ? -1 : 1),
          px2 = px - pi2,
          py2 = py - pj2;
      if (px1 * px1 + py1 * py1 > px2 * px2 + py2 * py2) pi = pi2 + (pj & 1 ? 1 : -1) / 2, pj = pj2;
    }
    return [pi, pj];
  }

  // TODO Is this necessary? Will some filtering already be applied here?
  I = I.filter(i => defined(X[i]) && defined(Y[i]));

  return Array.from(group(I, i => ij(X[i], Y[i]).join()).values(), bin => {
    const i = bin[0];
    const [pi, pj] = ij(X[i], Y[i]);
    bin.x = (pi + (pj & 1) / 2) * dx;
    bin.y = pj * dy;
    return bin;
  });
}

// Allow hexbin options to be specified as part of outputs; merge them into options.
function mergeOptions({radius, ...outputs}, options) {
  return [outputs, {radius, ...options}];
}

// TODO Combine this into the hexbin function below.
export function hexbin(outputs, options) {
  ([outputs, options] = mergeOptions(outputs, options));

  // we defer to Plot.bin’s reducers, but some of them are not supported
  // TODO This should be implemented differently…
  for (const reduce of Object.values(outputs)) {
    if (typeof reduce === "string"
    && !reduce.match(/^(first|last|count|distinct|sum|deviation|min|min-index|max|max-index|mean|median|variance|mode|proportion|proportion-facet)$/i))
      throw new Error(`invalid reduce ${reduce}`);
  }
  outputs = maybeOutputs(outputs, options);

  // The “radius” of the hexagonal grid is defined here as the radius of the
  // circle inscribed within the hexagon, not the radius of the circle
  // circumscribing a hexagon; it is the distance from the centroid of the
  // hexagon to the closest point on any side, not the distance from the
  // centroid to any vertex. This definition is chosen such that when circles
  // are used to visualize hexbins, the circles are tangent, not overlapping.
  let radius = options.radius === undefined ? 10 : +options.radius;

  // TODO This should be expressed as a map from channel name to scale name,
  // rather than constructing an object here.
  const rescales = {
    // TODO Rather than allowing layouts to inject arbitrary scale options,
    // maybe we should instead use channel hints so that the radius scale can
    // take a hint when determining the default range?
    //
    // TODO Do we want layouts to declare the scale name here, or should we have
    // some default behavior that maps from channel names to scale names? It’s
    // already the case that the Mark base class defines scale bindings for
    // standard style channels. But in general it’s up to the mark to decide
    // which channels are bound to which scale… so maybe it does make sense for
    // a layout to specify (since that gives layouts flexibility to change this
    // behavior in the future for other mark types).
    r: {scale: "r", options: {range: [0, radius * w0]}},
    fill: {scale: "color"},
    stroke: {scale: "color"},
    fillOpacity: {scale: "opacity"},
    strokeOpacity: {scale: "opacity"},
    symbol: {scale: "symbol"}
  };

  const {x, y, r, symbol} = options;
  if (x == null) throw new Error("missing channel: x");
  if (y == null) throw new Error("missing channel: y");
  if (symbol === undefined) options = {...options, symbol: "hexagon"};

  // TODO There’s overloading here between the constant radius option (the
  // spacing of the hexagonal grid), the r channel (for visualizing the hexbins
  // with variable-sized dots), and the r constant option (for visualizing the
  // hexbins with fixed-sized dots). If r is a number, then it represents the
  // size of the hexagonal grid; if there is no r output, then r further
  // represents the (fixed) radius of the output dots.
  if (r === undefined && !outputs.some(({name}) => name === "r")) options = {...options, r: radius};

  return basic(layout(options, function(data, facets, scales, {x: X, y: Y}) {
    const VX = [];
    const VY = [];
    const values = {x: VX, y: VY};
    const channels = [];
    const binData = [];
    const binFacets = [];
    for (const o of outputs) o.initialize(data);
    let i = 0;
    for (const facet of facets) {
      const binFacet = [];
      for (const o of outputs) o.scope("facet", facet);
      for (const bin of hbin(facet, X, Y, radius)) {
        binFacet.push(i++);
        binData.push(take(data, bin)); // TODO reduceData
        VX.push(bin.x);
        VY.push(bin.y);
        for (const o of outputs) o.reduce(bin);
      }
      binFacets.push(binFacet);
    }
    // TODO This is directly invoking output.transform, but that’s normally
    // invoked implicitly when channel values are materialized by valueof via
    // the Channel constructor. So… it’s probably inappropriate for layouts to
    // materialize values here, and instead we should return the same definition
    // that mark.initialize returns.
    for (const o of outputs) {
      if (o.name in rescales) {
        const {scale, options} = rescales[o.name];
        const value = o.output.transform();
        channels.push([o.name, {scale, value, options}]);
      } else {
        values[o.name] = o.output.transform();
      }
    }
    return {data: binData, facets: binFacets, values, channels};
  }));
}
