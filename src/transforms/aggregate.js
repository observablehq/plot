import {group, min, max, median, quantile} from "d3-array";
import {lazyChannel, maybeLazyChannel, maybeTransform, take, valueof} from "../mark.js";

export const extentX = aggregateX2(min, max);
export const extentY = aggregateY2(min, max);
export const maxX = aggregateX1(max);
export const maxY = aggregateY1(max);
export const medianX = aggregateX1(median);
export const medianY = aggregateY1(median);
export const minX = aggregateX1(min);
export const minY = aggregateY1(min);

export function iqrX({x, y, p = 0.25, ...options} = {}) {
  const [transform, x1, x2, Y] = aggregate1(x, y, options, (d, v) => quantile(d, p, v), (d, v) => quantile(d, 1 - p, v));
  return {x1, x2, ...options, transform, y: Y};
}

export function iqrY({y, x, p = 0.25, ...options} = {}) {
  const [transform, y1, y2, X] = aggregate1(y, x, options, (d, v) => quantile(d, p, v), (d, v) => quantile(d, 1 - p, v));
  return {y1, y2, ...options, transform, x: X};
}

function aggregateX1(a) {
  return ({x, y, ...options} = {}) => {
    const [transform, X, Y] = aggregate1(x, y, options, a);
    return {...options, transform, x: X, y: Y};
  };
}

function aggregateY1(a) {
  return ({y, x, ...options} = {}) => {
    const [transform, Y, X] = aggregate1(y, x, options, a);
    return {...options, transform, y: Y, x: X};
  };
}

function aggregateX2(a1, a2) {
  return ({x, y, ...options} = {}) => {
    const [transform, x1, x2, Y] = aggregate1(x, y, options, a1, a2);
    return {x1, x2, ...options, transform, y: Y};
  };
}

function aggregateY2(a1, a2) {
  return ({y, x, ...options} = {}) => {
    const [transform, y1, y2, X] = aggregate1(y, x, options, a1, a2);
    return {y1, y2, ...options, transform, x: X};
  };
}

function aggregate1(x, y, options, ...reducers) {
  const channels = reducers.map(r => [...lazyChannel(r), r]);
  const [Y, setY] = maybeLazyChannel(y);
  return [
    maybeTransform(options, (data, index) => {
      const boxIndex = [];
      const boxData = [];
      const X = valueof(data, x, Float64Array);
      const Y = valueof(data, y);
      const BR = channels.map(([, setR]) => setR([]));
      const BY = Y && setY([]);
      let i = 0;
      for (const facet of index) {
        const boxFacet = [];
        for (const I of Y ? group(facet, i => Y[i]).values() : [facet]) {
          boxFacet.push(i++);
          boxData.push(take(data, I));
          channels.forEach(([,, reduce], i) => BR[i].push(reduce(I, i => X[i])));
          if (Y) BY.push(Y[I[0]]);
        }
        boxIndex.push(boxFacet);
      }
      return {data: boxData, index: boxIndex};
    }),
    ...channels.map(([R]) => R),
    Y
  ];
}
