import {identity, first, second} from "../mark.js";
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

export function cell(data, {x = first, y = second, ...options} = {}) {
  return new Cell(data, {...options, x, y});
}

export function cellX(data, {x = identity, ...options} = {}) {
  return new Cell(data, {...options, x});
}

export function cellY(data, {y = identity, ...options} = {}) {
  return new Cell(data, {...options, y});
}
