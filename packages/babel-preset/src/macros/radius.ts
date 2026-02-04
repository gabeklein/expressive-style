import { appendUnit } from "./appendUnit";

const CORNER_MATRIX: Record<string, number[]> = {
  top: [1, 1, 0, 0],
  left: [1, 0, 0, 1],
  right: [0, 1, 1, 0],
  bottom: [0, 0, 1, 1],
};

/**
 * Sets `border-radius`, with support for the special keyword `"round"`,
 * uniform radii, and directional (corner-group) radii.
 *
 * | Call                        | Result                                        |
 * |-----------------------------|-----------------------------------------------|
 * | `radius("round")`          | `border-radius: 999px` (pill / circle)        |
 * | `radius(8)`                | `border-radius: 8px` (uniform)                |
 * | `radius("top", 8)`         | top-left & top-right `8px`, others `0`        |
 * | `radius("top-left", 12)`   | only top-left corner `12px`                   |
 * | `radius("top", 8, 4)`      | top corners `8px`, bottom corners `4px`       |
 *
 * Two-part direction strings (e.g. `"top-left"`) intersect the bitmasks of
 * each part so only the shared corner is affected.
 *
 * @param dir - The keyword `"round"`, a numeric radius (uniform), or a
 *              direction string (`"top"`, `"left"`, `"top-left"`, etc.).
 * @param r1  - Primary radius applied to the corners matched by `dir`.
 * @param r2  - Fallback radius for the corners *not* matched. Defaults to `0`.
 *
 * @example
 * // Fully rounded (pill shape)
 * // radius: round;
 * // → border-radius: 999px;
 *
 * @example
 * // Uniform 12 px
 * // radius: 12;
 * // → border-radius: 12px;
 *
 * @example
 * // Top edge only
 * // radius: "top", 8;
 * // → border-radius: 8px 8px 0 0;
 *
 * @example
 * // Top corners 16, bottom corners 4
 * // radius: "top", 16, 4;
 * // → border-radius: 16px 16px 4px 4px;
 */
export function radius(dir: string | number, r1?: number, r2?: number): { borderRadius: string } {
  let value: string | number = "";

  if (dir == "round") value = 999;
  else if (r1 === undefined) value = dir;
  else if (typeof dir == "string") {
    let [d1, d2] = dir.split("-");
    let matrix = CORNER_MATRIX[d1];

    if (d2)
      matrix = matrix.map((val, i) => {
        return CORNER_MATRIX[d2][i] ? val : 0;
      });

    const radii = matrix.map((b) => {
      return (b ? r1 : r2) || 0;
    });

    value = radii.map((v) => appendUnit(v)).join(" ");
  }

  return {
    borderRadius: appendUnit(value),
  };
}

/**
 * Produces a perfect circle by setting `border-radius` to half the given
 * diameter and forwarding `size` so that width and height match.
 *
 * @param a - Diameter of the circle in pixels.
 *
 * @example
 * // circle: 100;
 * // → border-radius: 50px; width: 100px; height: 100px;
 */
export function circle(a: number): { borderRadius: number; size: number } {
  return {
    borderRadius: a / 2,
    size: a,
  };
}
