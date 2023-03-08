import {Interval} from "../scales.js";

export interface AxisOptions {
  ticks?: number | Interval | any[];
  tickSize?: number;
  tickSpacing?: number;
  tickPadding?: number;
  tickFormat?: string | ((t: any) => string) | null;
  tickRotate?: number;
  grid?: boolean;
  line?: boolean;
  label?: string | null;
  labelOffset?: number;
  fontVariant?: CSSStyleDeclaration["fontVariant"];
  ariaLabel?: string;
  ariaDescription?: string;
}

export interface VerticalAxisOptions {
  axis?: "left" | "right" | "both" | boolean | null;
  labelAnchor?: "top" | "bottom" | "center";
}

export interface HorizontalAxisOptions {
  axis?: "top" | "bottom" | "both" | boolean | null;
  labelAnchor?: "left" | "right" | "center";
}

/** @jsdoc axisY */
export function axisY(...args: any[]): any[];

/** @jsdoc axisFy */
export function axisFy(...args: any[]): any[];

/** @jsdoc axisX */
export function axisX(...args: any[]): any[];

/** @jsdoc axisFx */
export function axisFx(...args: any[]): any[];

/** @jsdoc gridY */
export function gridY(...args: any[]): any;

/** @jsdoc gridFy */
export function gridFy(...args: any[]): any;

/** @jsdoc gridX */
export function gridX(...args: any[]): any;

/** @jsdoc gridFx */
export function gridFx(...args: any[]): any;
