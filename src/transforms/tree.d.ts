import type {ChannelValue} from "../channel.js";
import type {CompareFunction, Transformed} from "./basic.js";

export interface TreeTransformOptions {
  path?: ChannelValue;
  delimiter?: string;
  treeAnchor?: "left" | "right";
  treeLayout?: () => any;
  treeSeparation?: CompareFunction | null;
  treeSort?: CompareFunction | {node: (node: any) => any} | string | null;
}

export function treeNode<T>(options?: T & TreeTransformOptions): Transformed<T>;

export function treeLink<T>(options?: T & TreeTransformOptions): Transformed<T>;
