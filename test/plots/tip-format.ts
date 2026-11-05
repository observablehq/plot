import * as Plot from "@observablehq/plot";
import {test} from "test/plot";

function tip(
  data: Plot.Data,
  {x = 0, frameAnchor = "bottom", anchor = "bottom", ...tipOptions}: Plot.TipOptions = {},
  {height = 90, ...plotOptions}: Plot.PlotOptions = {}
) {
  return Plot.tip(data, {x, frameAnchor, anchor, ...tipOptions}).plot({height, ...plotOptions});
}

test(async function tipFormatChannels() {
  return tip([{value: 1}], {channels: {Name: ["Bob"], Value: "value"}});
});

test(async function tipFormatFacet() {
  return tip({length: 2}, {fx: ["a", "b"]}, {height: 110});
});

test(async function tipFormatFacetFalse() {
  return tip({length: 1}, {facet: false}, {marks: [Plot.ruleX({length: 2}, {fx: ["a", "b"]})], height: 110});
});

test(async function tipFormatFacetFormat() {
  return tip({length: 2}, {fx: [new Date("2001-01-01"), new Date("2001-01-02")], format: {fx: "%b %-d"}}, {height: 110}); // prettier-ignore
});

test(async function tipFormatFacetFormatDefaultHour() {
  return tip({length: 2}, {fx: [new Date("2001-01-01T12:00Z"), new Date("2001-01-01T13:00Z")]}, {height: 110});
});

test(async function tipFormatFacetFormatDefaultDay() {
  return tip({length: 2}, {fx: [new Date("2001-01-01"), new Date("2001-01-02")]}, {height: 110});
});

test(async function tipFormatFacetFormatDefaultYear() {
  return tip({length: 2}, {fx: [new Date("2001-01-01"), new Date("2002-01-01")]}, {height: 110});
});

test(async function tipFormatFacetLabel() {
  return tip({length: 2}, {fx: [new Date("2001-01-01"), new Date("2002-01-01")]}, {fx: {label: "Year"}, height: 110});
});

test(async function tipFormatFunction() {
  return tip({length: 1}, {format: {x: (d) => d.toFixed(2)}});
});

test(async function tipFormatNull() {
  return tip([{value: 1}], {channels: {Value: "value"}, format: {x: null}});
});

test(async function tipFormatPaired() {
  return tip({length: 1}, {x1: 0, x2: 1});
});

test(async function tipFormatPairedFormat() {
  return tip([{low: 0, high: 1}], {x1: "low", x2: "high", format: {x: ".2f"}});
});

test(async function tipFormatPairedLabel() {
  return tip([{low: 0, high: 1}], {x1: "low", x2: "high"});
});

test(async function tipFormatPairedLabelChannel() {
  return tip({length: 1}, {x1: {value: [0], label: "Low"}, x2: {value: [1], label: "High"}});
});

test(async function tipFormatPairedLabelScale() {
  return tip({length: 1}, {x1: 0, x2: 1}, {x: {label: "Intensity"}});
});

test(async function tipFormatPairedPartial() {
  return tip([{low: 0, high: 1}], {x1: "low", x2: "high", format: {x1: null}});
});

test(async function tipFormatPriority1() {
  return tip({length: 1}, {channels: {a: ["A"], b: ["B"]}, format: {x: true}});
});

test(async function tipFormatPriority2() {
  return tip({length: 1}, {channels: {a: ["A"], b: ["B"]}, format: {b: true} as any});
});

test(async function tipFormatPriorityDefault() {
  return tip({length: 1}, {channels: {a: ["A"], b: ["B"]}, format: {}});
});

test(async function tipFormatPriorityPaired() {
  return tip([{low: 0, high: 1}], {fill: [0], x1: "low", x2: "high", format: {x: true}});
});

test(async function tipFormatPriorityPaired2() {
  return tip([{low: 0, high: 1}], {fill: [0], x1: "low", x2: "high", format: {fill: true}});
});

test(async function tipFormatStringDate() {
  return tip({length: 1}, {x: new Date("2001-01-01"), format: {x: "%B %-d, %Y"}});
});

test(async function tipFormatStringNumber() {
  return tip({length: 1}, {format: {x: ".2f"}});
});

test(async function tipFormatTitleExplicit() {
  return tip({length: 1}, {title: [new Date("2010-01-01")]});
});

test(async function tipFormatTitleFormat() {
  return tip({length: 1}, {title: [0.009], format: {title: ".2f"}});
});

test(async function tipFormatTitleFormatFunction() {
  return tip({length: 1}, {title: [0.019], format: (d) => d.toFixed(2)});
});

test(async function tipFormatTitleFormatShorthand() {
  return tip({length: 1}, {title: [0.029], format: ".2f"});
});

test(async function tipFormatTitlePrimitive() {
  return tip(["hello\nworld"], {x: 0});
});
