import {contours, geoPath, thresholdSturges} from "d3";
import {create} from "../context.js";
import {first, second, third, isTuples, range, valueof} from "../options.js";
import {maybeColorChannel, maybeNumberChannel} from "../options.js";
import {Mark} from "../plot.js";
import {applyChannelStyles, applyDirectStyles, applyIndirectStyles, applyTransform} from "../style.js";
import {initializer} from "../transforms/basic.js";

const defaults = {
  ariaLabel: "contour",
  fill: "none",
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
      pixelSize = 2
    } = options;
    super(
      [], // TODO
      {
        x: {value: x, scale: "x", optional: true},
        y: {value: y, scale: "y", optional: true},
        x1: {value: x1 == null ? nonnull(x, "x") : [number(x1, "x1")], scale: "x", optional: true, filter: null},
        y1: {value: y1 == null ? nonnull(y, "y") : [number(y1, "y1")], scale: "y", optional: true, filter: null},
        x2: {value: x2 == null ? nonnull(x, "x") : [number(x2, "x2")], scale: "x", optional: true, filter: null},
        y2: {value: y2 == null ? nonnull(y, "y") : [number(y2, "y2")], scale: "y", optional: true, filter: null}
      },
      contourGeometry(sampleValue(options)),
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
    const geometry = contours().thresholds(thresholds).size([width, height])(V.value);
    for (const multiPolygon of geometry) {
      for (const rings of multiPolygon.coordinates) {
        for (const ring of rings) {
          for (const point of ring) {
            point[0] = (point[0] / width) * (x2 - x1) + x1;
            point[1] = (point[1] / height) * (y2 - y1) + y1;
          }
        }
      }
    }
    return {
      data: geometry,
      facets: [range(geometry)],
      channels: {
        geometry: {value: geometry},
        ...(vfill && {fill: {value: valueof(geometry, vfill), scale: true}}),
        ...(vfillOpacity && {fillOpacity: {value: valueof(geometry, vfillOpacity), scale: true}}),
        ...(vstroke && {stroke: {value: valueof(geometry, vstroke), scale: true}}),
        ...(vstrokeOpacity && {strokeOpacity: {value: valueof(geometry, vstrokeOpacity), scale: true}})
      }
    };
  });
}

export function contour(data, options) {
  if (arguments.length < 2) (options = data), (data = null);
  let {x, y, value, ...rest} = options;
  // Because we implicit x and y when value is a function of (x, y), and when
  // data is a dense grid, we must further disambiguate by testing whether data
  // contains [x, y, z?] tuples. Hence you can’t use this shorthand with a
  // transform that lazily generates tuples, but that seems reasonable since
  // this is just for convenience anyway.
  if (x === undefined && y === undefined && isTuples(data)) {
    (x = first), (y = second);
    if (value === undefined) value = third;
  }
  return new Contour(data, {...rest, x, y, value});
}

// Evaluates a function at pixel midpoints. TODO Faceting? Optimize linear?
function sampleValue({value, ...options} = {}) {
  return initializer(options, function (data, facets, {x1, y1, x2, y2}, {x, y}) {
    // TODO Allow projections, if invertible.
    if (!x) throw new Error("missing scale: x");
    if (!y) throw new Error("missing scale: y");
    let {width: w, height: h} = options;
    const {pixelSize} = this;
    (x1 = x(x1.value[0])), (y1 = y(y1.value[0])), (x2 = x(x2.value[0])), (y2 = y(y2.value[0]));
    // Note: this must exactly match the defaults in render above!
    if (w === undefined) w = Math.round(Math.abs(x2 - x1) / pixelSize);
    if (h === undefined) h = Math.round(Math.abs(y2 - y1) / pixelSize);
    const kx = (x2 - x1) / w;
    const ky = (y2 - y1) / h;
    (x1 += kx / 2), (y1 += ky / 2);
    const V = new Array(w * h);
    for (let yi = 0, i = 0; yi < h; ++yi) {
      for (let xi = 0; xi < w; ++xi, ++i) {
        V[i] = value(x.invert(x1 + xi * kx), y.invert(y1 + yi * ky));
      }
    }
    return {data: V, facets, channels: {value: {value: V}}};
  });
}
