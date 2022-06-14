import {bisector, extent, group, path, select, Delaunay} from "d3";
import {create} from "../context.js";
import {Curve} from "../curve.js";
import {constant, maybeTuple, maybeZ} from "../options.js";
import {Mark} from "../plot.js";
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
      .call(applyIndirectStyles, this, scales, dimensions)
      .call(applyTransform, this, scales)
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
      .call(applyIndirectStyles, this, scales, dimensions)
      .call(applyTransform, this, scales)
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
    const {x: X, y: Y, z: Z} = channels;
    const [cx, cy] = applyFrameAnchor(this, dimensions);
    const xi = X ? (i) => X[i] : constant(cx);
    const yi = Y ? (i) => Y[i] : constant(cy);

    function cells(index) {
      const delaunay = Delaunay.from(index, xi, yi);
      const voronoi = voronoiof(delaunay, dimensions);
      select(this)
        .selectAll()
        .data(index)
        .enter()
        .append("path")
        .call(applyDirectStyles, this)
        .attr("d", (_, i) => voronoi.renderCell(i))
        .call(applyChannelStyles, this, channels);
    }

    return create("svg:g", context)
      .call(applyIndirectStyles, this, scales, dimensions)
      .call(applyTransform, this, scales)
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

export function delaunayLink(data, options) {
  return delaunayMark(DelaunayLink, data, options);
}

export function delaunayMesh(data, options) {
  return delaunayMark(DelaunayMesh, data, options);
}

export function hull(data, options) {
  return delaunayMark(Hull, data, options);
}

export function voronoi(data, options) {
  return delaunayMark(Voronoi, data, options);
}

export function voronoiMesh(data, options) {
  return delaunayMark(VoronoiMesh, data, options);
}

class GabrielMesh extends AbstractDelaunayMark {
  constructor(data, options) {
    super(data, options, voronoiMeshDefaults);
    this.fill = "none";
  }
  _accept(delaunay) {
    const {points, triangles} = delaunay;
    return (i) => {
      const a = triangles[i];
      const b = triangles[i % 3 === 2 ? i - 2 : i + 1];
      return [a, b].includes(
        delaunay.find((points[2 * a] + points[2 * b]) / 2, (points[2 * a + 1] + points[2 * b + 1]) / 2, a)
      );
    };
  }
  _render(delaunay) {
    const p = new path();
    const {points, halfedges, triangles} = delaunay;
    const accept = this._accept(delaunay);
    for (let i = 0, n = triangles.length; i < n; ++i) {
      const j = halfedges[i];
      if (i < j) continue;
      if (accept(i)) {
        const a = triangles[i];
        const b = triangles[i % 3 === 2 ? i - 2 : i + 1];
        p.moveTo(points[2 * a], points[2 * a + 1]);
        p.lineTo(points[2 * b], points[2 * b + 1]);
      }
    }
    return "" + p;
  }
}

class UrquhartMesh extends GabrielMesh {
  constructor(data, options) {
    super(data, options, voronoiMeshDefaults);
    this.fill = "none";
  }
  _accept(delaunay, score = euclidean2) {
    const {halfedges, points, triangles} = delaunay;
    const n = triangles.length;
    const removed = new Uint8Array(n);
    for (let e = 0; e < n; e += 3) {
      const p0 = triangles[e],
        p1 = triangles[e + 1],
        p2 = triangles[e + 2];
      const p01 = score(points, p0, p1),
        p12 = score(points, p1, p2),
        p20 = score(points, p2, p0);
      removed[
        p20 > p01 && p20 > p12
          ? Math.max(e + 2, halfedges[e + 2])
          : p12 > p01 && p12 > p20
          ? Math.max(e + 1, halfedges[e + 1])
          : Math.max(e, halfedges[e])
      ] = 1;
    }
    return (i) => !removed[i];
  }
}

function euclidean2(points, i, j) {
  return (points[i * 2] - points[j * 2]) ** 2 + (points[i * 2 + 1] - points[j * 2 + 1]) ** 2;
}

class MSTMesh extends GabrielMesh {
  constructor(data, options) {
    super(data, options, voronoiMeshDefaults);
    this.fill = "none";
  }
  _accept(delaunay, score = euclidean2) {
    const {points, triangles} = delaunay;
    const set = new Uint8Array(points.length / 2);
    const tree = new Set();
    const heap = [];

    const bisect = bisector(([v]) => -v).left;
    function heap_insert(x, v) {
      heap.splice(bisect(heap, -v), 0, [v, x]);
    }
    function heap_pop() {
      return heap.length && heap.pop()[1];
    }

    // Initialize the heap with the outgoing edges of vertex zero.
    set[0] = 1;
    for (const i of delaunay.neighbors(0)) {
      heap_insert([0, i], score(points, 0, i));
    }

    // For each remaining minimum edge in the heap…
    let edge;
    while ((edge = heap_pop())) {
      const [i, j] = edge;

      // If j is already connected, skip; otherwise add the new edge to point j.
      if (set[j]) continue;
      set[j] = 1;
      tree.add(`${extent([i, j])}`);

      // Add each unconnected neighbor k of point j to the heap.
      for (const k of delaunay.neighbors(j)) {
        if (set[k]) continue;
        heap_insert([j, k], score(points, j, k));
      }
    }

    return (i) => {
      const a = triangles[i];
      const b = triangles[i % 3 === 2 ? i - 2 : i + 1];
      return tree.has(`${extent([a, b])}`);
    };
  }
}

export function gabrielMesh(data, options) {
  return delaunayMark(GabrielMesh, data, options);
}

export function urquhartMesh(data, options) {
  return delaunayMark(UrquhartMesh, data, options);
}

export function mstMesh(data, options) {
  return delaunayMark(MSTMesh, data, options);
}
