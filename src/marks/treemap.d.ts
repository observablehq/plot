import {ChannelValue} from "../channel.js";
import {Data} from "../mark.js";
import {TreeTransformOptions} from "../transforms/tree.js";
import {Rect, RectOptions} from "./rect.js";

// TODO tree channels, e.g., "node:name" | "node:path" | "node:internal"?
export interface TreemapOptions extends RectOptions, TreeTransformOptions {
  value?: ChannelValue;
}

export function treemap(data?: Data, options?: TreemapOptions): Rect;
