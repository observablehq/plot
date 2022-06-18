import {create, sum, area as shapeArea, range} from "d3";
import {identity, indexOf, maybeZ} from "../options.js";
import {Mark, marks} from "../plot.js";
import {qt} from "../stats.js";
import {applyDirectStyles, applyGroupedChannelStyles, applyIndirectStyles, applyTransform, groupZ, offset} from "../style.js";
import {maybeDenseIntervalX} from "../transforms/bin.js";

const lineDefaults = {
  ariaLabel: "linear-regression",
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 1.5,
  strokeLinecap: "round",
  strokeLinejoin: "round",
  strokeMiterlimit: 1
};

const bandDefaults = {
  ariaLabel: "linear-regression-band",
  fillOpacity: 0.1,
  strokeWidth: 1,
  strokeLinecap: "round",
  strokeLinejoin: "round",
  strokeMiterlimit: 1
};

export function linearRegressionY(data, {x = indexOf, y = identity, z, stroke, fill = stroke, p, ...options} = {}) {
  z = maybeZ({z, fill, stroke}); // enforce consistent z
  const line = new LinearRegressionY(data, maybeDenseIntervalX({...options, x, y, z, stroke, sort: {channel: "x"}}));
  if (p === null || p === 0) return line;
  const band = new LinearRegressionBandY(data, maybeDenseIntervalX({...options, x, y, z, p, fill, sort: {channel: "x"}}));
  return marks(band, line);
}

class LinearRegressionY extends Mark {
  constructor(data, options = {}) {
    const {x, y, z} = options;
    super(
      data,
      [
        {name: "x", value: x, scale: "x"},
        {name: "y", value: y, scale: "y"},
        {name: "z", value: z, optional: true}
      ],
      options,
      lineDefaults
    );
    this.z = z;
  }
  render(I, {x, y}, channels, dimensions) {
    const {x: X, y: Y, z: Z} = channels;
    const {dx, dy} = this;
    const {width, marginLeft, marginRight} = dimensions;
    const x1 = marginLeft;
    const x2 = width - marginRight;
    return create("svg:g")
        .call(applyIndirectStyles, this, dimensions)
        .call(applyTransform, x, y, offset + dx, offset + dy)
        .call(g => g.selectAll()
          .data(Z ? groupZ(I, Z, this.z) : [I])
          .enter()
          .append("path")
            .call(applyDirectStyles, this)
            .call(applyGroupedChannelStyles, this, channels)
            .attr("d", I => {
              const f = linearRegressionF(I, X, Y);
              return `M${x1},${f(x1)}L${x2},${f(x2)}`;
            }))
      .node();
  }
}

class LinearRegressionBandY extends Mark {
  constructor(data, options = {}) {
    const {x, y, z, p = 0.05} = options;
    super(
      data,
      [
        {name: "x", value: x, scale: "x"},
        {name: "y", value: y, scale: "y"},
        {name: "z", value: z, optional: true}
      ],
      options,
      bandDefaults
    );
    this.z = z;
    this.p = +p;
    if (!(0 < this.p && this.p < 0.5)) throw new Error(`p not in (0, 0.5): ${p}`);
  }
  render(I, {x, y}, channels, dimensions) {
    const {x: X, y: Y, z: Z} = channels;
    const {dx, dy, p} = this;
    const {width, marginLeft, marginRight} = dimensions;
    const x1 = marginLeft;
    const x2 = width - marginRight;
    return create("svg:g")
        .call(applyIndirectStyles, this, dimensions)
        .call(applyTransform, x, y, offset + dx, offset + dy)
        .call(g => g.selectAll()
          .data(Z ? groupZ(I, Z, this.z) : [I])
          .enter()
          .append("path")
            .call(applyDirectStyles, this)
            .call(applyGroupedChannelStyles, this, channels)
            .attr("d", I => {
              const f = linearRegressionF(I, X, Y);
              const g = confidenceIntervalF(I, X, Y, p, f);
              return shapeArea()
                  .x(x => x)
                  .y0(x => g(x)[0])
                  .y1(x => g(x)[1])
                (range(x1, x2 - 1, 4).concat(x2));
            }))
      .node();
  }
}

function linearRegressionF(I, X, Y) {
  let sumX = 0, sumY = 0, sumXY = 0, sumX2 = 0;
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
  return x => slope * x + intercept;
}

function confidenceIntervalF(I, X, Y, p, f) {
  const mean = sum(I, i => X[i]) / I.length;
  let a = 0, b = 0;
  for (const i of I) {
    a += (X[i] - mean) ** 2;
    b += (Y[i] - f(X[i])) ** 2;
  }
  const sy = Math.sqrt(b / (I.length - 2));
  const t = qt(p, I.length - 2);
  return x => {
    const Y = f(x);
    const se = sy * Math.sqrt(1 / I.length + (x - mean) ** 2 / a);
    return [Y - t * se, Y + t * se];
  };
}
