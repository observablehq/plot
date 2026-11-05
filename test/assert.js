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

function allCloseTo(actual, expected, delta = 1e-6) {
  delta = Number(delta);
  actual = [...actual].map(Number);
  expected = [...expected].map(Number);
  assert(
    actual.length === expected.length && actual.every((a, i) => Math.abs(expected[i] - a) <= delta),
    `expected ${formatNumbers(actual)} to be close to ${formatNumbers(expected)} ±${delta}`
  );
}

function formatNumbers(numbers) {
  return `[${numbers.map((n) => n.toFixed(6)).join(", ")}]`;
}

export default {
  ...assert,
  warns,
  warnsAsync,
  doesNotWarn,
  doesNotWarnAsync,
  allCloseTo
};
