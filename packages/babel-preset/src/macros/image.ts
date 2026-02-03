/**
 * Sets `background-image` to a `url()` wrapping the given path.
 *
 * @param a - The image URL or path string.
 * @returns  A style map with `backgroundImage`.
 *
 * @example
 * image("/assets/photo.png");
 * // → { backgroundImage: 'url("/assets/photo.png")' }
 */
export function image(a: string): { backgroundImage: string } {
  return {
    backgroundImage: `url("${a}")`,
  };
}

/**
 * Builds a Babel `CallExpression` AST node for `require(value)`.
 * Used internally so that relative-path background images are bundled
 * correctly by the module system at build time.
 */
function requireExpression(value: string) {
  return {
    type: "CallExpression",
    callee: { type: "Identifier", name: "require" },
    arguments: [{ type: "StringLiteral", value }],
  };
}

/**
 * Sets `background-image`, with special handling for relative paths.
 *
 * - **Relative paths** (starting with `./` or `../`) are wrapped in a
 *   `require()` call inside a template literal so the bundler resolves them:
 *   `` `url(${require("./img.png")})` ``.
 * - **Raw AST objects** (non-named) are passed through directly — this lets
 *   upstream macro results or CSS variable references flow in unmodified.
 * - **Anything else** is collected into an array (passthrough to the value
 *   processor).
 *
 * @param from - A relative/absolute image path, a raw AST node, or any other value.
 * @returns     A style map with `backgroundImage`.
 *
 * @example
 * // Relative path — emits a require() at build time
 * backgroundImage("./hero.png");
 * // → { backgroundImage: <TemplateLiteral: `url(${require("./hero.png")})`> }
 *
 * @example
 * // Absolute / remote URL — passed through for downstream processing
 * backgroundImage("https://cdn.example.com/bg.jpg");
 * // → { backgroundImage: ["https://cdn.example.com/bg.jpg"] }
 */
export function backgroundImage(from: string | Record<string, unknown>): { backgroundImage: unknown } {
  if (typeof from === "string" && /^\.\.?\//.test(from))
    return {
      backgroundImage: {
        type: "TemplateLiteral",
        expressions: [requireExpression(from)],
        quasis: [
          {
            type: "TemplateElement",
            value: {
              raw: "url(",
              cooked: "url(",
            },
            tail: false,
          },
          {
            type: "TemplateElement",
            value: {
              raw: ")",
              cooked: ")",
            },
            tail: true,
          },
        ],
      },
    };

  if (typeof from == "object" && !(from as { named?: unknown }).named)
    return {
      backgroundImage: from,
    };

  return {
    backgroundImage: Array.from(arguments),
  };
}

/** Style map returned by {@link icon}. */
interface IconOutput {
  WebkitMaskImage: string;
  bg?: string | number;
}

/**
 * Renders an SVG icon via `-webkit-mask-image`, optionally tinting it with a
 * background colour.
 *
 * If `mask` does not already end with `.svg` the extension is appended
 * automatically.
 *
 * @param mask  - Path to the SVG mask.  `.svg` is appended when missing.
 * @param color - Optional background/tint colour forwarded as `bg`.
 * @returns     A style map with `WebkitMaskImage` and (optionally) `bg`.
 *              Returns `undefined` when `mask` is falsy.
 *
 * @example
 * icon("icons/arrow");
 * // → { WebkitMaskImage: 'url("icons/arrow.svg")' }
 *
 * @example
 * icon("icons/check.svg", "currentColor");
 * // → { WebkitMaskImage: 'url("icons/check.svg")', bg: "currentColor" }
 */
export function icon(mask?: string, color?: string | number): IconOutput | undefined {
  if (!mask) return;

  if (!mask.includes(".svg")) mask = mask.concat(".svg");

  const output: IconOutput = {
    WebkitMaskImage: `url("${mask}")`,
  };

  if (color) output.bg = color;

  return output;
}
