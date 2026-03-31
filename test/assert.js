import {assert} from "vitest";

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

function inDelta(actual, expected, delta = 1e-6) {
  if (Array.isArray(expected)) {
    assert.strictEqual(actual.length, expected.length);
    for (let i = 0; i < expected.length; i++) {
      inDelta(actual[i], expected[i], delta);
    }
  } else {
    assert.ok(Math.abs(actual - expected) < delta, `${actual} is not within ${delta} of ${expected}`);
  }
}

export default {
  ...assert,
  warns,
  warnsAsync,
  doesNotWarn,
  doesNotWarnAsync,
  inDelta
};
