import React from "react";
import {usePlotContext} from "../PlotContext.js";

export interface LegendProps {
  scale?: "color" | "opacity" | "symbol" | "r";
  label?: string;
  tickSize?: number;
  width?: number;
  height?: number;
  marginTop?: number;
  marginRight?: number;
  marginBottom?: number;
  marginLeft?: number;
  className?: string;
}

// A basic legend component that reads scale information from PlotContext.
// Currently supports discrete color legends (swatches).
export function Legend({
  scale: scaleName = "color",
  label: labelProp,
  tickSize = 15,
  width: widthProp,
  height: heightProp = 33,
  marginTop = 5,
  marginRight = 0,
  marginBottom = 16,
  marginLeft = 0,
  className
}: LegendProps) {
  const {scales} = usePlotContext();
  if (!scales) return null;

  const scaleInfo = (scales as any)?.[scaleName];
  if (!scaleInfo) return null;

  const {domain, range, type, label: scaleLabel} = scaleInfo;
  const labelText = labelProp ?? scaleLabel;

  // Discrete legend (swatches)
  if (type === "ordinal" || type === "categorical" || domain?.length <= 10) {
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
        {labelText && (
          <span style={{fontWeight: "bold", marginRight: "4px"}}>{`${labelText}`}</span>
        )}
        {domain?.map((d: any, i: number) => {
          const color = range ? range[i % range.length] : scaleInfo.apply?.(d);
          return (
            <span key={i} style={{display: "inline-flex", alignItems: "center", gap: "3px"}}>
              <svg width={tickSize} height={tickSize}>
                <rect width={tickSize} height={tickSize} fill={color} />
              </svg>
              <span>{`${d}`}</span>
            </span>
          );
        })}
      </div>
    );
  }

  // Continuous legend (color ramp) — simplified version
  const rampWidth = widthProp ?? 240;
  return (
    <div className={className} style={{marginBottom: "8px"}}>
      {labelText && (
        <div style={{fontSize: "10px", fontFamily: "system-ui, sans-serif", marginBottom: "2px"}}>{`${labelText}`}</div>
      )}
      <svg width={rampWidth + marginLeft + marginRight} height={heightProp + marginTop + marginBottom}>
        <defs>
          <linearGradient id="legend-gradient">
            {domain && domain.length >= 2 && Array.from({length: 10}, (_, i) => {
              const t = i / 9;
              const value = domain[0] + t * (domain[domain.length - 1] - domain[0]);
              const color = scaleInfo.apply?.(value) ?? "#ccc";
              return <stop key={i} offset={`${t * 100}%`} stopColor={color} />;
            })}
          </linearGradient>
        </defs>
        <rect
          x={marginLeft}
          y={marginTop}
          width={rampWidth}
          height={heightProp - marginTop - marginBottom}
          fill="url(#legend-gradient)"
        />
        {domain && (
          <g transform={`translate(0,${heightProp - marginBottom})`} fontSize={10} fontFamily="system-ui, sans-serif">
            <text x={marginLeft} textAnchor="start" dy="0.71em" fill="currentColor">{`${domain[0]}`}</text>
            <text x={marginLeft + rampWidth} textAnchor="end" dy="0.71em" fill="currentColor">{`${domain[domain.length - 1]}`}</text>
          </g>
        )}
      </svg>
    </div>
  );
}
