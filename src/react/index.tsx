// @ts-nocheck — React components importing from untyped JS modules
// @observablehq/plot/react — React component API for Observable Plot
//
// Usage:
//   import { Plot, Dot, Line, BarY, AxisX, AxisY } from "@observablehq/plot/react";
//
//   function Chart({ data }) {
//     return (
//       <Plot width={640} height={400}>
//         <Dot data={data} x="weight" y="height" fill="species" />
//         <AxisX />
//         <AxisY />
//       </Plot>
//     );
//   }

// Root component
export {Plot} from "./Plot.js";
export type {PlotProps} from "./Plot.js";

// Context (for advanced usage / custom marks)
export {PlotContext, FacetContext, usePlotContext, useFacetContext} from "./PlotContext.js";
export type {
  PlotContextValue,
  FacetContextValue,
  MarkRegistration,
  MarkState,
  Dimensions,
  FacetInfo,
  ChannelSpec
} from "./PlotContext.js";

// Core hook (for building custom marks)
export {useMark} from "./useMark.js";
export type {UseMarkOptions, UseMarkResult} from "./useMark.js";

// Style utilities (for building custom marks)
export {
  indirectStyleProps,
  directStyleProps,
  channelStyleProps,
  groupChannelStyleProps,
  computeTransform,
  computeFrameAnchor,
  resolveStyles
} from "./styles.js";

// Mark components
export {Dot, DotX, DotY, Circle, Hexagon} from "./marks/Dot.js";
export type {DotProps} from "./marks/Dot.js";

export {Line, LineX, LineY} from "./marks/Line.js";
export type {LineProps} from "./marks/Line.js";

export {Area, AreaX, AreaY} from "./marks/Area.js";
export type {AreaProps} from "./marks/Area.js";

export {BarX, BarY} from "./marks/Bar.js";
export type {BarProps} from "./marks/Bar.js";

export {Rect, Cell, CellX, CellY, RectX, RectY} from "./marks/Rect.js";
export type {RectProps} from "./marks/Rect.js";

export {RuleX, RuleY} from "./marks/Rule.js";
export type {RuleProps} from "./marks/Rule.js";

export {Text, TextX, TextY} from "./marks/Text.js";
export type {TextProps} from "./marks/Text.js";

export {Frame} from "./marks/Frame.js";
export type {FrameProps} from "./marks/Frame.js";

export {TickX, TickY} from "./marks/Tick.js";
export type {TickProps} from "./marks/Tick.js";

export {Link} from "./marks/Link.js";
export type {LinkProps} from "./marks/Link.js";

export {Arrow} from "./marks/Arrow.js";
export type {ArrowProps} from "./marks/Arrow.js";

export {Vector, VectorX, VectorY, Spike} from "./marks/Vector.js";
export type {VectorProps} from "./marks/Vector.js";

export {Image} from "./marks/Image.js";
export type {ImageProps} from "./marks/Image.js";

// Geometric / computational marks
export {Geo, Sphere, Graticule} from "./marks/Geo.js";
export type {GeoProps} from "./marks/Geo.js";

export {DelaunayLink, DelaunayMesh, Hull, Voronoi, VoronoiMesh} from "./marks/Delaunay.js";
export type {DelaunayProps} from "./marks/Delaunay.js";

export {Density} from "./marks/Density.js";
export type {DensityProps} from "./marks/Density.js";

export {Contour} from "./marks/Contour.js";
export type {ContourProps} from "./marks/Contour.js";

export {Raster} from "./marks/Raster.js";
export type {RasterProps} from "./marks/Raster.js";

// Raster interpolation utilities (pure functions, shared with imperative API)
export {interpolateNone, interpolatorBarycentric, interpolateNearest, interpolatorRandomWalk} from "../marks/raster.js";

export {Hexgrid} from "./marks/Hexgrid.js";
export type {HexgridProps} from "./marks/Hexgrid.js";

// Composite marks
export {BoxX, BoxY} from "./marks/Box.js";
export type {BoxProps} from "./marks/Box.js";

export {TreeMark, ClusterMark} from "./marks/Tree.js";
export type {TreeProps} from "./marks/Tree.js";

export {BollingerX, BollingerY} from "./marks/Bollinger.js";
export type {BollingerProps} from "./marks/Bollinger.js";

export {DifferenceX, DifferenceY} from "./marks/Difference.js";
export type {DifferenceProps} from "./marks/Difference.js";

export {LinearRegressionX, LinearRegressionY} from "./marks/LinearRegression.js";
export type {LinearRegressionProps} from "./marks/LinearRegression.js";

export {WaffleX, WaffleY} from "./marks/Waffle.js";
export type {WaffleProps} from "./marks/Waffle.js";

// Axis and grid components (including facet axes)
export {AxisX, AxisY, GridX, GridY, AxisFx, AxisFy, GridFx, GridFy} from "./marks/Axis.js";
export type {AxisProps} from "./marks/Axis.js";

// Legend components
export {Legend} from "./legends/Legend.js";
export type {LegendProps} from "./legends/Legend.js";

// Interaction components
export {Tip, formatTip} from "./interactions/Tip.js";
export type {TipProps} from "./interactions/Tip.js";

export {Crosshair, CrosshairX, CrosshairY} from "./interactions/Crosshair.js";
export type {CrosshairProps} from "./interactions/Crosshair.js";

// Interaction hooks
export {usePointer, findNearest} from "./interactions/usePointer.js";
export type {PointerState, UsePointerOptions} from "./interactions/usePointer.js";

// Re-export ALL transforms (pure functions, shared with imperative API)
export {filter, reverse, sort, shuffle, basic as transform, initializer} from "../transforms/basic.js";
export {bin, binX, binY} from "../transforms/bin.js";
export {centroid, geoCentroid} from "../transforms/centroid.js";
export {dodgeX, dodgeY} from "../transforms/dodge.js";
export {group, groupX, groupY, groupZ, find} from "../transforms/group.js";
export {hexbin} from "../transforms/hexbin.js";
export {normalize, normalizeX, normalizeY} from "../transforms/normalize.js";
export {map, mapX, mapY} from "../transforms/map.js";
export {shiftX, shiftY} from "../transforms/shift.js";
export {window, windowX, windowY} from "../transforms/window.js";
export {select, selectFirst, selectLast, selectMaxX, selectMaxY, selectMinX, selectMinY} from "../transforms/select.js";
export {stackX, stackX1, stackX2, stackY, stackY1, stackY2} from "../transforms/stack.js";
export {treeNode, treeLink} from "../transforms/tree.js";

// Re-export data utilities
export {valueof, column, identity, indexOf, numberInterval} from "../options.js";

// Re-export format utilities
export {formatIsoDate, formatNumber, formatWeekday, formatMonth} from "../format.js";

// Re-export scale and legend utilities
export {scale} from "../scales.js";
export {legend} from "../legends.js";

// Re-export time interval utilities
export {timeInterval, utcInterval} from "../time.js";
