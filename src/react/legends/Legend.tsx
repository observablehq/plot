// @ts-nocheck — React components importing from untyped JS modules
import React, {useId} from "react";
import {usePlotContext} from "../PlotContext.js";
import {formatDefault} from "../../format.js";

export interface LegendProps {
  scale?: "color" | "opacity" | "symbol" | "r";
  label?: string;
  tickSize?: number;
  ticks?: number;
  tickFormat?: (d: any) => string;
  width?: number;
  height?: number;
  marginTop?: number;
  marginRight?: number;
  marginBottom?: number;
  marginLeft?: number;
  className?: string;
}

// Symbol shapes as SVG path data (d3 symbol paths, centered at origin, size ~64)
const symbolPaths: Record<string, string> = {
  circle: "M4.514,0A4.514,4.514,0,1,1,-4.514,0A4.514,4.514,0,1,1,4.514,0",
  cross: "M-3.5,-1.167H-1.167V-3.5H1.167V-1.167H3.5V1.167H1.167V3.5H-1.167V1.167H-3.5Z",
  diamond: "M0,-4.655L2.691,0L0,4.655L-2.691,0Z",
  square: "M-3.5,-3.5H3.5V3.5H-3.5Z",
  star: "M0,-4.7L1.06,-1.45L4.47,-1.45L1.71,0.55L2.76,3.8L0,1.8L-2.76,3.8L-1.71,0.55L-4.47,-1.45L-1.06,-1.45Z",
  triangle: "M0,-4.2L3.64,2.1L-3.64,2.1Z",
  wye: "M0.58,0.33L0.58,3.5H-0.58V0.33L-2.83,1.63L-3.41,0.62L-1.16,-0.68L-3.41,-1.99L-2.83,-3L-0.58,-1.69V-3.5H0.58V-1.69L2.83,-3L3.41,-1.99L1.16,-0.68L3.41,0.62L2.83,1.63Z"
};

// Legend component supporting color swatches, continuous ramps, symbol legends, and opacity legends.
export function Legend({
  scale: scaleName = "color",
  label: labelProp,
  tickSize = 15,
  ticks: tickCount,
  tickFormat: tickFormatFn,
  width: widthProp,
  height: heightProp = 33,
  marginTop = 5,
  marginRight = 0,
  marginBottom = 16,
  marginLeft = 0,
  className
}: LegendProps) {
  const {scales, scaleFunctions} = usePlotContext();
  const gradientId = useId();
  if (!scales) return null;

  const scaleInfo = (scales as any)?.[scaleName];
  if (!scaleInfo) return null;

  const {domain, range, type, label: scaleLabel} = scaleInfo;
  const labelText = labelProp ?? scaleLabel;
  const format = tickFormatFn ?? formatDefault;

  // Symbol legend
  if (scaleName === "symbol") {
    return (
      <div
        className={className}
        style={{
          display: "flex",
          flexWrap: "wrap",
          alignItems: "center",
          gap: "8px",
          fontSize: "10px",
          fontFamily: "system-ui, sans-serif",
          marginBottom: "8px"
        }}
      >
        {labelText && <span style={{fontWeight: "bold", marginRight: "4px"}}>{`${labelText}`}</span>}
        {domain?.map((d: any, i: number) => {
          const symbolName = range ? range[i % range.length] : "circle";
          const path = symbolPaths[symbolName] ?? symbolPaths.circle;
          return (
            <span key={i} style={{display: "inline-flex", alignItems: "center", gap: "3px"}}>
              <svg width={tickSize} height={tickSize} viewBox="-5 -5 10 10">
                <path d={path} fill="currentColor" />
              </svg>
              <span>{`${format(d)}`}</span>
            </span>
          );
        })}
      </div>
    );
  }

  // Opacity legend
  if (scaleName === "opacity") {
    const rampWidth = widthProp ?? 240;
    const rampHeight = heightProp - marginTop - marginBottom;
    const opacityScale = scaleFunctions?.opacity;
    const n = tickCount ?? 5;
    const ticks =
      domain && domain.length >= 2
        ? Array.from({length: n}, (_, i) => domain[0] + (i / (n - 1)) * (domain[domain.length - 1] - domain[0]))
        : domain ?? [];

    return (
      <div className={className} style={{marginBottom: "8px"}}>
        {labelText && (
          <div
            style={{fontSize: "10px", fontFamily: "system-ui, sans-serif", marginBottom: "2px"}}
          >{`${labelText}`}</div>
        )}
        <svg width={rampWidth + marginLeft + marginRight} height={heightProp + marginTop + marginBottom}>
          <defs>
            <linearGradient id={gradientId}>
              {Array.from({length: 10}, (_, i) => {
                const t = i / 9;
                const value = domain[0] + t * (domain[domain.length - 1] - domain[0]);
                const opacity = opacityScale ? opacityScale(value) : t;
                return <stop key={i} offset={`${t * 100}%`} stopColor="currentColor" stopOpacity={opacity} />;
              })}
            </linearGradient>
          </defs>
          <rect x={marginLeft} y={marginTop} width={rampWidth} height={rampHeight} fill={`url(#${gradientId})`} />
          <g transform={`translate(0,${heightProp - marginBottom})`} fontSize={10} fontFamily="system-ui, sans-serif">
            {ticks.map((d: any, i: number) => {
              const x = marginLeft + (i / (ticks.length - 1)) * rampWidth;
              return (
                <text
                  key={i}
                  x={x}
                  textAnchor={i === 0 ? "start" : i === ticks.length - 1 ? "end" : "middle"}
                  dy="0.71em"
                  fill="currentColor"
                >
                  {`${format(d)}`}
                </text>
              );
            })}
          </g>
        </svg>
      </div>
    );
  }

  // Discrete legend (swatches) for ordinal/categorical or small domains
  if (type === "ordinal" || type === "categorical" || (domain?.length <= 10 && !isContinuousType(type))) {
    return (
      <div
        className={className}
        style={{
          display: "flex",
          flexWrap: "wrap",
          alignItems: "center",
          gap: "8px",
          fontSize: "10px",
          fontFamily: "system-ui, sans-serif",
          marginBottom: "8px"
        }}
      >
        {labelText && <span style={{fontWeight: "bold", marginRight: "4px"}}>{`${labelText}`}</span>}
        {domain?.map((d: any, i: number) => {
          const color = range ? range[i % range.length] : scaleInfo.apply?.(d);
          return (
            <span key={i} style={{display: "inline-flex", alignItems: "center", gap: "3px"}}>
              <svg width={tickSize} height={tickSize}>
                <rect width={tickSize} height={tickSize} fill={color} />
              </svg>
              <span>{`${format(d)}`}</span>
            </span>
          );
        })}
      </div>
    );
  }

  // Continuous legend (color ramp) with proper tick labels
  const rampWidth = widthProp ?? 240;
  const rampHeight = heightProp - marginTop - marginBottom;
  const n = tickCount ?? 5;
  const ticks =
    domain && domain.length >= 2
      ? Array.from({length: n}, (_, i) => domain[0] + (i / (n - 1)) * (domain[domain.length - 1] - domain[0]))
      : domain ?? [];

  return (
    <div className={className} style={{marginBottom: "8px"}}>
      {labelText && (
        <div style={{fontSize: "10px", fontFamily: "system-ui, sans-serif", marginBottom: "2px"}}>{`${labelText}`}</div>
      )}
      <svg width={rampWidth + marginLeft + marginRight} height={heightProp + marginTop + marginBottom}>
        <defs>
          <linearGradient id={gradientId}>
            {domain &&
              domain.length >= 2 &&
              Array.from({length: 10}, (_, i) => {
                const t = i / 9;
                const value = domain[0] + t * (domain[domain.length - 1] - domain[0]);
                const color = scaleInfo.apply?.(value) ?? "#ccc";
                return <stop key={i} offset={`${t * 100}%`} stopColor={color} />;
              })}
          </linearGradient>
        </defs>
        <rect x={marginLeft} y={marginTop} width={rampWidth} height={rampHeight} fill={`url(#${gradientId})`} />
        <g transform={`translate(0,${heightProp - marginBottom})`} fontSize={10} fontFamily="system-ui, sans-serif">
          {ticks.map((d: any, i: number) => {
            const x = marginLeft + (i / (ticks.length - 1)) * rampWidth;
            return (
              <g key={i}>
                <line x1={x} x2={x} y1={0} y2={4} stroke="currentColor" />
                <text
                  x={x}
                  textAnchor={i === 0 ? "start" : i === ticks.length - 1 ? "end" : "middle"}
                  dy="0.71em"
                  y={6}
                  fill="currentColor"
                >
                  {`${format(d)}`}
                </text>
              </g>
            );
          })}
        </g>
      </svg>
    </div>
  );
}

function isContinuousType(type: string): boolean {
  return [
    "linear",
    "pow",
    "sqrt",
    "log",
    "symlog",
    "utc",
    "time",
    "sequential",
    "diverging",
    "cyclical",
    "threshold",
    "quantile",
    "quantize"
  ].includes(type);
}
