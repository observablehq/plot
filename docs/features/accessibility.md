# Accessibility

Plot supports several [ARIA properties](https://developer.mozilla.org/en-US/docs/Web/Accessibility/ARIA) to help build the accessibility tree. The accessibility tree is consumed by various assistive technology such as screen readers and browser add-ons to make web contents and web applications more accessible to people with disabilities. It can be inspected in the browser’s inspector.

The aria-label and aria-description properties can be set on the SVG root element by specifying the top-level options **ariaLabel** and **ariaDescription**, which default to null.

Positional axes are branded with an aria-label and an aria-description properties, which can likewise be specified as axis options. Set the aria-label with the **ariaLabel** axis option, which defaults to “x-axis” and “y-axis” for the corresponding axes (and “fx-axis” and “fy-axis” for facet axes). Set the aria-description with the **ariaDescription** axis option, which defaults to null.

Marks are branded with an aria-label property with the mark’s name (*e.g.*, “dot”). You can also set an optional aria-description property by specifying the mark option **ariaDescription**. A short label can be specified for each of the individual elements—*e.g.*, individual dots in a dot mark—with the mark option **ariaLabel**. A mark can be hidden from the accessibility tree by specifying the mark option **ariaHidden** to true; this allows to hide decorative elements (such as rules) and repetitive marks (such as lines that support dots, or text marks that are also represented by symbols).
