export function maybeFacetAnchor(facetAnchor) {
  if (facetAnchor == null) return null;
  switch (`${facetAnchor}`.toLowerCase()) {
    case "top":
      return facetAnchorTop;
    case "right":
      return facetAnchorRight;
    case "bottom":
      return facetAnchorBottom;
    case "left":
      return facetAnchorLeft;
    case "top-empty":
      return facetAnchorTopEmpty;
    case "right-empty":
      return facetAnchorRightEmpty;
    case "bottom-empty":
      return facetAnchorBottomEmpty;
    case "left-empty":
      return facetAnchorLeftEmpty;
  }
  throw new Error(`invalid facet anchor: ${facetAnchor}`);
}

function facetAnchorTop(facets, {y: Y}, {y}) {
  return Y?.indexOf(y) !== 0;
}

function facetAnchorBottom(facets, {y: Y}, {y}) {
  return Y?.indexOf(y) !== Y?.length - 1;
}

function facetAnchorLeft(facets, {x: X}, {x}) {
  return X?.indexOf(x) !== 0;
}

function facetAnchorRight(facets, {x: X}, {x}) {
  return X?.indexOf(x) !== X?.length - 1;
}

function facetAnchorTopEmpty(facets, {y: Y}, {x, y}) {
  const i = Y?.indexOf(y);
  if (i > 0) {
    const y = Y[i - 1];
    return !facets.find((f) => f.x === x && f.y === y)?.empty;
  }
}

function facetAnchorBottomEmpty(facets, {y: Y}, {x, y}) {
  const i = Y?.indexOf(y);
  if (i < Y?.length - 1) {
    const y = Y[i + 1];
    return !facets.find((f) => f.x === x && f.y === y)?.empty;
  }
}

function facetAnchorLeftEmpty(facets, {x: X}, {x, y}) {
  const i = X?.indexOf(x);
  if (i > 0) {
    const x = X[i - 1];
    return !facets.find((f) => f.x === x && f.y === y)?.empty;
  }
}

function facetAnchorRightEmpty(facets, {x: X}, {x, y}) {
  const i = X?.indexOf(x);
  if (i < X?.length - 1) {
    const x = X[i + 1];
    return !facets.find((f) => f.x === x && f.y === y)?.empty;
  }
}
