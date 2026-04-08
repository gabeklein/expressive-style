import { Context } from "../jsxPlugin";

export function toStylesheet(styles: Map<string, Context>) {
  const sorted = Array.from(styles.values()).sort(depth);
  const plain = [] as string[];
  const mediaGroups = new Map<string, string[]>();

  for (const define of sorted) {
    const block = toBlock(define);
    if (!block) continue;

    const media = getMedia(define);

    if (media) {
      let group = mediaGroups.get(media);
      if (!group) mediaGroups.set(media, group = []);
      group.push(block);
    }
    else plain.push(block);
  }

  for (const [query, blocks] of mediaGroups) {
    const indented = blocks.map(b => b.replace(/^/gm, "  ")).join("\n");
    plain.push(`@media ${query} {\n${indented}\n}`);
  }

  return plain.join("\n");
}

function toDash(name: string) {
  return name.replace(/([A-Z]+)/g, "-$1").toLowerCase();
}

function toBlock(define: Context) {
  if (define.props.size === 0) return "";

  const styles = [] as string[];

  for (let [name, value] of define.props) {
    const property = toDash(name.replace(/^\$/, "--"));

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
      return `var(--${toDash(value.slice(1))})`;

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

  if (context.media && parent)
    return toSelector(parent);

  if (typeof condition === "string") {
    const parent = toSelector(context.parent!);

    if (condition.includes("&")) {
      return condition.replace(/&/g, parent);
    }

    return parent + condition;
  }

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

function getMedia(context: Context): string | undefined {
  let current: Context | undefined = context;

  while (current) {
    if (current.media) return current.media;
    current = current.parent;
  }
}

function depth(context: Context, context2?: Context): number {
  const pos = context.position;

  if (typeof context.condition === "string") context = context.parent!;

  let i = 0;

  do {
    if (context.path.isFunction()) break;
    else if (/^[A-Z]/.test(context.uid) && !("this" in context.define)) i += 2;
    else i++;
  } while ((context = context.parent!));

  if (context2) {
    return i - depth(context2) || pos - context2.position;
  }

  return i;
}
