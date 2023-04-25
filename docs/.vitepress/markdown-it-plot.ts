import container from "markdown-it-container";

export default function plot(md) {
  md.use(container, "plot", {
    render(tokens, idx) {
      if (tokens[idx].nesting === 1) {
        const directives = tokens[idx].info.split(/\s+/).slice(1);
        const token = tokens[idx + 1];
        if (token.type !== "fence" || token.tag !== "code") throw new Error("missing fenced code block");
        // TODO use acorn to parse and recut
        let content = token.content;
        if (token.info === "js-vue") content = content.replace(/"{{([^}]*)}}"/g, "$1");
        content = content.replace(/\bMath\.random\b/g, "d3.randomLcg(42)");
        content = content.replace(/\bd3\.(random(?!Lcg)\w+)\b/g, "d3.$1.source(d3.randomLcg(42))");
        content = content.replace(/\bd3\.shuffle\b/g, "d3.shuffler(d3.randomLcg(42))");
        content = content.replace(/"red"/g, '"var(--vp-c-red)"');
        content = content.replace(/"green"/g, '"var(--vp-c-green)"');
        content = content.replace(/"blue"/g, '"var(--vp-c-blue)"');
        content = content.replace(/"purple"/g, '"var(--vp-c-purple)"');
        const href = directives.find((d) => d.startsWith("https://"));
        const suffix = `\n${directives.includes("hidden")
          ? `<div style="display: none;">\n`
          : `<a class="plot-fork" href="${md.utils.escapeHtml(href)}?intent=fork" target="_blank" title="Open on Observable">Fork</a>`}`;
        if (/^Plot\.plot\(/.test(content)) {
          const options = content.slice(9);
          return `<PlotRender
            ${directives.includes("defer") ? "defer" : ""}
            :options='${md.utils.escapeHtml(options)}'
          />${suffix}`;
        } else {
          const re = /\.plot\((.*)\)/s;
          const match = re.exec(content);
          if (!match) throw new Error("mark.plot not found");
          const mark = content.replace(re, "");
          const options = `(${match[1] || "{}"})`;
          return `<PlotRender
            ${directives.includes("defer") ? "defer" : ""}
            :mark='${md.utils.escapeHtml(mark)}'
            :options='${md.utils.escapeHtml(options)}'
          />${suffix}`;
        }
      } else {
        const directives = tokens[idx - 2].info.split(/\s+/).slice(1);
        return `${directives.includes("hidden") ? `</div>` : ""}\n`;
      }
    }
  });
}
