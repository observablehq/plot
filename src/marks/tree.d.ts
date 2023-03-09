import type {CompoundMark, Data, MarkOptions} from "../mark.js";

export interface TreeOptions extends MarkOptions {
  // TODO
}

export function tree(data?: Data, options?: TreeOptions): CompoundMark;

export function cluster(data?: Data, options?: TreeOptions): CompoundMark;
