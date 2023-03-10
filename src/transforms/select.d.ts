import type {ChannelName} from "../channel.js";
import type {MarkOptions} from "../mark.js";
import type {Transformed} from "./basic.js";

export type SelectorName = "first" | "last";

export type SelectorFunction = (index: number[], values: any[] | null) => number[];

export type Selector = SelectorName | SelectorFunction | {[key in ChannelName]?: SelectorName | SelectorFunction};

export function select<T extends MarkOptions>(selector: Selector, options?: T): Transformed<T>;

export function selectFirst<T extends MarkOptions>(options?: T): Transformed<T>;

export function selectLast<T extends MarkOptions>(options?: T): Transformed<T>;

export function selectMinX<T extends MarkOptions>(options?: T): Transformed<T>;

export function selectMinY<T extends MarkOptions>(options?: T): Transformed<T>;

export function selectMaxX<T extends MarkOptions>(options?: T): Transformed<T>;

export function selectMaxY<T extends MarkOptions>(options?: T): Transformed<T>;
