import * as Plot from "@observablehq/plot";
import tape from "tape-await";

tape("arc(data) has the expected defaults", test => {
  const arc = Plot.arc(undefined);
  test.strictEqual(arc.data, undefined);
  test.strictEqual(arc.transform("foo"), "foo");
  test.deepEqual(arc.channels.map(c => c.name), ["x", "y", "startAngle", "endAngle"]);
  test.deepEqual(arc.channels.map(c => c.scale), ["x", "y", undefined, undefined]);
  test.strictEqual(arc.fill, undefined);
  test.strictEqual(arc.fillOpacity, undefined);
  test.strictEqual(arc.stroke, "white");
  test.strictEqual(arc.strokeWidth, undefined);
  test.strictEqual(arc.strokeOpacity, undefined);
  test.strictEqual(arc.strokeLinejoin, undefined);
  test.strictEqual(arc.strokeLinecap, undefined);
  test.strictEqual(arc.strokeMiterlimit, undefined);
  test.strictEqual(arc.strokeDasharray, undefined);
  test.strictEqual(arc.mixBlendMode, undefined);
});

tape("arc(data) specifies an optional x channel", test => {
  const arc = Plot.arc(undefined);
  const x = arc.channels.find(c => c.name === "x");
  test.strictEqual(x.value({}), 0);
  test.strictEqual(x.scale, "x");
});

tape("arc(data) specifies an optional y channel", test => {
  const arc = Plot.arc(undefined);
  const y = arc.channels.find(c => c.name === "y");
  test.strictEqual(y.value({}), 0);
  test.strictEqual(y.scale, "y");
});

tape("arc(data) specifies an optional startAngle channel", test => {
  const arc = Plot.arc(undefined);
  const startAngle = arc.channels.find(c => c.name === "startAngle");
  test.strictEqual(startAngle.value({startAngle: 12}), 12);
  test.strictEqual(startAngle.scale, undefined);
});

tape("arc(data) specifies an optional endAngle channel", test => {
  const arc = Plot.arc(undefined);
  const endAngle = arc.channels.find(c => c.name === "endAngle");
  test.strictEqual(endAngle.value({endAngle: 42}), 42);
  test.strictEqual(endAngle.scale, undefined);
});

tape("arc(data, {z}) specifies an optional z channel", test => {
  const arc = Plot.arc(undefined, {z: "x"});
  const z = arc.channels.find(c => c.name === "z");
  test.strictEqual(z.value.label, "x");
  test.strictEqual(z.scale, undefined);
});

tape("arc(data, {startAngle}) allows startAngle to be a constant", test => {
  const arc = Plot.arc(undefined, {startAngle: 42});
  test.strictEqual(arc.sa, 42);
});

tape("arc(data, {startAngle}) allows startAngle to be a variable", test => {
  const arc = Plot.arc(undefined, {startAngle: "x"});
  test.strictEqual(arc.sa, undefined);
  const r = arc.channels.find(c => c.name === "startAngle");
  test.strictEqual(r.value.label, "x");
  test.strictEqual(r.scale, undefined);
});

tape("arc(data, {endAngle}) allows endAngle to be a constant", test => {
  const arc = Plot.arc(undefined, {endAngle: 42});
  test.strictEqual(arc.ea, 42);
});

tape("arc(data, {endAngle}) allows endAngle to be a variable", test => {
  const arc = Plot.arc(undefined, {endAngle: "x"});
  test.strictEqual(arc.ea, undefined);
  const r = arc.channels.find(c => c.name === "endAngle");
  test.strictEqual(r.value.label, "x");
  test.strictEqual(r.scale, undefined);
});

tape("arc(data, {innerRadius}) allows innerRadius to be a constant", test => {
  const arc = Plot.arc(undefined, {innerRadius: 42});
  test.strictEqual(arc.ri, 42);
});

tape("arc(data, {innerRadius}) allows innerRadius to be a variable", test => {
  const arc = Plot.arc(undefined, {innerRadius: "x"});
  test.strictEqual(arc.ri, undefined);
  const r = arc.channels.find(c => c.name === "innerRadius");
  test.strictEqual(r.value.label, "x");
  test.strictEqual(r.scale, undefined);
});

tape("arc(data, {outerRadius}) allows outerRadius to be a constant", test => {
  const arc = Plot.arc(undefined, {outerRadius: 42});
  test.strictEqual(arc.ro, 42);
});

tape("arc(data, {outerRadius}) allows outerRadius to be a variable", test => {
  const arc = Plot.arc(undefined, {outerRadius: "x"});
  test.strictEqual(arc.ro, undefined);
  const r = arc.channels.find(c => c.name === "outerRadius");
  test.strictEqual(r.value.label, "x");
  test.strictEqual(r.scale, undefined);
});

tape("arc(data, {title}) specifies an optional title channel", test => {
  const arc = Plot.arc(undefined, {x1: "0", y1: "1", title: "2"});
  const title = arc.channels.find(c => c.name === "title");
  test.strictEqual(title.value.label, "2");
  test.strictEqual(title.scale, undefined);
});

tape("arc(data, {fill}) allows fill to be a constant color", test => {
  const arc = Plot.arc(undefined, {x1: "0", y1: "1", fill: "red"});
  test.strictEqual(arc.fill, "red");
});

tape("arc(data, {fill}) allows fill to be null", test => {
  const arc = Plot.arc(undefined, {x1: "0", y1: "1", fill: null});
  test.strictEqual(arc.fill, "none");
});

tape("arc(data, {fill}) allows fill to be a variable color", test => {
  const arc = Plot.arc(undefined, {x1: "0", y1: "1", fill: "x"});
  test.strictEqual(arc.fill, undefined);
  const fill = arc.channels.find(c => c.name === "fill");
  test.strictEqual(fill.value.label, "x");
  test.strictEqual(fill.scale, "color");
});

tape("arc(data, {stroke}) allows stroke to be a constant color", test => {
  const arc = Plot.arc(undefined, {x1: "0", y1: "1", stroke: "red"});
  test.strictEqual(arc.stroke, "red");
});

tape("arc(data, {stroke}) allows stroke to be null", test => {
  const arc = Plot.arc(undefined, {x1: "0", y1: "1", stroke: null});
  test.strictEqual(arc.stroke, undefined);
});

tape("arc(data, {stroke}) allows stroke to be a variable color", test => {
  const arc = Plot.arc(undefined, {x1: "0", y1: "1", stroke: "x"});
  test.strictEqual(arc.stroke, undefined);
  const stroke = arc.channels.find(c => c.name === "stroke");
  test.strictEqual(stroke.value.label, "x");
  test.strictEqual(stroke.scale, "color");
});

