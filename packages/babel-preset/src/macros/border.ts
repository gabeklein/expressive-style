import { appendUnit } from "./appendUnit";

interface BorderOutput {
  border?: string;
  borderTop?: string;
  borderLeft?: string;
  borderRight?: string;
  borderBottom?: string;
}

function _border(dir?: string) {
  let key: string = "border";
  if (dir) key += dir[0].toUpperCase() + dir.slice(1);

  return (
    color?: string | number,
    width?: string | number,
    style?: string,
  ): BorderOutput => {
    if (typeof color === "string" && / /.test(color))
      return { [key]: color };

    if (color == "none" || color == "transparent")
      return {
        [key]: color,
      };

    return {
      [key]: [color || "black", style || "solid", appendUnit(width || 1)],
    };
  };
}

/**
 * Sets `border` with colour, width, and style.
 *
 * Pass `"none"` or `"transparent"` to clear the border.  Otherwise the
 * output is `<color> <style> <width>` with sensible defaults: colour →
 * `black`, style → `solid`, width → `1px`.
 *
 * @param color - Border colour, `"none"`, or `"transparent"`.
 * @param width - Border width (number → `px`). Defaults to `1`.
 * @param style - Border style keyword. Defaults to `"solid"`.
 *
 * @example
 * `border: 0xddd;`
 * // → border: #ddd solid 1px;
 *
 * @example
 * `border: 0x333, 2;`
 * // → border: #333 solid 2px;
 */
export const border = _border();

export const borderTop = _border("top");

export const borderLeft = _border("left");

export const borderRight = _border("right");

export const borderBottom = _border("bottom");

export { borderTop as borderT };
export { borderLeft as borderL };
export { borderRight as borderR };
export { borderBottom as borderB };
