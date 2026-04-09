import { appendUnit } from "./appendUnit";

type Val = number | string;

function shorthand(prop: string) {
  return (...args: Val[]) => {
    const a1 = args[0];
    let value: string;

    if (
      (args.length == 1 && a1 == "auto") ||
      a1 == "none" ||
      (typeof a1 === "string" && / /.test(a1))
    )
      value = String(a1);
    else value = args.map((x) => appendUnit(x)).join(" ");

    return { [prop]: value };
  };
}

function side(prop: string) {
  return (a: Val, unit?: string) => ({ [prop]: appendUnit(a, unit) });
}

function axis(a: string, b: string) {
  return (v1: Val, v2?: Val) => ({ [a]: v1, [b]: v2 || v1 });
}

export const margin = shorthand("margin");
export const padding = shorthand("padding");

export const marginTop = side("marginTop");
export const marginLeft = side("marginLeft");
export const marginRight = side("marginRight");
export const marginBottom = side("marginBottom");

export { marginTop as marginT };
export { marginLeft as marginL };
export { marginRight as marginR };
export { marginBottom as marginB };

export const paddingTop = side("paddingTop");
export const paddingLeft = side("paddingLeft");
export const paddingRight = side("paddingRight");
export const paddingBottom = side("paddingBottom");

export { paddingTop as paddingT };
export { paddingLeft as paddingL };
export { paddingRight as paddingR };
export { paddingBottom as paddingB };

export const paddingHorizontal = axis("paddingLeft", "paddingRight");
export const paddingVertical = axis("paddingTop", "paddingBottom");
export const marginHorizontal = axis("marginLeft", "marginRight");
export const marginVertical = axis("marginTop", "marginBottom");

export { paddingHorizontal as paddingH };
export { paddingVertical as paddingV };
export { marginHorizontal as marginH };
export { marginVertical as marginV };
