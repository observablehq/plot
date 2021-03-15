import {group} from "d3";
import {maybeTransform, maybeZ, take, valueof, maybeInput, lazyChannel} from "../mark.js";

export function mapX(m, options = {}) {
  return map(Object.fromEntries(["x", "x1", "x2"]
    .filter(key => options[key] != null)
    .map(key => [key, m])), options);
}

export function mapY(m, options = {}) {
  return map(Object.fromEntries(["y", "y1", "y2"]
    .filter(key => options[key] != null)
    .map(key => [key, m])), options);
}

export function map(outputs = {}, options = {}) {
  const z = maybeZ(options);
  const channels = Object.entries(outputs).map(([key, map]) => {
    const input = maybeInput(key, options);
    if (input == null) throw new Error(`missing channel: ${key}`);
    const [output, setOutput] = lazyChannel(input);
    return {key, input, output, setOutput, map: maybeMap(map)};
  });
  return {
    ...options,
    ...Object.fromEntries(channels.map(({key, output}) => [key, output])),
    transform: maybeTransform(options, (data, facets) => {
      const Z = valueof(data, z);
      const X = channels.map(({input}) => valueof(data, input));
      const MX = channels.map(({setOutput}) => setOutput(new Array(data.length)));
      for (const facet of facets) {
        for (const I of Z ? group(facet, i => Z[i]).values() : [facet]) {
          channels.forEach(({map}, i) => map.map(I, X[i], MX[i]));
        }
      }
      return {data, facets};
    })
  };
}

function maybeMap(map) {
  if (map && typeof map.map === "function") return map;
  if (typeof map === "function") return mapFunction(map);
  throw new Error("invalid map");
}

function mapFunction(f) {
  return {
    map(I, S, T) {
      const M = f(take(S, I));
      if (M.length !== I.length) throw new Error("mismatched length");
      for (let i = 0, n = I.length; i < n; ++i) T[I[i]] = M[i];
    }
  };
}
