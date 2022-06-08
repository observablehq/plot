import {create, group, path, select, Delaunay} from "d3";
import {Curve} from "../curve.js";
import {maybeTuple, maybeZ} from "../options.js";
import {Mark} from "../plot.js";
import {applyChannelStyles, applyDirectStyles, applyIndirectStyles, applyTransform, offset} from "../style.js";
import {markers, applyMarkers} from "./marker.js";

const linkDefaults = {
  ariaLabel: "delaunay link",
  fill: "none",
  stroke: "currentColor",
  strokeMiterlimit: 1
};

const meshDefaults = {
  ariaLabel: "delaunay mesh",
  fill: null,
  stroke: "currentColor",
  strokeOpacity: 0.2
};

const hullDefaults = {
  ariaLabel: "hull",
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 1.5
};

export class DelaunayLink extends Mark {
  constructor(data, options = {}) {
    const {x, y, curve, tension} = options;
    super(
      data,
      [
        {name: "x", value: x, scale: "x"},
        {name: "y", value: y, scale: "y"},
        {name: "z", value: maybeZ(options), optional: true}
      ],
      options,
      linkDefaults
    );
    this.curve = Curve(curve, tension);
    markers(this, options);
  }
  render(index, {x, y}, channels, dimensions) {
    const {x: X, y: Y, z: Z} = channels;
    const {dx, dy, curve} = this;
    const mark = this;

    function links(index) {
      let i = -1;
      const newIndex = [];
      const newChannels = {};
      for (const k in channels) newChannels[k] = [];
  
      const X1 = [];
      const X2 = [];
      const Y1 = [];
      const Y2 = [];
  
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
  
      const {halfedges, hull, triangles} = Delaunay.from(index, i => X[i], i => Y[i]);
      for (let i = 0; i < halfedges.length; ++i) { // inner edges
        const j = halfedges[i];
        if (j > i) link(triangles[i], triangles[j]);
      }
      for (let i = 0; i < hull.length; ++i) { // convex hull
        link(hull[i], hull[(i + 1) % hull.length]);
      }
      select(this)
      .selectAll()
      .data(newIndex)
      .join("path")
        .call(applyDirectStyles, mark)
        .attr("d", (i) => {
          const p = path();
          const c = curve(p);
          c.lineStart();
          c.point(X1[i], Y1[i]);
          c.point(X2[i], Y2[i]);
          c.lineEnd();
          return p;
        })
        .call(applyChannelStyles, mark, newChannels)
        .call(applyMarkers, mark, newChannels);
    }

    return create("svg:g")
        .call(applyIndirectStyles, this, dimensions)
        .call(applyTransform, x, y, offset + dx, offset + dy)
        .call(Z
          ? g => g.selectAll().data(group(index, i => Z[i]).values()).enter().append("g").each(links)
          : g => g.datum(index).each(links))
      .node();
  }
}

export class DelaunayMesh extends Mark {
  constructor(data, options = {}, defaults = meshDefaults) {
    const {x, y} = options;
    super(
      data,
      [
        {name: "x", value: x, scale: "x"},
        {name: "y", value: y, scale: "y"},
        {name: "z", value: maybeZ(options), optional: true}
      ],
      options,
      defaults
    );
    this.fill = "none";
  }
  _render(delaunay) {
    return delaunay.render();
  }
  render(index, {x, y}, {x: X, y: Y, z: Z, ...channels}, dimensions) {
    const {dx, dy} = this;
    const mark = this;
  function mesh(render) {
      return function (index) {
        const delaunay = Delaunay.from(index, i => X[i], i => Y[i]);
        const newChannels = {};
        for (const k in channels) newChannels[k] = {[index[0]]: channels[k][index[0]]};
        select(this).append("path")
          .datum(index[0])
          .call(applyDirectStyles, mark)
          .call(applyTransform, x, y, offset + dx, offset + dy)
          .attr("d", render(delaunay, dimensions))
          .call(applyChannelStyles, mark, newChannels)
          .call(applyMarkers, mark, newChannels);
      };
    }
    return create("svg:g")
        .call(applyIndirectStyles, this, dimensions)
        .call(Z
          ? g => g.selectAll().data(group(index, i => Z[i]).values()).enter().append("g").each(mesh(this._render))
          : g => g.datum(index).each(mesh(this._render)))
      .node();
  }
}

export class Hull extends DelaunayMesh {
  constructor(data, options = {}) {
    super(data, options, hullDefaults);
  }
  _render(delaunay) {
    return delaunay.renderHull();
  }
}

export function delaunayMark(DelaunayMark, data, {x, y, ...options} = {}) {
  ([x, y] = maybeTuple(x, y));
  return new DelaunayMark(data, {...options, x, y});
}

export function delaunayLink(data, options) {
  return delaunayMark(DelaunayLink, data, options);
}

export function delaunayMesh(data, options) {
  return delaunayMark(DelaunayMesh, data, options);
}

export function hull(data, options) {
  return delaunayMark(Hull, data, options);
}
