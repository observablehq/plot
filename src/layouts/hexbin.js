import {groups} from "d3";
import {layout} from "./index.js";
import {basic} from "../transforms/basic.js";
import {maybeOutputs} from "../transforms/group.js";

const defaults = {
  ariaLabel: "hex",
  symbol: "hexagon"
};

// width factor (allows the hexbin transform to work with circular dots!)
const w0 = Math.sin(Math.PI / 3);

function hbin(I, X, Y, r) {
  const dx = r * 2 * w0;
  const dy = r * 1.5;
  const keys = new Map();
  return groups(I, i => {
    let px = X[i] / dx;
    let py = Y[i] / dy;
    if (isNaN(px) || isNaN(py)) return;
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
    const key = `${pi}|${pj}`;
    keys.set(key, [pi, pj]);
    return key;
  })
  .filter(([p]) => p)
  .map(([p, bin]) => {
    const [pi, pj] = keys.get(p);
    bin.x = (pi + (pj & 1) / 2) * dx;
    bin.y = pj * dy;
    return bin;
  });
}

// Allow hexbin options to be specified as part of outputs; merge them into options.
function mergeOptions({radius = 10, ...outputs}, options) {
  return [outputs, {radius, ...options}];
}

function hexbinLayout(radius, outputs, options) {
  // we defer to Plot.bin’s reducers, but some of them are not supported
  for (const reduce of Object.values(outputs)) {
    if (typeof reduce === "string"
    && !reduce.match(/^(first|last|count|distinct|sum|deviation|min|min-index|max|max-index|mean|median|variance|mode|proportion|proportion-facet)$/i))
      throw new Error(`invalid reduce ${reduce}`);
  }
  outputs = maybeOutputs(outputs, options);
  const rescales = {
    r: {scale: "r", options: {range: [0, radius * w0]}},
    fill: {scale: "color"},
    stroke: {scale: "color"},
    fillOpacity: {scale: "opacity"},
    strokeOpacity: {scale: "opacity"},
    symbol: {scale: "symbol"}
  };
  const {x, y} = options;
  if (x == null) throw new Error("missing channel: x");
  if (y == null) throw new Error("missing channel: y");
  return layout({...defaults, ...options}, function(index, scales, {x: X, y: Y}) {
    const values = {x: [], y: [], r: []};
    const channels = [];
    const newIndex = [];
    for (const o of outputs) {
      o.initialize(this.data);
      o.scope("data", index);
    }
    let n = 0;
    for (const I of index) {
      const facetIndex = [];
      newIndex.push(facetIndex);
      const bins = hbin(I, X, Y, radius);
      for (const o of outputs) {
        o.scope("facet", I);
        for (const bin of bins) o.reduce(bin);
      }
      for (const bin of bins) {
        values.x[n] = bin.x;
        values.y[n] = bin.y;
        facetIndex.push(n++);
      }
    }
    for (const o of outputs) {
      if (o.name in rescales) {
        const {scale, options} = rescales[o.name];
        const value = o.output.transform();
        channels.push([o.name, {scale, value, options}]);
      } else {
        values[o.name] = o.output.transform();
      }
    }
    if (!channels.find(([key]) => key === "r")) values.r = Array.from(values.x).fill(radius);

    return {index: newIndex, values, channels};
  });
}

export function hexbin(outputs, options) {
  ([outputs, options] = mergeOptions(outputs, options));
  const {radius, ...inputs} = options;
  return basic(hexbinLayout(radius, outputs, inputs));
}
