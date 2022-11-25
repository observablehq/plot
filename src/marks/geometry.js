import {geoGraticule10, geoPath} from "d3";
import {create} from "../context.js";
import {identity} from "../options.js";
import {Mark} from "../plot.js";
import {applyChannelStyles, applyDirectStyles, applyIndirectStyles, applyTransform, getClipId} from "../style.js";

const defaults = {
  ariaLabel: "geometry",
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 1,
  strokeLinecap: "round",
  strokeLinejoin: "round",
  strokeMiterlimit: 1
};

export class Geometry extends Mark {
  constructor(data, options = {}) {
    let {geometry = identity, clip} = options;
    if (clip === "sphere") ({clip, ...options} = options); // drop option to super
    super(
      data,
      {
        geometry: {value: geometry}
      },
      options,
      defaults
    );
    if (clip === "sphere") this.clip = clip; // override generic mark.clip
  }
  render(index, scales, channels, dimensions, context) {
    const {geometry} = channels;
    const {projection} = context;
    const path = geoPath(projection);
    return create("svg:g", context)
      .call(applyIndirectStyles, this, scales, dimensions)
      .call(applyTransform, this, scales)
      .call((g) => {
        g.selectAll()
          .data(index)
          .enter()
          .append("path")
          .call(applyDirectStyles, this)
          .attr("d", (i) => path(geometry[i]))
          .call(applyChannelStyles, this, channels);
        if (this.clip === "sphere") {
          const id = getClipId();
          g.attr("clip-path", `url(#${id})`)
            .append("clipPath")
            .attr("id", id)
            .append("path")
            .attr("d", path({type: "Sphere"}));
        }
      })
      .node();
  }
}

export function geometry(data, options) {
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
  return new Geometry(data, options);
}

export function sphere(options) {
  return geometry({type: "Sphere"}, options);
}

export function graticule(options) {
  return geometry(geoGraticule10(), options);
}
