import {group, pathRound as path, select, Delaunay} from "d3";
import {create} from "../context.js";
import {Curve} from "../curve.js";
import {Mark} from "../mark.js";
import {constant, maybeTuple, maybeZ} from "../options.js";
import {
  applyChannelStyles,
  applyDirectStyles,
  applyFrameAnchor,
  applyIndirectStyles,
  applyTransform
} from "../style.js";
import {markers, applyMarkers} from "./marker.js";

const delaunayLinkDefaults = {
  ariaLabel: "delaunay link",
  fill: "none",
  stroke: "currentColor",
  strokeMiterlimit: 1
};

const delaunayMeshDefaults = {
  ariaLabel: "delaunay mesh",
  fill: null,
  stroke: "currentColor",
  strokeOpacity: 0.2
};

const hullDefaults = {
  ariaLabel: "hull",
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 1.5,
  strokeMiterlimit: 1
};

const voronoiDefaults = {
  ariaLabel: "voronoi",
  fill: "none",
  stroke: "currentColor",
  strokeMiterlimit: 1
};

const voronoiMeshDefaults = {
  ariaLabel: "voronoi mesh",
  fill: null,
  stroke: "currentColor",
  strokeOpacity: 0.2
};

class DelaunayLink extends Mark {
  constructor(data, options = {}) {
    const {x, y, z, curve, tension} = options;
    super(
      data,
      {
        x: {value: x, scale: "x", optional: true},
        y: {value: y, scale: "y", optional: true},
        z: {value: z, optional: true}
      },
      options,
      delaunayLinkDefaults
    );
    this.curve = Curve(curve, tension);
    markers(this, options);
  }
  render(index, scales, channels, dimensions, context) {
    const {x, y} = scales;
    const {x: X, y: Y, z: Z} = channels;
    const {curve} = this;
    const [cx, cy] = applyFrameAnchor(this, dimensions);
    const xi = X ? (i) => X[i] : constant(cx);
    const yi = Y ? (i) => Y[i] : constant(cy);
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
        X1[i] = xi(ti);
        Y1[i] = yi(ti);
        X2[i] = xi(tj);
        Y2[i] = yi(tj);
        for (const k in channels) newChannels[k].push(channels[k][tj]);
      }

      const {halfedges, hull, triangles} = Delaunay.from(index, xi, yi);
      for (let i = 0; i < halfedges.length; ++i) {
        // inner edges
        const j = halfedges[i];
        if (j > i) link(triangles[i], triangles[j]);
      }
      for (let i = 0; i < hull.length; ++i) {
        // convex hull
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

    return create("svg:g", context)
      .call(applyIndirectStyles, this, dimensions, context)
      .call(applyTransform, this, {x: X && x, y: Y && y})
      .call(
        Z
          ? (g) =>
              g
                .selectAll()
                .data(group(index, (i) => Z[i]).values())
                .enter()
                .append("g")
                .each(links)
          : (g) => g.datum(index).each(links)
      )
      .node();
  }
}

class AbstractDelaunayMark extends Mark {
  constructor(data, options = {}, defaults, zof = ({z}) => z) {
    const {x, y} = options;
    super(
      data,
      {
        x: {value: x, scale: "x", optional: true},
        y: {value: y, scale: "y", optional: true},
        z: {value: zof(options), optional: true}
      },
      options,
      defaults
    );
  }
  render(index, scales, channels, dimensions, context) {
    const {x, y} = scales;
    const {x: X, y: Y, z: Z} = channels;
    const [cx, cy] = applyFrameAnchor(this, dimensions);
    const xi = X ? (i) => X[i] : constant(cx);
    const yi = Y ? (i) => Y[i] : constant(cy);
    const mark = this;

    function mesh(index) {
      const delaunay = Delaunay.from(index, xi, yi);
      select(this)
        .append("path")
        .datum(index[0])
        .call(applyDirectStyles, mark)
        .attr("d", mark._render(delaunay, dimensions))
        .call(applyChannelStyles, mark, channels);
    }

    return create("svg:g", context)
      .call(applyIndirectStyles, this, dimensions, context)
      .call(applyTransform, this, {x: X && x, y: Y && y})
      .call(
        Z
          ? (g) =>
              g
                .selectAll()
                .data(group(index, (i) => Z[i]).values())
                .enter()
                .append("g")
                .each(mesh)
          : (g) => g.datum(index).each(mesh)
      )
      .node();
  }
}

class DelaunayMesh extends AbstractDelaunayMark {
  constructor(data, options = {}) {
    super(data, options, delaunayMeshDefaults);
    this.fill = "none";
  }
  _render(delaunay) {
    return delaunay.render();
  }
}

class Hull extends AbstractDelaunayMark {
  constructor(data, options = {}) {
    super(data, options, hullDefaults, maybeZ);
  }
  _render(delaunay) {
    return delaunay.renderHull();
  }
}

class Voronoi extends Mark {
  constructor(data, options = {}) {
    const {x, y, z} = options;
    super(
      data,
      {
        x: {value: x, scale: "x", optional: true},
        y: {value: y, scale: "y", optional: true},
        z: {value: z, optional: true}
      },
      options,
      voronoiDefaults
    );
  }
  render(index, scales, channels, dimensions, context) {
    const {x, y} = scales;
    const {x: X, y: Y, z: Z} = channels;
    const [cx, cy] = applyFrameAnchor(this, dimensions);
    const xi = X ? (i) => X[i] : constant(cx);
    const yi = Y ? (i) => Y[i] : constant(cy);
    const mark = this;

    function cells(index) {
      const delaunay = Delaunay.from(index, xi, yi);
      const voronoi = voronoiof(delaunay, dimensions);
      select(this)
        .selectAll()
        .data(index)
        .enter()
        .append("path")
        .call(applyDirectStyles, mark)
        .attr("d", (_, i) => voronoi.renderCell(i))
        .call(applyChannelStyles, mark, channels);
    }

    return create("svg:g", context)
      .call(applyIndirectStyles, this, dimensions, context)
      .call(applyTransform, this, {x: X && x, y: Y && y})
      .call(
        Z
          ? (g) =>
              g
                .selectAll()
                .data(group(index, (i) => Z[i]).values())
                .enter()
                .append("g")
                .each(cells)
          : (g) => g.datum(index).each(cells)
      )
      .node();
  }
}

class VoronoiMesh extends AbstractDelaunayMark {
  constructor(data, options) {
    super(data, options, voronoiMeshDefaults);
    this.fill = "none";
  }
  _render(delaunay, dimensions) {
    return voronoiof(delaunay, dimensions).render();
  }
}

function voronoiof(delaunay, dimensions) {
  const {width, height, marginTop, marginRight, marginBottom, marginLeft} = dimensions;
  return delaunay.voronoi([marginLeft, marginTop, width - marginRight, height - marginBottom]);
}

function delaunayMark(DelaunayMark, data, {x, y, ...options} = {}) {
  [x, y] = maybeTuple(x, y);
  return new DelaunayMark(data, {...options, x, y});
}

/** @jsdoc delaunayLink */
export function delaunayLink(data, options) {
  return delaunayMark(DelaunayLink, data, options);
}

/** @jsdoc delaunayMesh */
export function delaunayMesh(data, options) {
  return delaunayMark(DelaunayMesh, data, options);
}

/** @jsdoc hull */
export function hull(data, options) {
  return delaunayMark(Hull, data, options);
}

/** @jsdoc voronoi */
export function voronoi(data, options) {
  return delaunayMark(Voronoi, data, options);
}

/** @jsdoc voronoiMesh */
export function voronoiMesh(data, options) {
  return delaunayMark(VoronoiMesh, data, options);
}
