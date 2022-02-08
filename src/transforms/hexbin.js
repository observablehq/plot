import {groups} from "d3";
import {basic} from "./basic.js";
import {layout} from "../layouts/index.js";
import {Dot} from "../marks/dot.js";
import {maybeTuple, take, valueof} from "../options.js";

const defaults = {
  ariaLabel: "hex",
  symbol: "hexagon",
  fill: "currentColor",
  stroke: "currentColor",
  strokeWidth: 0.5
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

function hexbinLayout({radius, r, opacity, fill, text, title, value}, options) {
  radius = +radius;
  r = !!r;
  opacity = !!opacity;
  fill = !!fill;
  return layout(options, function(index, scales, {x: X, y: Y}) {
    const bins = hbin(index, X, Y, radius);
    const values = (r || opacity || fill) && valueof(bins, value);
    const {data} = this;
    return {
      reindex: true, // we're sending transformed data!
      x: valueof(bins, "x"),
      y: valueof(bins, "y"),
      ...text != null && {text: valueof(bins, I => text(take(data, I)))},
      ...title != null && {title: valueof(bins, I => title(take(data, I)))},
      ...r && {r: {values, scale: "r", options: {label: "frequency", range: [0, radius * w0]}}},
      ...opacity && {fillOpacity: {values, scale: "opacity", options: {label: "frequency"}}},
      ...fill && {fill: {values, scale: "color", options: {scheme: "blues", label: "frequency"}}}
    };
  });
}

// The transform does nothing but convert the facets to plain arrays, since we’re
// going to splice them
export function hexbinTransform(hexbinOptions, options) {
  return basic(hexbinLayout(hexbinOptions, options), (data, facets) => {
    facets = Array.from(facets, facet => Array.from(facet));
    return {data, facets};
  });
}


// todo: hexbinMesh, or a mesh option?
// todo: clip?
export function hexbin(data, options) {
  return new Dot(data, hexbinFill(options));
}

export function hexbinR({x, y, value = "length", radius = 10, title, ...options} = {}) {
  if (options.frameAnchor === undefined) ([x, y] = maybeTuple(x, y));
  return hexbinTransform({value, radius, title, r: true}, {...defaults, x, y, ...options});
}

export function hexbinFill({x, y, value = "length", radius = 10, title, ...options} = {}) {
  if (options.frameAnchor === undefined) ([x, y] = maybeTuple(x, y));
  return hexbinTransform({value, radius, title, fill: true}, {...defaults, x, y, r: radius, ...options});
}

export function hexbinOpacity({x, y, value = "length", radius = 10, title, ...options} = {}) {
  if (options.frameAnchor === undefined) ([x, y] = maybeTuple(x, y));
  return hexbinTransform({value, radius, title, opacity: true}, {...defaults, x, y, r: radius, ...options});
}

export function hexbinText({x, y, value = "length", radius = 10, text = d => d.length, ...options} = {}) {
  if (options.frameAnchor === undefined) ([x, y] = maybeTuple(x, y));
  return hexbinTransform({value, radius, text, r: true}, {x, y, r: () => 1, ...options});
}
