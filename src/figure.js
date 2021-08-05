
// Wrap the plot in a figure with a caption, if desired.
export function figureWrap(svg, {width}, caption, legends) {
  if (caption == null && legends.length === 0) return svg;
  const figure = document.createElement("figure");
  figure.style = `max-width: ${width}px`;
  if (legends.length > 0) {
    const figlegends = document.createElement("div");
    figlegends.className = "legends";
    figure.appendChild(figlegends);
    for (const l of legends) {
      if (l instanceof Node) {
        figlegends.appendChild(l);
      }
    }
  }
  figure.appendChild(svg);
  if (caption != null) {
    const figcaption = document.createElement("figcaption");
    figcaption.appendChild(caption instanceof Node ? caption : document.createTextNode(caption));
    figure.appendChild(figcaption);
  }
  return figure;
}
