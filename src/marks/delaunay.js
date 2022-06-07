import {create, path, Delaunay} from "d3";
import {Curve} from "../curve.js";
import {maybeTuple} from "../options.js";
import {Mark} from "../plot.js";
import {applyChannelStyles, applyDirectStyles, applyIndirectStyles, applyTransform, offset} from "../style.js";
import {markers, applyMarkers} from "./marker.js";

const linkDefaults = {
  ariaLabel: "delaunay",
  fill: "none",
  stroke: "currentColor",
  strokeMiterlimit: 1
};

const meshDefaults = {
  ariaLabel: "delaunay",
  fill: "none",
  stroke: "currentColor",
  strokeOpacity: 0.1
};

export class DelaunayLink extends Mark {
  constructor(data, options = {}) {
    const {x, y, curve, tension} = options;
    super(
      data,
      [
        {name: "x", value: x, scale: "x"},
        {name: "y", value: y, scale: "y"}
      ],
      options,
      linkDefaults
    );
    this.curve = Curve(curve, tension);
    markers(this, options);
  }
  render(index, {x, y}, channels, dimensions) {
    const {x: X, y: Y} = channels;
    const {dx, dy, curve} = this;
    let i = -1;
    const newIndex = [];
    const newChannels = {};
    for (const k in channels) newChannels[k] = [];

    function link(ti, tj) {
      ti = index[ti];
      tj = index[tj];
      newIndex.push(++i);
      X1[i] = X[ti];
      Y1[i] = Y[ti];
      X2[i] = X[tj];
      Y2[i] = Y[tj];
      for (const k in channels) newChannels[k].push(channels[k][tj]);
    }

    // TODO Group by z or stroke.
    const {halfedges, hull, triangles} = Delaunay.from(index, i => X[i], i => Y[i]);
    const m = (halfedges.length >> 1) + hull.length;
    const X1 = new Float64Array(m);
    const X2 = new Float64Array(m);
    const Y1 = new Float64Array(m);
    const Y2 = new Float64Array(m);
    for (let i = 0; i < halfedges.length; ++i) { // inner edges
      const j = halfedges[i];
      if (j > i) link(triangles[i], triangles[j]);
    }
    for (let i = 0; i < hull.length; ++i) { // convex hull
      link(hull[i], hull[(i + 1) % hull.length]);
    }

    return create("svg:g")
        .call(applyIndirectStyles, this, dimensions)
        .call(applyTransform, x, y, offset + dx, offset + dy)
        .call(g => g.selectAll()
          .data(newIndex)
          .enter()
          .append("path")
            .call(applyDirectStyles, this)
            .attr("d", (_, i) => {
              const p = path();
              const c = curve(p);
              c.lineStart();
              c.point(X1[i], Y1[i]);
              c.point(X2[i], Y2[i]);
              c.lineEnd();
              return p;
            })
            .call(applyChannelStyles, this, newChannels)
            .call(applyMarkers, this, newChannels))
      .node();
  }
}

export class DelaunayMesh extends Mark {
  constructor(data, options = {}) {
    const {x, y} = options;
    super(
      data,
      [
        {name: "x", value: x, scale: "x"},
        {name: "y", value: y, scale: "y"}
      ],
      options,
      meshDefaults
    );
  }
  render(index, {x, y}, channels, dimensions) {
    const {x: X, y: Y} = channels;
    const {dx, dy} = this;
    // TODO Group by z or stroke.
    const delaunay = Delaunay.from(index, i => X[i], i => Y[i]);
    return create("svg:g")
        .call(applyIndirectStyles, this, dimensions)
        .call(g => g.append("path")
          .call(applyDirectStyles, this)
          .call(applyTransform, x, y, offset + dx, offset + dy)
          .attr("d", delaunay.render()))
      .node();
  }
}

export function delaunayLink(data, {x, y, ...options} = {}) {
  ([x, y] = maybeTuple(x, y));
  return new DelaunayLink(data, {...options, x, y});
}

export function delaunayMesh(data, {x, y, ...options} = {}) {
  ([x, y] = maybeTuple(x, y));
  return new DelaunayMesh(data, {...options, x, y});
}
