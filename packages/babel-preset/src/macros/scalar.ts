import { appendUnit } from "./appendUnit";

/** A value that may carry an explicit unit via the parser's named-value protocol. */
interface NamedValue {
  named: string;
  inner: [number | string];
}

/**
 * Core scalar macro.  Converts a single value to a unit-bearing string and
 * wraps it in an array (the format expected by the CSS plugin for scalar
 * properties).
 *
 * - The keyword `"fill"` is mapped to `"100%"` before unit conversion.
 * - A {@link NamedValue} object (produced by the parser for syntax like
 *   `` `10`rem` ``) extracts the explicit unit and passes it to
 *   {@link appendUnit}.
 *
 * @param value - A number, a string, or a {@link NamedValue} from the parser.
 * @param unit  - An optional explicit CSS unit (e.g. `"rem"`, `"%"`).
 *                Overridden when `value` is a {@link NamedValue}.
 * @returns     A single-element array containing the unit-converted string.
 *
 * @example
 * nToNUnits(16);
 * // → ["16px"]
 *
 * @example
 * nToNUnits("fill");
 * // → ["100%"]
 *
 * @example
 * nToNUnits(1.5);
 * // → ["1.5em"]
 */
export function nToNUnits(value: number | string | NamedValue, unit?: string): string[] {
  if (value == "fill") value = "100%";

  if (typeof value === "object" && (value as NamedValue).named) {
    unit = (value as NamedValue).named;
    value = (value as NamedValue).inner[0];
  }

  return [appendUnit(value as number | string, unit)];
}

/**
 * Sets `gap`.
 * @example gap(8); // → ["8px"]
 */
export const gap = nToNUnits;

/**
 * Sets `top` offset.
 * @example top(0); // → ["0"]
 */
export const top = nToNUnits;

/**
 * Sets `left` offset.
 * @example left(12); // → ["12px"]
 */
export const left = nToNUnits;

/**
 * Sets `right` offset.
 * @example right(12); // → ["12px"]
 */
export const right = nToNUnits;

/**
 * Sets `bottom` offset.
 * @example bottom(12); // → ["12px"]
 */
export const bottom = nToNUnits;

/**
 * Sets `width`.
 * @example width("fill"); // → ["100%"]
 */
export const width = nToNUnits;

/**
 * Sets `height`.
 * @example height(200); // → ["200px"]
 */
export const height = nToNUnits;

/**
 * Sets `max-width`.
 * @example maxWidth(600); // → ["600px"]
 */
export const maxWidth = nToNUnits;

/**
 * Sets `max-height`.
 * @example maxHeight(400); // → ["400px"]
 */
export const maxHeight = nToNUnits;

/**
 * Sets `min-width`.
 * @example minWidth(200); // → ["200px"]
 */
export const minWidth = nToNUnits;

/**
 * Sets `min-height`.
 * @example minHeight(100); // → ["100px"]
 */
export const minHeight = nToNUnits;

/**
 * Sets `font-size`.
 * @example fontSize(14); // → ["14px"]
 */
export const fontSize = nToNUnits;

/**
 * Sets `line-height`.
 * @example lineHeight(1.5); // → ["1.5em"]
 */
export const lineHeight = nToNUnits;

/**
 * Sets `outline-width`.
 * @example outlineWidth(2); // → ["2px"]
 */
export const outlineWidth = nToNUnits;

/**
 * Sets `border-radius` as a scalar (single value, no directional logic).
 * @example borderRadius(4); // → ["4px"]
 */
export const borderRadius = nToNUnits;

/**
 * Sets `background-size`.
 * @example backgroundSize("fill"); // → ["100%"]
 */
export const backgroundSize = nToNUnits;
