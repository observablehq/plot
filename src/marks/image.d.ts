import type {ChannelValue, ChannelValueSpec} from "../channel.js";
import type {Data, MarkOptions, RenderableMark} from "../mark.js";
import type {FrameAnchor} from "../options.js";

export interface ImageOptions extends MarkOptions {
  x?: ChannelValueSpec;
  y?: ChannelValueSpec;
  width?: ChannelValue;
  height?: ChannelValue;
  src?: ChannelValue;
  preserveAspectRatio?: string;
  crossOrigin?: string;
  frameAnchor?: FrameAnchor;
  imageRendering?: string;
}

export function image(data?: Data, options?: ImageOptions): Image;

export class Image extends RenderableMark {}
