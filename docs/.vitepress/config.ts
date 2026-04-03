import {fileURLToPath, URL} from "node:url";
import path from "node:path";
import {defineConfig} from "vitepress";
import plot from "./markdown-it-plot.js";

// https://vitepress.dev/reference/site-config
// prettier-ignore
export default defineConfig({
  title: "Plot",
  description: "The JavaScript library for exploratory data visualization",
  appearance: "force-auto",
  base: "/plot/",
  cleanUrls: true,
  vite: {
    resolve: {
      alias: [
        {find: "@observablehq/plot", replacement: path.resolve("./src/index.js")},
        {find: /^.*\/VPFooter\.vue$/, replacement: fileURLToPath(new URL("./theme/CustomFooter.vue", import.meta.url))}
      ]
    },
    define: {
      __APP_VERSION__: JSON.stringify(process.env.npm_package_version)
    }
  },
  vue: {
    template: {
      compilerOptions: {
        isCustomElement: (tag) => tag.startsWith("observable-")
      }
    }
  },
  markdown: {
    config: (md) => {
      plot(md);
    }
  },
  head: [
    ["link", {rel: "preconnect", href: "https://fonts.gstatic.com", crossorigin: ""}],
    ["link", {rel: "preload", as: "style", href: "https://fonts.googleapis.com/css2?family=Inter:ital,opsz,wght@0,14..32,100..900;1,14..32,100..900&family=Spline+Sans+Mono:ital,wght@0,300..700;1,300..700&display=swap"}],
    ["link", {rel: "stylesheet", href: "https://fonts.googleapis.com/css2?family=Inter:ital,opsz,wght@0,14..32,100..900;1,14..32,100..900&family=Spline+Sans+Mono:ital,wght@0,300..700;1,300..700&display=swap"}],
    ["link", {rel: "apple-touch-icon", href: "https://static.observablehq.com/favicon-512.0667824687f99c942a02e06e2db1a060911da0bf3606671676a255b1cf97b4fe.png"}],
    ["link", {rel: "icon", type: "image/png", href: "https://static.observablehq.com/favicon-512.0667824687f99c942a02e06e2db1a060911da0bf3606671676a255b1cf97b4fe.png", sizes: "512x512"}],
    ["script", {async: "", src: "https://www.googletagmanager.com/gtag/js?id=G-9B88TP6PKQ"}],
    ["script", {}, "window.dataLayer=window.dataLayer||[];\nfunction gtag(){dataLayer.push(arguments);}\ngtag('js',new Date());\ngtag('config','G-9B88TP6PKQ');"],
    ["script", {async: "", defer: "", src: "https://static.observablehq.com/assets/components/observable-made-by.js"}],
  ],
  sitemap: {
    hostname: "https://observablehq.com/plot/"
  },
  themeConfig: {
    // https://vitepress.dev/reference/default-theme-config
    // Theme related configurations.
    logo: {
      light: "/observable-light.svg",
      dark: "/observable-dark.svg"
    },
    sidebar: [
      {
        text: "Introduction",
        items: [
          {text: "What is Plot?", link: "/what-is-plot"},
          {text: "Why Plot?", link: "/why-plot"},
          {text: "Getting started", link: "/getting-started"},
          {text: "Examples", link: "https://observablehq.com/@observablehq/plot-gallery"}
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
          {text: "Interactions", link: "/features/interactions"},
          {text: "Facets", link: "/features/facets"},
          {text: "Legends", link: "/features/legends"},
          {text: "Curves", link: "/features/curves"},
          {text: "Formats", link: "/features/formats"},
          {text: "Intervals", link: "/features/intervals"},
          {text: "Markers", link: "/features/markers"},
          {text: "Shorthand", link: "/features/shorthand"},
          {text: "Accessibility", link: "/features/accessibility"}
        ]
      },
      {
        text: "Marks",
        collapsed: true,
        items: [
          {text: "Area", link: "/marks/area"},
          {text: "Arrow", link: "/marks/arrow"},
          {text: "Auto", link: "/marks/auto"},
          {text: "Axis", link: "/marks/axis"},
          {text: "Bar", link: "/marks/bar"},
          {text: "Bollinger", link: "/marks/bollinger"},
          {text: "Box", link: "/marks/box"},
          {text: "Cell", link: "/marks/cell"},
          {text: "Contour", link: "/marks/contour"},
          {text: "Delaunay", link: "/marks/delaunay"},
          {text: "Density", link: "/marks/density"},
          {text: "Difference", link: "/marks/difference"},
          {text: "Dot", link: "/marks/dot"},
          {text: "Frame", link: "/marks/frame"},
          {text: "Geo", link: "/marks/geo"},
          {text: "Grid", link: "/marks/grid"},
          {text: "Hexgrid", link: "/marks/hexgrid"},
          {text: "Image", link: "/marks/image"},
          {text: "Line", link: "/marks/line"},
          {text: "Linear regression", link: "/marks/linear-regression"},
          {text: "Link", link: "/marks/link"},
          {text: "Raster", link: "/marks/raster"},
          {text: "Rect", link: "/marks/rect"},
          {text: "Rule", link: "/marks/rule"},
          {text: "Text", link: "/marks/text"},
          {text: "Tick", link: "/marks/tick"},
          {text: "Tip", link: "/marks/tip"},
          {text: "Tree", link: "/marks/tree"},
          {text: "Vector", link: "/marks/vector"},
          {text: "Waffle", link: "/marks/waffle"}
        ]
      },
      {
        text: "Transforms",
        collapsed: true,
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
          {text: "Shift", link: "/transforms/shift"},
          {text: "Sort", link: "/transforms/sort"},
          {text: "Stack", link: "/transforms/stack"},
          {text: "Tree", link: "/transforms/tree"},
          {text: "Window", link: "/transforms/window"}
        ]
      },
      {
        text: "Interactions",
        collapsed: true,
        items: [
          {text: "Crosshair", link: "/interactions/crosshair"},
          {text: "Pointer", link: "/interactions/pointer"}
        ]
      },
      {text: "API index", link: "/api"}
    ],
    search: {
      provider: "local"
    },
    footer: {
      message: "Library released under <a style='text-decoration:underline;' href='https://github.com/observablehq/plot/blob/main/LICENSE'>ISC License</a>.",
      copyright: `Copyright 2020–${new Date().getUTCFullYear()} Observable, Inc.`
    }
  }
});
