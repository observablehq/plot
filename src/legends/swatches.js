import {path} from "d3";
import {inferFontVariant} from "../axes.js";
import {maybeAutoTickFormat} from "../axis.js";
import {Context, create} from "../context.js";
import {isNoneish, maybeColorChannel, maybeNumberChannel} from "../options.js";
import {isOrdinalScale, isThresholdScale} from "../scales.js";
import {applyInlineStyles, impliedString, maybeClassName} from "../style.js";

function maybeScale(scale, key) {
  if (key == null) return key;
  const s = scale(key);
  if (!s) throw new Error(`scale not found: ${key}`);
  return s;
}

export function legendSwatches(color, options) {
  if (!isOrdinalScale(color) && !isThresholdScale(color))
    throw new Error(`swatches legend requires ordinal or threshold color scale (not ${color.type})`);
  return legendItems(
    color,
    options,
    (selection, scale) =>
      selection.append("svg").attr("fill", scale.scale).append("rect").attr("width", "100%").attr("height", "100%"),
    (className) => `.${className}-swatch svg {
        width: var(--swatchWidth);
        height: var(--swatchHeight);
        margin-right: 0.5em;
      }`
  );
}

export function legendSymbols(
  symbol,
  {
    fill = symbol.hint?.fill !== undefined ? symbol.hint.fill : "none",
    fillOpacity = 1,
    stroke = symbol.hint?.stroke !== undefined ? symbol.hint.stroke : isNoneish(fill) ? "currentColor" : "none",
    strokeOpacity = 1,
    strokeWidth = 1.5,
    r = 4.5,
    ...options
  } = {},
  scale
) {
  const [vf, cf] = maybeColorChannel(fill);
  const [vs, cs] = maybeColorChannel(stroke);
  const sf = maybeScale(scale, vf);
  const ss = maybeScale(scale, vs);
  const size = r * r * Math.PI;
  fillOpacity = maybeNumberChannel(fillOpacity)[1];
  strokeOpacity = maybeNumberChannel(strokeOpacity)[1];
  strokeWidth = maybeNumberChannel(strokeWidth)[1];
  return legendItems(
    symbol,
    options,
    (selection) =>
      selection
        .append("svg")
        .attr("viewBox", "-8 -8 16 16")
        .attr("fill", vf === "color" ? (d) => sf.scale(d) : null)
        .attr("stroke", vs === "color" ? (d) => ss.scale(d) : null)
        .append("path")
        .attr("d", (d) => {
          const p = path();
          symbol.scale(d).draw(p, size);
          return p;
        }),
    (className) => `.${className}-swatch > svg {
        width: var(--swatchWidth);
        height: var(--swatchHeight);
        margin-right: 0.5em;
        overflow: visible;
        fill: ${cf};
        fill-opacity: ${fillOpacity};
        stroke: ${cs};
        stroke-width: ${strokeWidth}px;
        stroke-opacity: ${strokeOpacity};
      }`
  );
}

function legendItems(scale, options = {}, swatch, swatchStyle) {
  let {
    columns,
    tickFormat,
    fontVariant = inferFontVariant(scale),
    // TODO label,
    swatchSize = 15,
    swatchWidth = swatchSize,
    swatchHeight = swatchSize,
    marginLeft = 0,
    className,
    style,
    width
  } = options;
  const context = Context(options);
  className = maybeClassName(className);
  tickFormat = maybeAutoTickFormat(tickFormat, scale.domain);

  const swatches = create("div", context)
    .attr("class", className)
    .attr(
      "style",
      `
        --swatchWidth: ${+swatchWidth}px;
        --swatchHeight: ${+swatchHeight}px;
      `
    );

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
      .data(scale.domain)
      .enter()
      .append("div")
      .attr("class", `${className}-swatch`)
      .call(swatch, scale)
      .call((item) =>
        item.append("div").attr("class", `${className}-label`).attr("title", tickFormat).text(tickFormat)
      );
  } else {
    extraStyle = `
      .${className} {
        display: flex;
        align-items: center;
        min-height: 33px;
        flex-wrap: wrap;
      }
      .${className}-swatch {
        display: inline-flex;
        align-items: center;
        margin-right: 1em;
      }
    `;

    swatches
      .selectAll()
      .data(scale.domain)
      .enter()
      .append("span")
      .attr("class", `${className}-swatch`)
      .call(swatch, scale)
      .append(function () {
        return this.ownerDocument.createTextNode(tickFormat.apply(this, arguments));
      });
  }

  return swatches
    .call((div) =>
      div.insert("style", "*").text(`
        .${className} {
          font-family: system-ui, sans-serif;
          font-size: 10px;
          margin-bottom: 0.5em;${
            marginLeft === undefined
              ? ""
              : `
          margin-left: ${+marginLeft}px;`
          }${
        width === undefined
          ? ""
          : `
          width: ${width}px;`
      }
        }
        ${swatchStyle(className)}
        ${extraStyle}
      `)
    )
    .style("font-variant", impliedString(fontVariant, "normal"))
    .call(applyInlineStyles, style)
    .node();
}
