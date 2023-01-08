import {contours, geoPath, thresholdSturges} from "d3";
import {create} from "../context.js";
import {range, valueof, identity} from "../options.js";
import {maybeColorChannel, maybeNumberChannel} from "../options.js";
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
    options = contourGeometry(data == null ? sampler("value", options) : options);
    super(data, {value: {value, optional: true}}, options, defaults);
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
  const {fill, fillOpacity, stroke, strokeOpacity} = options;
  const [vfill] = maybeColorChannel(fill, defaults.fill);
  const [vfillOpacity] = maybeNumberChannel(fillOpacity);
  const [vstroke] = maybeColorChannel(stroke, defaults.stroke);
  const [vstrokeOpacity] = maybeNumberChannel(strokeOpacity);
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
    return {
      data: geometries,
      facets: [range(geometries)],
      channels: {
        geometry: {value: geometries},
        ...(vfill && {fill: {value: valueof(geometries, vfill), scale: true}}),
        ...(vfillOpacity && {fillOpacity: {value: valueof(geometries, vfillOpacity), scale: true}}),
        ...(vstroke && {stroke: {value: valueof(geometries, vstroke), scale: true}}),
        ...(vstrokeOpacity && {strokeOpacity: {value: valueof(geometries, vstrokeOpacity), scale: true}})
      }
    };
  });
}

export function contour() {
  return new Contour(...maybeTuples(...arguments));
}
