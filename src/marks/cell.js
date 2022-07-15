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

export function cell(data, {x, y, ...options} = {}) {
  ([x, y] = maybeTuple(x, y));
  return new Cell(data, {...options, x, y});
}

export function cellX(data, {x = indexOf, fill, stroke, ...options} = {}) {
  if (fill === undefined && maybeColorChannel(stroke)[0] === undefined) fill = identity;
  return new Cell(data, {...options, x, fill, stroke});
}

export function cellY(data, {y = indexOf, fill, stroke, ...options} = {}) {
  if (fill === undefined && maybeColorChannel(stroke)[0] === undefined) fill = identity;
  return new Cell(data, {...options, y, fill, stroke});
}
