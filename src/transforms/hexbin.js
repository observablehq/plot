import {groups, max} from "d3";
import {basic} from "./basic.js";
import {layout} from "../layouts/index.js";
import {Dot} from "../marks/dot.js";
import {maybeTuple, range, take, valueof} from "../options.js";

const defaults = {
  ariaLabel: "hex",
  symbol: "hexagon",
  fill: "currentColor",
  stroke: "currentColor",
  strokeWidth: 0.5
};

// width factor (allows the hexbin transform to work with circular dots!)
const w0 = 1 / Math.sin(Math.PI / 3);

function hbin(I, X, Y, r) {
  const dx = r * 2 / w0;
  const dy = r * 1.5;
  return groups(I, i => {
    let px = X[i] / dy;
    let py = Y[i] / dx;
    if (isNaN(px) || isNaN(py)) return;
    let pj = Math.round(py),
    pi = Math.round(px - (pj & 1) / 2),
    py1 = py - pj;
    if (Math.abs(py1) * 3 > 1) {
      let px1 = px - pi,
        pi2 = pi + (px < pi ? -1 : 1) / 2,
        pj2 = pj + (py < pj ? -1 : 1),
        px2 = px - pi2,
        py2 = py - pj2;
      if (px1 * px1 + py1 * py1 > px2 * px2 + py2 * py2) pi = pi2 + (pj & 1 ? 1 : -1) / 2, pj = pj2;
    }
    return `${pi}|${pj}`;
  })
  .filter(([p]) => p)
  .map(([p, bin]) => {
    const [pi, pj] = p.split("|");
    bin.x = (+pi + (pj & 1) / 2) * dx;
    bin.y = +pj * dy;
    return bin;
  });
}

function hexbinLayout({_store, radius, r: _r, opacity: _o, fill: _f, text: _t, title: _l, value: _v}, options) {
  radius = +radius;
  _r = !!_r;
  _o = !!_o;
  _f = !!_f;
  return layout({_store, ...options}, function(I, {r, color, opacity}, {x: X, y: Y}) {
    if (!_store.channels) {
      const bins = _store.facets.map(I => hbin(I, X, Y, radius));
      const values = bins.map(b => valueof(b, _v));
      const maxValue = max(values.flat());
      color = _f && color.copy().domain([1, maxValue]);
      opacity = _o && opacity.copy().domain([1, maxValue]);
      r = _r && r && r.copy().domain([0, maxValue]).range([0, radius / w0]);
      const {data} = this;
      _store.channels = Array.from(bins, (bin, i) => ({
        x: valueof(bin, "x"),
        y: valueof(bin, "y"),
        ..._t != null && {text: valueof(bin.map(I => take(data, I)), _t)},
        ..._l != null && {title: valueof(bin.map(I => take(data, I)), _l)},
        ..._r && r && {r: values[i].map(r)},
        ..._o && opacity && {fillOpacity: values[i].map(opacity)},
        ..._f && color && {fill: values[i].map(color)}
      }));
    }
    for (let j = 0; j < _store.facets.length; ++j) {
      if (_store.facets[j].some(i => I.includes(i))) {
        const channels = _store.channels[j];
        // mutates I!
        I.splice(0, I.length, ...range(channels.x));
        return channels;
      }
    }
    throw new Error("what are we doing here?");
  });
}

// The transform does nothing but divert some information that is necessary
// to do the layout on multiple facets
// It is a bit of a hack: we want to do all facets at once in order to compute
// the maximum value. We also convert the facets to plain arrays, since we’re
// going to splice them
export function hexbinTransform(hexbinOptions, options) {
  const _store = {};
  return basic(hexbinLayout({_store, ...hexbinOptions}, options), (data, facets) => {
    facets = Array.from(facets, facet => Array.from(facet));
    _store.facets = facets;
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
  return hexbinTransform({value, radius, title, r: true}, {...defaults, x, y, r: () => 1, ...options});
}

export function hexbinFill({x, y, value = "length", radius = 10, title, ...options} = {}) {
  if (options.frameAnchor === undefined) ([x, y] = maybeTuple(x, y));
  return hexbinTransform({value, radius, title, fill: true}, {...defaults, x, y, r: radius, fill: () => 1, ...options});
}

export function hexbinOpacity({x, y, value = "length", radius = 10, title, ...options} = {}) {
  if (options.frameAnchor === undefined) ([x, y] = maybeTuple(x, y));
  return hexbinTransform({value, radius, title, opacity: true}, {...defaults, x, y, r: radius, opacity: () => 1,...options});
}

export function hexbinText({x, y, value = "length", radius = 10, text = d => d.length, ...options} = {}) {
  if (options.frameAnchor === undefined) ([x, y] = maybeTuple(x, y));
  return hexbinTransform({value, radius, text, r: true}, {x, y, r: () => 1, ...options});
}
