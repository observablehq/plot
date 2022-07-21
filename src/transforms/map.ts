/* eslint-disable @typescript-eslint/no-explicit-any */
import type {MapMethod, IndexArray, Channel, FieldOptions, FieldOptionsKey, nullish} from "../common.js";
type ComputedMapMethod = {map: (I: IndexArray, S: Channel, T: any[]) => any};


import {count, group, rank} from "d3";
import {maybeZ, take, valueof, maybeInput, column} from "../options.js";
import {basic} from "./basic.js";

export function mapX(m: MapMethod, options: FieldOptions = {}) {
  return map(Object.fromEntries(["x", "x1", "x2"]
    .filter(key => options[key as "x" | "x1" | "x2"] != null)
    .map(key => [key, m])), options);
}

export function mapY(m: MapMethod, options: FieldOptions = {}) {
  return map(Object.fromEntries(["y", "y1", "y2"]
    .filter(key => options[key as "y" | "y1" | "y2"] != null)
    .map(key => [key, m])), options);
}

export function map(outputs: Record<string,MapMethod> = {}, options = {}) {
  const z = maybeZ(options);
  const channels = Object.entries(outputs).map(([key, map]) => {
    const input = maybeInput(key as FieldOptionsKey, options);
    if (input == null) throw new Error(`missing channel: ${key}`);
    const [output, setOutput] = column(input);
    return {key, input, output, setOutput, map: maybeMap(map)};
  });
  return {
    ...basic(options, (data, facets) => {
      const Z = valueof(data, z);
      const X = channels.map(({input}) => valueof(data, input));
      const MX = channels.map(({setOutput}) => setOutput(new Array(data.length)));
      for (const facet of facets as IndexArray[]) {
        for (const I of Z ? group(facet, i => Z[i]).values() : [facet]) {
          channels.forEach(({map}, i) => map.map(I, X[i] as any[], MX[i]));
        }
      }
      return {data, facets};
    }),
    ...Object.fromEntries(channels.map(({key, output}) => [key, output]))
  };
}

function maybeMap(map: MapMethod): ComputedMapMethod {
  if (map && typeof (map as ComputedMapMethod).map === "function") return map as ComputedMapMethod;
  if (typeof map === "function") return mapFunction(map as () => any);
  switch (`${map}`.toLowerCase()) {
    case "cumsum": return mapCumsum;
    case "rank": return mapFunction(rank);
    case "quantile": return mapFunction(rankQuantile);
  }
  throw new Error(`invalid map: ${map}`);
}

function rankQuantile(V: Iterable<number | nullish>) {
  const n = count(V) - 1;
  return rank(V).map(r => r / n);
}

function mapFunction(f: (S: Iterable<any>) => any) {
  return {
    map(I: IndexArray, S: Channel, T: any[]) {
      const M = f(take(S, I));
      if (M.length !== I.length) throw new Error("map function returned a mismatched length");
      for (let i = 0, n = I.length; i < n; ++i) T[I[i]] = M[i];
    }
  };
}

const mapCumsum = {
  map(I: IndexArray, S: Channel, T: any[]) {
    let sum = 0;
    for (const i of I) T[i] = sum += S[i];
  }
};
