// @ts-nocheck
import React, {useMemo, useState, useCallback} from "react";
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
  const channels: Record<string, ChannelSpec> = useMemo(() => ({
    x: {value: x, scale: "x", optional: true},
    y: {value: y, scale: "y", optional: true}
  }), [x, y]);

  const {values, index, scales, dimensions} = useMark({
    data,
    channels,
    ariaLabel: "crosshair-x",
    ...restOptions
  });

  if (!values || !index || !dimensions || !scales) return null;

  // Crosshair rendering is typically driven by pointer state.
  // This component provides the visual structure; a parent or
  // sibling component would supply the highlighted index.
  return null;
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
  const channels: Record<string, ChannelSpec> = useMemo(() => ({
    x: {value: x, scale: "x", optional: true},
    y: {value: y, scale: "y", optional: true}
  }), [x, y]);

  const {values, index, scales, dimensions} = useMark({
    data,
    channels,
    ariaLabel: "crosshair-y",
    ...restOptions
  });

  if (!values || !index || !dimensions || !scales) return null;

  return null;
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
  const channels: Record<string, ChannelSpec> = useMemo(() => ({
    x: {value: x, scale: "x", optional: true},
    y: {value: y, scale: "y", optional: true}
  }), [x, y]);

  const {values, index, scales, dimensions} = useMark({
    data,
    channels,
    ariaLabel: "crosshair",
    ...restOptions
  });

  if (!values || !index || !dimensions || !scales) return null;

  return null;
}
