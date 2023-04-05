import path from "path";
import {defineConfig} from "vitepress";

// https://vitepress.dev/reference/site-config
export default defineConfig({
  title: "Observable Plot",
  description: "A concise API for exploratory data visualization",
  vite: {
    resolve: {
      alias: {
        "@observablehq/plot": path.resolve("./src/index.js")
      }
    }
  },
  themeConfig: {
    // https://vitepress.dev/reference/default-theme-config
    // Theme related configurations.
    logo: {
      light: "/observable.svg",
      dark: "/observable-light.svg"
    },
    nav: [
      {text: "Home", link: "/"},
      {text: "Examples", link: "/examples"}
    ],
    sidebar: [
      {
        text: "Introduction",
        items: [
          {text: "Getting started", link: "/getting-started"},
          {text: "Why Plot?", link: "/why-plot"},
          {text: "Marks and channels", link: "/marks"},
          {text: "Scales, axes, and legends", link: "/scales"},
          {text: "Transforms", link: "/transforms"},
          {text: "Facets", link: "/facets"},
          {text: "Maps and projections", link: "/maps"}
        ]
      },
      {
        text: "Marks",
        collapsed: false,
        items: [
          {text: "Area", link: "/area"},
          {text: "Arrow", link: "/arrow"},
          {text: "Auto", link: "/auto"},
          {text: "Bar", link: "/bar"},
          {text: "Box", link: "/box"},
          {text: "Cell", link: "/cell"},
          {text: "Contour", link: "/contour"},
          {text: "Delaunay", link: "/delaunay"},
          {text: "Density", link: "/density"},
          {text: "Dot", link: "/dot"},
          {text: "Frame", link: "/frame"},
          {text: "Geo", link: "/geo"},
          {text: "Image", link: "/image"},
          {text: "Line", link: "/line"},
          {text: "Linear Regression", link: "/linear-regression"},
          {text: "Link", link: "/link"},
          {text: "Raster", link: "/raster"},
          {text: "Rect", link: "/rect"},
          {text: "Rule", link: "/rule"},
          {text: "Text", link: "/text"},
          {text: "Tick", link: "/tick"},
          {text: "Tree", link: "/tree"},
          {text: "Vector", link: "/vector"},
        ]
      },
      {
        text: "Transforms",
        collapsed: false,
        items: [
          {text: "Bin", link: "/bin"},
          {text: "Centroid", link: "/centroid"},
          {text: "Dodge", link: "/dodge"},
          {text: "Group", link: "/group"},
          {text: "Hexbin", link: "/hexbin"},
          {text: "Interval", link: "/interval"},
          {text: "Map", link: "/map"},
          {text: "Select", link: "/select"},
          {text: "Stack", link: "/stack"},
          {text: "Window", link: "/window"}
        ]
      }
    ],
    socialLinks: [
      {icon: "github", link: "https://github.com/observablehq/plot"},
      {icon: "twitter", link: "https://twitter.com/observablehq"},
      {icon: "slack", link: "https://observable-community.slack.com/ssb/redirect"}
    ],
    footer: {
      message:
        "Library released under <a style='text-decoration:underline;' href='https://github.com/observablehq/plot/blob/main/LICENSE'>ISC License</a>.",
      copyright: `Copyright 2020–${(new Date).getUTCFullYear()} Observable, Inc.`
    }
  }
});
