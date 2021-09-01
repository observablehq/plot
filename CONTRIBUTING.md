# Observable Plot - Contributing

Observable Plot is released under the ISC license. You are welcome to fork this repository and to send us pull requests to contribute bug fixes or new features.

To develop Observable Plot locally, clone this repository and install its dependencies:

```
git clone git@github.com:observablehq/plot.git
cd plot
yarn
```

Plot is written in ES modules and uses [Snowpack](https://snowpack.dev/) for development; this means that you can edit the Plot source code and examples, and they’ll update live as you save changes. To start Snowpack:

```
yarn dev
```

This should open http://localhost:8008/ where you can browse the tests.

## Testing

Plot has both unit tests and snapshot tests.

**Unit tests** live in `test` and have the `-test.js` extension. These tests are written using [Mocha](https://mochajs.org). Generally speaking, unit tests make specific assertions about the behavior of Plot’s internals and helper methods.

**Snapshot tests** live in `test/plots`; these also serve as examples of how to use the Plot API. Each snapshot test defines a plot by exporting a default async function. For example, here’s a line chart using BLS unemployment data:

```js
import * as Plot from "@observablehq/plot";
import * as d3 from "d3";

export default async function() {
  const data = await d3.csv("data/bls-metro-unemployment.csv", d3.autoType);
  return Plot.plot({
    marks: [
      Plot.line(data, {x: "date", y: "unemployment", z: "division"}),
      Plot.ruleY([0])
    ]
  });
}
```

When a snapshot test is run, its output is compared against the SVG snapshot saved in the `test/output` folder. This makes it easier to see the effect of code changes and to catch unintended changes.

To add a new snapshot test, create a new JavaScript file in the `test/plots` folder. Then register your test in the test registry, `test/plots/index.js`. Once you’ve registered your test, it will also appear automatically in the test browser (http://localhost:8008), where you can inspect and debug the output. (Snapshot tests must have deterministic, reproducible behavior; they should not depend on live data, external servers, the current time, the weather, etc. To use randomness in a test, use a seeded random number generator such as [d3.randomLcg](https://github.com/d3/d3-random/blob/master/README.md#randomLcg).)

To run the tests:

```
yarn test
```

This will automatically generate any missing snapshots in `test/output`, which you should remember to `git add` before committing your changes. (If you forget, your PR will fail in CI, and you’ll get a reminder.) Changed snapshots are saved alongside the originals with a -changed suffix, for visual inspection. These should never be commited.

If your code intentionally changes some of the existing snapshots, simply blow away the existing snapshots and run the tests again. You can then review what’s changed using `git diff`.

```
rm -rf test/output
yarn test
```
