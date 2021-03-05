import {group} from "d3-array";
import {maybeColor, valueof} from "../mark.js";

export function normalizeX(normal) {
  return normalize(normal, "x");
}

export function normalizeX1(normal) {
  return normalize(normal, "x1");
}

export function normalizeX2(normal) {
  return normalize(normal, "x2");
}

export function normalizeY(normal) {
  return normalize(normal, "y");
}

export function normalizeY1(normal) {
  return normalize(normal, "y1");
}

export function normalizeY2(normal) {
  return normalize(normal, "y2");
}

function normalChange(I, V, N) {
  const basis = +V[I[0]];
  for (const i of I) {
    N[i] = V[i] / basis;
  }
}

function normalize(normal = normalChange, key) {
  return (data, index, {z, fill, stroke, [key]: v}) => {
    if (z === undefined) ([z] = maybeColor(fill));
    if (z === undefined) ([z] = maybeColor(stroke));
    const n = data.length;
    const Z = valueof(data, z);
    const V = key && valueof(data, v);
    const N = new Float64Array(n);
    for (const facet of index) {
      for (const series of Z ? group(facet, i => Z[i]).values() : [facet]) {
        normal(series, V, N);
      }
    }
    return {
      index,
      data,
      channels: {
        z: Z,
        [key]: N
      }
    };
  };
}
