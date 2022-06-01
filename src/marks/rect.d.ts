export type RectOptions<Datum> =
  StandardMarkOptions<Datum>
  & MixinExpandXYOptions<"x", Datum>
  & MixinExpandXYOptions<"y", Datum>
  & MixinInsetOptions
  & {
    interval: unknown,
  };

export function rect<Datum, Data = Datum[]>(data: Data, options: RectOptions<Datum>): Rect<Datum, Data>;

export function rectX<Datum, Data = Datum[]>(data: Data, options: RectOptions<Datum>): Rect<Datum, Data>;

export function rectY<Datum, Data = Datum[]>(data: Data, options: RectOptions<Datum>): Rect<Datum, Data>;

/**
 * Rect mark.
 *
 * @template Datum The type of a single datum in the mark dataset.
 * @template [Data=Datum[]] The type of the entire mark dataset.
 *
 * @see https://github.com/observablehq/plot#rect
 */
export class Rect<Datum, Data = Datum[]> extends Mark<Datum, Data> {
    constructor(data: Data, options: RectOptions<Datum>);

    insetTop: RectOptions<Datum>["insetTop"];
    insetRight: RectOptions<Datum>["insetRight"];
    insetBottom: RectOptions<Datum>["insetBottom"];
    insetLeft: RectOptions<Datum>["insetLeft"];
    rx: RectOptions<Datum>["rx"];
    ry: RectOptions<Datum>["ry"];

    render(index: number[], { x, y }: { x: any, y: any }, channels: RenderFunctionChannels, dimensions: RenderFunctionDimensions): SVGElement;
}

import {
    Mark,
    StandardMarkOptions
} from "../plot";

import {
  MixinExpandXYOptions,
  MixinInsetOptions,
  RenderFunctionChannels,
  RenderFunctionDimensions
} from "../misc";
