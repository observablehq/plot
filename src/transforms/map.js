import {count, group, rank} from "d3";
import {column, identity, isObject, maybeInput, maybeZ, taker, valueof} from "../options.js";
import {basic} from "./basic.js";

export function mapX(mapper, options = {}) {
  let {x, x1, x2} = options;
  if (x === undefined && x1 === undefined && x2 === undefined) options = {...options, x: (x = identity)};
  const outputs = {};
  if (x != null) outputs.x = mapper;
  if (x1 != null) outputs.x1 = mapper;
  if (x2 != null) outputs.x2 = mapper;
  return map(outputs, options);
}

export function mapY(mapper, options = {}) {
  let {y, y1, y2} = options;
  if (y === undefined && y1 === undefined && y2 === undefined) options = {...options, y: (y = identity)};
  const outputs = {};
  if (y != null) outputs.y = mapper;
  if (y1 != null) outputs.y1 = mapper;
  if (y2 != null) outputs.y2 = mapper;
  return map(outputs, options);
}

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
          channels.forEach(({map}, i) => map.mapIndex(I, X[i], MX[i]));
        }
      }
      return {data, facets};
    }),
    ...Object.fromEntries(channels.map(({key, output}) => [key, output]))
  };
}

function maybeMap(map) {
  if (map == null) throw new Error("missing map");
  if (typeof map.mapIndex === "function") return map;
  if (typeof map.map === "function" && isObject(map)) return mapMap(map); // N.B. array.map
  if (typeof map === "function") return mapFunction(taker(map));
  switch (`${map}`.toLowerCase()) {
    case "cumsum":
      return mapCumsum;
    case "rank":
      return mapFunction((I, V) => rank(I, (i) => V[i]));
    case "quantile":
      return mapFunction((I, V) => rankQuantile(I, (i) => V[i]));
  }
  throw new Error(`invalid map: ${map}`);
}

function mapMap(map) {
  console.warn("deprecated map interface; implement mapIndex instead.");
  return {mapIndex: map.map.bind(map)};
}

function rankQuantile(I, f) {
  const n = count(I, f) - 1;
  return rank(I, f).map((r) => r / n);
}

function mapFunction(f) {
  return {
    mapIndex(I, S, T) {
      const M = f(I, S);
      if (M.length !== I.length) throw new Error("map function returned a mismatched length");
      for (let i = 0, n = I.length; i < n; ++i) T[I[i]] = M[i];
    }
  };
}

const mapCumsum = {
  mapIndex(I, S, T) {
    let sum = 0;
    for (const i of I) T[i] = sum += S[i];
  }
};
