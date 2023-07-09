import * as Plot from "@observablehq/plot";
import * as d3 from "d3";

export async function miserablesArcDiagram() {
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
        sweep: "order-y",
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
