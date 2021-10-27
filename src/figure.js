
// Wrap the plot in a figure with a caption, if desired.
export function figureWrap(svg, {width}, caption) {
  if (caption == null) return svg;
  const figure = document.createElement("figure");
  figure.style = `max-width: ${width}px`;
  figure.appendChild(svg);
  const figcaption = document.createElement("figcaption");
  figcaption.appendChild(caption instanceof Node ? caption : document.createTextNode(caption));
  figure.appendChild(figcaption);
  return figure;
}
