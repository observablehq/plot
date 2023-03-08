import type {Interval} from "./interval.js";
import type {Data, Markish} from "./mark.js";
import type {ProjectionFactory, ProjectionImplementation, ProjectionName, ProjectionOptions} from "./projection.js";
import type {LegendOptions, Scale, ScaleOptions} from "./scales.js";

export interface PlotOptions {
  // dimensions
  marginTop?: number;
  marginRight?: number;
  marginBottom?: number;
  marginLeft?: number;
  margin?: number;
  width?: number;
  height?: number;
  aspectRatio?: number;

  // other top-level options
  style?: CSSStyleDeclaration;
  caption?: string | null | Node;
  document?: Document;

  // top-level scale options
  clamp?: boolean;
  nice?: boolean | number | Interval;
  zero?: boolean;
  insetTop?: number;
  insetRight?: number;
  insetBottom?: number;
  insetLeft?: number;
  inset?: number;
  round?: boolean;
  align?: number;
  padding?: number;

  // top-level axis options
  grid?: boolean;
  label?: string | null;
  axis?: boolean | null;

  // scale, axis, and legend definitions
  fx?: ScaleOptions;
  fy?: ScaleOptions;
  x?: ScaleOptions;
  y?: ScaleOptions;
  r?: ScaleOptions;
  color?: ScaleOptions;
  opacity?: ScaleOptions;
  length?: ScaleOptions;
  symbol?: ScaleOptions;
  projection?: ProjectionOptions | ProjectionName | ProjectionFactory | ProjectionImplementation | null;

  // faceting
  facet?: {
    marginTop?: number;
    marginRight?: number;
    marginBottom?: number;
    marginLeft?: number;
    margin?: number;
    grid?: boolean;
    label?: string | null;
    data?: Data;
  };

  // marks
  marks?: Markish[];
}

export interface Plot {
  scale(name: string): Scale | undefined;
  legend(name: string, options?: LegendOptions): HTMLElement | undefined;
}

/** @jsdoc plot */
export function plot(options?: PlotOptions): (SVGSVGElement | HTMLElement) & Plot;
