import { Context } from "../jsxPlugin";

export function toStylesheet(styles: Map<string, Context>) {
  return Array.from(styles.values())
    .sort(depth)
    .map(toBlock)
    .filter(Boolean)
    .join("\n");
}

function toBlock(define: Context) {
  if (define.props.size === 0) return "";

  const styles = [] as string[];

  for (let [name, value] of define.props) {
    const property = name
      .replace(/^\$/, "--")
      .replace(/([A-Z]+)/g, "-$1")
      .toLowerCase();

    if (Array.isArray(value)) value = value.map(toValue);

    styles.push(`  ${property}: ${value.join(" ")};`);
  }

  const select = toSelector(define);
  const style = styles.join("\n");

  return `${select} {\n${style}\n}`;
}

function toValue(value: unknown) {
  if (typeof value == "string") {
    if (value.startsWith("$"))
      return `var(--${value
        .slice(1)
        .replace(/([A-Z]+)/g, "-$1")
        .toLowerCase()})`;

    if (value.startsWith("0x")) return toColor(value);
  }

  if (Array.isArray(value)) {
    const [name, ...args] = value;
    return name + `(${args.join(", ")})`;
  }

  return value;
}

function toColor(raw: string) {
  raw = raw.substring(2);

  if (raw.length == 1) raw = "000" + raw;
  else if (raw.length == 2) raw = "000000" + raw;

  if (raw.length % 4 == 0) {
    let decimal = [] as any[];

    if (raw.length == 4)
      // Convert shorthand: 'ABC' => 'AABBCC' => 0xAABBCC
      decimal = Array.from(raw as string).map((x) => parseInt(x + x, 16));
    else
      for (let i = 0; i < 4; i++)
        decimal.push(parseInt(raw.slice(i * 2, i * 2 + 2), 16));

    //decimal for opacity, also prevents repeating digits (i.e. 1/3)
    decimal[3] = (decimal[3] / 255).toFixed(3);

    return `rgba(${decimal.join(", ")})`;
  }

  return "#" + raw;
}

export function toSelector(context: Context): string {
  let { parent, condition, uid } = context;

  if (typeof condition === "string")
    return toSelector(context.parent!) + condition;

  let selector = "";

  while (parent) {
    if (parent instanceof Context && parent.condition) {
      selector = toSelector(parent) + " ";
      break;
    }
    parent = parent.parent;
  }

  return (selector += "." + uid);
}

function depth(context: Context, context2?: Context): number {
  if (context2) {
    const d1 = depth(context);
    const d2 = depth(context2);
    return d1 === d2 ? 0 : d1 - d2;
  }

  let i = 0;

  do {
    if (context.path.isFunction()) break;
    else i += /^[A-Z]/.test(context.uid) ? 2 : 1;
  } while ((context = context.parent!));

  return i;
}
