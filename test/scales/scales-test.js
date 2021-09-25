import * as Plot from "@observablehq/plot";
import * as d3 from "d3";
import assert from "assert";
import it from "../jsdom.js";

it("plot(…).scale(name) returns undefined for an unused scale", () => {
  const plot = Plot.dot([1, 2], {x: d => d, y: d => d}).plot();
  assert.strictEqual(plot.scale("r"), undefined);
});

it("plot(…).scale(name) throws an error if there is no such named scale", () => {
  const plot = Plot.dot([1, 2], {x: d => d, y: d => d}).plot();
  assert.throws(() => plot.scale("z"), /unknown scale: z/);
});

it("plot(…).scale('x') can return a linear scale", () => {
  const plot = Plot.dot([1, 2], {x: d => d, y: d => d}).plot();
  assert.deepStrictEqual(plot.scale("x"), {
    type: "linear",
    domain: [1, 2],
    range: [40, 620],
    interpolate: d3.interpolate,
    clamp: false
  });
});

it("plot(…).scale('x') returns the expected linear scale for penguins", async () => {
  const penguins = await d3.csv("data/penguins.csv", d3.autoType);
  const plot = Plot.dotX(penguins, {x: "body_mass_g"}).plot();
  assert.deepStrictEqual(plot.scale("x"), {
    type: "linear",
    domain: [2700, 6300],
    range: [20, 620],
    interpolate: d3.interpolate,
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
  assert.deepStrictEqual(plot.scale("x"), {
    type: "pow",
    exponent: 0.5,
    domain: [3500, 4000],
    range: [30, 610],
    interpolate: d3.interpolate,
    clamp: true,
    label: "Body mass"
  });
});

it("plot(…).scale('x') can return a band scale", () => {
  const plot = Plot.cellX(["A", "B"]).plot();
  assert.deepStrictEqual(plot.scale("x"), {
    type: "band",
    domain: [0, 1],
    range: [20, 620],
    paddingInner: 0.1,
    paddingOuter: 0.1,
    align: 0.5,
    round: true
  });
});

it("plot(…).scale('x') can return a band scale, respecting the specified align and padding", () => {
  const plot = Plot.cellX(["A", "B"]).plot({x: {paddingOuter: -0.2, align: 1}});
  assert.deepStrictEqual(plot.scale("x"), {
    type: "band",
    domain: [0, 1],
    range: [20, 620],
    paddingInner: 0.1,
    paddingOuter: -0.2,
    align: 1,
    round: true
  });
});

it("plot(…).scale('y') can return a linear scale", () => {
  const plot = Plot.dot([1, 2], {x: d => d, y: d => d}).plot();
  assert.deepStrictEqual(plot.scale("y"), {
    type: "linear",
    domain: [1, 2],
    range: [370, 20],
    interpolate: d3.interpolate,
    clamp: false
  });
});

it("plot(…).scale('y') can return a band scale", () => {
  const plot = Plot.cellY(["A", "B"]).plot();
  assert.deepStrictEqual(plot.scale("y"), {
    type: "band",
    domain: [0, 1],
    range: [20, 80],
    paddingInner: 0.1,
    paddingOuter: 0.1,
    align: 0.5,
    round: true
  });
});

it("plot(…).scale('y') can return a band scale, respecting the specified align and padding", () => {
  const plot = Plot.cellY(["A", "B"]).plot({y: {paddingOuter: -0.2, align: 1}});
  assert.deepStrictEqual(plot.scale("y"), {
    type: "band",
    domain: [0, 1],
    range: [20, 80],
    paddingInner: 0.1,
    paddingOuter: -0.2,
    align: 1,
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
  assert.deepStrictEqual(plot.scale("fx"), {
    type: "band",
    domain: [1, 2],
    range: [40, 620],
    align: 0.5,
    paddingInner: 0.1,
    paddingOuter: 0,
    round: true
  });
});

it("plot(…).scale('fy') can return a band scale", () => {
  const data = [1, 2];
  const plot = Plot.dot(data, {y: d => d}).plot({facet: {data, y: data}});
  assert.deepStrictEqual(plot.scale("fy"), {
    type: "band",
    domain: [1, 2],
    range: [20, 380],
    align: 0.5,
    paddingInner: 0.1,
    paddingOuter: 0,
    round: true
  });
});

it("plot(…).scale(name) promotes the given zero option to the domain", async () => {
  const penguins = await d3.csv("data/penguins.csv", d3.autoType);
  const plot = Plot.dotX(penguins, {x: "body_mass_g"}).plot({x: {zero: true}});
  assert.deepStrictEqual(plot.scale("x"), {
    type: "linear",
    domain: [0, 6300],
    range: [20, 620],
    interpolate: d3.interpolate,
    clamp: false,
    label: "body_mass_g →"
  });
});

it("plot(…).scale('color') can return undefined if no color scale is present", () => {
  const plot = Plot.dot([1, 2], {x: d => d}).plot();
  assert.strictEqual(plot.scale("color"), undefined);
});

it("plot(…).scale('color') can return a linear scale", () => {
  const plot = Plot.dot([1, 2, 3, 4, 5], {y: d => d, fill: d => d}).plot();
  assert.deepStrictEqual(plot.scale("color"), {
    type: "linear",
    domain: [1, 5],
    interpolate: d3.interpolateTurbo,
    clamp: false
  });
});

it("plot(…).scale('color') can return a threshold scale with the default domain", async () => {
  const penguins = await d3.csv("data/penguins.csv", d3.autoType);
  const plot = Plot.dot(penguins, {x: "body_mass_g", fill: "body_mass_g"}).plot({color: {type: "threshold"}});
  assert.deepStrictEqual(plot.scale("color"), {
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
  assert.deepStrictEqual(plot.scale("color"), {
    type: "threshold",
    domain: [3000, 4000, 5000, 6000],
    range: d3.schemeRdYlBu[5],
    label: "body_mass_g"
  });
});

it("plot(…).scale('color') promotes a cyclical scale to a linear scale", () => {
  const plot = Plot.dot([1, 2, 3, 4, 5], {y: d => d, fill: d => d}).plot({color: {type: "cyclical"}});
  assert.deepStrictEqual(plot.scale("color"), {
    type: "linear",
    domain: [1, 5],
    interpolate: d3.interpolateRainbow,
    clamp: false
  });
});

it("plot(…).scale('color') promotes a cyclical scale to a linear scale, even when a scheme is specified", () => {
  const plot = Plot.dot([1, 2, 3, 4, 5], {y: d => d, fill: d => d}).plot({color: {type: "cyclical", scheme: "blues"}});
  assert.deepStrictEqual(plot.scale("color"), {
    type: "linear",
    domain: [1, 5],
    interpolate: d3.interpolateBlues,
    clamp: false
  });
});

it("plot(…).scale('color') promotes a cyclical scale to a linear scale and ignores the scheme when an interpolator is specified", () => {
  const plot = Plot.dot([1, 2, 3, 4, 5], {y: d => d, fill: d => d}).plot({color: {type: "cyclical", scheme: "blues", interpolate: d3.interpolateWarm}});
  assert.deepStrictEqual(plot.scale("color"), {
    type: "linear",
    domain: [1, 5],
    interpolate: d3.interpolateWarm,
    clamp: false
  });
});

it("plot(…).scale('color') promotes a sequential scale to a linear scale, even when a scheme is specified", () => {
  const plot = Plot.dot([1, 2, 3, 4, 5], {y: d => d, fill: d => d}).plot({color: {type: "sequential", scheme: "blues"}});
  assert.deepStrictEqual(plot.scale("color"), {
    type: "linear",
    domain: [1, 5],
    interpolate: d3.interpolateBlues,
    clamp: false
  });
});

it("plot(…).scale('color') promotes a sequential scale to a linear scale and ignores the scheme when an interpolator is specified", () => {
  const plot = Plot.dot([1, 2, 3, 4, 5], {y: d => d, fill: d => d}).plot({color: {type: "sequential", scheme: "blues", interpolate: d3.interpolateWarm}});
  assert.deepStrictEqual(plot.scale("color"), {
    type: "linear",
    domain: [1, 5],
    interpolate: d3.interpolateWarm,
    clamp: false
  });
});

it("plot(…).scale('color') promotes a sequential scale to a linear scale", () => {
  const plot = Plot.dot([1, 2, 3, 4, 5], {y: d => d, fill: d => d}).plot({color: {type: "sequential"}});
  assert.deepStrictEqual(plot.scale("color"), {
    type: "linear",
    domain: [1, 5],
    interpolate: d3.interpolateTurbo,
    clamp: false
  });
});

it("plot(…).scale('color') promotes a reversed sequential scale to a linear scale with a flipped interpolator", () => {
  const plot = Plot.dot([1, 2, 3, 4, 5], {y: d => d, fill: d => d}).plot({color: {type: "sequential", reverse: true}});
  const {interpolate, ...color} = plot.scale("color");
  assert.deepStrictEqual(color, {
    type: "linear",
    domain: [1, 5],
    clamp: false
  });
  for (const t of d3.ticks(1, 5, 100)) {
    assert.strictEqual(interpolate(t), d3.interpolateTurbo(1 - t));
  }
});

it("plot(…).scale('color') can return a categorical scale", () => {
  const plot = Plot.dot(["a", "b", "c", "d"], {y: d => d, fill: d => d}).plot();
  assert.deepStrictEqual(plot.scale("color"), {
    type: "categorical",
    domain: ["a", "b", "c", "d"],
    range: d3.schemeTableau10
  });
});

it("plot(…).scale('color') can return an explicitly categorical scale", () => {
  const plot = Plot.dot(["a", "b", "c", "d"], {y: d => d, fill: d => d}).plot({color: {type: "categorical"}});
  assert.deepStrictEqual(plot.scale("color"), {
    type: "categorical",
    domain: ["a", "b", "c", "d"],
    range: d3.schemeTableau10
  });
});

it("plot(…).scale('color') can return an ordinal scale", () => {
  const plot = Plot.dot(["a", "b", "c", "d"], {y: d => d, fill: d => d}).plot({color: {type: "ordinal"}});
  assert.deepStrictEqual(plot.scale("color"), {
    type: "ordinal",
    domain: ["a", "b", "c", "d"],
    range: d3.quantize(d3.interpolateTurbo, 4)
  });
});

it("plot(…).scale('r') can return undefined", () => {
  const plot = Plot.dot([1, 2], {x: d => d}).plot();
  assert.strictEqual(plot.scale("r"), undefined);
});

it("plot(…).scale('r') can return an implicit pow scale", () => {
  const plot = Plot.dot([1, 2, 3, 4, 9], {r: d => d}).plot();
  assert.deepStrictEqual(plot.scale("r"), {
    type: "pow",
    exponent: 0.5,
    domain: [0, 9],
    range: [0, Math.sqrt(40.5)],
    interpolate: d3.interpolate,
    clamp: false
  });
});

it("plot(…).scale('r') can return a pow scale for sqrt", () => {
  const plot = Plot.dot([1, 2, 3, 4, 9], {r: d => d}).plot({r: {type: "sqrt"}});
  assert.deepStrictEqual(plot.scale("r"), {
    type: "pow",
    exponent: 0.5,
    domain: [0, 9],
    range: [0, Math.sqrt(40.5)],
    interpolate: d3.interpolate,
    clamp: false
  });
});

it("plot(…).scale('r') can return an explicit pow scale", () => {
  const plot = Plot.dot([1, 2, 3, 4, 9], {r: d => d}).plot({r: {type: "pow", exponent: 0.3}});
  assert.deepStrictEqual(plot.scale("r"), {
    type: "pow",
    exponent: 0.3,
    domain: [0, 9],
    range: [0, Math.sqrt(40.5)],
    interpolate: d3.interpolate,
    clamp: false
  });
});

it("plot(…).scale('opacity') can return undefined", () => {
  const plot = Plot.dot([1, 2], {x: d => d}).plot();
  assert.strictEqual(plot.scale("opacity"), undefined);
});

it("plot(…).scale('opacity') can return a linear scale", () => {
  const plot = Plot.dot([1, 2, 3, 4, 9], {fillOpacity: d => d}).plot();
  assert.deepStrictEqual(plot.scale("opacity"), {
    type: "linear",
    domain: [0, 9],
    range: [0, 1],
    interpolate: d3.interpolate,
    clamp: false
  });
});

it("plot(…).scale('opacity') can return a linear scale for penguins", async () => {
  const penguins = await d3.csv("data/penguins.csv", d3.autoType);
  const plot = Plot.rectX(penguins, Plot.binX({fillOpacity: "count"}, {x: "body_mass_g", thresholds: 20})).plot();
  assert.deepStrictEqual(plot.scale("opacity"), {
    type: "linear",
    domain: [0, 40],
    range: [0, 1],
    interpolate: d3.interpolate,
    clamp: false,
    label: "Frequency"
  });
});

it("plot(…).scale('opacity') respects the percent option, affecting domain and label", async () => {
  const penguins = await d3.csv("data/penguins.csv", d3.autoType);
  const plot = Plot.rectX(penguins, Plot.binX({fillOpacity: "proportion"}, {x: "body_mass_g", thresholds: 20})).plot({opacity: {percent: true}});
  assert.deepStrictEqual(plot.scale("opacity"), {
    type: "linear",
    domain: [0, 11.627906976744185],
    range: [0, 1],
    interpolate: d3.interpolate,
    clamp: false,
    label: "Frequency (%)",
    percent: true
  });
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
  assert.deepStrictEqual(plot.scale("y"), {
    type: "log",
    domain: [1, 4],
    range: [380, 20],
    base: 10,
    interpolate: d3.interpolate,
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
  assert.deepStrictEqual(plot.scale("y"), {
    type: "symlog",
    domain: [1, 4],
    range: [380, 20],
    constant: 1,
    interpolate: d3.interpolate,
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
  assert.strictEqual(Plot.dotX(penguins, {x: "body_mass_g"}).plot({x: {round: false}}).scale("x").interpolate, d3.interpolate);
  assert.strictEqual(Plot.dotX(penguins, {x: "body_mass_g"}).plot({x: {round: true}}).scale("x").interpolate, d3.interpolateRound);
});

it("plot(…).scale(name).round reflects the round option for band scales", async () => {
  const penguins = await d3.csv("data/penguins.csv", d3.autoType);
  assert.deepStrictEqual(Plot.cell(penguins, {x: "species"}).plot({x: {}}).scale("x"), {
    type: "band",
    domain: ["Adelie", "Chinstrap", "Gentoo"],
    range: [20, 620],
    align: 0.5,
    paddingInner: 0.1,
    paddingOuter: 0.1,
    round: true,
    label: "species"
  });
});

it("plot(…).scale(name) reflects the given custom interpolator", async () => {
  const interpolate = (a, b) => t => +(t * (b - a) + a).toFixed(1);
  const penguins = await d3.csv("data/penguins.csv", d3.autoType);
  const plot = Plot.dotX(penguins, {x: "body_mass_g"}).plot({x: {interpolate}});
  assert.deepStrictEqual(plot.scale("x"), {
    type: "linear",
    domain: [2700, 6300],
    range: [20, 620],
    interpolate,
    clamp: false,
    label: "body_mass_g →"
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
  assert.deepStrictEqual(plot.scale("x"), {
    type: "linear",
    domain: [1 / 6300, 1 / 2700],
    range: [20, 620],
    clamp: false,
    interpolate: d3.interpolate,
    transform,
    label: "body_mass_g →"
  });
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

// TODO FIXME
it.skip("A diverging scale’s pivot is reusable", async () => {
  const data = await d3.csv("data/penguins.csv", d3.autoType);
  assertReusable({
    color: {
      type: "diverging",
      pivot: 5400,
      symmetric: false,
      reverse: false
    }
  },
  Plot.dotX(data, {fill: "body_mass_g", x: "body_mass_g", r: 9}));
});

// TODO FIXME
it.skip("A diverging-sqrt scale is reusable", async () => {
  const data = await d3.csv("data/penguins.csv", d3.autoType);
  assertReusable({
    color: {
      type: "diverging-sqrt",
      pivot: 3200,
      symmetric: false,
      scheme: "reds"
    }
  },
  Plot.dotX(data, {fill: "body_mass_g", x: "body_mass_g", r: 9}));
});

// TODO FIXME
it.skip("A diverging-pow scale is reusable", async () => {
  const data = await d3.csv("data/penguins.csv", d3.autoType);
  assertReusable({
    color: {
      type: "diverging-pow",
      exponent: 3.2,
      pivot: 3200,
      symmetric: false,
      scheme: "reds"
    }
  },
  Plot.dotX(data, {fill: "body_mass_g", x: "body_mass_g", r: 9}));
});

// TODO FIXME
it.skip("A diverging-symlog scale is reusable", async () => {
  const data = await d3.csv("data/penguins.csv", d3.autoType);
  assertReusable({
    color: {
      type: "diverging-symlog",
      pivot: 3200,
      constant: 3,
      symmetric: true,
      scheme: "cool"
    }
  },
  Plot.dotX(data, {fill: "body_mass_g", x: "body_mass_g", r: 9}));
});

// TODO FIXME
it.skip("A diverging-log scale is reusable", async () => {
  const data = await d3.csv("data/penguins.csv", d3.autoType);
  assertReusable({
    color: {
      type: "diverging-log",
      pivot: 3200,
      symmetric: false,
      range: ["red", "yellow", "blue"],
      interpolate: "hsl" // d3.interpolateHsl
    }
  },
  Plot.dotX(data, {fill: "body_mass_g", x: "body_mass_g", r: 9}));
});

it("A diverging-log scale with negative values is reusable", async () => {
  const data = await d3.csv("data/penguins.csv", d3.autoType);
  assertReusable(
    {
      color: {
        type: "diverging-log",
        domain: [-6000, -3000],
        pivot: -4500,
        constant: 3,
        symmetric: true,
        scheme: "cool"
      }
    },
    Plot.dotX(data, {fill: d => -d.body_mass, x: "body_mass", r: 9})
  );
});

it("A quantile scale is reusable", async () => {
  const data = await d3.csv("data/penguins.csv", d3.autoType);
  assertReusable({
    color: {
      type: "quantile",
      quantiles: 10,
      scheme: "warm"
    }
  },
  Plot.dotX(data, {fill: "body_mass_g", x: "body_mass_g", r: 9}));
});

it("Another quantile scale is reusable", async () => {
  const data = await d3.csv("data/penguins.csv", d3.autoType);
  assertReusable({
    color: {
      type: "quantile",
      quantiles: 3,
      scheme: "sinebow"
    }
  },
  Plot.dotX(data, {fill: "body_mass_g", x: "body_mass_g", r: 9}));
});

it("A quantile scale defined by a range is reusable", async () => {
  const data = await d3.csv("data/penguins.csv", d3.autoType);
  assertReusable({
    color: {
      type: "quantile",
      range: ["red", "yellow", "blue", "green"] // the range determines the number of quantiles
    }
  },
  Plot.dotX(data, {fill: "body_mass_g", x: "body_mass_g", r: 9}));
});

it("A default quantile scale defined by a continuous scheme is reusable", async () => {
  const data = await d3.csv("data/penguins.csv", d3.autoType);
  assertReusable({
    color: {
      type: "quantile",
      scheme: "warm"
    }
  },
  Plot.dotX(data, {fill: "body_mass_g", x: "body_mass_g", r: 9}));
});

it("A default quantile scale defined by an array scheme is reusable", async () => {
  const data = await d3.csv("data/penguins.csv", d3.autoType);
  assertReusable({
    color: {
      type: "quantile",
      scheme: "reds"
    }
  },
  Plot.dotX(data, {fill: "body_mass_g", x: "body_mass_g", r: 9}));
});

it("A quantile scale with a scheme and quantiles is reusable", async () => {
  const data = await d3.csv("data/penguins.csv", d3.autoType);
  assertReusable({
    color: {
      type: "quantile",
      scheme: "rdbu",
      quantiles: 12,
      reverse: true
    }
  },
  Plot.dotX(data, {fill: "body_mass_g", x: "body_mass_g", r: 9}));
});

it("A default ordinal scale is reusable", async () => {
  const data = await d3.csv("data/penguins.csv", d3.autoType);
  assertReusable({}, Plot.dotX(data, {fill: "island", x: "body_mass_g", r: 9}));
});

it("An explicit categorical scale is reusable", async () => {
  const data = await d3.csv("data/penguins.csv", d3.autoType);
  assertReusable(
    {color: {type: "categorical"}},
    Plot.dotX(data, {fill: "island", x: "body_mass_g", r: 9})
  );
});

it("A reversed ordinal scale is reusable", async () => {
  const data = await d3.csv("data/penguins.csv", d3.autoType);
  assertReusable(
    {
      color: {type: "ordinal", reverse: true}
    },
    Plot.dotX(data, {fill: "island", x: "body_mass_g", r: 9})
  );
});

it("a non-rounded ordinal scale is reusable", async () => {
  assertReusable(
    {
      x: {round: false, range: [100.1, 542.3]}
    },
    Plot.dotX(["A", "B", "C"], {x: d => d})
  );
});

it("a rounded ordinal scale is reusable", async () => {
  assertReusable(
    {
      x: {round: true, range: [100.1, 542.3]}
    },
    Plot.dotX(["A", "B", "C"], {x: d => d})
  );
});

it("An ordinal scheme with an explicit range is reusable", async () => {
  const data = await d3.csv("data/penguins.csv", d3.autoType);
  assertReusable(
    {
      color: {range: ["yellow", "lime", "grey"]}
    },
    Plot.dotX(data, {fill: "island", x: "body_mass_g", r: 9})
  );
});

it("An ordinal scheme with a large explicit range is reusable", async () => {
  const data = await d3.csv("data/penguins.csv", d3.autoType);
  assertReusable(
    {
      color: {range: ["yellow", "lime", "black", "red"]}
    },
    Plot.dotX(data, {fill: "island", x: "body_mass_g", r: 9})
  );
});

it("A reversed band scale is reusable", async () => {
  // const data = await d3.csv("data/penguins.csv", d3.autoType);
  assertReusable(
    {
      x: {reverse: false, type: "band"},
      y: {reverse: true},
      color: {type: "categorical"}
    },
    Plot.barY(
      "ABCDEF".split("").map(d => ({d})),
      {x: "d", y2: "d", fill: "d"}
    )
  );
});

it("A point scale with explicit align is reusable 0", async () => {
  const data = await d3.csv("data/penguins.csv", d3.autoType);
  assertReusable(
    {
      x: {type: "point", align: 0},
      r: {range: [2, 13]}
    },
    Plot.dotX(data, Plot.groupX({r: "count"}, {fill: "island", x: "island"}))
  );
});

it("A point scale with explicit align is reusable 0.7", async () => {
  const data = await d3.csv("data/penguins.csv", d3.autoType);
  assertReusable(
    {
      x: {type: "point", align: 0.7},
      r: {range: [2, 13]}
    },
    Plot.dotX(data, Plot.groupX({r: "count"}, {fill: "island", x: "island"}))
  );
});

it("A radius scale with an explicit range is reusable", async () => {
  const data = await d3.csv("data/penguins.csv", d3.autoType);
  assertReusable(
    {
      x: {type: "point"},
      r: {range: [2, 13]}
    },
    Plot.dotX(data, Plot.groupX({r: "count"}, {fill: "island", x: "island"}))
  );
});

it("A band scale is reusable", async () => {
  const data = await d3.csv("data/penguins.csv", d3.autoType);
  assertReusable(
    {
      x: {type: "band"}
    },
    Plot.cellX(
      data,
      Plot.groupX({fillOpacity: "count"}, {fill: "island", x: "island"})
    )
  );
});

it("A band scale with an explicit align is reusable 0", async () => {
  const data = await d3.csv("data/penguins.csv", d3.autoType);
  assertReusable(
    {
      x: {type: "band", align: 0}
    },
    Plot.cellX(
      data,
      Plot.groupX({fillOpacity: "count"}, {fill: "island", x: "island"})
    )
  );
});

it("A band scale with an explicit align is reusable 1", async () => {
  const data = await d3.csv("data/penguins.csv", d3.autoType);
  assertReusable(
    {
      x: {type: "band", align: 1}
    },
    Plot.cellX(
      data,
      Plot.groupX({fillOpacity: "count"}, {fill: "island", x: "island"})
    )
  );
});

it("A band scale with an explicit paddingInner is reusable", async () => {
  const data = await d3.csv("data/penguins.csv", d3.autoType);
  assertReusable(
    {
      x: {type: "band", paddingInner: 0.4}
    },
    Plot.cellX(
      data,
      Plot.groupX({fillOpacity: "count"}, {fill: "island", x: "island"})
    )
  );
});

it("A band scale with an explicit paddingOuter is reusable", async () => {
  const data = await d3.csv("data/penguins.csv", d3.autoType);
  assertReusable(
    {
      x: {type: "band", paddingOuter: 0.4}
    },
    Plot.cellX(
      data,
      Plot.groupX({fillOpacity: "count"}, {fill: "island", x: "island"})
    )
  );
});

it("A utc scale is reusable", () => {
  const dates = ["2002-01-07", "2003-06-09", "2004-01-01"].map(d3.isoParse);
  assertReusable(
    {
      x: {type: "utc"}
    },
    Plot.tickX(dates, {x: d => d})
  );
});

it("A time scale is reusable", () => {
  const dates = ["2002-01-07", "2003-06-09", "2004-01-01"].map(d3.isoParse);
  assertReusable(
    {
      x: {type: "time"}
    },
    Plot.tickX(dates, {x: d => d})
  );
});

it("The identity scale is reusable", async () => {
  assertReusable(
    {
      x: {type: "identity"},
      color: {type: "identity"}
    },
    Plot.tickX([100, 200, 300, 400], {
      x: d => d,
      stroke: ["red", "blue", "lime", "grey"]
    })
  );
});

it("Piecewise scales are reusable (polylinear)", async () => {
  assertReusable(
    {
      x: {type: "linear", domain: [0, 150, 500]},
      color: {
        type: "linear",
        domain: [0, 150, 500],
        range: ["yellow", "blue", "black"]
      }
    },
    Plot.tickX([100, 200, 300, 400], {
      x: d => d,
      stroke: d => d
    })
  );
});

it("Piecewise scales are reusable (polylinear interpolate)", async () => {
  assertReusable(
    {
      x: {type: "linear", domain: [0, 150, 500]},
      color: {
        type: "linear",
        domain: [0, 150, 500],
        scheme: "warm",
        reverse: true
      }
    },
    Plot.tickX([100, 200, 300, 400], {
      x: d => d,
      fill: d => d
    })
  );
});

it("Piecewise scales are reusable (polysqrt)", async () => {
  assertReusable(
    {
      x: {type: "sqrt", domain: [0, 150, 500]},
      color: {
        type: "sqrt",
        domain: [0, 150, 500],
        range: ["yellow", "blue", "black"]
      }
    },
    Plot.tickX([100, 200, 300, 400], {
      x: d => d,
      stroke: d => d
    })
  );
});

it("Piecewise scales are reusable (polypow)", async () => {
  assertReusable(
    {
      x: {type: "pow", exponent: 3.1, domain: [0, 150, 500]},
      color: {
        type: "pow",
        exponent: 3.1,
        domain: [0, 150, 500],
        range: ["yellow", "blue", "black"]
      }
    },
    Plot.tickX([100, 200, 300, 400], {
      x: d => d,
      stroke: d => d
    })
  );
});

it("Piecewise scales are reusable (polylog)", async () => {
  assertReusable(
    {
      x: {type: "log", domain: [0, 150, 500]},
      color: {
        type: "log",
        domain: [0, 150, 500],
        range: ["yellow", "blue", "black"]
      }
    },
    Plot.tickX([100, 200, 300, 400], {
      x: d => d,
      stroke: d => d
    })
  );
});

it("Piecewise scales are reusable (polysymlog)", async () => {
  assertReusable(
    {
      x: {type: "symlog", domain: [0, 150, 500]},
      color: {
        type: "symlog",
        domain: [0, 150, 500],
        range: ["yellow", "blue", "black"]
      }
    },
    Plot.tickX([100, 200, 300, 400], {
      x: d => d,
      stroke: d => d
    })
  );
});

it("A cyclical scale is reusable", async () => {
  const data = await d3.csv("data/penguins.csv", d3.autoType);
  assertReusable(
    {color: {type: "cyclical", pivot: 5000, symmetric: false}},
    Plot.dotX(data, {x: "body_mass", fill: "body_mass"})
  );
});

function assertReusable(scales, pl) {
  const plot = pl.plot(scales);
  const plot2 = pl.plot({
    fx: plot.scale("fx"),
    fy: plot.scale("fy"),
    x: plot.scale("x"),
    y: plot.scale("y"),
    color: plot.scale("color"),
    r: plot.scale("r"),
    opacity: plot.scale("opacity")
  });
  const plot3 = pl.plot({
    fx: plot2.scale("fx"),
    fy: plot2.scale("fy"),
    x: plot2.scale("x"),
    y: plot2.scale("y"),
    color: plot2.scale("color"),
    r: plot2.scale("r"),
    opacity: plot2.scale("opacity")
  });

  assert(plot3.innerHTML === plot.innerHTML);

  // now test with reverse
  if (scales.color) {
    scales.color.reverse = !scales.color.reverse;
    {
      const plot = pl.plot(scales);
      const plot2 = pl.plot({
        fx: plot.scale("fx"),
        fy: plot.scale("fy"),
        x: plot.scale("x"),
        y: plot.scale("y"),
        color: plot.scale("color"),
        r: plot.scale("r"),
        opacity: plot.scale("opacity")
      });
      const plot3 = pl.plot({
        fx: plot2.scale("fx"),
        fy: plot2.scale("fy"),
        x: plot2.scale("x"),
        y: plot2.scale("y"),
        color: plot2.scale("color"),
        r: plot2.scale("r"),
        opacity: plot2.scale("opacity")
      });

      assert(plot3.innerHTML === plot.innerHTML);
    }
  }
}
