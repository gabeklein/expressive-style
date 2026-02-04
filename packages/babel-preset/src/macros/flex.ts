const DIRECTIONS: Record<string, string | null> = {
  right: "row",
  left: "row-reverse",
  up: "column-reverse",
  down: "column",
  row: null,
  column: null,
  "row-reverse": null,
  "column-reverse": null,
};

interface FlexAlignOutput {
  display: string;
  flexDirection?: string;
  justifyContent?: string;
  alignItems?: string;
}

/**
 * Sets `display: flex` and configures direction and alignment in one call.
 *
 * **Direction keywords** (`right`, `left`, `up`, `down`, `row`, `column`,
 * `row-reverse`, `column-reverse`) set `flex-direction`.
 *
 * The special keyword `center` sets both `justify-content` and `align-items`
 * to `"center"`.  Any other string is assigned directly to `justify-content`.
 *
 * @param args - One or more direction / alignment keywords.
 * @returns     A style map with `display: flex` and the resolved flex properties.
 *
 * @example
 * // Horizontal row, centred on both axes
 * flexAlign("right", "center");
 * // → { display: "flex", flexDirection: "row", justifyContent: "center", alignItems: "center" }
 *
 * @example
 * // Column layout
 * flexAlign("down");
 * // → { display: "flex", flexDirection: "column" }
 *
 * @example
 * // Centre only (default row direction)
 * flexAlign("center");
 * // → { display: "flex", justifyContent: "center", alignItems: "center" }
 */
export function flexAlign(...args: string[]): FlexAlignOutput {
  const style: FlexAlignOutput = {
    display: "flex",
  };

  for (const arg of args) {
    if (arg in DIRECTIONS) {
      style.flexDirection = DIRECTIONS[arg] || arg;
    } else if (arg == "center") {
      style.justifyContent = "center";
      style.alignItems = "center";
    } else style.justifyContent = arg;
  }

  return style;
}
