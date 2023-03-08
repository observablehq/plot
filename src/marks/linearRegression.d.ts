import {Mark} from "../mark.js";

/** @jsdoc linearRegressionX */
export function linearRegressionX(data: any, options?: {}): LinearRegressionX;

/** @jsdoc linearRegressionY */
export function linearRegressionY(data: any, options?: {}): LinearRegressionY;

/** @jsdoc LinearRegressionX */
export class LinearRegressionX extends LinearRegression {
  constructor(data: any, options: any);
  _renderBand(I: any, X: any, Y: any): never;
  _renderLine(I: any, X: any, Y: any): string;
}

/** @jsdoc LinearRegressionY */
export class LinearRegressionY extends LinearRegression {
  constructor(data: any, options: any);
  _renderBand(I: any, X: any, Y: any): never;
  _renderLine(I: any, X: any, Y: any): string;
}

/** @jsdoc LinearRegression */
export class LinearRegression extends Mark {
  constructor(data: any, options?: {});
  z: any;
  ci: number;
  precision: number;
  render(index: any, scales: any, channels: any, dimensions: any, context: any): any;
}
