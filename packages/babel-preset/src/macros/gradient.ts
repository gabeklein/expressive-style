import chroma from "chroma-js";

const easingCoordinates = require("easing-coordinates") as {
  easingCoordinates: (fn: string, steps?: number) => { x: number; y: number }[];
};

type GradientDirection = "toTop" | "toRight" | "toBottom" | "toLeft";

/**
 * Generates a CSS `linear-gradient` whose colour stops follow an easing curve
 * rather than being evenly spaced.  Useful for smooth, perceptually uniform
 * fades (e.g. transparent-to-colour overlays).
 *
 * `timing` accepts any CSS easing keyword in camelCase — it is automatically
 * converted to kebab-case before being forwarded to `easing-coordinates`.
 *
 * The special colour value `"transparent"` is normalised to a zero-alpha
 * version of the *other* colour so that the gradient interpolates through the
 * colour's hue instead of through grey.
 *
 * @param direction - Gradient direction in camelCase (e.g. `toRight`, `toBottom`).
 * @param from      - Starting colour (any value accepted by `chroma-js`, or `"transparent"`).
 * @param timing    - Easing function name in camelCase (e.g. `easeInOut`).
 * @param to        - Ending colour (same rules as `from`).
 * @param stops     - Number of colour stops to generate. Defaults to `13`.
 *
 * @example
 * // easingGradient: toRight, "black", easeInOut, "white";
 * // → background-image: linear-gradient(to right, ...);
 *
 * @example
 * // easingGradient: toBottom, "#3366cc", easeOut, "transparent", 20;
 * // → background-image: linear-gradient(to bottom, ...);
 */
export function easingGradient(
  direction: GradientDirection | string,
  from: string,
  timing: string,
  to: string,
  stops: number = 13
): { backgroundImage: string } {
  direction = direction.replace(/([A-Z])/g, " $1").toLowerCase();
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

function getBeforeParenthesisMaybe(str: string): string {
  return str.includes("(") ? str.substring(0, str.indexOf("(")) : str;
}

function getParenthesisInsides(str: string): string {
  return str.match(/\((.*)\)/)!.pop()!;
}

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

function normalize(...colors: string[]): string[] {
  return colors.map((color, i) =>
    color === "transparent"
      ? chroma(colors[Math.abs(i - 1)])
          .alpha(0)
          .css("rgb")
      : color
  );
}
