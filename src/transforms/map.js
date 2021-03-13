import {group} from "d3";
import {maybeTransform, maybeZ, take, valueof, maybeInput, lazyChannel} from "../mark.js";

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
    transform: maybeTransform(options, (data, index) => {
      const Z = valueof(data, z);
      const X = channels.map(({input}) => valueof(data, input));
      const MX = channels.map(({setOutput}) => setOutput(new Array(data.length)));
      for (const facet of index) {
        for (const I of Z ? group(facet, i => Z[i]).values() : [facet]) {
          channels.forEach(({map}, i) => map.map(I, X[i], MX[i]));
        }
      }
      return {data, index};
    })
  };
}

function maybeMap(map) {
  if (map && typeof map.map === "function") return map;
  if (typeof map === "function") return mapFunction(map);
  throw new Error("invalid map");
}

function mapFunction(map) {
  return {
    map(I, S, T) {
      const M = map(take(S, I));
      if (M.length !== I.length) throw new Error("mismatched length");
      for (let i = 0, n = I.length; i < n; ++i) T[I[i]] = M[i];
    }
  };
}
