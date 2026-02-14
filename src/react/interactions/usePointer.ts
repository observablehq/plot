import {useState, useCallback, useRef, type RefObject} from "react";

export interface PointerState {
  x: number | null;
  y: number | null;
  active: boolean;
}

export interface UsePointerOptions {
  mode?: "xy" | "x" | "y";
}

// Hook for tracking pointer position relative to an SVG element.
export function usePointer(
  svgRef: RefObject<SVGSVGElement | null>,
  options: UsePointerOptions = {}
): PointerState & {
  onPointerMove: (event: React.PointerEvent) => void;
  onPointerLeave: () => void;
} {
  const [state, setState] = useState<PointerState>({x: null, y: null, active: false});
  const rafRef = useRef<number>(0);

  const onPointerMove = useCallback(
    (event: React.PointerEvent) => {
      const svg = svgRef.current;
      if (!svg) return;

      // Cancel any pending animation frame
      if (rafRef.current) cancelAnimationFrame(rafRef.current);

      rafRef.current = requestAnimationFrame(() => {
        const rect = svg.getBoundingClientRect();
        const x = event.clientX - rect.left;
        const y = event.clientY - rect.top;
        setState({x, y, active: true});
      });
    },
    [svgRef]
  );

  const onPointerLeave = useCallback(() => {
    if (rafRef.current) cancelAnimationFrame(rafRef.current);
    setState({x: null, y: null, active: false});
  }, []);

  return {...state, onPointerMove, onPointerLeave};
}

// Find the nearest data point to a given position.
export function findNearest(
  index: number[],
  values: Record<string, any>,
  px: number,
  py: number,
  mode: "xy" | "x" | "y" = "xy"
): number | null {
  const {x: X, y: Y} = values;
  if (!index.length) return null;

  let nearestI: number | null = null;
  let nearestDist = Infinity;

  for (const i of index) {
    const xi = X?.[i];
    const yi = Y?.[i];
    if (xi == null && yi == null) continue;

    let dist: number;
    if (mode === "x") {
      dist = xi != null ? Math.abs(xi - px) : Infinity;
    } else if (mode === "y") {
      dist = yi != null ? Math.abs(yi - py) : Infinity;
    } else {
      const dx = xi != null ? xi - px : 0;
      const dy = yi != null ? yi - py : 0;
      dist = dx * dx + dy * dy;
    }

    if (dist < nearestDist) {
      nearestDist = dist;
      nearestI = i;
    }
  }

  return nearestI;
}
