// The programmatic brush.move calls below use the private _brush and
// _brushNodes API with pixel coordinates. Replace with the public setter
// (in data space) when available.
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

  // Programmatically move the brush using the brush instance
  const brushNode = (brush as any)._brushNodes[0];
  assert.ok(brushNode, "brush node should exist");
  d3.select(brushNode).call((brush as any)._brush.move, [
    [100, 100],
    [400, 300]
  ]);

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

  assert.equal((b as any)._brushNodes.length, 3, "should have 3 brush nodes (one per facet)");
  const firstFacetNode = (b as any)._brushNodes[0];

  let lastValue: any;
  plot.addEventListener("input", () => (lastValue = plot.value));

  // Brush a region in the first facet (pixel coordinates)
  d3.select(firstFacetNode).call((b as any)._brush.move, [
    [30, 50],
    [170, 300]
  ]);

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

  assert.equal((b as any)._brushNodes.length, 3, "should have 3 brush nodes (one per facet)");
  const secondFacetNode = (b as any)._brushNodes[1];

  let lastValue: any;
  plot.addEventListener("input", () => (lastValue = plot.value));

  // Brush the second facet (Chinstrap)
  d3.select(secondFacetNode).call((b as any)._brush.move, [
    [30, 50],
    [170, 300]
  ]);

  assert.ok(lastValue, "should have a value");
  assert.ok(lastValue.fx !== undefined, "value should include fx");
  assert.equal(lastValue.fx, "Chinstrap", "fx should be Chinstrap (the second facet)");

  const filtered = penguins.filter((d: any) => lastValue.filter(d.culmen_length_mm, d.culmen_depth_mm, d.species));
  assert.ok(filtered.length > 0, "should select some points");

  const species = new Set(filtered.map((d: any) => d.species));
  assert.equal(species.size, 1, "all filtered points should be one species");
  assert.equal([...species][0], "Chinstrap", "filtered species should be Chinstrap");
});
