import * as Plot from "@observablehq/plot";

function tip(
  data: Plot.Data,
  {x = 0, frameAnchor = "bottom", anchor = "bottom", ...tipOptions}: Plot.TipOptions = {},
  {height = 90, ...plotOptions}: Plot.PlotOptions = {}
) {
  return Plot.tip(data, {x, frameAnchor, anchor, ...tipOptions}).plot({height, ...plotOptions});
}

export async function tipFormatChannels() {
  return tip([{value: 1}], {channels: {Name: ["Bob"], Value: "value"}});
}

export async function tipFormatFacet() {
  return tip({length: 2}, {fx: ["a", "b"]}, {height: 110});
}

export async function tipFormatFacetFalse() {
  return tip({length: 1}, {facet: false}, {marks: [Plot.ruleX({length: 2}, {fx: ["a", "b"]})], height: 110});
}

export async function tipFormatFacetFormat() {
  return tip({length: 2}, {fx: [new Date("2001-01-01"), new Date("2001-01-02")], format: {fx: "%b %-d"}}, {height: 110}); // prettier-ignore
}

export async function tipFormatFacetFormatDefaultHour() {
  return tip({length: 2}, {fx: [new Date("2001-01-01T12:00Z"), new Date("2001-01-01T13:00Z")]}, {height: 110});
}

export async function tipFormatFacetFormatDefaultDay() {
  return tip({length: 2}, {fx: [new Date("2001-01-01"), new Date("2001-01-02")]}, {height: 110});
}

export async function tipFormatFacetFormatDefaultYear() {
  return tip({length: 2}, {fx: [new Date("2001-01-01"), new Date("2002-01-01")]}, {height: 110});
}

export async function tipFormatFacetLabel() {
  return tip({length: 2}, {fx: [new Date("2001-01-01"), new Date("2002-01-01")]}, {fx: {label: "Year"}, height: 110});
}

export async function tipFormatFunction() {
  return tip({length: 1}, {format: {x: (d) => d.toFixed(2)}});
}

export async function tipFormatNull() {
  return tip([{value: 1}], {channels: {Value: "value"}, format: {x: null}});
}

export async function tipFormatPaired() {
  return tip({length: 1}, {x1: 0, x2: 1});
}

export async function tipFormatPairedFormat() {
  return tip([{low: 0, high: 1}], {x1: "low", x2: "high", format: {x: ".2f"}});
}

export async function tipFormatPairedLabel() {
  return tip([{low: 0, high: 1}], {x1: "low", x2: "high"});
}

export async function tipFormatPairedLabelChannel() {
  return tip({length: 1}, {x1: {value: [0], label: "Low"}, x2: {value: [1], label: "High"}});
}

export async function tipFormatPairedLabelScale() {
  return tip({length: 1}, {x1: 0, x2: 1}, {x: {label: "Intensity"}});
}

export async function tipFormatPairedPartial() {
  return tip([{low: 0, high: 1}], {x1: "low", x2: "high", format: {x1: null}});
}

export async function tipFormatPriority1() {
  return tip({length: 1}, {channels: {a: ["A"], b: ["B"]}, format: {x: true}});
}

export async function tipFormatPriority2() {
  return tip({length: 1}, {channels: {a: ["A"], b: ["B"]}, format: {b: true} as any});
}

export async function tipFormatPriorityDefault() {
  return tip({length: 1}, {channels: {a: ["A"], b: ["B"]}, format: {}});
}

export async function tipFormatPriorityPaired() {
  return tip([{low: 0, high: 1}], {fill: [0], x1: "low", x2: "high", format: {x: true}});
}

export async function tipFormatPriorityPaired2() {
  return tip([{low: 0, high: 1}], {fill: [0], x1: "low", x2: "high", format: {fill: true}});
}

export async function tipFormatStringDate() {
  return tip({length: 1}, {x: new Date("2001-01-01"), format: {x: "%B %-d, %Y"}});
}

export async function tipFormatStringNumber() {
  return tip({length: 1}, {format: {x: ".2f"}});
}

export async function tipFormatTitleExplicit() {
  return tip({length: 1}, {title: [new Date("2010-01-01")]});
}

export async function tipFormatTitleIgnoreFormat() {
  return tip({length: 1}, {title: [0], format: {title: ".2f"}});
}

export async function tipFormatTitlePrimitive() {
  return tip(["hello\nworld"], {x: 0});
}
