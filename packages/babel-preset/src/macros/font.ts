interface FontOutput {
  fontWeight?: number;
  fontSize?: number;
  fontFamily?: string;
}

/**
 * Sets font properties by auto-detecting argument types.
 *
 * - **Multiples of 100** (100–900) → `font-weight`.
 * - **Other numbers**              → `font-size` (unit appended downstream).
 * - **Strings**                    → `font-family`.
 *
 * Arguments are processed in order; later values of the same type overwrite earlier ones.
 *
 * @param args - Any mix of weight numbers, size numbers, and family name strings.
 *
 * @example
 * // Weight + size
 * // font: 700, 18;
 * // → font-weight: 700; font-size: 18px;
 *
 * @example
 * // Family only
 * // font: "Inter";
 * // → font-family: Inter;
 *
 * @example
 * // All three
 * // font: 400, 16, "System UI";
 * // → font-weight: 400; font-size: 16px; font-family: System UI;
 */
export function font(...args: (number | string)[]): FontOutput {
  const output: FontOutput = {};

  for (const x of args)
    if (typeof x === "number" && x % 100 === 0) output.fontWeight = x;
    else if (typeof x === "number") output.fontSize = x;
    else if (typeof x === "string") output.fontFamily = x;

  return output;
}

export function fontFamily(...args: string[]): { fontFamily: string } {
  return {
    fontFamily: args.map(quoteIfWhitespace).join(", "),
  };
}

function quoteIfWhitespace(font: string): string {
  return ~font.indexOf(" ") ? `"${font}"` : font;
}

export { fontFamily as family };
