import * as Plot from "@observablehq/plot";

async function kitten({r, clip = undefined, dodge = false}) {
  let options = {
    x: (_: any, i: number) => i % 5,
    y: (_: any, i: number) => Math.floor(i / 5),
    src: (_: any, i: number) => `https://placekitten.com/${100 + 2 * i}/${100 + 2 * i}`,
    r,
    clip
  };
  if (dodge) options = Plot.dodgeY({...options, anchor: "middle"});

  return Plot.plot({
    inset: 60,
    width: 520,
    height: 520,
    axis: null,
    r: {range: [10, 60]},
    marks: [Plot.image({length: 25}, options)]
  });
}

export async function kittenClipNull() {
  return kitten({r: 49, clip: null});
}

export async function kittenConstant() {
  return kitten({r: 49});
}

export async function kittenVariable() {
  return kitten({r: (_: any, i: number) => i});
}

export async function kittenVariableDodge() {
  return kitten({r: (_: any, i: number) => i, dodge: true});
}
