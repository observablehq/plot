import * as Plot from "@observablehq/plot";
import {test} from "test/plot";

test(async function axisLabelX() {
  return Plot.plot({
    inset: 6,
    x: {type: "linear"},
    y: {type: "linear", axis: null},
    marks: [
      Plot.frame(),
      Plot.axisX({anchor: "top", label: "top-left", labelAnchor: "left"}),
      Plot.axisX({anchor: "top", label: "top-center", labelAnchor: "center", ticks: []}),
      Plot.axisX({anchor: "top", label: "top-right", labelAnchor: "right", ticks: []}),
      Plot.axisX({anchor: "bottom", label: "bottom-left", labelAnchor: "left"}),
      Plot.axisX({anchor: "bottom", label: "bottom-center", labelAnchor: "center", ticks: []}),
      Plot.axisX({anchor: "bottom", label: "bottom-right", labelAnchor: "right", ticks: []})
    ]
  });
});

test(async function axisLabelY() {
  return Plot.plot({
    inset: 6,
    x: {type: "linear", axis: null},
    y: {type: "linear"},
    marks: [
      Plot.frame(),
      Plot.axisY({anchor: "left", label: "left-top", labelAnchor: "top"}),
      Plot.axisY({anchor: "left", label: "left-center", labelAnchor: "center", ticks: []}),
      Plot.axisY({anchor: "left", label: "left-bottom", labelAnchor: "bottom", ticks: []}),
      Plot.axisY({anchor: "right", label: "right-top", labelAnchor: "top"}),
      Plot.axisY({anchor: "right", label: "right-center", labelAnchor: "center", ticks: []}),
      Plot.axisY({anchor: "right", label: "right-bottom", labelAnchor: "bottom", ticks: []})
    ]
  });
});

test(async function axisLabelBoth() {
  return Plot.plot({
    inset: 6,
    x: {type: "linear", axis: "both", labelAnchor: "center"},
    y: {type: "linear", axis: "both", labelAnchor: "center"},
    marks: [Plot.ruleX([{x: 0}, {x: 1}], {x: "x"}), Plot.ruleY([{y: 0}, {y: 1}], {y: "y"})]
  });
});

test(async function axisLabelBothReverse() {
  return Plot.plot({
    inset: 6,
    x: {type: "linear", reverse: true, axis: "both", labelAnchor: "center"},
    y: {type: "linear", reverse: true, axis: "both", labelAnchor: "center"},
    marks: [Plot.ruleX([{x: 0}, {x: 1}], {x: "x"}), Plot.ruleY([{y: 0}, {y: 1}], {y: "y"})]
  });
});

test(async function axisLabelFontVariant() {
  return Plot.plot({
    x: {domain: "abcde"},
    marks: [Plot.axisX({label: "Letter", fontVariant: "small-caps"})]
  });
});

test(async function axisLabelVaryingFill() {
  return Plot.plot({
    x: {domain: "ABCDEF"},
    marks: [Plot.axisX({label: "Letter", fill: (d, i) => i})]
  });
});

test(async function axisLabelHref() {
  return Plot.plot({
    x: {domain: "ABCDEF"},
    marks: [Plot.axisX({label: "Letter", href: (d) => `https://en.wikipedia.org/wiki/${d}`})]
  });
});
