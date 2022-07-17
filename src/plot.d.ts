/**
 * Base types for mark properties.
 *
 * These specify the type to which a constant or channel option must _resolve_.
 *
 * TODO Include all possible mark properties.
 * TODO Use `csstype`?
 */
export type MarkProperties = {
  fill: CSSStyleDeclaration["fill"],
  fillOpacity: CSSStyleDeclaration["fillOpacity"],
  stroke: CSSStyleDeclaration["stroke"],
  strokeOpacity: number,
  strokeWidth: number,
  opacity: number,

  strokeLinejoin: CSSStyleDeclaration["strokeLinejoin"],
  strokeLinecap: CSSStyleDeclaration["strokeLinecap"],
  strokeMiterlimit: CSSStyleDeclaration["strokeMiterlimit"],
  strokeDasharray: CSSStyleDeclaration["strokeDasharray"],
  strokeDashoffset: CSSStyleDeclaration["strokeDashoffset"],
  mixBlendMode: CSSStyleDeclaration["mixBlendMode"],
  shapeRendering: CSSStyleDeclaration["shapeRendering"],
  paintOrder: CSSStyleDeclaration["paintOrder"],
  dx: number,
  dy: number,
  target: "_self" | "_blank" | "_parent" | "_top",
  // `ariaDescription` is not _currently_ supported by TypeScript
  // because it is not supported by two or more major browser engines.
  // @see https://github.com/microsoft/TypeScript-DOM-lib-generator#why-is-my-fancy-api-still-not-available-here
  ariaDescription: string,
  ariaHidden: boolean,
  clip: boolean | null,

  title: SVGTitleElement["textContent"],
  href: SVGAElement["href"],
  ariaLabel: SVGGraphicsElement["ariaLabel"],

  // TODO Get types from scales?
  x: any,
  y: any,
  z: any,

  facet: "auto" | "include" | "exclude" | false | null,
  sort: any,
}

/**
 * Primitive types allowed for an option.
 *
 * @see {@link https://github.com/observablehq/plot/blob/8757c028e12ba434ff2f199f8789e338140170fd/src/options.js#L11|valueof()}
 */
 export type OptionPrimitive =
  | string
  | number
  | Date
  | boolean
  | null;

/**
 * Options which can be either constants or channels.
 *
 * @see https://github.com/observablehq/plot#marks
 */
type ConstantsOrChannels =
  | "fill"
  | "fillOpacity"
  | "stroke"
  | "strokeOpacity"
  | "strokeWidth"
  | "opacity"
  | "x"
  | "y";

/**
 * Options which can *only* be a channel.
 *
 * @see https://github.com/observablehq/plot#marks
 */
type Channels = "title" | "href" | "ariaLabel";

// TODO Move to scales file.
export type ScaleName =
  | "x"
  | "y"
  | "r"
  | "color"
  | "opacity"
  | "length"
  | "symbol";

// TODO Move to scales file.
export type ScaleType =
  | "linear"
  | "pow"
  | "sqrt"
  | "log"
  | "symlog"
  | "utc"
  | "time"
  | "ordinal"
  | "point"
  | "band"
  | "categorical"
  | "identity";

// TODO Move to channels file.
export type MarkChannelDefinition = {
  name: string,
  value: unknown,
  scale?: ScaleName,
  type?: ScaleType,
  filter?: Function,
  optional?: boolean,
}

/**
 * Standard mark options.
 *
 * @template Datum The type of a single datum in the mark dataset.
 *
 * @see https://github.com/observablehq/plot#marks
 */
type StandardMarkOptions<Datum> =
  {
    [Key in keyof Omit<MarkProperties, Channels | ConstantsOrChannels>]?: OptionPrimitive
  }
  & {
    [Key in ConstantsOrChannels]?: ConstantOrChannelOption<Datum>
  }
  & {
    [Key in Channels]?: ChannelOption<Datum>
  }

export function plot(options?: Record<string, unknown>): SVGSVGElement;
export function marks(...marks: any[]): any[];

/**
 * Abstract base class for marks.
 *
 * @template Datum The type of a single datum in the mark dataset.
 * @template [Data=Datum[]] The type of the entire mark dataset.
 *
 * @see https://github.com/observablehq/plot#marks
 */
export abstract class Mark<Datum, Data = Datum[]> {
  constructor(
    data: Data,
    channels?: MarkChannelDefinition[],
    options?: StandardMarkOptions<Datum>,
    defaults?: Record<string, unknown>
  );

  data: Data;
  sort: any;
  facet: StandardMarkOptions<Datum>["facet"];
  transform: any;
  channels: MarkChannelDefinition[];
  dx: StandardMarkOptions<Datum>["dx"];
  dy: StandardMarkOptions<Datum>["dy"];
  // Internally, the `clip` property is a different type than the mark option.
  clip: "frame" | false | null;

  initialize(
    facetIndex: any,
    facetChannels: any
  ): {
    index: any;
    channels: (
      | string
      | {
          scale: any;
          type: any;
          value: any;
          label: any;
          filter: any;
          hint: any;
        }
    )[][];
  };

  filter(index: any, channels: any, values: any): any;

  plot({ marks, ...options }?: { marks?: any[] }): SVGSVGElement;

  abstract render(...args: any[]): SVGElement;
}

import {
  ChannelOption,
  ConstantOrChannelOption
} from "./misc";
