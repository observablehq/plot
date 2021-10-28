import {create} from "d3";

// TODO: once we inline, is this smart variable handling any
// better than inline styles?
const styles = `
.plot-swatches {
  display: flex;
  align-items: center;
  margin-left: var(--marginLeft);
  min-height: 33px;
  font: 10px sans-serif;
  margin-bottom: 0.5em;
}

.plot-swatches > div {
  width: 100%;
}

.plot-swatches .swatch-item {
  break-inside: avoid;
  display: flex;
  align-items: center;
  padding-bottom: 1px;
}

.plot-swatches .swatch-label {
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  max-width: calc(100% - var(--swatchWidth) - 0.5em);
}

.plot-swatches .swatch-block {
  width: var(--swatchWidth);
  height: var(--swatchHeight);
  margin: 0 0.5em 0 0;
}

.plot-swatch {
  display: inline-flex;
  align-items: center;
  margin-right: 1em;
}

.plot-swatch::before {
  content: "";
  width: var(--swatchWidth);
  height: var(--swatchHeight);
  margin-right: 0.5em;
  background: var(--color);
}
`;

export function legendSwatches({
  columns = null,
  format = x => x,
  swatchSize = 15,
  swatchWidth = swatchSize,
  swatchHeight = swatchSize,
  marginLeft = 0,
  style = styles,
  width,
  scale: color
} = {}) {
  const swatches = create("div")
    .classed("plot-swatches", true)
    .attr("style", `--marginLeft: ${+marginLeft}px; --swatchWidth: ${+swatchWidth}px; --swatchHeight: ${+swatchHeight}px;${
      width === undefined ? "" : ` width: ${width}px;`
    }`);
  swatches.append("style").text(style);

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
      .classed("plot-swatch", true)
      .style("--color", color)
      .text(format);
  }
  return swatches.node();
}

function entity(character) {
  return `&#${character.charCodeAt(0).toString()};`;
}
