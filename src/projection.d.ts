import type {GeoPermissibleObjects, GeoStreamWrapper} from "d3";
import type {InsetOptions} from "./inset.js";

export type ProjectionName =
  | "albers-usa"
  | "albers"
  | "azimuthal-equal-area"
  | "azimuthal-equidistant"
  | "conic-conformal"
  | "conic-equal-area"
  | "conic-equidistant"
  | "equal-earth"
  | "equirectangular"
  | "gnomonic"
  | "identity"
  | "reflect-y"
  | "mercator"
  | "orthographic"
  | "stereographic"
  | "transverse-mercator";

export type ProjectionImplementation = GeoStreamWrapper;

export type ProjectionFactory = (options: any) => ProjectionImplementation;

export interface ProjectionOptions extends InsetOptions {
  type?: ProjectionName | ProjectionFactory | null;
  domain?: GeoPermissibleObjects;
  rotate?: [x: number, y: number, z?: number];
  parallels?: [y1: number, y2: number];
  clip?: boolean | number | "frame" | null;
}
