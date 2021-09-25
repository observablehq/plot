import * as Plot from "@observablehq/plot";
import * as d3 from "d3";
import assert from "assert";
import {JSDOM} from "jsdom";
import {readFileSync} from "fs";
const {window} = new JSDOM("");
global.document = window.document;

const data = d3.csvParse(
  readFileSync("./test/data/penguins.csv").toString(),
  d3.autoType
);

it("plot(…).scale exposes the plot’s scales", () => {
  const plot = Plot.dot([1, 2], {x: d => d, y: d => d}).plot();
  const scales = plot.scale;
  assert.strictEqual(typeof scales, "function");
  assert(scales("x"));
  assert(scales("y"));
  assert.strictEqual(scales("r"), undefined);
});

it("plot(…).scale(z) throws an error if z ins not a registered scale", () => {
  const plot = Plot.dot([1, 2], {x: d => d, y: d => d}).plot();
  const scales = plot.scale;
  assert.throws(() => scales("z"));
});

it("plot(…).scale('x') exposes the plot’s x scale", () => {
  const x = Plot.dot([1, 2], {x: d => d})
    .plot()
    .scale("x");
  assert.deepStrictEqual(x.domain, [1, 2]);
  assert.deepStrictEqual(x.range, [20, 620]);
  assert.strictEqual(typeof x.interpolate, "function");
  assert.strictEqual(x.type, "linear");
  assert.strictEqual(x.clamp, undefined);
});

it("plot(…).scale('y') exposes the plot’s y scale", () => {
  const y0 = Plot.dot([1, 2], {x: d => d})
    .plot()
    .scale("y");
  assert.strictEqual(y0, undefined);
  const y = Plot.dot([1, 2], {y: d => d})
    .plot()
    .scale("y");
  assert.deepStrictEqual(y.domain, [1, 2]);
  assert.deepStrictEqual(y.range, [380, 20]);
  assert.strictEqual(typeof y.interpolate, "function");
  assert.strictEqual(y.type, "linear");
  assert.strictEqual(y.clamp, undefined);
});

it("plot(…).scale('fx') exposes the plot’s fx scale", () => {
  const fx0 = Plot.dot([1, 2], {x: d => d})
    .plot()
    .scale("fx");
  assert.strictEqual(fx0, undefined);
  const data = [1, 2];
  const fx = Plot.dot(data, {y: d => d})
    .plot({facet: {data, x: data}})
    .scale("fx");
  assert.deepStrictEqual(fx.domain, [1, 2]);
  assert.deepStrictEqual(fx.range, [40, 620]);
  assert.strictEqual(typeof fx.interpolate, "undefined");
  assert.strictEqual(fx.type, "band");
  assert.strictEqual(fx.clamp, undefined);
});

it("plot(…).scale('fy') exposes the plot’s fy scale", () => {
  const fy0 = Plot.dot([1, 2], {x: d => d})
    .plot()
    .scale("fy");
  assert.strictEqual(fy0, undefined);
  const data = [1, 2];
  const fy = Plot.dot(data, {y: d => d})
    .plot({facet: {data, y: data}})
    .scale("fy");
  assert.deepStrictEqual(fy.domain, [1, 2]);
  assert.deepStrictEqual(fy.range, [20, 380]);
  assert.strictEqual(typeof fy.interpolate, "undefined");
  assert.strictEqual(fy.type, "band");
  assert.strictEqual(fy.clamp, undefined);
});

it("plot(…).scale('color') exposes a continuous color scale", () => {
  const color0 = Plot.dot([1, 2], {x: d => d})
    .plot()
    .scale("color");
  assert.strictEqual(color0, undefined);
  const data = [1, 2, 3, 4, 5];
  const color = Plot.dot(data, {y: d => d, fill: d => d})
    .plot()
    .scale("color");
  assert.deepStrictEqual(color.domain, [1, 5]);
  assert.strictEqual(color.range, undefined);
  assert.strictEqual(typeof color.interpolate, "function");
  assert.strictEqual(color.type, "linear");
  assert.strictEqual(color.clamp, undefined);
});

it("plot(…).scale('color') exposes an ordinal color scale", () => {
  const data = ["a", "b", "c", "d"];
  const color = Plot.dot(data, {y: d => d, fill: d => d})
    .plot({color: {type: "ordinal"}})
    .scale("color");
  assert.deepStrictEqual(color.domain, data);
  assert.deepStrictEqual(color.range, [
    "rgb(35, 23, 27)",
    "rgb(46, 229, 174)",
    "rgb(254, 185, 39)",
    "rgb(144, 12, 0)"
  ]);
  assert.strictEqual(typeof color.interpolate, "undefined");
  assert.strictEqual(color.type, "ordinal");
  assert.strictEqual(color.clamp, undefined);
});

it("plot(…).scale('color') exposes a categorical color scale", () => {
  const data = ["a", "b", "c", "d"];
  const color = Plot.dot(data, {y: d => d, fill: d => d})
    .plot({color: {type: "categorical"}})
    .scale("color");
  assert.deepStrictEqual(color.domain, data);
  assert.deepStrictEqual(color.range, [
    "#4e79a7",
    "#f28e2c",
    "#e15759",
    "#76b7b2",
    "#59a14f",
    "#edc949",
    "#af7aa1",
    "#ff9da7",
    "#9c755f",
    "#bab0ab"
  ]);
  assert.strictEqual(typeof color.interpolate, "undefined");
  assert.strictEqual(color.type, "categorical");
  assert.strictEqual(color.clamp, undefined);
});

it("plot(…).scale('r') exposes a radius scale", () => {
  const r0 = Plot.dot([1, 2], {x: d => d})
    .plot()
    .scale("r");
  assert.strictEqual(r0, undefined);
  const data = [1, 2, 3, 4, 9];
  const r = Plot.dot(data, {r: d => d})
    .plot()
    .scale("r");
  assert.deepStrictEqual(r.domain, [0, 9]);
  assert.deepStrictEqual(r.range, [0, Math.sqrt(40.5)]);
  assert.strictEqual(typeof r.interpolate, "function");
  assert.strictEqual(r.type, "sqrt");
  assert.strictEqual(r.clamp, undefined);
});

it("plot(…).scale('opacity') exposes a linear scale", () => {
  const opacity0 = Plot.dot([1, 2], {x: d => d})
    .plot()
    .scale("opacity");
  assert.strictEqual(opacity0, undefined);
  const data = [1, 2, 3, 4, 9];
  const opacity = Plot.dot(data, {fillOpacity: d => d})
    .plot()
    .scale("opacity");
  assert.deepStrictEqual(opacity.domain, [0, 9]);
  assert.deepStrictEqual(opacity.range, [0, 1]);
  assert.strictEqual(typeof opacity.interpolate, "function");
  assert.strictEqual(opacity.type, "linear");
  assert.strictEqual(opacity.clamp, undefined);
});

it("plot(…).scale exposes inset domain", () => {
  assert.deepStrictEqual(scaleOpt({inset: null}).range, [20, 620]);
  assert.deepStrictEqual(scaleOpt({inset: 7}).range, [27, 613]);
});

it("plot(…).scale exposes clamp", () => {
  assert.strictEqual(scaleOpt({clamp: false}).clamp, undefined);
  assert.strictEqual(scaleOpt({clamp: true}).clamp, true);
});

it("plot(…).scale exposes rounded continuous scales", () => {
  assert.strictEqual(
    scaleOpt({round: true}).interpolate(0, 100)(Math.SQRT1_2),
    71
  );
});

it("plot(…).scale exposes label", () => {
  assert.strictEqual(scaleOpt({}).label, "x →");
  assert.strictEqual(scaleOpt({label: "value"}).label, "value");
  assert.strictEqual(scaleOpt({label: null}).label, null);

  // if label is undefined, return undefined; can be useful for small multiples
  const x = Plot.dot([{x: 1}, {x: 2}, {x: 3}], {x: d => d.x})
    .plot()
    .scale("x");
  assert.strictEqual(x.label, undefined);
});

it("plot(…).scale exposes color label", () => {
  const x = Plot.dot([{x: 1}, {x: 2}, {x: 3}], {fill: "x"})
    .plot()
    .scale("color");
  assert.strictEqual(x.label, "x");
  const y = Plot.dot([{x: 1}, {x: 2}, {x: 3}], {fill: "x"})
    .plot({color: {label: "y"}})
    .scale("color");
  assert.strictEqual(y.label, "y");
});

it("plot(…).scale exposes the radius label", () => {
  const x = Plot.dot([{x: 1}, {x: 2}, {x: 3}], {r: "x"})
    .plot()
    .scale("r");
  assert.strictEqual(x.label, "x");
  const r = Plot.dot([{x: 1}, {x: 2}, {x: 3}], {r: "x"})
    .plot({r: {label: "radius"}})
    .scale("r");
  assert.strictEqual(r.label, "radius");
});

it("plot(…).scale expose pow exponent", () => {
  const x = Plot.dotX([])
    .plot({x: {type: "pow", exponent: 0.3}})
    .scale("x");
  assert.strictEqual(x.type, "pow");
  assert.strictEqual(x.exponent, 0.3);
  const y = Plot.dotX([])
    .plot({x: {type: "sqrt"}})
    .scale("x");
  assert.strictEqual(y.type, "sqrt");
  assert.strictEqual(y.exponent, 0.5);
});

it("plot(…).scale expose log base", () => {
  const x = Plot.dotX([])
    .plot({x: {type: "log", base: 2}})
    .scale("x");
  assert.strictEqual(x.type, "log");
  assert.strictEqual(x.base, 2);
});

it("plot(…).scale expose symlog constant", () => {
  const x = Plot.dotX([])
    .plot({x: {type: "symlog", constant: 42}})
    .scale("x");
  assert.strictEqual(x.type, "symlog");
  assert.strictEqual(x.constant, 42);
});

it("plot(…).scale expose align, paddingInner and paddingOuter", () => {
  const x = Plot.cellX(["A", "B"])
    .plot({x: {paddingOuter: -0.2, align: 1}})
    .scale("x");
  assert.strictEqual(x.type, "band");
  assert.strictEqual(x.align, 1);
  assert.strictEqual(x.paddingInner, 0.1);
  assert.strictEqual(x.paddingOuter, -0.2);
});

it("plot(…).scale does not expose unexpected scale options", () => {
  const x = Plot.dotX([])
    .plot({x: {lala: 42, width: 420}})
    .scale("x");
  assert.strictEqual(x.lala, undefined);
  assert.strictEqual(x.width, undefined);
});

function scaleOpt(x) {
  return Plot.dot([{x: 1}, {x: 2}, {x: 3}], {x: "x"})
    .plot({x})
    .scale("x");
}

it("default linear scale has the expected value", () => {
  const p = Plot.dotX(data, {x: "body_mass_g"}).plot();
  const x = p.scale("x");
  assert.deepEqual(Object.keys(x), [
    "type",
    "domain",
    "range",
    "interpolate",
    "label"
  ]);
  assert.deepEqual(x.domain, [2700, 6300]);
  assert.deepEqual(x.range, [20, 620]);
  assert.equal(x.interpolate(0, 1)(0.15), 0.15);
  assert.equal(x.clamp, undefined);
  assert.equal(x.type, "linear");
  assert.equal(x.align, undefined);
  assert.equal(x.label, "body_mass_g →");
});

it("sqrt scale x honors explicit values", () => {
  const p = Plot.dotX(data, {x: "body_mass_g"}).plot({
    x: {
      domain: [3500, 4000],
      range: [30, 610],
      label: "Body mass",
      type: "sqrt",
      clamp: true
    }
  });
  const x = p.scale("x");
  assert.deepEqual(Object.keys(x), [
    "type",
    "domain",
    "range",
    "interpolate",
    "clamp",
    "label",
    "exponent"
  ]);
  assert.deepEqual(x.domain, [3500, 4000]);
  assert.deepEqual(x.range, [30, 610]);
  assert.equal(x.exponent, 0.5);
  assert.equal(x.interpolate(0, 1)(0.15), 0.15);
  assert.equal(x.clamp, true);
  assert.equal(x.type, "sqrt");
  assert.equal(x.label, "Body mass");
});

it("nice and inset are subsumed in the domain and range", () => {
  const p = Plot.dotX(data, {x: "body_mass_g"}).plot({
    x: {
      nice: true,
      inset: 20
    }
  });
  const x = p.scale("x");
  assert.deepEqual(Object.keys(x), [
    "type",
    "domain",
    "range",
    "interpolate",
    "label"
  ]);
  assert.deepEqual(x.domain, [2500, 6500]);
  assert.deepEqual(x.range, [40, 600]);
});

it("quantitative round is subsumed in the interpolator", () => {
  const p = Plot.dotX(data, {x: "body_mass_g"}).plot({x: {round: true}});
  const x = p.scale("x");
  assert.deepEqual(Object.keys(x), [
    "type",
    "domain",
    "range",
    "interpolate",
    "label"
  ]);
  assert.deepEqual(x.domain, [2700, 6300]);
  assert.deepEqual(x.range, [20, 620]);
  assert.equal(x.interpolate(0, 100)(1 / 3), 33);
  assert.equal(x.clamp, undefined); // undefined would be fine too!
  assert.equal(x.type, "linear");
  assert.equal(x.align, undefined);
  assert.equal(x.label, "body_mass_g →");
});

it("custom interpolators are honored", () => {
  const p = Plot.dotX(data, {x: "body_mass_g"}).plot({
    x: {interpolate: (a, b) => t => +(t * (b - a) + a).toFixed(1)}
  });
  const x = p.scale("x");
  assert.deepEqual(Object.keys(x), [
    "type",
    "domain",
    "range",
    "interpolate",
    "label"
  ]);
  assert.deepEqual(x.domain, [2700, 6300]);
  assert.deepEqual(x.range, [20, 620]);
  assert.equal(x.interpolate(0, 100)(1 / 3), 33.3);
  assert.equal(x.type, "linear");
  assert.equal(x.align, undefined);
  assert.equal(x.label, "body_mass_g →");
});

// TODO Determine why this is failing, and fix.
it.skip("A continuous scheme on a continuous dimension is returned as an interpolator", () => {
  const p = Plot.dotX(data, {fill: "body_mass_g"}).plot({fill: {scheme: "warm"}});
  const x = p.scale("color");
  assert.equal(x.interpolate(0, 100)(1 / 3), "rgb(46, 229, 174)");
});

it("A continuous scheme on an ordinal dimension is returned as a range of the same length", () => {
  const p = Plot.dotX(data, {fill: "island"}).plot({
    color: {scheme: "warm"}
  });
  const x = p.scale("color");
  assert.deepEqual(x.range, [
    "rgb(110, 64, 170)",
    "rgb(255, 94, 99)",
    "rgb(175, 240, 91)"
  ]);
  assert.equal(x.range.length, x.domain.length);

  const pr = Plot.dotX(data, {fill: "island"}).plot({
    color: {scheme: "reds"}
  });
  const xr = pr.scale("color");
  assert.deepEqual(xr.range, ["#fee0d2", "#fc9272", "#de2d26"]);
});

it("An ordinal scheme on an ordinal dimension is returned as a range", () => {
  const p = Plot.dotX(data, {fill: "island"}).plot({
    color: {scheme: "category10"}
  });
  const x = p.scale("color");
  assert.deepEqual(x.range, [
    "#1f77b4",
    "#ff7f0e",
    "#2ca02c",
    "#d62728",
    "#9467bd",
    "#8c564b",
    "#e377c2",
    "#7f7f7f",
    "#bcbd22",
    "#17becf"
  ]);
});

it("Continuous non-linear scales are accompanied by their parameters", () => {
  const sqrt = Plot.dotX(data, {x: "body_mass_g"})
    .plot({x: {type: "sqrt"}})
    .scale("x");
  assert.equal(sqrt.type, "sqrt");

  const pow = Plot.dotX(data, {x: "body_mass_g"})
    .plot({x: {type: "pow", exponent: 1.7}})
    .scale("x");
  assert.equal(pow.type, "pow");
  assert.equal(pow.exponent, 1.7);

  const log = Plot.dotX(data, {x: "body_mass_g"})
    .plot({x: {type: "log", base: 7}})
    .scale("x");
  assert.equal(log.type, "log");
  assert.equal(log.base, 7);

  const symlog = Plot.dotX(data, {x: "body_mass_g"})
    .plot({x: {type: "symlog", constant: 3}})
    .scale("x");
  assert.equal(symlog.type, "symlog");
  assert.equal(symlog.constant, 3);
});

it("All the expected scales are returned; non-instantiated scales are undefined; non-existing scales throw an error", () => {
  const p = Plot.dotX(data, {fill: "island"}).plot();
  assert(p.scale("x"));
  assert.equal(p.scale("y"), undefined);
  assert.equal(p.scale("fx"), undefined);
  assert.equal(p.scale("fy"), undefined);
  assert.equal(p.scale("r"), undefined);
  assert(p.scale("color"));
  assert.equal(p.scale("opacity"), undefined);
  assert.throws(() => p.scale("nonexistent"));
});

it("An opacity scale has the expected defaults", () => {
  const p = Plot.rectX(
    data,
    Plot.binX({fillOpacity: "count"}, {x: "body_mass_g", thresholds: 20})
  ).plot({
    opacity: {percent: true}
  });
  const x = p.scale("opacity");
  assert.deepEqual(x.domain, [0, 4000]);
  assert.deepEqual(x.range, [0, 1]);
  assert.equal(x.interpolate(0, 10)(0.15), 1.5);
  assert.equal(x.clamp, undefined);
  assert.equal(x.type, "linear");
  assert.equal(x.percent, true);
  assert.equal(x.label, "Frequency (%)");
});

it("scale.transform is exposed and reusable", () => {
  isReusable({x: {transform: d => 1 / d}});
});

it("scale.zero is subsumed in the domain and reusable", () => {
  isReusable({
    x: {zero: true},
    color: {zero: true}
  });
});

it("A diverging scale’s pivot is reusable", () => {
  isReusable({
    color: {
      type: "diverging",
      pivot: 5400,
      symmetric: false,
      reverse: false
    }
  });
});

it("A diverging-sqrt scale is reusable", () => {
  isReusable({
    color: {
      type: "diverging-sqrt",
      pivot: 3200,
      symmetric: false,
      scheme: "reds"
    }
  });
});

it("A diverging-pow scale is reusable", () => {
  isReusable({
    color: {
      type: "diverging-pow",
      exponent: 3.2,
      pivot: 3200,
      symmetric: false,
      scheme: "reds"
    }
  });
});

it("A diverging-symlog scale is reusable", () => {
  isReusable({
    color: {
      type: "diverging-symlog",
      pivot: 3200,
      constant: 3,
      symmetric: true,
      scheme: "cool"
    }
  });
});

it("A diverging-log scale is reusable", () => {
  isReusable({
    color: {
      type: "diverging-log",
      pivot: 3200,
      symmetric: false,
      range: ["red", "yellow", "blue"],
      interpolate: "hsl" // d3.interpolateHsl
    }
  });
});

it("A diverging-log scale with negative values is reusable", () => {
  isReusable(
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

it("The default cyclical scale is reusable", () => {
  isReusable({
    color: {
      type: "cyclical",
      domain: [1000, 6000]
    }
  });
});

it("A scheme-based scale is reusable", () => {
  isReusable({
    color: {
      type: "cyclical", // superseded by scheme and interpolate
      scheme: "blues",
      domain: [0, 10000]
    }
  });
});

it("An interpolate-based scale is reusable", () => {
  isReusable({
    color: {
      type: "cyclical", // superseded by scheme and interpolate
      scheme: "blues", // superseded by interpolate
      interpolate: d3.interpolateWarm
    }
  });
});

it("A sequential scale is reusable", () => {
  isReusable({
    color: {
      type: "sequential",
      reverse: true
    }
  });
});

it("A sequential-scheme scale and reusable", () => {
  isReusable({
    color: {
      type: "sequential", // superseded by scheme and interpolate
      scheme: "blues"
    }
  });
});

it("A sequential-interpolate scale is reusable", () => {
  isReusable({
    color: {
      type: "sequential", // superseded by scheme and interpolate
      scheme: "blues", // superseded by interpolate
      interpolate: d3.interpolateWarm
    }
  });
});

it("A simple threshold scale is reusable", () => {
  isReusable({
    color: {
      type: "threshold",
      domain: d3.range(2000, 7000, 500)
    }
  });
});

it("A quantile scale is reusable", () => {
  isReusable({
    color: {
      type: "quantile",
      quantiles: 10,
      scheme: "warm"
    }
  });
});

it("Another quantile scale is reusable", () => {
  isReusable({
    color: {
      type: "quantile",
      quantiles: 3,
      scheme: "sinebow"
    }
  });
});

it("A quantile scale defined by a range is reusable", () => {
  isReusable({
    color: {
      type: "quantile",
      range: ["red", "yellow", "blue", "green"] // the range determines the number of quantiles
    }
  });
});

it("A default quantile scale defined by a continuous scheme is reusable", () => {
  isReusable({
    color: {
      type: "quantile",
      scheme: "warm"
    }
  });
});

it("A default quantile scale defined by an array scheme is reusable", () => {
  isReusable({
    color: {
      type: "quantile",
      scheme: "reds"
    }
  });
});

it("A quantile scale with a scheme and quantiles is reusable", () => {
  isReusable({
    color: {
      type: "quantile",
      scheme: "rdbu",
      quantiles: 12,
      reverse: true
    }
  });
});

it("A default ordinal scale is reusable", () => {
  isReusable({}, Plot.dotX(data, {fill: "island", x: "body_mass_g", r: 9}));
});

it("An explicit categorical scale is reusable", () => {
  isReusable(
    {color: {type: "categorical"}},
    Plot.dotX(data, {fill: "island", x: "body_mass_g", r: 9})
  );
});

it("A reversed ordinal scale is reusable", () => {
  isReusable(
    {
      color: {type: "ordinal", reverse: true}
    },
    Plot.dotX(data, {fill: "island", x: "body_mass_g", r: 9})
  );
});

it("a non-rounded ordinal scale is reusable", () => {
  isReusable(
    {
      x: {round: false, range: [100.1, 542.3]}
    },
    Plot.dotX(["A", "B", "C"], {x: d => d})
  );
});

it("a rounded ordinal scale is reusable", () => {
  isReusable(
    {
      x: {round: true, range: [100.1, 542.3]}
    },
    Plot.dotX(["A", "B", "C"], {x: d => d})
  );
});

it("An ordinal scheme with an explicit range is reusable", () => {
  isReusable(
    {
      color: {range: ["yellow", "lime", "grey"]}
    },
    Plot.dotX(data, {fill: "island", x: "body_mass_g", r: 9})
  );
});

it("An ordinal scheme with a large explicit range is reusable", () => {
  isReusable(
    {
      color: {range: ["yellow", "lime", "black", "red"]}
    },
    Plot.dotX(data, {fill: "island", x: "body_mass_g", r: 9})
  );
});

it("A reversed band scale is reusable", () => {
  isReusable(
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

it("A point scale with explicit align is reusable 0", () => {
  isReusable(
    {
      x: {type: "point", align: 0},
      r: {range: [2, 13]}
    },
    Plot.dotX(data, Plot.groupX({r: "count"}, {fill: "island", x: "island"}))
  );
});

it("A point scale with explicit align is reusable 0.7", () => {
  isReusable(
    {
      x: {type: "point", align: 0.7},
      r: {range: [2, 13]}
    },
    Plot.dotX(data, Plot.groupX({r: "count"}, {fill: "island", x: "island"}))
  );
});

it("A radius scale with an explicit range is reusable", () => {
  isReusable(
    {
      x: {type: "point"},
      r: {range: [2, 13]}
    },
    Plot.dotX(data, Plot.groupX({r: "count"}, {fill: "island", x: "island"}))
  );
});

it("A band scale is reusable", () => {
  isReusable(
    {
      x: {type: "band"}
    },
    Plot.cellX(
      data,
      Plot.groupX({fillOpacity: "count"}, {fill: "island", x: "island"})
    )
  );
});

it("A band scale with an explicit align is reusable 0", () => {
  isReusable(
    {
      x: {type: "band", align: 0}
    },
    Plot.cellX(
      data,
      Plot.groupX({fillOpacity: "count"}, {fill: "island", x: "island"})
    )
  );
});

it("A band scale with an explicit align is reusable 1", () => {
  isReusable(
    {
      x: {type: "band", align: 1}
    },
    Plot.cellX(
      data,
      Plot.groupX({fillOpacity: "count"}, {fill: "island", x: "island"})
    )
  );
});

it("A band scale with an explicit paddingInner is reusable", () => {
  isReusable(
    {
      x: {type: "band", paddingInner: 0.4}
    },
    Plot.cellX(
      data,
      Plot.groupX({fillOpacity: "count"}, {fill: "island", x: "island"})
    )
  );
});

it("A band scale with an explicit paddingOuter is reusable", () => {
  isReusable(
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
  isReusable(
    {
      x: {type: "utc"}
    },
    Plot.tickX(dates, {x: d => d})
  );
});

it("A time scale is reusable", () => {
  const dates = ["2002-01-07", "2003-06-09", "2004-01-01"].map(d3.isoParse);
  isReusable(
    {
      x: {type: "time"}
    },
    Plot.tickX(dates, {x: d => d})
  );
});

it("The identity scale is reusable", () => {
  isReusable(
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

it("Piecewise scales are reusable (polylinear)", () => {
  isReusable(
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

it("Piecewise scales are reusable (polysqrt)", () => {
  isReusable(
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

it("Piecewise scales are reusable (polypow)", () => {
  isReusable(
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

it("Piecewise scales are reusable (polylog)", () => {
  isReusable(
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

it("Piecewise scales are reusable (polysymlog)", () => {
  isReusable(
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

it("A cyclical scale is reusable", () => {
  isReusable(
    {color: {type: "cyclical", pivot: 5000, symmetric: false}},
    Plot.dotX(data, {x: "body_mass", fill: "body_mass"})
  );
});

function isReusable(
  scales,
  pl = Plot.dotX(data, {fill: "body_mass_g", x: "body_mass_g", r: 9})
) {
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
