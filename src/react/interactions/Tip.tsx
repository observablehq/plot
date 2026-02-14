// @ts-nocheck — React components importing from untyped JS modules
import React, {useMemo} from "react";
import {useMark} from "../useMark.js";
import {usePlotContext} from "../PlotContext.js";
import {findNearest} from "./usePointer.js";
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
  pointer: pointerMode = "xy",
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
  const {pointer: pointerState, dimensions} = usePlotContext();

  const channels: Record<string, ChannelSpec> = useMemo(
    () => ({
      x: {value: x, scale: "x", optional: true},
      y: {value: y, scale: "y", optional: true},
      ...(titleProp != null ? {title: {value: titleProp, optional: true, filter: null}} : {})
    }),
    [x, y, titleProp]
  );

  const {values, index} = useMark({
    data,
    channels,
    ariaLabel: "tip",
    ...restOptions
  });

  if (!values || !index || !dimensions || !pointerState.active || pointerState.x == null || pointerState.y == null)
    return null;

  // Find nearest datum to pointer
  const nearestIndex = findNearest(index, values, pointerState.x, pointerState.y, pointerMode);
  if (nearestIndex == null) return null;

  const px = values.x?.[nearestIndex] ?? pointerState.x;
  const py = values.y?.[nearestIndex] ?? pointerState.y;

  // Build tooltip text lines
  const lines: string[] = [];
  if (formatFn && data) {
    lines.push(formatFn(data[nearestIndex]));
  } else if (titleProp && values.title) {
    lines.push(`${formatDefault(values.title[nearestIndex])}`);
  } else if (data && typeof data[nearestIndex] === "object") {
    const datum = data[nearestIndex];
    for (const key of Object.keys(datum)) {
      if (datum[key] != null) {
        lines.push(`${key}: ${formatDefault(datum[key])}`);
      }
    }
  } else {
    if (values.x) lines.push(`x: ${formatDefault(values.x[nearestIndex])}`);
    if (values.y) lines.push(`y: ${formatDefault(values.y[nearestIndex])}`);
  }

  if (lines.length === 0) return null;

  // Compute tooltip dimensions
  const maxCharWidth = fontSize * 0.6;
  const maxLineWidth = Math.max(...lines.map((l) => l.length)) * maxCharWidth;
  const tipWidth = maxLineWidth + padding * 2;
  const tipHeight = lines.length * fontSize * lineHeight + padding * 2;

  // Determine anchor position (which side the tooltip appears on)
  const {width: plotWidth, height: plotHeight} = dimensions;
  const anchor = anchorProp ?? computeAnchor(px, py, tipWidth, tipHeight, plotWidth, plotHeight, preferredAnchor);

  const [tx, ty] = anchorOffset(anchor, px, py, tipWidth, tipHeight);

  return (
    <g className={className} pointerEvents="none">
      <rect
        x={tx}
        y={ty}
        width={tipWidth}
        height={tipHeight}
        fill={fill}
        fillOpacity={fillOpacity}
        stroke={stroke}
        strokeWidth={strokeWidth}
        rx={2}
        ry={2}
      />
      {lines.map((line, i) => (
        <text
          key={i}
          x={tx + padding}
          y={ty + padding + (i + 0.8) * fontSize * lineHeight}
          fontSize={fontSize}
          fontFamily={fontFamily}
          fill="currentColor"
          textAnchor="start"
        >
          {line}
        </text>
      ))}
    </g>
  );
}

function computeAnchor(
  px: number,
  py: number,
  tipWidth: number,
  tipHeight: number,
  plotWidth: number,
  plotHeight: number,
  preferred: string
): string {
  // Choose anchor to keep tooltip within plot bounds
  if (preferred === "bottom" && py + tipHeight + 8 < plotHeight) return "bottom";
  if (preferred === "top" && py - tipHeight - 8 > 0) return "top";
  if (py + tipHeight + 8 < plotHeight) return "bottom";
  if (py - tipHeight - 8 > 0) return "top";
  if (px + tipWidth + 8 < plotWidth) return "right";
  return "left";
}

function anchorOffset(anchor: string, px: number, py: number, tipWidth: number, tipHeight: number): [number, number] {
  const gap = 8;
  switch (anchor) {
    case "top":
      return [px - tipWidth / 2, py - tipHeight - gap];
    case "right":
      return [px + gap, py - tipHeight / 2];
    case "left":
      return [px - tipWidth - gap, py - tipHeight / 2];
    default:
      return [px - tipWidth / 2, py + gap]; // bottom
  }
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
