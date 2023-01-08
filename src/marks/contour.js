import {contours, geoPath, thresholdSturges} from "d3";
import {create} from "../context.js";
import {range, valueof, identity} from "../options.js";
import {maybeColorChannel, maybeNumberChannel} from "../options.js";
import {Mark} from "../plot.js";
import {applyChannelStyles, applyDirectStyles, applyIndirectStyles, applyTransform} from "../style.js";
import {initializer} from "../transforms/basic.js";
import {maybeTuples, sampler} from "./raster.js";

const defaults = {
  ariaLabel: "contour",
  fill: "value",
  stroke: "currentColor",
  strokeMiterlimit: 1
};

function nonnull(input, name) {
  if (input == null) throw new Error(`missing ${name}`);
}

function number(input, name) {
  const x = +input;
  if (isNaN(x)) throw new Error(`invalid ${name}: ${input}`);
  return x;
}

function integer(input, name) {
  const x = Math.floor(input);
  if (isNaN(x)) throw new Error(`invalid ${name}: ${input}`);
  return x;
}

export class Contour extends Mark {
  constructor(data, options = {}) {
    let {
      width,
      height,
      x,
      y,
      // If X and Y are not given, we assume that F is a dense array of samples
      // covering the entire grid in row-major order. These defaults allow
      // further shorthand where x and y represent grid column and row index.
      x1 = x == null ? 0 : undefined,
      y1 = y == null ? 0 : undefined,
      x2 = x == null ? width : undefined,
      y2 = y == null ? height : undefined,
      pixelSize = 2,
      value = data != null ? identity : undefined
    } = options;
    super(
      data ?? [], // TODO
      {
        x: {value: x, scale: "x", optional: true},
        y: {value: y, scale: "y", optional: true},
        x1: {value: x1 == null ? nonnull(x, "x") : [number(x1, "x1")], scale: "x", optional: true, filter: null},
        y1: {value: y1 == null ? nonnull(y, "y") : [number(y1, "y1")], scale: "y", optional: true, filter: null},
        x2: {value: x2 == null ? nonnull(x, "x") : [number(x2, "x2")], scale: "x", optional: true, filter: null},
        y2: {value: y2 == null ? nonnull(y, "y") : [number(y2, "y2")], scale: "y", optional: true, filter: null},
        value: {value, optional: true}
      },
      contourGeometry(data == null ? sampler("value", options) : options),
      defaults
    );
    this.width = width === undefined ? undefined : integer(width, "width");
    this.height = height === undefined ? undefined : integer(height, "height");
    this.pixelSize = number(pixelSize, "pixelSize");
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
  return initializer(options, function (data, facets, channels, {x, y}, dimensions) {
    // TODO thresholdAuto; compute min and max, too
    // TODO match the behavior of the density mark
    const {thresholds = thresholdSturges} = options;
    const {value: V} = channels;
    let {x1, y1, x2, y2} = channels;
    x1 = x1 ? x(x1.value[0]) : dimensions.marginLeft;
    x2 = x2 ? x(x2.value[0]) : dimensions.width - dimensions.marginRight;
    y1 = y1 ? y(y1.value[0]) : dimensions.marginTop;
    y2 = y2 ? y(y2.value[0]) : dimensions.height - dimensions.marginBottom;
    const imageWidth = Math.abs(x2 - x1);
    const imageHeight = Math.abs(y2 - y1);
    const {pixelSize, width = Math.round(imageWidth / pixelSize), height = Math.round(imageHeight / pixelSize)} = this;
    const geometries = contours().thresholds(thresholds).size([width, height])(V.value);
    for (const {coordinates} of geometries) {
      for (const rings of coordinates) {
        for (const ring of rings) {
          for (const point of ring) {
            point[0] = (point[0] / width) * (x2 - x1) + x1;
            point[1] = (point[1] / height) * (y2 - y1) + y1;
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
