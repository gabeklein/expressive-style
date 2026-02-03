function unitFor(name) {
  if (name.startsWith("rotate") || name.startsWith("skew")) return "deg";
  if (name.startsWith("translate") || name === "perspective") return "px";
  return null;
}

function withUnit(value, unit) {
  if (typeof value !== "number" || value === 0) return String(value);
  return unit ? value + unit : String(value);
}

export function transform(...args) {
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
