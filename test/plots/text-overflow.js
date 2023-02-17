import * as Plot from "@observablehq/plot";
import * as d3 from "d3";

export async function textOverflowClip() {
  return textOverflowPlot("clip");
}

export async function textOverflowEllipsis() {
  return textOverflowPlot("ellipsis");
}

export async function textOverflowMonospace() {
  return textOverflowPlot("ellipsis", "monospace");
}

export async function textOverflowNone() {
  return textOverflowPlot(null);
}

async function textOverflowPlot(textOverflow, monospace) {
  const presidents = await d3.csv("data/us-president-favorability.csv", d3.autoType);
  const opinions = [
    "Very Unfavorable %",
    "Somewhat Unfavorable %",
    "Don’t know %",
    "Have not heard of them %",
    "Somewhat Favorable %",
    "Very Favorable %"
  ];
  const dates = new Map(presidents.map((p) => [p.Name, p["First Inauguration Date"]]));
  return Plot.plot({
    width: 500,
    height: textOverflow ? 730 : 1100,
    marginLeft: 95,
    marginRight: 54,
    x: {percent: true, label: "opinion (%)"},
    y: {domain: Plot.valueof(presidents, "Name")},
    color: {domain: opinions, scheme: "rdylbu"},
    marks: [
      Plot.axisX({monospace}),
      Plot.axisY({lineWidth: monospace ? 9 : 6, textOverflow, monospace}),
      Plot.axisY({
        anchor: "right",
        tickFormat: (name) => `${dates.get(name).getUTCFullYear()}`,
        label: "First inauguration date",
        tickSize: 0,
        monospace
      }),
      Plot.barX(presidents, {
        x: "share",
        fill: "opinion",
        y: "President",
        title: (d) => d.opinion.replace("%", `${d.share}%`),
        offset: "normalize",
        transform: (data, facets) => ({
          data: data.flatMap((p) => opinions.map((o) => ({President: p.Name, share: p[o], opinion: o}))),
          facets: facets.map((f) =>
            Array.from(f, (i) => d3.range(i * opinions.length, (i + 1) * opinions.length)).flat()
          )
        })
      }),
      Plot.tickX([0.5], {stroke: "white"})
    ]
  });
}
