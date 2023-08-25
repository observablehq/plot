import * as Plot from "@observablehq/plot";
import * as d3 from "d3";
import {svg} from "htl";

function* collatz(n) {
  yield n;
  while (n > 1) {
    n = n % 2 ? 3 * n + 1 : n >> 1;
    yield n;
  }
}

export async function arcCollatz() {
  return Plot.plot({
    height: 520,
    axis: null,
    inset: 10,
    y: {domain: [-1, 1]},
    marks: [
      Plot.text(collatz(12), {x: Plot.identity, text: Plot.identity, y: 0, fill: "currentColor"}),
      Plot.arrow(d3.pairs(collatz(12)), {
        x1: "0",
        x2: "1",
        y: 0,
        bend: 90,
        headLength: 4,
        insetEnd: 18,
        insetStart: 14
      }),
      Plot.dot(collatz(12), {x: Plot.identity, r: 10})
    ]
  });
}

export async function arcCollatzUp() {
  return Plot.plot({
    height: 260,
    x: {ticks: 20, tickSize: 0},
    y: {domain: [0, 1], axis: null},
    marks: [
      Plot.dot(collatz(12), {x: Plot.identity, y: 0, fill: "currentColor"}),
      Plot.arrow(d3.pairs(collatz(12)), {
        x1: ([d]) => d - (d === 12 ? 0 : 0.07),
        x2: ([, d]) => d + (d === 1 ? 0 : 0.07),
        y: 0,
        dy: -3,
        bend: 70,
        inset: 4,
        sweep: "-x",
        stroke: ([a, b]) => `url(#gradient${+(a > b)})`
      }),
      () =>
        svg`<defs>
        <linearGradient id="gradient0" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="5%" stop-opacity="0.3"></stop>
          <stop offset="95%" stop-opacity="1"></stop>
        </linearGradient>
        <linearGradient id="gradient1" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="5%" stop-opacity="1"></stop>
          <stop offset="95%" stop-opacity="0.3"></stop>
        </linearGradient>`
    ]
  });
}

export async function arcMiserables() {
  const {nodes, links} = await d3.json<any>("data/miserables.json");
  const darker = (options) =>
    Plot.initializer(options, (data, facets, {fill: {value: F}}, {color}) => ({
      data,
      facets,
      channels: {
        fill: {value: Plot.valueof(F as number[], (d) => d3.lab(color(d)).darker(2))}
      }
    }));
  const orderByGroup = d3
    .sort(
      nodes,
      ({group}) => group,
      ({id}) => id
    )
    .map(({id}) => id);
  const groups = new Map(nodes.map((d) => [d.id, d.group]));
  const samegroup = ({source, target}) => (groups.get(source) === groups.get(target) ? groups.get(source) : null);
  return Plot.plot({
    width: 640,
    height: 1080,
    marginLeft: 100,
    x: {domain: [0, 1]}, // see https://github.com/observablehq/plot/issues/1541
    y: {domain: orderByGroup},
    axis: null,
    color: {
      domain: d3.sort(new Set(Plot.valueof(nodes, "group"))),
      scheme: "Category10",
      unknown: "#aaa"
    },
    marks: [
      Plot.arrow(links, {
        x: 0,
        y1: "source",
        y2: "target",
        sweep: "-y",
        bend: 90,
        stroke: samegroup,
        sort: samegroup,
        reverse: true, // put group links on top
        strokeWidth: 1.5,
        strokeOpacity: 0.6,
        headLength: 0
      }),
      Plot.dot(nodes, {frameAnchor: "left", y: "id", fill: "group"}),
      Plot.text(
        nodes,
        darker({
          frameAnchor: "left",
          y: "id",
          text: "id",
          textAnchor: "end",
          dx: -6,
          fill: "group"
        })
      )
    ]
  });
}
