import {string, number} from "./mark.js";

function attr(key, name, impliedValue) {
  return new AttrProperty(key, name, impliedValue);
}

function style(key, name, impliedValue) {
  return new StyleProperty(key, name, impliedValue);
}

class Property {
  constructor(key, name, impliedValue) {
    this.key = key;
    this.name = name;
    this.impliedValue = impliedValue;
    this.type = typeof impliedValue === "number" ? number : string;
  }
  define(mark, style) {
    const value = this.type(style[this.key]);
    mark[this.key] = value === this.impliedValue ? undefined : value;
  }
}

class AttrProperty extends Property {
  apply(mark, selection) {
    applyAttr(selection, this.name, mark[this.key]);
  }
}

class StyleProperty extends Property {
  apply(mark, selection) {
    applyStyle(selection, this.name, mark[this.key]);
  }
}

const indirectProperties = [
  attr("fill", "fill", "currentColor"),
  attr("fillOpacity", "fill-opacity", 1),
  attr("stroke", "stroke", "none"),
  attr("strokeWidth", "stroke-width", 1),
  attr("strokeOpacity", "stroke-opacity", 1),
  attr("strokeLinejoin", "stroke-linejoin", "miter"),
  attr("strokeLinecap", "stroke-linecap", "butt"),
  attr("strokeMiterlimit", "stroke-miterlimit", 1),
  attr("strokeDasharray", "stroke-dasharray", null),
  attr("fontFamily", "font-family", "sans-serif"),
  attr("fontSize", "font-size", "10px"),
  attr("fontSizeAdjust", "font-size-adjust", "none"),
  attr("fontStretch", "font-stretch", "normal"),
  attr("fontStyle", "font-style", "normal"),
  attr("fontVariant", "font-variant", "normal"),
  attr("fontWeight", "font-weight", "normal")
];

const directProperties = [
  style("mixBlendMode", "mix-blend-mode", "normal")
];

const properties = [
  ...directProperties,
  ...indirectProperties
];

export function Style(mark, style = {}) {
  for (const property of properties) {
    property.define(mark, style);
  }
}

export function applyIndirectStyles(selection, mark) {
  for (const property of indirectProperties) {
    property.apply(mark, selection);
  }
}

export function applyDirectStyles(selection, mark) {
  for (const property of directProperties) {
    property.apply(mark, selection);
  }
}

export function applyAttr(selection, name, value) {
  if (value != null) selection.attr(name, value);
}

export function applyStyle(selection, name, value) {
  if (value != null) selection.style(name, value);
}

export function applyTransform(selection, x, y, tx = 0, ty = 0) {
  if (x.bandwidth) tx += x.bandwidth() / 2;
  if (y.bandwidth) ty += y.bandwidth() / 2;
  selection.attr("transform", `translate(${tx},${ty})`);
}
