let warnings = 0;

export function consumeWarnings() {
  const w = warnings;
  warnings = 0;
  return w;
}

export function warn(message) {
  console.warn(message);
  ++warnings;
}
