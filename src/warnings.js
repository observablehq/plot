let warnings = [];

export function consumeWarnings() {
  const w = warnings;
  warnings = [];
  return w;
}

export function warn(message) {
  console.warn(message);
  warnings.push(message);
}
