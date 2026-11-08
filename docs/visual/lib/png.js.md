# visual/lib/png.js

Dependency-free PNG codec. `decode(buffer)` supports 8-bit RGB and RGBA, no interlacing, all five filter types, and returns `{ width, height, channels, pixels }`. `encode(image)` writes unfiltered rows. `solid(w, h, rgb)` builds a flat image for tests. Anything else throws `Unsupported PNG`.
