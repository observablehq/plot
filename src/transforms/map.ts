import type {MapMethod, MapMethods, MarkOptions} from "../api.js";
import type {Datum, Series, Value, ValueArray} from "../data.js";

import {count, group, rank} from "d3";
import {maybeZ, take, valueof, maybeInput, column} from "../options.js";
import {basic} from "./basic.js";

export function mapX<T extends Datum, U extends Value>(m: MapMethods, options: MarkOptions<T, U> = {}) {
  return map(
    Object.fromEntries(
      ["x", "x1", "x2"].filter((key) => options[key as "x" | "x1" | "x2"] != null).map((key) => [key, m])
    ),
    options
  );
}

export function mapY<T extends Datum, U extends Value>(m: MapMethods, options: MarkOptions<T, U> = {}) {
  return map(
    Object.fromEntries(
      ["y", "y1", "y2"].filter((key) => options[key as "y" | "y1" | "y2"] != null).map((key) => [key, m])
    ),
    options
  );
}

export function map<T extends Datum, U extends Value>(outputs: {[key: string]: MapMethods} = {}, options: MarkOptions<T, U> = {}) {
  const z = maybeZ<T>(options);
  const channels = Object.entries(outputs).map(([key, map]) => {
    const input = maybeInput(key, options);
    if (input == null) throw new Error(`missing channel: ${key}`);
    const [output, setOutput] = column(input);
    return {key, input, output, setOutput, map: maybeMap(map)};
  });
  return {
    ...basic(options, (data, facets) => {
      const Z = valueof(data, z); // TODO
      const X = channels.map(({input}) => valueof(data, input));
      const MX = channels.map(({setOutput}) => setOutput(new Array(data.length)));
      for (const facet of facets) {
        for (const I of Z ? group(facet, (i) => Z[i]).values() : [facet]) {
          channels.forEach(({map}, i) => map.map(I, X[i] as ValueArray, MX[i]));
        }
      }
      return {data, facets};
    }),
    ...Object.fromEntries(channels.map(({key, output}) => [key, output]))
  };
}

function maybeMap(map: MapMethods): MapMethod {
  if (map && typeof (map as MapMethod).map === "function") return map as MapMethod;
  if (typeof map === "function") return mapFunction(map);
  switch (`${map}`.toLowerCase()) {
    case "cumsum":
      return mapCumsum;
    case "rank":
      return mapFunction(rank as (V: ValueArray) => ValueArray); // TODO: @types/d3 should make rank work on strings
    case "quantile":
      return mapFunction(rankQuantile);
  }
  throw new Error(`invalid map: ${map}`);
}

function rankQuantile(V: ValueArray) {
  const n = count(V) - 1;
  return rank(V as number[]).map((r) => r / n);
}

function mapFunction(f: (V: ValueArray) => ValueArray) {
  return {
    map(I: Series, S: ValueArray, T: ValueArray) {
      const M = f(take(S, I));
      if (M.length !== I.length) throw new Error("map function returned a mismatched length");
      for (let i = 0, n = I.length; i < n; ++i) T[I[i]] = M[i];
    }
  };
}

const mapCumsum = {
  map(I: Series, S: ValueArray, T: ValueArray) {
    let sum = 0;
    for (const i of I) T[i] = sum += S[i] as number; // TODO: should the cumsum map handle nulls and undefined?
  }
};
