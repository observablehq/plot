import {identity, first, second} from "../mark.js";
import {AbstractBar} from "./bar.js";

export class Cell extends AbstractBar {
  constructor(data, {x, y, ...options} = {}) {
    if (x === undefined && y === undefined) x = first, y = second;
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

export function cell(data, options) {
  return new Cell(data, options);
}

export function cellX(data, {x = identity, ...options} = {}) {
  return new Cell(data, {x, ...options, y: null});
}

export function cellY(data, {y = identity, ...options} = {}) {
  return new Cell(data, {y, ...options, x: null});
}
