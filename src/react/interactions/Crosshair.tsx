// @ts-nocheck — React components importing from untyped JS modules
import React, {useMemo} from "react";
import {usePlotContext} from "../PlotContext.js";
import {useMark} from "../useMark.js";
import {findNearest} from "./usePointer.js";
import type {ChannelSpec} from "../PlotContext.js";

export interface CrosshairProps {
  data?: any;
  x?: any;
  y?: any;
  color?: string;
  opacity?: number;
  strokeWidth?: number;
  strokeDasharray?: string;
  className?: string;
  [key: string]: any;
}

export function CrosshairX({
  data,
  x,
  y,
  color = "currentColor",
  opacity = 0.2,
  strokeWidth = 1,
  strokeDasharray,
  className,
  ...restOptions
}: CrosshairProps) {
  const {pointer, dimensions} = usePlotContext();

  const channels: Record<string, ChannelSpec> = useMemo(
    () => ({
      x: {value: x, scale: "x", optional: true},
      y: {value: y, scale: "y", optional: true}
    }),
    [x, y]
  );

  const {values, index} = useMark({
    data,
    channels,
    ariaLabel: "crosshair-x",
    ...restOptions
  });

  if (!values || !index || !dimensions || !pointer.active || pointer.x == null) return null;

  const nearestIndex = findNearest(index, values, pointer.x, pointer.y ?? 0, "x");
  if (nearestIndex == null) return null;

  const cx = values.x?.[nearestIndex];
  if (cx == null) return null;

  const {marginTop, height, marginBottom} = dimensions;

  return (
    <g className={className} pointerEvents="none">
      <line
        x1={cx}
        x2={cx}
        y1={marginTop}
        y2={height - marginBottom}
        stroke={color}
        strokeWidth={strokeWidth}
        strokeOpacity={opacity}
        strokeDasharray={strokeDasharray}
      />
    </g>
  );
}

export function CrosshairY({
  data,
  x,
  y,
  color = "currentColor",
  opacity = 0.2,
  strokeWidth = 1,
  strokeDasharray,
  className,
  ...restOptions
}: CrosshairProps) {
  const {pointer, dimensions} = usePlotContext();

  const channels: Record<string, ChannelSpec> = useMemo(
    () => ({
      x: {value: x, scale: "x", optional: true},
      y: {value: y, scale: "y", optional: true}
    }),
    [x, y]
  );

  const {values, index} = useMark({
    data,
    channels,
    ariaLabel: "crosshair-y",
    ...restOptions
  });

  if (!values || !index || !dimensions || !pointer.active || pointer.y == null) return null;

  const nearestIndex = findNearest(index, values, pointer.x ?? 0, pointer.y, "y");
  if (nearestIndex == null) return null;

  const cy = values.y?.[nearestIndex];
  if (cy == null) return null;

  const {marginLeft, width, marginRight} = dimensions;

  return (
    <g className={className} pointerEvents="none">
      <line
        x1={marginLeft}
        x2={width - marginRight}
        y1={cy}
        y2={cy}
        stroke={color}
        strokeWidth={strokeWidth}
        strokeOpacity={opacity}
        strokeDasharray={strokeDasharray}
      />
    </g>
  );
}

// Combined crosshair showing both x and y reference lines
export function Crosshair({
  data,
  x,
  y,
  color = "currentColor",
  opacity = 0.2,
  strokeWidth = 1,
  strokeDasharray,
  className,
  ...restOptions
}: CrosshairProps) {
  const {pointer, dimensions} = usePlotContext();

  const channels: Record<string, ChannelSpec> = useMemo(
    () => ({
      x: {value: x, scale: "x", optional: true},
      y: {value: y, scale: "y", optional: true}
    }),
    [x, y]
  );

  const {values, index} = useMark({
    data,
    channels,
    ariaLabel: "crosshair",
    ...restOptions
  });

  if (!values || !index || !dimensions || !pointer.active || pointer.x == null || pointer.y == null) return null;

  const nearestIndex = findNearest(index, values, pointer.x, pointer.y, "xy");
  if (nearestIndex == null) return null;

  const cx = values.x?.[nearestIndex];
  const cy = values.y?.[nearestIndex];
  if (cx == null && cy == null) return null;

  const {marginTop, marginLeft, width, height, marginRight, marginBottom} = dimensions;

  return (
    <g className={className} pointerEvents="none">
      {cx != null && (
        <line
          x1={cx}
          x2={cx}
          y1={marginTop}
          y2={height - marginBottom}
          stroke={color}
          strokeWidth={strokeWidth}
          strokeOpacity={opacity}
          strokeDasharray={strokeDasharray}
        />
      )}
      {cy != null && (
        <line
          x1={marginLeft}
          x2={width - marginRight}
          y1={cy}
          y2={cy}
          stroke={color}
          strokeWidth={strokeWidth}
          strokeOpacity={opacity}
          strokeDasharray={strokeDasharray}
        />
      )}
    </g>
  );
}
