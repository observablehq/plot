import type {CompoundMark, Data} from "../mark.js";

export interface AutoOptions {
  // TODO
}

export function autoSpec(data?: Data, options?: AutoOptions): AutoOptions;

export function auto(data?: Data, options?: AutoOptions): CompoundMark;
