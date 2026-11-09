# visual/lib/regions.js

- `pixelAt(png, x, y)`: RGB, coordinates clamped.
- `regionStats(png, rect)`: `{ count, mean, luma, lumaStd, colors }` where `colors` counts distinct 4-bit-per-channel colors.
- `looksBlank(stats)`: fewer than 2 colors or luma standard deviation under 2.
- `near(a, b, tolerance)`: every channel within tolerance.
