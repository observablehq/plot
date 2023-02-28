import * as Plot from "@observablehq/plot";
import {clipEnd, clipMiddle, clipStart, defaultWidth, readCharacter} from "../../src/marks/text.js";
import assert from "assert";

it("text() has the expected defaults", () => {
  const text = Plot.text();
  assert.strictEqual(text.data, undefined);
  assert.strictEqual(text.transform, undefined);
  assert.deepStrictEqual(Object.keys(text.channels), ["x", "y", "text"]);
  assert.deepStrictEqual(
    Object.values(text.channels).map((c) =>
      Plot.valueof(
        [
          [1, 2],
          [3, 4]
        ],
        c.value
      )
    ),
    [
      [1, 3],
      [2, 4],
      [0, 1]
    ]
  );
  assert.deepStrictEqual(
    Object.values(text.channels).map((c) => c.scale),
    ["x", "y", undefined]
  );
  assert.strictEqual(text.fill, undefined);
  assert.strictEqual(text.fillOpacity, undefined);
  assert.strictEqual(text.stroke, undefined);
  assert.strictEqual(text.strokeWidth, undefined);
  assert.strictEqual(text.strokeOpacity, undefined);
  assert.strictEqual(text.strokeLinejoin, undefined);
  assert.strictEqual(text.strokeLinecap, undefined);
  assert.strictEqual(text.strokeMiterlimit, undefined);
  assert.strictEqual(text.strokeDasharray, undefined);
  assert.strictEqual(text.strokeDashoffset, undefined);
  assert.strictEqual(text.mixBlendMode, undefined);
  assert.strictEqual(text.shapeRendering, undefined);
  assert.strictEqual(text.textAnchor, undefined);
  assert.strictEqual(text.lineAnchor, "middle");
  assert.strictEqual(text.frameAnchor, "middle");
  assert.strictEqual(text.dx, 0);
  assert.strictEqual(text.dy, 0);
  assert.strictEqual(text.rotate, 0);
});

it("text(strings, {frameAnchor}) has the expected defaults", () => {
  const data = ["hello"];
  const text = Plot.text(data, {frameAnchor: "middle"});
  assert.strictEqual(text.data, data);
  assert.strictEqual(text.transform, undefined);
  assert.deepStrictEqual(Object.keys(text.channels), ["text"]);
  assert.deepStrictEqual(
    Object.values(text.channels).map((c) => Plot.valueof(data, c.value)),
    [data]
  );
  assert.strictEqual(text.textAnchor, undefined);
  assert.strictEqual(text.lineAnchor, "middle");
  assert.strictEqual(text.frameAnchor, "middle");
});

it("text(dates, {frameAnchor}) has the expected defaults", () => {
  const data = [new Date("2021-01-01")];
  const text = Plot.text(data, {frameAnchor: "middle"});
  assert.strictEqual(text.data, data);
  assert.strictEqual(text.transform, undefined);
  assert.deepStrictEqual(Object.keys(text.channels), ["text"]);
  assert.deepStrictEqual(
    Object.values(text.channels).map((c) => Plot.valueof(data, c.value)),
    [data]
  );
  assert.strictEqual(text.textAnchor, undefined);
  assert.strictEqual(text.lineAnchor, "middle");
  assert.strictEqual(text.frameAnchor, "middle");
});

it("text(data, {title}) specifies an optional title channel", () => {
  const text = Plot.text(undefined, {title: "x"});
  const {title} = text.channels;
  assert.strictEqual(title.value, "x");
  assert.strictEqual(title.scale, undefined);
});

it("text(data, {fill}) allows fill to be a constant color", () => {
  const text = Plot.text(undefined, {fill: "red"});
  assert.strictEqual(text.fill, "red");
});

it("text(data, {fill}) allows fill to be null", () => {
  const text = Plot.text(undefined, {fill: null});
  assert.strictEqual(text.fill, "none");
});

it("text(data, {fill}) allows fill to be a variable color", () => {
  const text = Plot.text(undefined, {fill: "x"});
  assert.strictEqual(text.fill, undefined);
  const {fill} = text.channels;
  assert.strictEqual(fill.value, "x");
  assert.strictEqual(fill.scale, "auto");
});

it("text(data, {stroke}) has a default strokeLinejoin of round", () => {
  const text = Plot.text(undefined, {stroke: "red"});
  assert.strictEqual(text.fill, "none");
  assert.strictEqual(text.stroke, "red");
  assert.strictEqual(text.strokeLinejoin, "round");
});

it("text(data, {fontSize}) allows fontSize to be a number, length, keyword, or percentage", () => {
  assert.strictEqual(Plot.text(undefined, {fontSize: 42}).fontSize, 42);
  assert.strictEqual(Plot.text(undefined, {fontSize: "42"}).fontSize, "42");
  assert.strictEqual(Plot.text(undefined, {fontSize: "42px"}).fontSize, "42px");
  assert.strictEqual(Plot.text(undefined, {fontSize: "42pt"}).fontSize, "42pt");
  assert.strictEqual(Plot.text(undefined, {fontSize: " 42pt"}).fontSize, "42pt");
  assert.strictEqual(Plot.text(undefined, {fontSize: " 42pt "}).fontSize, "42pt");
  assert.strictEqual(Plot.text(undefined, {fontSize: " 50% "}).fontSize, "50%");
  assert.strictEqual(Plot.text(undefined, {fontSize: " Larger "}).fontSize, "larger");
  assert.strictEqual(Plot.text(undefined, {fontSize: "unset"}).fontSize, "unset");
});

it("text(data, {fontSize}) allows fontSize to be a channel", () => {
  const text = Plot.text(undefined, {fontSize: "x"});
  assert.strictEqual(text.fontSize, undefined);
  assert.strictEqual(text.channels.fontSize.value, "x");
});

it("text({length}) can take length-only data", () => {
  const data = {length: 100};
  const text = Plot.text(data);
  assert.strictEqual(text.data, data);
});

it("readCharacter reads latin letters", () => {
  assert.deepStrictEqual(getCharacters("(foo)"), [..."(foo)"]);
  assert.deepStrictEqual(getCharacters("(mañana)"), [..."(mañana)"]);
});

it("readCharacter reads surrogate pairs", () => {
  assert.deepStrictEqual(getCharacters("(😀)"), [..."(😀)"]);
  assert.deepStrictEqual(getCharacters("(💩)"), [..."(💩)"]);
  assert.deepStrictEqual(getCharacters("Iñtërnâtiônàlizætiøn☃💩"), [..."Iñtërnâtiônàlizætiøn☃💩"]);
});

it("readCharacter reads combining marks", () => {
  assert.deepStrictEqual(getCharacters("Z͑ͫ̓ͪ̂ͫ̽͏̴̙̤̞͉͚̯̞̠͍A̴̵̜̰͔ͫ͗͢L̠ͨͧͩ͘G̴̻͈͍͔̹̑͗̎̅͛́Ǫ̵̹̻̝̳͂̌̌͘"), ["Z͑ͫ̓ͪ̂ͫ̽͏̴̙̤̞͉͚̯̞̠͍", "A̴̵̜̰͔ͫ͗͢", "L̠ͨͧͩ͘", "G̴̻͈͍͔̹̑͗̎̅͛́", "Ǫ̵̹̻̝̳͂̌̌͘"]);
});

it("readCharacter reads emoji sequences", () => {
  assert.deepStrictEqual(getCharacters("(👨‍👩‍👧‍👦)"), ["(", "👨‍👩‍👧‍👦", ")"]);
  assert.deepStrictEqual(getCharacters("(👋🏻)"), ["(", "👋🏻", ")"]);
  assert.deepStrictEqual(getCharacters("(🧑🏾)"), ["(", "🧑🏾", ")"]);
  assert.deepStrictEqual(getCharacters("(👨🏻)"), ["(", "👨🏻", ")"]);
  assert.deepStrictEqual(getCharacters("(👧🏼)"), ["(", "👧🏼", ")"]);
});

it("clipEnd removes the end of the line to fit the available space", () => {
  assert.strictEqual(clipEnd("The quick brown fox", 800, defaultWidth, ""), "The quick brow");
  assert.strictEqual(clipEnd("The quick brown fox", 400, defaultWidth, ""), "The qui");
  assert.strictEqual(clipEnd("The quick brown fox", 200, defaultWidth, ""), "The");
  textWidthTest("The quick brow", "The quick brown", 800, defaultWidth);
  textWidthTest("The qui", "The quic", 400, defaultWidth);
  textWidthTest("The", "The q", 200, defaultWidth);
});

it("clipEnd reserves space for the ellipsis, if any", () => {
  assert.strictEqual(clipEnd("The quick brown fox", 800, defaultWidth, "…"), "The quick bro…");
  assert.strictEqual(clipEnd("The quick brown fox", 400, defaultWidth, "…"), "The q…");
  assert.strictEqual(clipEnd("The quick brown fox", 200, defaultWidth, "…"), "T…");
  textWidthTest("The quick bro…", "The quick brow…", 800, defaultWidth);
  textWidthTest("The q…", "The qu…", 400, defaultWidth);
  textWidthTest("T…", "Th…", 200, defaultWidth);
});

it("clipEnd returns the ellipsis, if any, if the available width is zero", () => {
  assert.strictEqual(clipEnd("The quick brown fox", 0, defaultWidth, "…"), "…");
  assert.strictEqual(clipEnd("The quick brown fox", 0, defaultWidth, ""), "");
});

it("clipEnd does not consider leading whitespace as consuming width", () => {
  assert.strictEqual(clipEnd("   The quick brown fox", 800, defaultWidth, ""), "The quick brow");
  assert.strictEqual(clipEnd("  The quick brown fox", 400, defaultWidth, ""), "The qui");
  assert.strictEqual(clipEnd(" The quick brown fox", 200, defaultWidth, ""), "The");
  assert.strictEqual(clipEnd(" The quick brown fox", 0, defaultWidth, ""), "");
});

it("clipMiddle removes the middle of the line to fit the available space", () => {
  assert.strictEqual(clipMiddle("The quick brown fox", 800, defaultWidth, ""), "The quirown fox");
  assert.strictEqual(clipMiddle("The quick brown fox", 400, defaultWidth, ""), "Thefox");
  assert.strictEqual(clipMiddle("The quick brown fox", 200, defaultWidth, ""), "Tox");
  textWidthTest("The quirown fox", "The quibrown fox", 800, defaultWidth);
  textWidthTest("Thefox", "Then fox", 400, defaultWidth);
  textWidthTest("Tox", "Tfox", 200, defaultWidth);
});

it("clipMiddle reserves space for the ellipsis, if any", () => {
  assert.strictEqual(clipMiddle("The quick brown fox", 800, defaultWidth, "…"), "The qu…own fox");
  assert.strictEqual(clipMiddle("The quick brown fox", 400, defaultWidth, "…"), "Th…fox");
  assert.strictEqual(clipMiddle("The quick brown fox", 200, defaultWidth, "…"), "…ox");
  textWidthTest("The qu…own fox", "The qu…rown fox", 800, defaultWidth);
  textWidthTest("Th…fox", "Th…n fox", 400, defaultWidth);
  textWidthTest("…ox", "T…ox", 200, defaultWidth);
});

it("clipMiddle returns the ellipsis, if any, if the available width is zero", () => {
  assert.strictEqual(clipMiddle("The quick brown fox", 0, defaultWidth, "…"), "…");
  assert.strictEqual(clipMiddle("The quick brown fox", 0, defaultWidth, ""), "");
});

it("clipStart removes the start of the line to fit the available space", () => {
  assert.strictEqual(clipStart("The quick brown fox", 800, defaultWidth, ""), "quick brown fox");
  assert.strictEqual(clipStart("The quick brown fox", 400, defaultWidth, ""), "own fox");
  assert.strictEqual(clipStart("The quick brown fox", 200, defaultWidth, ""), "fox");
  textWidthTest("quick brown fox", "e quick brown fox", 800, defaultWidth);
  textWidthTest("own fox", "rown fox", 400, defaultWidth);
  textWidthTest("fox", "n fox", 200, defaultWidth);
});

it("clipStart does not consider trailing whitespace as consuming width", () => {
  assert.strictEqual(clipStart("The quick brown fox   ", 800, defaultWidth, ""), "quick brown fox");
  assert.strictEqual(clipStart("The quick brown fox  ", 400, defaultWidth, ""), "own fox");
  assert.strictEqual(clipStart("The quick brown fox ", 200, defaultWidth, ""), "fox");
});

it("clipStart returns the ellipsis, if any, if the available width is zero", () => {
  assert.strictEqual(clipStart("The quick brown fox", 0, defaultWidth, "…"), "…");
  assert.strictEqual(clipStart("The quick brown fox", 0, defaultWidth, ""), "");
});

function textWidthTest(a, b, width, widthof) {
  assert.ok(widthof(a, 0, a.length) <= width, "text is too long");
  assert.ok(widthof(b, 0, b.length) > width, "text is too short");
}

function getCharacters(text) {
  const characters = [];
  for (let i = 0, n = text.length; i < n; ) {
    characters.push(text.slice(i, (i = readCharacter(text, i))));
  }
  return characters;
}
