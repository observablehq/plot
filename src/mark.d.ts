import type {ChannelDomainSort, Channels, ChannelValue, ChannelValues, ChannelValueSpec} from "./channel.js";
import type {Context} from "./context.js";
import type {Dimensions} from "./dimensions.js";
import type {plot} from "./plot.js";
import type {ScaleFunctions} from "./scales.js";
import type {InitializerFunction, SortOrder, TransformFunction} from "./transforms/basic.js";

export type Facet = "auto" | "include" | "exclude" | "super";

export type FacetAnchor =
  | "top"
  | "right"
  | "bottom"
  | "left"
  | "top-left"
  | "top-right"
  | "bottom-left"
  | "bottom-right"
  | "top-empty"
  | "right-empty"
  | "bottom-empty"
  | "left-empty"
  | "empty";

export type FrameAnchor =
  | "middle"
  | "top-left"
  | "top"
  | "top-right"
  | "right"
  | "bottom-right"
  | "bottom"
  | "bottom-left"
  | "left";

export type Data = Iterable<any> | ArrayLike<any>;

export type RenderFunction = (
  index: number[],
  scales: ScaleFunctions,
  values: ChannelValues,
  dimensions: Dimensions,
  context: Context
) => SVGElement | null;

export type Markish = RenderFunction | Renderable | Markish[] | null | undefined;

export interface Renderable {
  render: RenderFunction;
}

export interface MarkOptions {
  // transforms
  filter?: ChannelValue;
  reverse?: boolean;
  sort?: SortOrder | ChannelDomainSort;
  transform?: TransformFunction;
  initializer?: InitializerFunction;

  // faceting
  fx?: ChannelValue;
  fy?: ChannelValue;
  facet?: Facet | boolean | null;
  facetAnchor?: FacetAnchor | null;

  // axis margins
  margin?: number;
  marginTop?: number;
  marginRight?: number;
  marginBottom?: number;
  marginLeft?: number;

  // accessibility and interaction
  ariaDescription?: string;
  ariaHidden?: string;
  ariaLabel?: ChannelValue;
  pointerEvents?: string;
  title?: ChannelValue;

  // aesthetics
  clip?: "frame" | "sphere" | boolean | null;
  dx?: number;
  dy?: number;
  fill?: ChannelValueSpec;
  fillOpacity?: ChannelValueSpec;
  stroke?: ChannelValueSpec;
  strokeDasharray?: string | number;
  strokeDashoffset?: string | number;
  strokeLinecap?: string;
  strokeLinejoin?: string;
  strokeMiterlimit?: number;
  strokeOpacity?: ChannelValueSpec;
  strokeWidth?: ChannelValueSpec;
  opacity?: ChannelValueSpec;
  mixBlendMode?: string;
  paintOrder?: string;
  shapeRendering?: string;

  // links
  href?: ChannelValue;
  target?: string;

  // custom channels
  channels?: Channels;
}

export class Mark {
  plot: typeof plot;
}

export class RenderableMark extends Mark implements Renderable {
  render: RenderFunction;
}

export type CompoundMark = Markish[] & {plot: typeof plot};

export function marks(...marks: Markish[]): CompoundMark;
