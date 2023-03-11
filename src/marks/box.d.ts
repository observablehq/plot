import type {CompoundMark, Data} from "../mark.js";
import type {BarXOptions, BarYOptions} from "./bar.js";
import type {DotOptions} from "./dot.js";
import type {RuleXOptions, RuleYOptions} from "./rule.js";
import type {TickXOptions, TickYOptions} from "./tick.js";

export type BoxXOptions = DotOptions & BarXOptions & TickXOptions & RuleXOptions;

export type BoxYOptions = DotOptions & BarYOptions & TickYOptions & RuleYOptions;

export function boxX(data?: Data, options?: BoxXOptions): CompoundMark;

export function boxY(data?: Data, options?: BoxYOptions): CompoundMark;
