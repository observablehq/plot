import * as Plot from "@observablehq/plot";
import * as d3 from "d3";
import assert from "assert";
import it from "./jsdom.js";

it("brush() renders without error", async () => {
  const data = await d3.csv<any>("data/penguins.csv", d3.autoType);
  const plot = Plot.plot({
    marks: [Plot.dot(data, {x: "culmen_length_mm", y: "culmen_depth_mm"}), Plot.brush()]
  });
  assert.ok(plot.querySelector("[aria-label=brush]"), "brush mark should exist");
  assert.ok(plot.querySelector(".selection"), "brush selection rect should exist");
});

it("brush with inactive/context/focus marks renders correctly", async () => {
  const data = await d3.csv<any>("data/penguins.csv", d3.autoType);
  const brush = new Plot.Brush();
  const xy = {x: "culmen_length_mm", y: "culmen_depth_mm"};
  const plot = Plot.plot({
    marks: [
      Plot.dot(data, brush.inactive({...xy, fill: "species", r: 2})),
      Plot.dot(data, brush.context({...xy, fill: "#ccc", r: 2})),
      Plot.dot(data, brush.focus({...xy, fill: "species", r: 3})),
      brush
    ]
  });
  assert.ok(plot.querySelector("[aria-label=brush]"), "brush mark should exist");

  const dotGroups = plot.querySelectorAll("[aria-label=dot]");
  // inactive dots should be visible initially
  assert.ok(dotGroups[0].childNodes.length > 0, "inactive dots should be visible initially");
  // context dots should be hidden initially
  assert.equal(dotGroups[1].childNodes.length, 0, "context dots should be hidden initially");
  // focus dots should be hidden initially
  assert.equal(dotGroups[2].childNodes.length, 0, "focus dots should be hidden initially");
});

it("brush dispatches value on programmatic brush move", async () => {
  const data = [
    {x: 10, y: 10},
    {x: 20, y: 20},
    {x: 30, y: 30},
    {x: 40, y: 40},
    {x: 50, y: 50}
  ];
  const brush = new Plot.Brush();
  const plot = Plot.plot({
    x: {domain: [0, 60]},
    y: {domain: [0, 60]},
    marks: [
      Plot.dot(data, brush.inactive({x: "x", y: "y"})),
      Plot.dot(data, brush.context({x: "x", y: "y", fill: "#ccc"})),
      Plot.dot(data, brush.focus({x: "x", y: "y", fill: "red"})),
      brush
    ]
  });

  const values: any[] = [];
  plot.addEventListener("input", () => values.push(plot.value));

  // Programmatically move the brush in data space
  brush.move({x1: 10, x2: 45, y1: 10, y2: 45});

  // Programmatic brush.move fires start, brush, end events
  assert.ok(values.length >= 3, "should have dispatched at least three values");

  // Intermediate values (start, brush) should be pending
  const intermediates = values.slice(0, -1);
  for (const v of intermediates) {
    assert.equal(v.pending, true, "intermediate value should be pending");
  }

  // The committed value (end) should not be pending
  const lastValue = values[values.length - 1];
  assert.ok(lastValue, "last value should not be null");
  assert.ok(!("pending" in lastValue), "committed value should not be pending");
  assert.ok(typeof lastValue.filter === "function", "value should have a filter function");

  // Check filtered elements
  const filtered = data.filter((d) => lastValue.filter(d.x, d.y));
  assert.ok(filtered.length > 0, "should have filtered some elements");
  assert.ok(filtered.length < data.length, "should not include all elements");
});

it("brush faceted filter restricts to the brushed facet", async () => {
  const penguins = await d3.csv<any>("data/penguins.csv", d3.autoType);
  const b = new Plot.Brush();
  const xy = {x: "culmen_length_mm", y: "culmen_depth_mm", fx: "species"};
  const plot = Plot.plot({
    marks: [
      Plot.dot(penguins, b.inactive({...xy, r: 2})),
      Plot.dot(penguins, b.context({...xy, fill: "#ccc", r: 2})),
      Plot.dot(penguins, b.focus({...xy, r: 3})),
      b
    ]
  });

  let lastValue: any;
  plot.addEventListener("input", () => (lastValue = plot.value));

  // Brush a region in the first facet (data coordinates)
  b.move({x1: 35, x2: 50, y1: 14, y2: 20, fx: "Adelie"});

  assert.ok(lastValue, "should have a value");
  assert.ok(lastValue.fx !== undefined, "value should include fx");

  // Filter WITH facet (correct)
  const filteredWithFacet = penguins.filter((d: any) =>
    lastValue.filter(d.culmen_length_mm, d.culmen_depth_mm, d.species)
  );

  // Filter mistakenly WITHOUT facet
  const filteredWithoutFacet = penguins.filter(
    (d: any) =>
      d.culmen_length_mm >= lastValue.x1 &&
      d.culmen_length_mm <= lastValue.x2 &&
      d.culmen_depth_mm >= lastValue.y1 &&
      d.culmen_depth_mm <= lastValue.y2
  );

  assert.ok(filteredWithFacet.length > 0, "should select some points");
  assert.ok(
    filteredWithFacet.length < filteredWithoutFacet.length,
    `facet filter should be stricter (${filteredWithFacet.length} < ${filteredWithoutFacet.length})`
  );

  // All filtered points should belong to a single species
  const species = new Set(filteredWithFacet.map((d: any) => d.species));
  assert.equal(species.size, 1, `all filtered points should be one species, got: ${[...species]}`);
});

it("brush programmatic move on second facet selects the correct facet", async () => {
  const penguins = await d3.csv<any>("data/penguins.csv", d3.autoType);
  const b = new Plot.Brush();
  const xy = {x: "culmen_length_mm", y: "culmen_depth_mm", fx: "species"};
  const plot = Plot.plot({
    marks: [
      Plot.dot(penguins, b.inactive({...xy, r: 2})),
      Plot.dot(penguins, b.context({...xy, fill: "#ccc", r: 2})),
      Plot.dot(penguins, b.focus({...xy, r: 3})),
      b
    ]
  });

  let lastValue: any;
  plot.addEventListener("input", () => (lastValue = plot.value));

  // Brush the second facet (Chinstrap) using data coordinates
  b.move({x1: 35, x2: 50, y1: 14, y2: 20, fx: "Chinstrap"});

  assert.ok(lastValue, "should have a value");
  assert.ok(lastValue.fx !== undefined, "value should include fx");
  assert.equal(lastValue.fx, "Chinstrap", "fx should be Chinstrap (the second facet)");

  const filtered = penguins.filter((d: any) => lastValue.filter(d.culmen_length_mm, d.culmen_depth_mm, d.species));
  assert.ok(filtered.length > 0, "should select some points");

  const species = new Set(filtered.map((d: any) => d.species));
  assert.equal(species.size, 1, "all filtered points should be one species");
  assert.equal([...species][0], "Chinstrap", "filtered species should be Chinstrap");
});

it("brush faceted filter without fx selects across all facets", async () => {
  const penguins = await d3.csv<any>("data/penguins.csv", d3.autoType);
  const b = new Plot.Brush();
  const xy = {x: "culmen_length_mm", y: "culmen_depth_mm", fx: "species"};
  const plot = Plot.plot({
    marks: [Plot.dot(penguins, b.inactive({...xy, r: 2})), b]
  });

  let lastValue: any;
  plot.addEventListener("input", () => (lastValue = plot.value));
  b.move({x1: 35, x2: 50, y1: 14, y2: 20, fx: "Adelie"});

  // With fx: restricts to Adelie
  const withFx = penguins.filter((d: any) => lastValue.filter(d.culmen_length_mm, d.culmen_depth_mm, d.species));
  assert.ok(
    withFx.every((d: any) => d.species === "Adelie"),
    "with fx should only select Adelie"
  );

  // Without fx: selects across all facets
  const withoutFx = penguins.filter((d: any) => lastValue.filter(d.culmen_length_mm, d.culmen_depth_mm));
  const species = new Set(withoutFx.map((d: any) => d.species));
  assert.ok(species.size > 1, `without fx should select multiple species, got: ${[...species]}`);
  assert.ok(withoutFx.length > withFx.length, "without fx should select more points");
});

it("brush cross-facet filter selects across all facets", async () => {
  const penguins = await d3.csv<any>("data/penguins.csv", d3.autoType);
  const b = new Plot.Brush({sync: true});
  const xy = {x: "culmen_length_mm", y: "culmen_depth_mm", fx: "species"};
  const plot = Plot.plot({
    marks: [Plot.dot(penguins, b.inactive({...xy, r: 2})), b]
  });

  let lastValue: any;
  plot.addEventListener("input", () => (lastValue = plot.value));
  b.move({x1: 35, x2: 50, y1: 14, y2: 20, fx: "Adelie"});

  assert.ok(lastValue, "should have a value");
  assert.ok(lastValue.fx !== undefined, "value should include fx (origin facet)");

  // Without fx: selects across all facets
  const withoutFx = penguins.filter((d: any) => lastValue.filter(d.culmen_length_mm, d.culmen_depth_mm));
  const species = new Set(withoutFx.map((d: any) => d.species));
  assert.ok(species.size > 1, `should select multiple species, got: ${[...species]}`);

  // With fx: restricts to the origin facet
  const withFx = penguins.filter((d: any) => lastValue.filter(d.culmen_length_mm, d.culmen_depth_mm, d.species));
  const fxSpecies = new Set(withFx.map((d: any) => d.species));
  assert.equal(fxSpecies.size, 1, "with fx should restrict to origin facet");
  assert.ok(withFx.length < withoutFx.length, "with fx should select fewer points");
});

it("brush faceted filter with fx and fy supports partial facet args", async () => {
  const penguins = await d3.csv<any>("data/penguins.csv", d3.autoType);
  const b = new Plot.Brush();
  const xy = {x: "culmen_length_mm", y: "culmen_depth_mm", fx: "species", fy: "sex"};
  const plot = Plot.plot({
    marks: [Plot.dot(penguins, b.inactive({...xy, r: 2})), b]
  });

  let lastValue: any;
  plot.addEventListener("input", () => (lastValue = plot.value));
  b.move({x1: 35, x2: 50, y1: 14, y2: 20, fx: "Adelie", fy: "MALE"});

  // Both fx and fy: restricts to Adelie MALE
  const withBoth = penguins.filter((d: any) =>
    lastValue.filter(d.culmen_length_mm, d.culmen_depth_mm, d.species, d.sex)
  );
  assert.ok(withBoth.length > 0, "should select some points");
  assert.ok(
    withBoth.every((d: any) => d.species === "Adelie" && d.sex === "MALE"),
    "should only select Adelie MALE"
  );

  // Only fx (fy undefined): restricts to Adelie, any sex
  const withFx = penguins.filter((d: any) => lastValue.filter(d.culmen_length_mm, d.culmen_depth_mm, d.species));
  assert.ok(withFx.length >= withBoth.length, "with fx only should select at least as many");
  assert.ok(
    withFx.every((d: any) => d.species === "Adelie"),
    "with fx only should restrict to Adelie"
  );
  const sexes = new Set(withFx.map((d: any) => d.sex));
  assert.ok(sexes.size > 1, `with fx only should include multiple sexes, got: ${[...sexes]}`);

  // Only fy (fx undefined): restricts to MALE, any species
  const withFy = penguins.filter((d: any) => lastValue.filter(d.culmen_length_mm, d.culmen_depth_mm, undefined, d.sex));
  assert.ok(withFy.length >= withBoth.length, "with fy only should select at least as many");
  assert.ok(
    withFy.every((d: any) => d.sex === "MALE"),
    "with fy only should restrict to MALE"
  );
  const spp = new Set(withFy.map((d: any) => d.species));
  assert.ok(spp.size > 1, `with fy only should include multiple species, got: ${[...spp]}`);

  // Neither fx nor fy: selects across all facets
  const withNeither = penguins.filter((d: any) => lastValue.filter(d.culmen_length_mm, d.culmen_depth_mm));
  assert.ok(withNeither.length >= withFx.length, "without facets should select at least as many as fx only");
  assert.ok(withNeither.length >= withFy.length, "without facets should select at least as many as fy only");
  const allSpecies = new Set(withNeither.map((d: any) => d.species));
  const allSexes = new Set(withNeither.map((d: any) => d.sex));
  assert.ok(allSpecies.size > 1, "without facets should include multiple species");
  assert.ok(allSexes.size > 1, "without facets should include multiple sexes");
});

it("brush reactive marks compose with user render transforms", () => {
  const data = [
    {x: 10, y: 10},
    {x: 20, y: 20},
    {x: 30, y: 30}
  ];
  const brush = new Plot.Brush();
  const rendered: string[] = [];
  const render = (index: number[], scales: any, values: any, dimensions: any, context: any, next: any) => {
    const g = next(index, scales, values, dimensions, context);
    rendered.push("custom");
    return g;
  };
  Plot.plot({
    x: {domain: [0, 40]},
    y: {domain: [0, 40]},
    marks: [
      brush,
      Plot.dot(data, brush.inactive({x: "x", y: "y", render})),
      Plot.dot(data, brush.context({x: "x", y: "y", render})),
      Plot.dot(data, brush.focus({x: "x", y: "y", render}))
    ]
  });
  assert.equal(rendered.length, 3, "user render should have been called for each reactive mark");
});
