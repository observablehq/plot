import type {Channels, ChannelDomainSort, ChannelName, ChannelValue, ChannelValueSpec} from "./channel.js";
import type {Context} from "./context.js";
import type {Dimensions} from "./dimensions.js";
import type {Facet, FacetAnchor} from "./facet.js";
import type {plot} from "./plot.js";
import type {ScaleFunctions} from "./scales.js";
import type {InitializerFunction, CompareFunction, TransformFunction} from "./transforms/basic.js";

export type Data = Iterable<any> | {length: number};

export type RenderFunction = (
  index: number[],
  scales: ScaleFunctions,
  values: {[key in ChannelName]?: any[]},
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
  sort?: ChannelValue | CompareFunction | ChannelDomainSort;
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
  ariaLabel?: ChannelValueSpec;
  pointerEvents?: string;
  title?: ChannelValueSpec;

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
  href?: ChannelValueSpec;
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
