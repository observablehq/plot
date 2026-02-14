// @ts-nocheck — React components importing from untyped JS modules
import React, {
  useCallback,
  useContext,
  useMemo,
  useRef,
  useState,
  type ReactNode,
  type PointerEvent as ReactPointerEvent
} from "react";
import {createChannel, inferChannelScale} from "../channel.js";
import {formatDefault} from "../format.js";
import {createDimensions} from "../dimensions.js";
import {createFacets, recreateFacets, facetExclude, facetGroups, facetFilter, facetTranslator} from "../facet.js";
import {isScaleOptions, dataify, map, maybeIntervalTransform, range} from "../options.js";
import {createProjection, getGeometryChannels, hasProjection} from "../projection.js";
import {createScales, createScaleFunctions, autoScaleRange} from "../scales.js";
import {innerDimensions} from "../scales.js";
import {registry as scaleRegistry} from "../scales/index.js";
import {maybeClassName} from "../style.js";
import {PlotContext, FacetContext} from "./PlotContext.js";
import type {MarkRegistration, MarkState, FacetInfo, PlotContextValue, PointerState} from "./PlotContext.js";

export interface PlotProps {
  // Dimensions
  width?: number;
  height?: number;
  margin?: number;
  marginTop?: number;
  marginRight?: number;
  marginBottom?: number;
  marginLeft?: number;
  aspectRatio?: number;

  // Scale options (x, y, color, r, fx, fy, etc.)
  x?: any;
  y?: any;
  color?: any;
  opacity?: any;
  r?: any;
  symbol?: any;
  length?: any;
  fx?: any;
  fy?: any;

  // Global scale options
  inset?: number;
  insetTop?: number;
  insetRight?: number;
  insetBottom?: number;
  insetLeft?: number;
  round?: boolean;
  nice?: boolean | number;
  clamp?: boolean;
  zero?: boolean;
  align?: number;
  padding?: number;
  label?: string;

  // Projection
  projection?: any;

  // Faceting
  facet?: any;

  // Appearance
  className?: string;
  style?: any;
  ariaLabel?: string;
  ariaDescription?: string;

  // Axes/grid (top-level defaults)
  axis?: any;
  grid?: any;

  // Figure wrapping
  title?: string;
  subtitle?: string;
  caption?: string;
  figure?: boolean;

  // Children (mark components)
  children?: ReactNode;

  // Callbacks for Observable Framework integration
  onValue?: (value: any) => void;
  onPointerMove?: (event: any, data: any) => void;
}

export function Plot({
  children,
  width: widthProp = 640,
  height: heightProp,
  className: classNameProp,
  style,
  ariaLabel,
  ariaDescription,
  title,
  subtitle,
  caption,
  figure: figureProp,
  onValue,
  ...options
}: PlotProps) {
  // Manage mark registrations. We use a ref + counter to trigger re-renders
  // without copying the map on every registration.
  const marksRef = useRef<Map<string, MarkRegistration>>(new Map());
  const [registrationVersion, setRegistrationVersion] = useState(0);

  const className = useMemo(() => maybeClassName(classNameProp), [classNameProp]);

  const registerMark = useCallback((registration: MarkRegistration) => {
    const prev = marksRef.current.get(registration.id);
    // Only update if the registration actually changed
    if (!prev || prev.data !== registration.data || prev.channels !== registration.channels) {
      marksRef.current.set(registration.id, registration);
      // Defer the state update to batch multiple registrations
      setRegistrationVersion((v) => v + 1);
    }
  }, []);

  const unregisterMark = useCallback((id: string) => {
    if (marksRef.current.delete(id)) {
      setRegistrationVersion((v) => v + 1);
    }
  }, []);

  // Compute scales, dimensions, and mark states from all registrations.
  // This is the React equivalent of the monolithic plot() function.
  const computed = useMemo(() => {
    const marks = Array.from(marksRef.current.values());
    if (marks.length === 0) return null;

    // Build the options object that the core functions expect
    const plotOptions: any = {
      ...options,
      width: widthProp,
      height: heightProp,
      marks: [] // not used directly, but some functions check for it
    };

    // Collect channel-by-scale mappings from all marks.
    // This mirrors the logic in plot.js's addScaleChannels.
    const channelsByScale = new Map<string, any[]>();

    // Handle top-level facet option
    const topFacetState = maybeTopFacet(plotOptions.facet, plotOptions);
    if (topFacetState) addScaleChannels(channelsByScale, [{channels: topFacetState.channels}], plotOptions);

    // Initialize marks: create channels and collect scale info
    const markStates = new Map<string, any>();
    const facetStateByMark = new Map<string, any>();

    for (const reg of marks) {
      const data = dataify(reg.data);
      const facets = data != null ? [range(data)] : undefined;

      // Apply transform if present
      let transformedData = data;
      let transformedFacets = facets;
      if (reg.transform) {
        const result = reg.transform(data, facets, plotOptions);
        transformedData = dataify(result.data);
        transformedFacets = result.facets;
      }

      // Create channels from the mark's channel specs
      const channels: Record<string, any> = {};
      for (const [name, spec] of Object.entries(reg.channels)) {
        if (spec.value == null && spec.optional) continue;
        if (spec.value == null) continue;
        const channel = createChannelFromSpec(transformedData, spec, name);
        if (channel) channels[name] = channel;
      }

      // Apply scale transforms
      applyScaleTransforms(channels, plotOptions);

      // Determine facet state
      const facetState = maybeMarkFacetState(reg, topFacetState, plotOptions, transformedData);
      if (facetState) {
        facetStateByMark.set(reg.id, facetState);
        addScaleChannels(channelsByScale, [{channels: facetState.channels}], plotOptions);
      }

      // Collect scale channels
      for (const name in channels) {
        const channel = channels[name];
        const {scale} = channel;
        if (scale != null) {
          if (scale === "projection") {
            if (!hasProjection(plotOptions)) {
              const gx = plotOptions.x?.domain === undefined;
              const gy = plotOptions.y?.domain === undefined;
              if (gx || gy) {
                const [x, y] = getGeometryChannels(channel);
                if (gx) addScaleChannel(channelsByScale, "x", x);
                if (gy) addScaleChannel(channelsByScale, "y", y);
              }
            }
          } else {
            addScaleChannel(channelsByScale, scale, channel);
          }
        }
      }

      markStates.set(reg.id, {
        data: transformedData,
        facets: transformedFacets,
        channels
      });
    }

    // Ensure explicitly declared scales get created
    for (const key of scaleRegistry.keys()) {
      if (isScaleOptions(plotOptions[key]) && key !== "fx" && key !== "fy") {
        if (!channelsByScale.has(key)) channelsByScale.set(key, []);
      }
    }

    // Create facets
    let facets = createFacets(channelsByScale, plotOptions);
    if (facets !== undefined) {
      const topFacetsIndex = topFacetState ? facetFilter(facets, topFacetState) : undefined;
      for (const [markId, facetState] of facetStateByMark) {
        const reg = marksRef.current.get(markId);
        if (!reg) continue;
        if (reg.facet === null || reg.facet === "super") continue;
        facetState.facetsIndex = reg.fx != null || reg.fy != null ? facetFilter(facets, facetState) : topFacetsIndex;
      }

      // Remove empty facets
      const nonEmpty = new Set<number>();
      for (const {facetsIndex} of facetStateByMark.values()) {
        facetsIndex?.forEach((index: any, i: number) => {
          if (index?.length > 0) nonEmpty.add(i);
        });
      }
      facets.forEach(
        0 < nonEmpty.size && nonEmpty.size < facets.length
          ? (f: any, i: number) => (f.empty = !nonEmpty.has(i))
          : (f: any) => (f.empty = false)
      );

      // Handle exclude facet mode
      for (const [markId, facetState] of facetStateByMark) {
        const reg = marksRef.current.get(markId);
        if (reg?.facet === "exclude") {
          facetState.facetsIndex = facetExclude(facetState.facetsIndex);
        }
      }
    }

    // Create scales
    const scaleDescriptors = createScales(channelsByScale, plotOptions);

    // Simulate marks array for dimension calculation (need marginTop etc.)
    const dimensionMarks = marks.map((reg) => ({
      marginTop: reg.options.marginTop || 0,
      marginRight: reg.options.marginRight || 0,
      marginBottom: reg.options.marginBottom || 0,
      marginLeft: reg.options.marginLeft || 0
    }));
    const dimensions = createDimensions(scaleDescriptors, dimensionMarks, plotOptions);
    autoScaleRange(scaleDescriptors, dimensions);

    const scaleFunctions = createScaleFunctions(scaleDescriptors);
    const {fx, fy} = scaleFunctions;
    const subdimensions = fx || fy ? innerDimensions(scaleDescriptors, dimensions) : dimensions;

    // Create projection
    const projection = createProjection(plotOptions, subdimensions);

    // Compute scaled values for each mark
    const computedMarkStates = new Map<string, MarkState>();
    for (const [markId, state] of markStates) {
      const {data, facets: markFacets, channels} = state;

      // Apply scales to channel values
      const values: Record<string, any> = {};
      for (const [name, channel] of Object.entries(channels)) {
        const {scale: scaleName, value} = channel as any;
        const scale = scaleName != null ? scaleFunctions[scaleName] : null;
        values[name] = scale != null ? map(value, scale) : value;
      }
      values.channels = channels;

      // Apply projection if present
      if (projection) {
        for (const cx in channels) {
          const ch = channels[cx] as any;
          if (ch.scale === "x" && /^x|x$/.test(cx)) {
            const cy = cx.replace(/^x|x$/, "y");
            if (cy in channels && (channels[cy] as any).scale === "y") {
              // Project x,y pairs
              const n = values[cx]?.length || 0;
              for (let i = 0; i < n; ++i) {
                if (values[cx][i] != null && values[cy][i] != null) {
                  const projected = projection([values[cx][i], values[cy][i]]);
                  if (projected) {
                    values[cx][i] = projected[0];
                    values[cy][i] = projected[1];
                  }
                }
              }
            }
          }
        }
      }

      // Build index
      const facetState = facetStateByMark.get(markId);
      let index: number[] = [];
      if (data != null) {
        if (facetState?.facetsIndex) {
          // Faceted: use first facet index as default
          index = facetState.facetsIndex[0] ?? range(data);
        } else if (markFacets) {
          index = markFacets[0] ?? range(data);
        } else {
          index = range(data);
        }
      }

      computedMarkStates.set(markId, {
        data,
        facets: facetState?.facetsIndex ?? markFacets,
        channels,
        values,
        index
      });
    }

    // Facet domains and translation
    let facetDomains: any;
    let facetTranslateFn: any = null;
    if (facets !== undefined) {
      facetDomains = {x: fx?.domain(), y: fy?.domain()};
      facets = recreateFacets(facets, facetDomains);
      facetTranslateFn = facetTranslator(fx, fy, dimensions);
    }

    return {
      scaleFunctions,
      scaleDescriptors,
      dimensions,
      subdimensions,
      projection,
      facets: facets as FacetInfo[] | undefined,
      facetDomains,
      facetTranslateFn,
      markStates: computedMarkStates,
      exposedScales: scaleFunctions.scales
    };
  }, [registrationVersion, widthProp, heightProp, options]);

  // Pointer state for interactive marks
  const svgRef = useRef<SVGSVGElement>(null);
  const [pointer, setPointer] = useState<PointerState>({x: null, y: null, active: false});
  const rafRef = useRef<number>(0);

  const handlePointerMove = useCallback((event: ReactPointerEvent<SVGSVGElement>) => {
    const svg = svgRef.current;
    if (!svg) return;
    if (rafRef.current) cancelAnimationFrame(rafRef.current);
    rafRef.current = requestAnimationFrame(() => {
      const rect = svg.getBoundingClientRect();
      setPointer({x: event.clientX - rect.left, y: event.clientY - rect.top, active: true});
    });
  }, []);

  const handlePointerLeave = useCallback(() => {
    if (rafRef.current) cancelAnimationFrame(rafRef.current);
    setPointer({x: null, y: null, active: false});
  }, []);

  // Build context value
  const contextValue = useMemo<PlotContextValue>(
    () => ({
      registerMark,
      unregisterMark,
      scales: computed?.exposedScales ?? null,
      scaleFunctions: computed?.scaleFunctions ?? null,
      dimensions: computed?.dimensions ?? null,
      projection: computed?.projection ?? null,
      className,
      facets: computed?.facets,
      facetTranslate: computed?.facetTranslateFn ?? null,
      getMarkState: (id: string) => computed?.markStates?.get(id),
      pointer,
      dispatchValue: onValue
    }),
    [registerMark, unregisterMark, computed, className, onValue, pointer]
  );

  const {width, height} = computed?.dimensions ?? {width: widthProp, height: heightProp ?? 400};

  // Determine if figure wrapping is needed
  const useFigure = figureProp ?? (title != null || subtitle != null || caption != null);

  // Check whether children already include explicit axis components
  const hasExplicitAxes = useMemo(() => {
    let hasX = false,
      hasY = false;
    React.Children.forEach(children, (child) => {
      if (!React.isValidElement(child)) return;
      const name = typeof child.type === "function" ? child.type.name : "";
      if (name === "AxisX" || name === "GridX") hasX = true;
      if (name === "AxisY" || name === "GridY") hasY = true;
    });
    return {hasX, hasY};
  }, [children]);

  // Render implicit axes when the corresponding scale exists and no explicit axis is provided
  const implicitAxes = useMemo(() => {
    if (!computed?.scaleFunctions) return null;
    const axes: ReactNode[] = [];
    if (!hasExplicitAxes.hasX && computed.scaleFunctions.x) {
      axes.push(<ImplicitAxisX key="__implicit-axis-x" />);
    }
    if (!hasExplicitAxes.hasY && computed.scaleFunctions.y) {
      axes.push(<ImplicitAxisY key="__implicit-axis-y" />);
    }
    return axes.length > 0 ? axes : null;
  }, [computed?.scaleFunctions, hasExplicitAxes]);

  const svg = (
    <PlotContext.Provider value={contextValue}>
      <svg
        ref={svgRef}
        className={className}
        fill="currentColor"
        fontFamily="system-ui, sans-serif"
        fontSize={10}
        textAnchor="middle"
        width={width}
        height={height}
        viewBox={`0 0 ${width} ${height}`}
        aria-label={ariaLabel}
        aria-description={ariaDescription}
        style={typeof style === "string" ? undefined : style}
        onPointerMove={handlePointerMove}
        onPointerLeave={handlePointerLeave}
      >
        <style>{`:where(.${className}) {
  --plot-background: white;
  display: block;
  height: auto;
  height: intrinsic;
  max-width: 100%;
}
:where(.${className} text),
:where(.${className} tspan) {
  white-space: pre;
}`}</style>
        {computed?.facets ? (
          // Faceted rendering: render children once per facet
          <>
            {computed.facets.map((facet, fi) => {
              if (facet.empty) return null;
              // Compute the translation for this facet cell
              const {fx, fy} = computed.scaleFunctions!;
              const tx = fx ? fx(facet.x) : 0;
              const ty = fy ? fy(facet.y) : 0;
              return (
                <FacetContext.Provider key={fi} value={{facetIndex: fi, fx: facet.x, fy: facet.y, fi}}>
                  <g transform={`translate(${tx},${ty})`}>
                    {implicitAxes}
                    {children}
                  </g>
                </FacetContext.Provider>
              );
            })}
          </>
        ) : (
          // Non-faceted rendering
          <>
            {implicitAxes}
            {children}
          </>
        )}
      </svg>
    </PlotContext.Provider>
  );

  if (!useFigure) return svg;

  return (
    <figure style={{maxWidth: width, margin: "0 auto"}}>
      {title != null && <h2 style={{fontSize: "16px", fontWeight: "bold", margin: "0 0 4px"}}>{title}</h2>}
      {subtitle != null && (
        <h3 style={{fontSize: "12px", fontWeight: "normal", color: "#666", margin: "0 0 8px"}}>{subtitle}</h3>
      )}
      {svg}
      {caption != null && (
        <figcaption style={{fontSize: "12px", color: "#666", marginTop: "4px"}}>{caption}</figcaption>
      )}
    </figure>
  );
}

// --- Implicit axis components ---

function ImplicitAxisX() {
  const {scaleFunctions, scales, dimensions} = useContext(PlotContext);
  if (!scaleFunctions?.x || !dimensions) return null;
  const xScale = scaleFunctions.x;
  const {width, height, marginBottom, marginLeft, marginRight} = dimensions;
  const y = height - marginBottom;
  const tickValues = xScale.ticks ? xScale.ticks() : xScale.domain();
  const tickFormat = xScale.tickFormat ? xScale.tickFormat() : formatDefault;
  const scaleLabel = (scales?.x as any)?.label;
  return (
    <g
      aria-label="x-axis"
      transform={`translate(0,${y})`}
      fill="none"
      fontSize={10}
      fontVariant="tabular-nums"
      textAnchor="middle"
    >
      <line x1={marginLeft} x2={width - marginRight} stroke="currentColor" />
      {tickValues.map((d: any, i: number) => {
        const x = xScale(d);
        if (x == null || !isFinite(x)) return null;
        return (
          <g key={i} transform={`translate(${x},0)`}>
            <line y2={6} stroke="currentColor" />
            <text y={9} dy="0.71em" fill="currentColor">
              {tickFormat(d)}
            </text>
          </g>
        );
      })}
      {scaleLabel != null && (
        <text
          x={(marginLeft + width - marginRight) / 2}
          y={34}
          fill="currentColor"
          textAnchor="middle"
          fontSize={12}
          fontVariant="normal"
        >{`${scaleLabel} →`}</text>
      )}
    </g>
  );
}

function ImplicitAxisY() {
  const {scaleFunctions, scales, dimensions} = useContext(PlotContext);
  if (!scaleFunctions?.y || !dimensions) return null;
  const yScale = scaleFunctions.y;
  const {height, marginTop, marginBottom, marginLeft} = dimensions;
  const x = marginLeft;
  const tickValues = yScale.ticks ? yScale.ticks() : yScale.domain();
  const tickFormat = yScale.tickFormat ? yScale.tickFormat() : formatDefault;
  const scaleLabel = (scales?.y as any)?.label;
  return (
    <g
      aria-label="y-axis"
      transform={`translate(${x},0)`}
      fill="none"
      fontSize={10}
      fontVariant="tabular-nums"
      textAnchor="end"
    >
      <line y1={marginTop} y2={height - marginBottom} stroke="currentColor" />
      {tickValues.map((d: any, i: number) => {
        const y = yScale(d);
        if (y == null || !isFinite(y)) return null;
        return (
          <g key={i} transform={`translate(0,${y})`}>
            <line x2={-6} stroke="currentColor" />
            <text x={-9} dy="0.32em" fill="currentColor">
              {tickFormat(d)}
            </text>
          </g>
        );
      })}
      {scaleLabel != null && (
        <text
          transform={`translate(${-45},${marginTop}) rotate(-90)`}
          fill="currentColor"
          textAnchor="end"
          fontSize={12}
          fontVariant="normal"
        >{`↑ ${scaleLabel}`}</text>
      )}
    </g>
  );
}

// --- Helper functions (ported from plot.js) ---

function createChannelFromSpec(data: any, spec: any, name: string) {
  const {value, scale, type, filter, hint, label} = spec;
  if (value == null) return null;

  // Resolve the value: can be a string (field name), function, or array
  let resolved;
  if (typeof value === "string") {
    const field = value;
    resolved = data != null ? Array.from(data, (d: any) => d?.[field]) : [];
  } else if (typeof value === "function") {
    resolved = data != null ? Array.from(data, value) : [];
  } else if (Array.isArray(value)) {
    resolved = value;
  } else {
    resolved = data != null ? Array.from(data, () => value) : [];
  }

  const channel: any = {
    scale: scale ?? "auto",
    type,
    value: resolved,
    label: label ?? (typeof value === "string" ? value : undefined),
    filter,
    hint
  };

  return inferChannelScale(name, channel);
}

function applyScaleTransforms(channels: Record<string, any>, options: any) {
  for (const name in channels) {
    const channel = channels[name];
    const {scale, transform: t = true} = channel;
    if (scale == null || !t) continue;
    const scaleOpts = options[scale];
    if (!scaleOpts) continue;
    const {
      type,
      percent,
      interval,
      transform = percent ? (x: any) => (x == null ? NaN : x * 100) : maybeIntervalTransform(interval, type)
    } = scaleOpts;
    if (transform == null) continue;
    channel.value = map(channel.value, transform);
    channel.transform = false;
  }
}

function maybeTopFacet(facet: any, options: any) {
  if (facet == null) return undefined;
  const {x, y} = facet;
  if (x == null && y == null) return undefined;
  const data = dataify(facet.data);
  if (data == null) throw new Error("missing facet data");
  const channels: Record<string, any> = {};
  if (x != null)
    channels.fx =
      createChannelFromSpec(data, {value: x, scale: "fx"}, "fx") ?? createChannel(data, {value: x, scale: "fx"});
  if (y != null)
    channels.fy =
      createChannelFromSpec(data, {value: y, scale: "fy"}, "fy") ?? createChannel(data, {value: y, scale: "fy"});
  applyScaleTransforms(channels, options);
  const groups = facetGroups(data, channels);
  return {channels, groups, data: facet.data};
}

function maybeMarkFacetState(reg: MarkRegistration, topFacetState: any, options: any, data: any) {
  if (reg.facet === null || reg.facet === "super") return undefined;
  const {fx, fy} = reg;
  if (fx != null || fy != null) {
    const facetData = dataify(data ?? fx ?? fy);
    if (!facetData) return undefined;
    const channels: Record<string, any> = {};
    if (fx != null)
      channels.fx =
        createChannelFromSpec(facetData, {value: fx, scale: "fx"}, "fx") ??
        createChannel(facetData, {value: fx, scale: "fx"});
    if (fy != null)
      channels.fy =
        createChannelFromSpec(facetData, {value: fy, scale: "fy"}, "fy") ??
        createChannel(facetData, {value: fy, scale: "fy"});
    applyScaleTransforms(channels, options);
    return {channels, groups: facetGroups(facetData, channels)};
  }
  if (topFacetState === undefined) return undefined;
  const {channels, groups} = topFacetState;
  if (reg.facet !== "auto" || reg.data === topFacetState.data) return {channels, groups};
  return undefined;
}

function addScaleChannels(channelsByScale: Map<string, any[]>, states: any[], options: any) {
  for (const state of states) {
    const channels = state.channels ?? {};
    for (const name in channels) {
      const channel = channels[name];
      const {scale} = channel;
      if (scale != null) {
        if (scale === "projection") {
          if (!hasProjection(options)) {
            const gx = options.x?.domain === undefined;
            const gy = options.y?.domain === undefined;
            if (gx || gy) {
              const [x, y] = getGeometryChannels(channel);
              if (gx) addScaleChannel(channelsByScale, "x", x);
              if (gy) addScaleChannel(channelsByScale, "y", y);
            }
          }
        } else {
          addScaleChannel(channelsByScale, scale, channel);
        }
      }
    }
  }
}

function addScaleChannel(channelsByScale: Map<string, any[]>, scale: string, channel: any) {
  const channels = channelsByScale.get(scale);
  if (channels) channels.push(channel);
  else channelsByScale.set(scale, [channel]);
}
