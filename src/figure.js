
// Wrap the plot in a figure with a caption and legends, if desired.
export function figure(decorations, {width}) {
  decorations = decorations.filter(d => d instanceof Node);
  if (decorations.length === 1) return decorations[0];
  const figure = document.createElement("figure");
  figure.style = `max-width: ${width}px`;
  for (const d of decorations) figure.appendChild(d);
  return figure;
}
