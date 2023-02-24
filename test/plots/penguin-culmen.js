import * as Plot from "@observablehq/plot";
import * as d3 from "d3";
import {pointers, quadtree} from "d3";
import {create} from "d3";

export default async function () {
  const penguins = await d3.csv("data/penguins.csv", d3.autoType);
  return Plot.plot({
    height: 600,
    grid: true,
    facet: {
      data: penguins,
      x: "sex",
      y: "species",
      marginRight: 80
    },
    marks: [
      Plot.frame(),
      Plot.dot(penguins, {
        facet: "exclude",
        x: "culmen_depth_mm",
        y: "culmen_length_mm",
        r: 2,
        fill: "#ddd",
        details: false // TODO null
      }),
      Plot.dot(penguins, {x: "culmen_depth_mm", y: "culmen_length_mm", details: Plot.identity}),
      new Tooltip()
    ]
  });
}

class Tooltip extends Plot.Mark {
  render(I, S, C, {width, height, marginLeft, marginTop, marginRight, marginBottom}) {
    const g = create("svg:g");
    const popup = g
      .append("svg:foreignObject")
      .attr("width", 150)
      .attr("height", 200)
      .attr("x", marginLeft)
      .attr("y", marginTop);
    const div = popup.append("xhtml:div");
    g.append("svg:rect")
      .attr("x", marginLeft)
      .attr("width", width - marginLeft - marginRight)
      .attr("y", marginTop)
      .attr("height", height - marginTop - marginBottom)
      .attr("fill", "none")
      .attr("pointer-events", "all")
      .on("pointermove", function (event) {
        if (!this.__quadtree) {
          this.__quadtree = quadtree();
          for (const node of g.node().parentNode.querySelectorAll("*")) {
            // @1: details;
            // @2: geometry;
            if (node["@1"]) {
              console.warn("adding", node["@1"], node["@2"]);
              this.__quadtree.add([node["@2"].x, node["@2"].y, node["@1"]]);
            }
          }
        }
        const [[x, y]] = pointers(event);
        const [, , closest] = this.__quadtree.find(x, y);
        div.html(
          Object.entries(closest)
            .map(([k, v]) => [k, v].join(": "))
            .join("<br>")
        );
      });
    return g.node();
  }
}
