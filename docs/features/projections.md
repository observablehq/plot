# Projection options

The top-level **projection** option applies a two-dimensional (often geographic) projection in place of *x* and *y* scales. It is typically used in conjunction with a [geo mark](#geo) to produce a map, but can be used with any mark that supports *x* and *y* channels, such as [dot](#dot), [text](#text), [arrow](#arrow), and [rect](#rect). For marks that use *x1*, *y1*, *x2*, and *y2* channels, the two projected points are ⟨*x1*, *y1*⟩ and ⟨*x2*, *y2*⟩; otherwise, the projected point is ⟨*x*, *y*⟩. The following built-in named projections are supported:

* *equirectangular* - the equirectangular, or *plate carrée*, projection
* *orthographic* - the orthographic projection
* *stereographic* - the stereographic projection
* *mercator* - the Mercator projection
* *equal-earth* - the [Equal Earth projection](https://en.wikipedia.org/wiki/Equal_Earth_projection) by Šavrič *et al.*
* *azimuthal-equal-area* - the azimuthal equal-area projection
* *azimuthal-equidistant* - the azimuthal equidistant projection
* *conic-conformal* - the conic conformal projection
* *conic-equal-area* - the conic equal-area projection
* *conic-equidistant* - the conic equidistant projection
* *gnomonic* - the gnomonic projection
* *transverse-mercator* - the transverse Mercator projection
* *albers* - the Albers’ conic equal-area projection
* *albers-usa* - a composite Albers conic equal-area projection suitable for the United States
* *identity* - the identity projection for planar geometry
* *reflect-y* - like the identity projection, but *y* points up
* null (default) - the null projection for pre-projected geometry in screen coordinates

In addition to these named projections, the **projection** option may be specified as a [D3 projection](https://github.com/d3/d3-geo/blob/main/README.md#projections), or any custom projection that implements [*projection*.stream](https://github.com/d3/d3-geo/blob/main/README.md#projection_stream), or a function that receives a configuration object ({width, height, ...options}) and returns such a projection. In the last case, the width and height represent the frame dimensions minus any insets.

If the **projection** option is specified as an object, the following additional projection options are supported:

* projection.**type** - one of the projection names above
* projection.**parallels** - the [standard parallels](https://github.com/d3/d3-geo/blob/main/README.md#conic_parallels) (for conic projections only)
* projection.**precision** - the [sampling threshold](https://github.com/d3/d3-geo/blob/main/README.md#projection_precision)
* projection.**rotate** - a two- or three- element array of Euler angles to rotate the sphere
* projection.**domain** - a GeoJSON object to fit in the center of the (inset) frame
* projection.**inset** - inset by the given amount in pixels when fitting to the frame (default zero)
* projection.**insetLeft** - inset from the left edge of the frame (defaults to inset)
* projection.**insetRight** - inset from the right edge of the frame (defaults to inset)
* projection.**insetTop** - inset from the top edge of the frame (defaults to inset)
* projection.**insetBottom** - inset from the bottom edge of the frame (defaults to inset)
* projection.**clip** - the projection clipping method

The following projection clipping methods are supported for projection.**clip**:

* *frame* or true (default) - clip to the extent of the frame (including margins but not insets)
* a number - clip to a great circle of the given radius in degrees centered around the origin
* null or false - do not clip

Whereas the mark.**clip** option is implemented using SVG clipping, the projection.**clip** option affects the generated geometry and typically produces smaller SVG output.
