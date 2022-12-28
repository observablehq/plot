import {identity, indexOf, maybeColorChannel, maybeTuple} from "../options.js";
import {applyTransform} from "../style.js";
import {AbstractBar} from "./bar.js";

const defaults = {
  ariaLabel: "cell"
};

export class Cell extends AbstractBar {
  constructor(data, {x, y, ...options} = {}) {
    super(
      data,
      {
        x: {value: x, scale: "x", type: "band", optional: true},
        y: {value: y, scale: "y", type: "band", optional: true}
      },
      options,
      defaults
    );
  }
  _transform(selection, mark) {
    // apply dx, dy
    selection.call(applyTransform, mark, {}, 0, 0);
  }
}

/** @jsdoc cell */
export function cell(data, options = {}) {
  let {x, y, ...remainingOptions} = options;
  [x, y] = maybeTuple(x, y);
  return new Cell(data, {...remainingOptions, x, y});
}

/** @jsdoc cellX */
export function cellX(data, options = {}) {
  let {x = indexOf, fill, stroke, ...remainingOptions} = options;
  if (fill === undefined && maybeColorChannel(stroke)[0] === undefined) fill = identity;
  return new Cell(data, {...remainingOptions, x, fill, stroke});
}

/** @jsdoc cellY */
export function cellY(data, options = {}) {
  let {y = indexOf, fill, stroke, ...remainingOptions} = options;
  if (fill === undefined && maybeColorChannel(stroke)[0] === undefined) fill = identity;
  return new Cell(data, {...remainingOptions, y, fill, stroke});
}
