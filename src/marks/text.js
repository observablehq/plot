import {namespaces} from "d3";
import {create} from "../context.js";
import {nonempty} from "../defined.js";
import {formatDefault} from "../format.js";
import {Mark} from "../mark.js";
import {
  indexOf,
  identity,
  string,
  maybeNumberChannel,
  maybeTuple,
  numberChannel,
  isNumeric,
  isTemporal,
  keyword,
  maybeFrameAnchor,
  isTextual,
  isIterable
} from "../options.js";
import {
  applyChannelStyles,
  applyDirectStyles,
  applyIndirectStyles,
  applyAttr,
  applyTransform,
  impliedString,
  applyFrameAnchor
} from "../style.js";
import {template} from "../template.js";
import {maybeIntervalMidX, maybeIntervalMidY} from "../transforms/interval.js";

const defaults = {
  ariaLabel: "text",
  strokeLinejoin: "round",
  strokeWidth: 3,
  paintOrder: "stroke"
};

const softHyphen = "\u00ad";

export class Text extends Mark {
  constructor(data, options = {}) {
    const {
      x,
      y,
      text = isIterable(data) && isTextual(data) ? identity : indexOf,
      frameAnchor,
      textAnchor = /right$/i.test(frameAnchor) ? "end" : /left$/i.test(frameAnchor) ? "start" : "middle",
      lineAnchor = /^top/i.test(frameAnchor) ? "top" : /^bottom/i.test(frameAnchor) ? "bottom" : "middle",
      lineHeight = 1,
      lineWidth = Infinity,
      textOverflow,
      monospace,
      fontFamily = monospace ? "ui-monospace, monospace" : undefined,
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
      {
        x: {value: x, scale: "x", optional: true},
        y: {value: y, scale: "y", optional: true},
        fontSize: {value: vfontSize, optional: true},
        rotate: {value: numberChannel(vrotate), optional: true},
        text: {value: text, filter: nonempty, optional: true}
      },
      options,
      defaults
    );
    this.rotate = crotate;
    this.textAnchor = impliedString(textAnchor, "middle");
    this.lineAnchor = keyword(lineAnchor, "lineAnchor", ["top", "middle", "bottom"]);
    this.lineHeight = +lineHeight;
    this.lineWidth = +lineWidth;
    this.textOverflow = maybeTextOverflow(textOverflow);
    this.monospace = !!monospace;
    this.fontFamily = string(fontFamily);
    this.fontSize = cfontSize;
    this.fontStyle = string(fontStyle);
    this.fontVariant = string(fontVariant);
    this.fontWeight = string(fontWeight);
    this.frameAnchor = maybeFrameAnchor(frameAnchor);
    if (!(this.lineWidth >= 0)) throw new Error(`invalid lineWidth: ${lineWidth}`);
    this.splitLines = splitter(this);
    this.clipLine = clipper(this);
  }
  render(index, scales, channels, dimensions, context) {
    const {x, y} = scales;
    const {x: X, y: Y, rotate: R, text: T, title: TL, fontSize: FS} = channels;
    const {rotate} = this;
    const [cx, cy] = applyFrameAnchor(this, dimensions);
    return create("svg:g", context)
      .call(applyIndirectStyles, this, dimensions, context)
      .call(applyIndirectTextStyles, this, T, dimensions)
      .call(applyTransform, this, {x: X && x, y: Y && y})
      .call((g) =>
        g
          .selectAll()
          .data(index)
          .enter()
          .append("text")
          .call(applyDirectStyles, this)
          .call(applyMultilineText, this, T, TL)
          .attr(
            "transform",
            template`translate(${X ? (i) => X[i] : cx},${Y ? (i) => Y[i] : cy})${
              R ? (i) => ` rotate(${R[i]})` : rotate ? ` rotate(${rotate})` : ``
            }`
          )
          .call(applyAttr, "font-size", FS && ((i) => FS[i]))
          .call(applyChannelStyles, this, channels)
      )
      .node();
  }
}

function maybeTextOverflow(textOverflow) {
  return textOverflow == null
    ? null
    : keyword(textOverflow, "textOverflow", [
        "clip", // shorthand for clip-end
        "ellipsis", // … ellipsis-end
        "clip-start",
        "clip-end",
        "ellipsis-start",
        "ellipsis-middle",
        "ellipsis-end"
      ]).replace(/^(clip|ellipsis)$/, "$1-end");
}

function applyMultilineText(selection, mark, T, TL) {
  if (!T) return;
  const {lineAnchor, lineHeight, textOverflow, splitLines, clipLine} = mark;
  selection.each(function (i) {
    const lines = splitLines(formatDefault(T[i])).map(clipLine);
    const n = lines.length;
    const y = lineAnchor === "top" ? 0.71 : lineAnchor === "bottom" ? 1 - n : (164 - n * 100) / 200;
    if (n > 1) {
      for (let i = 0; i < n; ++i) {
        if (!lines[i]) continue;
        const tspan = this.ownerDocument.createElementNS(namespaces.svg, "tspan");
        tspan.setAttribute("x", 0);
        tspan.setAttribute("y", `${(y + i) * lineHeight}em`);
        tspan.textContent = lines[i];
        this.appendChild(tspan);
      }
    } else {
      if (y) this.setAttribute("y", `${y * lineHeight}em`);
      this.textContent = lines[0];
    }
    if (textOverflow && !TL && lines[0] !== T[i]) {
      const title = this.ownerDocument.createElementNS(namespaces.svg, "title");
      title.textContent = T[i];
      this.appendChild(title);
    }
  });
}

/** @jsdoc text */
export function text(data, options = {}) {
  let {x, y, ...remainingOptions} = options;
  if (options.frameAnchor === undefined) [x, y] = maybeTuple(x, y);
  return new Text(data, {...remainingOptions, x, y});
}

/** @jsdoc textX */
export function textX(data, options = {}) {
  const {x = identity, ...remainingOptions} = options;
  return new Text(data, maybeIntervalMidY({...remainingOptions, x}));
}

/** @jsdoc textY */
export function textY(data, options = {}) {
  const {y = identity, ...remainingOptions} = options;
  return new Text(data, maybeIntervalMidX({...remainingOptions, y}));
}

function applyIndirectTextStyles(selection, mark, T) {
  applyAttr(selection, "text-anchor", mark.textAnchor);
  applyAttr(selection, "font-family", mark.fontFamily);
  applyAttr(selection, "font-size", mark.fontSize);
  applyAttr(selection, "font-style", mark.fontStyle);
  applyAttr(selection, "font-variant", mark.fontVariant === undefined ? inferFontVariant(T) : mark.fontVariant);
  applyAttr(selection, "font-weight", mark.fontWeight);
}

function inferFontVariant(T) {
  return isNumeric(T) || isTemporal(T) ? "tabular-nums" : undefined;
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
function lineWrap(input, maxWidth, widthof) {
  const lines = [];
  let lineStart,
    lineEnd = 0;
  for (const [wordStart, wordEnd, required] of lineBreaks(input)) {
    // Record the start of a line. This isn’t the same as the previous line’s
    // end because we often skip spaces between lines.
    if (lineStart === undefined) lineStart = wordStart;

    // If the current line is not empty, and if adding the current word would
    // make the line longer than the allowed width, then break the line at the
    // previous word end.
    if (lineEnd > lineStart && widthof(input, lineStart, wordEnd) > maxWidth) {
      lines.push(input.slice(lineStart, lineEnd) + (input[lineEnd - 1] === softHyphen ? "-" : ""));
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
  let i = 0,
    j = 0;
  const n = input.length;
  while (j < n) {
    let k = 1;
    switch (input[j]) {
      case softHyphen:
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
      case "\r":
        if (input[j + 1] === "\n") ++k; // falls through
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

// Computed as round(measureText(text).width * 10) at 10px system-ui. For
// characters that are not represented in this map, we’d ideally want to use a
// weighted average of what we expect to see. But since we don’t really know
// what that is, using “e” seems reasonable.
const defaultWidthMap = {
  a: 56,
  b: 63,
  c: 57,
  d: 63,
  e: 58,
  f: 37,
  g: 62,
  h: 60,
  i: 26,
  j: 26,
  k: 55,
  l: 26,
  m: 88,
  n: 60,
  o: 60,
  p: 62,
  q: 62,
  r: 39,
  s: 54,
  t: 38,
  u: 60,
  v: 55,
  w: 79,
  x: 54,
  y: 55,
  z: 55,
  A: 69,
  B: 67,
  C: 73,
  D: 74,
  E: 61,
  F: 58,
  G: 76,
  H: 75,
  I: 28,
  J: 55,
  K: 67,
  L: 58,
  M: 89,
  N: 75,
  O: 78,
  P: 65,
  Q: 78,
  R: 67,
  S: 65,
  T: 65,
  U: 75,
  V: 69,
  W: 98,
  X: 69,
  Y: 67,
  Z: 67,
  0: 64,
  1: 48,
  2: 62,
  3: 64,
  4: 66,
  5: 63,
  6: 65,
  7: 58,
  8: 65,
  9: 65,
  " ": 29,
  "!": 32,
  '"': 49,
  "'": 31,
  "(": 39,
  ")": 39,
  ",": 31,
  "-": 48,
  ".": 31,
  "/": 32,
  ":": 31,
  ";": 31,
  "?": 52,
  "‘": 31,
  "’": 31,
  "“": 47,
  "”": 47,
  "…": 82
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
export function defaultWidth(text, start = 0, end = text.length) {
  let sum = 0;
  for (let i = start; i < end; i = readCharacter(text, i)) {
    sum += defaultWidthMap[text[i]] ?? (isPictographic(text, i) ? 120 : defaultWidthMap.e);
  }
  return sum;
}

// Even for monospaced text, we can’t assume that the number of UTF-16 code
// points (i.e., the length of a string) corresponds to the number of visible
// characters; we still have to count graphemes. And note that pictographic
// characters such as emojis are typically not monospaced!
export function monospaceWidth(text, start = 0, end = text.length) {
  let sum = 0;
  for (let i = start; i < end; i = readCharacter(text, i)) {
    sum += isPictographic(text, i) ? 200 : 100;
  }
  return sum;
}

function splitter({monospace, lineWidth, textOverflow}) {
  if (textOverflow != null || lineWidth == Infinity) return (text) => text.split(/\r\n?|\n/g);
  const widthof = monospace ? monospaceWidth : defaultWidth;
  const maxWidth = lineWidth * 100;
  return (text) => lineWrap(text, maxWidth, widthof);
}

function clipper({monospace, lineWidth, textOverflow}) {
  if (textOverflow == null || lineWidth == Infinity) return (text) => text;
  const widthof = monospace ? monospaceWidth : defaultWidth;
  const maxWidth = lineWidth * 100;
  switch (textOverflow) {
    case "clip-start":
      return (text) => clipStart(text, maxWidth, widthof, "");
    case "clip-end":
      return (text) => clipEnd(text, maxWidth, widthof, "");
    case "ellipsis-start":
      return (text) => clipStart(text, maxWidth, widthof, "…");
    case "ellipsis-middle":
      return (text) => clipMiddle(text, maxWidth, widthof, "…");
    case "ellipsis-end":
      return (text) => clipEnd(text, maxWidth, widthof, "…");
  }
}

// Cuts the given text to the given width, using the specified widthof function;
// the returned [index, error] guarantees text.slice(0, index) fits within the
// specified width with the given error. If the text fits naturally within the
// given width, returns [-1, 0]. If the text needs cutting, the given inset
// specifies how much space (in the same units as width and widthof) to reserve
// for a possible ellipsis character.
function cut(text, width, widthof, inset) {
  const I = []; // indexes of read character boundaries
  let w = 0; // current line width
  for (let i = 0, j = 0, n = text.length; i < n; i = j) {
    j = readCharacter(text, i); // read the next character
    const l = widthof(text, i, j); // current character width
    if (w + l > width) {
      w += inset;
      while (w > width && i > 0) (j = i), (i = I.pop()), (w -= widthof(text, i, j)); // remove excess
      return [i, width - w];
    }
    w += l;
    I.push(i);
  }
  return [-1, 0];
}

export function clipEnd(text, width, widthof, ellipsis) {
  text = text.trim(); // ignore leading and trailing whitespace
  const e = widthof(ellipsis);
  const [i] = cut(text, width, widthof, e);
  return i < 0 ? text : text.slice(0, i).trimEnd() + ellipsis;
}

export function clipMiddle(text, width, widthof, ellipsis) {
  text = text.trim(); // ignore leading and trailing whitespace
  const w = widthof(text);
  if (w <= width) return text;
  const e = widthof(ellipsis) / 2;
  const [i, ei] = cut(text, width / 2, widthof, e);
  const [j] = cut(text, w - width / 2 - ei + e, widthof, -e); // TODO read spaces?
  return j < 0 ? ellipsis : text.slice(0, i).trimEnd() + ellipsis + text.slice(readCharacter(text, j)).trimStart();
}

export function clipStart(text, width, widthof, ellipsis) {
  text = text.trim(); // ignore leading and trailing whitespace
  const w = widthof(text);
  if (w <= width) return text;
  const e = widthof(ellipsis);
  const [j] = cut(text, w - width + e, widthof, -e); // TODO read spaces?
  return j < 0 ? ellipsis : ellipsis + text.slice(readCharacter(text, j)).trimStart();
}

const reCombiner = /[\p{Combining_Mark}\p{Emoji_Modifier}]+/uy;
const rePictographic = /\p{Extended_Pictographic}/uy;

// Reads a single “character” element from the given text starting at the given
// index, returning the index after the read character. Ideally, this implements
// the Unicode text segmentation algorithm and understands grapheme cluster
// boundaries, etc., but in practice this is only smart enough to detect UTF-16
// surrogate pairs, combining marks, and zero-width joiner (zwj) sequences such
// as emoji skin color modifiers. https://unicode.org/reports/tr29/
export function readCharacter(text, i) {
  i += isSurrogatePair(text, i) ? 2 : 1;
  if (isCombiner(text, i)) i = reCombiner.lastIndex;
  if (isZeroWidthJoiner(text, i)) return readCharacter(text, i + 1);
  return i;
}

// We avoid more expensive regex tests involving Unicode property classes by
// first checking for the common case of 7-bit ASCII characters.
function isAscii(text, i) {
  return text.charCodeAt(i) < 0x80;
}

function isSurrogatePair(text, i) {
  const hi = text.charCodeAt(i);
  if (hi >= 0xd800 && hi < 0xdc00) {
    const lo = text.charCodeAt(i + 1);
    return lo >= 0xdc00 && lo < 0xe000;
  }
  return false;
}

function isZeroWidthJoiner(text, i) {
  return text.charCodeAt(i) === 0x200d;
}

function isCombiner(text, i) {
  return isAscii(text, i) ? false : ((reCombiner.lastIndex = i), reCombiner.test(text));
}

function isPictographic(text, i) {
  return isAscii(text, i) ? false : ((rePictographic.lastIndex = i), rePictographic.test(text));
}
