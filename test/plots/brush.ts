import * as Plot from "@observablehq/plot";
import * as d3 from "d3";
import {html} from "htl";

export async function brushBand() {
  const penguins = await d3.csv<any>("data/penguins.csv", d3.autoType);
  return showValue(
    Plot.cell(
      penguins,
      Plot.brush(Plot.group({fill: "count"}, {x: "species", y: "sex", unselected: {fillOpacity: 0.3}}))
    ).plot()
  );
}

export async function brushFacets() {
  const penguins = await d3.csv<any>("data/penguins.csv", d3.autoType);
  return showValue(
    Plot.plot({
      marks: [
        Plot.dot(
          penguins,
          Plot.brush({
            unselected: {fill: "white"},
            x: "culmen_length_mm",
            y: "culmen_depth_mm",
            fx: "species",
            fill: "species",
            stroke: "black"
          })
        )
      ]
    })
  );
}

export async function brushMetroInequalityChange() {
  const data = await d3.csv<any>("data/metros.csv", d3.autoType);
  return showValue(
    Plot.plot({
      grid: true,
      inset: 10,
      x: {
        type: "log",
        label: "Population"
      },
      y: {
        label: "Inequality"
      },
      color: {
        scheme: "BuRd",
        symmetric: false
      },
      marks: [
        Plot.link(
          data,
          Plot.brush({
            x1: "POP_1980",
            y1: "R90_10_1980",
            x2: "POP_2015",
            y2: "R90_10_2015",
            unselected: {stroke: "#ccc"},
            markerEnd: "arrow",
            stroke: (d) => d.R90_10_2015 - d.R90_10_1980
          })
        ),
        Plot.text(data, {
          x: "POP_2015",
          y: "R90_10_2015",
          filter: "highlight",
          text: "nyt_display",
          fill: "currentColor",
          stroke: "white",
          pointerEvents: "none",
          dy: -8
        })
      ]
    })
  );
}

export async function brushRectX() {
  const penguins = await d3.csv<any>("data/penguins.csv", d3.autoType);
  return showValue(
    Plot.plot({
      marks: [
        Plot.rectX(
          penguins,
          Plot.brushY(Plot.binY({x: "count"}, {unselected: {fill: "gray"}, y: "body_mass_g", thresholds: 20}))
        )
      ]
    })
  );
}

export async function brushRectY() {
  const penguins = await d3.csv<any>("data/penguins.csv", d3.autoType);
  return showValue(
    Plot.plot({
      marks: [
        Plot.rectY(
          penguins,
          Plot.brushX(Plot.binX({y: "count"}, {unselected: {fillOpacity: 0.5}, x: "body_mass_g", thresholds: 20}))
        )
      ]
    })
  );
}

export async function brushScatterplot() {
  const penguins = await d3.csv<any>("data/penguins.csv", d3.autoType);
  return showValue(
    Plot.plot({
      marks: [
        Plot.dot(
          penguins,
          Plot.brush({
            unselected: {fillOpacity: 0},
            selected: {fillOpacity: 1},
            x: "culmen_length_mm",
            y: "culmen_depth_mm",
            fill: "species",
            stroke: "black",
            fillOpacity: 0.5
          })
        )
      ]
    })
  );
}

function showValue(plot) {
  const textarea = html`<textarea rows=10 style="width: 640px; resize: none;">`;
  const oninput = () => {
    textarea.value = !plot.value
      ? "—"
      : (
          ["x", "y", "x1", "x2", "y1", "y2"]
            .map((x) =>
              x in plot.value
                ? `${x}: ${typeof plot.value[x] === "number" ? plot.value[x].toFixed(3) : plot.value[x]}`
                : ""
            )
            .filter((d) => d)
            .join("; ") +
          "\n" +
          JSON.stringify(plot.value, null, 2)
        ).trim();
  };
  oninput(); // initialize the textarea to the initial value
  plot.oninput = oninput; // update during interaction
  return html`<figure>${plot}${textarea}</figure>`;
}
