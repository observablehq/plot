import {create, isoFormat, namespaces} from "d3";
import {nonempty} from "../defined.js";
import {formatNumber} from "../format.js";
import {indexOf, identity, string, maybeNumberChannel, maybeTuple, numberChannel, isNumeric, isTemporal, keyword, maybeFrameAnchor, isTextual} from "../options.js";
import {Mark} from "../plot.js";
import {applyChannelStyles, applyDirectStyles, applyIndirectStyles, applyAttr, applyTransform, offset, impliedString, applyFrameAnchor} from "../style.js";

const defaults = {
  strokeLinejoin: "round"
};

export class Text extends Mark {
  constructor(data, options = {}) {
    const {
      x,
      y,
      text = data != null && isTextual(data) ? identity : indexOf,
      frameAnchor,
      textAnchor = /right$/i.test(frameAnchor) ? "end" : /left$/i.test(frameAnchor) ? "start" : "middle",
      lineAnchor = /^top/i.test(frameAnchor) ? "top" : /^bottom/i.test(frameAnchor) ? "bottom" : "middle",
      lineHeight = 1,
      lineWidth = Infinity,
      fontFamily,
      fontSize,
      fontStyle,
      fontVariant,
      fontWeight,
      rotate
    } = options;
    const [vrotate, crotate] = maybeNumberChannel(rotate, 0);
    const [vfontSize, cfontSize] = maybeFontSizeChannel(fontSize);
    super(
      data,
      [
        {name: "x", value: x, scale: "x", optional: true},
        {name: "y", value: y, scale: "y", optional: true},
        {name: "fontSize", value: vfontSize, optional: true},
        {name: "rotate", value: numberChannel(vrotate), optional: true},
        {name: "text", value: text, filter: nonempty}
      ],
      options,
      defaults
    );
    this.rotate = crotate;
    this.textAnchor = impliedString(textAnchor, "middle");
    this.lineAnchor = keyword(lineAnchor, "lineAnchor", ["top", "middle", "bottom"]);
    this.lineHeight = +lineHeight;
    this.lineWidth = +lineWidth;
    this.fontFamily = string(fontFamily);
    this.fontSize = cfontSize;
    this.fontStyle = string(fontStyle);
    this.fontVariant = string(fontVariant);
    this.fontWeight = string(fontWeight);
    this.frameAnchor = maybeFrameAnchor(frameAnchor);
  }
  render(index, {x, y}, channels, dimensions) {
    const {x: X, y: Y, rotate: R, text: T, fontSize: FS} = channels;
    const {dx, dy, rotate} = this;
    const [cx, cy] = applyFrameAnchor(this, dimensions);
    return create("svg:g")
        .call(applyIndirectTextStyles, this, T)
        .call(applyTransform, x, y, offset + dx, offset + dy)
        .call(g => g.selectAll()
          .data(index)
          .join("text")
            .call(applyDirectStyles, this)
            .call(applyMultilineText, this, T)
            .attr("transform", R ? (X && Y ? i => `translate(${X[i]},${Y[i]}) rotate(${R[i]})`
                : X ? i => `translate(${X[i]},${cy}) rotate(${R[i]})`
                : Y ? i => `translate(${cx},${Y[i]}) rotate(${R[i]})`
                : i => `translate(${cx},${cy}) rotate(${R[i]})`)
              : rotate ? (X && Y ? i => `translate(${X[i]},${Y[i]}) rotate(${rotate})`
                : X ? i => `translate(${X[i]},${cy}) rotate(${rotate})`
                : Y ? i => `translate(${cx},${Y[i]}) rotate(${rotate})`
                : `translate(${cx},${cy}) rotate(${rotate})`)
              : (X && Y ? i => `translate(${X[i]},${Y[i]})`
                : X ? i => `translate(${X[i]},${cy})`
                : Y ? i => `translate(${cx},${Y[i]})`
                : `translate(${cx},${cy})`))
            .call(applyAttr, "font-size", FS && (i => FS[i]))
            .call(applyChannelStyles, this, channels))
      .node();
  }
}

function applyMultilineText(selection, {lineAnchor, lineHeight, lineWidth}, T) {
  if (!T) return;
  const format = isTemporal(T) ? isoFormat : isNumeric(T) ? formatNumber() : string;
  const linesof = isFinite(lineWidth) ? t => lineWrap(t, lineWidth * defaultWidthMap.m, defaultWidth) : t => t.split(/\r\n?|\n/g);
  selection.each(function(i) {
    const lines = linesof(format(T[i]));
    const n = lines.length;
    const y = lineAnchor === "top" ? 0.71 : lineAnchor === "bottom" ? 1 - n : (164 - n * 100) / 200;
    if (n > 1) {
      for (let i = 0; i < n; ++i) {
        if (!lines[i]) continue;
        const tspan = document.createElementNS(namespaces.svg, "tspan");
        tspan.setAttribute("x", 0);
        tspan.setAttribute("y", `${(y + i) * lineHeight}em`);
        tspan.textContent = lines[i];
        this.appendChild(tspan);
      }
    } else {
      if (y) this.setAttribute("y", `${y * lineHeight}em`);
      this.textContent = lines[0];
    }
  });
}

export function text(data, {x, y, ...options} = {}) {
  if (options.frameAnchor === undefined) ([x, y] = maybeTuple(x, y));
  return new Text(data, {...options, x, y});
}

export function textX(data, {x = identity, ...options} = {}) {
  return new Text(data, {...options, x});
}

export function textY(data, {y = identity, ...options} = {}) {
  return new Text(data, {...options, y});
}

function applyIndirectTextStyles(selection, mark, T) {
  applyIndirectStyles(selection, mark);
  applyAttr(selection, "text-anchor", mark.textAnchor);
  applyAttr(selection, "font-family", mark.fontFamily);
  applyAttr(selection, "font-size", mark.fontSize);
  applyAttr(selection, "font-style", mark.fontStyle);
  applyAttr(selection, "font-variant", mark.fontVariant === undefined && (isNumeric(T) || isTemporal(T)) ? "tabular-nums" : mark.fontVariant);
  applyAttr(selection, "font-weight", mark.fontWeight);
}

// https://developer.mozilla.org/en-US/docs/Web/CSS/font-size
const fontSizes = new Set([
  // global keywords
  "inherit",
  "initial",
  "revert",
  "unset",
  // absolute keywords
  "xx-small",
  "x-small",
  "small",
  "medium",
  "large",
  "x-large",
  "xx-large",
  "xxx-large",
  // relative keywords
  "larger",
  "smaller"
]);

// The font size may be expressed as a constant in the following forms:
// - number in pixels
// - string keyword: see above
// - string <length>: e.g., "12px"
// - string <percentage>: e.g., "80%"
// Anything else is assumed to be a channel definition.
function maybeFontSizeChannel(fontSize) {
  if (fontSize == null || typeof fontSize === "number") return [undefined, fontSize];
  if (typeof fontSize !== "string") return [fontSize, undefined];
  fontSize = fontSize.trim().toLowerCase();
  return fontSizes.has(fontSize) || /^[+-]?\d*\.?\d+(e[+-]?\d+)?(\w*|%)$/.test(fontSize)
    ? [undefined, fontSize]
    : [fontSize, undefined];
}

// This is a greedy algorithm for line wrapping. It would be better to use the
// Knuth–Plass line breaking algorithm (but that would be much more complex).
// https://en.wikipedia.org/wiki/Line_wrap_and_word_wrap
function lineWrap(input, maxWidth, widthof = (_, i, j) => j - i) {
  const lines = [];
  let lineStart, lineEnd = 0;
  for (const [wordStart, wordEnd, required] of lineBreaks(input)) {
    // Record the start of a line. This isn’t the same as the previous line’s
    // end because we often skip spaces between lines.
    if (lineStart === undefined) lineStart = wordStart;

    // If the current line is not empty, and if adding the current word would
    // make the line longer than the allowed width, then break the line at the
    // previous word end.
    if (lineEnd > lineStart && widthof(input, lineStart, wordEnd) > maxWidth) {
      lines.push(input.slice(lineStart, lineEnd));
      lineStart = wordStart;
    }

    // If this is a required break (a newline), emit the line and reset.
    if (required) {
      lines.push(input.slice(lineStart, wordEnd));
      lineStart = undefined;
      continue;
    }

    // Extend the current line to include the new word.
    lineEnd = wordEnd;
  }
  return lines;
}

// This is a rudimentary (and U.S.-centric) algorithm for finding opportunities
// to break lines between words. A better and far more comprehensive approach
// would be to use the official Unicode Line Breaking Algorithm.
// https://unicode.org/reports/tr14/
function* lineBreaks(input) {
  let i = 0, j = 0;
  const n = input.length;
  while (j < n) {
    let k = 1;
    switch (input[j]) {
      case "-": // hyphen
        ++j;
        yield [i, j, false];
        i = j;
        break;
      case " ":
        yield [i, j, false];
        while (input[++j] === " "); // skip multiple spaces
        i = j;
        break;
      case "\r": if (input[j + 1] === "\n") ++k; // falls through
      case "\n":
        yield [i, j, true];
        j += k;
        i = j;
        break;
      default:
        ++j;
        break;
    }
  }
  yield [i, j, true];
}

// Computed with measureText(text) at 100px system-ui.
const defaultWidthMap = {
  a: 50, b: 55, c: 50, d: 55, e: 51, f: 30, g: 55, h: 54, i: 21, j: 21, k: 49, l: 20, m: 80, n: 53, o: 53, p: 55, q: 55, r: 31, s: 47, t: 30, u: 53, v: 48, w: 72, x: 47, y: 49, z: 47,
  A: 64, B: 60, C: 69, D: 68, E: 55, F: 53, G: 71, H: 70, I: 22, J: 50, K: 60, L: 52, M: 83, N: 70, O: 73, P: 58, Q: 73, R: 60, S: 59, T: 58, U: 70, V: 63, W: 92, X: 63, Y: 61, Z: 62,
  0: 61, 1: 44, 2: 57, 3: 59, 4: 60, 5: 58, 6: 62, 7: 55, 8: 60, 9: 62,
  " ": 21, "!": 27, '"': 40, "'": 25, ",": 21, "-": 43, ".": 21, "/": 28, ":": 21, ";": 21, "?": 49, "‘": 21, "’": 21, "“": 36, "”": 36, "(": 32, ")": 32
};

// This is a rudimentary (and U.S.-centric) algorithm for measuring the width of
// a string based on a technique of Gregor Aisch; it assumes that individual
// characters are laid out independently and does not implement the Unicode
// grapheme cluster breaking algorithm. It does understand code points, though,
// and so treats things like emoji as having the width of a lowercase e (and
// should be equivalent to using for-of to iterate over code points, while also
// being fast). TODO Optimize this by noting that we often re-measure characters
// that were previously measured?
// http://www.unicode.org/reports/tr29/#Grapheme_Cluster_Boundaries
// https://exploringjs.com/impatient-js/ch_strings.html#atoms-of-text
function defaultWidth(text, start, end) {
  let sum = 0;
  for (let i = start; i < end; ++i) {
    sum += defaultWidthMap[text[i]] || defaultWidthMap.e;
    const first = text.charCodeAt(i);
    if (first >= 0xd800 && first <= 0xdbff) { // high surrogate
      const second = text.charCodeAt(i + 1);
      if (second >= 0xdc00 && second <= 0xdfff) { // low surrogate
        ++i; // surrogate pair
      }
    }
  }
  return sum;
}
