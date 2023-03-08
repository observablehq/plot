import type {CompoundMark, Data, MarkOptions} from "../mark.js";

export interface TreeOptions extends MarkOptions {
  // TODO
}

export function tree(data?: Data | null, options?: TreeOptions): CompoundMark;

export function cluster(data?: Data | null, options?: TreeOptions): CompoundMark;
