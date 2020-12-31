import * as Plot from "@observablehq/plot";
import {curveLinear, curveStep} from "d3-shape";
import tape from "tape-await";

tape("area(data, options) has the expected defaults", test => {
  const area = Plot.area(undefined, {x1: "0", y1: "1"});
  test.strictEqual(area.data, undefined);
  test.strictEqual(area.transform("foo"), "foo");
  test.deepEqual(area.channels.map(c => c.name), ["x1", "y1"]);
  test.deepEqual(area.channels.map(c => c.value), ["0", "1"]);
  test.deepEqual(area.channels.map(c => c.scale), ["x", "y"]);
  test.strictEqual(area.curve, curveLinear);
  test.strictEqual(area.fill, undefined);
  test.strictEqual(area.fillOpacity, undefined);
  test.strictEqual(area.stroke, undefined);
  test.strictEqual(area.strokeWidth, undefined);
  test.strictEqual(area.strokeOpacity, undefined);
  test.strictEqual(area.strokeLinejoin, undefined);
  test.strictEqual(area.strokeLinecap, undefined);
  test.strictEqual(area.strokeMiterlimit, undefined);
  test.strictEqual(area.strokeDasharray, undefined);
  test.strictEqual(area.mixBlendMode, undefined);
});

tape("area(data, {x1, y1, y2}) specifies an optional y2 channel", test => {
  const area = Plot.area(undefined, {x1: "0", y1: "1", y2: "2"});
  const y2 = area.channels.find(c => c.name === "y2");
  test.strictEqual(y2.value, "2");
  test.strictEqual(y2.scale, "y");
});

tape("area(data, {x1, x2, y1}) specifies an optional x2 channel", test => {
  const area = Plot.area(undefined, {x1: "0", x2: "1", y1: "2"});
  const x2 = area.channels.find(c => c.name === "x2");
  test.strictEqual(x2.value, "1");
  test.strictEqual(x2.scale, "x");
});

tape("area(data, {z}) specifies an optional z channel", test => {
  const area = Plot.area(undefined, {x1: "0", y1: "1", z: "2"});
  const z = area.channels.find(c => c.name === "z");
  test.strictEqual(z.value, "2");
  test.strictEqual(z.scale, undefined);
});

tape("area(data, {title}) specifies an optional title channel", test => {
  const area = Plot.area(undefined, {x1: "0", y1: "1", title: "2"});
  const title = area.channels.find(c => c.name === "title");
  test.strictEqual(title.value, "2");
  test.strictEqual(title.scale, undefined);
});

tape("area(data, {fill}) allows fill to be a constant color", test => {
  const area = Plot.area(undefined, {x1: "0", y1: "1", fill: "red"});
  test.strictEqual(area.fill, "red");
});

tape("area(data, {fill}) allows fill to be null", test => {
  const area = Plot.area(undefined, {x1: "0", y1: "1", fill: null});
  test.strictEqual(area.fill, "none");
});

tape("area(data, {fill}) allows fill to be a variable color", test => {
  const area = Plot.area(undefined, {x1: "0", y1: "1", fill: "x"});
  test.strictEqual(area.fill, undefined);
  const fill = area.channels.find(c => c.name === "fill");
  test.strictEqual(fill.value, "x");
  test.strictEqual(fill.scale, "color");
});

tape("area(data, {fill}) implies a default z channel if fill is variable", test => {
  const area = Plot.area(undefined, {x1: "0", y1: "1", fill: "2", stroke: "3"}); // fill takes priority
  const z = area.channels.find(c => c.name === "z");
  test.strictEqual(z.value, "2");
  test.strictEqual(z.scale, undefined);
});

tape("area(data, {stroke}) allows stroke to be a constant color", test => {
  const area = Plot.area(undefined, {x1: "0", y1: "1", stroke: "red"});
  test.strictEqual(area.stroke, "red");
});

tape("area(data, {stroke}) allows stroke to be null", test => {
  const area = Plot.area(undefined, {x1: "0", y1: "1", stroke: null});
  test.strictEqual(area.stroke, undefined);
});

tape("area(data, {stroke}) allows stroke to be a variable color", test => {
  const area = Plot.area(undefined, {x1: "0", y1: "1", stroke: "x"});
  test.strictEqual(area.stroke, undefined);
  const stroke = area.channels.find(c => c.name === "stroke");
  test.strictEqual(stroke.value, "x");
  test.strictEqual(stroke.scale, "color");
});

tape("area(data, {stroke}) implies a default z channel if stroke is variable", test => {
  const area = Plot.area(undefined, {x1: "0", y1: "1", stroke: "2"});
  const z = area.channels.find(c => c.name === "z");
  test.strictEqual(z.value, "2");
  test.strictEqual(z.scale, undefined);
});

tape("area(data, {curve}) specifies a named curve or function", test => {
  test.strictEqual(Plot.area(undefined, {x1: "0", y1: "1", curve: "step"}).curve, curveStep);
  test.strictEqual(Plot.area(undefined, {x1: "0", y1: "1", curve: curveStep}).curve, curveStep);
});
