import {groupX, groupY, group} from "../transforms/group.js";
import {barX, barY} from "./bar.js";
import {cell} from "./cell.js";
import {dot} from "./dot.js";

export function groupCell(data, options) {
  return cell(data, group({...options, out: "fill"}));
}

export function groupDot(data, options) {
  return dot(data, group({...options, out: "r"}));
}

export function groupBarX(data, options) {
  return barX(data, groupY(options));
}

export function groupBarY(data, options) {
  return barY(data, groupX(options));
}
