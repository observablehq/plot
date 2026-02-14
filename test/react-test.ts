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
import {Rect, Cell} from "../src/react/marks/Rect.js";
import {RuleX, RuleY} from "../src/react/marks/Rule.js";
import {Text} from "../src/react/marks/Text.js";
import {Frame} from "../src/react/marks/Frame.js";
import {TickX, TickY} from "../src/react/marks/Tick.js";
import {AxisX, AxisY, GridX, GridY} from "../src/react/marks/Axis.js";

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
    assert.strictEqual(typeof RuleX, "function");
    assert.strictEqual(typeof RuleY, "function");
    assert.strictEqual(typeof Text, "function");
    assert.strictEqual(typeof Frame, "function");
    assert.strictEqual(typeof TickX, "function");
    assert.strictEqual(typeof TickY, "function");
    assert.strictEqual(typeof AxisX, "function");
    assert.strictEqual(typeof AxisY, "function");
    assert.strictEqual(typeof GridX, "function");
    assert.strictEqual(typeof GridY, "function");
  });

  it("renders an empty Plot as an SVG", () => {
    const html = renderToStaticMarkup(React.createElement(Plot, {width: 200, height: 100}));
    assert.ok(html.includes("<svg"));
    assert.ok(html.includes("width=\"200\""));
    assert.ok(html.includes("height=\"100\""));
    assert.ok(html.includes("</svg>"));
  });

  it("renders Plot with default dimensions", () => {
    const html = renderToStaticMarkup(React.createElement(Plot));
    assert.ok(html.includes("<svg"));
    assert.ok(html.includes("width=\"640\""));
  });

  it("renders Plot with aria attributes", () => {
    const html = renderToStaticMarkup(
      React.createElement(Plot, {ariaLabel: "test chart", ariaDescription: "a test"})
    );
    assert.ok(html.includes("aria-label=\"test chart\""));
    assert.ok(html.includes("aria-description=\"a test\""));
  });

  it("renders Plot with title (figure wrapping)", () => {
    const html = renderToStaticMarkup(
      React.createElement(Plot, {title: "My Chart", width: 300, height: 200})
    );
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

  // NOTE: The Plot component uses a two-phase render pattern (registration → scale
  // computation → mark rendering). SSR with renderToStaticMarkup only executes the
  // first render pass, so marks register but don't produce SVG output. These tests
  // verify that the SSR shell renders correctly; full mark rendering requires
  // client-side hydration.

  it("renders Plot with marks without errors (SSR shell)", () => {
    const data = [{x: 1, y: 2}, {x: 3, y: 4}];
    const html = renderToStaticMarkup(
      React.createElement(Plot, {width: 200, height: 200},
        React.createElement(Dot, {data, x: "x", y: "y"})
      )
    );
    assert.ok(html.includes("<svg"));
    assert.ok(html.includes("width=\"200\""));
    assert.ok(html.includes("</svg>"));
  });

  it("renders Plot with Line mark without errors (SSR shell)", () => {
    const data = [{x: 0, y: 0}, {x: 1, y: 1}, {x: 2, y: 4}];
    const html = renderToStaticMarkup(
      React.createElement(Plot, {width: 200, height: 200},
        React.createElement(Line, {data, x: "x", y: "y"})
      )
    );
    assert.ok(html.includes("<svg"));
    assert.ok(html.includes("</svg>"));
  });

  it("renders Plot with AreaY mark without errors (SSR shell)", () => {
    const data = [{x: 0, y: 0}, {x: 1, y: 1}, {x: 2, y: 4}];
    const html = renderToStaticMarkup(
      React.createElement(Plot, {width: 200, height: 200},
        React.createElement(AreaY, {data, x: "x", y: "y"})
      )
    );
    assert.ok(html.includes("<svg"));
  });

  it("renders Plot with BarY mark without errors (SSR shell)", () => {
    const data = [{x: "a", y: 10}, {x: "b", y: 20}];
    const html = renderToStaticMarkup(
      React.createElement(Plot, {width: 200, height: 200, x: {type: "band"}},
        React.createElement(BarY, {data, x: "x", y: "y"})
      )
    );
    assert.ok(html.includes("<svg"));
    assert.ok(html.includes("</svg>"));
  });

  it("renders Plot with RuleX without errors (SSR shell)", () => {
    const html = renderToStaticMarkup(
      React.createElement(Plot, {width: 200, height: 200},
        React.createElement(RuleX, {data: [50], x: (d: number) => d})
      )
    );
    assert.ok(html.includes("<svg"));
  });

  it("renders Plot with Text mark without errors (SSR shell)", () => {
    const data = [{x: 1, y: 2, label: "hi"}];
    const html = renderToStaticMarkup(
      React.createElement(Plot, {width: 200, height: 200},
        React.createElement(Text, {data, x: "x", y: "y", text: "label"})
      )
    );
    assert.ok(html.includes("<svg"));
  });

  it("renders Plot with Frame without errors (SSR shell)", () => {
    const html = renderToStaticMarkup(
      React.createElement(Plot, {width: 200, height: 200},
        React.createElement(Frame)
      )
    );
    assert.ok(html.includes("<svg"));
    assert.ok(html.includes("</svg>"));
  });

  it("renders Plot with explicit AxisX/AxisY without errors (SSR shell)", () => {
    const data = [{x: 0, y: 0}, {x: 10, y: 10}];
    const html = renderToStaticMarkup(
      React.createElement(Plot, {width: 300, height: 200},
        React.createElement(Dot, {data, x: "x", y: "y"}),
        React.createElement(AxisX),
        React.createElement(AxisY)
      )
    );
    assert.ok(html.includes("<svg"));
    assert.ok(html.includes("</svg>"));
  });

  it("renders Plot with multiple marks without errors (SSR shell)", () => {
    const data = [{x: 0, y: 0}, {x: 5, y: 5}, {x: 10, y: 10}];
    const html = renderToStaticMarkup(
      React.createElement(Plot, {width: 300, height: 200},
        React.createElement(Dot, {data, x: "x", y: "y"}),
        React.createElement(Line, {data, x: "x", y: "y"})
      )
    );
    assert.ok(html.includes("<svg"));
    assert.ok(html.includes("</svg>"));
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
    assert.ok(mod.RuleX);
    assert.ok(mod.RuleY);
    assert.ok(mod.Text);
    assert.ok(mod.Frame);
    assert.ok(mod.TickX);
    assert.ok(mod.TickY);
    assert.ok(mod.Link);
    assert.ok(mod.Arrow);
    assert.ok(mod.Vector);
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

  it("exports transforms", async () => {
    const mod = await import("../src/react/index.js");
    assert.ok(mod.filter);
    assert.ok(mod.sort);
    assert.ok(mod.shuffle);
    assert.ok(mod.reverse);
    assert.ok(mod.bin);
    assert.ok(mod.binX);
    assert.ok(mod.binY);
    assert.ok(mod.group);
    assert.ok(mod.groupX);
    assert.ok(mod.groupY);
    assert.ok(mod.stackX);
    assert.ok(mod.stackY);
    assert.ok(mod.normalizeX);
    assert.ok(mod.normalizeY);
    assert.ok(mod.map);
    assert.ok(mod.mapX);
    assert.ok(mod.mapY);
    assert.ok(mod.select);
    assert.ok(mod.window);
    assert.ok(mod.windowX);
    assert.ok(mod.windowY);
    assert.ok(mod.hexbin);
    assert.ok(mod.dodgeX);
    assert.ok(mod.dodgeY);
    assert.ok(mod.treeNode);
    assert.ok(mod.treeLink);
  });

  it("exports scale and format utilities", async () => {
    const mod = await import("../src/react/index.js");
    assert.ok(mod.scale);
    assert.ok(mod.legend);
    assert.ok(mod.valueof);
    assert.ok(mod.formatIsoDate);
    assert.ok(mod.formatNumber);
  });
});
