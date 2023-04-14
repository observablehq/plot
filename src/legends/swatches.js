import {pathRound as path} from "d3";
import {inferFontVariant, maybeAutoTickFormat} from "../axes.js";
import {createContext, create} from "../context.js";
import {isNoneish, maybeColorChannel, maybeNumberChannel} from "../options.js";
import {isOrdinalScale, isThresholdScale} from "../scales.js";
import {applyInlineStyles, impliedString, maybeClassName} from "../style.js";

function maybeScale(scale, key) {
  if (key == null) return key;
  const s = scale(key);
  if (!s) throw new Error(`scale not found: ${key}`);
  return s;
}

export function legendSwatches(color, {opacity, ...options} = {}) {
  if (!isOrdinalScale(color) && !isThresholdScale(color))
    throw new Error(`swatches legend requires ordinal or threshold color scale (not ${color.type})`);
  return legendItems(color, options, (selection, scale, width, height) =>
    selection
      .append("svg")
      .attr("width", width)
      .attr("height", height)
      .attr("fill", scale.scale)
      .attr("fill-opacity", maybeNumberChannel(opacity)[1])
      .append("rect")
      .attr("width", "100%")
      .attr("height", "100%")
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
  return legendItems(symbol, options, (selection, scale, width, height) =>
    selection
      .append("svg")
      .attr("viewBox", "-8 -8 16 16")
      .attr("width", width)
      .attr("height", height)
      .attr("fill", vf === "color" ? (d) => sf.scale(d) : cf)
      .attr("fill-opacity", fillOpacity)
      .attr("stroke", vs === "color" ? (d) => ss.scale(d) : cs)
      .attr("stroke-opacity", strokeOpacity)
      .attr("stroke-width", strokeWidth)
      .append("path")
      .attr("d", (d) => {
        const p = path();
        symbol.scale(d).draw(p, size);
        return p;
      })
  );
}

function legendItems(scale, options = {}, swatch) {
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
  const context = createContext(options);
  className = maybeClassName(className);
  tickFormat = maybeAutoTickFormat(tickFormat, scale.domain);

  const swatches = create("div", context).attr(
    "class",
    `${className}-swatches ${className}-swatches-${columns != null ? "columns" : "wrap"}`
  );

  let extraStyle;

  if (columns != null) {
    extraStyle = `.${className}-swatches-columns .${className}-swatch {
  display: flex;
  align-items: center;
  break-inside: avoid;
  padding-bottom: 1px;
}
.${className}-swatches-columns .${className}-swatch::before {
  flex-shrink: 0;
}
.${className}-swatches-columns .${className}-swatch-label {
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}`;

    swatches
      .style("columns", columns)
      .selectAll()
      .data(scale.domain)
      .enter()
      .append("div")
      .attr("class", `${className}-swatch`)
      .call(swatch, scale, swatchWidth, swatchHeight)
      .call((item) =>
        item.append("div").attr("class", `${className}-swatch-label`).attr("title", tickFormat).text(tickFormat)
      );
  } else {
    extraStyle = `.${className}-swatches-wrap {
  display: flex;
  align-items: center;
  min-height: 33px;
  flex-wrap: wrap;
}
.${className}-swatches-wrap .${className}-swatch {
  display: inline-flex;
  align-items: center;
  margin-right: 1em;
}`;

    swatches
      .selectAll()
      .data(scale.domain)
      .enter()
      .append("span")
      .attr("class", `${className}-swatch`)
      .call(swatch, scale, swatchWidth, swatchHeight)
      .append(function () {
        return this.ownerDocument.createTextNode(tickFormat.apply(this, arguments));
      });
  }

  return swatches
    .call((div) =>
      div.insert("style", "*").text(
        `.${className}-swatches {
  font-family: system-ui, sans-serif;
  font-size: 10px;
  margin-bottom: 0.5em;
}
.${className}-swatch > svg {
  margin-right: 0.5em;
  overflow: visible;
}
${extraStyle}`
      )
    )
    .style("margin-left", marginLeft ? `${+marginLeft}px` : null)
    .style("width", width === undefined ? null : `${+width}px`)
    .style("font-variant", impliedString(fontVariant, "normal"))
    .call(applyInlineStyles, style)
    .node();
}
