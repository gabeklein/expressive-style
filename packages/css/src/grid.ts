interface GridAreaOutput {
  gridRow: string;
  gridColumn: string;
}

/**
 * Sets both `grid-row` and `grid-column` in one call.
 *
 * Each argument follows the same slash-recombination rules as {@link gridRow}
 * and {@link gridColumn}.
 *
 * @param rows - Row placement value (integer start, or a slash-expression).
 * @param cols - Column placement value.
 *
 * @example
 * // gridArea: 1, 2;
 * // → grid-row: 1; grid-column: 2;
 */
export function gridArea(...args: unknown[]): GridAreaOutput | undefined {
  if (args.length == 2)
    return {
      gridRow: recombineSlash(args[0]),
      gridColumn: recombineSlash(args[1]),
    };
}

/**
 * Sets `grid-row`.  A single number is used as-is; a slash operator
 * (represented internally as a nested array) is recombined into a
 * `start / end` string.
 *
 * @param args - Row placement value(s).
 *
 * @example
 * // gridRow: 2;
 * // → grid-row: 2;
 */
export function gridRow(...args: unknown[]): { gridRow: string } {
  return {
    gridRow: recombineSlash(args),
  };
}

/**
 * Sets `grid-column`.  Follows the same slash-recombination rules as
 * {@link gridRow}.
 *
 * @param args - Column placement value(s).
 *
 * @example
 * // gridColumn: 1;
 * // → grid-column: 1;
 */
export function gridColumn(...args: unknown[]): { gridColumn: string } {
  return {
    gridColumn: recombineSlash(args),
  };
}

/**
 * Sets `display: grid` and defines `grid-template-rows`.
 *
 * Value conversion rules applied to each token:
 * - **Numbers**            → appended with `px`.
 * - **Decimal strings**    → appended with `fr` (e.g. `"1.5"` → `"1.5fr"`).
 * - **`"min"` / `"max"`**  → expanded to `min-content` / `max-content`.
 * - **Other strings**      → used verbatim.
 *
 * @param args - Row template tokens.
 *
 * @example
 * // gridRows: "1fr", 200, "1fr";
 * // → display: grid; grid-template-rows: 1fr 200px 1fr;
 *
 * @example
 * // gridRows: "min", "1.0", "max";
 * // → display: grid; grid-template-rows: min-content 1.0fr max-content;
 */
export function gridRows(...args: unknown[]): {
  display: string;
  gridTemplateRows: string;
} {
  return {
    display: "grid",
    gridTemplateRows: recombineTemplate(args),
  };
}

/**
 * Sets `display: grid` and defines `grid-template-columns`.
 * Follows the same value-conversion rules as {@link gridRows}.
 *
 * @param args - Column template tokens.
 *
 * @example
 * // gridColumns: 100, "1.0", 100;
 * // → display: grid; grid-template-columns: 100px 1.0fr 100px;
 */
export function gridColumns(...args: unknown[]): {
  display: string;
  gridTemplateColumns: string;
} {
  return {
    display: "grid",
    gridTemplateColumns: recombineTemplate(args),
  };
}

function recombineSlash(args: unknown): string {
  args = ([] as unknown[]).concat(args);

  if ((args as unknown[])[0] !== "-") return String((args as unknown[])[0]);

  let layer: unknown[] = args as unknown[];
  let x = "";

  while (true) {
    x = x + " / " + layer[2];

    if (Array.isArray(layer[1])) layer = layer[1];
    else return String(layer[1]) + x;
  }
}

function recombineTemplate(args: unknown[]): string {
  return args.map(formatGridValue).join(" ");
}

function formatGridValue(x: unknown): string {
  if (typeof x == "number") return x + "px";

  if (typeof x !== "string") throw new Error("Unexpected value for grid");

  if (/^\d+\.\d+$/.test(x)) return x + "fr";

  if (x == "min" || x == "max") return x + "-content";

  return x;
}
