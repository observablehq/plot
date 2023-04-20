import DefaultTheme from "vitepress/theme-without-fonts";
import PlotRender from "../../components/PlotRender.js";
import "./custom.css";

export default {
  extends: DefaultTheme,
  enhanceApp(ctx) {
    ctx.app.component("PlotRender", PlotRender);
  }
};
