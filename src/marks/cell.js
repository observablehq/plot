import {identity, indexOf, maybeColorChannel, maybeTuple} from "../options.js";
import {AbstractBar} from "./bar.js";

export class Cell extends AbstractBar {
  constructor(data, {x, y, ...options} = {}) {
    super(
      data,
      [
        {name: "x", value: x, scale: "x", type: "band", optional: true},
        {name: "y", value: y, scale: "y", type: "band", optional: true}
      ],
      options
    );
  }
  _transform() {
    // noop
  }
  _positions({x: X, y: Y}) {
    return [X, Y];
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
