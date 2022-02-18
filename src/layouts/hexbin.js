import {groups} from "d3";
import {layout} from "./index.js";
import {basic} from "../transforms/basic.js";
import {maybeOutputs, hasOutput} from "../transforms/group.js";
import {valueof} from "../options.js";

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
  outputs = maybeOutputs(outputs, options);
  const rescales = {
    r: {scale: "r", options: {range: [0, radius * w0]}},
    fill: {scale: "color"},
    fillOpacity: {scale: "opacity"}
  };
  return layout({...defaults, ...options}, function(index, scales, {x: X, y: Y}) {
    const bins = hbin(index, X, Y, radius);
    for (const o of outputs) o.initialize(this.data);
    for (const bin of bins) {
      for (const o of outputs) o.reduce(bin);
    }
    return {
      reindex: true, // we're sending transformed data!
      x: valueof(bins, "x"),
      y: valueof(bins, "y"),
      ...!hasOutput(outputs, "r") && {r: new Float64Array(bins.length).fill(radius)}, // TODO: constant??
      ...Object.fromEntries(outputs.map(({name, output}) => [name, name in rescales ? {values: output.transform(), ...rescales[name]} : output.transform()]))
    };
  });
}

export function hexbin(outputs, options) {
  ([outputs, options] = mergeOptions(outputs, options));
  const {radius, ...inputs} = options;
  return basic(hexbinLayout(radius, outputs, inputs), (data, facets) => ({data, facets}));
}
