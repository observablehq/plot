import type {MarkOptions, RenderableMark} from "../mark.js";

export interface HexgridOptions extends MarkOptions {
  binWidth?: number;
}

export function hexgrid(options?: HexgridOptions): Hexgrid;

export class Hexgrid extends RenderableMark {}
