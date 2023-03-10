import type {MarkOptions} from "../mark.js";
import type {Transformed} from "./basic.js";

export interface TreeTransformOptions {
  delimiter?: string;
  treeLayout?: Function; // TODO
  treeSort?: any; // TODO
  treeSeparation?: any; // TODO
  treeAnchor?: "left" | "right";
}

export function treeNode<T extends MarkOptions>(
  options?: T & TreeTransformOptions
): Transformed<Omit<T, keyof TreeTransformOptions>>;

export function treeLink<T extends MarkOptions>(
  options?: T & TreeTransformOptions
): Transformed<Omit<T, keyof TreeTransformOptions>>;
