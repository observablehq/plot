import type {Dimensions} from "./dimensions.js";
import type {ChannelDomainSort, ChannelSpec, ChannelValue, ChannelValueSpec} from "./channel.js";
import type {Context} from "./context.js";
import type {Facet, FacetAnchor} from "./facet.js";
import type {plot} from "./plot.js";

export type Data = Iterable<any> | {length: number};

export type RenderFunction = (
  index: number[],
  scales: {[name: string]: (value: any) => any},
  values: {[name: string]: any[]},
  dimensions: Dimensions,
  context: Context
) => SVGElement | null;

export type Markish = RenderFunction | Renderable | Markish[];

export interface Renderable {
  render: RenderFunction;
}

export interface MarkOptions {
  facet?: Facet | boolean | null;
  facetAnchor?: FacetAnchor | null;
  fx?: ChannelValue;
  fy?: ChannelValue;
  dx?: number;
  dy?: number;
  margin?: number;
  marginTop?: number;
  marginRight?: number;
  marginBottom?: number;
  marginLeft?: number;
  clip?: "frame" | "sphere" | boolean | null;
  channels?: {[name: string]: ChannelSpec};
  filter?: ChannelValue;
  reverse?: boolean;
  sort?: ChannelValue | ((a: any, b: any) => number) | ChannelDomainSort;
  transform?: (data: any[], facets: number[][]) => {data?: any[]; facets?: number[][]};
  initializer?: any; // TODO
  title?: ChannelValueSpec;
  href?: ChannelValueSpec;
  ariaLabel?: ChannelValueSpec;
  ariaDescription?: string;
  ariaHidden?: string;
  target?: string;
  fill?: ChannelValueSpec;
  fillOpacity?: ChannelValueSpec;
  stroke?: ChannelValueSpec;
  strokeWidth?: ChannelValueSpec;
  strokeOpacity?: ChannelValueSpec;
  strokeLinejoin?: string;
  strokeLinecap?: string;
  strokeMiterlimit?: number;
  strokeDasharray?: string | number;
  strokeDashoffset?: string | number;
  opacity?: ChannelValueSpec;
  mixBlendMode?: string;
  paintOrder?: string;
  pointerEvents?: string;
  shapeRendering?: string;
}

export class Mark {
  plot: typeof plot;
}

export class RenderableMark extends Mark implements Renderable {
  render: RenderFunction;
}

export type CompoundMark = Markish[] & {plot: typeof plot};

export function marks(...marks: Markish[]): CompoundMark;
