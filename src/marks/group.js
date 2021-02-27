import {groupX, groupY, group} from "../transforms/group.js";
import {barX, barY} from "./bar.js";
import {cell} from "./cell.js";
import {dot} from "./dot.js";

export function groupCell(data, options) {
  return cell(...group(data, {out: "fill", ...options}));
}

export function groupDot(data, options) {
  return dot(...group(data, {out: "r", ...options}));
}

export function groupBarX(data, options) {
  return barX(...groupY(data, options));
}

export function groupBarY(data, options) {
  return barY(...groupX(data, options));
}
