import type {CompoundMark, Data} from "../mark.js";

export interface AutoOptions {
  // TODO
}

export function autoSpec(data?: Data | null, options?: AutoOptions): AutoOptions;

export function auto(data?: Data | null, options?: AutoOptions): CompoundMark;
