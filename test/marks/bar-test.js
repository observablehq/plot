import * as Plot from "@observablehq/plot";
import tape from "tape-await";

tape("barX() has the expected defaults", test => {
  const bar = Plot.barX();
  test.strictEqual(bar.data, undefined);
  test.strictEqual(bar.transform, undefined);
  test.deepEqual(bar.channels.map(c => c.name), ["x1", "x2"]);
  test.deepEqual(bar.channels.map(c => c.value(1, 0)), [0, 1]);
  test.deepEqual(bar.channels.map(c => c.scale), ["x", "x"]);
  test.strictEqual(bar.fill, undefined);
  test.strictEqual(bar.fillOpacity, undefined);
  test.strictEqual(bar.stroke, undefined);
  test.strictEqual(bar.strokeWidth, undefined);
  test.strictEqual(bar.strokeOpacity, undefined);
  test.strictEqual(bar.strokeLinejoin, undefined);
  test.strictEqual(bar.strokeLinecap, undefined);
  test.strictEqual(bar.strokeMiterlimit, undefined);
  test.strictEqual(bar.strokeDasharray, undefined);
  test.strictEqual(bar.mixBlendMode, undefined);
  test.strictEqual(bar.insetTop, 0);
  test.strictEqual(bar.insetRight, 0);
  test.strictEqual(bar.insetBottom, 0);
  test.strictEqual(bar.insetLeft, 0);
});

tape("barX(data, {y}) uses a band scale", test => {
  const bar = Plot.barX(undefined, {y: "x"});
  test.deepEqual(bar.channels.map(c => c.name), ["x1", "x2", "y"]);
  test.deepEqual(bar.channels.map(c => c.scale), ["x", "x", "y"]);
  test.strictEqual(bar.channels.find(c => c.name === "y").type, "band");
  test.strictEqual(bar.channels.find(c => c.name === "y").value.label, "x");
});

tape("barX(data, {z}) specifies an optional z channel", test => {
  const bar = Plot.barX(undefined, {z: "x"});
  const z = bar.channels.find(c => c.name === "z");
  test.strictEqual(z.value.label, "x");
  test.strictEqual(z.scale, undefined);
});

tape("barX(data, {title}) specifies an optional title channel", test => {
  const bar = Plot.barX(undefined, {title: "x"});
  const title = bar.channels.find(c => c.name === "title");
  test.strictEqual(title.value.label, "x");
  test.strictEqual(title.scale, undefined);
});

tape("barX(data, {fill}) allows fill to be a constant color", test => {
  const bar = Plot.barX(undefined, {fill: "red"});
  test.strictEqual(bar.fill, "red");
});

tape("barX(data, {fill}) allows fill to be null", test => {
  const bar = Plot.barX(undefined, {fill: null});
  test.strictEqual(bar.fill, "none");
});

tape("barX(data, {fill}) allows fill to be a variable color", test => {
  const bar = Plot.barX(undefined, {fill: "x"});
  test.strictEqual(bar.fill, undefined);
  const fill = bar.channels.find(c => c.name === "fill");
  test.strictEqual(fill.value.label, "x");
  test.strictEqual(fill.scale, "color");
});

tape("barX(data, {stroke}) allows stroke to be a constant color", test => {
  const bar = Plot.barX(undefined, {stroke: "red"});
  test.strictEqual(bar.stroke, "red");
});

tape("barX(data, {stroke}) allows stroke to be null", test => {
  const bar = Plot.barX(undefined, {stroke: null});
  test.strictEqual(bar.stroke, undefined);
});

tape("barX(data, {stroke}) allows stroke to be a variable color", test => {
  const bar = Plot.barX(undefined, {stroke: "x"});
  test.strictEqual(bar.stroke, undefined);
  const stroke = bar.channels.find(c => c.name === "stroke");
  test.strictEqual(stroke.value.label, "x");
  test.strictEqual(stroke.scale, "color");
});

tape("barX(data, {x, y}) defaults x1 to zero and x2 to x", test => {
  const bar = Plot.barX(undefined, {x: "0", y: "1"});
  const x1 = bar.channels.find(c => c.name === "x1");
  test.strictEqual(x1.value(), 0);
  test.strictEqual(x1.scale, "x");
  const x2 = bar.channels.find(c => c.name === "x2");
  test.strictEqual(x2.value.label, "0");
  test.strictEqual(x2.scale, "x");
  const y = bar.channels.find(c => c.name === "y");
  test.strictEqual(y.value.label, "1");
  test.strictEqual(y.scale, "y");
});

tape("barY() has the expected defaults", test => {
  const bar = Plot.barY();
  test.strictEqual(bar.data, undefined);
  test.strictEqual(bar.transform, undefined);
  test.deepEqual(bar.channels.map(c => c.name), ["y1", "y2"]);
  test.deepEqual(bar.channels.map(c => c.value(1, 0)), [0, 1]);
  test.deepEqual(bar.channels.map(c => c.scale), ["y", "y"]);
  test.strictEqual(bar.fill, undefined);
  test.strictEqual(bar.fillOpacity, undefined);
  test.strictEqual(bar.stroke, undefined);
  test.strictEqual(bar.strokeWidth, undefined);
  test.strictEqual(bar.strokeOpacity, undefined);
  test.strictEqual(bar.strokeLinejoin, undefined);
  test.strictEqual(bar.strokeLinecap, undefined);
  test.strictEqual(bar.strokeMiterlimit, undefined);
  test.strictEqual(bar.strokeDasharray, undefined);
  test.strictEqual(bar.mixBlendMode, undefined);
  test.strictEqual(bar.insetTop, 0);
  test.strictEqual(bar.insetRight, 0);
  test.strictEqual(bar.insetBottom, 0);
  test.strictEqual(bar.insetLeft, 0);
});

tape("barY(data, {x}) uses a band scale", test => {
  const bar = Plot.barY(undefined, {x: "y"});
  test.deepEqual(bar.channels.map(c => c.name), ["y1", "y2", "x"]);
  test.deepEqual(bar.channels.map(c => c.scale), ["y", "y", "x"]);
  test.strictEqual(bar.channels.find(c => c.name === "x").type, "band");
  test.strictEqual(bar.channels.find(c => c.name === "x").value.label, "y");
});

tape("barY(data, {z}) specifies an optional z channel", test => {
  const bar = Plot.barY(undefined, {z: "x"});
  const z = bar.channels.find(c => c.name === "z");
  test.strictEqual(z.value.label, "x");
  test.strictEqual(z.scale, undefined);
});

tape("barY(data, {title}) specifies an optional title channel", test => {
  const bar = Plot.barY(undefined, {title: "x"});
  const title = bar.channels.find(c => c.name === "title");
  test.strictEqual(title.value.label, "x");
  test.strictEqual(title.scale, undefined);
});

tape("barY(data, {fill}) allows fill to be a constant color", test => {
  const bar = Plot.barY(undefined, {fill: "red"});
  test.strictEqual(bar.fill, "red");
});

tape("barY(data, {fill}) allows fill to be null", test => {
  const bar = Plot.barY(undefined, {fill: null});
  test.strictEqual(bar.fill, "none");
});

tape("barY(data, {fill}) allows fill to be a variable color", test => {
  const bar = Plot.barY(undefined, {fill: "x"});
  test.strictEqual(bar.fill, undefined);
  const fill = bar.channels.find(c => c.name === "fill");
  test.strictEqual(fill.value.label, "x");
  test.strictEqual(fill.scale, "color");
});

tape("barY(data, {stroke}) allows stroke to be a constant color", test => {
  const bar = Plot.barY(undefined, {stroke: "red"});
  test.strictEqual(bar.stroke, "red");
});

tape("barY(data, {stroke}) allows stroke to be null", test => {
  const bar = Plot.barY(undefined, {stroke: null});
  test.strictEqual(bar.stroke, undefined);
});

tape("barY(data, {stroke}) allows stroke to be a variable color", test => {
  const bar = Plot.barY(undefined, {stroke: "x"});
  test.strictEqual(bar.stroke, undefined);
  const stroke = bar.channels.find(c => c.name === "stroke");
  test.strictEqual(stroke.value.label, "x");
  test.strictEqual(stroke.scale, "color");
});

tape("barY(data, {x, y}) defaults y1 to zero and y2 to y", test => {
  const bar = Plot.barY(undefined, {x: "0", y: "1"});
  const x = bar.channels.find(c => c.name === "x");
  test.strictEqual(x.value.label, "0");
  test.strictEqual(x.scale, "x");
  const y1 = bar.channels.find(c => c.name === "y1");
  test.strictEqual(y1.value(), 0);
  test.strictEqual(y1.scale, "y");
  const y2 = bar.channels.find(c => c.name === "y2");
  test.strictEqual(y2.value.label, "1");
  test.strictEqual(y2.scale, "y");
});
