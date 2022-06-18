import {create, extent, range, sum, area as shapeArea} from "d3";
import {identity, indexOf, maybeZ} from "../options.js";
import {Mark} from "../plot.js";
import {qt} from "../stats.js";
import {applyDirectStyles, applyGroupedChannelStyles, applyIndirectStyles, applyTransform, groupZ, offset} from "../style.js";
import {maybeDenseIntervalX} from "../transforms/bin.js";

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

class LinearRegressionY extends Mark {
  constructor(data, options = {}) {
    const {x, y, z, p = 0.05, precision = 4} = options;
    super(
      data,
      [
        {name: "x", value: x, scale: "x"},
        {name: "y", value: y, scale: "y"},
        {name: "z", value: maybeZ(options), optional: true}
      ],
      options,
      defaults
    );
    this.z = z;
    this.p = +p;
    this.precision = +precision;
    if (!(0 < this.p && this.p < 0.5)) throw new Error(`invalid p; not in (0, 0.5): ${p}`);
    if (!(this.precision > 0)) throw new Error(`invalid precision: ${precision}`);
  }
  render(I, {x, y}, channels, dimensions) {
    const {x: X, y: Y, z: Z} = channels;
    const {dx, dy, p, precision} = this;
    return create("svg:g")
        .call(applyIndirectStyles, this, dimensions)
        .call(applyTransform, x, y, offset + dx, offset + dy)
        .call(g => g.selectAll()
          .data(Z ? groupZ(I, Z, this.z) : [I])
          .enter()
          .call(enter => enter.append("path")
            .attr("stroke", "none")
            .call(applyDirectStyles, this)
            .call(applyGroupedChannelStyles, this, {...channels, stroke: null, strokeOpacity: null, strokeWidth: null})
            .attr("d", I => {
              const [x1, x2] = extent(I, i => X[i]);
              const f = linearRegressionF(I, X, Y);
              const g = confidenceIntervalF(I, X, Y, p, f);
              return shapeArea()
                  .x(x => x)
                  .y0(x => g(x, -1))
                  .y1(x => g(x, +1))
                (range(x1, x2 - precision / 2, precision).concat(x2));
            }))
          .call(enter => enter.append("path")
            .attr("fill", "none")
            .call(applyDirectStyles, this)
            .call(applyGroupedChannelStyles, this, {...channels, fill: null, fillOpacity: null})
            .attr("d", I => {
              const [x1, x2] = extent(I, i => X[i]);
              const f = linearRegressionF(I, X, Y);
              return `M${x1},${f(x1)}L${x2},${f(x2)}`;
            })))
      .node();
  }
}

export function linearRegressionY(data, {x = indexOf, y = identity, stroke, fill = stroke, ...options} = {}) {
  return new LinearRegressionY(data, maybeDenseIntervalX({...options, x, y, fill, stroke}));
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
  return (x, k) => {
    const Y = f(x);
    const se = sy * Math.sqrt(1 / I.length + (x - mean) ** 2 / a);
    return Y + k * t * se;
  };
}
