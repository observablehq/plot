import * as Plot from "@observablehq/plot";
import * as d3 from "d3";

export default async function () {
  const sales = await d3.csv("data/fruit-sales.csv", d3.autoType);
  const plotSelection = d3.select(
    Plot.plot({
      marginLeft: 50,
      y: {
        label: null,
        reverse: true
      },
      marks: [
        Plot.barX(
          sales,
          Plot.groupY({x: "sum"}, {x: "units", y: "fruit", sort: {y: "x", reverse: true}, className: "fruitbars"})
        ),
        Plot.ruleX([0])
      ]
    })
  );

  const div = d3.create("div");
  div.node().appendChild(plotSelection.node());

  plotSelection.select(".fruitbars").attr("stroke", "gold");
  plotSelection
    .select(".fruitbars")
    .on("mouseover", function (d) {
      d3.select(d.target).attr("fill", "red");
    })
    .on("mouseout", function (d) {
      d3.select(d.target).attr("fill", "black");
    });
  plotSelection.select(".fruitbars").attr("fill", "black");

  const numRects = plotSelection.selectAll(".fruitbars rect").size();
  div.append("p").text(`There are ${numRects} instances of 'fruitbars' class rects.`);
  return div.node();
}
