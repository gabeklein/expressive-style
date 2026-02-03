import { appendUnit } from "./appendUnit";

/** CSS property map returned by border macros. */
interface BorderOutput {
  border?: string;
  borderTop?: string;
  borderLeft?: string;
  borderRight?: string;
  borderBottom?: string;
}

/**
 * Factory that produces a border macro scoped to an optional direction.
 *
 * @param dir - CSS direction suffix (`"top"`, `"left"`, `"right"`, `"bottom"`), or `undefined` for all sides.
 */
function _border(dir?: string) {
  let key: string = "border";
  if (dir) key += dir[0].toUpperCase() + dir.slice(1);

  /**
   * Sets a border with the given color, width, and style.
   *
   * @param color  - Border color, hex value, or the keywords `"none"` / `"transparent"`.
   * @param width  - Border width as a number (auto-converted to `px`) or a string with units. Defaults to `"1"`.
   * @param style  - CSS border-style value (e.g. `"solid"`, `"dashed"`). Defaults to `"solid"`.
   * @returns      A style map with the appropriate border property set.
   *
   * @example
   * // All sides — 2 px solid red
   * border(0xff0000, 2);
   * // → { border: "0xff0000 solid 2px" }
   *
   * @example
   * // All sides — disable border
   * border("none");
   * // → { border: "none" }
   *
   * @example
   * // Top only — 3 px dashed blue (when called via borderTop)
   * borderTop(0x0000ff, 3, "dashed");
   * // → { borderTop: "0x0000ff dashed 3px" }
   */
  return (color?: string | number, width?: string | number, style?: string): BorderOutput => {
    if (color == "none" || color == "transparent")
      return {
        [key]: color,
      };

    return {
      [key]: [color || "black", style || "solid", appendUnit(width || "1")],
    };
  };
}

/**
 * Sets `border` on all four sides.
 *
 * @example
 * border(0xddd);          // → { border: "0xddd solid 1px" }
 * border("none");         // → { border: "none" }
 * border(0x333, 2, "dashed"); // → { border: "0x333 dashed 2px" }
 */
export const border = _border();

/**
 * Sets `border-top` only.
 *
 * @example
 * borderTop(0xaaa);       // → { borderTop: "0xaaa solid 1px" }
 */
export const borderTop = _border("top");

/**
 * Sets `border-left` only.
 *
 * @example
 * borderLeft(0xaaa, 2);   // → { borderLeft: "0xaaa solid 2px" }
 */
export const borderLeft = _border("left");

/**
 * Sets `border-right` only.
 *
 * @example
 * borderRight(0xaaa);     // → { borderRight: "0xaaa solid 1px" }
 */
export const borderRight = _border("right");

/**
 * Sets `border-bottom` only.
 *
 * @example
 * borderBottom("transparent"); // → { borderBottom: "transparent" }
 */
export const borderBottom = _border("bottom");

/** Alias for {@link borderTop}. */
export { borderTop as borderT };
/** Alias for {@link borderLeft}. */
export { borderLeft as borderL };
/** Alias for {@link borderRight}. */
export { borderRight as borderR };
/** Alias for {@link borderBottom}. */
export { borderBottom as borderB };
