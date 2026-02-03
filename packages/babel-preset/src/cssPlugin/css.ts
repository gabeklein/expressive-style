import { Context } from "../jsxPlugin";

export function toStylesheet(styles: Map<string, Context>) {
  return Array.from(styles.values())
    .sort(depth)
    .map(toBlock)
    .filter(Boolean)
    .join("\n");
}

function toBlock(define: Context) {
  if(define.props.size === 0) return "";

  const styles = [] as string[];

  for (let [name, value] of define.props) {
    const property = name
      .replace(/^\$/, "--")
      .replace(/([A-Z]+)/g, "-$1")
      .toLowerCase();

    if (Array.isArray(value))
      value = value.map((value) => {
        if (typeof value == "string" && /^\$/.test(value))
          return `var(--${value
            .slice(1)
            .replace(/([A-Z]+)/g, "-$1")
            .toLowerCase()})`;

        return value;
      });

    styles.push(`  ${property}: ${value.join(" ")};`);
  }

  const select = toSelector(define);
  const style = styles.join("\n");

  return `${select} {\n${style}\n}`;
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
