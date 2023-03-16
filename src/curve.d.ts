import type {CurveFactory} from "d3";

type CurveFunction = CurveFactory;

type CurveName =
  | "basis"
  | "basis-closed"
  | "basis-open"
  | "bundle"
  | "bump-x"
  | "bump-y"
  | "cardinal"
  | "cardinal-closed"
  | "cardinal-open"
  | "catmull-rom"
  | "catmull-rom-closed"
  | "catmull-rom-open"
  | "linear"
  | "linear-closed"
  | "monotone-x"
  | "monotone-y"
  | "natural"
  | "step"
  | "step-after"
  | "step-before";

/** How to interpolate between control points. */
export type Curve = CurveName | CurveFunction;

/** Options for marks that support curves, such as lines and areas. */
export interface CurveOptions extends CurveAutoOptions {
  /**
   * The curve (interpolation) method for connecting adjacent points. One of:
   *
   * * *basis* - a cubic basis spline (repeating the end points)
   * * *basis-open* - an open cubic basis spline
   * * *basis-closed* - a closed cubic basis spline
   * * *bump-x* - a Bézier curve with horizontal tangents
   * * *bump-y* - a Bézier curve with vertical tangents
   * * *bundle* - a straightened cubic basis spline (suitable for lines only, not areas)
   * * *cardinal* - a cubic cardinal spline (with one-sided differences at the ends)
   * * *cardinal-open* - an open cubic cardinal spline
   * * *cardinal-closed* - an closed cubic cardinal spline
   * * *catmull-rom* - a cubic Catmull–Rom spline (with one-sided differences at the ends)
   * * *catmull-rom-open* - an open cubic Catmull–Rom spline
   * * *catmull-rom-closed* - a closed cubic Catmull–Rom spline
   * * *linear* - a piecewise linear curve (*i.e.*, straight line segments)
   * * *linear-closed* - a closed piecewise linear curve (*i.e.*, straight line segments)
   * * *monotone-x* - a cubic spline that preserves monotonicity in *x*
   * * *monotone-y* - a cubic spline that preserves monotonicity in *y*
   * * *natural* - a natural cubic spline
   * * *step* - a piecewise constant function where *y* changes at the midpoint of *x*
   * * *step-after* - a piecewise constant function where *y* changes after *x*
   * * *step-before* - a piecewise constant function where *x* changes after *y*
   *
   * If *curve* is a function, it will be invoked with a given CanvasPath
   * *context* in the same fashion as a [D3 curve
   * factory](https://github.com/d3/d3-shape/blob/main/README.md#custom-curves).
   */
  curve?: Curve;
}

export interface CurveAutoOptions {
  /**
   * The curve (interpolation) method for connecting adjacent points. One of:
   *
   * * *basis* - a cubic basis spline (repeating the end points)
   * * *basis-open* - an open cubic basis spline
   * * *basis-closed* - a closed cubic basis spline
   * * *bump-x* - a Bézier curve with horizontal tangents
   * * *bump-y* - a Bézier curve with vertical tangents
   * * *bundle* - a straightened cubic basis spline (suitable for lines only, not areas)
   * * *cardinal* - a cubic cardinal spline (with one-sided differences at the ends)
   * * *cardinal-open* - an open cubic cardinal spline
   * * *cardinal-closed* - an closed cubic cardinal spline
   * * *catmull-rom* - a cubic Catmull–Rom spline (with one-sided differences at the ends)
   * * *catmull-rom-open* - an open cubic Catmull–Rom spline
   * * *catmull-rom-closed* - a closed cubic Catmull–Rom spline
   * * *linear* - a piecewise linear curve (*i.e.*, straight line segments)
   * * *linear-closed* - a closed piecewise linear curve (*i.e.*, straight line segments)
   * * *monotone-x* - a cubic spline that preserves monotonicity in *x*
   * * *monotone-y* - a cubic spline that preserves monotonicity in *y*
   * * *natural* - a natural cubic spline
   * * *step* - a piecewise constant function where *y* changes at the midpoint of *x*
   * * *step-after* - a piecewise constant function where *y* changes after *x*
   * * *step-before* - a piecewise constant function where *x* changes after *y*
   * * *auto* (default) - like *linear*, but use the (possibly spherical) projection, if any
   *
   * The *auto* curve is typically used in conjunction with a spherical
   * projection to interpolate along geodesics. If *curve* is a function, it
   * will be invoked with a given CanvasPath *context* in the same fashion as a
   * [D3 curve
   * factory](https://github.com/d3/d3-shape/blob/main/README.md#custom-curves).
   */
  curve?: Curve | "auto";

  /**
   * The tension option only has an effect on bundle, cardinal and Catmull–Rom
   * splines (*bundle*, *cardinal*, *cardinal-open*, *cardinal-closed*,
   * *catmull-rom*, *catmull-rom-open*, and *catmull-rom-closed*). For bundle
   * splines, it corresponds to
   * [beta](https://github.com/d3/d3-shape/blob/main/README.md#curveBundle_beta);
   * for cardinal splines,
   * [tension](https://github.com/d3/d3-shape/blob/main/README.md#curveCardinal_tension);
   * for Catmull–Rom splines,
   * [alpha](https://github.com/d3/d3-shape/blob/main/README.md#curveCatmullRom_alpha).
   */
  tension?: number;
}
