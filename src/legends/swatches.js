import {create} from "d3";
import {maybeTickFormat} from "../axis.js";
import {applyInlineStyles, maybeClassName} from "../style.js";

export function legendSwatches(color, {
  columns,
  tickFormat,
  // TODO label,
  swatchSize = 15,
  swatchWidth = swatchSize,
  swatchHeight = swatchSize,
  marginLeft = 0,
  className,
  style,
  width
} = {}) {
  className = maybeClassName(className);
  tickFormat = maybeTickFormat(tickFormat, color.domain);

  const swatches = create("div")
      .attr("class", className)
      .attr("style", `
        --swatchWidth: ${+swatchWidth}px;
        --swatchHeight: ${+swatchHeight}px;
      `);

  let extraStyle;

  if (columns != null) {
    extraStyle = `
      .${className}-swatch {
        display: flex;
        align-items: center;
        break-inside: avoid;
        padding-bottom: 1px;
      }
      .${className}-swatch::before {
        flex-shrink: 0;
      }
      .${className}-label {
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
      }
    `;

    swatches
        .style("columns", columns)
      .selectAll()
      .data(color.domain)
      .join("div")
        .attr("class", `${className}-swatch`)
        .style("--color", color.scale)
        .call(item => item.append("div")
            .attr("class", `${className}-label`)
            .attr("title", tickFormat)
            .text(tickFormat));
  } else {
    extraStyle = `
      .${className} {
        display: flex;
        align-items: center;
        min-height: 33px;
      }
      .${className}-swatch {
        display: inline-flex;
        align-items: center;
        margin-right: 1em;
      }
    `;

    swatches
      .selectAll()
      .data(color.domain)
      .join("span")
        .attr("class", `${className}-swatch`)
        .style("--color", color.scale)
        .text(tickFormat);
  }

  return swatches
      .call(div => div.insert("style", "*").text(`
        .${className} {
          font-family: system-ui, sans-serif;
          font-size: 10px;
          font-variant: tabular-nums;
          margin-bottom: 0.5em;${marginLeft === undefined ? "" : `
          margin-left: ${+marginLeft}px;`}${width === undefined ? "" : `
          width: ${width}px;`}
        }
        .${className}-swatch::before {
          content: "";
          width: var(--swatchWidth);
          height: var(--swatchHeight);
          margin-right: 0.5em;
          background: var(--color);
        }
        ${extraStyle}
      `))
      .call(applyInlineStyles, style)
    .node();
}
