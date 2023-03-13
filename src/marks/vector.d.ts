import type {ChannelValue, ChannelValueSpec} from "../channel.js";
import type {Data, FrameAnchor, MarkOptions, RenderableMark} from "../mark.js";

export type VectorShapeName = "arrow" | "spike";

export interface VectorShapeImplementation {
  draw(context: CanvasPath, length: number, radius: number): void;
}

export type VectorShapeSpec = VectorShapeName | VectorShapeImplementation;

export interface VectorOptions extends MarkOptions {
  x?: ChannelValueSpec;
  y?: ChannelValueSpec;
  r?: ChannelValueSpec;
  length?: ChannelValueSpec;
  rotate?: ChannelValue;
  shape?: VectorShapeSpec;
  anchor?: "start" | "middle" | "end";
  frameAnchor?: FrameAnchor;
}

export function vector(data?: Data, options?: VectorOptions): Vector;

export function vectorX(data?: Data, options?: VectorOptions): Vector;

export function vectorY(data?: Data, options?: VectorOptions): Vector;

export function spike(data?: Data, options?: VectorOptions): Vector;

export class Vector extends RenderableMark {}
