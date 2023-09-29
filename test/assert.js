import assert from "assert";

function warns(run, expected = /warning/i) {
  const actual = [];
  const warn = console.warn;
  let result;
  try {
    console.warn = (warning) => void actual.push(warning);
    result = run();
    assert.strictEqual(actual.length, 1, "expected 1 warning");
    assert.match(actual[0], expected);
  } finally {
    console.warn = warn;
  }
  return result;
}

async function warnsAsync(run, expected = /warning/i) {
  const actual = [];
  const warn = console.warn;
  let result;
  try {
    console.warn = (warning) => void actual.push(warning);
    result = await run();
    assert.strictEqual(actual.length, 1, "expected 1 warning");
    assert.match(actual[0], expected);
  } finally {
    console.warn = warn;
  }
  return result;
}

function doesNotWarn(run) {
  const actual = [];
  const warn = console.warn;
  let result;
  try {
    console.warn = (warning) => void actual.push(warning);
    result = run();
    assert.strictEqual(actual.length, 0, "expected 0 warnings");
  } finally {
    console.warn = warn;
  }
  return result;
}

async function doesNotWarnAsync(run) {
  const actual = [];
  const warn = console.warn;
  let result;
  try {
    console.warn = (warning) => void actual.push(warning);
    result = await run();
    assert.strictEqual(actual.length, 0, "expected 0 warnings");
  } finally {
    console.warn = warn;
  }
  return result;
}

export default {
  ...assert,
  warns,
  warnsAsync,
  doesNotWarn,
  doesNotWarnAsync
};
