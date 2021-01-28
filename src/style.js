import {string, number} from "./mark.js";

function attr(name, impliedValue) {
  return new AttrProperty(name, impliedValue);
}

function style(name, impliedValue) {
  return new StyleProperty(name, impliedValue);
}

class Property {
  constructor(name, impliedValue = null) {
    this.name = name;
    this.impliedValue = impliedValue;
    this.type = typeof impliedValue === "number" ? number : string;
  }
  value(value) {
    value = this.type(value);
    return value === this.impliedValue ? undefined : value;
  }
}

class AttrProperty extends Property {
  apply(selection, value) {
    applyAttr(selection, this.name, value);
  }
}

class StyleProperty extends Property {
  apply(selection, value) {
    applyStyle(selection, this.name, value);
  }
}

const indirectProperties = {
  fill: attr("fill", "currentColor"),
  fillOpacity: attr("fill-opacity", 1),
  stroke: attr("stroke", "none"),
  strokeWidth: attr("stroke-width", 1),
  strokeOpacity: attr("stroke-opacity", 1),
  strokeLinejoin: attr("stroke-linejoin", "miter"),
  strokeLinecap: attr("stroke-linecap", "butt"),
  strokeMiterlimit: attr("stroke-miterlimit", 1),
  strokeDasharray: attr("stroke-dasharray"),
  fontFamily: attr("font-family", "sans-serif"),
  fontSize: attr("font-size", "10px"),
  fontSizeAdjust: attr("font-size-adjust", "none"),
  fontStretch: attr("font-stretch", "normal"),
  fontStyle: attr("font-style", "normal"),
  fontVariant: attr("font-variant", "normal"),
  fontWeight: attr("font-weight", "normal")
};

const directProperties = {
  mixBlendMode: style("mix-blend-mode", "normal")
};

const properties = {
  ...directProperties,
  ...indirectProperties
};

export function Style(mark, style = {}) {
  for (const key in properties) {
    mark[key] = properties[key].value(style[key]);
  }
}

export function applyIndirectStyles(selection, mark) {
  for (const key in indirectProperties) {
    indirectProperties[key].apply(selection, mark[key]);
  }
}

export function applyDirectStyles(selection, mark) {
  for (const key in directProperties) {
    directProperties[key].apply(selection, mark[key]);
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
