interface PositionOutput {
  position: string;
  top?: number | string;
  right?: number | string;
  bottom?: number | string;
  left?: number | string;
}

/**
 * Sets `position: absolute` with optional inset values.
 *
 * Accepts the same arguments as the CSS four-value shorthand:
 * - **0 args**     → all insets `0` (equivalent to `fill`).
 * - **1 number**   → all insets set to that value.
 * - **2 numbers**  → vertical, horizontal.
 * - **3 numbers**  → top, horizontal, bottom.
 * - **4 numbers**  → top, right, bottom, left.
 *
 * The string `"fill"` sets all insets to `0`.  Directional fills such as
 * `"fill-top"` omit the opposite edge (bottom in this case), creating a
 * strip that spans the specified side.  Two-direction strings like
 * `"top-right"` keep only those two edges.
 *
 * @param args - Inset values or a fill keyword.
 * @returns     A style map with `position: "absolute"` and the resolved insets.
 *
 * @example
 * // Cover the entire parent
 * absolute("fill");
 * // → { position: "absolute", top: 0, left: 0, right: 0, bottom: 0 }
 *
 * @example
 * // 10 px inset on all sides
 * absolute(10);
 * // → { position: "absolute", top: 10, right: 10, bottom: 10, left: 10 }
 *
 * @example
 * // Vertical 10, horizontal 20
 * absolute(10, 20);
 * // → { position: "absolute", top: 10, right: 20, bottom: 10, left: 20 }
 *
 * @example
 * // Stick to the top edge only
 * absolute("fill-top");
 * // → { position: "absolute", top: 0, left: 0, right: 0 }
 */
export function absolute(...args: (number | string)[]): PositionOutput {
  return position("absolute", ...args);
}

/**
 * Sets `position: fixed` with optional inset values.
 *
 * Accepts the same arguments and fill keywords as {@link absolute}.
 *
 * @param args - Inset values or a fill keyword.
 * @returns     A style map with `position: "fixed"` and the resolved insets.
 *
 * @example
 * // Fixed overlay covering the viewport
 * fixed("fill");
 * // → { position: "fixed", top: 0, left: 0, right: 0, bottom: 0 }
 *
 * @example
 * // Fixed, pinned to the bottom
 * fixed("fill-bottom");
 * // → { position: "fixed", left: 0, right: 0, bottom: 0 }
 */
export function fixed(...args: (number | string)[]): PositionOutput {
  return position("fixed", ...args);
}

export function relative(): { position: string } {
  return {
    position: "relative",
  };
}

const INVERSE: Record<string, string> = {
  top: "bottom",
  left: "right",
  right: "left",
  bottom: "top",
};

function position(kind: string, a?: number | string, b: number | string = 0, c: number | string = b, d?: number | string): PositionOutput {
  const out: PositionOutput = {
    position: kind,
    top: b,
    left: c,
    right: c,
    bottom: b,
  };

  if (a == "fill") return out;

  if (typeof a == "string") {
    const [k1, k2] = a.split("-");

    if (k2) {
      if (k1 == "fill") delete out[INVERSE[k2] as keyof PositionOutput];
      else for (const dir of [k1, k2]) delete out[INVERSE[dir] as keyof PositionOutput];

      return out;
    }
  }

  let top: number | string | undefined;
  let left: number | string | undefined;
  let right: number | string | undefined;
  let bottom: number | string | undefined;

  // argument count excludes `kind`
  const argc = [a, b, c, d].filter((v) => v !== undefined).length + (a === undefined ? 0 : 0);

  switch (arguments.length - 1) {
    case 0:
      a = 0;
    // falls through
    case 1:
      top = right = bottom = left = a;
      break;

    case 2:
      top = bottom = a;
      left = right = b;
      break;

    case 3:
      top = a;
      bottom = c;
      left = right = b;
      break;

    case 4:
      top = a;
      right = b;
      bottom = c;
      left = d;
      break;

    default:
      throw new Error("Too many arguments for css 4-way value.");
  }

  return {
    position: kind,
    top,
    right,
    bottom,
    left,
  };
}
