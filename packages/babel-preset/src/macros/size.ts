interface SizeOutput {
  [key: string]: [number | string, string | undefined];
}

function withPrefix(prefix?: string) {
  const widthKey = prefix ? `${prefix}Width` : "width";
  const heightKey = prefix ? `${prefix}Height` : "height";

  return function size(x: number | string, y?: number | string, unit?: string): SizeOutput {
    if (typeof y == "string" && typeof x == "number") {
      unit = y;
      y = undefined;
    }

    return {
      [widthKey]: [x, unit],
      [heightKey]: [y || x, unit],
    };
  };
}

/**
 * Sets `width` and `height`.
 *
 * @example
 * // size: 100;
 * // → width: 100px; height: 100px;
 *
 * @example
 * // size: 200, 100;
 * // → width: 200px; height: 100px;
 *
 * @example
 * // size: 50, "rem";
 * // → width: 50rem; height: 50rem;
 */
export const size = withPrefix();

/**
 * Sets `min-width` and `min-height`.
 *
 * @example
 * // minSize: 200;
 * // → min-width: 200px; min-height: 200px;
 *
 * @example
 * // minSize: 300, 150;
 * // → min-width: 300px; min-height: 150px;
 */
export const minSize = withPrefix("min");

/**
 * Sets `max-width` and `max-height`.
 *
 * @example
 * // maxSize: 600;
 * // → max-width: 600px; max-height: 600px;
 *
 * @example
 * // maxSize: 800, 400;
 * // → max-width: 800px; max-height: 400px;
 */
export const maxSize = withPrefix("max");

/**
 * Sets `width` and `height` with aspect-ratio–aware scaling.
 *
 * When `y` is a decimal between 0 and 1 (exclusive), it is treated as an
 * aspect ratio multiplier applied to `x`:
 * - **Positive** decimal `y` → width is scaled *down* (`x *= y`), height stays at `x`.
 * - **Negative** decimal `y` → height is scaled *down* (`y = x * |y|`), width stays at `x`.
 *
 * @param x    - Primary dimension.
 * @param y    - Secondary dimension or aspect-ratio fraction.
 * @param unit - Explicit CSS unit.
 *
 * @example
 * // Square
 * // aspectSize: 200, 200;
 * // → width: 200px; height: 200px;
 *
 * @example
 * // 16:9 — negative fraction scales height down
 * // aspectSize: 320, -0.5625;
 * // → width: 320px; height: 180px;
 *
 * @example
 * // Positive fraction scales width down
 * // aspectSize: 200, 0.5;
 * // → width: 100px; height: 200px;
 */
export function aspectSize(x: number, y: number, unit?: string): SizeOutput {
  const y2 = Math.abs(y);

  if (y2 && y2 < 1)
    if (y <= 0) y = x * y2;
    else {
      y = x;
      x *= y2;
    }

  return {
    width: [x, unit],
    height: [y || x, unit],
  };
}
