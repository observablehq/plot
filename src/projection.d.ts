import type {GeoPermissibleObjects, GeoStreamWrapper} from "d3";

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

export interface ProjectionOptions {
  type?: ProjectionName | ProjectionFactory | null;
  domain?: GeoPermissibleObjects;
  insetTop?: number;
  insetRight?: number;
  insetBottom?: number;
  insetLeft?: number;
  inset?: number;
  clip?: true | false | number | "frame" | null;
}
