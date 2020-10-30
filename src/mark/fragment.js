export function Fragment(...marks) {
  return (...args) => {
    const fragment = document.createDocumentFragment();
    for (const m of marks) fragment.appendChild(m(...args));
    return fragment;
  };
}
