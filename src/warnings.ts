let warnings = 0;

export function consumeWarnings() {
  const w = warnings;
  warnings = 0;
  return w;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function warn(message: string) {
  console.warn(message);
  ++warnings;
}
