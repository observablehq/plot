// @ts-nocheck — React component tests; modules lack type declarations
import React from "react";
import {renderToStaticMarkup} from "react-dom/server";
import assert from "assert";
import {findNearest} from "../src/react/interactions/usePointer.js";
import {formatTip} from "../src/react/interactions/Tip.js";
import {Plot} from "../src/react/Plot.js";
import {Dot, DotX, DotY} from "../src/react/marks/Dot.js";
import {Line, LineX, LineY} from "../src/react/marks/Line.js";
import {Area, AreaX, AreaY} from "../src/react/marks/Area.js";
import {BarX, BarY} from "../src/react/marks/Bar.js";
import {Rect, Cell, CellX, CellY, RectX, RectY} from "../src/react/marks/Rect.js";
import {RuleX, RuleY} from "../src/react/marks/Rule.js";
import {Text, TextX, TextY} from "../src/react/marks/Text.js";
import {Frame} from "../src/react/marks/Frame.js";
import {TickX, TickY} from "../src/react/marks/Tick.js";
import {AxisX, AxisY, GridX, GridY} from "../src/react/marks/Axis.js";
import {Vector, VectorX, VectorY, Spike} from "../src/react/marks/Vector.js";
import {
  indirectStyleProps,
  directStyleProps,
  channelStyleProps,
  groupChannelStyleProps,
  computeTransform,
  computeFrameAnchor,
  resolveStyles
} from "../src/react/styles.js";

// --- Utility function tests ---

describe("findNearest", () => {
  it("returns null for an empty index", () => {
    assert.strictEqual(findNearest([], {x: [], y: []}, 50, 50), null);
  });

  it("finds nearest point in xy mode", () => {
    const index = [0, 1, 2];
    const values = {x: [10, 50, 90], y: [10, 50, 90]};
    assert.strictEqual(findNearest(index, values, 48, 52, "xy"), 1);
  });

  it("finds nearest point in x mode", () => {
    const index = [0, 1, 2];
    const values = {x: [10, 50, 90], y: [10, 50, 90]};
    // In x mode, only x distance matters; closest x to 12 is 10 (index 0)
    assert.strictEqual(findNearest(index, values, 12, 999, "x"), 0);
  });

  it("finds nearest point in y mode", () => {
    const index = [0, 1, 2];
    const values = {x: [10, 50, 90], y: [10, 50, 90]};
    // In y mode, only y distance matters; closest y to 88 is 90 (index 2)
    assert.strictEqual(findNearest(index, values, 0, 88, "y"), 2);
  });

  it("skips null values", () => {
    const index = [0, 1, 2];
    const values = {x: [null, 50, null], y: [null, 50, null]};
    assert.strictEqual(findNearest(index, values, 0, 0, "xy"), 1);
  });

  it("handles single-element index", () => {
    const index = [0];
    const values = {x: [100], y: [200]};
    assert.strictEqual(findNearest(index, values, 0, 0, "xy"), 0);
  });
});

describe("formatTip", () => {
  it("returns empty array for null datum", () => {
    assert.deepStrictEqual(formatTip(null), []);
  });

  it("returns empty array for undefined datum", () => {
    assert.deepStrictEqual(formatTip(undefined), []);
  });

  it("formats a scalar datum", () => {
    const lines = formatTip(42);
    assert.strictEqual(lines.length, 1);
    assert.ok(lines[0].includes("42"));
  });

  it("formats an object datum with all keys", () => {
    const lines = formatTip({a: 1, b: "hello", c: null});
    // c is null so should be excluded
    assert.strictEqual(lines.length, 2);
    assert.ok(lines[0].includes("a"));
    assert.ok(lines[1].includes("hello"));
  });

  it("formats an object datum with specified channels", () => {
    const lines = formatTip({a: 1, b: 2, c: 3}, ["a", "c"]);
    assert.strictEqual(lines.length, 2);
    assert.ok(lines[0].includes("a"));
    assert.ok(lines[1].includes("c"));
  });
});

// --- Style utility function tests ---

describe("Style utilities", () => {
  describe("indirectStyleProps", () => {
    it("returns empty object for empty mark options", () => {
      const props = indirectStyleProps({});
      assert.deepStrictEqual(props, {});
    });

    it("maps known style properties", () => {
      const props = indirectStyleProps({
        fill: "red",
        stroke: "blue",
        strokeWidth: 2,
        ariaLabel: "dots"
      });
      assert.strictEqual(props.fill, "red");
      assert.strictEqual(props.stroke, "blue");
      assert.strictEqual(props.strokeWidth, 2);
      assert.strictEqual(props["aria-label"], "dots");
    });

    it("includes stroke dash properties", () => {
      const props = indirectStyleProps({
        strokeDasharray: "5,3",
        strokeDashoffset: "2",
        strokeLinecap: "round",
        strokeLinejoin: "bevel"
      });
      assert.strictEqual(props.strokeDasharray, "5,3");
      assert.strictEqual(props.strokeDashoffset, "2");
      assert.strictEqual(props.strokeLinecap, "round");
      assert.strictEqual(props.strokeLinejoin, "bevel");
    });

    it("skips null/undefined values", () => {
      const props = indirectStyleProps({fill: null, stroke: undefined, className: "my-class"});
      assert.ok(!("fill" in props));
      assert.ok(!("stroke" in props));
      assert.strictEqual(props.className, "my-class");
    });
  });

  describe("directStyleProps", () => {
    it("returns empty object for normal mark options", () => {
      const props = directStyleProps({});
      assert.deepStrictEqual(props, {});
    });

    it("includes mixBlendMode when not normal", () => {
      const props = directStyleProps({mixBlendMode: "multiply"});
      assert.ok(props.style);
      assert.strictEqual(props.style.mixBlendMode, "multiply");
    });

    it("excludes mixBlendMode when normal", () => {
      const props = directStyleProps({mixBlendMode: "normal"});
      assert.ok(!props.style);
    });

    it("includes opacity", () => {
      const props = directStyleProps({opacity: 0.5});
      assert.strictEqual(props.opacity, 0.5);
    });
  });

  describe("channelStyleProps", () => {
    it("returns empty object when no channel values", () => {
      const props = channelStyleProps(0, {});
      assert.deepStrictEqual(props, {});
    });

    it("extracts indexed values from channels", () => {
      const values = {
        fill: ["red", "green", "blue"],
        stroke: ["black", "white", "gray"]
      };
      const props = channelStyleProps(1, values);
      assert.strictEqual(props.fill, "green");
      assert.strictEqual(props.stroke, "white");
    });

    it("handles opacity and strokeWidth channels", () => {
      const values = {
        opacity: [0.1, 0.5, 1.0],
        strokeWidth: [1, 2, 3]
      };
      const props = channelStyleProps(2, values);
      assert.strictEqual(props.opacity, 1.0);
      assert.strictEqual(props.strokeWidth, 3);
    });
  });

  describe("groupChannelStyleProps", () => {
    it("uses first index of group", () => {
      const values = {fill: ["red", "green", "blue"]};
      const props = groupChannelStyleProps([1, 2], values);
      assert.strictEqual(props.fill, "green");
    });
  });

  describe("computeTransform", () => {
    it("returns undefined when no offset needed", () => {
      assert.strictEqual(computeTransform({}, {}), undefined);
    });

    it("returns translate for dx/dy", () => {
      assert.strictEqual(computeTransform({dx: 5, dy: 10}, {}), "translate(5,10)");
    });

    it("includes bandwidth offset for band scales", () => {
      const scales = {x: Object.assign((v: any) => v, {bandwidth: () => 20})};
      const result = computeTransform({dx: 0, dy: 0}, scales);
      assert.strictEqual(result, "translate(10,0)");
    });
  });

  describe("computeFrameAnchor", () => {
    const dims = {width: 640, height: 400, marginTop: 20, marginRight: 20, marginBottom: 30, marginLeft: 40};

    it("centers by default", () => {
      const [x, y] = computeFrameAnchor(undefined, dims);
      assert.strictEqual(x, (40 + 640 - 20) / 2);
      assert.strictEqual(y, (20 + 400 - 30) / 2);
    });

    it("anchors to top-left", () => {
      const [x, y] = computeFrameAnchor("top-left", dims);
      assert.strictEqual(x, 40);
      assert.strictEqual(y, 20);
    });

    it("anchors to bottom-right", () => {
      const [x, y] = computeFrameAnchor("bottom-right", dims);
      assert.strictEqual(x, 620);
      assert.strictEqual(y, 370);
    });
  });

  describe("resolveStyles", () => {
    it("resolves with defaults", () => {
      const resolved = resolveStyles({}, {fill: "currentColor", stroke: "none"});
      assert.strictEqual(resolved.fill, undefined); // "currentColor" is the implied default
      assert.strictEqual(resolved.stroke, undefined); // "none" is the implied default
    });

    it("resolves explicit values", () => {
      const resolved = resolveStyles(
        {fill: "red", stroke: "blue", strokeWidth: 3},
        {fill: "currentColor", stroke: "none"}
      );
      assert.strictEqual(resolved.fill, "red");
      assert.strictEqual(resolved.stroke, "blue");
      assert.strictEqual(resolved.strokeWidth, 3);
    });
  });
});

// --- React component rendering tests ---
// These use renderToStaticMarkup which doesn't require a DOM.

describe("React Plot components", () => {
  it("exports Plot component", () => {
    assert.strictEqual(typeof Plot, "function");
  });

  it("exports mark components", () => {
    assert.strictEqual(typeof Dot, "function");
    assert.strictEqual(typeof DotX, "function");
    assert.strictEqual(typeof DotY, "function");
    assert.strictEqual(typeof Line, "function");
    assert.strictEqual(typeof LineX, "function");
    assert.strictEqual(typeof LineY, "function");
    assert.strictEqual(typeof Area, "function");
    assert.strictEqual(typeof AreaX, "function");
    assert.strictEqual(typeof AreaY, "function");
    assert.strictEqual(typeof BarX, "function");
    assert.strictEqual(typeof BarY, "function");
    assert.strictEqual(typeof Rect, "function");
    assert.strictEqual(typeof Cell, "function");
    assert.strictEqual(typeof CellX, "function");
    assert.strictEqual(typeof CellY, "function");
    assert.strictEqual(typeof RectX, "function");
    assert.strictEqual(typeof RectY, "function");
    assert.strictEqual(typeof RuleX, "function");
    assert.strictEqual(typeof RuleY, "function");
    assert.strictEqual(typeof Text, "function");
    assert.strictEqual(typeof TextX, "function");
    assert.strictEqual(typeof TextY, "function");
    assert.strictEqual(typeof Frame, "function");
    assert.strictEqual(typeof TickX, "function");
    assert.strictEqual(typeof TickY, "function");
    assert.strictEqual(typeof AxisX, "function");
    assert.strictEqual(typeof AxisY, "function");
    assert.strictEqual(typeof GridX, "function");
    assert.strictEqual(typeof GridY, "function");
    assert.strictEqual(typeof Vector, "function");
    assert.strictEqual(typeof VectorX, "function");
    assert.strictEqual(typeof VectorY, "function");
    assert.strictEqual(typeof Spike, "function");
  });

  it("renders an empty Plot as an SVG", () => {
    const html = renderToStaticMarkup(React.createElement(Plot, {width: 200, height: 100}));
    assert.ok(html.includes("<svg"));
    assert.ok(html.includes('width="200"'));
    assert.ok(html.includes('height="100"'));
    assert.ok(html.includes("</svg>"));
  });

  it("renders Plot with default dimensions", () => {
    const html = renderToStaticMarkup(React.createElement(Plot));
    assert.ok(html.includes("<svg"));
    assert.ok(html.includes('width="640"'));
  });

  it("renders Plot with aria attributes", () => {
    const html = renderToStaticMarkup(React.createElement(Plot, {ariaLabel: "test chart", ariaDescription: "a test"}));
    assert.ok(html.includes('aria-label="test chart"'));
    assert.ok(html.includes('aria-description="a test"'));
  });

  it("renders Plot with title (figure wrapping)", () => {
    const html = renderToStaticMarkup(React.createElement(Plot, {title: "My Chart", width: 300, height: 200}));
    assert.ok(html.includes("<figure"));
    assert.ok(html.includes("My Chart"));
    assert.ok(html.includes("<h2"));
    assert.ok(html.includes("<svg"));
  });

  it("renders Plot with subtitle and caption", () => {
    const html = renderToStaticMarkup(
      React.createElement(Plot, {
        title: "Title",
        subtitle: "Subtitle text",
        caption: "Source: test data"
      })
    );
    assert.ok(html.includes("<figure"));
    assert.ok(html.includes("Subtitle text"));
    assert.ok(html.includes("Source: test data"));
    assert.ok(html.includes("<h3"));
    assert.ok(html.includes("<figcaption"));
  });

  it("does not render figure without title/subtitle/caption", () => {
    const html = renderToStaticMarkup(React.createElement(Plot));
    assert.ok(!html.includes("<figure"));
  });

  it("renders Plot with figure=true even without title", () => {
    const html = renderToStaticMarkup(React.createElement(Plot, {figure: true}));
    assert.ok(html.includes("<figure"));
  });

  it("renders Plot with embedded CSS styles", () => {
    const html = renderToStaticMarkup(React.createElement(Plot));
    assert.ok(html.includes("<style>"));
    assert.ok(html.includes("--plot-background"));
  });

  it("renders Plot with custom className", () => {
    const html = renderToStaticMarkup(React.createElement(Plot, {className: "my-chart"}));
    // The className is processed by maybeClassName, but the SVG should have a class
    assert.ok(html.includes("<svg"));
    assert.ok(html.includes("class="));
  });

  // NOTE: The Plot component uses a two-phase render pattern (registration → scale
  // computation → mark rendering). SSR with renderToStaticMarkup only executes the
  // first render pass, so marks register but don't produce SVG output. These tests
  // verify that the SSR shell renders correctly; full mark rendering requires
  // client-side hydration.

  it("renders Plot with marks without errors (SSR shell)", () => {
    const data = [
      {x: 1, y: 2},
      {x: 3, y: 4}
    ];
    const html = renderToStaticMarkup(
      React.createElement(Plot, {width: 200, height: 200}, React.createElement(Dot, {data, x: "x", y: "y"}))
    );
    assert.ok(html.includes("<svg"));
    assert.ok(html.includes('width="200"'));
    assert.ok(html.includes("</svg>"));
  });

  it("renders Plot with Line mark without errors (SSR shell)", () => {
    const data = [
      {x: 0, y: 0},
      {x: 1, y: 1},
      {x: 2, y: 4}
    ];
    const html = renderToStaticMarkup(
      React.createElement(Plot, {width: 200, height: 200}, React.createElement(Line, {data, x: "x", y: "y"}))
    );
    assert.ok(html.includes("<svg"));
    assert.ok(html.includes("</svg>"));
  });

  it("renders Plot with AreaY mark without errors (SSR shell)", () => {
    const data = [
      {x: 0, y: 0},
      {x: 1, y: 1},
      {x: 2, y: 4}
    ];
    const html = renderToStaticMarkup(
      React.createElement(Plot, {width: 200, height: 200}, React.createElement(AreaY, {data, x: "x", y: "y"}))
    );
    assert.ok(html.includes("<svg"));
  });

  it("renders Plot with BarY mark without errors (SSR shell)", () => {
    const data = [
      {x: "a", y: 10},
      {x: "b", y: 20}
    ];
    const html = renderToStaticMarkup(
      React.createElement(
        Plot,
        {width: 200, height: 200, x: {type: "band"}},
        React.createElement(BarY, {data, x: "x", y: "y"})
      )
    );
    assert.ok(html.includes("<svg"));
    assert.ok(html.includes("</svg>"));
  });

  it("renders Plot with RuleX without errors (SSR shell)", () => {
    const html = renderToStaticMarkup(
      React.createElement(
        Plot,
        {width: 200, height: 200},
        React.createElement(RuleX, {data: [50], x: (d: number) => d})
      )
    );
    assert.ok(html.includes("<svg"));
  });

  it("renders Plot with Text mark without errors (SSR shell)", () => {
    const data = [{x: 1, y: 2, label: "hi"}];
    const html = renderToStaticMarkup(
      React.createElement(
        Plot,
        {width: 200, height: 200},
        React.createElement(Text, {data, x: "x", y: "y", text: "label"})
      )
    );
    assert.ok(html.includes("<svg"));
  });

  it("renders Plot with Frame without errors (SSR shell)", () => {
    const html = renderToStaticMarkup(React.createElement(Plot, {width: 200, height: 200}, React.createElement(Frame)));
    assert.ok(html.includes("<svg"));
    // Frame reads dimensions from context; during SSR with no data marks,
    // dimensions are null so Frame returns null. This is expected.
    assert.ok(html.includes("</svg>"));
  });

  it("renders Plot with explicit AxisX/AxisY without errors (SSR shell)", () => {
    const data = [
      {x: 0, y: 0},
      {x: 10, y: 10}
    ];
    const html = renderToStaticMarkup(
      React.createElement(
        Plot,
        {width: 300, height: 200},
        React.createElement(Dot, {data, x: "x", y: "y"}),
        React.createElement(AxisX),
        React.createElement(AxisY)
      )
    );
    assert.ok(html.includes("<svg"));
    assert.ok(html.includes("</svg>"));
  });

  it("renders Plot with multiple marks without errors (SSR shell)", () => {
    const data = [
      {x: 0, y: 0},
      {x: 5, y: 5},
      {x: 10, y: 10}
    ];
    const html = renderToStaticMarkup(
      React.createElement(
        Plot,
        {width: 300, height: 200},
        React.createElement(Dot, {data, x: "x", y: "y"}),
        React.createElement(Line, {data, x: "x", y: "y"})
      )
    );
    assert.ok(html.includes("<svg"));
    assert.ok(html.includes("</svg>"));
  });

  it("renders Frame with insets without errors (SSR shell)", () => {
    // Frame depends on dimensions from context; without data marks to trigger
    // scale computation, it renders as null during SSR. Verify no errors.
    const html = renderToStaticMarkup(
      React.createElement(Plot, {width: 200, height: 200}, React.createElement(Frame, {inset: 5, stroke: "red"}))
    );
    assert.ok(html.includes("<svg"));
  });

  it("renders Frame with custom stroke and fill without errors (SSR shell)", () => {
    const html = renderToStaticMarkup(
      React.createElement(
        Plot,
        {width: 200, height: 200},
        React.createElement(Frame, {fill: "lightgray", fillOpacity: 0.5, stroke: "black", strokeWidth: 2})
      )
    );
    assert.ok(html.includes("<svg"));
  });
});

// --- Index re-exports test ---

describe("React index re-exports", () => {
  it("exports all expected mark components", async () => {
    const mod = await import("../src/react/index.js");
    // Marks
    assert.ok(mod.Plot);
    assert.ok(mod.Dot);
    assert.ok(mod.DotX);
    assert.ok(mod.DotY);
    assert.ok(mod.Circle);
    assert.ok(mod.Hexagon);
    assert.ok(mod.Line);
    assert.ok(mod.LineX);
    assert.ok(mod.LineY);
    assert.ok(mod.Area);
    assert.ok(mod.AreaX);
    assert.ok(mod.AreaY);
    assert.ok(mod.BarX);
    assert.ok(mod.BarY);
    assert.ok(mod.Rect);
    assert.ok(mod.Cell);
    assert.ok(mod.CellX);
    assert.ok(mod.CellY);
    assert.ok(mod.RectX);
    assert.ok(mod.RectY);
    assert.ok(mod.RuleX);
    assert.ok(mod.RuleY);
    assert.ok(mod.Text);
    assert.ok(mod.TextX);
    assert.ok(mod.TextY);
    assert.ok(mod.Frame);
    assert.ok(mod.TickX);
    assert.ok(mod.TickY);
    assert.ok(mod.Link);
    assert.ok(mod.Arrow);
    assert.ok(mod.Vector);
    assert.ok(mod.VectorX);
    assert.ok(mod.VectorY);
    assert.ok(mod.Spike);
    assert.ok(mod.Image);
  });

  it("exports geometric/computational marks", async () => {
    const mod = await import("../src/react/index.js");
    assert.ok(mod.Geo);
    assert.ok(mod.Sphere);
    assert.ok(mod.Graticule);
    assert.ok(mod.DelaunayLink);
    assert.ok(mod.DelaunayMesh);
    assert.ok(mod.Hull);
    assert.ok(mod.Voronoi);
    assert.ok(mod.VoronoiMesh);
    assert.ok(mod.Density);
    assert.ok(mod.Contour);
    assert.ok(mod.Raster);
    assert.ok(mod.Hexgrid);
  });

  it("exports composite marks", async () => {
    const mod = await import("../src/react/index.js");
    assert.ok(mod.BoxX);
    assert.ok(mod.BoxY);
    assert.ok(mod.TreeMark);
    assert.ok(mod.ClusterMark);
    assert.ok(mod.BollingerX);
    assert.ok(mod.BollingerY);
    assert.ok(mod.DifferenceX);
    assert.ok(mod.DifferenceY);
    assert.ok(mod.LinearRegressionX);
    assert.ok(mod.LinearRegressionY);
    assert.ok(mod.WaffleX);
    assert.ok(mod.WaffleY);
  });

  it("exports axes and grid components", async () => {
    const mod = await import("../src/react/index.js");
    assert.ok(mod.AxisX);
    assert.ok(mod.AxisY);
    assert.ok(mod.GridX);
    assert.ok(mod.GridY);
    assert.ok(mod.AxisFx);
    assert.ok(mod.AxisFy);
    assert.ok(mod.GridFx);
    assert.ok(mod.GridFy);
  });

  it("exports interaction components and hooks", async () => {
    const mod = await import("../src/react/index.js");
    assert.ok(mod.Tip);
    assert.ok(mod.formatTip);
    assert.ok(mod.Crosshair);
    assert.ok(mod.CrosshairX);
    assert.ok(mod.CrosshairY);
    assert.ok(mod.usePointer);
    assert.ok(mod.findNearest);
  });

  it("exports legend component", async () => {
    const mod = await import("../src/react/index.js");
    assert.ok(mod.Legend);
  });

  it("exports context and hooks for custom marks", async () => {
    const mod = await import("../src/react/index.js");
    assert.ok(mod.PlotContext);
    assert.ok(mod.FacetContext);
    assert.ok(mod.usePlotContext);
    assert.ok(mod.useFacetContext);
    assert.ok(mod.useMark);
  });

  it("exports style utilities for custom marks", async () => {
    const mod = await import("../src/react/index.js");
    assert.ok(mod.indirectStyleProps);
    assert.ok(mod.directStyleProps);
    assert.ok(mod.channelStyleProps);
    assert.ok(mod.groupChannelStyleProps);
    assert.ok(mod.computeTransform);
    assert.ok(mod.computeFrameAnchor);
    assert.ok(mod.resolveStyles);
  });

  it("exports all transforms", async () => {
    const mod = await import("../src/react/index.js");
    // Basic transforms
    assert.ok(mod.filter);
    assert.ok(mod.sort);
    assert.ok(mod.shuffle);
    assert.ok(mod.reverse);
    assert.ok(mod.transform);
    assert.ok(mod.initializer);
    // Bin transforms
    assert.ok(mod.bin);
    assert.ok(mod.binX);
    assert.ok(mod.binY);
    // Group transforms
    assert.ok(mod.group);
    assert.ok(mod.groupX);
    assert.ok(mod.groupY);
    assert.ok(mod.groupZ);
    assert.ok(mod.find);
    // Centroid transforms
    assert.ok(mod.centroid);
    assert.ok(mod.geoCentroid);
    // Stack transforms
    assert.ok(mod.stackX);
    assert.ok(mod.stackX1);
    assert.ok(mod.stackX2);
    assert.ok(mod.stackY);
    assert.ok(mod.stackY1);
    assert.ok(mod.stackY2);
    // Normalize transforms
    assert.ok(mod.normalize);
    assert.ok(mod.normalizeX);
    assert.ok(mod.normalizeY);
    // Map transforms
    assert.ok(mod.map);
    assert.ok(mod.mapX);
    assert.ok(mod.mapY);
    // Select transforms
    assert.ok(mod.select);
    assert.ok(mod.selectFirst);
    assert.ok(mod.selectLast);
    assert.ok(mod.selectMaxX);
    assert.ok(mod.selectMaxY);
    assert.ok(mod.selectMinX);
    assert.ok(mod.selectMinY);
    // Window transforms
    assert.ok(mod.window);
    assert.ok(mod.windowX);
    assert.ok(mod.windowY);
    // Shift transforms
    assert.ok(mod.shiftX);
    assert.ok(mod.shiftY);
    // Hex/dodge transforms
    assert.ok(mod.hexbin);
    assert.ok(mod.dodgeX);
    assert.ok(mod.dodgeY);
    // Tree transforms
    assert.ok(mod.treeNode);
    assert.ok(mod.treeLink);
  });

  it("exports all scale and format utilities", async () => {
    const mod = await import("../src/react/index.js");
    // Scale utilities
    assert.ok(mod.scale);
    assert.ok(mod.legend);
    // Data utilities
    assert.ok(mod.valueof);
    assert.ok(mod.column);
    assert.ok(mod.identity);
    assert.ok(mod.indexOf);
    assert.ok(mod.numberInterval);
    // Format utilities
    assert.ok(mod.formatIsoDate);
    assert.ok(mod.formatNumber);
    assert.ok(mod.formatWeekday);
    assert.ok(mod.formatMonth);
    // Time interval utilities
    assert.ok(mod.timeInterval);
    assert.ok(mod.utcInterval);
  });

  it("exports raster interpolation utilities", async () => {
    const mod = await import("../src/react/index.js");
    assert.ok(mod.interpolateNone);
    assert.ok(mod.interpolatorBarycentric);
    assert.ok(mod.interpolateNearest);
    assert.ok(mod.interpolatorRandomWalk);
  });
});

// --- API parity validation ---
// Verify that the React module exports match the original imperative module,
// accounting for the expected differences in API style (components vs. functions).

describe("React API parity with imperative API", () => {
  it("provides React equivalents for all imperative mark factory functions", async () => {
    const reactMod = await import("../src/react/index.js");

    // Every imperative mark should have a React component equivalent
    const expectedMarks = [
      // dot.js: dot, dotX, dotY, circle, hexagon
      "Dot",
      "DotX",
      "DotY",
      "Circle",
      "Hexagon",
      // line.js: line, lineX, lineY
      "Line",
      "LineX",
      "LineY",
      // area.js: area, areaX, areaY
      "Area",
      "AreaX",
      "AreaY",
      // bar.js: barX, barY
      "BarX",
      "BarY",
      // rect.js: rect, rectX, rectY
      "Rect",
      "RectX",
      "RectY",
      // cell.js: cell, cellX, cellY
      "Cell",
      "CellX",
      "CellY",
      // rule.js: ruleX, ruleY
      "RuleX",
      "RuleY",
      // text.js: text, textX, textY
      "Text",
      "TextX",
      "TextY",
      // frame.js: frame
      "Frame",
      // tick.js: tickX, tickY
      "TickX",
      "TickY",
      // link.js: link
      "Link",
      // arrow.js: arrow
      "Arrow",
      // vector.js: vector, vectorX, vectorY, spike
      "Vector",
      "VectorX",
      "VectorY",
      "Spike",
      // image.js: image
      "Image",
      // geo.js: geo, sphere, graticule
      "Geo",
      "Sphere",
      "Graticule",
      // delaunay.js: delaunayLink, delaunayMesh, hull, voronoi, voronoiMesh
      "DelaunayLink",
      "DelaunayMesh",
      "Hull",
      "Voronoi",
      "VoronoiMesh",
      // density.js: density
      "Density",
      // contour.js: contour
      "Contour",
      // raster.js: raster
      "Raster",
      // hexgrid.js: hexgrid
      "Hexgrid",
      // box.js: boxX, boxY
      "BoxX",
      "BoxY",
      // tree.js: tree, cluster
      "TreeMark",
      "ClusterMark",
      // bollinger.js: bollingerX, bollingerY
      "BollingerX",
      "BollingerY",
      // difference.js: differenceX, differenceY
      "DifferenceX",
      "DifferenceY",
      // linearRegression.js: linearRegressionX, linearRegressionY
      "LinearRegressionX",
      "LinearRegressionY",
      // waffle.js: waffleX, waffleY
      "WaffleX",
      "WaffleY",
      // axis.js: axisX, axisY, axisFx, axisFy, gridX, gridY, gridFx, gridFy
      "AxisX",
      "AxisY",
      "AxisFx",
      "AxisFy",
      "GridX",
      "GridY",
      "GridFx",
      "GridFy"
    ];

    const missing: string[] = [];
    for (const name of expectedMarks) {
      if (typeof reactMod[name] !== "function") {
        missing.push(name);
      }
    }
    assert.deepStrictEqual(missing, [], `Missing React components: ${missing.join(", ")}`);
  });

  it("re-exports all imperative transforms identically", async () => {
    const imperativeMod = await import("../src/index.js");
    const reactMod = await import("../src/react/index.js");

    const transforms = [
      "filter",
      "reverse",
      "sort",
      "shuffle",
      "transform",
      "initializer",
      "bin",
      "binX",
      "binY",
      "centroid",
      "geoCentroid",
      "dodgeX",
      "dodgeY",
      "group",
      "groupX",
      "groupY",
      "groupZ",
      "find",
      "hexbin",
      "normalize",
      "normalizeX",
      "normalizeY",
      "map",
      "mapX",
      "mapY",
      "shiftX",
      "shiftY",
      "window",
      "windowX",
      "windowY",
      "select",
      "selectFirst",
      "selectLast",
      "selectMaxX",
      "selectMaxY",
      "selectMinX",
      "selectMinY",
      "stackX",
      "stackX1",
      "stackX2",
      "stackY",
      "stackY1",
      "stackY2",
      "treeNode",
      "treeLink"
    ];

    for (const name of transforms) {
      assert.strictEqual(
        reactMod[name],
        imperativeMod[name],
        `Transform ${name} should be the same function reference in both modules`
      );
    }
  });

  it("re-exports all imperative utilities identically", async () => {
    const imperativeMod = await import("../src/index.js");
    const reactMod = await import("../src/react/index.js");

    const utilities = [
      "valueof",
      "column",
      "identity",
      "indexOf",
      "numberInterval",
      "formatIsoDate",
      "formatNumber",
      "formatWeekday",
      "formatMonth",
      "scale",
      "legend",
      "timeInterval",
      "utcInterval"
    ];

    for (const name of utilities) {
      assert.strictEqual(
        reactMod[name],
        imperativeMod[name],
        `Utility ${name} should be the same function reference in both modules`
      );
    }
  });
});
