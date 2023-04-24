# Accessibility

Plot uses [ARIA](https://developer.mozilla.org/en-US/docs/Web/Accessibility/ARIA) to make plots more **accessible** through assistive technology such as screen readers, browser add-ons, and browser developer tools.

The [aria-label](https://developer.mozilla.org/en-US/docs/Web/Accessibility/ARIA/Attributes/aria-label) and [aria-description](https://developer.mozilla.org/en-US/docs/Web/Accessibility/ARIA/Attributes/aria-description) attributes on the root SVG element can be set via the top-level **ariaLabel** and **ariaDescription** [plot options](./plots.md). These default to null.

[Marks](./marks.md) automatically generate an aria-label attribute on the rendered SVG G element; this attribute includes the mark’s type, such as “dot”. The [axis mark](../marks/axis.md) and [grid mark](../marks/grid.md) also include the associated scale’s name, such as “y-axis tick”, “y-axis label”, or “x-grid”.

Use the **ariaLabel** mark option to apply per-instance aria-label attributes (*e.g.*, on individual dots in a scatterplot), say for a short, human-readable textual representation of each displayed data point. Use the **ariaDescription** mark option for a longer description; this is applied to the mark’s G element. These options both default to null.

Setting the **ariaHidden** mark option to true hides the mark from the accessibility tree. This is useful for decorative or redundant marks (such as rules or lines between dots).
