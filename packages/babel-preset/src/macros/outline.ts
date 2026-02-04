/**
 * Sets `outline` with sensible defaults.
 *
 * | Call signature            | Output                       |
 * |---------------------------|------------------------------|
 * | `outline("none")`         | `outline: none`              |
 * | `outline()`               | `outline: 1px dashed green`  |
 * | `outline(color)`          | `outline: 1px dashed <color>`|
 * | `outline(color, width, …)`| each arg joined, numbers → `px` |
 *
 * @param a - Colour string, the keyword `"none"`, or omitted for the default green dashed outline.
 * @param b - Width or additional outline tokens.  When present all arguments are joined.
 *
 * @example
 * // Disable outline
 * // outline: none;
 * // → outline: none;
 *
 * @example
 * // Default debug outline (no argument)
 * // outline;
 * // → outline: 1px dashed green;
 *
 * @example
 * // Custom colour, default width & style
 * // outline: red;
 * // → outline: 1px dashed red;
 *
 * @example
 * // Full manual specification
 * // outline: "blue", 3, "dotted";
 * // → outline: blue 3px dotted;
 */
export function outline(a?: string, b?: string | number, ...rest: (string | number)[]): { outline: string } {
  if (a == "none")
    return {
      outline: "none",
    };

  if (b == undefined)
    return {
      outline: `1px dashed ${a || "green"}`,
    };

  const value = [a, b, ...rest]
    .map((x) => (typeof x == "number" ? `${x}px` : x))
    .join(" ");

  return {
    outline: value,
  };
}
