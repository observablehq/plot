import * as Plot from "@observablehq/plot";
import * as d3 from "d3";

export function styleOverrideLegendCategorical() {
  const className = "style-override";
  const wrapper = d3
    .create("div")
    .attr("class", "test-wrapper") // Required by ../plot.js
    .html(
      `
      <style>
        .${className}-swatches {
          font-family: cursive;
          font-size: 25px;
          margin-bottom: 1em;
        }
      </style>
      `
    )
    .node();

  const options = {color: {domain: "ABCDEFGHIJ"}, label: "Hello"};

  // Normal legend without style overrides
  wrapper.append(Plot.legend(options));

  // Styled legend with className override
  wrapper.append(Plot.legend({...options, className}));

  return wrapper;
}
