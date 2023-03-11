import type {Transformed} from "./basic.js";

export interface TreeTransformOptions {
  delimiter?: string;
  treeLayout?: Function; // TODO
  treeSort?: any; // TODO
  treeSeparation?: any; // TODO
  treeAnchor?: "left" | "right";
}

export function treeNode<T>(options?: T & TreeTransformOptions): Transformed<T>;

export function treeLink<T>(options?: T & TreeTransformOptions): Transformed<T>;
