import { appendUnit } from "./appendUnit";

/**
 * Sets `margin` on all four sides.
 *
 * - The keywords `"auto"` and `"none"` are passed through verbatim.
 * - Strings that already contain a space are used as-is (e.g. `"10px 20px"`).
 * - Otherwise every argument is individually unit-converted and joined with spaces,
 *   following the standard CSS 1–4 value shorthand.
 *
 * @param args - One to four spacing values, `"auto"`, or `"none"`.
 * @returns     A style map with `margin`.
 *
 * @example
 * margin(10, 20);
 * // → { margin: "10px 20px" }
 *
 * @example
 * margin("auto");
 * // → { margin: "auto" }
 *
 * @example
 * margin(5, 10, 15, 20);
 * // → { margin: "5px 10px 15px 20px" }
 */
export function margin(...args: (number | string)[]): { margin: string } {
  const a1 = args[0];
  let value: string;

  if ((args.length == 1 && a1 == "auto") || a1 == "none" || (typeof a1 === "string" && / /.test(a1)))
    value = String(a1);
  else
    value = args.map((x) => appendUnit(x)).join(" ");

  return { margin: value };
}

/**
 * Sets `padding` on all four sides.
 *
 * Follows the same rules as {@link margin}: `"auto"` and `"none"` are passed
 * through, strings with spaces are used as-is, and numeric arguments are
 * unit-converted individually.
 *
 * @param args - One to four spacing values, `"auto"`, or `"none"`.
 * @returns     A style map with `padding`.
 *
 * @example
 * padding(20);
 * // → { padding: "20px" }
 *
 * @example
 * padding(10, 20, 30);
 * // → { padding: "10px 20px 30px" }
 */
export function padding(...args: (number | string)[]): { padding: string } {
  const a1 = args[0];
  let value: string;

  if ((args.length == 1 && a1 == "auto") || a1 == "none" || (typeof a1 === "string" && / /.test(a1)))
    value = String(a1);
  else
    value = args.map((x) => appendUnit(x)).join(" ");

  return { padding: value };
}

/**
 * Sets `margin-top`.
 *
 * @param a    - Spacing value (number auto-converted to `px`).
 * @param unit - Optional explicit CSS unit.
 * @returns     A style map with `marginTop`.
 *
 * @example
 * marginTop(16);
 * // → { marginTop: "16px" }
 */
export function marginTop(a: number | string, unit?: string): { marginTop: string } {
  return { marginTop: appendUnit(a, unit) };
}

/**
 * Sets `margin-left`.
 *
 * @param a    - Spacing value.
 * @param unit - Optional explicit CSS unit.
 * @returns     A style map with `marginLeft`.
 *
 * @example
 * marginLeft(8);
 * // → { marginLeft: "8px" }
 */
export function marginLeft(a: number | string, unit?: string): { marginLeft: string } {
  return { marginLeft: appendUnit(a, unit) };
}

/**
 * Sets `margin-right`.
 *
 * @param a    - Spacing value.
 * @param unit - Optional explicit CSS unit.
 * @returns     A style map with `marginRight`.
 *
 * @example
 * marginRight(8);
 * // → { marginRight: "8px" }
 */
export function marginRight(a: number | string, unit?: string): { marginRight: string } {
  return { marginRight: appendUnit(a, unit) };
}

/**
 * Sets `margin-bottom`.
 *
 * @param a    - Spacing value.
 * @param unit - Optional explicit CSS unit.
 * @returns     A style map with `marginBottom`.
 *
 * @example
 * marginBottom(24);
 * // → { marginBottom: "24px" }
 */
export function marginBottom(a: number | string, unit?: string): { marginBottom: string } {
  return { marginBottom: appendUnit(a, unit) };
}

/** Alias for {@link marginTop}. */
export { marginTop as marginT };
/** Alias for {@link marginLeft}. */
export { marginLeft as marginL };
/** Alias for {@link marginRight}. */
export { marginRight as marginR };
/** Alias for {@link marginBottom}. */
export { marginBottom as marginB };

/**
 * Sets `padding-left` and `padding-right` to the same value, or to
 * independent values when two arguments are supplied.
 *
 * @param a - Left (and right, when `b` is omitted) padding.
 * @param b - Right padding. Defaults to `a`.
 * @returns  A style map with `paddingLeft` and `paddingRight`.
 *
 * @example
 * paddingHorizontal(16);
 * // → { paddingLeft: 16, paddingRight: 16 }
 *
 * @example
 * paddingHorizontal(8, 16);
 * // → { paddingLeft: 8, paddingRight: 16 }
 */
export function paddingHorizontal(a: number | string, b?: number | string): { paddingLeft: number | string; paddingRight: number | string } {
  return {
    paddingLeft: a,
    paddingRight: b || a,
  };
}

/**
 * Sets `padding-top` and `padding-bottom` to the same value, or to
 * independent values when two arguments are supplied.
 *
 * @param a - Top (and bottom, when `b` is omitted) padding.
 * @param b - Bottom padding. Defaults to `a`.
 * @returns  A style map with `paddingTop` and `paddingBottom`.
 *
 * @example
 * paddingVertical(12);
 * // → { paddingTop: 12, paddingBottom: 12 }
 */
export function paddingVertical(a: number | string, b?: number | string): { paddingTop: number | string; paddingBottom: number | string } {
  return {
    paddingTop: a,
    paddingBottom: b || a,
  };
}

/**
 * Sets `margin-left` and `margin-right` to the same value, or to
 * independent values when two arguments are supplied.
 *
 * @param a - Left (and right) margin.
 * @param b - Right margin. Defaults to `a`.
 * @returns  A style map with `marginLeft` and `marginRight`.
 *
 * @example
 * marginHorizontal(20);
 * // → { marginLeft: 20, marginRight: 20 }
 */
export function marginHorizontal(a: number | string, b?: number | string): { marginLeft: number | string; marginRight: number | string } {
  return {
    marginLeft: a,
    marginRight: b || a,
  };
}

/**
 * Sets `margin-top` and `margin-bottom` to the same value, or to
 * independent values when two arguments are supplied.
 *
 * @param a - Top (and bottom) margin.
 * @param b - Bottom margin. Defaults to `a`.
 * @returns  A style map with `marginTop` and `marginBottom`.
 *
 * @example
 * marginVertical(10);
 * // → { marginTop: 10, marginBottom: 10 }
 */
export function marginVertical(a: number | string, b?: number | string): { marginTop: number | string; marginBottom: number | string } {
  return {
    marginTop: a,
    marginBottom: b || a,
  };
}

/** Alias for {@link paddingHorizontal}. */
export { paddingHorizontal as paddingH };
/** Alias for {@link paddingVertical}. */
export { paddingVertical as paddingV };
/** Alias for {@link marginHorizontal}. */
export { marginHorizontal as marginH };
/** Alias for {@link marginVertical}. */
export { marginVertical as marginV };
