import {extent, range, sum, area as shapeArea, namespaces} from "d3";
import {create} from "../context.js";
import {identity, indexOf, isNone, isNoneish, maybeZ} from "../options.js";
import {Mark} from "../plot.js";
import {qt} from "../stats.js";
import {applyDirectStyles, applyGroupedChannelStyles, applyIndirectStyles, applyTransform, groupZ} from "../style.js";
import {maybeDenseIntervalX, maybeDenseIntervalY} from "../transforms/bin.js";

const defaults = {
  ariaLabel: "linear-regression",
  fill: "currentColor",
  fillOpacity: 0.1,
  stroke: "currentColor",
  strokeWidth: 1.5,
  strokeLinecap: "round",
  strokeLinejoin: "round",
  strokeMiterlimit: 1
};

class LinearRegression extends Mark {
  constructor(data, options = {}) {
    const {x, y, z, ci = 0.95, precision = 4} = options;
    super(
      data,
      {
        x: {value: x, scale: "x"},
        y: {value: y, scale: "y"},
        z: {value: maybeZ(options), optional: true}
      },
      options,
      defaults
    );
    this.z = z;
    this.ci = +ci;
    this.precision = +precision;
    if (!(0 <= this.ci && this.ci < 1)) throw new Error(`invalid ci; not in [0, 1): ${ci}`);
    if (!(this.precision > 0)) throw new Error(`invalid precision: ${precision}`);
  }
  render(index, scales, channels, dimensions, context) {
    const {x: X, y: Y, z: Z} = channels;
    const {ci} = this;
    return create("svg:g", context)
      .call(applyIndirectStyles, this, dimensions, context)
      .call(applyTransform, this, scales)
      .call((g) =>
        g
          .selectAll()
          .data(Z ? groupZ(index, Z, this.z) : [index])
          .enter()
          .call((enter) =>
            enter
              .append("path")
              .attr("fill", "none")
              .call(applyDirectStyles, this)
              .call(applyGroupedChannelStyles, this, {...channels, fill: null, fillOpacity: null})
              .attr("d", (I) => this._renderLine(I, X, Y))
              .call(
                ci && !isNone(this.fill)
                  ? (path) =>
                      path
                        .select(pathBefore)
                        .attr("stroke", "none")
                        .call(applyDirectStyles, this)
                        .call(applyGroupedChannelStyles, this, {
                          ...channels,
                          stroke: null,
                          strokeOpacity: null,
                          strokeWidth: null
                        })
                        .attr("d", (I) => this._renderBand(I, X, Y))
                  : () => {}
              )
          )
      )
      .node();
  }
}

function pathBefore() {
  return this.parentNode.insertBefore(this.ownerDocument.createElementNS(namespaces.svg, "path"), this);
}

class LinearRegressionX extends LinearRegression {
  constructor(data, options) {
    super(data, options);
  }
  _renderBand(I, X, Y) {
    const {ci, precision} = this;
    const [y1, y2] = extent(I, (i) => Y[i]);
    const f = linearRegressionF(I, Y, X);
    const g = confidenceIntervalF(I, Y, X, (1 - ci) / 2, f);
    return shapeArea()
      .y((y) => y)
      .x0((y) => g(y, -1))
      .x1((y) => g(y, +1))(range(y1, y2 - precision / 2, precision).concat(y2));
  }
  _renderLine(I, X, Y) {
    const [y1, y2] = extent(I, (i) => Y[i]);
    const f = linearRegressionF(I, Y, X);
    return `M${f(y1)},${y1}L${f(y2)},${y2}`;
  }
}

class LinearRegressionY extends LinearRegression {
  constructor(data, options) {
    super(data, options);
  }
  _renderBand(I, X, Y) {
    const {ci, precision} = this;
    const [x1, x2] = extent(I, (i) => X[i]);
    const f = linearRegressionF(I, X, Y);
    const g = confidenceIntervalF(I, X, Y, (1 - ci) / 2, f);
    return shapeArea()
      .x((x) => x)
      .y0((x) => g(x, -1))
      .y1((x) => g(x, +1))(range(x1, x2 - precision / 2, precision).concat(x2));
  }
  _renderLine(I, X, Y) {
    const [x1, x2] = extent(I, (i) => X[i]);
    const f = linearRegressionF(I, X, Y);
    return `M${x1},${f(x1)}L${x2},${f(x2)}`;
  }
}

/** @jsdoc linearRegressionX */
export function linearRegressionX(data, options = {}) {
  const {
    y = indexOf,
    x = identity,
    stroke,
    fill = isNoneish(stroke) ? "currentColor" : stroke,
    ...remainingOptions
  } = options;
  return new LinearRegressionX(data, maybeDenseIntervalY({...remainingOptions, x, y, fill, stroke}));
}

/** @jsdoc linearRegressionY */
export function linearRegressionY(data, options = {}) {
  const {
    x = indexOf,
    y = identity,
    stroke,
    fill = isNoneish(stroke) ? "currentColor" : stroke,
    ...remainingOptions
  } = options;
  return new LinearRegressionY(data, maybeDenseIntervalX({...remainingOptions, x, y, fill, stroke}));
}

function linearRegressionF(I, X, Y) {
  let sumX = 0,
    sumY = 0,
    sumXY = 0,
    sumX2 = 0;
  for (const i of I) {
    const xi = X[i];
    const yi = Y[i];
    sumX += xi;
    sumY += yi;
    sumXY += xi * yi;
    sumX2 += xi * xi;
  }
  const n = I.length;
  const slope = (n * sumXY - sumX * sumY) / (n * sumX2 - sumX * sumX);
  const intercept = (sumY - slope * sumX) / n;
  return (x) => slope * x + intercept;
}

function confidenceIntervalF(I, X, Y, p, f) {
  const mean = sum(I, (i) => X[i]) / I.length;
  let a = 0,
    b = 0;
  for (const i of I) {
    a += (X[i] - mean) ** 2;
    b += (Y[i] - f(X[i])) ** 2;
  }
  const sy = Math.sqrt(b / (I.length - 2));
  const t = qt(p, I.length - 2);
  return (x, k) => {
    const Y = f(x);
    const se = sy * Math.sqrt(1 / I.length + (x - mean) ** 2 / a);
    return Y + k * t * se;
  };
}
