import assert from "assert";
import {maybeClassName} from "../src/style.js";

it("maybeClassName allows typical class names", () => {
  assert.strictEqual(maybeClassName("foo"), "foo");
  assert.strictEqual(maybeClassName("foo2"), "foo2");
  assert.strictEqual(maybeClassName("foo-bar"), "foo-bar");
  assert.strictEqual(maybeClassName("-bar"), "-bar");
});

it("maybeClassName allows escaped class names", () => {
  assert.strictEqual(maybeClassName("\\1234"), "\\1234");
  assert.strictEqual(maybeClassName("\\64"), "\\64");
  assert.strictEqual(maybeClassName("\\ "), "\\ ");
});

it("maybeClassName allows mixed-case class names", () => {
  assert.strictEqual(maybeClassName("FOO"), "FOO");
  assert.strictEqual(maybeClassName("fooBar"), "fooBar");
});

it("maybeClassName disallows invalid class names", () => {
  assert.throws(() => maybeClassName(" "), /invalid class name/);
  assert.throws(() => maybeClassName("42"), /invalid class name/);
  assert.throws(() => maybeClassName("foo "), /invalid class name/);
  assert.throws(() => maybeClassName(" foo"), /invalid class name/);
  assert.throws(() => maybeClassName(".foo"), /invalid class name/);
  assert.throws(() => maybeClassName("[foo]"), /invalid class name/);
  assert.throws(() => maybeClassName("💩"), /invalid class name/);
  assert.throws(() => maybeClassName("--hi"), /invalid class name/);
  assert.throws(() => maybeClassName("\\"), /invalid class name/);
});

it("maybeClassName coerces to strings", () => {
  assert.strictEqual(maybeClassName(["foo"]), "foo");
  assert.strictEqual(maybeClassName({toString: () => "foo-bar"}), "foo-bar");
});

it("maybeClassName generates distinct random class names", () => {
  const names = new Set();
  for (let i = 0; i < 100; ++i) {
    const name = maybeClassName();
    assert.match(name, /^plot-[0-9a-f]{6,}$/);
    assert.strictEqual(names.has(name), false);
    names.add(name);
  }
});
