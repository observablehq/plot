import * as Plot from "@observablehq/plot";
import tape from "tape-await";

tape("ruleX() has the expected defaults", test => {
  const rule = Plot.ruleX();
  test.strictEqual(rule.data, undefined);
  test.strictEqual(rule.transform, undefined);
  test.deepEqual(rule.channels.map(c => c.name), ["x"]);
  test.deepEqual(rule.channels.map(c => Plot.valueof([1, 2, 3], c.value)), [[1, 2, 3]]);
  test.deepEqual(rule.channels.map(c => c.scale), ["x"]);
  test.strictEqual(rule.fill, undefined);
  test.strictEqual(rule.fillOpacity, undefined);
  test.strictEqual(rule.stroke, "currentColor");
  test.strictEqual(rule.strokeWidth, undefined);
  test.strictEqual(rule.strokeOpacity, undefined);
  test.strictEqual(rule.strokeLinejoin, undefined);
  test.strictEqual(rule.strokeLinecap, undefined);
  test.strictEqual(rule.strokeMiterlimit, undefined);
  test.strictEqual(rule.strokeDasharray, undefined);
  test.strictEqual(rule.mixBlendMode, undefined);
});

tape("ruleX(data, {title}) specifies an optional title channel", test => {
  const rule = Plot.ruleX(undefined, {title: "x"});
  const title = rule.channels.find(c => c.name === "title");
  test.strictEqual(title.value, "x");
  test.strictEqual(title.scale, undefined);
});

tape("ruleX(data, {stroke}) allows stroke to be a constant color", test => {
  const rule = Plot.ruleX(undefined, {stroke: "red"});
  test.strictEqual(rule.stroke, "red");
});

tape("ruleX(data, {stroke}) allows stroke to be null", test => {
  const rule = Plot.ruleX(undefined, {stroke: null});
  test.strictEqual(rule.stroke, undefined);
});

tape("ruleX(data, {stroke}) allows stroke to be a variable color", test => {
  const rule = Plot.ruleX(undefined, {stroke: "x"});
  test.strictEqual(rule.stroke, undefined);
  const stroke = rule.channels.find(c => c.name === "stroke");
  test.strictEqual(stroke.value, "x");
  test.strictEqual(stroke.scale, "color");
});

tape("ruleX(data, {x, y}) specifies y1 = zero, y2 = y", test => {
  const rule = Plot.ruleX(undefined, {x: "0", y: "1"});
  const y1 = rule.channels.find(c => c.name === "y1");
  test.strictEqual(y1.value, 0);
  test.strictEqual(y1.scale, "y");
  const y2 = rule.channels.find(c => c.name === "y2");
  test.strictEqual(y2.value, "1");
  test.strictEqual(y2.scale, "y");
});

tape("ruleX(data, {x, y1}) specifies y1 = zero, y2 = y1", test => {
  const rule = Plot.ruleX(undefined, {x: "0", y1: "1"});
  const y1 = rule.channels.find(c => c.name === "y1");
  test.strictEqual(y1.value, 0);
  test.strictEqual(y1.scale, "y");
  const y2 = rule.channels.find(c => c.name === "y2");
  test.strictEqual(y2.value, "1");
  test.strictEqual(y2.scale, "y");
});

tape("ruleX(data, {x, y2}) specifies y1 = zero, y2 = y2", test => {
  const rule = Plot.ruleX(undefined, {x: "0", y2: "1"});
  const y1 = rule.channels.find(c => c.name === "y1");
  test.strictEqual(y1.value, 0);
  test.strictEqual(y1.scale, "y");
  const y2 = rule.channels.find(c => c.name === "y2");
  test.strictEqual(y2.value, "1");
  test.strictEqual(y2.scale, "y");
});

tape("ruleX(data, {x, y1, y2}) specifies x, y1, y2", test => {
  const rule = Plot.ruleX(undefined, {x: "0", y1: "1", y2: "2"});
  const x = rule.channels.find(c => c.name === "x");
  test.strictEqual(x.value, "0");
  test.strictEqual(x.scale, "x");
  const y1 = rule.channels.find(c => c.name === "y1");
  test.strictEqual(y1.value, "1");
  test.strictEqual(y1.scale, "y");
  const y2 = rule.channels.find(c => c.name === "y2");
  test.strictEqual(y2.value, "2");
  test.strictEqual(y2.scale, "y");
});

tape("ruleY() has the expected defaults", test => {
  const rule = Plot.ruleY();
  test.strictEqual(rule.data, undefined);
  test.strictEqual(rule.transform, undefined);
  test.deepEqual(rule.channels.map(c => c.name), ["y"]);
  test.deepEqual(rule.channels.map(c => Plot.valueof([1, 2, 3], c.value)), [[1, 2, 3]]);
  test.deepEqual(rule.channels.map(c => c.scale), ["y"]);
  test.strictEqual(rule.fill, undefined);
  test.strictEqual(rule.fillOpacity, undefined);
  test.strictEqual(rule.stroke, "currentColor");
  test.strictEqual(rule.strokeWidth, undefined);
  test.strictEqual(rule.strokeOpacity, undefined);
  test.strictEqual(rule.strokeLinejoin, undefined);
  test.strictEqual(rule.strokeLinecap, undefined);
  test.strictEqual(rule.strokeMiterlimit, undefined);
  test.strictEqual(rule.strokeDasharray, undefined);
  test.strictEqual(rule.mixBlendMode, undefined);
});

tape("ruleY(data, {title}) specifies an optional title channel", test => {
  const rule = Plot.ruleY(undefined, {title: "x"});
  const title = rule.channels.find(c => c.name === "title");
  test.strictEqual(title.value, "x");
  test.strictEqual(title.scale, undefined);
});

tape("ruleY(data, {stroke}) allows stroke to be a constant color", test => {
  const rule = Plot.ruleY(undefined, {stroke: "red"});
  test.strictEqual(rule.stroke, "red");
});

tape("ruleY(data, {stroke}) allows stroke to be null", test => {
  const rule = Plot.ruleY(undefined, {stroke: null});
  test.strictEqual(rule.stroke, undefined);
});

tape("ruleY(data, {stroke}) allows stroke to be a variable color", test => {
  const rule = Plot.ruleY(undefined, {stroke: "x"});
  test.strictEqual(rule.stroke, undefined);
  const stroke = rule.channels.find(c => c.name === "stroke");
  test.strictEqual(stroke.value, "x");
  test.strictEqual(stroke.scale, "color");
});

tape("ruleY(data, {x, y}) specifies x1 = zero, x2 = x", test => {
  const rule = Plot.ruleY(undefined, {x: "0", y: "1"});
  const x1 = rule.channels.find(c => c.name === "x1");
  test.strictEqual(x1.value, 0);
  test.strictEqual(x1.scale, "x");
  const x2 = rule.channels.find(c => c.name === "x2");
  test.strictEqual(x2.value, "0");
  test.strictEqual(x2.scale, "x");
});

tape("ruleY(data, {y, x1}) specifies x1 = zero, x2 = x1", test => {
  const rule = Plot.ruleY(undefined, {x1: "0", y: "1"});
  const x1 = rule.channels.find(c => c.name === "x1");
  test.strictEqual(x1.value, 0);
  test.strictEqual(x1.scale, "x");
  const x2 = rule.channels.find(c => c.name === "x2");
  test.strictEqual(x2.value, "0");
  test.strictEqual(x2.scale, "x");
});

tape("ruleY(data, {y, x2}) specifies x1 = zero, x2 = x2", test => {
  const rule = Plot.ruleY(undefined, {x2: "0", y: "1"});
  const x1 = rule.channels.find(c => c.name === "x1");
  test.strictEqual(x1.value, 0);
  test.strictEqual(x1.scale, "x");
  const x2 = rule.channels.find(c => c.name === "x2");
  test.strictEqual(x2.value, "0");
  test.strictEqual(x2.scale, "x");
});

tape("ruleY(data, {x1, x2, y}) specifies x1, x2, y", test => {
  const rule = Plot.ruleY(undefined, {x1: "0", x2: "1", y: "2"});
  const x1 = rule.channels.find(c => c.name === "x1");
  test.strictEqual(x1.value, "0");
  test.strictEqual(x1.scale, "x");
  const x2 = rule.channels.find(c => c.name === "x2");
  test.strictEqual(x2.value, "1");
  test.strictEqual(x2.scale, "x");
  const y = rule.channels.find(c => c.name === "y");
  test.strictEqual(y.value, "2");
  test.strictEqual(y.scale, "y");
});
