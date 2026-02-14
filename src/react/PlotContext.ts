import {createContext, useContext} from "react";

// A mark's channel specification, registered during the collection phase.
export interface ChannelSpec {
  value: any;
  scale?: string | null;
  type?: string;
  optional?: boolean;
  filter?: ((v: any) => boolean) | null;
  label?: string;
  hint?: any;
}

// A mark's registration, collected by Plot during the first render phase.
export interface MarkRegistration {
  id: string;
  data: any;
  channels: Record<string, ChannelSpec>;
  options: Record<string, any>;
  transform?: any;
  initializer?: any;
  facet?: string | null;
  fx?: any;
  fy?: any;
  sort?: any;
  ariaLabel?: string;
}

// Computed state for a mark after scales have been resolved.
export interface MarkState {
  data: any[];
  facets: number[][] | undefined;
  channels: Record<string, any>;
  values: Record<string, any>;
  index: number[];
}

export interface Dimensions {
  width: number;
  height: number;
  marginTop: number;
  marginRight: number;
  marginBottom: number;
  marginLeft: number;
  facet?: {
    marginTop: number;
    marginRight: number;
    marginBottom: number;
    marginLeft: number;
  };
}

export interface FacetInfo {
  x: any;
  y: any;
  i: number;
  empty: boolean;
}

// Pointer state shared across interactive marks.
export interface PointerState {
  x: number | null;
  y: number | null;
  active: boolean;
}

// The context provided by <Plot> to all mark children.
export interface PlotContextValue {
  // Registration phase
  registerMark: (registration: MarkRegistration) => void;
  unregisterMark: (id: string) => void;

  // Render phase (populated after scale computation)
  scales: Record<string, any> | null;
  scaleFunctions: Record<string, (v: any) => any> | null;
  dimensions: Dimensions | null;
  projection: any | null;
  className: string;

  // Facet state
  facets: FacetInfo[] | undefined;
  facetTranslate: ((f: FacetInfo) => {tx: number; ty: number}) | null;

  // Mark states (computed by Plot after all registrations)
  getMarkState: (id: string) => MarkState | undefined;

  // Pointer state for interactive marks (Tip, Crosshair)
  pointer: PointerState;

  // Callbacks for Framework integration
  dispatchValue?: (value: any) => void;
}

const defaultContext: PlotContextValue = {
  registerMark: () => {},
  unregisterMark: () => {},
  scales: null,
  scaleFunctions: null,
  dimensions: null,
  projection: null,
  className: "plot-d6a7b5",
  facets: undefined,
  facetTranslate: null,
  getMarkState: () => undefined,
  pointer: {x: null, y: null, active: false}
};

export const PlotContext = createContext<PlotContextValue>(defaultContext);

export function usePlotContext() {
  return useContext(PlotContext);
}

// Facet context: provided within a facet group to filter mark indices.
export interface FacetContextValue {
  facetIndex: number;
  fx: any;
  fy: any;
  fi: number;
}

export const FacetContext = createContext<FacetContextValue | null>(null);

export function useFacetContext() {
  return useContext(FacetContext);
}
