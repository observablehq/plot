import type {ChannelValue} from "./channel.js";
import type {LegendOptions} from "./legends.js";
import type {InsetOptions} from "./inset.js";
import type {Data, Markish} from "./mark.js";
import type {ProjectionFactory, ProjectionImplementation, ProjectionName, ProjectionOptions} from "./projection.js";
import type {Scale, ScaleOptions, ScalesOptions} from "./scales.js";

export interface PlotOptions extends ScalesOptions, InsetOptions {
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
  style?: Partial<CSSStyleDeclaration> | string;
  caption?: string | null | Node;
  ariaLabel?: string;
  ariaDescription?: string;
  document?: Document;

  // top-level scale options
  clamp?: ScaleOptions["clamp"];
  nice?: ScaleOptions["nice"];
  zero?: ScaleOptions["zero"];
  round?: ScaleOptions["round"];
  align?: ScaleOptions["align"];
  padding?: ScaleOptions["padding"];

  // top-level axis options
  grid?: ScaleOptions["grid"];
  label?: ScaleOptions["label"];
  axis?: ScaleOptions["axis"];

  // scale, axis, and legend definitions
  projection?: ProjectionOptions | ProjectionName | ProjectionFactory | ProjectionImplementation | null;

  // faceting
  facet?: {
    margin?: number;
    marginTop?: number;
    marginRight?: number;
    marginBottom?: number;
    marginLeft?: number;
    grid?: ScaleOptions["grid"];
    label?: ScaleOptions["label"];
    data?: Data;
    x?: ChannelValue;
    y?: ChannelValue;
  };

  // marks
  marks?: Markish[];
}

export interface Plot {
  scale(name: string): Scale | undefined;
  legend(name: string, options?: LegendOptions): HTMLElement | undefined;
}

export function plot(options?: PlotOptions): (SVGSVGElement | HTMLElement) & Plot;
