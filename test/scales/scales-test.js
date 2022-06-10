import * as Plot from "@observablehq/plot";
import * as d3 from "d3";
import assert from "assert";
import it from "../jsdom.js";

it("Plot.scale(description) returns a standalone scale", () => {
  const color = Plot.scale({color: {type: "linear"}});
  scaleEqual(color, {
    type: "linear",
    domain: [0, 1],
    range: [0, 1],
    interpolate: d3.interpolateTurbo,
    clamp: false
  });
});

it("Plot.scale({}) throws an error", () => {
  assert.throws(() => Plot.scale({}), /invalid scale definition/);
});

it("Plot.scale({color: {}}) throws an error", () => {
  assert.throws(() => Plot.scale({color: {}}), /invalid scale definition/);
});

it("plot(…).scale(name) returns undefined for an unused scale", () => {
  const plot = Plot.dot([1, 2], {x: d => d, y: d => d}).plot();
  assert.deepStrictEqual(plot.scale("r"), undefined);
});

it("plot(…).scale(name) throws an error if there is no such named scale", () => {
  const plot = Plot.dot([1, 2], {x: d => d, y: d => d}).plot();
  assert.throws(() => plot.scale("z"), /unknown scale: z/);
});

it("plot(…).scale('x') can return a linear scale", () => {
  const plot = Plot.dot([1, 2], {x: d => d, y: d => d}).plot();
  scaleEqual(plot.scale("x"), {
    type: "linear",
    domain: [1, 2],
    range: [40, 620],
    interpolate: d3.interpolateNumber,
    clamp: false
  });
});

it("plot(…).scale('x') returns the expected linear scale for penguins", async () => {
  const penguins = await d3.csv("data/penguins.csv", d3.autoType);
  const plot = Plot.dotX(penguins, {x: "body_mass_g"}).plot();
  scaleEqual(plot.scale("x"), {
    type: "linear",
    domain: [2700, 6300],
    range: [20, 620],
    interpolate: d3.interpolateNumber,
    clamp: false,
    label: "body_mass_g →"
  });
});

it("plot(…).scale('x') returns the expected sqrt scale given explicit options", () => {
  const plot = Plot.dotX([], {x: "body_mass_g"}).plot({
    x: {
      type: "sqrt",
      domain: [3500, 4000],
      range: [30, 610],
      clamp: true,
      label: "Body mass"
    }
  });
  scaleEqual(plot.scale("x"), {
    type: "pow",
    exponent: 0.5,
    domain: [3500, 4000],
    range: [30, 610],
    interpolate: d3.interpolateNumber,
    clamp: true,
    label: "Body mass"
  });
});

it("plot(…).scale('x') can return a utc scale", async () => {
  const aapl = await d3.csv("data/aapl.csv", d3.autoType);
  const plot = Plot.line(aapl, {x: "Date", y: "Close"}).plot();
  scaleEqual(plot.scale("x"), {
    type: "utc",
    domain: [new Date("2013-05-13"), new Date("2018-05-11")],
    range: [40, 620],
    interpolate: d3.interpolateNumber,
    clamp: false
  });
});

it("plot(…).scale('x') can return an explicit time scale", async () => {
  const aapl = await d3.csv("data/aapl.csv", d3.autoType);
  const plot = Plot.line(aapl, {x: "Date", y: "Close"}).plot({x: {type: "time"}});
  scaleEqual(plot.scale("x"), {
    type: "time",
    domain: [new Date("2013-05-13"), new Date("2018-05-11")],
    range: [40, 620],
    interpolate: d3.interpolateNumber,
    clamp: false
  });
});

it("plot(…).scale('x') can return a point scale", () => {
  const plot = Plot.dot(["A", "B"], {x: d => d}).plot();
  scaleEqual(plot.scale("x"), {
    type: "point",
    domain: ["A", "B"],
    range: [20, 620],
    padding: 0.5,
    align: 0.5,
    bandwidth: 0,
    step: 300,
    round: true
  });
});

it("plot(…).scale('x') can return a point scale, respecting the specified align and padding", () => {
  const plot = Plot.dot(["A", "B"], {x: d => d}).plot({x: {padding: -0.2, align: 1}});
  scaleEqual(plot.scale("x"), {
    type: "point",
    domain: ["A", "B"],
    range: [20, 620],
    padding: -0.2,
    align: 1,
    bandwidth: 0,
    step: 600,
    round: true
  });
});

it("plot(…).scale('x') can promote a reversed point scale to a point scale with a reversed domain", () => {
  const plot = Plot.dot(["A", "B"], {x: d => d}).plot({x: {reverse: true}});
  scaleEqual(plot.scale("x"), {
    type: "point",
    domain: ["B", "A"],
    range: [20, 620],
    padding: 0.5,
    align: 0.5,
    bandwidth: 0,
    step: 300,
    round: true
  });
});

it("plot(…).scale('x') can return a band scale", () => {
  const plot = Plot.cellX(["A", "B"]).plot();
  scaleEqual(plot.scale("x"), {
    type: "band",
    domain: [0, 1],
    range: [20, 620],
    paddingInner: 0.1,
    paddingOuter: 0.1,
    align: 0.5,
    bandwidth: 257,
    step: 285,
    round: true
  });
});

it("plot(…).scale('x') can return an explicit band scale", () => {
  const plot = Plot.cell([0, 1], {x: d => d}).plot({x: {type: "band"}});
  scaleEqual(plot.scale("x"), {
    type: "band",
    domain: [0, 1],
    range: [20, 620],
    paddingInner: 0.1,
    paddingOuter: 0.1,
    align: 0.5,
    bandwidth: 257,
    step: 285,
    round: true
  });
});

it("plot(…).scale('x') can promote a reversed band scale to a band scale with a reversed domain", () => {
  const plot = Plot.cellX(["A", "B"]).plot({x: {reverse: true}});
  scaleEqual(plot.scale("x"), {
    type: "band",
    domain: [1, 0],
    range: [20, 620],
    paddingInner: 0.1,
    paddingOuter: 0.1,
    align: 0.5,
    bandwidth: 257,
    step: 285,
    round: true
  });
});

it("plot(…).scale('y') can return a linear scale", () => {
  const plot = Plot.dot([1, 2], {x: d => d, y: d => d}).plot();
  scaleEqual(plot.scale("y"), {
    type: "linear",
    domain: [1, 2],
    range: [370, 20],
    interpolate: d3.interpolateNumber,
    clamp: false
  });
});

it("plot(…).scale('y') can return a band scale", () => {
  const plot = Plot.cellY(["A", "B"]).plot();
  scaleEqual(plot.scale("y"), {
    type: "band",
    domain: [0, 1],
    range: [20, 80],
    paddingInner: 0.1,
    paddingOuter: 0.1,
    align: 0.5,
    bandwidth: 25,
    step: 28,
    round: true
  });
});

it("plot(…).scale('y') can return a band scale, respecting the specified align and padding", () => {
  const plot = Plot.cellY(["A", "B"]).plot({y: {paddingOuter: -0.2, align: 1}});
  scaleEqual(plot.scale("y"), {
    type: "band",
    domain: [0, 1],
    range: [20, 80],
    paddingInner: 0.1,
    paddingOuter: -0.2,
    align: 1,
    bandwidth: 36,
    step: 40,
    round: true
  });
});

it("plot(…).scale('fx') can return undefined", () => {
  const data = [1, 2];
  assert.strictEqual(Plot.dot(data, {x: d => d}).plot().scale("fx"), undefined);
  assert.strictEqual(Plot.dot(data, {x: d => d}).plot({facet: {data, y: data}}).scale("fx"), undefined);
});

it("plot(…).scale('fy') can return undefined", () => {
  const data = [1, 2];
  assert.strictEqual(Plot.dot(data, {y: d => d}).plot().scale("fy"), undefined);
  assert.strictEqual(Plot.dot(data, {y: d => d}).plot({facet: {data, x: data}}).scale("fy"), undefined);
});

it("plot(…).scale('fx') can return a band scale", () => {
  const data = [1, 2];
  const plot = Plot.dot(data, {y: d => d}).plot({facet: {data, x: data}});
  scaleEqual(plot.scale("fx"), {
    type: "band",
    domain: [1, 2],
    range: [40, 620],
    align: 0.5,
    paddingInner: 0.1,
    paddingOuter: 0,
    bandwidth: 275,
    step: 305,
    round: true
  });
});

it("plot(…).scale('fy') can return a band scale", () => {
  const data = [1, 2];
  const plot = Plot.dot(data, {y: d => d}).plot({facet: {data, y: data}});
  scaleEqual(plot.scale("fy"), {
    type: "band",
    domain: [1, 2],
    range: [20, 380],
    align: 0.5,
    paddingInner: 0.1,
    paddingOuter: 0,
    bandwidth: 170,
    step: 189,
    round: true
  });
});

it("plot(…).scale(name).unknown reflects the given unknown option for an ordinal scale", async () => {
  const penguins = await d3.csv("data/penguins.csv", d3.autoType);
  const plot = Plot.dotX(penguins, {x: "body_mass_g", fill: "island"}).plot({color: {domain: ["Dream"], unknown: "#ccc"}});
  scaleEqual(plot.scale("color"), {
    type: "ordinal",
    domain: ["Dream"],
    unknown: "#ccc",
    range: d3.schemeTableau10,
    label: "island"
  });
});

it("plot(…).scale(name).unknown reflects the given unknown option for a continuous scale", async () => {
  const penguins = await d3.csv("data/penguins.csv", d3.autoType);
  const plot = Plot.dotX(penguins, {x: "body_mass_g", fill: "body_mass_g"}).plot({color: {unknown: "black"}});
  scaleEqual(plot.scale("color"), {
    type: "linear",
    domain: [2700, 6300],
    range: [0, 1],
    clamp: false,
    unknown: "black",
    interpolate: d3.interpolateTurbo,
    label: "body_mass_g"
  });
});

it("plot(…).scale(name).unknown reflects the given unknown option for a threshold scale", async () => {
  const penguins = await d3.csv("data/penguins.csv", d3.autoType);
  const plot = Plot.dotX(penguins, {x: "body_mass_g", fill: "body_mass_g"}).plot({color: {type: "threshold", domain: [3000], unknown: "black"}});
  scaleEqual(plot.scale("color"), {
    type: "threshold",
    domain: [3000],
    unknown: "black",
    range: [d3.schemeRdYlBu[3][0], d3.schemeRdYlBu[3][2]],
    label: "body_mass_g"
  });
});

it("plot(…).scale(name).unknown reflects the given unknown option for a diverging scale", async () => {
  const gistemp = await d3.csv("data/gistemp.csv", d3.autoType);
  const plot = Plot.dotX(gistemp, {x: "Date", fill: "Anomaly"}).plot({color: {type: "diverging", symmetric: false, unknown: "black"}});
  scaleEqual(plot.scale("color"), {
    type: "diverging",
    symmetric: false,
    domain: [-0.78, 1.35],
    pivot: 0,
    clamp: false,
    unknown: "black",
    interpolate: d3.interpolateRdBu,
    label: "Anomaly"
  });
});

it("plot(…).scale(name) promotes the given zero option to the domain", async () => {
  const penguins = await d3.csv("data/penguins.csv", d3.autoType);
  const plot = Plot.dotX(penguins, {x: "body_mass_g"}).plot({x: {zero: true}});
  scaleEqual(plot.scale("x"), {
    type: "linear",
    domain: [0, 6300],
    range: [20, 620],
    interpolate: d3.interpolateNumber,
    clamp: false,
    label: "body_mass_g →"
  });
});

it("plot(…).scale(name) promotes the given global zero option to the domain", async () => {
  const penguins = await d3.csv("data/penguins.csv", d3.autoType);
  const plot = Plot.dotX(penguins, {x: "body_mass_g"}).plot({zero: true});
  scaleEqual(plot.scale("x"), {
    type: "linear",
    domain: [0, 6300],
    range: [20, 620],
    interpolate: d3.interpolateNumber,
    clamp: false,
    label: "body_mass_g →"
  });
});

it("plot(…).scale(name) handles the zero option correctly for descending domains", async () => {
  const penguins = await d3.csv("data/penguins.csv", d3.autoType);
  const plot = Plot.dotX(penguins, {x: "body_mass_g"}).plot({x: {zero: true, domain: [4000, 2000]}});
  scaleEqual(plot.scale("x"), {
    type: "linear",
    domain: [4000, 0],
    range: [20, 620],
    interpolate: d3.interpolateNumber,
    clamp: false,
    label: "← body_mass_g"
  });
});

it("plot(…).scale(name) handles the zero option correctly for polylinear domains", async () => {
  const penguins = await d3.csv("data/penguins.csv", d3.autoType);
  const plot = Plot.dotX(penguins, {x: "body_mass_g"}).plot({x: {type: "linear", zero: true, domain: [1000, 2000, 4000]}});
  scaleEqual(plot.scale("x"), {
    type: "linear",
    domain: [0, 2000, 4000],
    range: [20, 320, 620],
    interpolate: d3.interpolateNumber,
    clamp: false,
    label: "body_mass_g →"
  });
});

it("plot(…).scale(name) handles the zero option correctly for descending polylinear domains", async () => {
  const penguins = await d3.csv("data/penguins.csv", d3.autoType);
  const plot = Plot.dotX(penguins, {x: "body_mass_g"}).plot({x: {type: "linear", zero: true, domain: [4000, 2000, 1000]}});
  scaleEqual(plot.scale("x"), {
    type: "linear",
    domain: [4000, 2000, 0],
    range: [20, 320, 620],
    interpolate: d3.interpolateNumber,
    clamp: false,
    label: "← body_mass_g"
  });
});

it("plot(…).scale('color') can return undefined if no color scale is present", () => {
  const plot = Plot.dot([1, 2], {x: d => d}).plot();
  assert.strictEqual(plot.scale("color"), undefined);
});

it("plot(…).scale('color') can return a linear scale", () => {
  const plot = Plot.dot([1, 2, 3, 4, 5], {y: d => d, fill: d => d}).plot();
  scaleEqual(plot.scale("color"), {
    type: "linear",
    domain: [1, 5],
    range: [0, 1],
    interpolate: d3.interpolateTurbo,
    clamp: false
  });
});

it("plot(…).scale('color') can return a linear scale with an explicit range and RGB interpolation", () => {
  const plot = Plot.ruleX([100, 200, 300, 400], {stroke: d => d}).plot({color: {range: ["yellow", "blue"]}});
  scaleEqual(plot.scale("color"), {
    type: "linear",
    domain: [100, 400],
    range: ["yellow", "blue"],
    interpolate: d3.interpolateRgb,
    clamp: false
  });
});

it("plot(…).scale('color') can return a utc scale", async () => {
  const aapl = await d3.csv("data/aapl.csv", d3.autoType);
  const plot = Plot.dot(aapl, {x: "Close", stroke: "Date"}).plot();
  scaleEqual(plot.scale("color"), {
    type: "utc",
    domain: [new Date("2013-05-13"), new Date("2018-05-11")],
    range: [0, 1],
    interpolate: d3.interpolateTurbo,
    clamp: false
  });
});

it("plot(…).scale('color') can return an asymmetric diverging scale", async () => {
  const gistemp = await d3.csv("data/gistemp.csv", d3.autoType);
  const plot = Plot.dot(gistemp, {x: "Date", stroke: "Anomaly"}).plot({color: {type: "diverging", symmetric: false}});
  scaleEqual(plot.scale("color"), {
    type: "diverging",
    symmetric: false,
    domain: [-0.78, 1.35],
    pivot: 0,
    interpolate: d3.interpolateRdBu,
    clamp: false,
    label: "Anomaly"
  });
});

it("plot(…).scale('color') can return a symmetric diverging scale", async () => {
  const gistemp = await d3.csv("data/gistemp.csv", d3.autoType);
  const plot = Plot.dot(gistemp, {x: "Date", stroke: "Anomaly"}).plot({color: {type: "diverging"}});
  scaleEqual(plot.scale("color"), {
    type: "diverging",
    symmetric: false,
    domain: [-1.35, 1.35],
    interpolate: d3.interpolateRdBu,
    pivot: 0,
    clamp: false,
    label: "Anomaly"
  });
});

it("plot(…).scale('color') can return a diverging scale with an explicit range", async () => {
  const gistemp = await d3.csv("data/gistemp.csv", d3.autoType);
  const plot = Plot.dot(gistemp, {x: "Date", stroke: "Anomaly"}).plot({color: {type: "diverging", symmetric: false, range: ["red", "white", "blue"]}});
  const {interpolate, ...color} = plot.scale("color");
  scaleEqual(color, {
    type: "diverging",
    symmetric: false,
    domain: [-0.78, 1.35],
    pivot: 0,
    clamp: false,
    label: "Anomaly"
  });
  const interpolateColors = d3.piecewise(d3.interpolateRgb, ["red", "white", "blue"]);
  for (const t of d3.ticks(0, 1, 100)) {
    assert.strictEqual(interpolate(t), interpolateColors(t));
  }
});

it("plot(…).scale('color') can return a diverging scale with an explicit scheme and range", async () => {
  const gistemp = await d3.csv("data/gistemp.csv", d3.autoType);
  const plot = Plot.dot(gistemp, {x: "Date", stroke: "Anomaly"}).plot({color: {type: "diverging", symmetric: false, range: [0, 0.5], scheme: "rdbu"}});
  const {interpolate, ...color} = plot.scale("color");
  scaleEqual(color, {
    type: "diverging",
    symmetric: false,
    domain: [-0.78, 1.35],
    pivot: 0,
    clamp: false,
    label: "Anomaly"
  });
  for (const t of d3.ticks(0, 1, 100)) {
    assert.strictEqual(interpolate(t), d3.interpolateRdBu(t / 2));
  }
});

it("plot(…).scale('color') can return a transformed diverging scale", async () => {
  const transform = d => d * 100;
  const gistemp = await d3.csv("data/gistemp.csv", d3.autoType);
  const plot = Plot.dot(gistemp, {x: "Date", stroke: "Anomaly"}).plot({color: {type: "diverging", transform, symmetric: false}});
  scaleEqual(plot.scale("color"), {
    type: "diverging",
    symmetric: false,
    domain: [-78, 135],
    pivot: 0,
    transform,
    interpolate: d3.interpolateRdBu,
    clamp: false,
    label: "Anomaly"
  });
});

it("plot(…).scale('color') can return a transformed symmetric diverging scale", async () => {
  const transform = d => d * 100;
  const gistemp = await d3.csv("data/gistemp.csv", d3.autoType);
  const plot = Plot.dot(gistemp, {x: "Date", stroke: "Anomaly"}).plot({color: {type: "diverging", transform}});
  scaleEqual(plot.scale("color"), {
    type: "diverging",
    symmetric: false,
    domain: [-135, 135],
    pivot: 0,
    transform,
    interpolate: d3.interpolateRdBu,
    clamp: false,
    label: "Anomaly"
  });
});

it("plot(…).scale('color') can return an asymmetric diverging pow scale with an explicit scheme", async () => {
  const gistemp = await d3.csv("data/gistemp.csv", d3.autoType);
  const plot = Plot.dot(gistemp, {x: "Date", stroke: "Anomaly"}).plot({color: {type: "diverging-sqrt", symmetric: false, scheme: "piyg"}});
  scaleEqual(plot.scale("color"), {
    type: "diverging-pow",
    symmetric: false,
    exponent: 0.5,
    domain: [-0.78, 1.35],
    pivot: 0,
    interpolate: d3.interpolatePiYG,
    clamp: false,
    label: "Anomaly"
  });
});

it("plot(…).scale('color') can return an asymmetric diverging pow scale with an explicit exponent and scheme", async () => {
  const gistemp = await d3.csv("data/gistemp.csv", d3.autoType);
  const plot = Plot.dot(gistemp, {x: "Date", stroke: "Anomaly"}).plot({color: {type: "diverging-pow", exponent: 2, symmetric: false, scheme: "piyg"}});
  scaleEqual(plot.scale("color"), {
    type: "diverging-pow",
    symmetric: false,
    exponent: 2,
    domain: [-0.78, 1.35],
    pivot: 0,
    interpolate: d3.interpolatePiYG,
    clamp: false,
    label: "Anomaly"
  });
});

it("plot(…).scale('color') can return an asymmetric diverging symlog scale with an explicit constant", async () => {
  const gistemp = await d3.csv("data/gistemp.csv", d3.autoType);
  const plot = Plot.dot(gistemp, {x: "Date", stroke: "Anomaly"}).plot({color: {type: "diverging-symlog", constant: 2, symmetric: false, scheme: "piyg"}});
  scaleEqual(plot.scale("color"), {
    type: "diverging-symlog",
    symmetric: false,
    constant: 2,
    domain: [-0.78, 1.35],
    pivot: 0,
    interpolate: d3.interpolatePiYG,
    clamp: false,
    label: "Anomaly"
  });
});

it("plot(…).scale('color') can return an asymmetric diverging log scale with an explicit pivot and base", async () => {
  const aapl = await d3.csv("data/aapl.csv", d3.autoType);
  const plot = Plot.dot(aapl, {x: "Date", stroke: "Volume"}).plot({color: {type: "diverging-log", pivot: 1e8, base: 10, symmetric: false, scheme: "piyg"}});
  scaleEqual(plot.scale("color"), {
    type: "diverging-log",
    symmetric: false,
    base: 10,
    domain: [11475900, 266380800],
    pivot: 100000000,
    interpolate: d3.interpolatePiYG,
    clamp: false,
    label: "Volume"
  });
});

it("plot(…).scale('color') can return an asymmetric diverging log scale with a negative domain via transform, pivot and base", async () => {
  const transform = d => -d;
  const aapl = await d3.csv("data/aapl.csv", d3.autoType);
  const plot = Plot.dot(aapl, {x: "Date", stroke: "Volume"}).plot({color: {type: "diverging-log", transform, pivot: -1e8, base: 10, symmetric: false, scheme: "piyg"}});
  scaleEqual(plot.scale("color"), {
    type: "diverging-log",
    symmetric: false,
    base: 10,
    domain: [-266380800, -11475900],
    pivot: -100000000,
    transform,
    interpolate: d3.interpolatePiYG,
    clamp: false,
    label: "Volume"
  });
});

it("plot(…).scale('color') can return a “polylinear” piecewise linear scale with an explicit range", () => {
  const plot = Plot.ruleX([100, 200, 300, 400], {stroke: d => d}).plot({
    color: {
      type: "linear",
      domain: [0, 150, 500],
      range: ["yellow", "blue", "black"]
    }
  });
  scaleEqual(plot.scale("color"), {
    type: "linear",
    domain: [0, 150, 500],
    range: ["yellow", "blue", "black"],
    interpolate: d3.interpolateRgb,
    clamp: false
  });
});

it("plot(…).scale('color') can return a polylinear piecewise linear scale with an explicit scheme", () => {
  const plot = Plot.ruleX([100, 200, 300, 400], {stroke: d => d}).plot({
    color: {
      type: "linear",
      domain: [0, 150, 500],
      scheme: "warm"
    }
  });
  scaleEqual(plot.scale("color"), {
    type: "linear",
    domain: [0, 150, 500],
    range: [0, 0.5, 1],
    interpolate: d3.interpolateWarm,
    clamp: false
  });
});

it("plot(…).scale('color') can return a reversed polylinear piecewise linear scale with an explicit scheme", () => {
  const plot = Plot.ruleX([100, 200, 300, 400], {stroke: d => d}).plot({
    color: {
      type: "linear",
      domain: [0, 150, 500],
      reverse: true,
      scheme: "warm"
    }
  });
  const {interpolate, ...color} = plot.scale("color");
  scaleEqual(color, {
    type: "linear",
    domain: [0, 150, 500],
    range: [0, 0.5, 1],
    clamp: false
  });
  for (const t of d3.ticks(0, 1, 100)) {
    assert.strictEqual(interpolate(t), d3.interpolateWarm(1 - t));
  }
});

it("plot(…).scale('color') can return a polylinear piecewise sqrt scale with an explicit scheme", () => {
  const plot = Plot.ruleX([100, 200, 300, 400], {stroke: d => d}).plot({
    color: {
      type: "sqrt",
      domain: [0, 150, 500],
      scheme: "warm"
    }
  });
  scaleEqual(plot.scale("color"), {
    type: "pow",
    exponent: 0.5,
    domain: [0, 150, 500],
    range: [0, 0.5, 1],
    interpolate: d3.interpolateWarm,
    clamp: false
  });
});

it("plot(…).scale('color') can return a polylinear piecewise pow scale with an explicit scheme", () => {
  const plot = Plot.ruleX([100, 200, 300, 400], {stroke: d => d}).plot({
    color: {
      type: "pow",
      exponent: 0.3,
      domain: [0, 150, 500],
      scheme: "warm"
    }
  });
  scaleEqual(plot.scale("color"), {
    type: "pow",
    exponent: 0.3,
    domain: [0, 150, 500],
    range: [0, 0.5, 1],
    interpolate: d3.interpolateWarm,
    clamp: false
  });
});

it("plot(…).scale('color') can return a polylinear piecewise log scale with an explicit scheme", () => {
  const plot = Plot.ruleX([100, 200, 300, 400], {stroke: d => d}).plot({
    color: {
      type: "log",
      domain: [1, 10, 500],
      scheme: "warm"
    }
  });
  scaleEqual(plot.scale("color"), {
    type: "log",
    base: 10,
    domain: [1, 10, 500],
    range: [0, 0.5, 1],
    interpolate: d3.interpolateWarm,
    clamp: false
  });
});

it("plot(…).scale('color') can return a polylinear piecewise symlog scale with an explicit scheme", () => {
  const plot = Plot.ruleX([100, 200, 300, 400], {stroke: d => d}).plot({
    color: {
      type: "symlog",
      domain: [1, 10, 500],
      scheme: "warm"
    }
  });
  scaleEqual(plot.scale("color"), {
    type: "symlog",
    constant: 1,
    domain: [1, 10, 500],
    range: [0, 0.5, 1],
    interpolate: d3.interpolateWarm,
    clamp: false
  });
});

it("plot(…).scale('color') can return a threshold scale with the default domain", async () => {
  const penguins = await d3.csv("data/penguins.csv", d3.autoType);
  const plot = Plot.dot(penguins, {x: "body_mass_g", fill: "body_mass_g"}).plot({color: {type: "threshold"}});
  scaleEqual(plot.scale("color"), {
    type: "threshold",
    domain: [0],
    range: [d3.schemeRdYlBu[3][0], d3.schemeRdYlBu[3][2]],
    label: "body_mass_g"
  });
});

it("plot(…).scale('color') can return a threshold scale with an explicit domain", async () => {
  const penguins = await d3.csv("data/penguins.csv", d3.autoType);
  const domain = d3.ticks(...d3.extent(penguins, d => d.body_mass_g), 5);
  const plot = Plot.dot(penguins, {x: "body_mass_g", fill: "body_mass_g"}).plot({color: {type: "threshold", domain}});
  scaleEqual(plot.scale("color"), {
    type: "threshold",
    domain: [3000, 4000, 5000, 6000],
    range: d3.schemeRdYlBu[5],
    label: "body_mass_g"
  });
});

it("plot(…).scale('color') can return a threshold scale with an explicit scheme", async () => {
  const penguins = await d3.csv("data/penguins.csv", d3.autoType);
  const plot = Plot.dot(penguins, {x: "body_mass_g", fill: "body_mass_g"}).plot({color: {type: "threshold", scheme: "blues"}});
  scaleEqual(plot.scale("color"), {
    type: "threshold",
    domain: [0],
    range: [d3.schemeBlues[3][1], d3.schemeBlues[3][2]],
    label: "body_mass_g"
  });
});

it("plot(…).scale('color') can return a threshold scale with an explicit interpolator", async () => {
  const penguins = await d3.csv("data/penguins.csv", d3.autoType);
  const plot = Plot.dot(penguins, {x: "body_mass_g", fill: "body_mass_g"}).plot({color: {type: "threshold", interpolate: d3.interpolateReds}});
  scaleEqual(plot.scale("color"), {
    type: "threshold",
    domain: [0],
    range: d3.quantize(d3.interpolateReds, 2),
    label: "body_mass_g"
  });
});

it("plot(…).scale('color') can promote a quantile scale to a threshold scale", async () => {
  const penguins = await d3.csv("data/penguins.csv", d3.autoType);
  const plot = Plot.dot(penguins, {x: "body_mass_g", fill: "body_mass_g"}).plot({color: {type: "quantile"}});
  scaleEqual(plot.scale("color"), {
    type: "threshold",
    domain: [3475, 3800, 4300, 4950],
    range: d3.schemeRdYlBu[5],
    label: "body_mass_g"
  });
});

it("plot(…).scale('color') can promote a quantile scale with an explicit discrete scheme to a threshold scale", async () => {
  const penguins = await d3.csv("data/penguins.csv", d3.autoType);
  const plot = Plot.dot(penguins, {x: "body_mass_g", fill: "body_mass_g"}).plot({color: {type: "quantile", scheme: "spectral"}});
  scaleEqual(plot.scale("color"), {
    type: "threshold",
    domain: [3475, 3800, 4300, 4950],
    range: d3.schemeSpectral[5],
    label: "body_mass_g"
  });
});

it("plot(…).scale('color') can promote a quantile scale with an explicit continuous scheme to a threshold scale", async () => {
  const penguins = await d3.csv("data/penguins.csv", d3.autoType);
  const plot = Plot.dot(penguins, {x: "body_mass_g", fill: "body_mass_g"}).plot({color: {type: "quantile", scheme: "warm"}});
  scaleEqual(plot.scale("color"), {
    type: "threshold",
    domain: [3475, 3800, 4300, 4950],
    range: d3.quantize(d3.interpolateWarm, 5),
    label: "body_mass_g"
  });
});

it("plot(…).scale('color') can promote a quantile scale with an explicit continuous interpolator to a threshold scale", async () => {
  const penguins = await d3.csv("data/penguins.csv", d3.autoType);
  const plot = Plot.dot(penguins, {x: "body_mass_g", fill: "body_mass_g"}).plot({color: {type: "quantile", interpolate: d3.interpolateRainbow}});
  scaleEqual(plot.scale("color"), {
    type: "threshold",
    domain: [3475, 3800, 4300, 4950],
    range: d3.quantize(d3.interpolateRainbow, 5),
    label: "body_mass_g"
  });
});

it("plot(…).scale('color') can promote a quantile scale with an explicit number of quantiles to a threshold scale", async () => {
  const penguins = await d3.csv("data/penguins.csv", d3.autoType);
  const plot = Plot.dot(penguins, {x: "body_mass_g", fill: "body_mass_g"}).plot({color: {type: "quantile", n: 10}});
  scaleEqual(plot.scale("color"), {
    type: "threshold",
    domain: [3300, 3475, 3650, 3800, 4050, 4300, 4650, 4950, 5400],
    range: d3.schemeRdYlBu[10],
    label: "body_mass_g"
  });
});

it("plot(…).scale('color') can promote a quantile scale with an explicit range to a threshold scale", async () => {
  const penguins = await d3.csv("data/penguins.csv", d3.autoType);
  const range = ["red", "yellow", "blue", "green"]; // for quartiles
  const plot = Plot.dot(penguins, {x: "body_mass_g", fill: "body_mass_g"}).plot({color: {type: "quantile", range}});
  scaleEqual(plot.scale("color"), {
    type: "threshold",
    domain: [3550, 4050, 4750],
    range,
    label: "body_mass_g"
  });
});

it("plot(…).scale('color') can promote a reversed quantile scale to a threshold scale with a reversed range", async () => {
  const penguins = await d3.csv("data/penguins.csv", d3.autoType);
  const plot = Plot.dot(penguins, {x: "body_mass_g", fill: "body_mass_g"}).plot({color: {type: "quantile", reverse: true}});
  scaleEqual(plot.scale("color"), {
    type: "threshold",
    domain: [3475, 3800, 4300, 4950],
    range: d3.reverse(d3.schemeRdYlBu[5]),
    label: "body_mass_g"
  });
});

it("plot(…).scale('color') can promote a quantized scale to a threshold scale", async () => {
  const penguins = await d3.csv("data/penguins.csv", d3.autoType);
  const plot = Plot.dot(penguins, {x: "body_mass_g", fill: "body_mass_g"}).plot({color: {type: "quantize"}});
  scaleEqual(plot.scale("color"), {
    type: "threshold",
    domain: [3000, 4000, 5000, 6000],
    range: d3.schemeRdYlBu[5],
    label: "body_mass_g"
  });
});

it("plot(…).scale('color') can promote a quantized scale to a threshold scale with n thresholds", async () => {
  const penguins = await d3.csv("data/penguins.csv", d3.autoType);
  const plot = Plot.dot(penguins, {x: "body_mass_g", fill: "body_mass_g"}).plot({color: {type: "quantize", n: 10, scheme: "blues"}});
  scaleEqual(plot.scale("color"), {
    type: "threshold",
    domain: [3000, 3500, 4000, 4500, 5000, 5500, 6000],
    range: d3.schemeBlues[8],
    label: "body_mass_g"
  });
});

it("plot(…).scale('color') can promote a reversed quantized scale to a threshold scale", async () => {
  const penguins = await d3.csv("data/penguins.csv", d3.autoType);
  const plot = Plot.dot(penguins, {x: "body_mass_g", fill: "body_mass_g"}).plot({color: {type: "quantize", reverse: true}});
  scaleEqual(plot.scale("color"), {
    type: "threshold",
    domain: [3000, 4000, 5000, 6000],
    range: d3.reverse(d3.schemeRdYlBu[5]),
    label: "body_mass_g"
  });
});

it("plot(…).scale('color') can promote a descending quantized scale to a threshold scale", async () => {
  const penguins = await d3.csv("data/penguins.csv", d3.autoType);
  const plot = Plot.dot(penguins, {x: "body_mass_g", fill: "body_mass_g"}).plot({color: {domain: [6500, 2500], type: "quantize"}});
  scaleEqual(plot.scale("color"), {
    type: "threshold",
    domain: [6000, 5000, 4000, 3000],
    range: d3.schemeRdYlBu[5],
    label: "body_mass_g"
  });
});

it("plot(…).scale('color') can promote a reverse and descending quantized scale to a threshold scale", async () => {
  const penguins = await d3.csv("data/penguins.csv", d3.autoType);
  const plot = Plot.dot(penguins, {x: "body_mass_g", fill: "body_mass_g"}).plot({color: {domain: [6500, 2500], type: "quantize", reverse: true}});
  scaleEqual(plot.scale("color"), {
    type: "threshold",
    domain: [6000, 5000, 4000, 3000],
    range: d3.reverse(d3.schemeRdYlBu[5]),
    label: "body_mass_g"
  });
});

it("plot(…).scale('color') promotes a cyclical scale to a linear scale", () => {
  const plot = Plot.dot([1, 2, 3, 4, 5], {y: d => d, fill: d => d}).plot({color: {type: "cyclical"}});
  scaleEqual(plot.scale("color"), {
    type: "linear",
    domain: [1, 5],
    range: [0, 1],
    interpolate: d3.interpolateRainbow,
    clamp: false
  });
});

it("plot(…).scale('color') ignores nonsensical options for cyclical scale", () => {
  const plot = Plot.dot([1, 2, 3, 4, 5], {y: d => d, fill: d => d}).plot({color: {type: "cyclical", pivot: 5000, symmetric: false}}); // Note: diverging options ignored here!
  scaleEqual(plot.scale("color"), {
    type: "linear",
    domain: [1, 5],
    range: [0, 1],
    interpolate: d3.interpolateRainbow,
    clamp: false
  });
});

it("plot(…).scale('color') promotes a cyclical scale to a linear scale, even when a scheme is specified", () => {
  const plot = Plot.dot([1, 2, 3, 4, 5], {y: d => d, fill: d => d}).plot({color: {type: "cyclical", scheme: "blues"}});
  scaleEqual(plot.scale("color"), {
    type: "linear",
    domain: [1, 5],
    range: [0, 1],
    interpolate: d3.interpolateBlues,
    clamp: false
  });
});

it("plot(…).scale('color') promotes a cyclical scale to a linear scale and ignores the scheme when an interpolator is specified", () => {
  const plot = Plot.dot([1, 2, 3, 4, 5], {y: d => d, fill: d => d}).plot({color: {type: "cyclical", scheme: "blues", interpolate: d3.interpolateWarm}});
  scaleEqual(plot.scale("color"), {
    type: "linear",
    domain: [1, 5],
    range: [0, 1],
    interpolate: d3.interpolateWarm,
    clamp: false
  });
});

it("plot(…).scale('color') promotes a sequential scale to a linear scale, even when a scheme is specified", () => {
  const plot = Plot.dot([1, 2, 3, 4, 5], {y: d => d, fill: d => d}).plot({color: {type: "sequential", scheme: "blues"}});
  scaleEqual(plot.scale("color"), {
    type: "linear",
    domain: [1, 5],
    range: [0, 1],
    interpolate: d3.interpolateBlues,
    clamp: false
  });
});

it("plot(…).scale('color') promotes a sequential scale to a linear scale and ignores the scheme when an interpolator is specified", () => {
  const plot = Plot.dot([1, 2, 3, 4, 5], {y: d => d, fill: d => d}).plot({color: {type: "sequential", scheme: "blues", interpolate: d3.interpolateWarm}});
  scaleEqual(plot.scale("color"), {
    type: "linear",
    domain: [1, 5],
    range: [0, 1],
    interpolate: d3.interpolateWarm,
    clamp: false
  });
});

it("plot(…).scale('color') promotes a sequential scale to a linear scale", () => {
  const plot = Plot.dot([1, 2, 3, 4, 5], {y: d => d, fill: d => d}).plot({color: {type: "sequential"}});
  scaleEqual(plot.scale("color"), {
    type: "linear",
    domain: [1, 5],
    range: [0, 1],
    interpolate: d3.interpolateTurbo,
    clamp: false
  });
});

it("plot(…).scale('color') promotes a reversed sequential scale to a linear scale with a flipped interpolator", () => {
  const plot = Plot.dot([1, 2, 3, 4, 5], {y: d => d, fill: d => d}).plot({color: {type: "sequential", reverse: true}});
  const {interpolate, ...color} = plot.scale("color");
  scaleEqual(color, {
    type: "linear",
    domain: [1, 5],
    range: [0, 1],
    clamp: false
  });
  for (const t of d3.ticks(1, 5, 100)) {
    assert.strictEqual(interpolate(t), d3.interpolateTurbo(1 - t));
  }
});

it("plot(…).scale('color') can return an ordinal scale", async () => {
  const penguins = await d3.csv("data/penguins.csv", d3.autoType);
  const plot = Plot.dot(penguins, {x: "body_mass_g", fill: "island"}).plot();
  scaleEqual(plot.scale("color"), {
    type: "ordinal",
    domain: ["Biscoe", "Dream", "Torgersen"],
    range: d3.schemeTableau10,
    label: "island"
  });
});

it("plot(…).scale('color') can return an ordinal scale with a transform", async () => {
  const transform = d => d.toUpperCase();
  const penguins = await d3.csv("data/penguins.csv", d3.autoType);
  const plot = Plot.dot(penguins, {x: "body_mass_g", fill: "island"}).plot({color: {transform}});
  scaleEqual(plot.scale("color"), {
    type: "ordinal",
    domain: ["BISCOE", "DREAM", "TORGERSEN"],
    transform,
    range: d3.schemeTableau10,
    label: "island"
  });
});

it("plot(…).scale('color') can promote a reversed categorical scale to an ordinal scale with a reversed domain", async () => {
  const penguins = await d3.csv("data/penguins.csv", d3.autoType);
  const plot = Plot.dot(penguins, {x: "body_mass_g", fill: "island"}).plot({color: {reverse: true}});
  scaleEqual(plot.scale("color"), {
    type: "ordinal",
    domain: ["Torgersen", "Dream", "Biscoe"],
    range: d3.schemeTableau10,
    label: "island"
  });
});

it("plot(…).scale('color') can promotes an explicitly categorical scale to an ordinal scale", async () => {
  const penguins = await d3.csv("data/penguins.csv", d3.autoType);
  const plot = Plot.dot(penguins, {x: "body_mass_g", fill: "island"}).plot({color: {type: "categorical"}});
  scaleEqual(plot.scale("color"), {
    type: "ordinal",
    domain: ["Biscoe", "Dream", "Torgersen"],
    range: d3.schemeTableau10,
    label: "island"
  });
});

it("plot(…).scale('color') can return an explicitly ordinal scale", async () => {
  const penguins = await d3.csv("data/penguins.csv", d3.autoType);
  const plot = Plot.dot(penguins, {x: "body_mass_g", fill: "island"}).plot({color: {type: "ordinal"}});
  scaleEqual(plot.scale("color"), {
    type: "ordinal",
    domain: ["Biscoe", "Dream", "Torgersen"],
    range: d3.quantize(d3.interpolateTurbo, 3),
    label: "island"
  });
});

it("plot(…).scale('color') promotes a reversed ordinal scale to an ordinal scale with a reversed domain", async () => {
  const penguins = await d3.csv("data/penguins.csv", d3.autoType);
  const plot = Plot.dot(penguins, {x: "body_mass_g", fill: "island"}).plot({color: {type: "ordinal", reverse: true}});
  scaleEqual(plot.scale("color"), {
    type: "ordinal",
    domain: ["Torgersen", "Dream", "Biscoe"],
    range: d3.quantize(d3.interpolateTurbo, 3),
    label: "island"
  });
});

it("plot(…).scale('color') can return a ordinal scale with an explicit range", async () => {
  const penguins = await d3.csv("data/penguins.csv", d3.autoType);
  const range = ["yellow", "lime", "black", "red"];
  const plot = Plot.dot(penguins, {x: "body_mass_g", fill: "island"}).plot({color: {range}});
  scaleEqual(plot.scale("color"), {
    type: "ordinal",
    domain: ["Biscoe", "Dream", "Torgersen"],
    range,
    label: "island"
  });
});

it("plot(…).scale('color') can return an ordinal scale with an explicit range", async () => {
  const penguins = await d3.csv("data/penguins.csv", d3.autoType);
  const range = ["yellow", "lime", "black", "red"];
  const plot = Plot.dot(penguins, {x: "body_mass_g", fill: "island"}).plot({color: {type: "ordinal", range}});
  scaleEqual(plot.scale("color"), {
    type: "ordinal",
    domain: ["Biscoe", "Dream", "Torgersen"],
    range,
    label: "island"
  });
});

it("plot(…).scale('r') can return undefined", () => {
  const plot = Plot.dot([1, 2], {x: d => d}).plot();
  assert.strictEqual(plot.scale("r"), undefined);
});

it("plot(…).scale('r') can return an implicit pow scale", () => {
  const plot = Plot.dot([1, 2, 3, 4, 9], {r: d => d}).plot();
  scaleEqual(plot.scale("r"), {
    type: "pow",
    exponent: 0.5,
    domain: [0, 9],
    range: [0, Math.sqrt(40.5)],
    interpolate: d3.interpolateNumber,
    clamp: false
  });
});

it("plot(…).scale('r') can return a pow scale for sqrt", () => {
  const plot = Plot.dot([1, 2, 3, 4, 9], {r: d => d}).plot({r: {type: "sqrt"}});
  scaleEqual(plot.scale("r"), {
    type: "pow",
    exponent: 0.5,
    domain: [0, 9],
    range: [0, Math.sqrt(40.5)],
    interpolate: d3.interpolateNumber,
    clamp: false
  });
});

it("plot(…).scale('r') can return an explicit pow scale", () => {
  const plot = Plot.dot([1, 2, 3, 4, 9], {r: d => d}).plot({r: {type: "pow", exponent: 0.3}});
  scaleEqual(plot.scale("r"), {
    type: "pow",
    exponent: 0.3,
    domain: [0, 9],
    range: [0, Math.sqrt(40.5)],
    interpolate: d3.interpolateNumber,
    clamp: false
  });
});

it("plot(…).scale('r') can return an implicit pow scale with an explicit range", () => {
  const plot = Plot.dot([1, 2, 3, 4, 9], {r: d => d}).plot({r: {range: [2, 13]}}); // Note: range should normally start at zero!
  scaleEqual(plot.scale("r"), {
    type: "pow",
    exponent: 0.5,
    domain: [0, 9],
    range: [2, 13],
    interpolate: d3.interpolateNumber,
    clamp: false
  });
});

it("plot(…).scale('opacity') can return undefined", () => {
  const plot = Plot.dot([1, 2], {x: d => d}).plot();
  assert.strictEqual(plot.scale("opacity"), undefined);
});

it("plot(…).scale('opacity') can return a linear scale", () => {
  const plot = Plot.dot([1, 2, 3, 4, 9], {fillOpacity: d => d}).plot();
  scaleEqual(plot.scale("opacity"), {
    type: "linear",
    domain: [0, 9],
    range: [0, 1],
    interpolate: d3.interpolateNumber,
    clamp: false
  });
});

it("plot(…).scale('opacity') can return a linear scale for penguins", async () => {
  const penguins = await d3.csv("data/penguins.csv", d3.autoType);
  const plot = Plot.rectX(penguins, Plot.binX({fillOpacity: "count"}, {x: "body_mass_g", thresholds: 20})).plot();
  scaleEqual(plot.scale("opacity"), {
    type: "linear",
    domain: [0, 40],
    range: [0, 1],
    interpolate: d3.interpolateNumber,
    clamp: false,
    label: "Frequency"
  });
});

it("plot(…).scale('opacity') respects the percent option, affecting domain and label", async () => {
  const penguins = await d3.csv("data/penguins.csv", d3.autoType);
  const plot = Plot.rectX(penguins, Plot.binX({fillOpacity: "proportion"}, {x: "body_mass_g", thresholds: 20})).plot({opacity: {percent: true}});
  scaleEqual(plot.scale("opacity"), {
    type: "linear",
    domain: [0, 11.627906976744185],
    range: [0, 1],
    interpolate: d3.interpolateNumber,
    clamp: false,
    label: "Frequency (%)",
    percent: true
  });
});

it("plot({inset, …}).scale('x') does not allow insets or margins to invert the range", () => {
  assert.deepStrictEqual(Plot.plot({x: {type: "linear", inset: 60}, width: 100}).scale("x").range, [80, 80]);
  assert.deepStrictEqual(Plot.plot({x: {type: "linear", inset: 30}, margin: 30, width: 100}).scale("x").range, [60, 60]);
});

it("plot({inset, …}).scale('y') does not allow insets or margins to invert the range", () => {
  assert.deepStrictEqual(Plot.plot({y: {type: "linear", inset: 60}, height: 100}).scale("y").range, [80, 80]);
  assert.deepStrictEqual(Plot.plot({y: {type: "linear", inset: 30}, margin: 30, height: 100}).scale("y").range, [60, 60]);
});

it("plot({inset, …}).scale('x').range respects the given top-level inset", () => {
  assert.deepStrictEqual(Plot.dot([1, 2, 3], {x: d => d}).plot({inset: 0}).scale("x").range, [20, 620]);
  assert.deepStrictEqual(Plot.dot([1, 2, 3], {x: d => d}).plot({inset: 7}).scale("x").range, [27, 613]);
});

it("plot({inset, …}).scale('x').range respects the given scale-level inset", () => {
  assert.deepStrictEqual(Plot.dot([1, 2, 3], {x: d => d}).plot({x: {inset: 0}}).scale("x").range, [20, 620]);
  assert.deepStrictEqual(Plot.dot([1, 2, 3], {x: d => d}).plot({x: {inset: 7}}).scale("x").range, [27, 613]);
});

it("plot({clamp, …}).scale('x').clamp reflects the given clamp option", () => {
  assert.strictEqual(Plot.dot([1, 2, 3], {x: d => d}).plot({x: {clamp: false}}).scale("x").clamp, false);
  assert.strictEqual(Plot.dot([1, 2, 3], {x: d => d}).plot({x: {clamp: true}}).scale("x").clamp, true);
  assert.strictEqual(Plot.dot([1, 2, 3], {x: d => d}).plot({clamp: true}).scale("x").clamp, true);
});

it("plot({align, …}).scale('x').align reflects the given align option for point scales", () => {
  assert.strictEqual(Plot.dot("abc", {x: d => d}).plot({x: {align: 0}}).scale("x").align, 0);
  assert.strictEqual(Plot.dot("abc", {x: d => d}).plot({x: {align: 0.7}}).scale("x").align, 0.7);
  assert.strictEqual(Plot.dot("abc", {x: d => d}).plot({x: {align: "0.7"}}).scale("x").align, 0.7);
  assert.strictEqual(Plot.dot("abc", {x: d => d}).plot({x: {align: 1}}).scale("x").align, 1);
});

it("plot({align, …}).scale('x').align reflects the given align option for band scales", () => {
  assert.strictEqual(Plot.cell("abc", {x: d => d}).plot({x: {align: 0}}).scale("x").align, 0);
  assert.strictEqual(Plot.cell("abc", {x: d => d}).plot({x: {align: 0.7}}).scale("x").align, 0.7);
  assert.strictEqual(Plot.cell("abc", {x: d => d}).plot({x: {align: "0.7"}}).scale("x").align, 0.7);
  assert.strictEqual(Plot.cell("abc", {x: d => d}).plot({x: {align: 1}}).scale("x").align, 1);
});

it("plot({paddingInner, …}).scale('x').paddingInner reflects the given paddingInner option for band scales", () => {
  assert.strictEqual(Plot.cell("abc", {x: d => d}).plot({x: {paddingInner: 0}}).scale("x").paddingInner, 0);
  assert.strictEqual(Plot.cell("abc", {x: d => d}).plot({x: {paddingInner: 0.7}}).scale("x").paddingInner, 0.7);
  assert.strictEqual(Plot.cell("abc", {x: d => d}).plot({x: {paddingInner: "0.7"}}).scale("x").paddingInner, 0.7);
  assert.strictEqual(Plot.cell("abc", {x: d => d}).plot({x: {paddingInner: 1}}).scale("x").paddingInner, 1);
  assert.strictEqual(Plot.cell("abc", {x: d => d}).plot({x: {padding: 0, paddingInner: 0}}).scale("x").paddingInner, 0);
  assert.strictEqual(Plot.cell("abc", {x: d => d}).plot({x: {padding: 0, paddingInner: 0.7}}).scale("x").paddingInner, 0.7);
  assert.strictEqual(Plot.cell("abc", {x: d => d}).plot({x: {padding: 0, paddingInner: "0.7"}}).scale("x").paddingInner, 0.7);
  assert.strictEqual(Plot.cell("abc", {x: d => d}).plot({x: {padding: 0, paddingInner: 1}}).scale("x").paddingInner, 1);
});

it("plot({paddingOuter, …}).scale('x').paddingOuter reflects the given paddingOuter option for band scales", () => {
  assert.strictEqual(Plot.cell("abc", {x: d => d}).plot({x: {paddingOuter: 0}}).scale("x").paddingOuter, 0);
  assert.strictEqual(Plot.cell("abc", {x: d => d}).plot({x: {paddingOuter: 0.7}}).scale("x").paddingOuter, 0.7);
  assert.strictEqual(Plot.cell("abc", {x: d => d}).plot({x: {paddingOuter: "0.7"}}).scale("x").paddingOuter, 0.7);
  assert.strictEqual(Plot.cell("abc", {x: d => d}).plot({x: {paddingOuter: 1}}).scale("x").paddingOuter, 1);
  assert.strictEqual(Plot.cell("abc", {x: d => d}).plot({x: {padding: 0, paddingOuter: 0}}).scale("x").paddingOuter, 0);
  assert.strictEqual(Plot.cell("abc", {x: d => d}).plot({x: {padding: 0, paddingOuter: 0.7}}).scale("x").paddingOuter, 0.7);
  assert.strictEqual(Plot.cell("abc", {x: d => d}).plot({x: {padding: 0, paddingOuter: "0.7"}}).scale("x").paddingOuter, 0.7);
  assert.strictEqual(Plot.cell("abc", {x: d => d}).plot({x: {padding: 0, paddingOuter: 1}}).scale("x").paddingOuter, 1);
});

it("plot({padding, …}).scale('x').paddingInner reflects the given padding option for band scales", () => {
  assert.strictEqual(Plot.cell("abc", {x: d => d}).plot({x: {padding: 0}}).scale("x").paddingInner, 0);
  assert.strictEqual(Plot.cell("abc", {x: d => d}).plot({x: {padding: 0.7}}).scale("x").paddingInner, 0.7);
  assert.strictEqual(Plot.cell("abc", {x: d => d}).plot({x: {padding: "0.7"}}).scale("x").paddingInner, 0.7);
  assert.strictEqual(Plot.cell("abc", {x: d => d}).plot({x: {padding: 1}}).scale("x").paddingInner, 1);
});

it("plot({padding, …}).scale('x').paddingOuter reflects the given padding option for band scales", () => {
  assert.strictEqual(Plot.cell("abc", {x: d => d}).plot({x: {padding: 0}}).scale("x").paddingOuter, 0);
  assert.strictEqual(Plot.cell("abc", {x: d => d}).plot({x: {padding: 0.7}}).scale("x").paddingOuter, 0.7);
  assert.strictEqual(Plot.cell("abc", {x: d => d}).plot({x: {padding: "0.7"}}).scale("x").paddingOuter, 0.7);
  assert.strictEqual(Plot.cell("abc", {x: d => d}).plot({x: {padding: 1}}).scale("x").paddingOuter, 1);
});

it("plot({padding, …}).scale('x').padding reflects the given padding option for point scales", () => {
  assert.strictEqual(Plot.dot("abc", {x: d => d}).plot({x: {padding: 0}}).scale("x").padding, 0);
  assert.strictEqual(Plot.dot("abc", {x: d => d}).plot({x: {padding: 0.7}}).scale("x").padding, 0.7);
  assert.strictEqual(Plot.dot("abc", {x: d => d}).plot({x: {padding: "0.7"}}).scale("x").padding, 0.7);
  assert.strictEqual(Plot.dot("abc", {x: d => d}).plot({x: {padding: 1}}).scale("x").padding, 1);
});

it("plot(…).scale('x').label reflects the default label for named fields, possibly reversed", () => {
  assert.strictEqual(Plot.dot([{foo: 1}, {foo: 2}, {foo: 3}], {x: "foo"}).plot().scale("x").label, "foo →");
  assert.strictEqual(Plot.dot([{foo: 1}, {foo: 2}, {foo: 3}], {x: "foo"}).plot({x: {reverse: true}}).scale("x").label, "← foo");
});

it("plot(…).scale('y').label reflects the default label for named fields, possibly reversed", () => {
  assert.strictEqual(Plot.dot([{foo: 1}, {foo: 2}, {foo: 3}], {y: "foo"}).plot().scale("y").label, "↑ foo");
  assert.strictEqual(Plot.dot([{foo: 1}, {foo: 2}, {foo: 3}], {y: "foo"}).plot({y: {reverse: true}}).scale("y").label, "↓ foo");
});

it("plot(…).scale('x').label reflects the explicit label", () => {
  assert.strictEqual(Plot.dot([{foo: 1}, {foo: 2}, {foo: 3}], {x: "foo"}).plot({x: {label: "Foo"}}).scale("x").label, "Foo");
  assert.strictEqual(Plot.dot([{foo: 1}, {foo: 2}, {foo: 3}], {x: "foo"}).plot({x: {label: null}}).scale("x").label, null);
});

it("plot(…).scale('x').label reflects a function label, if not overridden by an explicit label", () => {
  const foo = Object.assign(d => d.foo, {label: "Foo"});
  assert.strictEqual(Plot.dot([{foo: 1}, {foo: 2}, {foo: 3}], {x: foo}).plot().scale("x").label, "Foo →");
  assert.strictEqual(Plot.dot([{foo: 1}, {foo: 2}, {foo: 3}], {x: foo}).plot({x: {label: null}}).scale("x").label, null);
});

it("plot(…).scale('x').label reflects a channel transform label, if not overridden by an explicit label", () => {
  const foo = {transform: data => data.map(d => d.foo), label: "Foo"};
  assert.strictEqual(Plot.dot([{foo: 1}, {foo: 2}, {foo: 3}], {x: foo}).plot().scale("x").label, "Foo →");
  assert.strictEqual(Plot.dot([{foo: 1}, {foo: 2}, {foo: 3}], {x: foo}).plot({x: {label: null}}).scale("x").label, null);
});

it("plot(…).scale('color').label reflects the default label for named fields", () => {
  assert.strictEqual(Plot.dot([{x: 1}, {x: 2}, {x: 3}], {fill: "x"}).plot().scale("color").label, "x");
  assert.strictEqual(Plot.dot([{y: 1}, {y: 2}, {y: 3}], {fill: "y"}).plot().scale("color").label, "y");
});

it("plot(…).scale('r').label returns the expected label", () => {
  assert.strictEqual(Plot.dot([{x: 1}, {x: 2}, {x: 3}], {r: "x"}).plot().scale("r").label, "x");
  assert.strictEqual(Plot.dot([{y: 1}, {y: 2}, {y: 3}], {r: "y"}).plot().scale("r").label, "y");
  assert.strictEqual(Plot.dot([{y: 1}, {y: 2}, {y: 3}], {r: "y"}).plot({r: {label: "radius"}}).scale("r").label, "radius");
});

it("plot(…).scale(name).exponent returns the expected exponent for pow and sqrt scales", () => {
  assert.strictEqual(Plot.dotX([1, 2, 3]).plot({x: {type: "sqrt"}}).scale("x").exponent, 0.5);
  assert.strictEqual(Plot.dotX([1, 2, 3]).plot({x: {type: "sqrt", exponent: 1}}).scale("x").exponent, 0.5);
  assert.strictEqual(Plot.dotX([1, 2, 3]).plot({x: {type: "pow"}}).scale("x").exponent, 1);
  assert.strictEqual(Plot.dotX([1, 2, 3]).plot({x: {type: "pow", exponent: 0.3}}).scale("x").exponent, 0.3);
  assert.strictEqual(Plot.dotX([1, 2, 3]).plot({x: {type: "pow", exponent: "0.3"}}).scale("x").exponent, 0.3);
});

it("plot(…).scale('y') can return a log scale", () => {
  const plot = Plot.dotY([1, 2, 3, 4]).plot({y: {type: "log"}});
  scaleEqual(plot.scale("y"), {
    type: "log",
    domain: [1, 4],
    range: [380, 20],
    base: 10,
    interpolate: d3.interpolateNumber,
    clamp: false
  });
});

it("plot(…).scale(name).base returns the expected base for log scales", () => {
  assert.strictEqual(Plot.dotX([1, 2, 3]).plot({x: {type: "log"}}).scale("x").base, 10);
  assert.strictEqual(Plot.dotX([1, 2, 3]).plot({x: {type: "log", base: 2}}).scale("x").base, 2);
  assert.strictEqual(Plot.dotX([1, 2, 3]).plot({x: {type: "log", base: "2"}}).scale("x").base, 2);
});

it("plot(…).scale('y') can return a symlog scale", () => {
  const plot = Plot.dotY([1, 2, 3, 4]).plot({y: {type: "symlog"}});
  scaleEqual(plot.scale("y"), {
    type: "symlog",
    domain: [1, 4],
    range: [380, 20],
    constant: 1,
    interpolate: d3.interpolateNumber,
    clamp: false
  });
});

it("plot(…).scale(name).constant returns the expected constant for symlog scales", () => {
  assert.strictEqual(Plot.dotX([1, 2, 3]).plot({x: {type: "symlog"}}).scale("x").constant, 1);
  assert.strictEqual(Plot.dotX([1, 2, 3]).plot({x: {type: "symlog", constant: 2}}).scale("x").constant, 2);
  assert.strictEqual(Plot.dotX([1, 2, 3]).plot({x: {type: "symlog", constant: "2"}}).scale("x").constant, 2);
});

it("plot(…).scale(name).domain respects the given nice option", async () => {
  const penguins = await d3.csv("data/penguins.csv", d3.autoType);
  assert.deepStrictEqual(Plot.dotX(penguins, {x: "body_mass_g"}).plot({x: {nice: false}}).scale("x").domain, [2700, 6300]);
  assert.deepStrictEqual(Plot.dotX(penguins, {x: "body_mass_g"}).plot({x: {nice: true}}).scale("x").domain, [2500, 6500]);
  assert.deepStrictEqual(Plot.dotX(penguins, {x: "body_mass_g"}).plot({x: {nice: 10}}).scale("x").domain, [2500, 6500]);
  assert.deepStrictEqual(Plot.dotX(penguins, {x: "body_mass_g"}).plot({x: {nice: 5}}).scale("x").domain, [2000, 7000]);
  assert.deepStrictEqual(Plot.dotX(penguins, {x: "body_mass_g"}).plot({nice: true}).scale("x").domain, [2500, 6500]);
});

it("plot(…).scale(name).domain nices an explicit domain, too", async () => {
  const penguins = await d3.csv("data/penguins.csv", d3.autoType);
  assert.deepStrictEqual(Plot.dotX(penguins, {x: "body_mass_g"}).plot({x: {nice: false, domain: [1701, 7299]}}).scale("x").domain, [1701, 7299]);
  assert.deepStrictEqual(Plot.dotX(penguins, {x: "body_mass_g"}).plot({x: {nice: true, domain: [1701, 7299]}}).scale("x").domain, [1500, 7500]);
  assert.deepStrictEqual(Plot.dotX(penguins, {x: "body_mass_g"}).plot({x: {nice: 10, domain: [1701, 7299]}}).scale("x").domain, [1500, 7500]);
  assert.deepStrictEqual(Plot.dotX(penguins, {x: "body_mass_g"}).plot({x: {nice: 5, domain: [1701, 7299]}}).scale("x").domain, [1000, 8000]);
});

it("plot(…).scale(name).interpolate reflects the round option for quantitative scales", async () => {
  const penguins = await d3.csv("data/penguins.csv", d3.autoType);
  assert.strictEqual(Plot.dotX(penguins, {x: "body_mass_g"}).plot({x: {round: false}}).scale("x").interpolate, d3.interpolateNumber);
  assert.strictEqual(Plot.dotX(penguins, {x: "body_mass_g"}).plot({x: {round: true}}).scale("x").interpolate, d3.interpolateRound);
  assert.strictEqual(Plot.dotX(penguins, {x: "body_mass_g"}).plot({round: true}).scale("x").interpolate, d3.interpolateRound);
});

it("plot(…).scale(name).round reflects the round option for point scales", async () => {
  const penguins = await d3.csv("data/penguins.csv", d3.autoType);
  assert.strictEqual(Plot.dot(penguins, {x: "species"}).plot().scale("x").round, true);
  assert.strictEqual(Plot.dot(penguins, {x: "species"}).plot({x: {round: 1}}).scale("x").round, true);
  assert.strictEqual(Plot.dot(penguins, {x: "species"}).plot({x: {round: true}}).scale("x").round, true);
  assert.strictEqual(Plot.dot(penguins, {x: "species"}).plot({x: {round: 0}}).scale("x").round, false);
  assert.strictEqual(Plot.dot(penguins, {x: "species"}).plot({x: {round: false}}).scale("x").round, false);
});

it("plot(…).scale(name).round reflects the round option for band scales", async () => {
  const penguins = await d3.csv("data/penguins.csv", d3.autoType);
  assert.strictEqual(Plot.cell(penguins, {x: "species"}).plot().scale("x").round, true);
  assert.strictEqual(Plot.cell(penguins, {x: "species"}).plot({x: {round: 1}}).scale("x").round, true);
  assert.strictEqual(Plot.cell(penguins, {x: "species"}).plot({x: {round: true}}).scale("x").round, true);
  assert.strictEqual(Plot.cell(penguins, {x: "species"}).plot({x: {round: 0}}).scale("x").round, false);
  assert.strictEqual(Plot.cell(penguins, {x: "species"}).plot({x: {round: false}}).scale("x").round, false);
});

it("plot(…).scale(name) reflects the given custom interpolator", async () => {
  const interpolate = (a, b) => t => +(t * (b - a) + a).toFixed(1);
  const penguins = await d3.csv("data/penguins.csv", d3.autoType);
  const plot = Plot.dotX(penguins, {x: "body_mass_g"}).plot({x: {interpolate}});
  scaleEqual(plot.scale("x"), {
    type: "linear",
    domain: [2700, 6300],
    range: [20, 620],
    interpolate,
    clamp: false,
    label: "body_mass_g →"
  });
});

it("plot(…).scale(name).interval changes the domain and sets the transform option for ordinal scales", async () => {
  const requests = [[2002,9],[2003,17],[2004,12],[2005,5],[2006,12],[2007,18],[2008,16],[2009,11],[2010,9],[2011,8],[2012,9],[2019,20]];
  const plot = Plot.barY(requests, {x: "0", y: "1"}).plot({x: {interval: 1}});
  scaleEqual(plot.scale("x"), {
    align: 0.5,
    bandwidth: 29,
    domain: d3.range(2002, 2020),
    interval: ["floor", "offset", "range"],
    label: "0",
    paddingInner: 0.1,
    paddingOuter: 0.1,
    range: [40, 620],
    round: true,
    step: 32,
    type: "band"
  });
});

it("plot(…).scale(name).interval reflects the interval option for quantitative scales", async () => {
  const penguins = await d3.csv("data/penguins.csv", d3.autoType);
  const plot = Plot.dotX(penguins, {x: "body_mass_g"}).plot({x: {interval: 50}});
  scaleEqual(plot.scale("x"), {
    clamp: false,
    domain: [2700, 6300],
    interpolate: d3.interpolateNumber,
    interval: ["floor", "offset", "range"],
    label: "body_mass_g →",
    range: [20, 620],
    type: "linear"
  });
});

it("The interval option is reusable for ordinal scales", async () => {
  const requests = [[2002,9],[2003.5,17],[2005.9,5]];
  const plot1 = Plot.barY(requests, {x: "0", y: "1"}).plot({x: {interval: 1}, className: "a"});
  const plot2 = Plot.barY(requests, {x: "0", y: "1"}).plot({x: plot1.scale("x"), className: "a"});
  assert.strictEqual(plot1.innerHTML, plot2.innerHTML);
});

it("The interval option is reusable for quantitative scales", async () => {
  const requests = [[2002,9],[2003.5,17],[2005.9,5]];
  const plot1 = Plot.dot(requests, {x: "0", y: "1"}).plot({x: {interval: 1}, className: "a"});
  const plot2 = Plot.dot(requests, {x: "0", y: "1"}).plot({x: plot1.scale("x"), className: "a"});
  assert.strictEqual(plot1.innerHTML, plot2.innerHTML);
});

it("plot(…).scale('color') allows a range to be specified in conjunction with a scheme", async () => {
  const gistemp = await d3.csv("data/gistemp.csv", d3.autoType);
  const plot = Plot.dot(gistemp, {x: "Date", fill: "Anomaly"}).plot({color: {range: [0, 0.5], scheme: "cool"}});
  scaleEqual(plot.scale("color"), {
    type: "linear",
    domain: [-0.78, 1.35],
    range: [0, 0.5],
    interpolate: d3.interpolateCool,
    clamp: false,
    label: "Anomaly"
  });
});

it("plot(…).scale('color') allows a range to be specified in conjunction with a single-argument interpolator", async () => {
  const gistemp = await d3.csv("data/gistemp.csv", d3.autoType);
  const plot = Plot.dot(gistemp, {x: "Date", fill: "Anomaly"}).plot({color: {range: [0, 0.5], interpolate: d3.interpolateCool}});
  scaleEqual(plot.scale("color"), {
    type: "linear",
    domain: [-0.78, 1.35],
    range: [0, 0.5],
    interpolate: d3.interpolateCool,
    clamp: false,
    label: "Anomaly"
  });
});

it("plot(…).scale('color') promotes the given scheme option to an interpolator for quantitative scales", () => {
  assert.strictEqual(Plot.dotX([], {fill: "x"}).plot().scale("color").interpolate, d3.interpolateTurbo);
  assert.strictEqual(Plot.dotX([], {fill: "x"}).plot({color: {scheme: "warm"}}).scale("color").interpolate, d3.interpolateWarm);
  assert.strictEqual(Plot.dotX([], {fill: "x"}).plot({color: {scheme: "cool"}}).scale("color").interpolate, d3.interpolateCool);
});

it("plot(…).scale('color') promotes the given scheme option to a range for ordinal scales", async () => {
  const penguins = await d3.csv("data/penguins.csv", d3.autoType);
  assert.deepStrictEqual(Plot.dotX(penguins, {fill: "island"}).plot().scale("color").range, d3.schemeTableau10);
  assert.deepStrictEqual(Plot.dotX(penguins, {fill: "island"}).plot({color: {type: "categorical"}}).scale("color").range, d3.schemeTableau10);
  assert.deepStrictEqual(Plot.dotX(penguins, {fill: "island"}).plot({color: {scheme: "category10"}}).scale("color").range, d3.schemeCategory10);
  assert.deepStrictEqual(Plot.dotX(penguins, {fill: "island"}).plot({color: {type: "ordinal"}}).scale("color").range, d3.quantize(d3.interpolateTurbo, 3));
  assert.deepStrictEqual(Plot.dotX(penguins, {fill: "island"}).plot({color: {scheme: "warm"}}).scale("color").range, d3.quantize(d3.interpolateWarm, 3));
  assert.deepStrictEqual(Plot.dotX(penguins, {fill: "island"}).plot({color: {scheme: "cool"}}).scale("color").range, d3.quantize(d3.interpolateCool, 3));
});

it("plot(…).scale(name) reflects the given transform", async () => {
  const transform = d => 1 / d;
  const penguins = await d3.csv("data/penguins.csv", d3.autoType);
  const plot = Plot.dot(penguins, {x: "body_mass_g"}).plot({x: {transform}});
  scaleEqual(plot.scale("x"), {
    type: "linear",
    domain: [1 / 6300, 1 / 2700],
    range: [20, 620],
    clamp: false,
    interpolate: d3.interpolateNumber,
    transform,
    label: "body_mass_g →"
  });
});

it("plot(…).scale(name) can return an identity scale, ignoring all other options", () => {
  const plot = Plot.dot([1, 2], {x: d => d, fill: d => d}).plot({x: {type: "identity"}, color: {type: "identity"}});
  scaleEqual(plot.scale("x"), {type: "identity"});
  scaleEqual(plot.scale("color"), {type: "identity"});
});

it("plot(…).scale(name).apply and invert return the expected functions", () => {
  scaleApply({domain: [0, 1], range: [0, -1]}, [[2, -2]]);
  scaleApply({domain: [0, 1], range: [0, -1], type: "sqrt"}, [[4, -2]]);
  scaleApply({domain: [1, 1000], range: [0, 3], type: "log"}, [[10, 1], [100, 2]]);
  scaleApply({domain: [0, 100], type: "symlog"}, [[100, 620], [0, 20], [-100, -580]]);
  scaleApply({type: "identity"}, [[10, 10], [100, 100]]);
});

// Given a plot specification (or, as shorthand, an array of marks or a single
// mark), asserts that the given named scales, when materialized from the first
// plot and used to produce a second plot, produce the same output and the same
// materialized scales both times.
// function assertReusableScales(spec, ...scales) {
//   if (spec instanceof Plot.Mark) spec = [spec];
//   if (Array.isArray(spec)) spec = {marks: spec};
//   const plot1 = Plot.plot(spec);
//   const scales1 = Object.fromEntries(scales.map(name => [name, plot1.scale(name)]));
//   const plot2 = Plot.plot({...spec, ...scales1});
//   const scales2 = Object.fromEntries(scales.map(name => [name, plot2.scale(name)]));
//   assert.deepStrictEqual(scales1, scales2);
//   assert.strictEqual(plot1.outerHTML, plot2.outerHTML);
// }

function scaleEqual({...scale}, spec) {
  if (typeof scale.apply !== "function") {
    scale.apply = typeof scale.apply; // allows visual debugging
  } else {
    delete scale.apply;
  }
  if (scale.interval) scale.interval = Object.keys(scale.interval);
  if (typeof scale.invert !== "function" && !(["band", "point", "threshold", "ordinal", "diverging", "diverging-log", "diverging-symlog", "diverging-pow" ].includes(scale.type))) {
    scale.invert = typeof scale.invert;
  } else {
    delete scale.invert;
  }
  return assert.deepStrictEqual(scale, spec);
}

function scaleApply(x, pairs) {
  x = Plot.plot({x}).scale("x");
  for (const [input, output] of pairs) {
    assert.strictEqual(+x.apply(input).toFixed(10), output);
    assert.strictEqual(+x.invert(output).toFixed(10), input);
  }
}
