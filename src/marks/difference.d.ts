import type {Data, RenderableMark} from "../mark.js";
import type {AreaYOptions} from "./area.js";

/** TODO */
export function differenceY(data?: Data, options?: AreaYOptions): Difference;

/** The difference mark. */
export class Difference extends RenderableMark {}
