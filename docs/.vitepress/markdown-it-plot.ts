import container from "markdown-it-container";

export default function plot(md) {
  md.use(container, "plot", {
    render(tokens, idx) {
      if (tokens[idx].nesting === 1) {
        const directive = tokens[idx].info.split(/\s+/)[1];
        if (directive && directive !== "defer" && directive !== "hidden") throw new Error(`unknown plot directive: ${directive}`);
        const token = tokens[idx + 1];
        if (token.type !== "fence" || token.tag !== "code") throw new Error("missing fenced code block");
        // TODO use acorn to parse and recut
        let content = token.content;
        content = content.replace(/\bMath\.random\b/g, "d3.randomLcg(42)");
        content = content.replace(/\bd3\.(random(?!Lcg)\w+)\b/g, "d3.$1.source(d3.randomLcg(42))");
        content = content.replace(/\bd3\.shuffle\b/g, "d3.shuffler(d3.randomLcg(42))");
        const suffix = `\n<div class="blocks"${directive === "hidden" ? ` style="display: none;"` : ""}>\n`;
        if (/^Plot\.plot\(/.test(content)) {
          const options = content.slice(9);
          return `<PlotRender
            ${directive ? ` mode='${directive}'` : ""}
            :options='${md.utils.escapeHtml(options)}'
          />${suffix}`;
        } else {
          const re = /\.plot\((.*)\)/;
          const match = re.exec(content);
          if (!match) throw new Error("mark.plot not found");
          const mark = content.replace(re, "");
          const options = `(${match[1] || "{}"})`;
          return `<PlotRender
            ${directive ? ` mode='${directive}'` : ""}
            :mark='${md.utils.escapeHtml(mark)}'
            :options='${md.utils.escapeHtml(options)}'
          />${suffix}`;
        }
      } else {
        return `</div>\n`;
      }
    }
  });
}
