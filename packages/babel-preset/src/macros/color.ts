/** Return type when `background` receives an `rgb`/`rgba`/`hsl`/`hsla` tuple. */
interface BackgroundColorOutput {
  backgroundColor: string;
}

/** Return type when `background` receives arbitrary passthrough values. */
interface BackgroundPassthroughOutput {
  background: unknown[];
}

/**
 * Sets `background-color` from an `rgb`/`rgba`/`hsl`/`hsla` color tuple,
 * or passes values through as a raw `background` declaration.
 *
 * When the first argument is an array whose head is a recognised color-space
 * keyword the tail is forwarded to {@link rgba} or {@link hsla} and the result
 * is mapped to `backgroundColor`.  Otherwise every argument is collected into a
 * plain `background` array.
 *
 * @param a - A color-space tuple (`["rgb", r, g, b]`, `["rgba", r, g, b, a]`,
 *            `["hsl", h, s, l]`, `["hsla", h, s, l, a]`) **or** any value that
 *            should be forwarded verbatim.
 *
 * @example
 * // Solid red via rgb tuple
 * background(["rgb", 255, 0, 0]);
 * // → { backgroundColor: "rgb(255,0,0)" }
 *
 * @example
 * // Semi-transparent blue via rgba tuple
 * background(["rgba", 0, 0, 255, 0.5]);
 * // → { backgroundColor: "rgba(0,0,255,0.5)" }
 *
 * @example
 * // HSL colour
 * background(["hsl", 120, 100, 50]);
 * // → { backgroundColor: "hsl(120,100%,50%)" }
 *
 * @example
 * // Passthrough — forwarded as-is
 * background("red");
 * // → { background: ["red"] }
 */
export function background(a?: unknown[]): BackgroundColorOutput | BackgroundPassthroughOutput {
  if (Array.isArray(a)) {
    const [head, ...tail] = a;

    switch (head) {
      case "rgb":
      case "rgba": {
        const { value } = rgba(...(tail as [number, number, number, number?]));

        return {
          backgroundColor: value,
        };
      }

      case "hsl":
      case "hsla": {
        const { value } = hsla(...(tail as [number, number, number, number?]));
        return {
          backgroundColor: value,
        };
      }
    }
  }

  return {
    background: Array.from(arguments),
  };
}

/** Alias for {@link background}. */
export { background as bg };

/**
 * Builds an `rgb()` or `rgba()` CSS color string.
 *
 * @param r - Red channel  (0–255).
 * @param g - Green channel (0–255).
 * @param b - Blue channel  (0–255).
 * @param a - Alpha channel (0–1). Defaults to `1` (fully opaque).
 * @returns An object containing the formatted CSS color string.
 * @throws   If any of `r`, `g`, `b` is not a number.
 *
 * @example
 * rgba(255, 128, 0);
 * // → { value: "rgb(255,128,0)" }
 *
 * @example
 * rgba(255, 128, 0, 0.6);
 * // → { value: "rgba(255,128,0,0.6)" }
 */
export function rgba(r: number, g: number, b: number, a: number = 1): { value: string } {
  for (const x of [r, g, b])
    if (typeof x != "number")
      throw new Error("malformed arguments in rgb statement");

  const rgb = [r, g, b].join(",");

  return {
    value: a == 1 ? `rgb(${rgb})` : `rgba(${rgb},${a})`,
  };
}

/**
 * Builds an `hsl()` or `hsla()` CSS color string.
 *
 * @param h - Hue in degrees (0–360).
 * @param s - Saturation percentage (0–100, without the `%` sign).
 * @param l - Lightness  percentage (0–100, without the `%` sign).
 * @param a - Alpha channel (0–1). Defaults to `1` (fully opaque).
 * @returns An object containing the formatted CSS color string.
 * @throws   If any of `h`, `s`, `l` is not a number.
 *
 * @example
 * hsla(210, 80, 60);
 * // → { value: "hsl(210,80%,60%)" }
 *
 * @example
 * hsla(210, 80, 60, 0.4);
 * // → { value: "hsla(210,80%,60%,0.4)" }
 */
export function hsla(h: number, s: number, l: number, a: number = 1): { value: string } {
  for (const x of [h, s, l])
    if (typeof x != "number")
      throw new Error("malformed arguments in hsl statement");

  const hsl = [h, s + "%", l + "%"].join(",");

  return {
    value: a == 1 ? `hsl(${hsl})` : `hsla(${hsl},${a})`,
  };
}
