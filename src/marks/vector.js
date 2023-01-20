import {pathRound as path} from "d3";
import {create} from "../context.js";
import {maybeFrameAnchor, maybeNumberChannel, maybeTuple, keyword, identity} from "../options.js";
import {Mark} from "../mark.js";
import {
  applyChannelStyles,
  applyDirectStyles,
  applyFrameAnchor,
  applyIndirectStyles,
  applyTransform
} from "../style.js";
import {template} from "../template.js";

const defaults = {
  ariaLabel: "vector",
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 1.5,
  strokeLinejoin: "round",
  strokeLinecap: "round"
};

const defaultRadius = 3.5;

// The size of the arrowhead is proportional to its length, but we still allow
// the relative size of the head to be controlled via the mark’s width option;
// doubling the default radius will produce an arrowhead that is twice as big.
// That said, we’ll probably want a arrow with a fixed head size, too.
const wingRatio = defaultRadius * 5;

const shapeArrow = {
  draw(context, l, r) {
    const wing = (l * r) / wingRatio;
    context.moveTo(0, 0);
    context.lineTo(0, -l);
    context.moveTo(-wing, wing - l);
    context.lineTo(0, -l);
    context.lineTo(wing, wing - l);
  }
};

const shapeSpike = {
  draw(context, l, r) {
    context.moveTo(-r, 0);
    context.lineTo(0, -l);
    context.lineTo(r, 0);
  }
};

const shapes = new Map([
  ["arrow", shapeArrow],
  ["spike", shapeSpike]
]);

function isShapeObject(value) {
  return value && typeof value.draw === "function";
}

function Shape(shape) {
  if (isShapeObject(shape)) return shape;
  const value = shapes.get(`${shape}`.toLowerCase());
  if (value) return value;
  throw new Error(`invalid shape: ${shape}`);
}

export class Vector extends Mark {
  constructor(data, options = {}) {
    const {x, y, r = defaultRadius, length, rotate, shape = shapeArrow, anchor = "middle", frameAnchor} = options;
    const [vl, cl] = maybeNumberChannel(length, 12);
    const [vr, cr] = maybeNumberChannel(rotate, 0);
    super(
      data,
      {
        x: {value: x, scale: "x", optional: true},
        y: {value: y, scale: "y", optional: true},
        length: {value: vl, scale: "length", optional: true},
        rotate: {value: vr, optional: true}
      },
      options,
      defaults
    );
    this.r = +r;
    this.length = cl;
    this.rotate = cr;
    this.shape = Shape(shape);
    this.anchor = keyword(anchor, "anchor", ["start", "middle", "end"]);
    this.frameAnchor = maybeFrameAnchor(frameAnchor);
  }
  render(index, scales, channels, dimensions, context) {
    const {x, y} = scales;
    const {x: X, y: Y, length: L, rotate: A} = channels;
    const {length, rotate, anchor, shape, r} = this;
    const [cx, cy] = applyFrameAnchor(this, dimensions);
    return create("svg:g", context)
      .call(applyIndirectStyles, this, dimensions, context)
      .call(applyTransform, this, {x: X && x, y: Y && y})
      .call((g) =>
        g
          .selectAll()
          .data(index)
          .enter()
          .append("path")
          .call(applyDirectStyles, this)
          .attr(
            "transform",
            template`translate(${X ? (i) => X[i] : cx},${Y ? (i) => Y[i] : cy})${
              A ? (i) => ` rotate(${A[i]})` : rotate ? ` rotate(${rotate})` : ``
            }${
              anchor === "start"
                ? ``
                : anchor === "end"
                ? L
                  ? (i) => ` translate(0,${L[i]})`
                  : ` translate(0,${length})`
                : L
                ? (i) => ` translate(0,${L[i] / 2})`
                : ` translate(0,${length / 2})`
            }`
          )
          .attr(
            "d",
            L
              ? (i) => {
                  const p = path();
                  shape.draw(p, L[i], r);
                  return p;
                }
              : (() => {
                  const p = path();
                  shape.draw(p, length, r);
                  return p;
                })()
          )
          .call(applyChannelStyles, this, channels)
      )
      .node();
  }
}

/** @jsdoc vector */
export function vector(data, options = {}) {
  let {x, y, ...rest} = options;
  if (options.frameAnchor === undefined) [x, y] = maybeTuple(x, y);
  return new Vector(data, {...rest, x, y});
}

/** @jsdoc vectorX */
export function vectorX(data, options = {}) {
  const {x = identity, ...rest} = options;
  return new Vector(data, {...rest, x});
}

/** @jsdoc vectorY */
export function vectorY(data, options = {}) {
  const {y = identity, ...rest} = options;
  return new Vector(data, {...rest, y});
}

/** @jsdoc spike */
export function spike(data, options = {}) {
  const {
    shape = shapeSpike,
    stroke = defaults.stroke,
    strokeWidth = 1,
    fill = stroke,
    fillOpacity = 0.3,
    anchor = "start",
    ...rest
  } = options;
  return vector(data, {...rest, shape, stroke, strokeWidth, fill, fillOpacity, anchor});
}
