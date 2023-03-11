import type {CompoundMark, Data} from "../mark.js";

export type AutoOptions = any; // TODO

export function autoSpec(data?: Data, options?: AutoOptions): AutoOptions;

export function auto(data?: Data, options?: AutoOptions): CompoundMark;
