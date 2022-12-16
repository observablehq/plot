import {maybeTuple} from "../options.js";
import {Vector} from "./vector.js";

const defaults = {
  ariaLabel: "spike",
  fill: "currentColor",
  fillOpacity: 0.3,
  stroke: "currentColor",
  strokeLinejoin: "round",
  strokeLinecap: "round"
};

export class Spike extends Vector {
  constructor(data, options) {
    super(data, options, defaults);
    const {width = 7} = options;
    this.r = width / 2;
  }
  _path(x, y, l) {
    const {r} = this;
    return `M${x - r},${y}L${x},${y - l}L${x + r},${y}`;
  }
}

export function spike(data, options = {}) {
  let {x, y, stroke, fill = stroke, ...remainingOptions} = options;
  if (options.frameAnchor === undefined) [x, y] = maybeTuple(x, y);
  return new Spike(data, {...remainingOptions, x, y, fill, stroke});
}
