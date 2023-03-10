import type {ChannelValue} from "../channel.js";
import type {CurveSpec} from "../curve.js";
import type {CompoundMark, Data} from "../mark.js";
import type {MarkerSpec} from "../marker.js";
import type {FrameAnchor} from "../options.js";
import type {DotOptions} from "./dot.js";
import type {LinkOptions} from "./link.js";
import type {TextOptions} from "./text.js";

type TreeMarkOptions = DotOptions & TextOptions & LinkOptions;

export interface TreeOptions extends TreeMarkOptions {
  path: ChannelValue;
  delimiter?: string;
  frameAnchor?: FrameAnchor;
  curve?: CurveSpec;
  marker?: MarkerSpec;
  markerStart?: MarkerSpec;
  markerEnd?: MarkerSpec;
  treeLayout?: any; // TODO
  treeSort?: any; // TODO
  treeSeparation?: any; // TODO
  treeAnchor?: any; // TODO
  // TODO dot
  // TODO text
  // TODO textStroke
  // TODO tree outputs?
}

export function tree(data?: Data, options?: TreeOptions): CompoundMark;

export function cluster(data?: Data, options?: TreeOptions): CompoundMark;
