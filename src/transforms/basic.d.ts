import type {MarkOptions, MarkTransform} from "../mark.js";

export interface TransformOptions {
  filter?: MarkOptions["filter"];
  reverse?: MarkOptions["reverse"];
  sort?: MarkOptions["sort"];
  transform?: MarkOptions["transform"];
  initializer?: MarkOptions["initializer"];
}

export function transform<T extends TransformOptions>(options: T, transform: MarkTransform): T;

export function initializer<T extends TransformOptions>(options: T, initializer: any): T;

export function filter<T extends TransformOptions>(test: (d: any, i: number) => boolean, options: T): T;

export function reverse<T extends TransformOptions>(options: T): T;

export function shuffle<T extends TransformOptions>(options: T): T;

export function sort<T extends TransformOptions>(order: MarkOptions["sort"], options: T): T;
