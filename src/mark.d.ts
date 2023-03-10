import type {Dimensions} from "./dimensions.js";
import type {ChannelInputs, Channels, ChannelValues} from "./channel.js";
import type {Context} from "./context.js";
import type {Facet, FacetAnchor} from "./facet.js";
import type {plot} from "./plot.js";
import type {ScaleFunctions} from "./scales.js";
import type {TransformOptions} from "./transforms/basic.js";

export type Data = Iterable<any> | {length: number};

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

export interface MarkOptions extends ChannelInputs, TransformOptions {
  facet?: Facet | boolean | null;
  facetAnchor?: FacetAnchor | null;
  dx?: number;
  dy?: number;
  margin?: number;
  marginTop?: number;
  marginRight?: number;
  marginBottom?: number;
  marginLeft?: number;
  clip?: "frame" | "sphere" | boolean | null;
  channels?: Channels;
  ariaDescription?: string;
  ariaHidden?: string;
  target?: string;
  strokeLinejoin?: string;
  strokeLinecap?: string;
  strokeMiterlimit?: number;
  strokeDasharray?: string | number;
  strokeDashoffset?: string | number;
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
