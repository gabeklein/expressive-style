export function background(...args: unknown[]) {
  if (Array.isArray(args[0])) {
    const [head, r, g, b, a = 1] = args[0];

    switch (head) {
      case "rgb":
      case "rgba": {
        const rgb = [r, g, b].join(",");
        return {
          backgroundColor: a == 1 ? `rgb(${rgb})` : `rgba(${rgb},${a})`,
        };
      }

      case "hsl":
      case "hsla": {
        const hsl = [r, g + "%", b + "%"].join(",");
        return {
          backgroundColor: a == 1 ? `hsl(${hsl})` : `hsla(${hsl},${a})`,
        };
      }
    }
  }

  return {
    background: args,
  };
}

export { background as bg };
