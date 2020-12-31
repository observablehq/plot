import * as Plot from "@observablehq/plot";
import {curveLinear, curveStep} from "d3-shape";
import tape from "tape-await";

tape("Line() has the expected defaults", test => {
  const line = new Plot.Line();
  test.strictEqual(line.data, undefined);
  test.strictEqual(line.transform("foo"), "foo");
  test.deepEqual(line.channels.map(c => c.name), ["x", "y"]);
  test.deepEqual(line.channels.map(c => c.value([1, 2])), [1, 2]);
  test.deepEqual(line.channels.map(c => c.scale), ["x", "y"]);
  test.strictEqual(line.curve, curveLinear);
  test.strictEqual(line.fill, "none");
  test.strictEqual(line.fillOpacity, undefined);
  test.strictEqual(line.stroke, "currentColor");
  test.strictEqual(line.strokeWidth, 1.5);
  test.strictEqual(line.strokeOpacity, undefined);
  test.strictEqual(line.strokeLinejoin, undefined);
  test.strictEqual(line.strokeLinecap, undefined);
  test.strictEqual(line.strokeMiterlimit, undefined);
  test.strictEqual(line.strokeDasharray, undefined);
  test.strictEqual(line.mixBlendMode, undefined);
});

tape("Line(data, {z}) specifies an optional z channel", test => {
  const line = new Plot.Line(undefined, {z: "2"});
  const z = line.channels.find(c => c.name === "z");
  test.strictEqual(z.value, "2");
  test.strictEqual(z.scale, undefined);
});

tape("Line(data, {title}) specifies an optional title channel", test => {
  const line = new Plot.Line(undefined, {title: "2"});
  const title = line.channels.find(c => c.name === "title");
  test.strictEqual(title.value, "2");
  test.strictEqual(title.scale, undefined);
});

tape("Line(data, {fill}) allows fill to be a constant color", test => {
  const line = new Plot.Line(undefined, {fill: "red"});
  test.strictEqual(line.fill, "red");
});

tape("Line(data, {fill}) allows fill to be null", test => {
  const line = new Plot.Line(undefined, {fill: null});
  test.strictEqual(line.fill, "none");
});

tape("Line(data, {fill}) allows fill to be a variable color", test => {
  const line = new Plot.Line(undefined, {fill: "x"});
  test.strictEqual(line.fill, undefined);
  const fill = line.channels.find(c => c.name === "fill");
  test.strictEqual(fill.value, "x");
  test.strictEqual(fill.scale, "color");
});

tape("Line(data, {fill}) implies a default z channel if fill is variable", test => {
  const line = new Plot.Line(undefined, {fill: "2"});
  const z = line.channels.find(c => c.name === "z");
  test.strictEqual(z.value, "2");
  test.strictEqual(z.scale, undefined);
});

tape("Line(data, {stroke}) allows stroke to be a constant color", test => {
  const line = new Plot.Line(undefined, {stroke: "red"});
  test.strictEqual(line.stroke, "red");
});

tape("Line(data, {stroke}) allows stroke to be null", test => {
  const line = new Plot.Line(undefined, {stroke: null});
  test.strictEqual(line.stroke, undefined);
});

tape("Line(data, {stroke}) implies no stroke width if stroke is null", test => {
  const line = new Plot.Line(undefined, {stroke: null});
  test.strictEqual(line.strokeWidth, undefined);
});

tape("Line(data, {stroke}) allows stroke to be a variable color", test => {
  const line = new Plot.Line(undefined, {stroke: "x", fill: "3"}); // stroke takes priority
  test.strictEqual(line.stroke, undefined);
  const stroke = line.channels.find(c => c.name === "stroke");
  test.strictEqual(stroke.value, "x");
  test.strictEqual(stroke.scale, "color");
});

tape("Line(data, {stroke}) implies a default z channel if stroke is variable", test => {
  const line = new Plot.Line(undefined, {stroke: "2"});
  const z = line.channels.find(c => c.name === "z");
  test.strictEqual(z.value, "2");
  test.strictEqual(z.scale, undefined);
});

tape("Line(data, {curve}) specifies a named curve or function", test => {
  test.strictEqual(new Plot.Line(undefined, {curve: "step"}).curve, curveStep);
  test.strictEqual(new Plot.Line(undefined, {curve: curveStep}).curve, curveStep);
});
