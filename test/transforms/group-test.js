import * as Plot from "@observablehq/plot";
import assert from "assert";
import * as d3 from "d3";

it("Plot.group does not return unspecified options", () => {
  const A = Plot.group({});
  assert.strictEqual("z" in A, false);
  assert.strictEqual("fill" in A, false);
  assert.strictEqual("stroke" in A, false);
  const B = Plot.group({}, {fill: "red"});
  assert.strictEqual(B.fill, "red");
  assert.strictEqual("z" in B, false);
  assert.strictEqual("stroke" in B, false);
  const C = Plot.group({}, {stroke: "red"});
  assert.strictEqual(C.stroke, "red");
  assert.strictEqual("z" in C, false);
  assert.strictEqual("fill" in C, false);
  const D = Plot.group({}, {fill: "red", stroke: "x"});
  assert.strictEqual(D.fill, "red");
  assert.strictEqual(D.stroke.label, "x");
  assert.strictEqual("z" in D, false);
});

it("Plot.group does return specified options", () => {
  const A = Plot.group({}, {fill: null});
  assert.strictEqual(A.fill, null);
  assert.strictEqual("z" in A, false);
  assert.strictEqual("stroke" in A, false);
  const B = Plot.group({}, {stroke: null});
  assert.strictEqual(B.stroke, null);
  assert.strictEqual("z" in B, false);
  assert.strictEqual("fill" in B, false);
  const C = Plot.group({}, {z: null});
  assert.strictEqual(C.z, null);
  assert.strictEqual("fill" in C, false);
  assert.strictEqual("stroke" in C, false);
});

it("Plot.group’s min reducer does not coerce numbers and uses natural order", () => {
  const group = Plot.groupZ({y: "min"}, {y: "y"});
  const data = [{y: "10"}, {y: "4"}, {y: "2"}];
  const facets = [d3.range(data.length)];
  const {data: groupData} = group.transform(data, facets);
  assert.deepStrictEqual(Plot.valueof(groupData, group.y), ["10"]);
});

it("Plot.group’s max reducer does not coerce numbers and uses natural order", () => {
  const group = Plot.groupZ({y: "max"}, {y: "y"});
  const data = [{y: "10"}, {y: "4"}, {y: "2"}];
  const facets = [d3.range(data.length)];
  const {data: groupData} = group.transform(data, facets);
  assert.deepStrictEqual(Plot.valueof(groupData, group.y), ["4"]);
});

it("Plot.group’s percentile reducer coerces numbers", () => {
  const group = Plot.groupZ({y: "p00"}, {y: "y"});
  const data = [{y: "1"}, {y: "4"}, {y: "2"}];
  const facets = [d3.range(data.length)];
  const {data: groupData} = group.transform(data, facets);
  assert.deepStrictEqual(Plot.valueof(groupData, group.y), [1]);
});

it("Plot.group’s median reducer coerces numbers", () => {
  const group = Plot.groupZ({y: "median"}, {y: "y"});
  const data = [{y: "1"}, {y: "4"}, {y: "2"}];
  const facets = [d3.range(data.length)];
  const {data: groupData} = group.transform(data, facets);
  assert.deepStrictEqual(Plot.valueof(groupData, group.y), [2]);
});

it("Plot.group’s median reducer ignores NaN, undefined, and null", () => {
  const group = Plot.groupZ({y: "median"}, {y: "y"});
  const data = [{y: "1"}, {y: "4"}, {y: null}, {y: null}, {y: NaN}, {}, {y: "2"}];
  const facets = [d3.range(data.length)];
  const {data: groupData} = group.transform(data, facets);
  assert.deepStrictEqual(Plot.valueof(groupData, group.y), [2]);
});

it("Plot.group’s median reducer preserves dates", () => {
  const group = Plot.groupZ({y: "median"}, {y: "y"});
  const data = [{y: new Date("2021-01-01")}, {y: new Date("2024-01-01")}, {y: new Date("2022-01-01")}];
  const facets = [d3.range(data.length)];
  const {data: groupData} = group.transform(data, facets);
  assert.deepStrictEqual(Plot.valueof(groupData, group.y), [new Date("2022-01-01")]);
});

it("Plot.group’s mean reducer preserves dates", () => {
  const group = Plot.groupZ({y: "mean"}, {y: "y"});
  const data = [{y: new Date("2021-01-01")}, {y: new Date("2024-01-01")}, {y: new Date("2022-01-01")}];
  const facets = [d3.range(data.length)];
  const {data: groupData} = group.transform(data, facets);
  assert.deepStrictEqual(Plot.valueof(groupData, group.y), [new Date("2022-05-02T16:00:00Z")]);
});

it("Plot.group’s min reducer preserves dates", () => {
  const group = Plot.groupZ({y: "min"}, {y: "y"});
  const data = [{y: new Date("2021-01-01")}, {y: new Date("2024-01-01")}, {y: new Date("2022-01-01")}];
  const facets = [d3.range(data.length)];
  const {data: groupData} = group.transform(data, facets);
  assert.deepStrictEqual(Plot.valueof(groupData, group.y), [new Date("2021-01-01")]);
});
