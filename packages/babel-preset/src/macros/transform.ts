type TransformTuple = [string, ...number[]];

function unitFor(name: string): string | null {
  if (name.startsWith("rotate") || name.startsWith("skew")) return "deg";
  if (name.startsWith("translate") || name === "perspective") return "px";
  return null;
}

function withUnit(value: number | string, unit: string | null): string {
  if (typeof value !== "number" || value === 0) return String(value);
  return unit ? value + unit : String(value);
}

/**
 * Builds a CSS `transform` declaration from one or more transform functions.
 *
 * Each argument is either:
 * - A **string** — passed through verbatim (e.g. `"none"`).
 * - A **tuple** `[name, ...params]` — the function name and its numeric
 *   parameters.  Units are appended automatically:
 *   - `translate*` / `perspective` → `px`
 *   - `rotate*` / `skew*`          → `deg`
 *   - `scale*`                     → unitless
 *
 * The special case `rotate3d(x, y, z, angle)` applies `deg` only to the last
 * parameter; the first three (axis vector) remain unitless.
 *
 * @param args - Transform function descriptors (strings or tuples).
 *
 * @example
 * // Single translateX
 * `transform: translateX(40);`
 * // → transform: translateX(40px);
 *
 * @example
 * // Rotation
 * `transform: rotate(45);`
 * // → transform: rotate(45deg);
 *
 * @example
 * // Compound — translate then scale
 * `transform: translateY(20), scale(1.5);`
 * // → transform: translateY(20px) scale(1.5);
 *
 * @example
 * // rotate3d — only the angle gets a unit
 * `transform: rotate3d(1, 0, 0, 45);`
 * // → transform: rotate3d(1, 0, 0, 45deg);
 */
export function transform(...args: (string | TransformTuple)[]): { transform: string } {
  const parts = args.map((arg) => {
    if (!Array.isArray(arg)) return arg;

    const [name, ...params] = arg;

    // rotate3d(x, y, z, angle) — first 3 unitless, last is deg
    const mapped =
      name === "rotate3d"
        ? params.map((p, i) =>
            withUnit(p, i === params.length - 1 ? "deg" : null),
          )
        : params.map((p) => withUnit(p, unitFor(name)));

    return `${name}(${mapped.join(", ")})`;
  });

  return { transform: parts.join(" ") };
}
