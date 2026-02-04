interface BackgroundColorOutput {
  backgroundColor: string;
}

interface BackgroundPassthroughOutput {
  background: unknown[];
}

export function background(
  a?: unknown[]
): BackgroundColorOutput | BackgroundPassthroughOutput {
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

export { background as bg };

export function rgba(
  r: number,
  g: number,
  b: number,
  a: number = 1
): { value: string } {
  for (const x of [r, g, b])
    if (typeof x != "number")
      throw new Error("malformed arguments in rgb statement");

  const rgb = [r, g, b].join(",");

  return {
    value: a == 1 ? `rgb(${rgb})` : `rgba(${rgb},${a})`,
  };
}

export function hsla(
  h: number,
  s: number,
  l: number,
  a: number = 1
): { value: string } {
  for (const x of [h, s, l])
    if (typeof x != "number")
      throw new Error("malformed arguments in hsl statement");

  const hsl = [h, s + "%", l + "%"].join(",");

  return {
    value: a == 1 ? `hsl(${hsl})` : `hsla(${hsl},${a})`,
  };
}
