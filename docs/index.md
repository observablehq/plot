---
# https://vitepress.dev/reference/default-theme-home-page
layout: home
titleTemplate: "The JavaScript library for exploratory data visualization"

hero:
  name: "Observable Plot"
  text: "The JavaScript library for exploratory data visualization"
  tagline: "Create expressive charts with concise code"
  image:
    src: /plot.svg
    alt: Observable Plot
  actions:
    - theme: brand
      text: Get started
      link: /getting-started
    - theme: alt
      text: Why Plot?
      link: /why-plot
    - theme: alt
      text: Examples
      link: https://observablehq.com/@observablehq/plot-gallery

features:
  - title: Marks and channels
    details: "Plot doesn’t have chart types. Instead, it has layered geometric shapes such as bars, dots, and lines."
    link: /marks
  - title: Scales, axes, and legends
    details: "Scales map an abstract value such as time or temperature to a visual value such as position or color."
    link: /scales
  - title: Data transforms
    details: "Derive data on-the-fly while plotting, say to bin quantitative values or compute a rolling average."
    link: /transforms
  - title: Facets
    details: "Small multiples facilitate comparison by repeating a plot across partitions of data."
    link: /facets
  - title: Maps and projections
    details: "Plot supports GeoJSON and D3’s spherical projection system for geographic maps."
    link: /maps
  - title: Built with D3
    details: "Plot is built by the same team as D3. If you know some D3, you’ll be right at home with Plot."
    link: https://d3js.org
    linkText: Visit D3
  - title: Plot without code
    details: With Observable’s chart cell, quickly create plots with a GUI, then eject to code to customize.
    link: https://observablehq.com/@observablehq/chart-cell
    linkText: Try chart cell
  - title: Built by Observable
    details: Plot is developed by Observable, the platform for collaborative data analysis.
    link: https://observablehq.com
    linkText: Visit Observable
---

<style>

:root {
  --vp-home-hero-name-color: transparent;
  --vp-home-hero-name-background: -webkit-linear-gradient(120deg, hsl(200deg 100% 65%), hsl(-90deg 85% 57%));
}

</style>
