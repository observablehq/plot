import {group} from "d3";
import {initializer} from "./basic.js";
import {valueof} from "../options.js";

// Retain the indices that share the same pixel value and correspond to first,
// second, min X, max X, min Y, max Y, next-to-last and last values. Some known
// curves, including the default (linear), can skip the second and penultimate.
function decimateIndex(index, [X, Y], Z, {pixelSize = 0.5, curve} = {}) {
  if (typeof curve === "string" && curve.match(/^(bump|linear|monotone|step)/)) curve = false;
  const J = [];
  const pixel = [];
  for (const I of Z ? group(index, (i) => Z[i]).values() : [index]) {
    let x0;
    for (const i of I) {
      const x = Math.floor(X[i] / pixelSize);
      if (x !== x0) pick(), (x0 = x);
      pixel.push(i);
    }
    pick();
  }
  return J;

  function pick() {
    const n = pixel.length;
    if (!n) return;
    let x1 = Infinity;
    let y1 = Infinity;
    let x2 = -Infinity;
    let y2 = -Infinity;
    let ix1, ix2, iy1, iy2;
    let j = 0;
    for (; j < n; ++j) {
      const x = X[pixel[j]];
      const y = Y[pixel[j]];
      if (x < x1) (ix1 = j), (x1 = x);
      if (x > x2) (ix2 = j), (x2 = x);
      if (y < y1) (iy1 = j), (y1 = y);
      if (y > y2) (iy2 = j), (y2 = y);
    }
    for (j = 0; j < n; ++j) {
      if (
        j === 0 ||
        j === n - 1 ||
        j === ix1 ||
        j === ix2 ||
        j === iy1 ||
        j === iy2 ||
        (curve && (j === 1 || j === n - 2))
      )
        J.push(pixel[j]);
    }
    pixel.length = 0;
  }
}

function decimateK(k, pixelSize, options) {
  if (!pixelSize) return options;
  return initializer(options, function (data, facets, values, scales) {
    let X = values.x2 ?? values.x ?? values.x1;
    let Y = values.y2 ?? values.y ?? values.y1;
    if (!X) throw new Error("missing channel x");
    if (!Y) throw new Error("missing channel y");
    const XY = [
      X.scale ? valueof(X.value, scales[X.scale], Float64Array) : X.value,
      Y.scale ? valueof(Y.value, scales[Y.scale], Float64Array) : Y.value
    ];
    if (k === "y") XY.reverse();
    return {
      data,
      facets: facets.map((index) => decimateIndex(index, XY, values.z?.value, {pixelSize, curve: options.curve}))
    };
  });
}

export function decimateX({pixelSize = 0.5, ...options} = {}) {
  return decimateK("x", pixelSize, options);
}

export function decimateY({pixelSize = 0.5, ...options} = {}) {
  return decimateK("y", pixelSize, options);
}
