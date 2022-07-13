import {create} from "../context.js";
import {isOptions, number} from "../options.js";
import {Mark} from "../plot.js";
import {applyDirectStyles, applyIndirectStyles, applyTransform} from "../style.js";

const defaults = {
  ariaLabel: "grid",
  fill: "none",
  stroke: "currentColor",
  strokeOpacity: 0.1
};

export class Grid extends Mark {
  constructor(options = {}, x, y) {
    const {
      ticks,
      inset = 0,
      insetTop = inset,
      insetRight = inset,
      insetBottom = inset,
      insetLeft = inset
    } = options;
    super(undefined, undefined, options, defaults);
    this.insetTop = number(insetTop);
    this.insetRight = number(insetRight);
    this.insetBottom = number(insetBottom);
    this.insetLeft = number(insetLeft);
    this.ticks = ticks;
    this.x = x;
    this.y = y;
  }
  render(index, scales, channels, dimensions, context) {
    const {x, y} = scales;
    const {marginTop, marginRight, marginBottom, marginLeft, width, height} = dimensions;
    const {insetTop, insetRight, insetBottom, insetLeft, ticks} = this;
    const {axes} = context;
    const ax = this.x === "auto" ? !!x : this.x;
    const ay = this.y === "auto" ? !!y : this.y;
    if (ax && !x) throw new Error("missing scale: x");
    if (ay && !y) throw new Error("missing scale: y");
    const tx = !ax? [] : ticks !== undefined ? ticks : axes.x?.ticks;
    const ty = !ay? [] : ticks !== undefined ? ticks : axes.y?.ticks;
    return create("svg:g", context)
        .call(applyIndirectStyles, this, scales, dimensions)
        .call(applyTransform, this, {})
        .call(g => g.selectAll()
          .data(tickValues(x, tx))
          .enter()
          .append("line")
            .call(applyDirectStyles, this)
            .attr("x1", x)
            .attr("x2", x)
            .attr("y1", marginTop + insetTop)
            .attr("y2", height - marginBottom - insetBottom))
        .call(g => g.selectAll()
          .data(tickValues(y, ty))
          .enter()
          .append("line")
            .call(applyDirectStyles, this)
            .attr("y1", y)
            .attr("y2", y)
            .attr("x1", marginLeft + insetLeft)
            .attr("x2", width - marginRight - insetRight))
      .node();
  }
}

function tickValues(scale, ticks) {
  return Array.isArray(ticks) ? ticks : scale.ticks(ticks);
}

function mergeOptions(ticks, options) {
  return isOptions(ticks) ? ticks : {...options, ticks};
}

export function grid(ticks, options) {
  options = mergeOptions(ticks, options);
  return new Grid(options, "auto", "auto");
}

export function gridX(ticks, options) {
  options = mergeOptions(ticks, options);
  return new Grid(options, true, false);
}

export function gridY(ticks, options) {
  options = mergeOptions(ticks, options);
  return new Grid(options, false, true);
}
