# Observable Plot → React Port: Implementation Plan

## 1. Analysis Summary

Observable Plot is a ~81-file JavaScript library implementing a grammar-of-graphics
visualization system. It renders SVG imperatively via D3 selections.

### Core architectural challenges for React:

| Current (Imperative)                          | Target (React/Declarative)                         |
|-----------------------------------------------|-----------------------------------------------------|
| `plot()` monolithic function                  | `<Plot>` component tree                             |
| D3 `selection.append().attr()` DOM building   | JSX `<circle cx={...} />`                           |
| Mark classes with `render()` → DOM node       | Mark components returning JSX                       |
| Mutable state maps (`stateByMark`)            | React Context + `useMemo`                           |
| Sequential pipeline in one function call      | Multi-phase render with context propagation         |
| `plot()` returns an SVG element               | `<Plot>` renders into the React tree                |

### What stays the same:

- **D3 scales** (d3-scale) — used as pure functions, no DOM involvement
- **D3 shapes** (d3-shape for line/area generators) — return path `d` strings
- **D3 geo** projections — pure coordinate transforms
- **Transform functions** (bin, stack, group, etc.) — pure data transforms
- **Channel/scale inference logic** — pure computation
- **Dimension calculation** — pure computation

---

## 2. Target React API

### 2.1 Basic Usage

```jsx
import { Plot, Dot, Line, BarY, AxisX, AxisY } from "@observablehq/plot";

function Chart({ data }) {
  return (
    <Plot width={640} height={400} color={{ scheme: "category10" }}>
      <Dot data={data} x="weight" y="height" fill="species" />
      <AxisX label="Weight (kg)" />
      <AxisY label="Height (cm)" />
    </Plot>
  );
}
```

### 2.2 With Transforms

```jsx
import { Plot, BarY, AxisX, AxisY } from "@observablehq/plot";
import { binX } from "@observablehq/plot/transforms";

function Histogram({ data }) {
  return (
    <Plot>
      <BarY data={data} {...binX({ y: "count" }, { x: "value" })} />
    </Plot>
  );
}
```

### 2.3 Faceting

```jsx
<Plot fx={{ domain: ["A", "B"] }}>
  <Dot data={data} x="x" y="y" fx="category" />
</Plot>
```

### 2.4 Interactions (Pointer/Tooltips)

```jsx
<Plot>
  <Dot data={data} x="x" y="y" tip />
  {/* or controlled: */}
  <Dot data={data} x="x" y="y" />
  <Tip data={data} x="x" y="y" pointer="xy" />
</Plot>
```

### 2.5 Legends

```jsx
<Plot>
  <Dot data={data} x="x" y="y" fill="species" />
  <Legend scale="color" />
</Plot>
```

### 2.6 Custom Render

```jsx
<Dot data={data} x="x" y="y"
  render={(index, scales, values, dimensions) => (
    <g>
      {index.map(i => (
        <circle key={i} cx={values.x[i]} cy={values.y[i]} r={3}
          onClick={() => handleClick(data[i])} />
      ))}
    </g>
  )}
/>
```

---

## 3. Component Architecture

```
<Plot>                          // Root: orchestrates scales, dimensions
  ├── PlotContext.Provider      // Provides scales, dimensions, projection
  ├── <style>                   // Scoped CSS
  ├── <defs>                    // Clip paths, patterns
  ├── <AxisX />                 // Implicit or explicit axis marks
  ├── <AxisY />
  ├── <FacetGroup>              // (conditional) facet wrapper
  │   ├── <g transform="...">  // Per-facet translation
  │   │   ├── <Dot />          // Mark components
  │   │   ├── <Line />
  │   │   └── ...
  │   └── ...
  └── <Dot />                   // Non-faceted marks
```

### 3.1 Key Components

| Component      | Responsibility                                    |
|----------------|---------------------------------------------------|
| `<Plot>`       | Collect children, compute scales/dims, render SVG |
| `<Dot>`        | Register channels, render circles/paths           |
| `<Line>`       | Register channels, render grouped paths           |
| `<BarX/BarY>`  | Register channels, render rects                   |
| `<Rect>`       | Register channels, render rects                   |
| `<Area>`       | Register channels, render area paths              |
| `<Rule>`       | Register channels, render lines                   |
| `<Text>`       | Register channels, render text elements           |
| `<AxisX/Y>`    | Render tick marks and labels                      |
| `<Frame>`      | Render plot frame                                 |
| `<Tip>`        | Render tooltips                                   |
| `<Legend>`      | Render color/symbol/opacity legends              |
| `<FacetGroup>` | Manage facet layout and translation               |

---

## 4. Internal Architecture: The Two-Phase Render

The fundamental challenge is that Observable Plot's pipeline is **sequential and
interdependent**: scales depend on all marks' channels, and marks depend on
computed scales. In React, children can't easily communicate upward before
rendering.

### Solution: Two-phase rendering pattern

**Phase 1 — Collection (invisible):** Each mark child calls a registration
function (via context) during render, declaring its data, channels, and
transform requirements. The `<Plot>` component collects these declarations.

**Phase 2 — Rendering (visible):** After all marks have registered, `<Plot>`
computes scales, dimensions, and projections, then provides them via context.
Marks read computed values from context and return their SVG JSX.

#### Implementation approach: `useLayoutEffect` + state

```
Render 1: <Plot> renders children in "registration mode"
  → Each mark registers channel specs via context callback
  → useLayoutEffect fires: Plot computes scales from collected channels
  → setState triggers re-render

Render 2: <Plot> renders children in "render mode" with computed scales
  → Each mark reads scales from context and returns SVG elements
```

This is a well-established React pattern (used by Recharts, Victory, visx).

---

## 5. Context Design

### 5.1 PlotContext (registration phase)

```ts
interface PlotRegistration {
  registerMark(id: string, spec: MarkSpec): void;
  unregisterMark(id: string): void;
  phase: "register" | "render";
}
```

### 5.2 PlotScalesContext (render phase)

```ts
interface PlotScales {
  scales: Record<string, ScaleFunction>;
  dimensions: Dimensions;
  projection: Projection | null;
  className: string;
  facets: Facet[] | undefined;
}
```

### 5.3 FacetContext (within faceted rendering)

```ts
interface FacetContext {
  facetIndex: number;
  fx: any;
  fy: any;
  translate: { x: number; y: number };
}
```

---

## 6. File Structure

```
src/
├── react/
│   ├── index.ts                    # Public exports
│   ├── Plot.tsx                    # Root <Plot> component
│   ├── PlotContext.ts              # React contexts
│   ├── usePlotScales.ts           # Hook: compute scales from registrations
│   ├── useChannels.ts             # Hook: create channels from mark props
│   ├── useMark.ts                 # Hook: register mark + get scaled values
│   │
│   ├── marks/
│   │   ├── Dot.tsx
│   │   ├── Line.tsx
│   │   ├── Area.tsx
│   │   ├── Bar.tsx                # BarX, BarY
│   │   ├── Rect.tsx               # Rect, Cell
│   │   ├── Rule.tsx               # RuleX, RuleY
│   │   ├── Tick.tsx               # TickX, TickY
│   │   ├── Text.tsx
│   │   ├── Link.tsx
│   │   ├── Arrow.tsx
│   │   ├── Image.tsx
│   │   ├── Vector.tsx
│   │   ├── Frame.tsx
│   │   ├── Geo.tsx
│   │   ├── Density.tsx
│   │   ├── Contour.tsx
│   │   ├── Delaunay.tsx
│   │   ├── Raster.tsx
│   │   ├── Waffle.tsx
│   │   ├── Box.tsx
│   │   ├── Hexgrid.tsx
│   │   └── Axis.tsx               # AxisX, AxisY, GridX, GridY
│   │
│   ├── legends/
│   │   ├── Legend.tsx
│   │   ├── Ramp.tsx
│   │   └── Swatches.tsx
│   │
│   ├── interactions/
│   │   ├── Tip.tsx
│   │   ├── Crosshair.tsx
│   │   └── usePointer.ts          # Pointer interaction hook
│   │
│   └── facets/
│       └── FacetGroup.tsx
│
├── core/                           # Reused pure logic (extracted from src/)
│   ├── channel.ts                  # Channel creation, inference (from channel.js)
│   ├── scales.ts                   # Scale creation (from scales.js)
│   ├── dimensions.ts               # Dimension computation (from dimensions.js)
│   ├── facet.ts                    # Facet logic (from facet.js)
│   ├── projection.ts               # Projection support (from projection.js)
│   ├── style.ts                    # Style defaults/inference (from style.js)
│   ├── transforms/                 # All transform functions (unchanged)
│   │   ├── bin.ts
│   │   ├── stack.ts
│   │   ├── group.ts
│   │   ├── dodge.ts
│   │   ├── normalize.ts
│   │   ├── window.ts
│   │   ├── select.ts
│   │   ├── map.ts
│   │   ├── hexbin.ts
│   │   └── ...
│   ├── scales/                     # Scale implementations (unchanged)
│   │   ├── quantitative.ts
│   │   ├── ordinal.ts
│   │   ├── temporal.ts
│   │   ├── diverging.ts
│   │   └── schemes.ts
│   └── utils/                      # Shared utilities
│       ├── options.ts
│       ├── defined.ts
│       ├── format.ts
│       ├── curve.ts
│       ├── symbol.ts
│       ├── marker.ts
│       └── ...
```

---

## 7. Implementation Steps

### Step 1: Project Setup

- Add React 18+, TypeScript, and JSX support to the build
- Create `src/react/` and `src/core/` directory structure
- Configure dual exports: `@observablehq/plot` (legacy) and
  `@observablehq/plot/react`

### Step 2: Extract Pure Core Logic

Extract non-DOM code from existing modules into `src/core/`:

- `channel.js` → `core/channel.ts` (remove D3 selection references)
- `scales.js` → `core/scales.ts` (already pure)
- `dimensions.js` → `core/dimensions.ts` (already pure)
- `facet.js` → `core/facet.ts` (already pure)
- `projection.js` → `core/projection.ts` (already pure)
- `style.js` → `core/style.ts` (extract style defaults; remove D3 selection
  application)
- All transforms → `core/transforms/` (already pure data transforms)
- All scale implementations → `core/scales/` (already pure)

This step is low-risk since these modules are already mostly pure functions.

### Step 3: Implement PlotContext and Registration

Create the context system:

- `PlotContext.ts`: Define `PlotRegistrationContext` and `PlotScalesContext`
- Registration protocol: marks call `registerMark()` with their channel specs
- The Plot component collects registrations and triggers scale computation

### Step 4: Implement `<Plot>` Component

The root orchestrator:

1. Renders children in registration phase (hidden)
2. Collects mark registrations
3. Computes scales, dimensions, projections via `useMemo`
4. Infers implicit axes
5. Provides computed values via context
6. Renders SVG wrapper with styles

Key decisions:
- Use `useRef` + `useLayoutEffect` for the two-phase approach
- Or: use a synchronous registration pattern where marks register during
  render (safer for concurrent mode)

### Step 5: Implement `useMark` Hook

Shared hook used by all mark components:

```ts
function useMark(data, channelSpecs, options) {
  const { phase, registerMark, scales, dimensions } = usePlotContext();

  // Phase 1: register channels
  useEffect(() => {
    registerMark(id, { data, channels: channelSpecs, transform, ... });
    return () => unregisterMark(id);
  }, [data, channelSpecs]);

  // Phase 2: compute scaled values
  const values = useMemo(() => {
    if (!scales) return null;
    return computeScaledValues(data, channelSpecs, scales);
  }, [scales, data, channelSpecs]);

  return { values, dimensions, scales, index };
}
```

### Step 6: Implement Core Mark Components

Port each mark's `render()` method from D3 selections to JSX. Example for Dot:

**Current** (`src/marks/dot.js`):
```js
render(index, scales, channels, dimensions, context) {
  return create("svg:g", context)
    .call(applyIndirectStyles, this, dimensions, context)
    .call(g => g.selectAll().data(index).enter()
      .append("circle")
      .attr("cx", i => X[i])
      .attr("cy", i => Y[i])
      .attr("r", i => R[i])
      .call(applyChannelStyles, this, channels))
    .node();
}
```

**React** (`src/react/marks/Dot.tsx`):
```tsx
function Dot({ data, x, y, r, fill, stroke, ...options }) {
  const { values, index, dimensions, scales } = useMark(data, {
    x: { value: x, scale: "x", optional: true },
    y: { value: y, scale: "y", optional: true },
    r: { value: r, scale: "r", optional: true },
  }, options);

  if (!values) return null; // registration phase

  const [cx, cy] = applyFrameAnchor(options, dimensions);
  const { x: X, y: Y, r: R, fill: F, stroke: S } = values;

  return (
    <g {...indirectStyles(options, dimensions)}>
      {index.map(i => (
        <circle
          key={i}
          cx={X ? X[i] : cx}
          cy={Y ? Y[i] : cy}
          r={R ? R[i] : options.r ?? 3}
          fill={F?.[i]}
          stroke={S?.[i]}
          {...channelStyles(i, values)}
        />
      ))}
    </g>
  );
}
```

Priority order for mark implementation:
1. **Dot** — simplest, most common
2. **Line** — introduces grouping (z channel)
3. **BarY/BarX** — introduces stacking/intervals
4. **Rect/Cell** — rectangle marks
5. **Rule** — simple lines
6. **Text** — text rendering
7. **Area** — area paths
8. **Axis** (X, Y, Fx, Fy) + Grid — critical for usability
9. **Frame** — plot frame
10. **Tip** — tooltips/interactions
11. **Arrow, Link, Vector, Tick** — straightforward marks
12. **Image, Waffle, Box** — specialized marks
13. **Geo, Density, Contour, Delaunay, Raster, Hexgrid** — complex marks

### Step 7: Implement Axis Components

Axes are "implicit marks" in the current system — auto-generated based on
scales. In React, two approaches:

**Option A (recommended):** Auto-insert axes as the current library does, via
the `<Plot>` component. If no explicit `<AxisX>` child is found, Plot
renders one.

**Option B:** Require explicit axis components (simpler, more React-like, but
breaking API change).

We'll go with Option A to match the current behavior, with Option B available.

### Step 8: Implement Faceting

Faceting requires:
1. `<Plot>` detects `fx`/`fy` channels from registered marks
2. Creates facet scales (always band scales)
3. Renders a `<FacetGroup>` that iterates over facet domains
4. Each facet cell gets a translated `<g>` containing the marks
5. Marks receive filtered data indices per facet

### Step 9: Implement Legends

Legends can be either:
- Auto-generated by `<Plot>` (current behavior)
- Explicitly placed via `<Legend scale="color" />` component

Both should be supported. The Legend component reads scale info from context.

### Step 10: Implement Interactions

- `usePointer` hook: tracks mouse/touch position relative to SVG
- `<Tip>` component: renders tooltip based on nearest data point
- `<Crosshair>` component: renders crosshair lines
- Event dispatch for `viewof` compatibility (Observable notebooks)

### Step 11: TypeScript Types

Create comprehensive prop types for all components:

```ts
interface DotProps<T = any> {
  data?: Iterable<T>;
  x?: ChannelValue<T>;
  y?: ChannelValue<T>;
  r?: ChannelValue<T> | number;
  fill?: ChannelValue<T> | string;
  stroke?: ChannelValue<T> | string;
  symbol?: ChannelValue<T> | SymbolType;
  tip?: boolean | TipOptions;
  // ... all mark options
}
```

### Step 12: Testing

- Port snapshot tests: render React components to SVG strings and compare
- Unit test hooks and context system
- Integration tests for full plot rendering
- Use React Testing Library + jsdom

---

## 8. Key Design Decisions

### 8.1 D3 selections → JSX mapping

| D3 Pattern                              | React Equivalent                                    |
|-----------------------------------------|-----------------------------------------------------|
| `selection.data(arr).enter().append()`  | `{arr.map(i => <element key={i} />)}`              |
| `selection.attr("cx", i => X[i])`      | `cx={X[i]}` on each element                        |
| `selection.call(fn)`                    | Direct function call or component composition       |
| `selection.selectAll().data().join()`   | `{data.map(...)}`                                   |
| `create("svg:g", context)`             | `<g>`                                               |
| `applyIndirectStyles(sel, mark, ...)`   | `<g {...indirectStyles(mark, ...)}>`               |
| `applyChannelStyles(sel, mark, ch)`     | spread per-element: `{...channelStyles(i, ch)}`    |

### 8.2 Grouped marks (Line, Area)

Lines and areas group data by z/fill/stroke channels. In React:

```tsx
function Line({ data, x, y, z, curve, ...options }) {
  const { values, groups } = useMark(data, channels, options);
  if (!values) return null;
  const { x: X, y: Y } = values;
  const lineGen = d3.line().curve(curve).x(i => X[i]).y(i => Y[i]);

  return (
    <g {...indirectStyles(options)}>
      {groups.map((group, j) => (
        <path key={j} d={lineGen(group)} {...groupStyles(group[0], values)} />
      ))}
    </g>
  );
}
```

### 8.3 Transforms remain as functions, not hooks

Transforms (bin, stack, group, etc.) are pure data transforms. They should
remain as composable functions, not hooks:

```tsx
// Good: transforms as props/spread
<BarY data={data} {...binX({ y: "count" }, { x: "value" })} />

// Not: transforms as hooks (wrong abstraction level)
const binned = useBin(data, { x: "value" }); // ❌
```

This preserves composability and matches the existing API semantics.

### 8.4 Style application

Replace D3 `applyAttr`/`applyStyle` calls with a utility that returns a
props object:

```ts
function indirectStyleProps(mark, dimensions, context) {
  return {
    fill: mark.fill,
    fillOpacity: mark.fillOpacity,
    stroke: mark.stroke,
    strokeWidth: mark.strokeWidth,
    // ...
  };
}

function channelStyleProps(i, values) {
  return {
    ...(values.fill && { fill: values.fill[i] }),
    ...(values.stroke && { stroke: values.stroke[i] }),
    // ...
  };
}
```

### 8.5 Clip paths and patterns

These require `<defs>` in SVG. The `<Plot>` component manages a shared
`<defs>` section. Marks that need clips register their requirements via
context, and Plot renders the necessary `<clipPath>` elements.

### 8.6 Performance considerations

- **`useMemo` aggressively** on scale computation and data transforms
- **Virtualize large datasets** — for 10k+ points, consider only rendering
  visible elements
- **`React.memo`** on mark components to prevent unnecessary re-renders
- **Keys on SVG elements** — use data index as key for efficient reconciliation

---

## 9. Migration Path

The React version will be a **separate export** so both APIs coexist:

```js
// Existing imperative API (unchanged)
import * as Plot from "@observablehq/plot";
const svg = Plot.plot({ marks: [Plot.dot(data, { x: "a", y: "b" })] });

// New React API
import { Plot, Dot } from "@observablehq/plot/react";
<Plot><Dot data={data} x="a" y="b" /></Plot>
```

The shared `core/` modules ensure both APIs stay in sync.

---

## 10. Observable Framework Considerations

This port is part of a broader effort to also port **Observable Framework** to
React. This affects several design decisions:

### 10.1 Reactivity Model

Observable Framework uses Observable's reactive runtime (`viewof`, cell
dependencies, `Inputs.bind`). In React:

- **Observable cells** → React state (`useState`, `useReducer`)
- **`viewof` pattern** → Controlled components with `value`/`onChange` props
- **Cell dependencies** → Component props / context / derived state (`useMemo`)

Plot components must expose clean **callback props** for Framework integration:

```tsx
<Plot onPointerMove={handlePointer} onSelect={handleSelection}>
  <Dot data={data} x="x" y="y"
    onClick={(event, datum) => setSelected(datum)}
    onPointerEnter={(event, datum) => setHovered(datum)}
  />
</Plot>
```

### 10.2 Data Loaders

Framework's data loaders (`FileAttachment`, `DuckDB`, SQL cells) would become
React patterns. Plot must accept data purely via props:

```tsx
// Framework's data loader → React hook
const data = useDataLoader("data/weather.csv", { typed: true });

// Plot is a pure consumer — no opinion on loading
<Plot>
  <Suspense fallback={<PlotSkeleton />}>
    <Line data={data} x="date" y="temperature" />
  </Suspense>
</Plot>
```

### 10.3 SSR Compatibility

Framework does server-side rendering. All React Plot components must be
**SSR-safe**:

- No `window`/`document` access during render (only in `useEffect`)
- Support React Server Components where possible (marks are mostly pure)
- Hydration-safe: server and client must produce identical SVG

### 10.4 Layout Integration

Framework's dashboard layout (cards, grids, sidebars) would become React
layout components. Plot should work seamlessly within these:

```tsx
<DashboardGrid>
  <Card title="Sales">
    <Plot>
      <BarY data={sales} x="month" y="revenue" />
    </Plot>
  </Card>
  <Card title="Users">
    <Plot>
      <Line data={users} x="date" y="count" />
    </Plot>
  </Card>
</DashboardGrid>
```

### 10.5 Responsive/Auto-sizing

Framework auto-sizes plots to their container. The React Plot should support:

```tsx
// Auto-size to container (via ResizeObserver)
<Plot width="auto" height={400}>...</Plot>

// Or via a hook
const { width } = useContainerSize(containerRef);
<Plot width={width}>...</Plot>
```

### 10.6 Theme System

Framework has light/dark theme support. Plot components should respect a
theme context:

```tsx
<PlotTheme mode="dark" colors={{ background: "#1a1a1a" }}>
  <Plot>...</Plot>
</PlotTheme>
```

---

## 11. What NOT to Port

Some Observable-specific features may be deferred or dropped:

- `mark.plot()` fluent method — not idiomatic React
- `figure.value` / `dispatchEvent` — Observable notebook specific
- Auto-wrapping in `<figure>` with `<h2>` title — use React composition instead
- The `Render` class (function-as-mark) — replaced by custom render prop
