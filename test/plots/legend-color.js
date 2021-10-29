import * as d3 from "d3";
import * as Plot from "@observablehq/plot";

export default async function() {
  const div = document.createElement("div");

  const ordinal = Plot.dot("ABCDEFGHIJ", {x: 0, fill: d => d}).plot();

  for (const l of [
    ordinal.legend("color"),

    ordinal.legend("color", {legend: "ramp"}),

    Plot.dot({length: 22}, {x: 0, fill: (_, i) => i % 11}).plot().legend("color"),

    Plot.dot({length: 22}, {x: 0, fill: (_, i) => i % 11}).plot({
      color: {label: "scale label"}
    }).legend("color"),

    Plot.dot({length: 22}, {x: 0, fill: (_, i) => i % 11}).plot({
      color: {label: "scale label"}
    }).legend("color", {label: "legend label"}),

    Plot.legend({
      color: {
        width: 400,
        type: "sqrt",
        scheme: "blues",
        range: [0.25, 1],
        label: "I feel blue",
        marginLeft: 150,
        marginRight: 50
      }
    }),

    Plot.legend({ color: { domain: "DCBA", scheme: "rainbow" } }),

    Plot.legend({ color: { domain: "DCBA", reverse: true } }),

    Plot.legend({
      color: Plot.plot({
        marks: [
          Plot.dotX(d3.range(100), {
            x: (i) => i,
            y: (i) => i ** 2,
            fill: (i) => i ** 2
          })
        ],
        color: { type: "quantile", scheme: "inferno", quantiles: 7 }
      }).scale("color"),
      width: 300,
      label: "quantiles!",
      tickFormat: ",d"
    }),

    Plot.legend({
      color: {
        type: "threshold",
        domain: d3.ticks(2, 8, 5),
        scheme: "viridis"
      },
      width: 300,
      label: "thresholds!",
      tickFormat: (d) => d.toFixed(1)
    }),

    Plot.legend({
      color: { scheme: "viridis", domain: [0, 100], label: "Temperature (°F)" }
    }),

    Plot.legend({
      color: { scheme: "Turbo", type: "sqrt", domain: [0, 1], label: "Speed (kts)" }
    }),

    Plot.legend({
      color: {
        type: "diverging",
        domain: [-0.1, 0.1],
        scheme: "PiYG",
        label: "Daily change",
        tickFormat: "+%"
      }
    }),

    Plot.legend({
      color: {
        type: "diverging-sqrt",
        domain: [-0.1, 0.1],
        scheme: "RdBu",
        label: "Daily change",
        tickFormat: "+%"
      }
    }),

    Plot.legend({
      color: {
        type: "log",
        domain: [1, 100],
        scheme: "Blues",
        label: "Energy (joules)",
        ticks: 10,
        width: 380
      }
    }),

    Plot.legend({
      color: {
        type: "sqrt",
        domain: [-100, 0, 100],
        range: ["blue", "white", "red"],
        label: "Temperature (°C)",
        interpolate: "rgb"
      }
    }),

    Plot.legend({
      color: {
        type: "quantile",
        domain: d3.range(1000).map(d3.randomNormal.source(d3.randomLcg(42))(100, 20)),
        scheme: "Spectral",
        label: "Height (cm)",
        tickFormat: ".0f",
        width: 400,
        quantiles: 10
      }
    }),
    
    Plot.legend({
      color: {
        type: "threshold",
        domain: [2.5, 3.1, 3.5, 3.9, 6, 7, 8, 9.5],
        scheme: "RdBu",
        label: "Unemployment rate (%)",
        tickSize: 0
      }
    }),

    Plot.legend({
      color: {
        domain: [
          "<10",
          "10-19",
          "20-29",
          "30-39",
          "40-49",
          "50-59",
          "60-69",
          "70-79",
          "≥80"
        ],
        scheme: "Spectral",
        label: "Age (years)",
        tickSize: 0
      }
    }),

    Plot.legend({
      color: {
        domain: [
          "<10",
          "10-19",
          "20-29",
          "30-39",
          "40-49",
          "50-59",
          "60-69",
          "70-79",
          "≥80"
        ],
        scheme: "Spectral",
        label: "Age (years)",
        tickSize: 0,
        legend: "ramp",
        width: 400
      }
    }),

    Plot.legend({
      color: { domain: ["blueberries", "oranges", "apples"], scheme: "category10" }
    }),

    Plot.legend({
      color: {
        domain: [
          "Wholesale and Retail Trade",
          "Manufacturing",
          "Leisure and hospitality",
          "Business services",
          "Construction",
          "Education and Health",
          "Government",
          "Finance",
          "Self-employed",
          "Other"
        ],
        columns: "180px", // responsive!
        width: 960
      }
    })

  ]) div.appendChild(l);

  return div;
}
