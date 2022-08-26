import {count, group, rank} from "d3";
import {maybeZ, take, valueof, maybeInput, column} from "../options.js";
import {basic} from "./basic.js";

/**
 * ```js
 * Plot.mapX("cumsum", {x: d3.randomNormal()})
 * ```
 *
 * Equivalent to Plot.map({x: *map*, x1: *map*, x2: *map*}, *options*), but
 * ignores any of **x**, **x1**, and **x2** not present in *options*.
 *
 * @link https://github.com/observablehq/plot/blob/main/README.md#map
 */
export function mapX(map, options = {}) {
  return mapAlias(
    Object.fromEntries(["x", "x1", "x2"].filter((key) => options[key] != null).map((key) => [key, map])),
    options
  );
}

/**
 * ```js
 * Plot.mapY("cumsum", {y: d3.randomNormal()})
 * ```
 *
 * Equivalent to Plot.map({y: *map*, y1: *map*, y2: *map*}, *options*), but
 * ignores any of **y**, **y1**, and **y2** not present in *options*.
 *
 * @link https://github.com/observablehq/plot/blob/main/README.md#map
 */
export function mapY(map, options = {}) {
  return mapAlias(
    Object.fromEntries(["y", "y1", "y2"].filter((key) => options[key] != null).map((key) => [key, map])),
    options
  );
}

/**
 * ```js
 * Plot.map({y: "cumsum"}, {y: d3.randomNormal()})
 * ```
 *
 * Groups on the first channel of *z*, *fill*, or *stroke*, if any, and then for
 * each channel declared in the specified *outputs* object, applies the
 * corresponding map method. Each channel in *outputs* must have a corresponding
 * input channel in *options*.
 *
 * @link https://github.com/observablehq/plot/blob/main/README.md#map
 */
export function map(outputs = {}, options = {}) {
  const z = maybeZ(options);
  const channels = Object.entries(outputs).map(([key, map]) => {
    const input = maybeInput(key, options);
    if (input == null) throw new Error(`missing channel: ${key}`);
    const [output, setOutput] = column(input);
    return {key, input, output, setOutput, map: maybeMap(map)};
  });
  return {
    ...basic(options, (data, facets) => {
      const Z = valueof(data, z);
      const X = channels.map(({input}) => valueof(data, input));
      const MX = channels.map(({setOutput}) => setOutput(new Array(data.length)));
      for (const facet of facets) {
        for (const I of Z ? group(facet, (i) => Z[i]).values() : [facet]) {
          channels.forEach(({map}, i) => map.map(I, X[i], MX[i]));
        }
      }
      return {data, facets};
    }),
    ...Object.fromEntries(channels.map(({key, output}) => [key, output]))
  };
}

// This is used internally so we can use `map` as an argument name.
const mapAlias = map;

function maybeMap(map) {
  if (map && typeof map.map === "function") return map;
  if (typeof map === "function") return mapFunction(map);
  switch (`${map}`.toLowerCase()) {
    case "cumsum":
      return mapCumsum;
    case "rank":
      return mapFunction(rank);
    case "quantile":
      return mapFunction(rankQuantile);
  }
  throw new Error(`invalid map: ${map}`);
}

function rankQuantile(V) {
  const n = count(V) - 1;
  return rank(V).map((r) => r / n);
}

function mapFunction(f) {
  return {
    map(I, S, T) {
      const M = f(take(S, I));
      if (M.length !== I.length) throw new Error("map function returned a mismatched length");
      for (let i = 0, n = I.length; i < n; ++i) T[I[i]] = M[i];
    }
  };
}

const mapCumsum = {
  map(I, S, T) {
    let sum = 0;
    for (const i of I) T[i] = sum += S[i];
  }
};
