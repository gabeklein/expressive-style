/** Style map returned by {@link font}. */
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
 * @returns     A style map containing only the properties that were supplied.
 *
 * @example
 * // Weight + size
 * font(700, 18);
 * // → { fontWeight: 700, fontSize: 18 }
 *
 * @example
 * // Family only
 * font("Inter");
 * // → { fontFamily: "Inter" }
 *
 * @example
 * // All three
 * font(400, 16, "System UI");
 * // → { fontWeight: 400, fontSize: 16, fontFamily: "System UI" }
 */
export function font(...args: (number | string)[]): FontOutput {
  const output: FontOutput = {};

  for (const x of args)
    if (typeof x === "number" && x % 100 === 0) output.fontWeight = x;
    else if (typeof x === "number") output.fontSize = x;
    else if (typeof x === "string") output.fontFamily = x;

  return output;
}

/**
 * Sets `font-family` from one or more font names.
 *
 * Names that contain whitespace are automatically wrapped in double quotes
 * so the output is a valid CSS font stack.
 *
 * @param args - Font family names.
 * @returns     A style map with the `fontFamily` property.
 *
 * @example
 * fontFamily("Inter", "sans-serif");
 * // → { fontFamily: "Inter, sans-serif" }
 *
 * @example
 * fontFamily("Times New Roman", "Georgia", "serif");
 * // → { fontFamily: '"Times New Roman", Georgia, serif' }
 */
export function fontFamily(...args: string[]): { fontFamily: string } {
  return {
    fontFamily: args.map(quoteIfWhitespace).join(", "),
  };
}

/** Wraps a font name in quotes when it contains a space. */
function quoteIfWhitespace(font: string): string {
  return ~font.indexOf(" ") ? `"${font}"` : font;
}

/** Alias for {@link fontFamily}. */
export { fontFamily as family };
