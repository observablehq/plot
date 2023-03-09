import type {MarkOptions, MarkTransform} from "../mark.js";

export function transform<T extends MarkOptions>(options: T, transform: MarkTransform): T;

export function initializer<T extends MarkOptions>(options: T, initializer: any): T;

export function filter<T extends MarkOptions>(test: (d: any, i: number) => boolean, options: T): T;

export function reverse<T extends MarkOptions>(options: T): T;

export function shuffle<T extends MarkOptions>(options: T): T;

export function sort<T extends MarkOptions>(order: MarkOptions["sort"], options: T): T;
