/**
 * Sets `box-shadow` with a colour and optional geometry parameters.
 *
 * Pass `"none"` or `"initial"` as `color` to reset the shadow.  Otherwise the
 * shadow is rendered as `<x>px <y>px <radius>px <color>`.
 *
 * @param color  - Shadow colour (hex, named, or the keywords `"none"` / `"initial"`).
 * @param radius - Blur radius in `px`. Defaults to `10`.
 * @param x      - Horizontal offset in `px`. Defaults to `2`.
 * @param y      - Vertical offset in `px`. Defaults to the value of `x`.
 *
 * @example
 * // Simple shadow with defaults
 * // shadow: 0xccc;
 * // → box-shadow: 2px 2px 10px #ccc;
 *
 * @example
 * // Custom blur and offsets
 * // shadow: "rgba(0,0,0,0.2)", 20, 4, 8;
 * // → box-shadow: 4px 8px 20px rgba(0,0,0,0.2);
 *
 * @example
 * // Remove shadow
 * // shadow: none;
 * // → box-shadow: none;
 */
export function shadow(
  color: string | number,
  radius: number = 10,
  x: number = 2,
  y: number = x
): { boxShadow: string } {
  const boxShadow =
    color == "initial" || color == "none"
      ? String(color)
      : `${x}px ${y}px ${radius}px ${color}`;

  return {
    boxShadow,
  };
}
