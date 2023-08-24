import {geoGraticule10, geoPath, geoTransform} from "d3";
import {create} from "../context.js";
import {negative, positive} from "../defined.js";
import {Mark} from "../mark.js";
import {keyword, identity, maybeNumberChannel} from "../options.js";
import {applyChannelStyles, applyDirectStyles, applyIndirectStyles, applyTransform} from "../style.js";
import {withDefaultSort} from "./dot.js";

const defaults = {
  ariaLabel: "geo",
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 1,
  strokeLinecap: "round",
  strokeLinejoin: "round",
  strokeMiterlimit: 1
};

export class Geo extends Mark {
  constructor(data, options = {}) {
    const [vr, cr] = maybeNumberChannel(options.r, 3);
    let {geometry} = options;
    if (geometry?.value) geometry = {scale: "projection", ...geometry};
    else geometry = {value: geometry, scale: "projection"};
    if (geometry.scale !== null) keyword(geometry.scale, "scale", ["projection"]);
    super(
      data,
      {geometry, r: {value: vr, scale: "r", filter: positive, optional: true}},
      withDefaultSort(options),
      defaults
    );
    this.r = cr;
  }
  render(index, scales, channels, dimensions, context) {
    const {geometry: G, r: R} = channels;
    const path = geoPath(
      channels.channels.geometry.scale === "projection" ? context.projection ?? scaleProjection(scales) : null
    );
    const {r} = this;
    if (negative(r)) index = [];
    else if (r !== undefined) path.pointRadius(r);
    return create("svg:g", context)
      .call(applyIndirectStyles, this, dimensions, context)
      .call(applyTransform, this, scales)
      .call((g) => {
        g.selectAll()
          .data(index)
          .enter()
          .append("path")
          .call(applyDirectStyles, this)
          .attr("d", R ? (i) => path.pointRadius(R[i])(G[i]) : (i) => path(G[i]))
          .call(applyChannelStyles, this, channels);
      })
      .node();
  }
}

// If no projection is specified, default to a projection that passes points
// through the x and y scales, if any.
function scaleProjection({x: X, y: Y}) {
  if (X || Y) {
    X ??= (x) => x;
    Y ??= (y) => y;
    return geoTransform({
      point(x, y) {
        this.stream.point(X(x), Y(y));
      }
    });
  }
}

export function geo(data, {geometry = identity, ...options} = {}) {
  switch (data?.type) {
    case "FeatureCollection":
      data = data.features;
      break;
    case "GeometryCollection":
      data = data.geometries;
      break;
    case "Feature":
    case "LineString":
    case "MultiLineString":
    case "MultiPoint":
    case "MultiPolygon":
    case "Point":
    case "Polygon":
    case "Sphere":
      data = [data];
      break;
  }
  return new Geo(data, {geometry, ...options});
}

export function sphere({strokeWidth = 1.5, ...options} = {}) {
  return geo({type: "Sphere"}, {strokeWidth, ...options});
}

export function graticule({strokeOpacity = 0.1, ...options} = {}) {
  return geo(geoGraticule10(), {strokeOpacity, ...options});
}
