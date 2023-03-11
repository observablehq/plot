import type {CompoundMark, Data} from "../mark.js";
import type {TreeTransformOptions} from "../transforms/tree.js";
import type {DotOptions} from "./dot.js";
import type {LinkOptions} from "./link.js";
import type {TextOptions} from "./text.js";

export interface TreeOptions extends DotOptions, LinkOptions, TextOptions, TreeTransformOptions {
  // TODO dot
  // TODO textStroke
  // TODO tree outputs?
}

export function tree(data?: Data, options?: TreeOptions): CompoundMark;

export function cluster(data?: Data, options?: TreeOptions): CompoundMark;
