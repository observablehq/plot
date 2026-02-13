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
export type {PlotContextValue, FacetContextValue, MarkRegistration, MarkState, Dimensions, FacetInfo, ChannelSpec} from "./PlotContext.js";

// Core hook (for building custom marks)
export {useMark} from "./useMark.js";
export type {UseMarkOptions, UseMarkResult} from "./useMark.js";

// Style utilities (for building custom marks)
export {indirectStyleProps, directStyleProps, channelStyleProps, groupChannelStyleProps, computeTransform, computeFrameAnchor, resolveStyles} from "./styles.js";

// Mark components
export {Dot, DotX, DotY, Circle, Hexagon} from "./marks/Dot.js";
export type {DotProps} from "./marks/Dot.js";

export {Line, LineX, LineY} from "./marks/Line.js";
export type {LineProps} from "./marks/Line.js";

export {Area, AreaX, AreaY} from "./marks/Area.js";
export type {AreaProps} from "./marks/Area.js";

export {BarX, BarY} from "./marks/Bar.js";
export type {BarProps} from "./marks/Bar.js";

export {Rect, Cell} from "./marks/Rect.js";
export type {RectProps} from "./marks/Rect.js";

export {RuleX, RuleY} from "./marks/Rule.js";
export type {RuleProps} from "./marks/Rule.js";

export {Text, TextX, TextY} from "./marks/Text.js";
export type {TextProps} from "./marks/Text.js";

export {Frame} from "./marks/Frame.js";
export type {FrameProps} from "./marks/Frame.js";

// Axis and grid components
export {AxisX, AxisY, GridX, GridY} from "./marks/Axis.js";
export type {AxisProps} from "./marks/Axis.js";

// Legend components
export {Legend} from "./legends/Legend.js";
export type {LegendProps} from "./legends/Legend.js";

// Interaction components
export {Tip, formatTip} from "./interactions/Tip.js";
export type {TipProps} from "./interactions/Tip.js";

// Interaction hooks
export {usePointer, findNearest} from "./interactions/usePointer.js";
export type {PointerState, UsePointerOptions} from "./interactions/usePointer.js";

// Re-export transforms for convenience (these are pure functions, shared with imperative API)
export {bin, binX, binY} from "../transforms/bin.js";
export {group, groupX, groupY, groupZ, find} from "../transforms/group.js";
export {stackX, stackX1, stackX2, stackY, stackY1, stackY2} from "../transforms/stack.js";
export {normalize, normalizeX, normalizeY} from "../transforms/normalize.js";
export {select, selectFirst, selectLast, selectMaxX, selectMaxY, selectMinX, selectMinY} from "../transforms/select.js";
export {map, mapX, mapY} from "../transforms/map.js";
export {window, windowX, windowY} from "../transforms/window.js";
export {dodgeX, dodgeY} from "../transforms/dodge.js";
export {hexbin} from "../transforms/hexbin.js";
export {shiftX, shiftY} from "../transforms/shift.js";

// Re-export format utilities
export {formatIsoDate, formatNumber, formatWeekday, formatMonth} from "../format.js";

// Re-export scale utility
export {scale} from "../scales.js";
