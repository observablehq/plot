import * as Plot from "@observablehq/plot";

async function kitten({
  x = (d, i) => i % 5,
  y = (d, i) => Math.floor(i / 5),
  src = (d, i) => `https://placekitten.com/${100 + 2 * i}/${100 + 2 * i}`,
  ...options
}: Plot.ImageOptions = {}) {
  return Plot.plot({
    inset: 60,
    width: 520,
    height: 520,
    axis: null,
    r: {range: [10, 60]},
    marks: [Plot.image({length: 25}, {x, y, src, ...options})]
  });
}

export async function kittenClipNull() {
  return kitten({r: 49, clip: null}); // TODO remove this test? clip has no effect
}

export async function kittenConstant() {
  return kitten({r: 49}); // TODO test combining width, height, and r
}

export async function kittenVariable() {
  return kitten({r: (d, i) => i});
}

export async function kittenVariableDodge() {
  return kitten(Plot.dodgeY({r: (d, i) => i}));
}
