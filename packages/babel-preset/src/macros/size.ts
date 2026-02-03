/** Style map shape returned by the size-family macros. */
interface SizeOutput {
  [key: string]: [number | string, string | undefined];
}

/**
 * Factory that produces a size macro scoped to an optional CSS-property prefix
 * (`"min"`, `"max"`, or none for bare `width`/`height`).
 *
 * When the second argument is a string and the first is a number, the string
 * is treated as an explicit unit and `y` defaults to `x`.
 *
 * @param prefix - Property prefix (`"min"`, `"max"`, or `undefined`).
 */
function withPrefix(prefix?: string) {
  const widthKey = prefix ? `${prefix}Width` : "width";
  const heightKey = prefix ? `${prefix}Height` : "height";

  /**
   * Sets width and height (or their min/max variants) in one call.
   *
   * @param x    - Width value.
   * @param y    - Height value. When omitted or when a unit string is passed
   *              as the second argument, height equals width.
   * @param unit - Explicit CSS unit applied to both dimensions.
   * @returns    A style map with the width and height keys.
   */
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
 * size(100);           // → { width: [100], height: [100] }
 * size(200, 100);      // → { width: [200], height: [100] }
 * size(50, "rem");     // → { width: [50, "rem"], height: [50, "rem"] }
 */
export const size = withPrefix();

/**
 * Sets `min-width` and `min-height`.
 *
 * @example
 * minSize(200);        // → { minWidth: [200], minHeight: [200] }
 * minSize(300, 150);   // → { minWidth: [300], minHeight: [150] }
 */
export const minSize = withPrefix("min");

/**
 * Sets `max-width` and `max-height`.
 *
 * @example
 * maxSize(600);        // → { maxWidth: [600], maxHeight: [600] }
 * maxSize(800, 400);   // → { maxWidth: [800], maxHeight: [400] }
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
 * @returns    A style map with `width` and `height`.
 *
 * @example
 * // Square
 * aspectSize(200, 200);
 * // → { width: [200], height: [200] }
 *
 * @example
 * // 16:9 — negative fraction scales height down
 * aspectSize(320, -0.5625);
 * // → { width: [320], height: [180] }
 *
 * @example
 * // Positive fraction scales width down
 * aspectSize(200, 0.5);
 * // → { width: [100], height: [200] }
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
