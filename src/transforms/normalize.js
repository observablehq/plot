import {group} from "d3-array";
import {maybeZ, valueof} from "../mark.js";

export function normalizeX(normal) {
  return normalize(normal, ["x", "x1", "x2"]);
}

export function normalizeY(normal) {
  return normalize(normal, ["y", "y1", "y2"]);
}

// TODO If the first value is undefined, scan forward?
function normalChange(I, V, N) {
  const basis = +V[I[0]];
  for (const i of I) {
    N[i] = V[i] / basis;
  }
}

function normalize(normal = normalChange, keys) {
  return (data, index, input) => {
    const n = data.length;
    const Z = valueof(data, maybeZ(input));
    const output = {};
    for (const key of keys) {
      const V = valueof(data, input[key], Float64Array);
      if (!V) continue;
      const N = output[key] = new Float64Array(n);
      for (const facet of index) {
        for (const I of Z ? group(facet, i => Z[i]).values() : [facet]) {
          normal(I, V, N);
        }
      }
    }
    return {
      index,
      data,
      channels: output
    };
  };
}
