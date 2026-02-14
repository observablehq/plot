// @ts-nocheck — React components importing from untyped JS modules
import React from "react";
import {usePlotContext} from "../PlotContext.js";
import {formatDefault} from "../../format.js";

export interface AxisProps {
  anchor?: "top" | "bottom" | "left" | "right";
  label?: string | null;
  labelAnchor?: "center" | "left" | "right" | "top" | "bottom";
  labelArrow?: boolean | string;
  labelOffset?: number;
  ticks?: number | any[] | null;
  tickSize?: number;
  tickPadding?: number;
  tickFormat?: ((d: any) => string) | string | null;
  tickRotate?: number;
  tickSpacing?: number;
  fontVariant?: string;
  stroke?: string;
  strokeWidth?: number;
  strokeOpacity?: number;
  className?: string;
  color?: string;
}

export function AxisX({
  anchor = "bottom",
  label,
  labelAnchor,
  labelArrow = true,
  labelOffset = 34,
  ticks: ticksProp,
  tickSize = 6,
  tickPadding = 3,
  tickFormat: tickFormatProp,
  tickRotate = 0,
  fontVariant = "tabular-nums",
  stroke = "currentColor",
  strokeWidth,
  strokeOpacity = 1,
  className,
  color
}: AxisProps) {
  const {scales, scaleFunctions, dimensions} = usePlotContext();
  if (!scaleFunctions || !dimensions) return null;

  const xScale = scaleFunctions.x;
  if (!xScale) return null;

  const {width, height, marginTop, marginBottom, marginLeft, marginRight} = dimensions;
  const isTop = anchor === "top";
  const y = isTop ? marginTop : height - marginBottom;

  // Generate ticks
  const tickValues =
    ticksProp != null
      ? Array.isArray(ticksProp)
        ? ticksProp
        : xScale.ticks
        ? xScale.ticks(ticksProp)
        : xScale.domain()
      : xScale.ticks
      ? xScale.ticks()
      : xScale.domain();

  const tickFormat = tickFormatProp
    ? typeof tickFormatProp === "function"
      ? tickFormatProp
      : (d: any) => `${d}`
    : xScale.tickFormat
    ? xScale.tickFormat()
    : formatDefault;

  // Get the scale label
  const scaleLabel = label ?? (scales?.x as any)?.label;
  const labelText = scaleLabel != null ? `${scaleLabel}` : undefined;

  // Determine label position
  const resolvedLabelAnchor = labelAnchor ?? "center";
  const labelX =
    resolvedLabelAnchor === "left"
      ? marginLeft
      : resolvedLabelAnchor === "right"
      ? width - marginRight
      : (marginLeft + width - marginRight) / 2;
  const labelY = isTop ? y - labelOffset : y + labelOffset;

  return (
    <g
      aria-label={`x-axis ${anchor}`}
      transform={`translate(0,${y})`}
      fill="none"
      fontSize={10}
      fontVariant={fontVariant}
      textAnchor="middle"
      className={className}
    >
      {/* Axis line */}
      <line
        x1={marginLeft}
        x2={width - marginRight}
        stroke={color ?? stroke}
        strokeWidth={strokeWidth}
        strokeOpacity={strokeOpacity}
      />
      {/* Ticks */}
      {tickValues.map((d: any, i: number) => {
        const x = xScale(d);
        if (x == null || !isFinite(x)) return null;
        const dir = isTop ? -1 : 1;
        return (
          <g key={i} transform={`translate(${x},0)`}>
            <line
              y2={tickSize * dir}
              stroke={color ?? stroke}
              strokeWidth={strokeWidth}
              strokeOpacity={strokeOpacity}
            />
            <text
              y={(tickSize + tickPadding) * dir}
              dy={isTop ? "0" : "0.71em"}
              textAnchor={tickRotate ? "start" : "middle"}
              fill={color ?? "currentColor"}
              transform={tickRotate ? `rotate(${tickRotate})` : undefined}
            >
              {tickFormat(d)}
            </text>
          </g>
        );
      })}
      {/* Label */}
      {labelText && (
        <text
          x={labelX}
          y={labelY - y}
          fill={color ?? "currentColor"}
          textAnchor={resolvedLabelAnchor === "left" ? "start" : resolvedLabelAnchor === "right" ? "end" : "middle"}
          fontSize={12}
          fontVariant="normal"
        >
          {labelArrow && resolvedLabelAnchor === "center" ? `${labelText} →` : labelText}
        </text>
      )}
    </g>
  );
}

export function AxisY({
  anchor = "left",
  label,
  labelAnchor,
  labelArrow = true,
  labelOffset = 45,
  ticks: ticksProp,
  tickSize = 6,
  tickPadding = 3,
  tickFormat: tickFormatProp,
  tickRotate = 0,
  fontVariant = "tabular-nums",
  stroke = "currentColor",
  strokeWidth,
  strokeOpacity = 1,
  className,
  color
}: AxisProps) {
  const {scales, scaleFunctions, dimensions} = usePlotContext();
  if (!scaleFunctions || !dimensions) return null;

  const yScale = scaleFunctions.y;
  if (!yScale) return null;

  const {width, height, marginTop, marginBottom, marginLeft, marginRight} = dimensions;
  const isRight = anchor === "right";
  const x = isRight ? width - marginRight : marginLeft;

  // Generate ticks
  const tickValues =
    ticksProp != null
      ? Array.isArray(ticksProp)
        ? ticksProp
        : yScale.ticks
        ? yScale.ticks(ticksProp)
        : yScale.domain()
      : yScale.ticks
      ? yScale.ticks()
      : yScale.domain();

  const tickFormat = tickFormatProp
    ? typeof tickFormatProp === "function"
      ? tickFormatProp
      : (d: any) => `${d}`
    : yScale.tickFormat
    ? yScale.tickFormat()
    : formatDefault;

  // Get the scale label
  const scaleLabel = label ?? (scales?.y as any)?.label;
  const labelText = scaleLabel != null ? `${scaleLabel}` : undefined;

  // Determine label position
  const resolvedLabelAnchor = labelAnchor ?? "top";
  const labelY =
    resolvedLabelAnchor === "top"
      ? marginTop
      : resolvedLabelAnchor === "bottom"
      ? height - marginBottom
      : (marginTop + height - marginBottom) / 2;
  const labelX = isRight ? labelOffset : -labelOffset;

  return (
    <g
      aria-label={`y-axis ${anchor}`}
      transform={`translate(${x},0)`}
      fill="none"
      fontSize={10}
      fontVariant={fontVariant}
      textAnchor={isRight ? "start" : "end"}
      className={className}
    >
      {/* Axis line */}
      <line
        y1={marginTop}
        y2={height - marginBottom}
        stroke={color ?? stroke}
        strokeWidth={strokeWidth}
        strokeOpacity={strokeOpacity}
      />
      {/* Ticks */}
      {tickValues.map((d: any, i: number) => {
        const y = yScale(d);
        if (y == null || !isFinite(y)) return null;
        const dir = isRight ? 1 : -1;
        return (
          <g key={i} transform={`translate(0,${y})`}>
            <line
              x2={tickSize * dir}
              stroke={color ?? stroke}
              strokeWidth={strokeWidth}
              strokeOpacity={strokeOpacity}
            />
            <text
              x={(tickSize + tickPadding) * dir}
              dy="0.32em"
              fill={color ?? "currentColor"}
              transform={tickRotate ? `rotate(${tickRotate})` : undefined}
            >
              {tickFormat(d)}
            </text>
          </g>
        );
      })}
      {/* Label */}
      {labelText && (
        <text
          transform={`translate(${labelX},${labelY}) rotate(-90)`}
          fill={color ?? "currentColor"}
          textAnchor={resolvedLabelAnchor === "top" ? "end" : resolvedLabelAnchor === "bottom" ? "start" : "middle"}
          fontSize={12}
          fontVariant="normal"
        >
          {labelArrow && resolvedLabelAnchor === "top" ? `↑ ${labelText}` : labelText}
        </text>
      )}
    </g>
  );
}

export function GridX({
  ticks: ticksProp,
  stroke = "#ddd",
  strokeWidth = 1,
  strokeOpacity = 1,
  strokeDasharray,
  className
}: AxisProps & {strokeDasharray?: string}) {
  const {scaleFunctions, dimensions} = usePlotContext();
  if (!scaleFunctions || !dimensions) return null;

  const xScale = scaleFunctions.x;
  if (!xScale) return null;

  const {marginTop, height, marginBottom} = dimensions;
  const tickValues =
    ticksProp != null
      ? Array.isArray(ticksProp)
        ? ticksProp
        : xScale.ticks
        ? xScale.ticks(ticksProp)
        : xScale.domain()
      : xScale.ticks
      ? xScale.ticks()
      : xScale.domain();

  return (
    <g aria-label="x-grid" className={className}>
      {tickValues.map((d: any, i: number) => {
        const x = xScale(d);
        if (x == null || !isFinite(x)) return null;
        return (
          <line
            key={i}
            x1={x}
            x2={x}
            y1={marginTop}
            y2={height - marginBottom}
            stroke={stroke}
            strokeWidth={strokeWidth}
            strokeOpacity={strokeOpacity}
            strokeDasharray={strokeDasharray}
          />
        );
      })}
    </g>
  );
}

export function GridY({
  ticks: ticksProp,
  stroke = "#ddd",
  strokeWidth = 1,
  strokeOpacity = 1,
  strokeDasharray,
  className
}: AxisProps & {strokeDasharray?: string}) {
  const {scaleFunctions, dimensions} = usePlotContext();
  if (!scaleFunctions || !dimensions) return null;

  const yScale = scaleFunctions.y;
  if (!yScale) return null;

  const {marginLeft, width, marginRight} = dimensions;
  const tickValues =
    ticksProp != null
      ? Array.isArray(ticksProp)
        ? ticksProp
        : yScale.ticks
        ? yScale.ticks(ticksProp)
        : yScale.domain()
      : yScale.ticks
      ? yScale.ticks()
      : yScale.domain();

  return (
    <g aria-label="y-grid" className={className}>
      {tickValues.map((d: any, i: number) => {
        const y = yScale(d);
        if (y == null || !isFinite(y)) return null;
        return (
          <line
            key={i}
            x1={marginLeft}
            x2={width - marginRight}
            y1={y}
            y2={y}
            stroke={stroke}
            strokeWidth={strokeWidth}
            strokeOpacity={strokeOpacity}
            strokeDasharray={strokeDasharray}
          />
        );
      })}
    </g>
  );
}

// Facet axis/grid variants: AxisFx, AxisFy, GridFx, GridFy
// These render axes for the facet scales (fx/fy band scales).

export function AxisFx({
  anchor = "top",
  label,
  labelAnchor,
  labelArrow = true,
  labelOffset = 34,
  ticks: ticksProp,
  tickSize = 6,
  tickPadding = 3,
  tickFormat: tickFormatProp,
  tickRotate = 0,
  fontVariant = "tabular-nums",
  stroke = "currentColor",
  strokeWidth,
  strokeOpacity = 1,
  className,
  color
}: AxisProps) {
  const {scales, scaleFunctions, dimensions} = usePlotContext();
  if (!scaleFunctions || !dimensions) return null;

  const fxScale = scaleFunctions.fx;
  if (!fxScale) return null;

  const {width, height, marginTop, marginBottom, marginLeft, marginRight} = dimensions;
  const isTop = anchor === "top";
  const y = isTop ? marginTop : height - marginBottom;

  const domain = fxScale.domain ? fxScale.domain() : [];
  const tickValues = ticksProp != null ? (Array.isArray(ticksProp) ? ticksProp : domain) : domain;

  const tickFormat = tickFormatProp
    ? typeof tickFormatProp === "function"
      ? tickFormatProp
      : (d: any) => `${d}`
    : formatDefault;

  const bw = fxScale.bandwidth ? fxScale.bandwidth() / 2 : 0;

  const scaleLabel = label ?? (scales?.fx as any)?.label;
  const labelText = scaleLabel != null ? `${scaleLabel}` : undefined;
  const resolvedLabelAnchor = labelAnchor ?? "center";
  const labelX =
    resolvedLabelAnchor === "left"
      ? marginLeft
      : resolvedLabelAnchor === "right"
      ? width - marginRight
      : (marginLeft + width - marginRight) / 2;
  const labelY = isTop ? y - labelOffset : y + labelOffset;

  return (
    <g
      aria-label={`fx-axis ${anchor}`}
      transform={`translate(0,${y})`}
      fill="none"
      fontSize={10}
      fontVariant={fontVariant}
      textAnchor="middle"
      className={className}
    >
      {tickValues.map((d: any, i: number) => {
        const x = fxScale(d);
        if (x == null || !isFinite(x)) return null;
        const dir = isTop ? -1 : 1;
        return (
          <g key={i} transform={`translate(${x + bw},0)`}>
            <line
              y2={tickSize * dir}
              stroke={color ?? stroke}
              strokeWidth={strokeWidth}
              strokeOpacity={strokeOpacity}
            />
            <text
              y={(tickSize + tickPadding) * dir}
              dy={isTop ? "0" : "0.71em"}
              textAnchor={tickRotate ? "start" : "middle"}
              fill={color ?? "currentColor"}
              transform={tickRotate ? `rotate(${tickRotate})` : undefined}
            >
              {tickFormat(d)}
            </text>
          </g>
        );
      })}
      {labelText && (
        <text
          x={labelX}
          y={labelY - y}
          fill={color ?? "currentColor"}
          textAnchor={resolvedLabelAnchor === "left" ? "start" : resolvedLabelAnchor === "right" ? "end" : "middle"}
          fontSize={12}
          fontVariant="normal"
        >
          {labelArrow && resolvedLabelAnchor === "center" ? `${labelText} →` : labelText}
        </text>
      )}
    </g>
  );
}

export function AxisFy({
  anchor = "right",
  label,
  labelAnchor,
  labelArrow = true,
  labelOffset = 45,
  ticks: ticksProp,
  tickSize = 6,
  tickPadding = 3,
  tickFormat: tickFormatProp,
  tickRotate = 0,
  fontVariant = "tabular-nums",
  stroke = "currentColor",
  strokeWidth,
  strokeOpacity = 1,
  className,
  color
}: AxisProps) {
  const {scales, scaleFunctions, dimensions} = usePlotContext();
  if (!scaleFunctions || !dimensions) return null;

  const fyScale = scaleFunctions.fy;
  if (!fyScale) return null;

  const {width, height, marginTop, marginBottom, marginLeft, marginRight} = dimensions;
  const isRight = anchor === "right";
  const x = isRight ? width - marginRight : marginLeft;

  const domain = fyScale.domain ? fyScale.domain() : [];
  const tickValues = ticksProp != null ? (Array.isArray(ticksProp) ? ticksProp : domain) : domain;

  const tickFormat = tickFormatProp
    ? typeof tickFormatProp === "function"
      ? tickFormatProp
      : (d: any) => `${d}`
    : formatDefault;

  const bw = fyScale.bandwidth ? fyScale.bandwidth() / 2 : 0;

  const scaleLabel = label ?? (scales?.fy as any)?.label;
  const labelText = scaleLabel != null ? `${scaleLabel}` : undefined;
  const resolvedLabelAnchor = labelAnchor ?? "top";
  const labelY =
    resolvedLabelAnchor === "top"
      ? marginTop
      : resolvedLabelAnchor === "bottom"
      ? height - marginBottom
      : (marginTop + height - marginBottom) / 2;
  const labelX = isRight ? labelOffset : -labelOffset;

  return (
    <g
      aria-label={`fy-axis ${anchor}`}
      transform={`translate(${x},0)`}
      fill="none"
      fontSize={10}
      fontVariant={fontVariant}
      textAnchor={isRight ? "start" : "end"}
      className={className}
    >
      {tickValues.map((d: any, i: number) => {
        const y = fyScale(d);
        if (y == null || !isFinite(y)) return null;
        const dir = isRight ? 1 : -1;
        return (
          <g key={i} transform={`translate(0,${y + bw})`}>
            <line
              x2={tickSize * dir}
              stroke={color ?? stroke}
              strokeWidth={strokeWidth}
              strokeOpacity={strokeOpacity}
            />
            <text
              x={(tickSize + tickPadding) * dir}
              dy="0.32em"
              fill={color ?? "currentColor"}
              transform={tickRotate ? `rotate(${tickRotate})` : undefined}
            >
              {tickFormat(d)}
            </text>
          </g>
        );
      })}
      {labelText && (
        <text
          transform={`translate(${labelX},${labelY}) rotate(-90)`}
          fill={color ?? "currentColor"}
          textAnchor={resolvedLabelAnchor === "top" ? "end" : resolvedLabelAnchor === "bottom" ? "start" : "middle"}
          fontSize={12}
          fontVariant="normal"
        >
          {labelArrow && resolvedLabelAnchor === "top" ? `↑ ${labelText}` : labelText}
        </text>
      )}
    </g>
  );
}

export function GridFx({
  ticks: ticksProp,
  stroke = "#ddd",
  strokeWidth = 1,
  strokeOpacity = 1,
  strokeDasharray,
  className
}: AxisProps & {strokeDasharray?: string}) {
  const {scaleFunctions, dimensions} = usePlotContext();
  if (!scaleFunctions || !dimensions) return null;

  const fxScale = scaleFunctions.fx;
  if (!fxScale) return null;

  const {marginTop, height, marginBottom} = dimensions;
  const domain = fxScale.domain ? fxScale.domain() : [];
  const tickValues = ticksProp != null ? (Array.isArray(ticksProp) ? ticksProp : domain) : domain;

  return (
    <g aria-label="fx-grid" className={className}>
      {tickValues.map((d: any, i: number) => {
        const x = fxScale(d);
        if (x == null || !isFinite(x)) return null;
        return (
          <line
            key={i}
            x1={x}
            x2={x}
            y1={marginTop}
            y2={height - marginBottom}
            stroke={stroke}
            strokeWidth={strokeWidth}
            strokeOpacity={strokeOpacity}
            strokeDasharray={strokeDasharray}
          />
        );
      })}
    </g>
  );
}

export function GridFy({
  ticks: ticksProp,
  stroke = "#ddd",
  strokeWidth = 1,
  strokeOpacity = 1,
  strokeDasharray,
  className
}: AxisProps & {strokeDasharray?: string}) {
  const {scaleFunctions, dimensions} = usePlotContext();
  if (!scaleFunctions || !dimensions) return null;

  const fyScale = scaleFunctions.fy;
  if (!fyScale) return null;

  const {marginLeft, width, marginRight} = dimensions;
  const domain = fyScale.domain ? fyScale.domain() : [];
  const tickValues = ticksProp != null ? (Array.isArray(ticksProp) ? ticksProp : domain) : domain;

  return (
    <g aria-label="fy-grid" className={className}>
      {tickValues.map((d: any, i: number) => {
        const y = fyScale(d);
        if (y == null || !isFinite(y)) return null;
        return (
          <line
            key={i}
            x1={marginLeft}
            x2={width - marginRight}
            y1={y}
            y2={y}
            stroke={stroke}
            strokeWidth={strokeWidth}
            strokeOpacity={strokeOpacity}
            strokeDasharray={strokeDasharray}
          />
        );
      })}
    </g>
  );
}
