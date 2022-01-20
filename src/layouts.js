import {forceSimulation, forceX, forceY, forceCollide, rgb} from "d3";

export function maybeLayout(layout) {
  if (typeof layout === "function") return layout;
  switch("" + layout) {
    case "darker":
      return layoutDarker;
    case "collide":
      return layoutCollide;
    default:
      throw new Error(`unknow layout ${layout}`);
  }
}

function layoutDarker(values) {
  for (let i = 0; i < values.fill.length; i++) values.fill[i] = rgb(values.fill[i]).darker();
  return () => {};
}

function layoutCollide({x: X, y: Y, r: R}) {
  console.warn("collide", X, Y, R);
  return (index) => {
    const nodes = Array.from(index, i => ({i, x: X[i], y: Y[i], r: R ? R[i] : 8}));
    const simulation = forceSimulation()
      .force("x", forceX(({x}) => x))
      .force("y", forceY(({y}) => y))
      .force("collide", forceCollide(({r}) => 1 + r));
    simulation.nodes(nodes).tick(30);
    for (const node of nodes) X[node.i] = node.x, Y[node.i] = node.y;
  };
}