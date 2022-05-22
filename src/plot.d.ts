// "Polyfill" for `ariaDescription`.
interface SVGElement {
  ariaDescription: string;
}

/**
 * Base types for mark properties.
 *
 * These specify the type to which a constant or channel option must resolve.
 *
 * TODO Add all possible mark properties.
 */
type MarkProperties = {
  fill: CSSStyleDeclaration["fill"];
  fillOpacity: CSSStyleDeclaration["fillOpacity"];
  stroke: CSSStyleDeclaration["stroke"];
  strokeOpacity: CSSStyleDeclaration["strokeOpacity"];
  strokeWidth: CSSStyleDeclaration["strokeWidth"];
  opacity: CSSStyleDeclaration["opacity"];

  strokeLinejoin: CSSStyleDeclaration["strokeLinejoin"];
  strokeLinecap: CSSStyleDeclaration["strokeLinecap"];
  strokeMiterlimit: CSSStyleDeclaration["strokeMiterlimit"];
  strokeDasharray: CSSStyleDeclaration["strokeDasharray"];
  strokeDashoffset: CSSStyleDeclaration["strokeDashoffset"];
  mixBlendMode: CSSStyleDeclaration["mixBlendMode"];
  shapeRendering: CSSStyleDeclaration["shapeRendering"];
  paintOrder: CSSStyleDeclaration["paintOrder"];
  dx: number;
  dy: number;
  target: "_blank" | "_parent" | "_self" | "_top";
  ariaDescription: SVGElement["ariaDescription"];
  ariaHidden: SVGGraphicsElement["ariaHidden"];
  clip: boolean;

  title: SVGTitleElement["textContent"];
  href: SVGAElement["href"];
  ariaLabel: SVGGraphicsElement["ariaLabel"];
};

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
  | "opacity";

/**
 * Options which can *only* be a channel.
 *
 * @see https://github.com/observablehq/plot#marks
 */
type Channels = "title" | "href" | "ariaLabel";

/**
 * Utility type to extract names of properties which match a given type.
 */
export type ExtractKeysByType<T, Datum> = keyof {
  [Key in keyof Datum as (Datum[Key] extends T ? Key : never)]: Datum[Key]
}

export type ChannelOption<PropertyType, Datum = object, ColumnName = Datum extends object ? ExtractKeysByType<PropertyType, Datum> : string> =
  | ColumnName
  | ((d?: Datum) => PropertyType | null | undefined);

export type ConstantOrChannelOption<PropertyType, Datum = object> =
  | PropertyType
  | ChannelOption<PropertyType, Datum>;

export interface ChannelDefinition {
  name: string;
  value: unknown;
  scale?: "x" | "y";
  optional?: boolean;
}

/**
 * Standard mark options.
 *
 * @see https://github.com/observablehq/plot#marks
 */
type MarkOptions<Datum> =
  {
    [Key in keyof Omit<MarkProperties, Channels | ConstantsOrChannels>]?: MarkProperties[Key]
  }
  & {
    [Key in ConstantsOrChannels]?: ConstantOrChannelOption<MarkProperties[Key], Datum>
  }
  & {
    [Key in Channels]?: ChannelOption<MarkProperties[Key], Datum>
  };

export function plot(options?: Record<string, unknown>): SVGSVGElement;
export function marks(...marks: any[]): any[];

export class Mark<Datum, Data = Datum[]> {
  constructor(
    data: Data,
    channels: ChannelDefinition[],
    options: MarkOptions<Datum>,
    defaults: object
  );
  data: Data;
  sort: any;
  facet: string;
  transform: any;
  channels: any[];
  dx: number;
  dy: number;
  clip: string | boolean;
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
}
