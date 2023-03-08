import {AbstractBar} from "./bar.js";

/** @jsdoc cell */
export function cell(data: any, options?: {}): Cell;

/** @jsdoc cellX */
export function cellX(data: any, options?: {}): Cell;

/** @jsdoc cellY */
export function cellY(data: any, options?: {}): Cell;

/** @jsdoc Cell */
export class Cell extends AbstractBar {
  constructor(
    data: any,
    {
      x,
      y,
      ...options
    }?: {
      x: any;
      y: any;
    }
  );
  _transform(selection: any, mark: any): void;
}
