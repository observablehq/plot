import {Delaunay} from "d3";
import {identity, maybeTuple, valueof} from "../options.js";
import {coerceNumbers} from "../scales.js";
import {initializer} from "../transforms/basic.js";
import {Link} from "./link.js";

function delaunayLinkTransform(options) {
  return initializer(options, (data, facets, {x1: X, y1: Y, ...channels}, scales) => {
    X = coerceNumbers(valueof(X.value, scales[X.scale] || identity));
    Y = coerceNumbers(valueof(Y.value, scales[Y.scale] || identity));

    const X1 = [];
    const X2 = [];
    const Y1 = [];
    const Y2 = [];
    let newIndex = -1;
    const newFacets = [];
    const newChannels = {};

    for (const key in channels) {
      newChannels[key] = {...channels[key], value: []};
    }

    // TODO Group by z or stroke.
    for (const I of facets) {
      const link = (ti, tj) => {
        ti = I[ti];
        tj = I[tj];
        newFacet.push(++newIndex);
        X1.push(X[ti]);
        Y1.push(Y[ti]);
        X2.push(X[tj]);
        Y2.push(Y[tj]);
        for (const key in channels) {
          newChannels[key].value.push(channels[key].value[tj]);
        }
      };
      const newFacet = [];
      const {halfedges, hull, triangles} = Delaunay.from(I, i => X[i], i => Y[i]);
      for (let i = 0; i < halfedges.length; ++i) { // inner edges
        const j = halfedges[i];
        if (j > i) link(triangles[i], triangles[j]);
      }
      for (let i = 0; i < hull.length; ++i) { // convex hull
        link(hull[i], hull[(i + 1) % hull.length]);
      }
      newFacets.push(newFacet);
    }

    return {
      data: null,
      facets: newFacets,
      channels: {
        ...newChannels,
        x1: {value: X1},
        x2: {value: X2},
        y1: {value: Y1},
        y2: {value: Y2}
      }
    };
  });
}

export function delaunayLink(data, {x, y, ...options} = {}) {
  if (options.frameAnchor === undefined) ([x, y] = maybeTuple(x, y));
  return new Link(data, delaunayLinkTransform({...options, x, y, x1: x, y1: y, x2: undefined, y2: undefined}));
}
