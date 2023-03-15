/**
 * The set of supported color spaces for interpolation.
 *
 * * *rgb* - red, green, blue (sRGB)
 * * *hsl* - hue, saturation, lightness (HSL; cylindrical sRGB)
 * * *hcl* - hue, chroma, perceptual lightness (CIELCh_ab; cylindrical CIELAB)
 * * *lab* - perceptual lightness and opponent colors (L\*a\*b\*, CIELAB)
 */
export type ColorInterpolateName = "rgb" | "hsl" | "hcl" | "lab";

type ColorSchemeNameCase =
  | "Accent"
  | "Category10"
  | "Dark2"
  | "Paired"
  | "Pastel1"
  | "Pastel2"
  | "Set1"
  | "Set2"
  | "Set3"
  | "Tableau10"
  | "BrBG"
  | "PRGn"
  | "PiYG"
  | "PuOr"
  | "RdBu"
  | "RdGy"
  | "RdYlBu"
  | "RdYlGn"
  | "Spectral"
  | "BuRd"
  | "BuYlRd"
  | "Blues"
  | "Greens"
  | "Greys"
  | "Oranges"
  | "Purples"
  | "Reds"
  | "Turbo"
  | "Viridis"
  | "Magma"
  | "Inferno"
  | "Plasma"
  | "Cividis"
  | "Cubehelix"
  | "Warm"
  | "Cool"
  | "BuGn"
  | "BuPu"
  | "GnBu"
  | "OrRd"
  | "PuBu"
  | "PuBuGn"
  | "PuRd"
  | "RdPu"
  | "YlGn"
  | "YlGnBu"
  | "YlOrBr"
  | "YlOrRd"
  | "Rainbow"
  | "Sinebow";

/**
 * The set of supported color schemes, including schemes appropriate for
 * sequential, diverging, categorical, and cyclical values.
 */
export type ColorSchemeName = ColorSchemeNameCase | Lowercase<ColorSchemeNameCase>;
