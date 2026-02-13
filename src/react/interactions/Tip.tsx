import React, {useMemo} from "react";
import {useMark} from "../useMark.js";
import type {ChannelSpec} from "../PlotContext.js";
import {formatDefault} from "../../format.js";

export interface TipProps {
  data?: any;
  x?: any;
  y?: any;
  title?: any;
  channels?: Record<string, any>;
  pointer?: "xy" | "x" | "y";
  anchor?: string;
  preferredAnchor?: string;
  fill?: string;
  stroke?: string;
  fillOpacity?: number;
  strokeWidth?: number;
  fontSize?: number;
  fontFamily?: string;
  lineHeight?: number;
  padding?: number;
  className?: string;
  format?: (datum: any) => string;
  [key: string]: any;
}

export function Tip({
  data,
  x,
  y,
  title: titleProp,
  channels: extraChannels,
  pointer = "xy",
  anchor: anchorProp,
  preferredAnchor = "bottom",
  fill = "white",
  stroke = "currentColor",
  fillOpacity = 0.9,
  strokeWidth = 0.5,
  fontSize = 10,
  fontFamily = "system-ui, sans-serif",
  lineHeight = 1.4,
  padding = 6,
  className,
  format: formatFn,
  ...restOptions
}: TipProps) {
  const channels: Record<string, ChannelSpec> = useMemo(() => ({
    x: {value: x, scale: "x", optional: true},
    y: {value: y, scale: "y", optional: true},
    ...(titleProp != null ? {title: {value: titleProp, optional: true, filter: null}} : {})
  }), [x, y, titleProp]);

  const {values, index, scales, dimensions} = useMark({
    data,
    channels,
    ariaLabel: "tip",
    ...restOptions
  });

  // Tips are interactive marks — for now, render nothing in the static case.
  // In a full implementation, this would be driven by pointer state.
  // This is a placeholder that renders the tooltip structure.
  if (!values || !index || !dimensions) return null;

  // The tip mark is typically driven by pointer interaction.
  // For now, expose the structure. A full implementation would use
  // usePointer + findNearest to select which datum to show.

  return null; // Tip rendering is driven by pointer state (see usePointer)
}

// Utility: format a tooltip's content from a datum
export function formatTip(datum: any, channels?: string[]): string[] {
  if (datum == null) return [];
  const lines: string[] = [];
  if (typeof datum === "object") {
    const keys = channels ?? Object.keys(datum);
    for (const key of keys) {
      const value = datum[key];
      if (value != null) {
        lines.push(`${key}: ${formatDefault(value)}`);
      }
    }
  } else {
    lines.push(`${formatDefault(datum)}`);
  }
  return lines;
}
