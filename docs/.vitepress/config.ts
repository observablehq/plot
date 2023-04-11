import container from "markdown-it-container";
import path from "path";
import {defineConfig} from "vitepress";

// https://vitepress.dev/reference/site-config
export default defineConfig({
  title: "Observable Plot",
  description: "The JavaScript library for exploratory data visualization",
  vite: {
    resolve: {
      alias: {
        "@observablehq/plot": path.resolve("./src/index.js")
      }
    }
  },
  markdown: {
    config: (md) => {
      md.use(container, "plot", {
        render(tokens, idx) {
          if (tokens[idx].nesting === 1) {
            const token = tokens[idx + 1];
            if (token.type !== "fence" || token.tag !== "code") throw new Error("missing fenced code block");
            // TODO use acorn to parse and recut
            let content = token.content;
            content = content.replace(/\bMath\.random\b/g, "d3.randomLcg(42)");
            content = content.replace(/\bd3\.(random(?!Lcg)\w+)\b/g, "d3.\$1.source(d3.randomLcg(42))");
            if (/^Plot\.plot\(/.test(content)) {
              const options = content.slice(9);
              return `<PlotRender
                :options='${md.utils.escapeHtml(options)}'
              />\n<div class="blocks">\n`;
            } else {
              const re = /\.plot\((.*)\)/;
              const match = re.exec(content);
              if (!match) throw new Error("mark.plot not found");
              const mark = content.replace(re, "");
              const options = `(${match[1] || "{}"})`;
              return `<PlotRender
                :mark='${md.utils.escapeHtml(mark)}'
                :options='${md.utils.escapeHtml(options)}'
              />\n<div class="blocks">\n`;
            }
          } else {
            return `</div>\n`;
          }
        }
      });
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
      {text: "Examples", link: "https://observablehq.com/@observablehq/plot-gallery"},
      {
        text: "Help",
        items: [
          {text: "Forum", link: "https://talk.observablehq.com/c/help/6"},
          {text: "Slack", link: "https://observable-community.slack.com/ssb/redirect"},
          {text: "Issues", link: "https://github.com/observablehq/plot/issues"}
        ]
      },
      {
        text: "News",
        items: [
          {text: "Releases", link: "https://github.com/observablehq/plot/releases"},
          {text: "Newsletter", link: "https://observablehq.com/@observablehq/plot-twist-newsletter-signup"},
          {text: "Blog", link: "https://observablehq.com/blog"},
          {text: "Twitter", link: "https://twitter.com/observablehq"}
        ]
      },
      {text: "D3", link: "https://d3js.org"}
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
          {text: "Maps and projections", link: "/maps"},
          {text: "Shorthand", link: "/shorthand"}
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
          {text: "Group", link: "/transforms/group"},
          {text: "Hexbin", link: "/transforms/hexbin"},
          {text: "Interval", link: "/transforms/interval"},
          {text: "Map", link: "/transforms/map"},
          {text: "Select", link: "/transforms/select"},
          {text: "Stack", link: "/transforms/stack"},
          {text: "Window", link: "/transforms/window"}
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
      copyright: `Copyright 2020–${new Date().getUTCFullYear()} Observable, Inc.`
    }
  }
});
