import chroma from "chroma-js";

/** easing-coordinates has no published types; the default export is the namespace object. */
const easingCoordinates = require("easing-coordinates") as {
  easingCoordinates: (fn: string, steps?: number) => { x: number; y: number }[];
};

/**
 * Generates a CSS `linear-gradient` whose colour stops follow an easing curve
 * rather than being evenly spaced.  Useful for producing smooth, perceptually
 * uniform fades (e.g. transparent-to-colour overlays).
 *
 * The `timing` argument accepts any CSS easing keyword in camelCase — it is
 * automatically converted to kebab-case before being forwarded to
 * `easing-coordinates`.
 *
 * The special colour value `"transparent"` is normalised to a zero-alpha
 * version of the *other* colour so that the gradient interpolates through the
 * colour's hue instead of through grey.
 *
 * @param direction - Gradient direction as a single hyphenated token
 *                    (e.g. `"to-right"`, `"to-bottom"`).  The hyphen is
 *                    replaced with a space in the output.
 * @param from      - Starting colour (any value accepted by `chroma-js`, or
 *                    `"transparent"`).
 * @param timing    - Easing function name in camelCase (e.g. `"easeInOut"`).
 * @param to        - Ending colour (same rules as `from`).
 * @param stops     - Number of colour stops to generate. Defaults to `13`.
 * @returns         A style map with a single `backgroundImage` property.
 *
 * @example
 * easingGradient("to-right", "black", "easeInOut", "white");
 * // → { backgroundImage: "linear-gradient(to right, hsl(...), ...)" }
 *
 * @example
 * // Fade from a colour to transparent using 20 stops
 * easingGradient("to-bottom", "#3366cc", "easeOut", "transparent", 20);
 * // → { backgroundImage: "linear-gradient(to bottom, hsl(...), ...)" }
 */
export function easingGradient(
  direction: string,
  from: string,
  timing: string,
  to: string,
  stops: number = 13,
): { backgroundImage: string } {
  direction = direction.replace("-", " ");
  timing = timing.replace(/([A-Z]+)/g, "-$1").toLowerCase();
  [from, to] = normalize(from, to);

  const output: string[] = [direction];
  const coordinates = easingCoordinates.easingCoordinates(timing, stops - 1);

  for (const xy of coordinates) {
    const { x: progress, y: delta } = xy;

    let color = roundHslAlpha(chroma.mix(from, to, delta, "lrgb").css("hsl"));

    if (progress % 1) color += " " + (progress * 100).toFixed(2) + "%";

    output.push(color);
  }

  return {
    backgroundImage: `linear-gradient(${output.join(", ")})`,
  };
}

/** Extracts the portion of a CSS function string before the opening parenthesis. */
function getBeforeParenthesisMaybe(str: string): string {
  return str.includes("(") ? str.substring(0, str.indexOf("(")) : str;
}

/** Extracts the content between the outermost parentheses. */
function getParenthesisInsides(str: string): string {
  return str.match(/\((.*)\)/)!.pop()!;
}

/**
 * Rounds numeric values inside an HSL(A) string to 3 decimal places so that
 * the generated gradient CSS stays readable.  Percentage tokens are left alone.
 */
function roundHslAlpha(color: string): string {
  const prefix = getBeforeParenthesisMaybe(color);
  const values = getParenthesisInsides(color)
    .split(",")
    .map((string) =>
      string.includes("%")
        ? string.trim()
        : string.length > 4
        ? Number(string).toFixed(3)
        : string
    );

  return `${prefix}(${values.join(", ")})`;
}

/**
 * Replaces the keyword `"transparent"` with a zero-alpha version of the
 * neighbouring colour so gradients interpolate through hue instead of grey.
 */
function normalize(...colors: string[]): string[] {
  return colors.map((color, i) =>
    color === "transparent"
      ? chroma(colors[Math.abs(i - 1)])
          .alpha(0)
          .css("rgb")
      : color
  );
}
