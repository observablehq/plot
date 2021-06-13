import {create} from "d3";

export function legendSwatches(color, {
  columns = null,
  format = x => x,
  swatchSize = 15,
  swatchWidth = swatchSize,
  swatchHeight = swatchSize,
  marginLeft = 0
} = {}) {
  const swatches = create("div")
    .classed("swatches", true)
    .attr("style", `--marginLeft: ${+marginLeft}px; --swatchWidth: ${+swatchWidth}px; --swatchHeight: ${+swatchHeight}px`);

  if (columns !== null) {
    const elems = swatches.append("div")
      .style("columns", columns);
    for (const value of color.domain()) {
      const d = elems.append("div").classed("swatch-item", true);
      d.append("div")
        .classed("swatch-block", true)
        .style("background", color(value));
      const label = format(value);
      d.append("div")
        .classed("swatch-label", true)
        .text(label)
        .attr("title", label.replace(/["&]/g, entity));
    }
  } else {
    swatches
      .selectAll()
      .data(color.domain())
      .join("span")
      .classed("swatch", true)
      .style("--color", color)
      .text(format);
  }
  return swatches.node();
}

function entity(character) {
  return `&#${character.charCodeAt(0).toString()};`;
}
