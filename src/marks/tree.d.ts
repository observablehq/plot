import type {CompoundMark, Data, MarkOptions} from "../mark.js";
import type {TreeTransformOptions} from "../transforms/tree.js";
import type {DotOptions} from "./dot.js";
import type {LinkOptions} from "./link.js";
import type {TextOptions} from "./text.js";

// TODO tree channels, e.g., "node:name" | "node:path" | "node:internal"?
export interface TreeOptions extends DotOptions, LinkOptions, TextOptions, TreeTransformOptions {
  dot?: boolean;
  textStroke?: MarkOptions["stroke"];
}

export function tree(data?: Data, options?: TreeOptions): CompoundMark;

export function cluster(data?: Data, options?: TreeOptions): CompoundMark;
