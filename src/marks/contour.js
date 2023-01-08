import {contours, geoPath, thresholdSturges} from "d3";
import {create} from "../context.js";
import {range, valueof, identity} from "../options.js";
import {Position} from "../projection.js";
import {applyChannelStyles, applyDirectStyles, applyIndirectStyles, applyTransform} from "../style.js";
import {initializer} from "../transforms/basic.js";
import {sampler, maybeTuples, AbstractRaster} from "./raster.js";

const defaults = {
  ariaLabel: "contour",
  fill: "value",
  stroke: "currentColor",
  strokeMiterlimit: 1,
  pixelSize: 2
};

export class Contour extends AbstractRaster {
  constructor(data, options = {}) {
    const {value = data != null ? identity : undefined} = options;
    // If the data is null, then the value channel is constructed using the
    // sampler initializer; it is not passed to super because we don’t want to
    // compute it before there’s data.
    options = contourGeometry(data == null ? sampler("value", options) : options);
    super(data, data == null ? undefined : {value: {value}}, options, defaults);
    // With the exception of the value channel, this mark’s channels are not
    // evaluated on the initial data, but rather on on the generated contour
    // multipolygons! Here we redefine any channels (e.g., fill) as a transform
    // that initially returns the empty array, while recording the value
    // definition so that it can be evaluated in the initializer.
    for (const key in this.channels) {
      const value = this.channels[key].value;
      const valueType = typeof value;
      if (valueType === "string" || valueType === "function") {
        this.channels[key].value = {transform: () => [], defer: value};
      }
    }
  }
  render(index, scales, channels, dimensions, context) {
    const {geometry: G} = channels;
    const path = geoPath();
    return create("svg:g", context)
      .call(applyIndirectStyles, this, dimensions, context)
      .call(applyTransform, this, scales)
      .call((g) => {
        g.selectAll()
          .data(index)
          .enter()
          .append("path")
          .call(applyDirectStyles, this)
          .attr("d", (i) => path(G[i]))
          .call(applyChannelStyles, this, channels);
      })
      .node();
  }
}

function contourGeometry(options) {
  const {thresholds = thresholdSturges} = options; // TODO thresholdAuto; match density mark
  return initializer(options, function (data, facets, channels, scales, dimensions, context) {
    let {x1, y1, x2, y2} = channels;
    ({x: [x1], y: [y1]} = Position({x: x1, y: y1}, scales, context)); // prettier-ignore
    ({x: [x2], y: [y2]} = Position({x: x2, y: y2}, scales, context)); // prettier-ignore
    const V = channels.value.value;
    const dx = x2 - x1;
    const dy = y2 - y1;
    const {pixelSize: k, width = Math.round(Math.abs(dx) / k), height = Math.round(Math.abs(dy) / k)} = this;
    const geometries = contours().thresholds(thresholds).size([width, height])(V);

    // Rescale the contour multipolygon from grid to screen coordinates.
    for (const {coordinates} of geometries) {
      for (const rings of coordinates) {
        for (const ring of rings) {
          for (const point of ring) {
            point[0] = (point[0] / width) * dx + x1;
            point[1] = (point[1] / height) * dy + y1;
          }
        }
      }
    }

    // Compute any deferred channels.
    const newChannels = {geometry: {value: geometries}};
    for (const key in this.channels) {
      if (key === "value") continue;
      const value = this.channels[key].value;
      if (!value.defer) continue;
      newChannels[key] = {value: valueof(geometries, value.defer), scale: true};
    }

    return {data: geometries, facets: [range(geometries)], channels: newChannels};
  });
}

export function contour() {
  return new Contour(...maybeTuples(...arguments));
}
