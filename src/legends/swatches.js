import {create} from "d3";
import {maybeClassName} from "../style.js";

// TODO: once we inline, is this smart variable handling any
// better than inline styles?
const styles = uid => `
.${uid} {
  display: flex;
  align-items: center;
  margin-left: var(--marginLeft);
  min-height: 33px;
  font: 10px sans-serif;
  margin-bottom: 0.5em;
}

.${uid} > div {
  width: 100%;
}

.${uid}-item {
  break-inside: avoid;
  display: flex;
  align-items: center;
  padding-bottom: 1px;
}

.${uid}-label {
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  max-width: calc(100% - var(--swatchWidth) - 0.5em);
}

.${uid}-block {
  width: var(--swatchWidth);
  height: var(--swatchHeight);
  margin: 0 0.5em 0 0;
}

.${uid}-swatch {
  display: inline-flex;
  align-items: center;
  margin-right: 1em;
}

.${uid}-swatch::before {
  content: "";
  width: var(--swatchWidth);
  height: var(--swatchHeight);
  margin-right: 0.5em;
  background: var(--color);
}

.${uid}-title {
  font-weight: bold;
  font-family: sans-serif;
  font-size: 10px;
  margin: 5px 0 -5px 0;
}
`;

export function legendSwatches({
  columns = null,
  format = x => x,
  label,
  swatchSize = 15,
  swatchWidth = swatchSize,
  swatchHeight = swatchSize,
  marginLeft = 0,
  className,
  uid = maybeClassName(className),
  style = styles(uid),
  width,
  scale: color
} = {}) {
  const swatches = create("div")
    .classed(uid, true)
    .attr("style", `--marginLeft: ${+marginLeft}px; --swatchWidth: ${+swatchWidth}px; --swatchHeight: ${+swatchHeight}px;${
      width === undefined ? "" : ` width: ${width}px;`
    }`);
  swatches.append("style").text(style);

  if (columns !== null) {
    const elems = swatches.append("div")
      .style("columns", columns);
    for (const value of color.domain()) {
      const d = elems.append("div").classed(`${uid}-item`, true);
      d.append("div")
        .classed(`${uid}-block`, true)
        .style("background", color(value));
      const label = format(value);
      d.append("div")
        .classed(`${uid}-label`, true)
        .text(label)
        .attr("title", label.replace(/["&]/g, entity));
    }
  } else {
    swatches
      .selectAll()
      .data(color.domain())
      .join("span")
      .classed(`${uid}-swatch`, true)
      .style("--color", color)
      .text(format);
  }

  return label == null
  ? swatches.node()
  : create("div")
      .call(div => div.append("div")
        .classed(`${uid}-title`, true)
        .text(label))
      .call(div => div.append(() => swatches.node()))
      .node();
}

function entity(character) {
  return `&#${character.charCodeAt(0).toString()};`;
}
