import * as Plot from "@observablehq/plot";
import * as d3 from "d3";

const times = [
  "2013-04-05",
  "2013-04-11",
  "2013-04-14",
  "2013-04-16",
  "2013-04-18",
  "2013-04-21",
  "2013-04-27"
].map(d3.isoParse);

const events = [
  {date: "2013-04-05T13:00Z", text: "Initiate"},
  {date: "2013-04-11T13:00Z", text: "Begin"},
  {date: "2013-03-13T20:00Z", text: "Entry"},
  {date: "2013-03-15T00:00Z", text: "Test"},
  {date: "2013-03-16T00:00Z", text: "Drive"},
  {date: "2013-03-17T08:00Z", text: "Drive"},
  {date: "2013-03-18T15:00Z", text: "Brake"},
  {date: "2013-03-20T10:00Z", text: "Stop"},
  {date: "2013-03-23T14:00Z", text: "Shutdown"}
].map(d => ({text: d.text, date: d3.isoParse(d.date)}));

const days = [...d3.utcDays(...d3.extent(times)), times[times.length-1]];

export default async function() {
  return Plot.plot({
    grid: true,
    x: {
      domain: times,
      type: "linear",
      ticks: days,
      tickFormat: d3.timeFormat("%d"),
      inset: 20,
      label: "date →"
    },
    color: {scheme: "cool"},
    marks: [
      Plot.barX(d3.pairs(times), {x1: "0", x2: "1", fill: (_,i) => i}),
      Plot.dotX(events, {x: "date", fill: "white"}),
      Plot.textX(events, {x: "date", text: "text", dx: -5, dy: -10, fill: "white", textAnchor: "start"})
    ],
    height: 90
  });
}
