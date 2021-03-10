import * as Plot from "@observablehq/plot";
import {curveLinear, curveStep} from "d3";
import tape from "tape-await";

tape("line() has the expected defaults", test => {
  const line = Plot.line();
  test.strictEqual(line.data, undefined);
  test.strictEqual(line.transform, undefined);
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
  test.strictEqual(line.strokeMiterlimit, 1);
  test.strictEqual(line.strokeDasharray, undefined);
  test.strictEqual(line.mixBlendMode, undefined);
});

tape("line(data, {z}) specifies an optional z channel", test => {
  const line = Plot.line(undefined, {z: "2"});
  const z = line.channels.find(c => c.name === "z");
  test.strictEqual(z.value.label, "2");
  test.strictEqual(z.scale, undefined);
});

tape("line(data, {title}) specifies an optional title channel", test => {
  const line = Plot.line(undefined, {title: "2"});
  const title = line.channels.find(c => c.name === "title");
  test.strictEqual(title.value.label, "2");
  test.strictEqual(title.scale, undefined);
});

tape("line(data, {fill}) allows fill to be a constant color", test => {
  const line = Plot.line(undefined, {fill: "red"});
  test.strictEqual(line.fill, "red");
});

tape("line(data, {fill}) allows fill to be null", test => {
  const line = Plot.line(undefined, {fill: null});
  test.strictEqual(line.fill, "none");
});

tape("line(data, {fill}) allows fill to be a variable color", test => {
  const line = Plot.line(undefined, {fill: "x"});
  test.strictEqual(line.fill, undefined);
  const fill = line.channels.find(c => c.name === "fill");
  test.strictEqual(fill.value.label, "x");
  test.strictEqual(fill.scale, "color");
});

tape("line(data, {fill}) implies a default z channel if fill is variable", test => {
  const line = Plot.line(undefined, {fill: "2"});
  const z = line.channels.find(c => c.name === "z");
  test.strictEqual(z.value.label, "2");
  test.strictEqual(z.scale, undefined);
});

tape("line(data, {stroke}) allows stroke to be a constant color", test => {
  const line = Plot.line(undefined, {stroke: "red"});
  test.strictEqual(line.stroke, "red");
});

tape("line(data, {stroke}) allows stroke to be null", test => {
  const line = Plot.line(undefined, {stroke: null});
  test.strictEqual(line.stroke, undefined);
});

tape("line(data, {stroke}) implies no stroke width if stroke is null", test => {
  const line = Plot.line(undefined, {stroke: null});
  test.strictEqual(line.strokeWidth, undefined);
});

tape("line(data, {stroke}) allows stroke to be a variable color", test => {
  const line = Plot.line(undefined, {stroke: "x", fill: "3"}); // stroke takes priority
  test.strictEqual(line.stroke, undefined);
  const stroke = line.channels.find(c => c.name === "stroke");
  test.strictEqual(stroke.value.label, "x");
  test.strictEqual(stroke.scale, "color");
});

tape("line(data, {stroke}) implies a default z channel if stroke is variable", test => {
  const line = Plot.line(undefined, {stroke: "2"});
  const z = line.channels.find(c => c.name === "z");
  test.strictEqual(z.value.label, "2");
  test.strictEqual(z.scale, undefined);
});

tape("line(data, {curve}) specifies a named curve or function", test => {
  test.strictEqual(Plot.line(undefined, {curve: "step"}).curve, curveStep);
  test.strictEqual(Plot.line(undefined, {curve: curveStep}).curve, curveStep);
});
