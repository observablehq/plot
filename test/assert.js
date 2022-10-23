import assert from "assert";

function warns(run, expected) {
  const actual = [];
  const warn = console.warn;
  try {
    console.warn = (warning) => void actual.push(warning);
    run();
    assert.strictEqual(actual.length, 1);
    assert.match(actual[0], expected);
  } finally {
    console.warn = warn;
  }
}

function doesNotWarn(run) {
  const actual = [];
  const warn = console.warn;
  try {
    console.warn = (warning) => void actual.push(warning);
    run();
    assert.strictEqual(actual.length, 0);
  } finally {
    console.warn = warn;
  }
}

export default {...assert, warns, doesNotWarn};
