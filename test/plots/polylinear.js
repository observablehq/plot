import * as Plot from "@observablehq/plot";
import * as d3 from "d3";

const times = [
  new Date(2013, 3, 5),
  new Date(2013, 3, 11),
  new Date(2013, 3, 14),
  new Date(2013, 3, 16),
  new Date(2013, 3, 18),
  new Date(2013, 3, 21),
  new Date(2013, 3, 27)
];

const events = [
  { date: new Date(2013, 3, 5, 13, 0), text: "Initiate" },
  { date: new Date(2013, 3, 11, 13, 0), text: "Begin" },
  { date: new Date(2013, 3, 13, 20, 0), text: "Entry" },
  { date: new Date(2013, 3, 15, 0, 0), text: "Test" },
  { date: new Date(2013, 3, 16, 0, 0), text: "Drive" },
  { date: new Date(2013, 3, 17, 8, 0), text: "Drive" },
  { date: new Date(2013, 3, 18, 15, 0), text: "Brake" },
  { date: new Date(2013, 3, 20, 10, 0), text: "Stop" },
  { date: new Date(2013, 3, 23, 14, 0), text: "Shutdown" }
];

export default async function() {
  return Plot.plot({
    grid: true,
    x: {
      domain: times,
      type: "linear",
      ticks: [...d3.timeDays(...d3.extent(times)), times[times.length-1]],
      tickFormat: d3.timeFormat("%d"),
      inset: 20,
      label: "date →"
    },
    color: { scheme: "cool" },
    marks: [
      Plot.barX(d3.pairs(times), {x1: "0", x2: "1", fill: (_,i) => i}),
      Plot.dotX(events, {x: "date", fill: "white"}),
      Plot.textX(events, {x: "date", text: "text", dx: -5, dy: -10, fill: "white", textAnchor: "start"})
    ],
    height: 90
  });
}
