import {useId, useEffect, useMemo} from "react";
import {usePlotContext, useFacetContext} from "./PlotContext.js";
import type {ChannelSpec, MarkState} from "./PlotContext.js";

export interface UseMarkOptions {
  data?: any;
  channels: Record<string, ChannelSpec>;
  transform?: any;
  initializer?: any;
  facet?: string | null | boolean;
  fx?: any;
  fy?: any;
  sort?: any;
  tip?: any;
  render?: any;
  ariaLabel?: string;
  // Style options (passed through to the mark)
  [key: string]: any;
}

export interface UseMarkResult {
  // Null during registration phase; populated during render phase
  state: MarkState | null;
  // Convenience accessors
  values: Record<string, any> | null;
  index: number[] | null;
  scales: Record<string, any> | null;
  dimensions: import("./PlotContext.js").Dimensions | null;
  // The facet context, if within a faceted render
  facetInfo: import("./PlotContext.js").FacetContextValue | null;
}

// The core hook used by all mark components.
// Handles registration with Plot and provides computed scaled values.
export function useMark(options: UseMarkOptions): UseMarkResult {
  const id = useId();
  const {registerMark, unregisterMark, scales, dimensions, getMarkState} = usePlotContext();
  const facetInfo = useFacetContext();

  const {data, channels, transform, initializer, facet, fx, fy, sort, ariaLabel} = options;

  // Register this mark with the Plot component.
  // We register during render (not in an effect) so that Plot can
  // synchronously collect all marks before computing scales.
  useMemo(() => {
    registerMark({
      id,
      data,
      channels,
      options,
      transform,
      initializer,
      facet: facet === true ? "include" : facet === false ? null : (facet as string) ?? "auto",
      fx,
      fy,
      sort,
      ariaLabel
    });
  }, [id, data, channels, transform, initializer, facet, fx, fy, sort, ariaLabel, registerMark]);

  // Unregister on unmount.
  useEffect(() => {
    return () => unregisterMark(id);
  }, [id, unregisterMark]);

  // If scales haven't been computed yet, we're in the registration phase.
  if (!scales || !dimensions) {
    return {state: null, values: null, index: null, scales: null, dimensions: null, facetInfo};
  }

  // Get the computed state for this mark.
  const state = getMarkState(id);
  if (!state) {
    return {state: null, values: null, index: null, scales, dimensions, facetInfo};
  }

  // Determine the appropriate index based on facet context.
  let index = state.index;
  if (facetInfo && state.facets) {
    index = state.facets[facetInfo.facetIndex] ?? [];
  }

  return {
    state,
    values: state.values,
    index,
    scales,
    dimensions,
    facetInfo
  };
}
