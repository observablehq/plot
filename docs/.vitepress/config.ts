import path from "path";
import {defineConfig} from "vitepress";
import plot from "./markdown-it-plot.js";

// https://vitepress.dev/reference/site-config
export default defineConfig({
  title: "Observable Plot",
  description: "The JavaScript library for exploratory data visualization",
  base: "/plot/",
  vite: {
    resolve: {
      alias: {
        "@observablehq/plot": path.resolve("./src/index.js")
      }
    }
  },
  markdown: {
    config: (md) => {
      plot(md);
    }
  },
  head: [
    ["link", {rel: "apple-touch-icon", href: "https://static.observablehq.com/favicon-512.0667824687f99c942a02e06e2db1a060911da0bf3606671676a255b1cf97b4fe.png"}],
    ["link", {rel: "icon", type: "image/png", href: "https://static.observablehq.com/favicon-512.0667824687f99c942a02e06e2db1a060911da0bf3606671676a255b1cf97b4fe.png", sizes: "512x512"}],
    ["script", {async: "", src: "https://www.googletagmanager.com/gtag/js?id=G-9B88TP6PKQ"}],
    ["script", {}, "window.dataLayer=window.dataLayer||[];\nfunction gtag(){dataLayer.push(arguments);}\ngtag('js',new Date());\ngtag('config','G-9B88TP6PKQ');"]
  ],
  themeConfig: {
    // https://vitepress.dev/reference/default-theme-config
    // Theme related configurations.
    logo: {
      light: "/observable.svg",
      dark: "/observable-light.svg"
    },
    nav: [
      {text: "Home", link: "/"},
      {text: "Examples", link: "https://observablehq.com/@observablehq/plot-gallery"},
      {text: "Community", link: "/community"},
      {text: "D3", link: "https://d3js.org"}
    ],
    sidebar: [
      {
        text: "Introduction",
        items: [
          {text: "What is Plot?", link: "/what-is-plot"},
          {text: "Why Plot?", link: "/why-plot"},
          {text: "Getting started", link: "/getting-started"}
        ]
      },
      {
        text: "Features",
        collapsed: false,
        items: [
          {text: "Plots", link: "/features/plots"},
          {text: "Marks", link: "/features/marks"},
          {text: "Scales", link: "/features/scales"},
          {text: "Projections", link: "/features/projections"},
          {text: "Transforms", link: "/features/transforms"},
          {text: "Facets", link: "/features/facets"},
          {text: "Legends", link: "/features/legends"},
          {text: "Curves", link: "/features/curves"},
          {text: "Formats", link: "/features/formats"},
          {text: "Markers", link: "/features/markers"},
          {text: "Shorthand", link: "/features/shorthand"},
          {text: "Spatial interpolators", link: "/features/spatial-interpolators"},
          {text: "Accessibility", link: "/features/accessibility"},
        ]
      },
      {
        text: "Marks",
        collapsed: false,
        items: [
          {text: "Area", link: "/marks/area"},
          {text: "Arrow", link: "/marks/arrow"},
          {text: "Auto", link: "/marks/auto"},
          {text: "Axis", link: "/marks/axis"},
          {text: "Bar", link: "/marks/bar"},
          {text: "Box", link: "/marks/box"},
          {text: "Cell", link: "/marks/cell"},
          {text: "Contour", link: "/marks/contour"},
          {text: "Delaunay", link: "/marks/delaunay"},
          {text: "Density", link: "/marks/density"},
          {text: "Dot", link: "/marks/dot"},
          {text: "Frame", link: "/marks/frame"},
          {text: "Geo", link: "/marks/geo"},
          {text: "Grid", link: "/marks/grid"},
          {text: "Hexgrid", link: "/marks/hexgrid"},
          {text: "Image", link: "/marks/image"},
          {text: "Line", link: "/marks/line"},
          {text: "Linear Regression", link: "/marks/linear-regression"},
          {text: "Link", link: "/marks/link"},
          {text: "Raster", link: "/marks/raster"},
          {text: "Rect", link: "/marks/rect"},
          {text: "Rule", link: "/marks/rule"},
          {text: "Text", link: "/marks/text"},
          {text: "Tick", link: "/marks/tick"},
          {text: "Tree", link: "/marks/tree"},
          {text: "Vector", link: "/marks/vector"}
        ]
      },
      {
        text: "Transforms",
        collapsed: false,
        items: [
          {text: "Bin", link: "/transforms/bin"},
          {text: "Centroid", link: "/transforms/centroid"},
          {text: "Dodge", link: "/transforms/dodge"},
          {text: "Filter", link: "/transforms/filter"},
          {text: "Group", link: "/transforms/group"},
          {text: "Hexbin", link: "/transforms/hexbin"},
          {text: "Interval", link: "/transforms/interval"},
          {text: "Map", link: "/transforms/map"},
          {text: "Normalize", link: "/transforms/normalize"},
          {text: "Select", link: "/transforms/select"},
          {text: "Sort", link: "/transforms/sort"},
          {text: "Stack", link: "/transforms/stack"},
          {text: "Tree", link: "/transforms/tree"},
          {text: "Window", link: "/transforms/window"}
        ]
      }
    ],
    search: {
      provider: "local"
    },
    socialLinks: [
      {icon: "github", link: "https://github.com/observablehq/plot"},
      {icon: "twitter", link: "https://twitter.com/observablehq"},
      {icon: "mastodon", link: "https://vis.social/@observablehq"},
      {icon: "slack", link: "https://observable-community.slack.com/ssb/redirect"},
      {icon: "linkedin", link: "https://www.linkedin.com/company/observable"}
    ],
    footer: {
      message:
        "Library released under <a style='text-decoration:underline;' href='https://github.com/observablehq/plot/blob/main/LICENSE'>ISC License</a>.",
      copyright: `Copyright 2020–${new Date().getUTCFullYear()} Observable, Inc.`
    }
  }
});
