import { Context } from "../jsxPlugin";

export function toStylesheet(contexts: Iterable<Context>) {
  return Array.from(contexts)
    .filter((d) => {
      return d.props.size > 0;
    })
    .sort((d1, d2) => {
      const diff = depth(d1) - depth(d2);
      return diff === 0 ? 1 : diff;
    })
    .map(toBlock)
    .join("\n");
}

function toBlock(define: Context) {
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

function depth(context: Context) {
  let depth = 0;

  do {
    if (context.path.isFunction()) break;
    else depth += /^[A-Z]/.test(context.uid) ? 2 : 1;
  } while ((context = context.parent!));

  return depth;
}
