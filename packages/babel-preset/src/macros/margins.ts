import { appendUnit } from "./appendUnit";

/**
 * Sets `margin` from one to four values, following the CSS shorthand order.
 *
 * - **1 value**  → all sides.
 * - **2 values** → vertical, horizontal.
 * - **3 values** → top, horizontal, bottom.
 * - **4 values** → top, right, bottom, left.
 *
 * The keywords `"auto"` and `"none"` are passed through verbatim.
 *
 * @param args - Margin values (numbers get `px` appended).
 *
 * @example
 * // margin: 20;
 * // → margin: 20px;
 *
 * @example
 * // margin: 10, 20;
 * // → margin: 10px 20px;
 *
 * @example
 * // margin: auto;
 * // → margin: auto;
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
 * Sets `padding` from one to four values, following the CSS shorthand order.
 *
 * - **1 value**  → all sides.
 * - **2 values** → vertical, horizontal.
 * - **3 values** → top, horizontal, bottom.
 * - **4 values** → top, right, bottom, left.
 *
 * The keywords `"auto"` and `"none"` are passed through verbatim.
 *
 * @param args - Padding values (numbers get `px` appended).
 *
 * @example
 * // padding: 16;
 * // → padding: 16px;
 *
 * @example
 * // padding: 10, 20;
 * // → padding: 10px 20px;
 *
 * @example
 * // padding: 5, 10, 15, 20;
 * // → padding: 5px 10px 15px 20px;
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
 * @example
 * // marginTop: 10;
 * // → margin-top: 10px;
 */
export function marginTop(a: number | string, unit?: string): { marginTop: string } {
  return { marginTop: appendUnit(a, unit) };
}

/**
 * Sets `margin-left`.
 *
 * @example
 * // marginLeft: 15;
 * // → margin-left: 15px;
 */
export function marginLeft(a: number | string, unit?: string): { marginLeft: string } {
  return { marginLeft: appendUnit(a, unit) };
}

/**
 * Sets `margin-right`.
 *
 * @example
 * // marginRight: 15;
 * // → margin-right: 15px;
 */
export function marginRight(a: number | string, unit?: string): { marginRight: string } {
  return { marginRight: appendUnit(a, unit) };
}

/**
 * Sets `margin-bottom`.
 *
 * @example
 * // marginBottom: 10;
 * // → margin-bottom: 10px;
 */
export function marginBottom(a: number | string, unit?: string): { marginBottom: string } {
  return { marginBottom: appendUnit(a, unit) };
}

export { marginTop as marginT };
export { marginLeft as marginL };
export { marginRight as marginR };
export { marginBottom as marginB };

/**
 * Sets `padding-left` and `padding-right`.  When two arguments are
 * provided they are applied independently; otherwise both sides share
 * the first value.
 *
 * @param a - Left padding (and right, when `b` is omitted).
 * @param b - Right padding. Defaults to `a`.
 *
 * @example
 * // paddingH: 20;
 * // → padding-left: 20px; padding-right: 20px;
 *
 * @example
 * // paddingH: 10, 30;
 * // → padding-left: 10px; padding-right: 30px;
 */
export function paddingHorizontal(a: number | string, b?: number | string): { paddingLeft: number | string; paddingRight: number | string } {
  return {
    paddingLeft: a,
    paddingRight: b || a,
  };
}

/**
 * Sets `padding-top` and `padding-bottom`.  When two arguments are
 * provided they are applied independently; otherwise both sides share
 * the first value.
 *
 * @param a - Top padding (and bottom, when `b` is omitted).
 * @param b - Bottom padding. Defaults to `a`.
 *
 * @example
 * // paddingV: 20;
 * // → padding-top: 20px; padding-bottom: 20px;
 *
 * @example
 * // paddingV: 10, 30;
 * // → padding-top: 10px; padding-bottom: 30px;
 */
export function paddingVertical(a: number | string, b?: number | string): { paddingTop: number | string; paddingBottom: number | string } {
  return {
    paddingTop: a,
    paddingBottom: b || a,
  };
}

/**
 * Sets `margin-left` and `margin-right`.  When two arguments are
 * provided they are applied independently; otherwise both sides share
 * the first value.
 *
 * @param a - Left margin (and right, when `b` is omitted).
 * @param b - Right margin. Defaults to `a`.
 *
 * @example
 * // marginH: 20;
 * // → margin-left: 20px; margin-right: 20px;
 *
 * @example
 * // marginH: 10, 30;
 * // → margin-left: 10px; margin-right: 30px;
 */
export function marginHorizontal(a: number | string, b?: number | string): { marginLeft: number | string; marginRight: number | string } {
  return {
    marginLeft: a,
    marginRight: b || a,
  };
}

/**
 * Sets `margin-top` and `margin-bottom`.  When two arguments are
 * provided they are applied independently; otherwise both sides share
 * the first value.
 *
 * @param a - Top margin (and bottom, when `b` is omitted).
 * @param b - Bottom margin. Defaults to `a`.
 *
 * @example
 * // marginV: 20;
 * // → margin-top: 20px; margin-bottom: 20px;
 *
 * @example
 * // marginV: 10, 30;
 * // → margin-top: 10px; margin-bottom: 30px;
 */
export function marginVertical(a: number | string, b?: number | string): { marginTop: number | string; marginBottom: number | string } {
  return {
    marginTop: a,
    marginBottom: b || a,
  };
}

export { paddingHorizontal as paddingH };
export { paddingVertical as paddingV };
export { marginHorizontal as marginH };
export { marginVertical as marginV };
