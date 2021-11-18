import {create} from "d3";
import {addStyle, maybeClassName} from "../style.js";

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

export function legendSwatches(color, {
  columns = null,
  format = x => x,
  label,
  swatchSize = 15,
  swatchWidth = swatchSize,
  swatchHeight = swatchSize,
  marginLeft = 0,
  className,
  style,
  width
} = {}) {
  className = maybeClassName(className);
  const swatches = create("div")
    .classed(className, true)
    .attr("style", `--marginLeft: ${+marginLeft}px; --swatchWidth: ${+swatchWidth}px; --swatchHeight: ${+swatchHeight}px;${
      width === undefined ? "" : ` width: ${width}px;`
    }`);
  swatches.append("style").text(styles(className));

  if (columns !== null) {
    const elems = swatches.append("div")
      .style("columns", columns);
    for (const value of color.domain) {
      const d = elems.append("div").classed(`${className}-item`, true);
      d.append("div")
        .classed(`${className}-block`, true)
        .style("background", color.apply(value));
      const label = format(value);
      d.append("div")
        .classed(`${className}-label`, true)
        .text(label)
        .attr("title", label);
    }
  } else {
    swatches
      .selectAll()
      .data(color.domain)
      .join("span")
      .classed(`${className}-swatch`, true)
      .style("--color", color.apply)
      .text(format);
  }

  return create("div")
      .each(addStyle(style))
      .call(label == null ? () => {}
      : div => div.append("div")
        .classed(`${className}-title`, true)
        .text(label))
      .call(div => div.append(() => swatches.node()))
      .node();
}
