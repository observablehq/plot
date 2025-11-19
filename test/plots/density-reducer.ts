import * as Plot from "@observablehq/plot";
import * as d3 from "d3";

const pdf_normal = (x, mu = 0, sigma = 1) =>
  Math.exp(-0.5 * Math.pow((x - mu) / sigma, 2)) / (sigma * Math.sqrt(2 * Math.PI));

const densities = d3
  .range(-6, 10, 0.1)
  .map((x) => [0, 3].map((mu) => [1, 2].map((sigma) => ({x, mu, sigma, rho: pdf_normal(x, mu, sigma)}))))
  .flat(3);

const n_pts = 100000;

const mus = Array.from({length: n_pts}, d3.randomBernoulli.source(d3.randomLcg(42))(0.2)).map((x) => 3 * x);
const sigmas = Array.from({length: n_pts}, d3.randomBernoulli.source(d3.randomLcg(43))(0.3)).map((x) => 1 + x);
const standardNormals = Array.from({length: n_pts}, d3.randomNormal.source(d3.randomLcg(44))(0, 1)).map(
  (x, i) => x * sigmas[i] + mus[i]
);

const pts = standardNormals.map((value, i) => ({mu: mus[i], sigma: sigmas[i], value}));

export async function densityReducer() {
  return Plot.plot({
    marks: [
      Plot.areaY(
        pts,
        Plot.binX(
          {y2: "density"},
          {
            x: "value",
            fill: (x) => `μ = ${x.mu}`,
            opacity: 0.5,
            fy: (x) => `σ = ${x.sigma}`,
            interval: 0.2,
            curve: "step"
          }
        )
      ),
      Plot.line(densities, {x: "x", y: "rho", stroke: (x) => `μ = ${x.mu}`, fy: (x) => `σ = ${x.sigma}`}),
      Plot.ruleY([0])
    ],
    fy: {label: null},
    color: {legend: true, type: "categorical"},
    grid: true
  });
}
