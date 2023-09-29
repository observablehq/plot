let warnings = 0;
let lastMessage;

export function consumeWarnings() {
  const w = warnings;
  warnings = 0;
  lastMessage = undefined;
  return w;
}

export function warn(message) {
  if (message === lastMessage) return;
  lastMessage = message;
  console.warn(message);
  ++warnings;
}
