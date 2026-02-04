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

export function icon(mask?: string, color?: string | number): IconOutput | undefined {
  if (!mask) return;

  if (!mask.includes(".svg")) mask = mask.concat(".svg");

  const output: IconOutput = {
    WebkitMaskImage: `url("${mask}")`,
  };

  if (color) output.bg = color;

  return output;
}
