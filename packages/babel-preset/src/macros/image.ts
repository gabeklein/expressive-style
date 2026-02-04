/**
 * Sets `background-image` to a `url()` wrapping the given path.
 *
 * @param a - The image URL or path string.
 *
 * @example
 * // image: "/assets/photo.png";
 * // → background-image: url("/assets/photo.png");
 */
export function image(a: string): { backgroundImage: string } {
  return {
    backgroundImage: `url("${a}")`,
  };
}

function requireExpression(value: string) {
  return {
    type: "CallExpression",
    callee: { type: "Identifier", name: "require" },
    arguments: [{ type: "StringLiteral", value }],
  };
}

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

interface IconOutput {
  WebkitMaskImage: string;
  bg?: string | number;
}

/**
 * Sets `-webkit-mask-image` for SVG-based icon masking, optionally
 * tinting with a background colour.  The `.svg` extension is appended
 * automatically when missing.
 *
 * @param mask  - Path to the SVG mask file.
 * @param color - Optional tint colour (applied as `bg`).
 *
 * @example
 * // icon: "icons/arrow";
 * // → -webkit-mask-image: url("icons/arrow.svg");
 *
 * @example
 * // icon: "icons/star.svg", 0x3366cc;
 * // → -webkit-mask-image: url("icons/star.svg"); background-color: #3366cc;
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
