import {geoCentroid as GeoCentroid, geoPath, greatest, polygonArea, polygonContains} from "d3";
import {memoize1} from "../memoize.js";
import {identity, valueof} from "../options.js";
import {initializer} from "./basic.js";
import polylabel from "polylabel";

export function centroid({geometry = identity, ...options} = {}) {
  const getG = memoize1((data) => valueof(data, geometry));
  return initializer(
    // Suppress defaults for x and y since they will be computed by the initializer.
    // Propagate the (memoized) geometry channel in case it’s still needed.
    {...options, x: null, y: null, geometry: {transform: getG}},
    (data, facets, channels, scales, dimensions, {projection}) => {
      const G = getG(data);
      const n = G.length;
      const X = new Float64Array(n);
      const Y = new Float64Array(n);
      const path = geoPath(projection);
      for (let i = 0; i < n; ++i) [X[i], Y[i]] = path.centroid(G[i]);
      return {
        data,
        facets,
        channels: {
          x: {value: X, scale: projection == null ? "x" : null, source: null},
          y: {value: Y, scale: projection == null ? "y" : null, source: null}
        }
      };
    }
  );
}

export function poi({geometry = identity, ...options} = {}) {
  const getG = memoize1((data) => valueof(data, geometry));
  return initializer(
    {...options, x: null, y: null, geometry: {transform: getG}},
    (data, facets, channels, scales, dimensions, {projection}) => {
      const G = getG(data);
      const n = G.length;
      const X = new Float64Array(n);
      const Y = new Float64Array(n);
      let polygons, holes, ring;
      const alpha = 2;
      const context = {
        arc() {},
        moveTo(x, y) {
          ring = [[x, -alpha * y]];
        },
        lineTo(x, y) {
          ring.push([x, -alpha * y]);
        },
        closePath() {
          ring.push(ring[0]);
          if (polygonArea(ring) > 0) polygons.push([ring]);
          else holes.push(ring);
        }
      };
      const path = geoPath(projection, context);
      for (let i = 0; i < n; ++i) {
        polygons = [];
        holes = [];
        path(G[i]);
        for (const h of holes) polygons.find(([ring]) => polygonContains(ring, h[0]))?.push(h);
        const a = greatest(
          polygons.map((d) => polylabel(d)),
          (d) => d.distance
        );
        [X[i], Y[i]] = a ? [a[0], -a[1] / alpha] : path.centroid(G[i]);
      }
      return {
        data,
        facets,
        channels: {
          x: {value: X, scale: projection == null ? "x" : null, source: null},
          y: {value: Y, scale: projection == null ? "y" : null, source: null}
        }
      };
    }
  );
}

export function geoCentroid({geometry = identity, ...options} = {}) {
  const getG = memoize1((data) => valueof(data, geometry));
  const getC = memoize1((data) => valueof(getG(data), GeoCentroid));
  return {
    ...options,
    x: {transform: (data) => Float64Array.from(getC(data), ([x]) => x)},
    y: {transform: (data) => Float64Array.from(getC(data), ([, y]) => y)},
    geometry: {transform: getG}
  };
}
