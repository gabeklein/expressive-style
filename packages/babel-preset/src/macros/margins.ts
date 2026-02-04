import { appendUnit } from "./appendUnit";

export function margin(...args: (number | string)[]): { margin: string } {
  const a1 = args[0];
  let value: string;

  if ((args.length == 1 && a1 == "auto") || a1 == "none" || (typeof a1 === "string" && / /.test(a1)))
    value = String(a1);
  else
    value = args.map((x) => appendUnit(x)).join(" ");

  return { margin: value };
}

export function padding(...args: (number | string)[]): { padding: string } {
  const a1 = args[0];
  let value: string;

  if ((args.length == 1 && a1 == "auto") || a1 == "none" || (typeof a1 === "string" && / /.test(a1)))
    value = String(a1);
  else
    value = args.map((x) => appendUnit(x)).join(" ");

  return { padding: value };
}

export function marginTop(a: number | string, unit?: string): { marginTop: string } {
  return { marginTop: appendUnit(a, unit) };
}

export function marginLeft(a: number | string, unit?: string): { marginLeft: string } {
  return { marginLeft: appendUnit(a, unit) };
}

export function marginRight(a: number | string, unit?: string): { marginRight: string } {
  return { marginRight: appendUnit(a, unit) };
}

export function marginBottom(a: number | string, unit?: string): { marginBottom: string } {
  return { marginBottom: appendUnit(a, unit) };
}

export { marginTop as marginT };
export { marginLeft as marginL };
export { marginRight as marginR };
export { marginBottom as marginB };

export function paddingHorizontal(a: number | string, b?: number | string): { paddingLeft: number | string; paddingRight: number | string } {
  return {
    paddingLeft: a,
    paddingRight: b || a,
  };
}

export function paddingVertical(a: number | string, b?: number | string): { paddingTop: number | string; paddingBottom: number | string } {
  return {
    paddingTop: a,
    paddingBottom: b || a,
  };
}

export function marginHorizontal(a: number | string, b?: number | string): { marginLeft: number | string; marginRight: number | string } {
  return {
    marginLeft: a,
    marginRight: b || a,
  };
}

export function marginVertical(a: number | string, b?: number | string): { marginTop: number | string; marginBottom: number | string } {
  return {
    marginTop: a,
    marginBottom: b || a,
  };
}

export { paddingHorizontal as paddingH };
export { paddingVertical as paddingV };
export { marginHorizontal as marginH };
export { marginVertical as marginV };
